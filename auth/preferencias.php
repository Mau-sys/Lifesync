<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";

try {

    if (!isset($_SESSION["usuario_id"])) {

        http_response_code(401);

        echo json_encode([
            "exito" => false,
            "paso" => "SESION",
            "mensaje" => "No existe usuario_id en la sesión."
        ]);

        exit;
    }

    $usuarioId = (int) $_SESSION["usuario_id"];

    $contenido = file_get_contents("php://input");

    $datos = json_decode($contenido, true);

    if (!is_array($datos)) {

        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "paso" => "JSON",
            "mensaje" => "El JSON recibido no es válido."
        ]);

        exit;
    }

    $categorias = $datos["categorias"] ?? [];

    if (!is_array($categorias) || count($categorias) === 0) {

        http_response_code(400);

        echo json_encode([
            "exito" => false,
            "paso" => "CATEGORIAS",
            "mensaje" => "No se recibieron categorías."
        ]);

        exit;
    }

    $permitidas = [
        "Hidratación",
        "Alimentación",
        "Salud Mental",
        "Actividad Física",
        "Registro Académico",
        "Hábito Personalizado"
    ];

    foreach ($categorias as $categoria) {

        if (!in_array($categoria, $permitidas, true)) {

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "paso" => "CATEGORIA",
                "mensaje" => "Categoría no permitida: " . $categoria
            ]);

            exit;
        }
    }

    $database = new Database();

    $db = $database->getConnection();

    if (!$db) {

        throw new Exception(
            "No se pudo obtener la conexión a MySQL."
        );
    }

    $consultaUsuario = $db->prepare(
        "SELECT id_usuario
         FROM usuario
         WHERE id_usuario = :id_usuario
         LIMIT 1"
    );

    $consultaUsuario->execute([
        ":id_usuario" => $usuarioId
    ]);

    $usuario = $consultaUsuario->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {

        throw new Exception(
            "El usuario con ID " . $usuarioId . " no existe en la tabla usuario."
        );
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

        $categoria = $consultaCategoria->fetch(PDO::FETCH_ASSOC);

        if (!$categoria) {

            throw new Exception(
                "La categoría '" .
                $nombreCategoria .
                "' no existe en la tabla categorias."
            );
        }

        $consultaInsertar->execute([
            ":id_usuario" => $usuarioId,
            ":id_categoria" => (int) $categoria["id_categoria"]
        ]);
    }

    $consultaPreferencia = $db->prepare(
        "SELECT id_preferencia
         FROM preferencias_usuario
         WHERE id_usuario = :id_usuario
         LIMIT 1"
    );

    $consultaPreferencia->execute([
        ":id_usuario" => $usuarioId
    ]);

    $preferencia = $consultaPreferencia->fetch(PDO::FETCH_ASSOC);

    if (!$preferencia) {

        $insertarPreferencia = $db->prepare(
            "INSERT INTO preferencias_usuario
            (
                id_usuario
            )
            VALUES
            (
                :id_usuario
            )"
        );

        $insertarPreferencia->execute([
            ":id_usuario" => $usuarioId
        ]);
    }

    $db->commit();

    echo json_encode([
        "exito" => true,
        "paso" => "COMPLETADO",
        "mensaje" => "Preferencias guardadas correctamente.",
        "usuario_id" => $usuarioId,
        "categorias" => $categorias
    ]);

    exit;

} catch (Throwable $error) {

    if (
        isset($db) &&
        $db instanceof PDO &&
        $db->inTransaction()
    ) {

        $db->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "paso" => "ERROR",
        "mensaje" => "Ocurrió un error al guardar las preferencias.",
        "detalle" => $error->getMessage()
    ]);

    exit;
}
?>