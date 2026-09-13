<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . "/../config/conexion.php";

function responder(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (!isset($_SESSION["usuario_id"])) {
    responder(["exito" => false, "mensaje" => "La sesión ha expirado."], 401);
}

$usuarioId = (int) $_SESSION["usuario_id"];

$usuario = trim($_POST["usuario"] ?? "");
$nombreCompleto = trim($_POST["nombreCompleto"] ?? "");
$correo = trim($_POST["correo"] ?? "");
$fechaNacimiento = trim($_POST["fechaNacimiento"] ?? "");
$genero = trim($_POST["genero"] ?? "");
$contrasenaActual = $_POST["contrasenaActual"] ?? "";
$nuevaContrasena = $_POST["nuevaContrasena"] ?? "";
$confirmarContrasena = $_POST["confirmarContrasena"] ?? "";

if ($usuario === "") {
    responder(["exito" => false, "mensaje" => "El nombre de usuario es obligatorio."], 400);
}

if (strlen($usuario) > 50) {
    responder(["exito" => false, "mensaje" => "El nombre de usuario es demasiado largo."], 400);
}

if ($correo === "" || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(["exito" => false, "mensaje" => "Ingresa un correo electrónico válido."], 400);
}

if ($fechaNacimiento !== "") {
    $fecha = DateTime::createFromFormat("Y-m-d", $fechaNacimiento);
    if (!$fecha || $fecha->format("Y-m-d") !== $fechaNacimiento) {
        responder(["exito" => false, "mensaje" => "La fecha de nacimiento no es válida."], 400);
    }
}

if ($genero !== "" && !in_array($genero, ["femenino", "masculino", "otro"], true)) {
    responder(["exito" => false, "mensaje" => "El género seleccionado no es válido."], 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $consulta = $db->prepare("SELECT password_hash FROM usuario WHERE id_usuario = :id_usuario LIMIT 1");
    $consulta->execute([":id_usuario" => $usuarioId]);
    $usuarioActual = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$usuarioActual) {
        responder(["exito" => false, "mensaje" => "No se encontró el usuario."], 404);
    }

    if ($nuevaContrasena !== "" || $confirmarContrasena !== "") {
        if ($contrasenaActual === "") {
            responder(["exito" => false, "mensaje" => "Debes ingresar tu contraseña actual."], 400);
        }
        if (!password_verify($contrasenaActual, $usuarioActual["password_hash"])) {
            responder(["exito" => false, "mensaje" => "La contraseña actual no es correcta."], 400);
        }
        if ($nuevaContrasena !== $confirmarContrasena) {
            responder(["exito" => false, "mensaje" => "Las nuevas contraseñas no coinciden."], 400);
        }
        if (strlen($nuevaContrasena) < 8) {
            responder(["exito" => false, "mensaje" => "La nueva contraseña debe tener al menos 8 caracteres."], 400);
        }
    }

    $consulta = $db->prepare("SELECT id_usuario FROM usuario WHERE correo = :correo AND id_usuario <> :id_usuario LIMIT 1");
    $consulta->execute([":correo" => $correo, ":id_usuario" => $usuarioId]);
    if ($consulta->fetch()) {
        responder(["exito" => false, "mensaje" => "Ese correo ya está registrado."], 409);
    }

    $db->beginTransaction();

    $campos = [
        "nombre_usuario = :nombre_usuario",
        "nombre_completo = :nombre_completo",
        "correo = :correo",
        "fecha_nacimiento = :fecha_nacimiento",
        "genero = :genero"
    ];

    $parametros = [
        ":nombre_usuario" => $usuario,
        ":nombre_completo" => $nombreCompleto !== "" ? $nombreCompleto : null,
        ":correo" => $correo,
        ":fecha_nacimiento" => $fechaNacimiento !== "" ? $fechaNacimiento : null,
        ":genero" => $genero !== "" ? $genero : null,
        ":id_usuario" => $usuarioId
    ];

    if ($nuevaContrasena !== "") {
        $campos[] = "password_hash = :password_hash";
        $parametros[":password_hash"] = password_hash($nuevaContrasena, PASSWORD_DEFAULT);
    }

    $consulta = $db->prepare("UPDATE usuario SET " . implode(", ", $campos) . " WHERE id_usuario = :id_usuario");
    $consulta->execute($parametros);

    if (isset($_FILES["nuevaFoto"]) && $_FILES["nuevaFoto"]["error"] !== UPLOAD_ERR_NO_FILE) {
        if ($_FILES["nuevaFoto"]["error"] !== UPLOAD_ERR_OK) {
            throw new Exception("No se pudo recibir la imagen.");
        }

        $archivo = $_FILES["nuevaFoto"];

        if ($archivo["size"] > 5 * 1024 * 1024) {
            throw new Exception("La imagen no puede superar los 5 MB.");
        }

        $tiposPermitidos = [
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp"
        ];

        $tipo = mime_content_type($archivo["tmp_name"]);
        if (!isset($tiposPermitidos[$tipo])) {
            throw new Exception("El formato de imagen no es válido.");
        }

        $carpeta = __DIR__ . "/../uploads/perfiles/";
        if (!is_dir($carpeta) && !mkdir($carpeta, 0755, true)) {
            throw new Exception("No se pudo crear la carpeta de perfiles.");
        }

        $nombreArchivo = "perfil_" . $usuarioId . "_" . time() . "." . $tiposPermitidos[$tipo];
        $rutaFisica = $carpeta . $nombreArchivo;
        $rutaBD = "uploads/perfiles/" . $nombreArchivo;

        if (!move_uploaded_file($archivo["tmp_name"], $rutaFisica)) {
            throw new Exception("No se pudo guardar la imagen.");
        }

        $consulta = $db->prepare("INSERT INTO perfil_usuario (id_usuario, foto_perfil) VALUES (:id_usuario, :foto_perfil) ON DUPLICATE KEY UPDATE foto_perfil = VALUES(foto_perfil)");
        $consulta->execute([
            ":id_usuario" => $usuarioId,
            ":foto_perfil" => $rutaBD
        ]);
    }

    $db->commit();

    responder(["exito" => true, "mensaje" => "Datos actualizados correctamente."]);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log("LifeSync actualizar-datos-personales.php: " . $error->getMessage());
    responder(["exito" => false, "mensaje" => $error->getMessage()], 500);
}
