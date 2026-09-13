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
    $idHabitoUsuario = isset($_GET['id_habito_usuario']) ? (int) $_GET['id_habito_usuario'] : 0;
    $categoria = trim($_GET['categoria'] ?? '');

    $database = new Database();
    $db = $database->getConnection();

    $sql = "
        SELECT
            hu.id_habito_usuario,
            hu.id_habito,
            hu.objetivo,
            hu.unidad,
            hu.frecuencia,
            hu.duracion_minutos,
            hu.fecha_inicio,
            hu.fecha_fin,
            hu.activo,
            h.nombre_habito,
            h.descripcion,
            h.es_base,
            h.color,
            h.imagen_url,
            c.id_categoria,
            c.nombre AS categoria
        FROM habitos_usuario hu
        INNER JOIN habitos h ON h.id_habito = hu.id_habito
        LEFT JOIN categorias c ON c.id_categoria = h.id_categoria
        WHERE hu.id_usuario = :usuario
          AND hu.activo = 1
    ";

    $params = [':usuario' => $usuarioId];

    if ($idHabitoUsuario > 0) {
        $sql .= " AND hu.id_habito_usuario = :id_habito_usuario";
        $params[':id_habito_usuario'] = $idHabitoUsuario;
    } elseif ($categoria !== '') {
        $sql .= " AND c.nombre = :categoria";
        $params[':categoria'] = $categoria;
    } else {
        http_response_code(400);
        throw new Exception('Debes indicar el hábito o la categoría.');
    }

    $sql .= " ORDER BY hu.id_habito_usuario DESC LIMIT 1";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $habito = $stmt->fetch();

    if (!$habito) {
        http_response_code(404);
        throw new Exception('No tienes este hábito activo.');
    }

    $stmt = $db->prepare("SELECT COALESCE(SUM(valor_registrado), 0) FROM registros_habitos WHERE id_habito_usuario = :id AND DATE(fecha_registro) = CURDATE()");
    $stmt->execute([':id' => $habito['id_habito_usuario']]);
    $sumaHoy = (float) $stmt->fetchColumn();

    $stmt = $db->prepare("SELECT COUNT(*) FROM registros_habitos WHERE id_habito_usuario = :id AND DATE(fecha_registro) = CURDATE()");
    $stmt->execute([':id' => $habito['id_habito_usuario']]);
    $registrosHoy = (int) $stmt->fetchColumn();

    $unidad = mb_strtolower((string) $habito['unidad'], 'UTF-8');
    $progresoHoy = str_contains($unidad, 'sesion') || str_contains($unidad, 'registro') || str_contains($unidad, 'comida') || str_contains($unidad, 'pausa')
        ? $registrosHoy
        : $sumaHoy;

    $stmt = $db->prepare("SELECT dia_semana FROM habito_dias WHERE id_habito_usuario = :id ORDER BY dia_semana");
    $stmt->execute([':id' => $habito['id_habito_usuario']]);
    $diasActivos = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));

    $stmt = $db->prepare("SELECT racha_actual, mejor_racha, total_completados, ultima_fecha FROM rachas WHERE id_habito_usuario = :id LIMIT 1");
    $stmt->execute([':id' => $habito['id_habito_usuario']]);
    $racha = $stmt->fetch() ?: [
        'racha_actual' => 0,
        'mejor_racha' => 0,
        'total_completados' => 0,
        'ultima_fecha' => null
    ];

    $objetivo = (float) $habito['objetivo'];
    $porcentaje = $objetivo > 0 ? min(100, round(($progresoHoy / $objetivo) * 100, 2)) : 0;

    echo json_encode([
        'exito' => true,
        'habito' => [
            ...$habito,
            'objetivo' => $objetivo,
            'progreso_hoy' => $progresoHoy,
            'suma_hoy' => $sumaHoy,
            'registros_hoy' => $registrosHoy,
            'porcentaje_hoy' => $porcentaje,
            'dias_activos' => $diasActivos
        ],
        'racha' => $racha
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if (http_response_code() < 400) {
        http_response_code(500);
    }
    echo json_encode([
        'exito' => false,
        'mensaje' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
