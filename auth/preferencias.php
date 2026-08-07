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


$categorias = $datos["categorias"] ?? [];


if (!is_array($categorias) || count($categorias) === 0) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Selecciona al menos una categoría."
    ]);

    exit;
}


$categoriasPermitidas = [
    "Hidratación",
    "Alimentación",
    "Salud Mental",
    "Actividad Física",
    "Registro Académico",
    "Hábito Personalizado"
];


$categorias = array_values(
    array_unique($categorias)
);


foreach ($categorias as $categoria) {

    if (!in_array($categoria, $categoriasPermitidas, true)) {

        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "mensaje" => "Se recibió una categoría no válida."
        ]);

        exit;
    }
}


$usuarioId = $_SESSION["usuario_id"];


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


    $db->beginTransaction();


    $consultaEliminar = $db->prepare(
        "DELETE FROM usuario_categorias
         WHERE id_usuario = :id_usuario"
    );


    $consultaEliminar->execute([
        ":id_usuario" => $usuarioId
    ]);


    $consultaCategoria = $db->prepare(
        "SELECT id_categoria
         FROM categorias
         WHERE nombre_categoria = :nombre
         LIMIT 1"
    );


    $consultaInsertar = $db->prepare(
        "INSERT INTO usuario_categorias
        (
            id_usuario,
            id_categoria
        )
        VALUES
        (
            :id_usuario,
            :id_categoria
        )"
    );


    foreach ($categorias as $nombreCategoria) {

        $consultaCategoria->execute([
            ":nombre" => $nombreCategoria
        ]);


        $categoria = $consultaCategoria->fetch();


        if (!$categoria) {

            $db->rollBack();

            http_response_code(500);

            echo json_encode([
                "exito" => false,
                "mensaje" =>
                    "La categoría '" .
                    $nombreCategoria .
                    "' no existe en la base de datos."
            ]);

            exit;
        }


        $consultaInsertar->execute([
            ":id_usuario" => $usuarioId,
            ":id_categoria" => $categoria["id_categoria"]
        ]);
    }


    $db->commit();


    echo json_encode([
        "exito" => true,
        "mensaje" => "Preferencias guardadas correctamente.",
        "categorias" => $categorias
    ]);


} catch (PDOException $error) {

    if ($db !== null && $db->inTransaction()) {

        $db->rollBack();
    }


    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" =>
            "Ocurrió un error al guardar las preferencias."
    ]);
}

?>