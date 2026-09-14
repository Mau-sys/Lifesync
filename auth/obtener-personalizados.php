<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

if (!isset($_SESSION["usuario_id"])) {
    http_response_code(401);
    echo json_encode(["exito" => false, "mensaje" => "La sesión ha expirado."], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $usuarioId = (int) $_SESSION["usuario_id"];

    $consulta = $db->prepare("SELECT hu.id_habito_usuario, h.id_habito, h.nombre_habito, h.descripcion, h.imagen_url, c.nombre AS categoria, hu.objetivo, hu.unidad, hu.frecuencia, hu.duracion_minutos, hu.fecha_inicio, hu.fecha_fin, COALESCE(SUM(CASE WHEN DATE(r.fecha_registro) = CURDATE() THEN r.valor_registrado ELSE 0 END), 0) AS progreso_hoy FROM habitos_usuario hu INNER JOIN habitos h ON h.id_habito = hu.id_habito INNER JOIN categorias c ON c.id_categoria = h.id_categoria LEFT JOIN registros_habitos r ON r.id_habito_usuario = hu.id_habito_usuario WHERE hu.id_usuario = :id_usuario AND hu.activo = TRUE AND h.es_base = FALSE AND c.nombre = 'Hábito Personalizado' GROUP BY hu.id_habito_usuario, h.id_habito, h.nombre_habito, h.descripcion, h.imagen_url, c.nombre, hu.objetivo, hu.unidad, hu.frecuencia, hu.duracion_minutos, hu.fecha_inicio, hu.fecha_fin ORDER BY h.fecha_creacion DESC");
    $consulta->execute([":id_usuario" => $usuarioId]);
    $habitos = $consulta->fetchAll(PDO::FETCH_ASSOC);

    foreach ($habitos as &$habito) {
        $habito["id_habito"] = (int) $habito["id_habito"];
        $habito["id_habito_usuario"] = (int) $habito["id_habito_usuario"];
        $habito["objetivo"] = (float) $habito["objetivo"];
        $habito["progreso"] = (float) $habito["progreso_hoy"];
        $habito["icono"] = $habito["imagen_url"] ?: "img/H-Perzona.png";
        unset($habito["progreso_hoy"]);
    }

    echo json_encode(["exito" => true, "habitos" => $habitos], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Ocurrió un error al obtener los hábitos."], JSON_UNESCAPED_UNICODE);
}
