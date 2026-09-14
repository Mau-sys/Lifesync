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
$correo = trim((string) ($datos['correo'] ?? ''));

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'Ingresa un correo electrónico válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$mensaje = 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.';

try {
    $database = new Database();
    $db = $database->getConnection();

    $consulta = $db->prepare(
        'SELECT id_usuario, nombre_usuario, correo
         FROM usuario
         WHERE correo = :correo AND estado = \'activo\'
         LIMIT 1'
    );
    $consulta->execute([':correo' => $correo]);
    $usuario = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        echo json_encode(['exito' => true, 'mensaje' => $mensaje], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);

    $db->prepare(
        'UPDATE tokens_recuperacion
         SET usado_en = NOW()
         WHERE id_usuario = :id_usuario AND usado_en IS NULL'
    )->execute([':id_usuario' => (int) $usuario['id_usuario']]);

    $insertar = $db->prepare(
        'INSERT INTO tokens_recuperacion
         (id_usuario, token_hash, expira_en)
         VALUES (:id_usuario, :token_hash, DATE_ADD(NOW(), INTERVAL 1 HOUR))'
    );
    $insertar->execute([
        ':id_usuario' => (int) $usuario['id_usuario'],
        ':token_hash' => $tokenHash
    ]);

    $script = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/LifeSync/auth'));
    $base = rtrim(dirname($script), '/');
    $esHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $protocolo = $esHttps ? 'https' : 'http';
    $enlace = $protocolo . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . $base . '/public/Restablecer-contrasena.html?token=' . urlencode($token);

    $asunto = 'LifeSync - Recuperación de contraseña';
    $cuerpo = "Hola {$usuario['nombre_usuario']},\n\n"
        . "Recibimos una solicitud para restablecer la contraseña de tu cuenta de LifeSync.\n\n"
        . "Abre este enlace dentro de la próxima hora:\n{$enlace}\n\n"
        . "Si no solicitaste este cambio, puedes ignorar este mensaje.\n\n"
        . "LifeSync";
    $cabeceras = "Content-Type: text/plain; charset=UTF-8\r\n"
        . "From: LifeSync <no-reply@lifesync.local>\r\n";

    @mail($usuario['correo'], $asunto, $cuerpo, $cabeceras);

    echo json_encode(['exito' => true, 'mensaje' => $mensaje], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    error_log('LifeSync recuperar-contrasena.php: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo procesar la solicitud.'], JSON_UNESCAPED_UNICODE);
}
