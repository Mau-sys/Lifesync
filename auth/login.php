<?php

declare(strict_types=1);

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/conexion.php";


$datos = json_decode(
    file_get_contents("php://input"),
    true
);


if (!is_array($datos)) {

    http_response_code(400);

    echo json_encode(
        [
            "exito" => false,
            "mensaje" => "Datos inválidos."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


$correo = trim(
    $datos["correo"] ?? ""
);

$password = $datos["password"] ?? "";


if ($correo === "" || $password === "") {

    http_response_code(400);

    echo json_encode(
        [
            "exito" => false,
            "mensaje" => "Completa todos los campos."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode(
        [
            "exito" => false,
            "mensaje" => "Ingresa un correo electrónico válido."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


try {

    $database = new Database();

    $db = $database->getConnection();


    if (!$db instanceof PDO) {

        http_response_code(500);

        echo json_encode(
            [
                "exito" => false,
                "mensaje" => "No se pudo conectar con la base de datos."
            ],
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }


    $consulta = $db->prepare(
        "
        SELECT
            id_usuario,
            nombre_usuario,
            correo,
            password_hash,
            estado
        FROM usuario
        WHERE correo = :correo
        LIMIT 1
        "
    );


    $consulta->execute(
        [
            ":correo" => $correo
        ]
    );


    $usuario = $consulta->fetch(
        PDO::FETCH_ASSOC
    );


    if (!$usuario) {

        http_response_code(401);

        echo json_encode(
            [
                "exito" => false,
                "mensaje" => "El correo o la contraseña son incorrectos."
            ],
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }


    if ($usuario["estado"] !== "activo") {

        http_response_code(403);

        echo json_encode(
            [
                "exito" => false,
                "mensaje" => "Esta cuenta no está disponible."
            ],
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }


    if (
        !password_verify(
            $password,
            $usuario["password_hash"]
        )
    ) {

        http_response_code(401);

        echo json_encode(
            [
                "exito" => false,
                "mensaje" => "El correo o la contraseña son incorrectos."
            ],
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }


    session_regenerate_id(true);


    $_SESSION["usuario_id"] =
        (int) $usuario["id_usuario"];

    $_SESSION["usuario_nombre"] =
        $usuario["nombre_usuario"];

    $_SESSION["usuario_correo"] =
        $usuario["correo"];


    echo json_encode(
        [
            "exito" => true,
            "mensaje" => "Inicio de sesión correcto.",
            "usuario" => [
                "id" => (int) $usuario["id_usuario"],
                "nombre" => $usuario["nombre_usuario"],
                "correo" => $usuario["correo"]
            ]
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;


} catch (PDOException $error) {

    error_log(
        "Error en login.php: " .
        $error->getMessage()
    );

    http_response_code(500);

    echo json_encode(
        [
            "exito" => false,
            "mensaje" => "Ocurrió un error al procesar el inicio de sesión."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}