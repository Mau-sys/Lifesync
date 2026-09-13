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
    $idHabitoUsuario = (int) ($entrada['id_habito_usuario'] ?? 0);
    $valor = (float) ($entrada['valor'] ?? 0);
    $observaciones = trim((string) ($entrada['observaciones'] ?? ''));

    if ($idHabitoUsuario <= 0 || $valor <= 0) {
        http_response_code(400);
        throw new Exception('Datos de registro inválidos.');
    }

    $database = new Database();
    $db = $database->getConnection();
    $db->beginTransaction();

    $stmt = $db->prepare("SELECT hu.*, h.nombre_habito, c.nombre AS categoria FROM habitos_usuario hu INNER JOIN habitos h ON h.id_habito = hu.id_habito LEFT JOIN categorias c ON c.id_categoria = h.id_categoria WHERE hu.id_habito_usuario = :id AND hu.id_usuario = :usuario AND hu.activo = 1 LIMIT 1");
    $stmt->execute([':id' => $idHabitoUsuario, ':usuario' => (int) $_SESSION['usuario_id']]);
    $habito = $stmt->fetch();

    if (!$habito) {
        http_response_code(404);
        throw new Exception('Hábito no encontrado o deshabilitado.');
    }

    $hoy = date('Y-m-d');
    if ($habito['fecha_inicio'] > $hoy || ($habito['fecha_fin'] && $habito['fecha_fin'] < $hoy)) {
        http_response_code(400);
        throw new Exception('Este hábito no está activo en la fecha actual.');
    }

    $stmt = $db->prepare("INSERT INTO registros_habitos (id_habito_usuario, valor_registrado, fecha_registro, observaciones) VALUES (:id, :valor, NOW(), :obs)");
    $stmt->execute([
        ':id' => $idHabitoUsuario,
        ':valor' => $valor,
        ':obs' => $observaciones !== '' ? $observaciones : null
    ]);

    $stmt = $db->prepare("SELECT COALESCE(SUM(valor_registrado), 0) FROM registros_habitos WHERE id_habito_usuario = :id AND DATE(fecha_registro) = CURDATE()");
    $stmt->execute([':id' => $idHabitoUsuario]);
    $sumaHoy = (float) $stmt->fetchColumn();

    $stmt = $db->prepare("SELECT COUNT(*) FROM registros_habitos WHERE id_habito_usuario = :id AND DATE(fecha_registro) = CURDATE()");
    $stmt->execute([':id' => $idHabitoUsuario]);
    $registrosHoy = (int) $stmt->fetchColumn();

    $unidad = mb_strtolower((string) $habito['unidad'], 'UTF-8');
    $progresoHoy = str_contains($unidad, 'sesion') || str_contains($unidad, 'registro') || str_contains($unidad, 'comida') || str_contains($unidad, 'pausa')
        ? $registrosHoy
        : $sumaHoy;

    $objetivo = (float) $habito['objetivo'];
    $completado = $progresoHoy >= $objetivo;

    $stmt = $db->prepare("INSERT INTO estadisticas_habitos (id_habito_usuario, fecha, objetivo, progreso, porcentaje, completado) VALUES (:id, CURDATE(), :objetivo, :progreso, :porcentaje, :completado) ON DUPLICATE KEY UPDATE objetivo = VALUES(objetivo), progreso = VALUES(progreso), porcentaje = VALUES(porcentaje), completado = VALUES(completado)");
    $stmt->execute([
        ':id' => $idHabitoUsuario,
        ':objetivo' => $objetivo,
        ':progreso' => $progresoHoy,
        ':porcentaje' => $objetivo > 0 ? min(100, ($progresoHoy / $objetivo) * 100) : 0,
        ':completado' => $completado ? 1 : 0
    ]);

    $stmt = $db->prepare("SELECT racha_actual, mejor_racha, total_completados, ultima_fecha FROM rachas WHERE id_habito_usuario = :id FOR UPDATE");
    $stmt->execute([':id' => $idHabitoUsuario]);
    $racha = $stmt->fetch();

    if (!$racha) {
        $racha = [
            'racha_actual' => 0,
            'mejor_racha' => 0,
            'total_completados' => 0,
            'ultima_fecha' => null
        ];
        $db->prepare("INSERT INTO rachas (id_habito_usuario, racha_actual, mejor_racha, total_completados, ultima_fecha) VALUES (:id, 0, 0, 0, NULL)")->execute([':id' => $idHabitoUsuario]);
    }

    if ($completado && $racha['ultima_fecha'] !== $hoy) {
        $nuevaRacha = 1;
        if ($racha['ultima_fecha']) {
            $ayer = date('Y-m-d', strtotime('-1 day'));
            $nuevaRacha = $racha['ultima_fecha'] === $ayer ? ((int) $racha['racha_actual'] + 1) : 1;
        }

        $mejor = max((int) $racha['mejor_racha'], $nuevaRacha);
        $total = (int) $racha['total_completados'] + 1;

        $db->prepare("UPDATE rachas SET racha_actual = :actual, mejor_racha = :mejor, total_completados = :total, ultima_fecha = :fecha WHERE id_habito_usuario = :id")->execute([
            ':actual' => $nuevaRacha,
            ':mejor' => $mejor,
            ':total' => $total,
            ':fecha' => $hoy,
            ':id' => $idHabitoUsuario
        ]);

        $racha['racha_actual'] = $nuevaRacha;
        $racha['mejor_racha'] = $mejor;
        $racha['total_completados'] = $total;
        $racha['ultima_fecha'] = $hoy;
    }

    $db->commit();

    echo json_encode([
        'exito' => true,
        'registro' => [
            'valor' => $valor,
            'progreso_hoy' => $progresoHoy,
            'suma_hoy' => $sumaHoy,
            'registros_hoy' => $registrosHoy,
            'completado' => $completado
        ],
        'racha' => $racha
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    if (http_response_code() < 400) {
        http_response_code(500);
    }
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
