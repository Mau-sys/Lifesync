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
            l.id_logro,
            l.nombre_logro AS nombre,
            l.descripcion,
            l.icono
         
         FROM usuario_logros ul
         
         INNER JOIN logros l
            ON l.id_logro = ul.id_logro
         
         WHERE ul.id_usuario = :id_usuario
         
         ORDER BY ul.fecha_obtenido DESC"
    );


    $consulta->execute([
        ":id_usuario" => $usuarioId
    ]);


    $insignias = $consulta->fetchAll(PDO::FETCH_ASSOC);


    echo json_encode([
        "exito" => true,
        "insignias" => $insignias
    ]);


} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "No se pudieron cargar las insignias."
    ]);

}

?>