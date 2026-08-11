<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/config/conexion.php";


function responderJSON(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);

    echo json_encode(
        $datos,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}


if (!isset($_SESSION["usuario_id"])) {

    responderJSON(
        [
            "exito" => false,
            "mensaje" => "La sesión ha expirado. Inicia sesión nuevamente."
        ],
        401
    );
}


$contenido =
    file_get_contents("php://input");


$datos =
    json_decode(
        $contenido,
        true
    );


if (!is_array($datos)) {

    responderJSON(
        [
            "exito" => false,
            "mensaje" => "Los datos enviados no son válidos."
        ],
        400
    );
}


$nombreHabito =
    trim(
        $datos["nombre_habito"] ?? ""
    );


$descripcion =
    trim(
        $datos["descripcion"] ?? ""
    );


$frecuencia =
    trim(
        $datos["frecuencia"] ?? ""
    );


$fechaInicio =
    trim(
        $datos["fecha_inicio"] ?? ""
    );


$fechaFin =
    trim(
        $datos["fecha_fin"] ?? ""
    );


if (
    $nombreHabito === "" ||
    $descripcion === "" ||
    $frecuencia === "" ||
    $fechaInicio === ""
) {

    responderJSON(
        [
            "exito" => false,
            "mensaje" => "Completa todos los campos obligatorios."
        ],
        400
    );
}


$frecuenciasPermitidas = [
    "diaria",
    "semanal",
    "mensual"
];


if (
    !in_array(
        $frecuencia,
        $frecuenciasPermitidas,
        true
    )
) {

    responderJSON(
        [
            "exito" => false,
            "mensaje" => "La frecuencia seleccionada no es válida."
        ],
        400
    );
}


$inicio =
    DateTime::createFromFormat(
        "Y-m-d",
        $fechaInicio
    );


if (
    !$inicio ||
    $inicio->format("Y-m-d") !== $fechaInicio
) {

    responderJSON(
        [
            "exito" => false,
            "mensaje" => "La fecha de inicio no es válida."
        ],
        400
    );
}


if ($fechaFin !== "") {

    $fin =
        DateTime::createFromFormat(
            "Y-m-d",
            $fechaFin
        );


    if (
        !$fin ||
        $fin->format("Y-m-d") !== $fechaFin
    ) {

        responderJSON(
            [
                "exito" => false,
                "mensaje" => "La fecha de finalización no es válida."
            ],
            400
        );
    }


    if ($fin < $inicio) {

        responderJSON(
            [
                "exito" => false,
                "mensaje" =>
                    "La fecha de finalización no puede ser anterior a la fecha de inicio."
            ],
            400
        );
    }

} else {

    $fechaFin = null;
}


$usuarioId =
    (int) $_SESSION["usuario_id"];


try {

    $database =
        new Database();


    $db =
        $database->getConnection();


    if (!$db instanceof PDO) {

        throw new Exception(
            "No se pudo conectar con la base de datos."
        );
    }


    $db->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );


    /*
     * BUSCAR LA CATEGORÍA DE HÁBITO PERSONALIZADO
     */

    $consultaCategoria =
        $db->prepare(
            "SELECT
                id_categoria

             FROM categorias

             WHERE nombre_categoria =
                   :nombre

             LIMIT 1"
        );


    $consultaCategoria->execute(
        [
            ":nombre" =>
                "Hábito Personalizado"
        ]
    );


    $categoria =
        $consultaCategoria->fetch(
            PDO::FETCH_ASSOC
        );


    $idCategoria =
        $categoria
            ? (int) $categoria["id_categoria"]
            : null;


    if ($idCategoria === null) {

        throw new Exception(
            "No existe la categoría de hábitos personalizados."
        );
    }


    /*
     * CREAR HÁBITO
     */

    $db->beginTransaction();


    $consulta =
        $db->prepare(
            "INSERT INTO habitos
            (
                id_usuario,
                id_categoria,
                nombre_habito,
                descripcion,
                tipo_medicion,
                objetivo,
                unidad_medida,
                frecuencia,
                dias_semana,
                fecha_inicio,
                fecha_fin,
                activo,
                icono
            )

            VALUES
            (
                :id_usuario,
                :id_categoria,
                :nombre_habito,
                :descripcion,
                'completar',
                1,
                NULL,
                :frecuencia,
                NULL,
                :fecha_inicio,
                :fecha_fin,
                1,
                'img/H-Perzona.png'
            )"
        );


    $consulta->execute(
        [
            ":id_usuario" =>
                $usuarioId,

            ":id_categoria" =>
                $idCategoria,

            ":nombre_habito" =>
                $nombreHabito,

            ":descripcion" =>
                $descripcion,

            ":frecuencia" =>
                $frecuencia,

            ":fecha_inicio" =>
                $fechaInicio,

            ":fecha_fin" =>
                $fechaFin
        ]
    );


    $idHabito =
        (int) $db->lastInsertId();


    /*
     * CREAR REGISTRO DE RACHA
     */

    $consultaRacha =
        $db->prepare(
            "INSERT INTO rachas
            (
                id_habito,
                racha_actual,
                mejor_racha,
                total_completados,
                ultima_fecha
            )

            VALUES
            (
                :id_habito,
                0,
                0,
                0,
                NULL
            )"
        );


    $consultaRacha->execute(
        [
            ":id_habito" =>
                $idHabito
        ]
    );


    $db->commit();


    responderJSON(
        [
            "exito" => true,
            "mensaje" => "Hábito creado correctamente.",
            "id_habito" => $idHabito
        ]
    );


} catch (Throwable $error) {

    if (
        isset($db) &&
        $db instanceof PDO &&
        $db->inTransaction()
    ) {
        $db->rollBack();
    }


    error_log(
        "LifeSync - Error en crear-habito.php: "
        . $error->getMessage()
        . " | "
        . $error->getFile()
        . ":"
        . $error->getLine()
    );


    responderJSON(
        [
            "exito" => false,
            "mensaje" => "Ocurrió un error al crear el hábito."
        ],
        500
    );
}