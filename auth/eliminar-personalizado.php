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


$idHabito =
    $datos["id_habito"] ?? null;


if (!$idHabito) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "No se indicó el hábito."
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


    $consulta = $db->prepare("
        DELETE h
        FROM habitos h

        INNER JOIN categorias c
            ON c.id_categoria = h.id_categoria

        WHERE h.id_habito = :id_habito

        AND h.id_usuario = :id_usuario

        AND c.nombre_categoria = 'Hábito Personalizado'
    ");


    $consulta->execute([

        ":id_habito" =>
            $idHabito,

        ":id_usuario" =>
            $usuarioId

    ]);


    if ($consulta->rowCount() === 0) {

        http_response_code(404);

        echo json_encode([
            "exito" => false,
            "mensaje" => "No se encontró el hábito."
        ]);

        exit;
    }


    echo json_encode([
        "exito" => true,
        "mensaje" => "Hábito eliminado correctamente."
    ]);


} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ocurrió un error al eliminar el hábito."
    ]);

}

?>