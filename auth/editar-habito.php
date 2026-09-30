<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

if (!isset($_SESSION["usuario_id"])) {
    http_response_code(401);
    echo json_encode(["exito" => false, "mensaje" => "La sesión ha expirado."], JSON_UNESCAPED_UNICODE);
    exit;
}

$datos = json_decode(file_get_contents("php://input"), true) ?: $_POST;
$idHabitoUsuario = (int) ($datos["id_habito_usuario"] ?? $datos["id"] ?? 0);
$usuarioId = (int) $_SESSION["usuario_id"];

if ($idHabitoUsuario <= 0) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "Hábito no válido."], JSON_UNESCAPED_UNICODE);
    exit;
}

$nombre = trim((string) ($datos["nombre_habito"] ?? $datos["nombre"] ?? ""));
$descripcion = trim((string) ($datos["descripcion"] ?? $datos["objetivo_texto"] ?? ""));
$objetivo = (float) ($datos["objetivo"] ?? 1);

// Normalizar Frecuencia
$frecuenciaRaw = strtolower(trim((string) ($datos["frecuencia"] ?? "diaria")));
if ($frecuenciaRaw === "diario" || $frecuenciaRaw === "diaria") {
    $frecuenciaBD = "diaria";
} elseif ($frecuenciaRaw === "semanal") {
    $frecuenciaBD = "semanal";
} elseif ($frecuenciaRaw === "mensual") {
    $frecuenciaBD = "mensual";
} else {
    $frecuenciaBD = "dias específicos";
}

// Aceptar variantes de arreglo de días
$diasEntrada = $datos["dias_activos"] ?? $datos["dias_semana"] ?? $datos["dias"] ?? null;

try {
    $database = new Database();
    $db = $database->getConnection();
    $db->beginTransaction();

    // Validar propiedad del hábito
    $stmtVer = $db->prepare("SELECT hu.id_habito FROM habitos_usuario hu WHERE hu.id_habito_usuario = :id_hu AND hu.id_usuario = :usuario LIMIT 1");
    $stmtVer->execute([":id_hu" => $idHabitoUsuario, ":usuario" => $usuarioId]);
    $idHabito = $stmtVer->fetchColumn();

    if (!$idHabito) {
        throw new Exception("No tienes permisos para editar este hábito.");
    }

    // 1. Actualizar habitos
    if ($nombre !== "") {
        $stmtH = $db->prepare("UPDATE habitos SET nombre_habito = :nombre, descripcion = :descr WHERE id_habito = :id_h");
        $stmtH->execute([":nombre" => $nombre, ":descr" => $descripcion, ":id_h" => $idHabito]);
    }

    // 2. Actualizar habitos_usuario
    $stmtHU = $db->prepare("UPDATE habitos_usuario SET objetivo = :objetivo, frecuencia = :frecuencia WHERE id_habito_usuario = :id_hu");
    $stmtHU->execute([":objetivo" => $objetivo, ":frecuencia" => $frecuenciaBD, ":id_hu" => $idHabitoUsuario]);

    // 3. Actualizar habito_dias
    if ($diasEntrada !== null) {
        $db->prepare("DELETE FROM habito_dias WHERE id_habito_usuario = :id_hu")->execute([":id_hu" => $idHabitoUsuario]);

        if ($frecuenciaBD === "dias específicos" && is_array($diasEntrada)) {
            $stmtIns = $db->prepare("INSERT INTO habito_dias (id_habito_usuario, dia_semana) VALUES (:id_hu, :dia)");
            foreach ($diasEntrada as $dia) {
                $diaInt = (int) $dia;
                if ($diaInt >= 1 && $diaInt <= 7) {
                    $stmtIns->execute([":id_hu" => $idHabitoUsuario, ":dia" => $diaInt]);
                }
            }
        }
    }

    $db->commit();
    echo json_encode(["exito" => true, "mensaje" => "Hábito actualizado correctamente."], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}