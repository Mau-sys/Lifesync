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


$usuarioId = $_SESSION["usuario_id"];


$datos =
    json_decode(
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


$nombreHabito =
    trim($datos["nombre_habito"] ?? "");


$descripcion =
    trim($datos["descripcion"] ?? "");


$frecuencia =
    $datos["frecuencia"] ?? "";


$fechaInicio =
    $datos["fecha_inicio"] ?? "";


$fechaFin =
    $datos["fecha_fin"] ?? null;


if (
    $nombreHabito === "" ||
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

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "La frecuencia seleccionada no es válida."
    ]);

    exit;
}


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


    $consultaCategoria = $db->prepare("
        SELECT id_categoria
        FROM categorias
        WHERE nombre_categoria = 'Hábito Personalizado'
        LIMIT 1
    ");


    $consultaCategoria->execute();


    $categoria =
        $consultaCategoria->fetch(PDO::FETCH_ASSOC);


    if (!$categoria) {

        http_response_code(500);

        echo json_encode([
            "exito" => false,
            "mensaje" => "No existe la categoría de hábitos personalizados."
        ]);

        exit;
    }


    $idCategoria =
        $categoria["id_categoria"];


    $consulta = $db->prepare("
        INSERT INTO habitos (
            id_usuario,
            id_categoria,
            nombre_habito,
            descripcion,
            tipo_medicion,
            objetivo,
            frecuencia,
            fecha_inicio,
            fecha_fin,
            activo,
            icono
        )
        VALUES (
            :id_usuario,
            :id_categoria,
            :nombre_habito,
            :descripcion,
            'completar',
            1,
            :frecuencia,
            :fecha_inicio,
            :fecha_fin,
            TRUE,
            'img/H-Perzona.png'
        )
    ");


    $consulta->execute([

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
            $fechaFin ?: null

    ]);


    echo json_encode([
        "exito" => true,
        "mensaje" => "Hábito creado correctamente.",
        "id_habito" =>
            $db->lastInsertId()
    ]);


} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ocurrió un error al crear el hábito."
    ]);

}

?>