<?php

session_start();
header("Content-Type: application/json; charset=UTF-8");

$rutaConexion = __DIR__ . '/../config/conexion.php';
if (!file_exists($rutaConexion)) {
    $rutaConexion = '../config/conexion.php';
}
require_once $rutaConexion;

if (!isset($_SESSION["usuario_id"])) {
    http_response_code(401);
    echo json_encode([
        "exito" => false,
        "mensaje" => "La sesión ha expirado."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "exito" => false,
        "mensaje" => "Método no permitido."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$usuarioId = (int) $_SESSION["usuario_id"];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $input = file_get_contents("php://input");
    $datos = json_decode($input, true);
    
    $idNotificacion = isset($datos["id_notificacion"]) ? (int) $datos["id_notificacion"] : 0;

    if ($idNotificacion > 0) {
        $consulta = $db->prepare(
            "UPDATE notificaciones
             SET leida = 1
             WHERE id_notificacion = :id_notificacion
               AND id_usuario = :id_usuario"
        );
        $consulta->execute([
            ":id_notificacion" => $idNotificacion,
            ":id_usuario" => $usuarioId
        ]);
    } else {
     
        $consulta = $db->prepare(
            "UPDATE notificaciones
             SET leida = 1
             WHERE id_usuario = :id_usuario
               AND leida = 0"
        );
        $consulta->execute([":id_usuario" => $usuarioId]);
    }

    echo json_encode([
        "exito" => true,
        "filas_afectadas" => $consulta->rowCount(),
        "mensaje" => "Notificaciones marcadas como leídas."
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {
    error_log("Error en notificaciones-leer.php: " . $error->getMessage());
    http_response_code(500);
    echo json_encode([
        "exito" => false,
        "mensaje" => "No se pudieron actualizar las notificaciones."
    ], JSON_UNESCAPED_UNICODE);
}