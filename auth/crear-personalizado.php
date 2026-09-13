<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/conexion.php";

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
    responderJSON([
        "exito" => false,
        "mensaje" => "La sesión ha expirado. Inicia sesión nuevamente."
    ], 401);
}

$datos = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($datos)) {
    responderJSON([
        "exito" => false,
        "mensaje" => "Los datos enviados no son válidos."
    ], 400);
}

$nombreHabito = trim($datos["nombre_habito"] ?? "");
$descripcion = trim($datos["descripcion"] ?? "");
$frecuencia = trim($datos["frecuencia"] ?? "");
$fechaInicio = trim($datos["fecha_inicio"] ?? "");
$fechaFin = trim($datos["fecha_fin"] ?? "");

if (
    $nombreHabito === "" ||
    $descripcion === "" ||
    $frecuencia === "" ||
    $fechaInicio === ""
) {
    responderJSON([
        "exito" => false,
        "mensaje" => "Completa todos los campos obligatorios."
    ], 400);
}

if (strlen($nombreHabito) < 2 || strlen($nombreHabito) > 150) {
    responderJSON([
        "exito" => false,
        "mensaje" => "El nombre del hábito debe tener entre 2 y 150 caracteres."
    ], 400);
}

if (strlen($descripcion) < 3 || strlen($descripcion) > 500) {
    responderJSON([
        "exito" => false,
        "mensaje" => "La descripción debe tener entre 3 y 500 caracteres."
    ], 400);
}

$frecuenciasPermitidas = [
    "diaria",
    "semanal",
    "mensual"
];

if (!in_array($frecuencia, $frecuenciasPermitidas, true)) {
    responderJSON([
        "exito" => false,
        "mensaje" => "La frecuencia seleccionada no es válida."
    ], 400);
}

$inicio = DateTime::createFromFormat(
    "Y-m-d",
    $fechaInicio
);

if (
    !$inicio ||
    $inicio->format("Y-m-d") !== $fechaInicio
) {
    responderJSON([
        "exito" => false,
        "mensaje" => "La fecha de inicio no es válida."
    ], 400);
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
        responderJSON([
            "exito" => false,
            "mensaje" => "La fecha de finalización no es válida."
        ], 400);
    }

    if ($fin < $inicio) {
        responderJSON([
            "exito" => false,
            "mensaje" => "La fecha de finalización no puede ser anterior a la fecha de inicio."
        ], 400);
    }
} else {
    $fechaFin = null;
}

$usuarioId = (int) $_SESSION["usuario_id"];

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db instanceof PDO) {
        throw new Exception("No se pudo conectar con la base de datos.");
    }

    $consultaCategoria = $db->prepare(
        "SELECT id_categoria
         FROM categorias
         WHERE nombre = :nombre
         LIMIT 1"
    );

    $consultaCategoria->execute([
        ":nombre" => "Hábito Personalizado"
    ]);

    $categoria = $consultaCategoria->fetch(PDO::FETCH_ASSOC);

    if (!$categoria) {
        throw new Exception("No existe la categoría de hábitos personalizados.");
    }

    $idCategoria = (int) $categoria["id_categoria"];

    $db->beginTransaction();

    $consultaHabito = $db->prepare(
        "INSERT INTO habitos
        (
            id_categoria,
            nombre_habito,
            descripcion,
            es_base,
            color,
            imagen_url
        )
        VALUES
        (
            :id_categoria,
            :nombre_habito,
            :descripcion,
            FALSE,
            '#FF9800',
            'img/H-Perzona.png'
        )"
    );

    $consultaHabito->execute([
        ":id_categoria" => $idCategoria,
        ":nombre_habito" => $nombreHabito,
        ":descripcion" => $descripcion
    ]);

    $idHabito = (int) $db->lastInsertId();

    $consultaUsuarioHabito = $db->prepare(
        "INSERT INTO habitos_usuario
        (
            id_usuario,
            id_habito,
            activo,
            objetivo,
            unidad,
            frecuencia,
            duracion_minutos,
            fecha_inicio,
            fecha_fin
        )
        VALUES
        (
            :id_usuario,
            :id_habito,
            TRUE,
            1,
            'completar',
            :frecuencia,
            NULL,
            :fecha_inicio,
            :fecha_fin
        )"
    );

    $consultaUsuarioHabito->execute([
        ":id_usuario" => $usuarioId,
        ":id_habito" => $idHabito,
        ":frecuencia" => $frecuencia,
        ":fecha_inicio" => $fechaInicio,
        ":fecha_fin" => $fechaFin
    ]);

    $idHabitoUsuario = (int) $db->lastInsertId();

    $consultaRacha = $db->prepare(
        "INSERT INTO rachas
        (
            id_habito_usuario,
            racha_actual,
            mejor_racha,
            total_completados,
            ultima_fecha
        )
        VALUES
        (
            :id_habito_usuario,
            0,
            0,
            0,
            NULL
        )"
    );

    $consultaRacha->execute([
        ":id_habito_usuario" => $idHabitoUsuario
    ]);

    $db->commit();

    responderJSON([
        "exito" => true,
        "mensaje" => "Hábito creado correctamente.",
        "id_habito" => $idHabito,
        "id_habito_usuario" => $idHabitoUsuario,
        "habito" => [
            "id" => $idHabitoUsuario,
            "idHabito" => $idHabito,
            "nombre" => $nombreHabito,
            "descripcion" => $descripcion,
            "frecuencia" => $frecuencia,
            "fechaInicio" => $fechaInicio,
            "fechaFin" => $fechaFin
        ]
    ]);

} catch (Throwable $error) {
    if (
        isset($db) &&
        $db instanceof PDO &&
        $db->inTransaction()
    ) {
        $db->rollBack();
    }

    error_log(
        "LifeSync crear-personalizado.php: " .
        $error->getMessage()
    );

    responderJSON([
        "exito" => false,
        "mensaje" => "Ocurrió un error al crear el hábito."
    ], 500);
}