<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";

if (!isset($_SESSION["usuario_id"])) {

    http_response_code(401);

    echo json_encode([
        "exito" => false,
        "mensaje" => "La sesión ha expirado. Inicia sesión nuevamente."
    ]);

    exit;
}

$datos = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($datos)) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Datos inválidos."
    ]);

    exit;
}

$nombre = trim($datos["nombre"] ?? "");

$descripcion = trim($datos["descripcion"] ?? "");

$frecuencia = trim($datos["frecuencia"] ?? "");

$fechaInicio = trim($datos["fechaInicio"] ?? "");

$fechaFin = trim($datos["fechaFin"] ?? "");

if (
    $nombre === "" ||
    $descripcion === "" ||
    $frecuencia === "" ||
    $fechaInicio === ""
) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Completa todos los campos obligatorios."
    ]);

    exit;
}

if (strlen($nombre) < 2 || strlen($nombre) > 150) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "El nombre del hábito debe tener entre 2 y 150 caracteres."
    ]);

    exit;
}

if (strlen($descripcion) < 3 || strlen($descripcion) > 500) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "La descripción del hábito debe tener entre 3 y 500 caracteres."
    ]);

    exit;
}

$frecuenciasPermitidas = [
    "diaria",
    "semanal",
    "mensual"
];

if (!in_array($frecuencia, $frecuenciasPermitidas, true)) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "La frecuencia seleccionada no es válida."
    ]);

    exit;
}

$inicio = DateTime::createFromFormat(
    "Y-m-d",
    $fechaInicio
);

if (
    !$inicio ||
    $inicio->format("Y-m-d") !== $fechaInicio
) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "La fecha de inicio no es válida."
    ]);

    exit;
}

if ($fechaFin !== "") {

    $fin = DateTime::createFromFormat(
        "Y-m-d",
        $fechaFin
    );

    if (
        !$fin ||
        $fin->format("Y-m-d") !== $fechaFin
    ) {

        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "mensaje" => "La fecha de finalización no es válida."
        ]);

        exit;
    }

    if ($fin < $inicio) {

        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "mensaje" => "La fecha de finalización no puede ser anterior a la fecha de inicio."
        ]);

        exit;
    }

} else {

    $fechaFin = null;
}

$usuarioId = (int) $_SESSION["usuario_id"];

try {

    $database = new Database();

    $db = $database->getConnection();

    if (!$db) {

        throw new Exception(
            "No se pudo conectar con la base de datos."
        );
    }

    $consultaCategoria = $db->prepare(
        "SELECT id_categoria
         FROM categorias
         WHERE nombre_categoria = :nombre
         LIMIT 1"
    );

    $consultaCategoria->execute([
        ":nombre" => "Hábito Personalizado"
    ]);

    $categoria = $consultaCategoria->fetch(PDO::FETCH_ASSOC);

    if (!$categoria) {

        throw new Exception(
            "La categoría 'Hábito Personalizado' no existe en la tabla categorias."
        );
    }

    $idCategoria = (int) $categoria["id_categoria"];

    $db->beginTransaction();

    $consulta = $db->prepare(
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
            activo
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
            TRUE
        )"
    );

    $consulta->execute([
        ":id_usuario" => $usuarioId,
        ":id_categoria" => $idCategoria,
        ":nombre_habito" => $nombre,
        ":descripcion" => $descripcion,
        ":frecuencia" => $frecuencia,
        ":fecha_inicio" => $fechaInicio,
        ":fecha_fin" => $fechaFin
    ]);

    $idHabito = $db->lastInsertId();

    $consultaRacha = $db->prepare(
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

    $consultaRacha->execute([
        ":id_habito" => $idHabito
    ]);

    $db->commit();

    echo json_encode([
        "exito" => true,
        "mensaje" => "Hábito creado correctamente.",
        "habito" => [
            "id" => $idHabito,
            "nombre" => $nombre,
            "descripcion" => $descripcion,
            "frecuencia" => $frecuencia,
            "fechaInicio" => $fechaInicio,
            "fechaFin" => $fechaFin
        ]
    ]);

    exit;

} catch (Throwable $error) {

    if (
        isset($db) &&
        $db instanceof PDO &&
        $db->inTransaction()
    ) {

        $db->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ocurrió un error al crear el hábito.",
        "detalle" => $error->getMessage()
    ]);

    exit;
}
?>