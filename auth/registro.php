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

$nombre = trim($datos["nombre"] ?? "");
$correo = trim($datos["correo"] ?? "");
$password = $datos["password"] ?? "";

if (
    $nombre === "" ||
    $correo === "" ||
    $password === ""
) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Todos los campos son obligatorios."
    ]);

    exit;
}

if (mb_strlen($nombre) > 50) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "El nombre no puede superar los 50 caracteres."
    ]);

    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ingresa un correo electrónico válido."
    ]);

    exit;
}

if (mb_strlen($password) < 8) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "La contraseña debe tener al menos 8 caracteres."
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
        "SELECT id_usuario
         FROM usuario
         WHERE correo = :correo
         LIMIT 1"
    );

    $consulta->execute([
        ":correo" => $correo
    ]);

    if ($consulta->fetch()) {

        http_response_code(409);

        echo json_encode([
            "exito" => false,
            "mensaje" => "El correo ya está registrado."
        ]);

        exit;
    }

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $consulta = $db->prepare(
        "INSERT INTO usuario
        (
            nombre_usuario,
            correo,
            password_hash
        )
        VALUES
        (
            :nombre,
            :correo,
            :password_hash
        )"
    );

    $consulta->execute([

        ":nombre" => $nombre,

        ":correo" => $correo,

        ":password_hash" => $passwordHash

    ]);

    $usuarioId = $db->lastInsertId();

    $_SESSION["usuario_id"] = $usuarioId;
    $_SESSION["usuario_nombre"] = $nombre;
    $_SESSION["usuario_correo"] = $correo;

    echo json_encode([

        "exito" => true,

        "mensaje" => "Usuario registrado correctamente."

    ]);

} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([

        "exito" => false,

        "mensaje" => "Ocurrió un error al registrar el usuario."

    ]);

}

?>