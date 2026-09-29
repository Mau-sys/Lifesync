<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/conexion.php';

try {
    if (empty($_SESSION['usuario_id'])) {
        http_response_code(401);
        throw new Exception('Sesión no válida.');
    }

    $entrada = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $id = (int) ($entrada['id_habito_usuario'] ?? 0);
    $observacion = trim((string) ($entrada['observaciones'] ?? ''));

    if ($id <= 0) {
        http_response_code(400);
        throw new Exception('Datos inválidos.');
    }

    $database = new Database();
    $db = $database->getConnection();
    $usuarioId = (int) $_SESSION['usuario_id'];

    // 1. Validar que el hábito pertenezca al usuario
    $stmtValidar = $db->prepare("SELECT id_habito_usuario, objetivo, unidad FROM habitos_usuario WHERE id_habito_usuario = :id AND id_usuario = :usuario AND activo = 1");
    $stmtValidar->execute([':id' => $id, ':usuario' => $usuarioId]);
    $habito = $stmtValidar->fetch(PDO::FETCH_ASSOC);

    if (!$habito) {
        http_response_code(403);
        throw new Exception('No tienes permiso sobre este hábito.');
    }

    $db->beginTransaction();

    if ($observacion !== '') {
        // Opción A: Borrar solo la última sesión/registro específico con esa observación
        $stmtSub = $db->prepare("SELECT id_registro FROM registros_habitos WHERE id_habito_usuario = :id AND DATE(fecha_registro) = CURDATE() AND observaciones = :obs ORDER BY id_registro DESC LIMIT 1");
        $stmtSub->execute([':id' => $id, ':obs' => $observacion]);
        $registroId = $stmtSub->fetchColumn();

        if ($registroId) {
            $stmtDel = $db->prepare("DELETE FROM registros_habitos WHERE id_registro = :id_reg");
            $stmtDel->execute([':id_reg' => $registroId]);
        }
    } else {
        // Opción B: Reiniciar el hábito completo del día de hoy
        $stmtDel = $db->prepare("DELETE FROM registros_habitos WHERE id_habito_usuario = :id AND DATE(fecha_registro) = CURDATE()");
        $stmtDel->execute([':id' => $id]);
    }

    // 2. Recalcular las estadísticas del día en lugar de destruirlas
    $stmtRecalc = $db->prepare("SELECT COALESCE(SUM(valor_registrado), 0) AS total_valor, COUNT(*) AS total_sesiones FROM registros_habitos WHERE id_habito_usuario = :id AND DATE(fecha_registro) = CURDATE()");
    $stmtRecalc->execute([':id' => $id]);
    $resumen = $stmtRecalc->fetch(PDO::FETCH_ASSOC);

    $esSesion = (strpos(mb_strtolower($habito['unidad']), 'sesion') !== false || strpos(mb_strtolower($habito['unidad']), 'registro') !== false);
    $progreso = $esSesion ? (float)$resumen['total_sesiones'] : (float)$resumen['total_valor'];
    $porcentaje = ($habito['objetivo'] > 0) ? min(100, round(($progreso / $habito['objetivo']) * 100, 2)) : 0;
    $completado = ($progreso >= $habito['objetivo']) ? 1 : 0;

    if ($progreso > 0) {
        // Quedan registros hoy: actualizar la fila con el nuevo valor parcial
        $stmtStat = $db->prepare("UPDATE estadisticas_habitos SET progreso = :progreso, porcentaje = :porcentaje, completado = :completado WHERE id_habito_usuario = :id AND fecha = CURDATE()");
        $stmtStat->execute([
            ':progreso' => $progreso,
            ':porcentaje' => $porcentaje,
            ':completado' => $completado,
            ':id' => $id
        ]);
    } else {
        // No quedan registros hoy: limpiar o resetear la estadística diaria
        $stmtStat = $db->prepare("DELETE FROM estadisticas_habitos WHERE id_habito_usuario = :id AND fecha = CURDATE()");
        $stmtStat->execute([':id' => $id]);
    }

    $db->commit();

    echo json_encode(['exito' => true, 'mensaje' => 'Registro actualizado correctamente.'], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    if (http_response_code() < 400) {
        http_response_code(500);
    }
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}