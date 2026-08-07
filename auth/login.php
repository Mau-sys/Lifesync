<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";

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

$correo = trim($datos["correo"] ?? "");
$password = $datos["password"] ?? "";

if ($correo === "" || $password === "") {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Completa todos los campos."
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

    $consulta = $db->prepare(
        "SELECT
            id_usuario,
            nombre_usuario,
            correo,
            password_hash,
            estado
         FROM usuario
         WHERE correo = :correo
         LIMIT 1"
    );

    $consulta->execute([
        ":correo" => $correo
    ]);

    $usuario = $consulta->fetch();

    if (!$usuario) {

        http_response_code(401);

        echo json_encode([
            "exito" => false,
            "mensaje" => "El correo o la contraseña son incorrectos."
        ]);

        exit;
    }

    if ($usuario["estado"] !== "activo") {

        http_response_code(403);

        echo json_encode([
            "exito" => false,
            "mensaje" => "Esta cuenta no está disponible."
        ]);

        exit;
    }

    if (
        !password_verify(
            $password,
            $usuario["password_hash"]
        )
    ) {

        http_response_code(401);

        echo json_encode([
            "exito" => false,
            "mensaje" => "El correo o la contraseña son incorrectos."
        ]);

        exit;
    }

    session_regenerate_id(true);

    $_SESSION["usuario_id"] = $usuario["id_usuario"];
    $_SESSION["usuario_nombre"] = $usuario["nombre_usuario"];
    $_SESSION["usuario_correo"] = $usuario["correo"];

    echo json_encode([
        "exito" => true,
        "mensaje" => "Inicio de sesión correcto.",
        "usuario" => [
            "id" => $usuario["id_usuario"],
            "nombre" => $usuario["nombre_usuario"],
            "correo" => $usuario["correo"]
        ]
    ]);

} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ocurrió un error al procesar el inicio de sesión."
    ]);
}

?>