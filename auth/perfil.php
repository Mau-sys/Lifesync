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
            u.id_usuario,
            u.nombre_usuario,
            u.nombre_completo,
            u.correo,
            u.fecha_nacimiento,
            u.genero,
            p.foto_perfil,
            p.biografia
        FROM usuario u
        LEFT JOIN perfil_usuario p
            ON p.id_usuario = u.id_usuario
        WHERE u.id_usuario = :id_usuario
        LIMIT 1"
    );


    $consulta->execute([
        ":id_usuario" => $usuarioId
    ]);


    $usuario = $consulta->fetch(PDO::FETCH_ASSOC);


    if (!$usuario) {

        http_response_code(404);

        echo json_encode([
            "exito" => false,
            "mensaje" => "No se encontró el usuario."
        ]);

        exit;
    }


    $foto = $usuario["foto_perfil"];


    if (empty($foto)) {

        $foto = "img/Perfil.png";

    }


    echo json_encode([

        "exito" => true,

        "usuario" => [

            "id_usuario" =>
                $usuario["id_usuario"],

            "nombre_usuario" =>
                $usuario["nombre_usuario"],

            "nombre_completo" =>
                $usuario["nombre_completo"],

            "correo" =>
                $usuario["correo"],

            "fecha_nacimiento" =>
                $usuario["fecha_nacimiento"],

            "genero" =>
                $usuario["genero"],

            "foto_perfil" =>
                $foto,

            "biografia" =>
                $usuario["biografia"]

        ]

    ]);


} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ocurrió un error al obtener el perfil."
    ]);

}

?>