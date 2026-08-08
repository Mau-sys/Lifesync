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


$usuario = trim($_POST["usuario"] ?? "");
$nombreCompleto = trim($_POST["nombreCompleto"] ?? "");
$correo = trim($_POST["correo"] ?? "");
$fechaNacimiento = $_POST["fechaNacimiento"] ?? "";
$genero = $_POST["genero"] ?? "";

$contrasenaActual = $_POST["contrasenaActual"] ?? "";
$nuevaContrasena = $_POST["nuevaContrasena"] ?? "";
$confirmarContrasena = $_POST["confirmarContrasena"] ?? "";


if ($usuario === "") {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "El nombre de usuario es obligatorio."
    ]);

    exit;
}


if ($correo === "" || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ingresa un correo electrónico válido."
    ]);

    exit;
}


try {

    $database = new Database();

    $db = $database->getConnection();


    if ($db === null) {

        throw new Exception(
            "No se pudo conectar con la base de datos."
        );

    }


    $consulta = $db->prepare("
        SELECT
            id_usuario,
            password_hash
        FROM usuario
        WHERE id_usuario = :id_usuario
        LIMIT 1
    ");

    $consulta->execute([
        ":id_usuario" => $usuarioId
    ]);


    $usuarioActual =
        $consulta->fetch(PDO::FETCH_ASSOC);


    if (!$usuarioActual) {

        http_response_code(404);

        echo json_encode([
            "exito" => false,
            "mensaje" => "No se encontró el usuario."
        ]);

        exit;
    }


    if (
        $nuevaContrasena !== "" ||
        $confirmarContrasena !== ""
    ) {

        if ($contrasenaActual === "") {

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "Debes ingresar tu contraseña actual."
            ]);

            exit;
        }


        if (
            !password_verify(
                $contrasenaActual,
                $usuarioActual["password_hash"]
            )
        ) {

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "La contraseña actual no es correcta."
            ]);

            exit;
        }


        if ($nuevaContrasena !== $confirmarContrasena) {

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "Las nuevas contraseñas no coinciden."
            ]);

            exit;
        }


        if (strlen($nuevaContrasena) < 8) {

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "La nueva contraseña debe tener al menos 8 caracteres."
            ]);

            exit;
        }

    }


    $db->beginTransaction();


    $consulta = $db->prepare("
        SELECT id_usuario
        FROM usuario
        WHERE correo = :correo
        AND id_usuario <> :id_usuario
        LIMIT 1
    ");

    $consulta->execute([
        ":correo" => $correo,
        ":id_usuario" => $usuarioId
    ]);


    if ($consulta->fetch()) {

        $db->rollBack();

        http_response_code(409);

        echo json_encode([
            "exito" => false,
            "mensaje" => "Ese correo ya está registrado."
        ]);

        exit;
    }


    if ($nuevaContrasena !== "") {

        $passwordHash =
            password_hash(
                $nuevaContrasena,
                PASSWORD_DEFAULT
            );


        $consulta = $db->prepare("
            UPDATE usuario
            SET
                nombre_usuario = :nombre_usuario,
                nombre_completo = :nombre_completo,
                correo = :correo,
                fecha_nacimiento = :fecha_nacimiento,
                genero = :genero,
                password_hash = :password_hash
            WHERE id_usuario = :id_usuario
        ");


        $consulta->execute([
            ":nombre_usuario" => $usuario,
            ":nombre_completo" => $nombreCompleto,
            ":correo" => $correo,
            ":fecha_nacimiento" =>
                $fechaNacimiento !== ""
                    ? $fechaNacimiento
                    : null,
            ":genero" =>
                $genero !== ""
                    ? $genero
                    : null,
            ":password_hash" => $passwordHash,
            ":id_usuario" => $usuarioId
        ]);

    } else {

        $consulta = $db->prepare("
            UPDATE usuario
            SET
                nombre_usuario = :nombre_usuario,
                nombre_completo = :nombre_completo,
                correo = :correo,
                fecha_nacimiento = :fecha_nacimiento,
                genero = :genero
            WHERE id_usuario = :id_usuario
        ");


        $consulta->execute([
            ":nombre_usuario" => $usuario,
            ":nombre_completo" => $nombreCompleto,
            ":correo" => $correo,
            ":fecha_nacimiento" =>
                $fechaNacimiento !== ""
                    ? $fechaNacimiento
                    : null,
            ":genero" =>
                $genero !== ""
                    ? $genero
                    : null,
            ":id_usuario" => $usuarioId
        ]);

    }


    if (
        isset($_FILES["nuevaFoto"]) &&
        $_FILES["nuevaFoto"]["error"] === UPLOAD_ERR_OK
    ) {

        $archivo = $_FILES["nuevaFoto"];


        if ($archivo["size"] > 5 * 1024 * 1024) {

            $db->rollBack();

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "La imagen no puede superar los 5 MB."
            ]);

            exit;
        }


        $tiposPermitidos = [
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp"
        ];


        $tipo = mime_content_type(
            $archivo["tmp_name"]
        );


        if (!isset($tiposPermitidos[$tipo])) {

            $db->rollBack();

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "El formato de imagen no es válido."
            ]);

            exit;
        }


        $carpeta = "../uploads/perfiles/";


        if (!is_dir($carpeta)) {

            mkdir(
                $carpeta,
                0755,
                true
            );

        }


        $nombreArchivo =
            "perfil_" .
            $usuarioId .
            "_" .
            time() .
            "." .
            $tiposPermitidos[$tipo];


        $rutaFisica =
            $carpeta . $nombreArchivo;


        $rutaBD =
            "uploads/perfiles/" .
            $nombreArchivo;


        if (!move_uploaded_file(
            $archivo["tmp_name"],
            $rutaFisica
        )) {

            $db->rollBack();

            throw new Exception(
                "No se pudo guardar la imagen."
            );

        }


        $consulta = $db->prepare("
            INSERT INTO perfil_usuario (
                id_usuario,
                foto_perfil
            )
            VALUES (
                :id_usuario,
                :foto_perfil
            )
            ON DUPLICATE KEY UPDATE
                foto_perfil = VALUES(foto_perfil)
        ");


        $consulta->execute([
            ":id_usuario" => $usuarioId,
            ":foto_perfil" => $rutaBD
        ]);

    }


    $db->commit();


    echo json_encode([
        "exito" => true,
        "mensaje" => "Datos actualizados correctamente."
    ]);


} catch (Exception $error) {

    if (isset($db) && $db->inTransaction()) {

        $db->rollBack();

    }


    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ocurrió un error al actualizar los datos."
    ]);

}