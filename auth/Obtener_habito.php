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
    $idHabitoUsuario = (int) ($_GET['id_habito_usuario'] ?? 0);
    $categoria = trim((string) ($_GET['categoria'] ?? ''));

    $database = new Database();
    $db = $database->getConnection();

    // Consulta base para obtener el hábito del usuario
    $sql = "SELECT hu.*, h.nombre_habito, c.nombre AS categoria_nombre 
            FROM habitos_usuario hu 
            INNER JOIN habitos h ON h.id_habito = hu.id_habito 
            LEFT JOIN categorias c ON c.id_categoria = h.id_categoria 
            WHERE hu.id_usuario = :usuario AND hu.activo = 1 ";

    $params = [':usuario' => $usuarioId];

    if ($idHabitoUsuario > 0) {
        $sql .= "AND hu.id_habito_usuario = :id LIMIT 1";
        $params[':id'] = $idHabitoUsuario;
    } elseif ($categoria !== '') {
        $sql .= "AND c.nombre = :categoria LIMIT 1";
        $params[':categoria'] = $categoria;
    } else {
        http_response_code(400);
        throw new Exception('Parámetros insuficientes para obtener el hábito.');
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $habito = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$habito) {
        http_response_code(404);
        throw new Exception('Hábito no encontrado.');
    }

    $idHU = (int) $habito['id_habito_usuario'];

    // Obtener suma de valor y total de registros hechos HOY
    $stmtSum = $db->prepare("SELECT COALESCE(SUM(valor_registrado), 0) AS suma_hoy, COUNT(*) AS registros_hoy FROM registros_habitos WHERE id_habito_usuario = :id AND DATE(fecha_registro) = CURDATE()");
    $stmtSum->execute([':id' => $idHU]);
    $macheoHoy = $stmtSum->fetch(PDO::FETCH_ASSOC);

    $habito['suma_hoy'] = (float) $macheoHoy['suma_hoy'];
    $habito['total_sesiones'] = (int) $macheoHoy['registros_hoy'];
    $habito['registros_hoy'] = (int) $macheoHoy['registros_hoy'];

    // Obtener días configurados si la frecuencia es 'dias específicos' o personalizada
    $stmtDias = $db->prepare("SELECT dia_semana FROM habito_dias WHERE id_habito_usuario = :id ORDER BY dia_semana ASC");
    $stmtDias->execute([':id' => $idHU]);
    $habito['dias_activos'] = $stmtDias->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'exito' => true,
        'habito' => $habito
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    if (http_response_code() < 400) {
        http_response_code(500);
    }
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}