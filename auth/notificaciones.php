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
            "mensaje" => "No se pudo conectar con la base de datos."
        ]);

        exit;
    }

    $consulta = $db->prepare(
        "SELECT
            id_notificacion,
            titulo,
            mensaje,
            leida,
            fecha_notificacion
         FROM notificaciones
         WHERE id_usuario = :id_usuario
         ORDER BY fecha_notificacion DESC
         LIMIT 50"
    );

    $consulta->execute([
        ":id_usuario" => $usuarioId
    ]);

    $notificacionesBD = $consulta->fetchAll(PDO::FETCH_ASSOC);

    $notificaciones = [];

    foreach ($notificacionesBD as $notificacion) {

        $notificaciones[] = [
            "id_notificacion" =>
                (int) $notificacion["id_notificacion"],

            "titulo" =>
                $notificacion["titulo"],

            "mensaje" =>
                $notificacion["mensaje"],

            "leida" =>
                (bool) $notificacion["leida"],

            "fecha_notificacion" =>
                $notificacion["fecha_notificacion"]
        ];
    }

    $consultaNoLeidas = $db->prepare(
        "SELECT COUNT(*)
         FROM notificaciones
         WHERE id_usuario = :id_usuario
         AND leida = FALSE"
    );

    $consultaNoLeidas->execute([
        ":id_usuario" => $usuarioId
    ]);

    $noLeidas =
        (int) $consultaNoLeidas->fetchColumn();

    echo json_encode([
        "exito" => true,
        "notificaciones" => $notificaciones,
        "no_leidas" => $noLeidas
    ]);

} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" =>
            "No se pudieron cargar las notificaciones."
    ]);
}
?>