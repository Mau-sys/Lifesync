<?php

session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once '../config/conexion.php';

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

$nombre = trim($datos['nombre'] ?? '');
$correo = trim($datos['correo'] ?? '');
$password = $datos['password'] ?? '';

if ($nombre === '' || $correo === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'Todos los campos son obligatorios.'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (mb_strlen($nombre) > 50) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'El nombre no puede superar los 50 caracteres.'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'Ingresa un correo electrónico válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (mb_strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'La contraseña debe tener al menos 8 caracteres.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $consulta = $db->prepare('SELECT id_usuario FROM usuario WHERE correo = :correo LIMIT 1');
    $consulta->execute([':correo' => $correo]);
    if ($consulta->fetch()) {
        http_response_code(409);
        echo json_encode(['exito' => false, 'mensaje' => 'El correo ya está registrado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $db->beginTransaction();

    $consulta = $db->prepare(
        "INSERT INTO usuario (nombre_usuario, correo, password_hash)
         VALUES (:nombre, :correo, :password_hash)"
    );
    $consulta->execute([
        ':nombre' => $nombre,
        ':correo' => $correo,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT)
    ]);
    $usuarioId = (int) $db->lastInsertId();

    $consulta = $db->prepare(
        "INSERT INTO preferencias_usuario
        (id_usuario, tema, idioma, notificaciones_activas, sonidos_activados, sincronizacion_automatica)
        VALUES (:id_usuario, 'oscuro', 'es', TRUE, TRUE, TRUE)"
    );
    $consulta->execute([':id_usuario' => $usuarioId]);

    $consulta = $db->prepare(
        "INSERT INTO configuracion_notificaciones
        (id_usuario, correo_recordatorios, correo_logros)
        VALUES (:id_usuario, TRUE, TRUE)"
    );
    $consulta->execute([':id_usuario' => $usuarioId]);

    $db->commit();

    session_regenerate_id(true);
    $tokenSesion = bin2hex(random_bytes(32));
    $_SESSION['usuario_id'] = $usuarioId;
    $_SESSION['usuario_nombre'] = $nombre;
    $_SESSION['usuario_correo'] = $correo;
    $_SESSION['token_sesion'] = $tokenSesion;

    $consulta = $db->prepare(
        "INSERT INTO sesiones_usuario
        (id_usuario, token_sesion, dispositivo, ip)
        VALUES (:id_usuario, :token_sesion, :dispositivo, :ip)"
    );
    $consulta->execute([
        ':id_usuario' => $usuarioId,
        ':token_sesion' => $tokenSesion,
        ':dispositivo' => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? 'Navegador', 0, 255),
        ':ip' => $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode(['exito' => true, 'mensaje' => 'Usuario registrado correctamente.'], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log('LifeSync registro.php: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['exito' => false, 'mensaje' => 'Ocurrió un error al registrar el usuario.'], JSON_UNESCAPED_UNICODE);
}
