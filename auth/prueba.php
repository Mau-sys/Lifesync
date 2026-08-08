<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";

try {

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        echo json_encode([
            "exito" => false,
            "mensaje" => "No se pudo conectar con la base de datos."
        ]);

        exit;
    }

    echo json_encode([
        "exito" => true,
        "mensaje" => "PHP y la conexión con la base de datos funcionan correctamente."
    ]);

} catch (Throwable $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ocurrió un error.",
        "error" => $error->getMessage()
    ]);
}