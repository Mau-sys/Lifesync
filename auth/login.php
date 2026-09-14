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
if (!is_array($datos)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'Datos inválidos.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$correo = trim($datos['correo'] ?? '');
$password = $datos['password'] ?? '';

if ($correo === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'Completa todos los campos.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'Ingresa un correo electrónico válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $consulta = $db->prepare(
        "SELECT id_usuario, nombre_usuario, correo, password_hash, estado
         FROM usuario
         WHERE correo = :correo
         LIMIT 1"
    );
    $consulta->execute([':correo' => $correo]);
    $usuario = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
        http_response_code(401);
        echo json_encode(['exito' => false, 'mensaje' => 'El correo o la contraseña son incorrectos.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($usuario['estado'] !== 'activo') {
        http_response_code(403);
        echo json_encode(['exito' => false, 'mensaje' => 'Esta cuenta no está disponible.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    session_regenerate_id(true);
    $tokenSesion = bin2hex(random_bytes(32));
    $_SESSION['usuario_id'] = (int) $usuario['id_usuario'];
    $_SESSION['usuario_nombre'] = $usuario['nombre_usuario'];
    $_SESSION['usuario_correo'] = $usuario['correo'];
    $_SESSION['token_sesion'] = $tokenSesion;

    $consulta = $db->prepare(
        "INSERT INTO sesiones_usuario
        (id_usuario, token_sesion, dispositivo, ip)
        VALUES (:id_usuario, :token_sesion, :dispositivo, :ip)"
    );
    $consulta->execute([
        ':id_usuario' => (int) $usuario['id_usuario'],
        ':token_sesion' => $tokenSesion,
        ':dispositivo' => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? 'Navegador', 0, 255),
        ':ip' => $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'exito' => true,
        'mensaje' => 'Inicio de sesión correcto.',
        'usuario' => [
            'id' => (int) $usuario['id_usuario'],
            'nombre' => $usuario['nombre_usuario'],
            'correo' => $usuario['correo']
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {
    error_log('LifeSync login.php: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['exito' => false, 'mensaje' => 'Ocurrió un error al procesar el inicio de sesión.'], JSON_UNESCAPED_UNICODE);
}
