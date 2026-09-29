<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/conexion.php';

try {
    if (empty($_SESSION['usuario_id'])) {
        http_response_code(401);
        throw new Exception('Sesión no válida.');
    }

    $usuarioId = (int) $_SESSION['usuario_id'];
    $entrada   = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $idHabitoUsuario = (int) ($entrada['id_habito_usuario'] ?? 0);
    $valorRegistrado = isset($entrada['valor_registrado']) ? (float)$entrada['valor_registrado'] : 1.0;
    $observaciones   = trim((string)($entrada['observaciones'] ?? ''));

    if ($idHabitoUsuario <= 0 || $valorRegistrado <= 0) {
        http_response_code(400);
        throw new Exception('Datos de registro no válidos.');
    }

    $database = new Database();
    $db = $database->getConnection();

    // 1. Obtener la información del hábito
    $stmtHabito = $db->prepare("
        SELECT hu.*, h.nombre_habito 
        FROM habitos_usuario hu
        INNER JOIN habitos h ON h.id_habito = hu.id_habito
        WHERE hu.id_habito_usuario = :id 
          AND hu.id_usuario = :usuario 
          AND hu.activo = 1
        LIMIT 1
    ");
    $stmtHabito->execute([':id' => $idHabitoUsuario, ':usuario' => $usuarioId]);
    $habito = $stmtHabito->fetch(PDO::FETCH_ASSOC);

    if (!$habito) {
        http_response_code(404);
        throw new Exception('El hábito no existe o no está activo.');
    }

    // ----------------------------------------------------------------------
    // VALIDACIÓN: Verificar si hoy es un día permitido para registrar
    // ----------------------------------------------------------------------
    $frecuencia = mb_strtolower(trim($habito['frecuencia']), 'UTF-8');

    if ($frecuencia === 'dias específicos' || $frecuencia === 'personalizada' || $frecuencia === 'personalizado') {
        // En PHP: date('N') devuelve 1 para Lunes y 7 para Domingo
        $diaHoy = (int) date('N');

        $stmtDia = $db->prepare("
            SELECT COUNT(*) 
            FROM habito_dias 
            WHERE id_habito_usuario = :id 
              AND dia_semana = :dia
        ");
        $stmtDia->execute([':id' => $idHabitoUsuario, ':dia' => $diaHoy]);
        $diaPermitido = (int) $stmtDia->fetchColumn();

        if ($diaPermitido === 0) {
            $nombresDias = [
                1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles',
                4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo'
            ];
            $nombreDiaHoy = $nombresDias[$diaHoy] ?? 'hoy';

            http_response_code(400);
            throw new Exception("No puedes registrar sesiones los días {$nombreDiaHoy} porque este día no está activo en la configuración de tu hábito.");
        }
    }

    $db->beginTransaction();

    // 2. Insertar el registro individual
    $stmtInsert = $db->prepare("
        INSERT INTO registros_habitos (id_habito_usuario, fecha_registro, valor_registrado, observaciones)
        VALUES (:id, NOW(), :valor, :obs)
    ");
    $stmtInsert->execute([
        ':id'    => $idHabitoUsuario,
        ':valor' => $valorRegistrado,
        ':obs'   => $observaciones !== '' ? $observaciones : null
    ]);

    // 3. Recalcular el progreso del día de hoy
    $stmtSum = $db->prepare("
        SELECT COALESCE(SUM(valor_registrado), 0) AS suma_hoy, COUNT(*) AS registros_hoy 
        FROM registros_habitos 
        WHERE id_habito_usuario = :id AND DATE(fecha_registro) = CURDATE()
    ");
    $stmtSum->execute([':id' => $idHabitoUsuario]);
    $macheo = $stmtSum->fetch(PDO::FETCH_ASSOC);

    $sumaHoy      = (float) $macheo['suma_hoy'];
    $registrosHoy = (int) $macheo['registros_hoy'];

    $unidad = mb_strtolower(trim($habito['unidad']), 'UTF-8');
    $esPorSesiones = (strpos($unidad, 'sesion') !== false || strpos($unidad, 'registro') !== false);

    $progresoHoy = $esPorSesiones ? $registrosHoy : $sumaHoy;
    $objetivo    = (float) $habito['objetivo'];

    $porcentaje = ($objetivo > 0) ? min(100, round(($progresoHoy / $objetivo) * 100, 2)) : 0;
    $completado = ($progresoHoy >= $objetivo) ? 1 : 0;

    // 4. Actualizar o insertar en estadisticas_habitos
    $stmtStatCheck = $db->prepare("SELECT id_estadistica FROM estadisticas_habitos WHERE id_habito_usuario = :id AND fecha = CURDATE() LIMIT 1");
    $stmtStatCheck->execute([':id' => $idHabitoUsuario]);
    $estadisticaExistente = $stmtStatCheck->fetchColumn();

    if ($estadisticaExistente) {
        $stmtStatUpdate = $db->prepare("
            UPDATE estadisticas_habitos 
            SET progreso = :progreso, porcentaje = :porcentaje, completado = :completado
            WHERE id_estadistica = :id_est
        ");
        $stmtStatUpdate->execute([
            ':progreso'   => $progresoHoy,
            ':porcentaje' => $porcentaje,
            ':completado' => $completado,
            ':id_est'     => $estadisticaExistente
        ]);
    } else {
        $stmtStatInsert = $db->prepare("
            INSERT INTO estadisticas_habitos (id_habito_usuario, fecha, progreso, porcentaje, completado)
            VALUES (:id, CURDATE(), :progreso, :porcentaje, :completado)
        ");
        $stmtStatInsert->execute([
            ':id'         => $idHabitoUsuario,
            ':progreso'   => $progresoHoy,
            ':porcentaje' => $porcentaje,
            ':completado' => $completado
        ]);
    }

    $db->commit();

    echo json_encode([
        'exito'      => true,
        'mensaje'    => 'Sesión registrada correctamente.',
        'progreso'   => $progresoHoy,
        'porcentaje' => $porcentaje,
        'completado' => (bool) $completado
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    if (http_response_code() < 400) {
        http_response_code(500);
    }
    echo json_encode([
        'exito'   => false,
        'mensaje' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}