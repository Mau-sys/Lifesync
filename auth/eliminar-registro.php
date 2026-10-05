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

    if ($id <= 0) {
        http_response_code(400);
        throw new Exception('Hábito inválido.');
    }

    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->prepare("
        DELETE rh 
        FROM registros_habitos rh
        INNER JOIN habitos_usuario hu ON rh.id_habito_usuario = hu.id_habito_usuario
        WHERE rh.id_habito_usuario = :id 
          AND hu.id_usuario = :usuario 
          AND DATE(rh.fecha_registro) = CURDATE()
    ");
    
    $stmt->execute([
        ':id' => $id, 
        ':usuario' => (int) $_SESSION['usuario_id']
    ]);

    $stmtStats = $db->prepare("
        DELETE FROM estadisticas_habitos 
        WHERE id_habito_usuario = :id 
          AND fecha = CURDATE()
    ");
    $stmtStats->execute([':id' => $id]);

    echo json_encode(['exito' => true, 'mensaje' => 'Registros de hoy eliminados correctamente.'], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    if (http_response_code() < 400) {
        http_response_code(500);
    }
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}