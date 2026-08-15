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


$usuarioId =
    (int) $_SESSION["usuario_id"];


try {

    $database =
        new Database();

    $db =
        $database->getConnection();


    if (!$db) {

        throw new Exception(
            "No se pudo conectar con la base de datos."
        );
    }


    if (
        $_SERVER["REQUEST_METHOD"] !==
        "POST"
    ) {

        http_response_code(405);

        echo json_encode([
            "exito" => false,
            "mensaje" => "Método no permitido."
        ]);

        exit;
    }

    $consultaConfiguracion =
        $db->prepare(
            "SELECT
                notificaciones_activas
             FROM configuracion_usuario
             WHERE id_usuario = :id_usuario
             LIMIT 1"
        );


    $consultaConfiguracion->execute([
        ":id_usuario" =>
            $usuarioId
    ]);


    $configuracion =
        $consultaConfiguracion->fetch(
            PDO::FETCH_ASSOC
        );


    if (
        $configuracion &&
        !(bool) $configuracion[
            "notificaciones_activas"
        ]
    ) {

        echo json_encode([
            "exito" => true,
            "creada" => false,
            "mensaje" =>
                "Las notificaciones están desactivadas."
        ]);

        exit;
    }


    $datos =
        json_decode(
            file_get_contents(
                "php://input"
            ),
            true
        );


    if (!is_array($datos)) {

        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "mensaje" =>
                "Los datos enviados no son válidos."
        ]);

        exit;
    }


    $titulo =
        trim(
            $datos["titulo"] ?? ""
        );


    $mensaje =
        trim(
            $datos["mensaje"] ?? ""
        );


    $tipo =
        trim(
            $datos["tipo"] ??
            "general"
        );


    if ($titulo === "") {

        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "mensaje" =>
                "El título es obligatorio."
        ]);

        exit;
    }


    if ($mensaje === "") {

        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "mensaje" =>
                "El mensaje es obligatorio."
        ]);

        exit;
    }


    $tiposValidos = [
        "recordatorio",
        "racha",
        "progreso",
        "logro",
        "general"
    ];


    if (
        !in_array(
            $tipo,
            $tiposValidos,
            true
        )
    ) {

        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "mensaje" =>
                "El tipo de notificación no es válido."
        ]);

        exit;
    }


    $consulta =
        $db->prepare(
            "INSERT INTO notificaciones
            (
                id_usuario,
                titulo,
                mensaje,
                leida
            )
            VALUES
            (
                :id_usuario,
                :titulo,
                :mensaje,
                FALSE
            )"
        );


    $consulta->execute([
        ":id_usuario" =>
            $usuarioId,

        ":titulo" =>
            $titulo,

        ":mensaje" =>
            $mensaje
    ]);


    echo json_encode([
        "exito" => true,
        "creada" => true,
        "mensaje" =>
            "Notificación creada correctamente.",
        "id_notificacion" =>
            $db->lastInsertId(),
        "tipo" =>
            $tipo
    ]);


} catch (Throwable $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" =>
            "No se pudo crear la notificación.",
        "detalle" =>
            $error->getMessage()
    ]);
}
?>