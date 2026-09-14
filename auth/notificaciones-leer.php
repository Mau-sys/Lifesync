<?php

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

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
    $datos = json_decode(file_get_contents("php://input"), true);
    $idNotificacion = (int) ($datos["id_notificacion"] ?? 0);

    if ($idNotificacion > 0) {
        $consulta = $db->prepare(
            "UPDATE notificaciones
             SET leida = TRUE
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
             SET leida = TRUE
             WHERE id_usuario = :id_usuario
             AND leida = FALSE"
        );
        $consulta->execute([":id_usuario" => $usuarioId]);
    }

    echo json_encode([
        "exito" => true,
        "mensaje" => "Notificaciones marcadas como leídas."
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        "exito" => false,
        "mensaje" => "No se pudieron actualizar las notificaciones."
    ], JSON_UNESCAPED_UNICODE);
}
