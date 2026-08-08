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


    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $accion = $_GET["accion"] ?? "";


        if ($accion === "listar") {

            $consulta = $db->prepare(
                "SELECT
                    r.id_recordatorio,
                    r.id_categoria,
                    r.titulo,
                    r.hora,
                    r.repeticion,
                    r.fecha_recordatorio,
                    r.mensaje,
                    r.activo,
                    c.nombre_categoria
                FROM recordatorios r
                LEFT JOIN categorias c
                    ON c.id_categoria = r.id_categoria
                WHERE r.id_usuario = :id_usuario
                    AND r.activo = 1
                ORDER BY
                    r.hora ASC,
                    r.fecha_creacion DESC"
            );


            $consulta->execute([
                ":id_usuario" => $usuarioId
            ]);


            $recordatorios = $consulta->fetchAll(
                PDO::FETCH_ASSOC
            );


            foreach ($recordatorios as &$recordatorio) {

                $recordatorio["categoria"] =
                    $recordatorio["nombre_categoria"];

                unset(
                    $recordatorio["nombre_categoria"]
                );

            }


            echo json_encode([
                "exito" => true,
                "recordatorios" => $recordatorios
            ]);

            exit;
        }


        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "mensaje" => "Acción no válida."
        ]);

        exit;
    }


    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $contenido =
            file_get_contents("php://input");

        $datos =
            json_decode($contenido, true);


        if (!is_array($datos)) {

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "Los datos enviados no son válidos."
            ]);

            exit;
        }


        $accion =
            $datos["accion"] ?? "";


        if ($accion === "crear") {

            $titulo =
                trim($datos["titulo"] ?? "");


            $idCategoria =
                !empty($datos["id_categoria"])
                    ? (int) $datos["id_categoria"]
                    : null;


            $hora =
                $datos["hora"] ?? "";


            $repeticion =
                $datos["repeticion"] ?? "diario";


            $fechaRecordatorio =
                !empty($datos["fecha_recordatorio"])
                    ? $datos["fecha_recordatorio"]
                    : null;


            $mensaje =
                trim($datos["mensaje"] ?? "");


            if ($titulo === "") {

                http_response_code(400);

                echo json_encode([
                    "exito" => false,
                    "mensaje" =>
                        "El nombre del recordatorio es obligatorio."
                ]);

                exit;
            }


            if ($hora === "") {

                http_response_code(400);

                echo json_encode([
                    "exito" => false,
                    "mensaje" =>
                        "La hora es obligatoria."
                ]);

                exit;
            }


            $repeticionesValidas = [

                "diario",

                "lunes_viernes",

                "una_vez",

                "personalizado"

            ];


            if (
                !in_array(
                    $repeticion,
                    $repeticionesValidas,
                    true
                )
            ) {

                http_response_code(400);

                echo json_encode([
                    "exito" => false,
                    "mensaje" =>
                        "La repetición seleccionada no es válida."
                ]);

                exit;
            }


            if (
                $repeticion === "una_vez" &&
                $fechaRecordatorio === null
            ) {

                http_response_code(400);

                echo json_encode([
                    "exito" => false,
                    "mensaje" =>
                        "Debes seleccionar una fecha."
                ]);

                exit;
            }


            $consulta = $db->prepare(
                "INSERT INTO recordatorios (
                    id_usuario,
                    id_categoria,
                    titulo,
                    hora,
                    repeticion,
                    fecha_recordatorio,
                    mensaje,
                    activo
                ) VALUES (
                    :id_usuario,
                    :id_categoria,
                    :titulo,
                    :hora,
                    :repeticion,
                    :fecha_recordatorio,
                    :mensaje,
                    1
                )"
            );


            $consulta->execute([

                ":id_usuario" =>
                    $usuarioId,

                ":id_categoria" =>
                    $idCategoria,

                ":titulo" =>
                    $titulo,

                ":hora" =>
                    $hora,

                ":repeticion" =>
                    $repeticion,

                ":fecha_recordatorio" =>
                    $fechaRecordatorio,

                ":mensaje" =>
                    $mensaje !== ""
                        ? $mensaje
                        : null

            ]);


            echo json_encode([
                "exito" => true,
                "mensaje" =>
                    "Recordatorio guardado correctamente.",
                "id_recordatorio" =>
                    $db->lastInsertId()
            ]);

            exit;
        }


        if ($accion === "eliminar") {

            $idRecordatorio =
                (int) (
                    $datos["id_recordatorio"] ?? 0
                );


            if ($idRecordatorio <= 0) {

                http_response_code(400);

                echo json_encode([
                    "exito" => false,
                    "mensaje" =>
                        "Recordatorio no válido."
                ]);

                exit;
            }


            $consulta = $db->prepare(
                "UPDATE recordatorios
                 SET activo = 0
                 WHERE id_recordatorio = :id_recordatorio
                   AND id_usuario = :id_usuario"
            );


            $consulta->execute([

                ":id_recordatorio" =>
                    $idRecordatorio,

                ":id_usuario" =>
                    $usuarioId

            ]);


            echo json_encode([
                "exito" => true,
                "mensaje" =>
                    "Recordatorio eliminado correctamente."
            ]);

            exit;
        }


        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "mensaje" => "Acción no válida."
        ]);

        exit;
    }


    http_response_code(405);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Método no permitido."
    ]);


} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" =>
            "Ocurrió un error al procesar el recordatorio."
    ]);

}

?>