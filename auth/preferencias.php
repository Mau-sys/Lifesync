<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";

$db = null;

try {

    // =========================================================
    // 1. COMPROBAR SESIÓN
    // =========================================================

    if (!isset($_SESSION["usuario_id"])) {

        http_response_code(401);

        echo json_encode([
            "exito" => false,
            "paso" => "SESION",
            "mensaje" => "No existe usuario_id en la sesión.",
            "sesion" => $_SESSION
        ]);

        exit;
    }


    $usuarioId = (int) $_SESSION["usuario_id"];


    // =========================================================
    // 2. COMPROBAR CONEXIÓN
    // =========================================================

    $database = new Database();

    $db = $database->getConnection();


    if (!$db) {

        throw new Exception(
            "No se pudo conectar con la base de datos."
        );
    }


    // =========================================================
    // 3. COMPROBAR QUE EL USUARIO EXISTE
    // =========================================================

    $consulta = $db->prepare(
        "SELECT id_usuario, nombre_usuario, correo
         FROM usuario
         WHERE id_usuario = :id
         LIMIT 1"
    );

    $consulta->execute([
        ":id" => $usuarioId
    ]);

    $usuario = $consulta->fetch();


    if (!$usuario) {

        throw new Exception(
            "El usuario de la sesión no existe en la tabla usuario. ID recibido: "
            . $usuarioId
        );
    }


    // =========================================================
    // 4. RECIBIR JSON
    // =========================================================

    $contenido = file_get_contents("php://input");

    $datos = json_decode($contenido, true);


    if (!is_array($datos)) {

        throw new Exception(
            "El JSON recibido no es válido. Contenido recibido: "
            . $contenido
        );
    }


    $categorias = $datos["categorias"] ?? [];


    if (!is_array($categorias) || count($categorias) === 0) {

        throw new Exception(
            "No se recibieron categorías."
        );
    }


    // =========================================================
    // 5. COMPROBAR CATEGORÍAS
    // =========================================================

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

            throw new Exception(
                "Categoría no permitida: " . $categoria
            );
        }
    }


    // =========================================================
    // 6. INICIAR TRANSACCIÓN
    // =========================================================

    $db->beginTransaction();


    // =========================================================
    // 7. ELIMINAR PREFERENCIAS ANTERIORES
    // =========================================================

    $consultaEliminar = $db->prepare(
        "DELETE FROM usuario_categorias
         WHERE id_usuario = :id_usuario"
    );

    $consultaEliminar->execute([
        ":id_usuario" => $usuarioId
    ]);


    // =========================================================
    // 8. BUSCAR CATEGORÍAS
    // =========================================================

    $consultaCategoria = $db->prepare(
        "SELECT id_categoria
         FROM categorias
         WHERE nombre_categoria = :nombre
         LIMIT 1"
    );


    // =========================================================
    // 9. INSERTAR CATEGORÍAS
    // =========================================================

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


        $categoriaEncontrada =
            $consultaCategoria->fetch();


        if (!$categoriaEncontrada) {

            throw new Exception(
                "No existe la categoría en la tabla categorias: "
                . $nombreCategoria
            );
        }


        $consultaInsertar->execute([
            ":id_usuario" => $usuarioId,
            ":id_categoria" =>
                (int) $categoriaEncontrada["id_categoria"]
        ]);
    }


    // =========================================================
    // 10. GUARDAR PREFERENCIAS GENERALES
    // =========================================================

    $consultaPreferencias = $db->prepare(
        "SELECT id_preferencia
         FROM preferencias_usuario
         WHERE id_usuario = :id_usuario
         LIMIT 1"
    );

    $consultaPreferencias->execute([
        ":id_usuario" => $usuarioId
    ]);

    $preferenciaExistente =
        $consultaPreferencias->fetch();


    if (!$preferenciaExistente) {

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


    // =========================================================
    // 11. CONFIRMAR
    // =========================================================

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
        "error" => $error->getMessage(),
        "archivo" => $error->getFile(),
        "linea" => $error->getLine()
    ]);

    exit;
}
?>