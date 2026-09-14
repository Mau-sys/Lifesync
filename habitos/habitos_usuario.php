<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

function responderHabitos(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (!isset($_SESSION["usuario_id"])) {
    responderHabitos(["exito" => false, "mensaje" => "La sesión ha expirado."], 401);
}

$usuarioId = (int) $_SESSION["usuario_id"];
$metodo = $_SERVER["REQUEST_METHOD"];

try {
    $database = new Database();
    $db = $database->getConnection();

    if ($metodo === "GET") {
        $consulta = $db->prepare("SELECT hu.id_habito_usuario, hu.id_habito, h.nombre_habito, h.descripcion, h.imagen_url, h.es_base, c.nombre AS categoria, hu.activo, hu.objetivo, hu.unidad, hu.frecuencia, hu.duracion_minutos, hu.fecha_inicio, hu.fecha_fin, COALESCE(SUM(CASE WHEN DATE(r.fecha_registro) = CURDATE() THEN r.valor_registrado ELSE 0 END), 0) AS progreso_hoy FROM habitos_usuario hu INNER JOIN habitos h ON h.id_habito = hu.id_habito LEFT JOIN categorias c ON c.id_categoria = h.id_categoria LEFT JOIN registros_habitos r ON r.id_habito_usuario = hu.id_habito_usuario WHERE hu.id_usuario = :id_usuario GROUP BY hu.id_habito_usuario, hu.id_habito, h.nombre_habito, h.descripcion, h.imagen_url, h.es_base, c.nombre, hu.activo, hu.objetivo, hu.unidad, hu.frecuencia, hu.duracion_minutos, hu.fecha_inicio, hu.fecha_fin ORDER BY hu.activo DESC, hu.id_habito_usuario DESC");
        $consulta->execute([":id_usuario" => $usuarioId]);
        $habitos = $consulta->fetchAll(PDO::FETCH_ASSOC);

        $consultaDias = $db->prepare("SELECT dia_semana FROM habito_dias WHERE id_habito_usuario = :id_habito_usuario ORDER BY dia_semana");

        foreach ($habitos as &$habito) {
            $idHu = (int) $habito["id_habito_usuario"];
            $consultaDias->execute([":id_habito_usuario" => $idHu]);
            $habito["dias"] = array_map("intval", $consultaDias->fetchAll(PDO::FETCH_COLUMN));
            $habito["id_habito_usuario"] = $idHu;
            $habito["id_habito"] = (int) $habito["id_habito"];
            $habito["activo"] = (bool) $habito["activo"];
            $habito["objetivo"] = (float) $habito["objetivo"];
            $habito["progreso"] = (float) $habito["progreso_hoy"];
            $habito["icono"] = $habito["imagen_url"] ?: "img/Categoria.png";
            unset($habito["progreso_hoy"]);
        }
        unset($habito);

        responderHabitos(["exito" => true, "datos" => $habitos]);
    }

    if ($metodo === "POST") {
        $datos = json_decode(file_get_contents("php://input"), true);
        if (!is_array($datos)) {
            responderHabitos(["exito" => false, "mensaje" => "Los datos enviados no son válidos."], 400);
        }

        $idHabito = (int) ($datos["id_habito"] ?? 0);
        $objetivo = (float) ($datos["objetivo"] ?? 0);
        $unidad = trim($datos["unidad"] ?? "");
        $frecuencia = trim($datos["frecuencia"] ?? "diaria");
        $duracion = isset($datos["duracion_minutos"]) && $datos["duracion_minutos"] !== "" ? (int) $datos["duracion_minutos"] : null;
        $fechaInicio = trim($datos["fecha_inicio"] ?? date("Y-m-d"));
        $fechaFin = trim($datos["fecha_fin"] ?? "");
        $dias = $datos["dias"] ?? [];

        if ($idHabito <= 0 || $objetivo <= 0 || $unidad === "") {
            responderHabitos(["exito" => false, "mensaje" => "Completa los datos obligatorios del hábito."], 400);
        }

        $frecuencia = $frecuencia === "diario" ? "diaria" : ($frecuencia === "personalizado" ? "personalizada" : $frecuencia);
        $permitidas = ["diaria", "semanal", "personalizada", "mensual"];
        if (!in_array($frecuencia, $permitidas, true)) {
            responderHabitos(["exito" => false, "mensaje" => "La frecuencia seleccionada no es válida."], 400);
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaInicio)) {
            responderHabitos(["exito" => false, "mensaje" => "La fecha de inicio no es válida."], 400);
        }
        $fechaFin = $fechaFin !== "" ? $fechaFin : null;
        if ($fechaFin !== null && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaFin)) {
            responderHabitos(["exito" => false, "mensaje" => "La fecha de finalización no es válida."], 400);
        }
        if ($duracion !== null && $duracion <= 0) {
            responderHabitos(["exito" => false, "mensaje" => "La duración debe ser mayor que cero."], 400);
        }
        if (!is_array($dias)) {
            responderHabitos(["exito" => false, "mensaje" => "Los días seleccionados no son válidos."], 400);
        }

        $dias = array_values(array_unique(array_map("intval", $dias)));
        foreach ($dias as $dia) {
            if ($dia < 0 || $dia > 6) {
                responderHabitos(["exito" => false, "mensaje" => "Los días seleccionados no son válidos."], 400);
            }
        }

        $db->beginTransaction();

        $comprobar = $db->prepare("SELECT id_habito_usuario FROM habitos_usuario WHERE id_usuario = :id_usuario AND id_habito = :id_habito LIMIT 1");
        $comprobar->execute([":id_usuario" => $usuarioId, ":id_habito" => $idHabito]);
        $existente = $comprobar->fetch(PDO::FETCH_ASSOC);

        if ($existente) {
            $actualizar = $db->prepare("UPDATE habitos_usuario SET activo = TRUE, objetivo = :objetivo, unidad = :unidad, frecuencia = :frecuencia, duracion_minutos = :duracion, fecha_inicio = :fecha_inicio, fecha_fin = :fecha_fin WHERE id_habito_usuario = :id_habito_usuario AND id_usuario = :id_usuario");
            $actualizar->execute([
                ":objetivo" => $objetivo,
                ":unidad" => $unidad,
                ":frecuencia" => $frecuencia,
                ":duracion" => $duracion,
                ":fecha_inicio" => $fechaInicio,
                ":fecha_fin" => $fechaFin,
                ":id_habito_usuario" => (int) $existente["id_habito_usuario"],
                ":id_usuario" => $usuarioId
            ]);
            $idHu = (int) $existente["id_habito_usuario"];
        } else {
            $insertar = $db->prepare("INSERT INTO habitos_usuario (id_usuario, id_habito, activo, objetivo, unidad, frecuencia, duracion_minutos, fecha_inicio, fecha_fin) VALUES (:id_usuario, :id_habito, TRUE, :objetivo, :unidad, :frecuencia, :duracion, :fecha_inicio, :fecha_fin)");
            $insertar->execute([
                ":id_usuario" => $usuarioId,
                ":id_habito" => $idHabito,
                ":objetivo" => $objetivo,
                ":unidad" => $unidad,
                ":frecuencia" => $frecuencia,
                ":duracion" => $duracion,
                ":fecha_inicio" => $fechaInicio,
                ":fecha_fin" => $fechaFin
            ]);
            $idHu = (int) $db->lastInsertId();

            $racha = $db->prepare("INSERT INTO rachas (id_habito_usuario, racha_actual, mejor_racha, total_completados, ultima_fecha) VALUES (:id_habito_usuario, 0, 0, 0, NULL)");
            $racha->execute([":id_habito_usuario" => $idHu]);
        }

        $db->prepare("DELETE FROM habito_dias WHERE id_habito_usuario = :id_habito_usuario")->execute([":id_habito_usuario" => $idHu]);

        if ($frecuencia === "personalizada") {
            if (count($dias) === 0) {
                $db->rollBack();
                responderHabitos(["exito" => false, "mensaje" => "Selecciona al menos un día para la frecuencia personalizada."], 400);
            }

            $insertarDia = $db->prepare("INSERT INTO habito_dias (id_habito_usuario, dia_semana) VALUES (:id_habito_usuario, :dia_semana)");
            foreach ($dias as $dia) {
                $diaBD = $dia === 0 ? 7 : $dia;
                $insertarDia->execute([":id_habito_usuario" => $idHu, ":dia_semana" => $diaBD]);
            }
        }

        $db->commit();
        responderHabitos(["exito" => true, "mensaje" => "Hábito registrado correctamente.", "id_habito_usuario" => $idHu]);
    }

    if ($metodo === "PUT") {
        $datos = json_decode(file_get_contents("php://input"), true);
        $idHu = (int) ($datos["id_habito_usuario"] ?? 0);
        $activo = isset($datos["activo"]) ? (bool) $datos["activo"] : null;
        if ($idHu <= 0 || $activo === null) {
            responderHabitos(["exito" => false, "mensaje" => "Datos inválidos."], 400);
        }
        $consulta = $db->prepare("UPDATE habitos_usuario SET activo = :activo WHERE id_habito_usuario = :id_habito_usuario AND id_usuario = :id_usuario");
        $consulta->execute([
            ":activo" => $activo ? 1 : 0,
            ":id_habito_usuario" => $idHu,
            ":id_usuario" => $usuarioId
        ]);
        responderHabitos(["exito" => true, "mensaje" => "Estado del hábito actualizado."]);
    }

    if ($metodo === "DELETE") {
        $datos = json_decode(file_get_contents("php://input"), true);
        $idHu = (int) ($datos["id_habito_usuario"] ?? 0);
        if ($idHu <= 0) {
            responderHabitos(["exito" => false, "mensaje" => "Hábito inválido."], 400);
        }
        $consulta = $db->prepare("DELETE FROM habitos_usuario WHERE id_habito_usuario = :id_habito_usuario AND id_usuario = :id_usuario");
        $consulta->execute([
            ":id_habito_usuario" => $idHu,
            ":id_usuario" => $usuarioId
        ]);
        responderHabitos(["exito" => true, "mensaje" => "Hábito eliminado correctamente."]);
    }

    responderHabitos(["exito" => false, "mensaje" => "Método HTTP no permitido."], 405);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log("LifeSync habitos/habitos_usuario.php: " . $error->getMessage());
    responderHabitos(["exito" => false, "mensaje" => "Ocurrió un error al gestionar los hábitos."], 500);
}
