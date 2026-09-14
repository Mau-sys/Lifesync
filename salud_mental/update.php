<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

function responderActualizarSalud(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (!isset($_SESSION["usuario_id"])) {
    responderActualizarSalud(["success" => false, "message" => "La sesión ha expirado."], 401);
}

$datos = json_decode(file_get_contents("php://input"), true);
if (!is_array($datos)) {
    responderActualizarSalud(["success" => false, "message" => "Los datos enviados no son válidos."], 400);
}

$idHu = (int) ($datos["id_habito_usuario"] ?? 0);
$objetivo = (int) ($datos["objetivo"] ?? 0);
$duracion = (int) ($datos["duracion_minutos"] ?? 0);
$frecuencia = trim($datos["frecuencia"] ?? "diaria");
$dias = $datos["dias_activos"] ?? [];

if ($idHu <= 0 || $objetivo < 1 || $objetivo > 50 || $duracion < 1 || $duracion > 240) {
    responderActualizarSalud(["success" => false, "message" => "Los valores de configuración no son válidos."], 400);
}

if ($frecuencia === "personalizado") {
    $frecuencia = "personalizada";
}
if (!in_array($frecuencia, ["diaria", "semanal", "personalizada"], true)) {
    responderActualizarSalud(["success" => false, "message" => "La frecuencia seleccionada no es válida."], 400);
}
if (!is_array($dias)) {
    responderActualizarSalud(["success" => false, "message" => "Los días seleccionados no son válidos."], 400);
}

$dias = array_values(array_unique(array_map("intval", $dias)));
foreach ($dias as $dia) {
    if ($dia < 0 || $dia > 6) {
        responderActualizarSalud(["success" => false, "message" => "Los días seleccionados no son válidos."], 400);
    }
}
if ($frecuencia === "personalizada" && count($dias) === 0) {
    responderActualizarSalud(["success" => false, "message" => "Selecciona al menos un día activo."], 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $usuarioId = (int) $_SESSION["usuario_id"];

    $comprobar = $db->prepare("SELECT hu.id_habito_usuario FROM habitos_usuario hu INNER JOIN habitos h ON h.id_habito = hu.id_habito INNER JOIN categorias c ON c.id_categoria = h.id_categoria WHERE hu.id_habito_usuario = :id_habito_usuario AND hu.id_usuario = :id_usuario AND hu.activo = TRUE AND c.nombre = 'Salud Mental' LIMIT 1");
    $comprobar->execute([":id_habito_usuario" => $idHu, ":id_usuario" => $usuarioId]);
    if (!$comprobar->fetchColumn()) {
        responderActualizarSalud(["success" => false, "message" => "El hábito de Salud Mental no está disponible."], 404);
    }

    $db->beginTransaction();

    $actualizar = $db->prepare("UPDATE habitos_usuario SET objetivo = :objetivo, unidad = 'sesiones', frecuencia = :frecuencia, duracion_minutos = :duracion WHERE id_habito_usuario = :id_habito_usuario AND id_usuario = :id_usuario");
    $actualizar->execute([
        ":objetivo" => $objetivo,
        ":frecuencia" => $frecuencia,
        ":duracion" => $duracion,
        ":id_habito_usuario" => $idHu,
        ":id_usuario" => $usuarioId
    ]);

    $db->prepare("DELETE FROM habito_dias WHERE id_habito_usuario = :id_habito_usuario")->execute([":id_habito_usuario" => $idHu]);

    if ($frecuencia === "personalizada") {
        $insertarDia = $db->prepare("INSERT INTO habito_dias (id_habito_usuario, dia_semana) VALUES (:id_habito_usuario, :dia_semana)");
        foreach ($dias as $dia) {
            $diaBD = $dia === 0 ? 7 : $dia;
            $insertarDia->execute([":id_habito_usuario" => $idHu, ":dia_semana" => $diaBD]);
        }
    }

    $db->commit();
    responderActualizarSalud(["success" => true, "message" => "Configuración actualizada correctamente."]);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log("LifeSync salud_mental/update.php: " . $error->getMessage());
    responderActualizarSalud(["success" => false, "message" => "No se pudo actualizar la configuración."], 500);
}
