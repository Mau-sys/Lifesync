<?php

session_start();
header('Content-Type: application/json; charset=UTF-8');

try {
    require_once '../config/conexion.php';

    if (isset($_SESSION['usuario_id'], $_SESSION['token_sesion'])) {
        $database = new Database();
        $db = $database->getConnection();
        $consulta = $db->prepare(
            "UPDATE sesiones_usuario
             SET activa = FALSE, ultimo_acceso = CURRENT_TIMESTAMP
             WHERE id_usuario = :id_usuario
             AND token_sesion = :token_sesion"
        );
        $consulta->execute([
            ':id_usuario' => (int) $_SESSION['usuario_id'],
            ':token_sesion' => $_SESSION['token_sesion']
        ]);
    }
} catch (Throwable $error) {
    error_log('LifeSync cerrar-sesion.php: ' . $error->getMessage());
}

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $parametros = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $parametros['path'], $parametros['domain'], $parametros['secure'], $parametros['httponly']);
}
session_destroy();

echo json_encode([
    'exito' => true,
    'mensaje' => 'Sesión cerrada correctamente.'
], JSON_UNESCAPED_UNICODE);
