<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

function responderSalud(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (!isset($_SESSION["usuario_id"])) {
    responderSalud(["success" => false, "message" => "La sesión ha expirado."], 401);
}

$datos = json_decode(file_get_contents("php://input"), true);
$idHu = (int) ($datos["id_habito_usuario"] ?? 0);

try {
    $database = new Database();
    $db = $database->getConnection();
    $usuarioId = (int) $_SESSION["usuario_id"];

    if ($idHu <= 0) {
        $consulta = $db->prepare("SELECT hu.id_habito_usuario FROM habitos_usuario hu INNER JOIN habitos h ON h.id_habito = hu.id_habito INNER JOIN categorias c ON c.id_categoria = h.id_categoria WHERE hu.id_usuario = :id_usuario AND hu.activo = TRUE AND c.nombre = 'Salud Mental' LIMIT 1");
        $consulta->execute([":id_usuario" => $usuarioId]);
        $idHu = (int) ($consulta->fetchColumn() ?: 0);
    }

    if ($idHu <= 0) {
        responderSalud(["success" => false, "message" => "No tienes activo el hábito de Salud Mental."], 404);
    }

    $consulta = $db->prepare("SELECT hu.objetivo, hu.frecuencia FROM habitos_usuario hu INNER JOIN habitos h ON h.id_habito = hu.id_habito INNER JOIN categorias c ON c.id_categoria = h.id_categoria WHERE hu.id_habito_usuario = :id_habito_usuario AND hu.id_usuario = :id_usuario AND hu.activo = TRUE AND c.nombre = 'Salud Mental' LIMIT 1");
    $consulta->execute([":id_habito_usuario" => $idHu, ":id_usuario" => $usuarioId]);
    $habito = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$habito) {
        responderSalud(["success" => false, "message" => "El hábito de Salud Mental no está disponible."], 404);
    }

    $condicionPeriodo = $habito["frecuencia"] === "semanal"
        ? "YEARWEEK(fecha_registro, 1) = YEARWEEK(CURDATE(), 1)"
        : "DATE(fecha_registro) = CURDATE()";

    $consultaHoy = $db->prepare("SELECT COALESCE(SUM(valor_registrado), 0) FROM registros_habitos WHERE id_habito_usuario = :id_habito_usuario AND {$condicionPeriodo}");
    $consultaHoy->execute([":id_habito_usuario" => $idHu]);
    $progresoHoy = (float) $consultaHoy->fetchColumn();

    if ($progresoHoy >= (float) $habito["objetivo"]) {
        responderSalud(["success" => true, "message" => "La meta del periodo ya fue completada.", "completado" => true]);
    }

    $insertar = $db->prepare("INSERT INTO registros_habitos (id_habito, id_habito_usuario, valor_registrado, fecha_registro, observaciones) SELECT hu.id_habito, hu.id_habito_usuario, 1, NOW(), 'Pausa registrada desde Salud Mental' FROM habitos_usuario hu WHERE hu.id_habito_usuario = :id_habito_usuario AND hu.id_usuario = :id_usuario");
    $insertar->execute([":id_habito_usuario" => $idHu, ":id_usuario" => $usuarioId]);

    $nuevoProgreso = $progresoHoy + 1;
    $completado = $nuevoProgreso >= (float) $habito["objetivo"];

    $actualizarRacha = $db->prepare("UPDATE rachas SET total_completados = total_completados + 1, ultima_fecha = CURDATE() WHERE id_habito_usuario = :id_habito_usuario");
    $actualizarRacha->execute([":id_habito_usuario" => $idHu]);

    responderSalud([
        "success" => true,
        "message" => "¡Pausa registrada con éxito!",
        "id_habito_usuario" => $idHu,
        "progreso" => $nuevoProgreso,
        "completado" => $completado
    ]);
} catch (Throwable $error) {
    error_log("LifeSync salud_mental/create.php: " . $error->getMessage());
    responderSalud(["success" => false, "message" => "No se pudo registrar la pausa."], 500);
}
