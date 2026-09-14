<?php

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

if (!isset($_SESSION["usuario_id"])) {
    http_response_code(401);
    echo json_encode([
        "exito" => false,
        "mensaje" => "La sesión ha expirado."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$usuarioId = (int) $_SESSION["usuario_id"];

try {
    $database = new Database();
    $db = $database->getConnection();

    $sql = "
        SELECT
            hu.id_habito_usuario,
            h.id_habito,
            h.nombre_habito,
            h.descripcion,
            h.id_categoria,
            c.nombre AS categoria,
            h.imagen_url,
            hu.objetivo,
            hu.unidad,
            hu.frecuencia,
            hu.duracion_minutos,
            hu.fecha_inicio,
            hu.fecha_fin,
            COALESCE((
                SELECT SUM(r.valor_registrado)
                FROM registros_habitos r
                WHERE r.id_habito_usuario = hu.id_habito_usuario
                AND DATE(r.fecha_registro) = CURDATE()
            ), 0) AS progreso,
            COALESCE(ra.racha_actual, 0) AS racha_actual
        FROM habitos_usuario hu
        INNER JOIN habitos h ON h.id_habito = hu.id_habito
        LEFT JOIN categorias c ON c.id_categoria = h.id_categoria
        LEFT JOIN rachas ra ON ra.id_habito_usuario = hu.id_habito_usuario
        WHERE hu.id_usuario = :id_usuario
        AND hu.activo = TRUE
        ORDER BY h.id_categoria, h.id_habito
    ";

    $consulta = $db->prepare($sql);
    $consulta->execute([":id_usuario" => $usuarioId]);
    $habitos = $consulta->fetchAll(PDO::FETCH_ASSOC);

    foreach ($habitos as &$habito) {
        $habito["id_habito_usuario"] = (int) $habito["id_habito_usuario"];
        $habito["id_habito"] = (int) $habito["id_habito"];
        $habito["id_categoria"] = $habito["id_categoria"] !== null ? (int) $habito["id_categoria"] : null;
        $habito["objetivo"] = (float) $habito["objetivo"];
        $habito["progreso"] = (float) $habito["progreso"];
        $habito["racha_actual"] = (int) $habito["racha_actual"];
        $habito["completado"] = $habito["objetivo"] > 0 && $habito["progreso"] >= $habito["objetivo"];
        $habito["imagen_url"] = $habito["imagen_url"] ?: "img/H-Perzona.png";
    }
    unset($habito);

    echo json_encode([
        "exito" => true,
        "habitos" => $habitos
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        "exito" => false,
        "mensaje" => "Error al obtener los hábitos activos."
    ], JSON_UNESCAPED_UNICODE);
}
