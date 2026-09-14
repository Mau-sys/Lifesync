<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

if (!isset($_SESSION["usuario_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "La sesión ha expirado."], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $usuarioId = (int) $_SESSION["usuario_id"];

    $consulta = $db->prepare("SELECT hu.id_habito_usuario, hu.id_habito, hu.objetivo, hu.unidad, hu.frecuencia, hu.duracion_minutos, hu.fecha_inicio, hu.fecha_fin FROM habitos_usuario hu INNER JOIN habitos h ON h.id_habito = hu.id_habito INNER JOIN categorias c ON c.id_categoria = h.id_categoria WHERE hu.id_usuario = :id_usuario AND hu.activo = TRUE AND c.nombre = 'Salud Mental' ORDER BY hu.id_habito_usuario DESC LIMIT 1");
    $consulta->execute([":id_usuario" => $usuarioId]);
    $habito = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$habito) {
        echo json_encode(["success" => false, "message" => "No tienes activo el hábito de Salud Mental."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $idHu = (int) $habito["id_habito_usuario"];

    $consultaDias = $db->prepare("SELECT dia_semana FROM habito_dias WHERE id_habito_usuario = :id_habito_usuario ORDER BY dia_semana");
    $consultaDias->execute([":id_habito_usuario" => $idHu]);
    $diasBD = array_map("intval", $consultaDias->fetchAll(PDO::FETCH_COLUMN));
    $diasActivos = array_map(fn($dia) => $dia === 7 ? 0 : $dia, $diasBD);

    $condicionPeriodo = $habito["frecuencia"] === "semanal"
        ? "YEARWEEK(fecha_registro, 1) = YEARWEEK(CURDATE(), 1)"
        : "DATE(fecha_registro) = CURDATE()";

    $registros = $db->prepare("SELECT id_registro, valor_registrado, DATE_FORMAT(fecha_registro, '%h:%i %p') AS hora, fecha_registro FROM registros_habitos WHERE id_habito_usuario = :id_habito_usuario AND {$condicionPeriodo} ORDER BY fecha_registro DESC");
    $registros->execute([":id_habito_usuario" => $idHu]);
    $lista = $registros->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => [
            "id_habito" => (int) $habito["id_habito"],
            "id_habito_usuario" => $idHu,
            "objetivo" => (float) $habito["objetivo"],
            "unidad" => $habito["unidad"],
            "duracion_minutos" => $habito["duracion_minutos"] !== null ? (int) $habito["duracion_minutos"] : 15,
            "frecuencia" => $habito["frecuencia"],
            "fecha_inicio" => $habito["fecha_inicio"],
            "fecha_fin" => $habito["fecha_fin"],
            "dias_activos" => $diasActivos,
            "total_pausas" => count($lista),
            "registros" => $lista
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $error) {
    http_response_code(500);
    error_log("LifeSync salud_mental/read.php: " . $error->getMessage());
    echo json_encode(["success" => false, "message" => "No se pudieron cargar los datos de Salud Mental."], JSON_UNESCAPED_UNICODE);
}
