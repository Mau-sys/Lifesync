<?php

declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);
$token = trim((string) ($datos['token'] ?? ''));
$password = (string) ($datos['password'] ?? '');
$confirmar = (string) ($datos['confirmar_password'] ?? '');

if (!preg_match('/^[a-f0-9]{64}$/i', $token)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'El enlace de recuperación no es válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'La contraseña debe tener al menos 8 caracteres.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($password !== $confirmar) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'Las contraseñas no coinciden.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $consulta = $db->prepare(
        'SELECT id_token, id_usuario
         FROM tokens_recuperacion
         WHERE token_hash = :token_hash
           AND usado_en IS NULL
           AND expira_en > NOW()
         LIMIT 1'
    );
    $consulta->execute([':token_hash' => hash('sha256', $token)]);
    $tokenData = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$tokenData) {
        http_response_code(400);
        echo json_encode(['exito' => false, 'mensaje' => 'El enlace no es válido o ya expiró.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $db->beginTransaction();

    $actualizar = $db->prepare(
        'UPDATE usuario
         SET password_hash = :password_hash
         WHERE id_usuario = :id_usuario'
    );
    $actualizar->execute([
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ':id_usuario' => (int) $tokenData['id_usuario']
    ]);

    $marcar = $db->prepare(
        'UPDATE tokens_recuperacion
         SET usado_en = NOW()
         WHERE id_token = :id_token'
    );
    $marcar->execute([':id_token' => (int) $tokenData['id_token']]);

    $cerrar = $db->prepare(
        'UPDATE sesiones_usuario
         SET activa = FALSE
         WHERE id_usuario = :id_usuario'
    );
    $cerrar->execute([':id_usuario' => (int) $tokenData['id_usuario']]);

    $db->commit();

    session_unset();
    session_destroy();

    echo json_encode(['exito' => true, 'mensaje' => 'Contraseña actualizada correctamente.'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log('LifeSync restablecer-contrasena.php: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo actualizar la contraseña.'], JSON_UNESCAPED_UNICODE);
}
