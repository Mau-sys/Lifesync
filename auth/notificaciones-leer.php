<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";

if (!isset($_SESSION["usuario_id"])) {

    http_response_code(401);

    echo json_encode([
        "exito" => false,
        "mensaje" => "La sesión ha expirado."
    ]);

    exit;
}

$usuarioId = (int) $_SESSION["usuario_id"];

try {

    $database = new Database();

    $db = $database->getConnection();

    if ($db === null) {

        http_response_code(500);

        echo json_encode([
            "exito" => false,
            "mensaje" =>
                "No se pudo conectar con la base de datos."
        ]);

        exit;
    }

    $consulta = $db->prepare(
        "UPDATE notificaciones
         SET leida = TRUE
         WHERE id_usuario = :id_usuario
         AND leida = FALSE"
    );

    $consulta->execute([
        ":id_usuario" => $usuarioId
    ]);

    echo json_encode([
        "exito" => true,
        "mensaje" =>
            "Notificaciones marcadas como leídas."
    ]);

} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" =>
            "No se pudieron actualizar las notificaciones."
    ]);
}
?>