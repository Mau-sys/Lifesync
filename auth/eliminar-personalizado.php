<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

function responderEliminar(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION["usuario_id"])) {
    responderEliminar(["exito" => false, "mensaje" => "La sesión ha expirado."], 401);
}

$datos = json_decode(file_get_contents("php://input"), true);
$idHabitoUsuario = (int) ($datos["id_habito_usuario"] ?? 0);
$idHabito = (int) ($datos["id_habito"] ?? 0);

if ($idHabitoUsuario <= 0 && $idHabito <= 0) {
    responderEliminar(["exito" => false, "mensaje" => "No se indicó el hábito."], 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $usuarioId = (int) $_SESSION["usuario_id"];
    $db->beginTransaction();

    if ($idHabitoUsuario > 0) {
        $consulta = $db->prepare("SELECT hu.id_habito_usuario, hu.id_habito, h.es_base FROM habitos_usuario hu INNER JOIN habitos h ON h.id_habito = hu.id_habito INNER JOIN categorias c ON c.id_categoria = h.id_categoria WHERE hu.id_habito_usuario = :id_habito_usuario AND hu.id_usuario = :id_usuario AND c.nombre = 'Hábito Personalizado' LIMIT 1");
        $consulta->execute([":id_habito_usuario" => $idHabitoUsuario, ":id_usuario" => $usuarioId]);
    } else {
        $consulta = $db->prepare("SELECT hu.id_habito_usuario, hu.id_habito, h.es_base FROM habitos_usuario hu INNER JOIN habitos h ON h.id_habito = hu.id_habito INNER JOIN categorias c ON c.id_categoria = h.id_categoria WHERE hu.id_habito = :id_habito AND hu.id_usuario = :id_usuario AND c.nombre = 'Hábito Personalizado' LIMIT 1");
        $consulta->execute([":id_habito" => $idHabito, ":id_usuario" => $usuarioId]);
    }

    $habito = $consulta->fetch(PDO::FETCH_ASSOC);
    if (!$habito || (bool) $habito["es_base"]) {
        $db->rollBack();
        responderEliminar(["exito" => false, "mensaje" => "No se encontró el hábito personalizado."], 404);
    }

    $eliminarUsuario = $db->prepare("DELETE FROM habitos_usuario WHERE id_habito_usuario = :id_habito_usuario AND id_usuario = :id_usuario");
    $eliminarUsuario->execute([
        ":id_habito_usuario" => (int) $habito["id_habito_usuario"],
        ":id_usuario" => $usuarioId
    ]);

    $eliminarHabito = $db->prepare("DELETE FROM habitos WHERE id_habito = :id_habito AND es_base = FALSE");
    $eliminarHabito->execute([":id_habito" => (int) $habito["id_habito"]]);

    $db->commit();
    responderEliminar(["exito" => true, "mensaje" => "Hábito eliminado correctamente."]);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log("LifeSync auth/eliminar-personalizado.php: " . $error->getMessage());
    responderEliminar(["exito" => false, "mensaje" => "Ocurrió un error al eliminar el hábito."], 500);
}
