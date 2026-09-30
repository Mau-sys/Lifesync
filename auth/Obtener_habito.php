<?php
// Limpiar cualquier salida previa para evitar corrupción de JSON
if (ob_get_length()) ob_clean();

session_start();
header('Content-Type: application/json; charset=utf-8');

// Compatibilidad de ruta
$rutaConexion = __DIR__ . '/../config/conexion.php';
if (!file_exists($rutaConexion)) {
    $rutaConexion = '../config/conexion.php';
}
require_once $rutaConexion;

try {
    if (empty($_SESSION['usuario_id'])) {
        http_response_code(401);
        echo json_encode(['exito' => false, 'mensaje' => 'Sesión no válida.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $usuarioId = (int) $_SESSION['usuario_id'];
    $idHabitoUsuario = isset($_GET['id_habito_usuario']) ? (int) $_GET['id_habito_usuario'] : (isset($_GET['id']) ? (int) $_GET['id'] : 0);
    $categoria = trim((string) ($_GET['categoria'] ?? ''));

    $database = new Database();
    $db = $database->getConnection();

    // Consulta base
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
            c.nombre AS categoria,
            c.nombre AS categoria_nombre
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
        $sql .= " AND c.nombre = 'Hábito Personalizado'";
    }

    $sql .= " ORDER BY hu.id_habito_usuario DESC LIMIT 1";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $habito = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$habito) {
        http_response_code(404);
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontró ningún hábito personalizado activo.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $idHU = (int) $habito['id_habito_usuario'];

    // 1. Obtener métricas acumuladas de hoy
    $stmtSum = $db->prepare("
        SELECT 
            COALESCE(SUM(valor_registrado), 0) AS suma_hoy, 
            COUNT(*) AS registros_hoy 
        FROM registros_habitos 
        WHERE id_habito_usuario = :id 
          AND DATE(fecha_registro) = CURDATE()
    ");
    $stmtSum->execute([':id' => $idHU]);
    $macheoHoy = $stmtSum->fetch(PDO::FETCH_ASSOC);

    $sumaHoy = (float) $macheoHoy['suma_hoy'];
    $registrosHoy = (int) $macheoHoy['registros_hoy'];

    // Determinar progreso según la unidad
    $unidad = mb_strtolower((string) $habito['unidad'], 'UTF-8');
    $esSesion = str_contains($unidad, 'sesion') || str_contains($unidad, 'registro') || str_contains($unidad, 'comida') || str_contains($unidad, 'pausa');
    $progresoHoy = $esSesion ? $registrosHoy : $sumaHoy;

    // 2. Obtener días configurados en la tabla habito_dias
    $stmtDias = $db->prepare("SELECT dia_semana FROM habito_dias WHERE id_habito_usuario = :id ORDER BY dia_semana ASC");
    $stmtDias->execute([':id' => $idHU]);
    $diasActivos = array_map('intval', $stmtDias->fetchAll(PDO::FETCH_COLUMN));

    // 3. Obtener racha del hábito
    $stmtRacha = $db->prepare("SELECT racha_actual, mejor_racha, total_completados, ultima_fecha FROM rachas WHERE id_habito_usuario = :id LIMIT 1");
    $stmtRacha->execute([':id' => $idHU]);
    $racha = $stmtRacha->fetch(PDO::FETCH_ASSOC) ?: [
        'racha_actual' => 0,
        'mejor_racha' => 0,
        'total_completados' => 0,
        'ultima_fecha' => null
    ];

    $objetivo = (float) $habito['objetivo'];
    $porcentaje = $objetivo > 0 ? min(100, round(($progresoHoy / $objetivo) * 100, 2)) : 0;

    // Construcción compatible del array de respuesta sin operador unpacking (...)
    $habitoRespuesta = array_merge($habito, [
        'objetivo' => $objetivo,
        'progreso_hoy' => $progresoHoy,
        'suma_hoy' => $sumaHoy,
        'registros_hoy' => $registrosHoy,
        'total_sesiones' => $registrosHoy,
        'porcentaje_hoy' => $porcentaje,
        'dias_activos' => $diasActivos
    ]);

    echo json_encode([
        'exito' => true,
        'habito' => $habitoRespuesta,
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