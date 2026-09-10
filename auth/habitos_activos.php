<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";


// ==========================================
// VERIFICAR SESIÓN
// ==========================================

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

    // ==========================================
    // CONEXIÓN
    // ==========================================

    $database = new Database();

    $conexion = $database->getConnection();


    // ==========================================
    // CONSULTAR HÁBITOS ACTIVOS
    // ==========================================

    $sql = "
        SELECT
            hu.id_habito_usuario,
            h.id_habito,
            h.nombre_habito,
            h.descripcion,
            h.id_categoria,
            c.nombre AS categoria,
            hu.objetivo,
            hu.unidad,
            hu.frecuencia,
            hu.duracion_minutos

        FROM habitos_usuario hu

        INNER JOIN habitos h
            ON hu.id_habito = h.id_habito

        LEFT JOIN categorias c
            ON h.id_categoria = c.id_categoria

        WHERE hu.id_usuario = :usuario_id
        AND hu.activo = TRUE

        ORDER BY h.id_habito ASC
    ";


    $stmt = $conexion->prepare($sql);

    $stmt->bindParam(
        ":usuario_id",
        $usuarioId,
        PDO::PARAM_INT
    );

    $stmt->execute();


    $habitos = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ==========================================
    // RESPUESTA
    // ==========================================

    echo json_encode([
        "exito" => true,
        "habitos" => $habitos
    ]);

} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Error al obtener los hábitos."
    ]);

}