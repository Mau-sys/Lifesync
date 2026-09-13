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

    $stmt = $db->prepare("DELETE FROM registros_habitos WHERE id_habito_usuario = :id AND EXISTS (SELECT 1 FROM habitos_usuario WHERE id_habito_usuario = :id AND id_usuario = :usuario)");
    $stmt->execute([':id' => $id, ':usuario' => (int) $_SESSION['usuario_id']]);

    $db->prepare("DELETE FROM estadisticas_habitos WHERE id_habito_usuario = :id AND fecha = CURDATE()")->execute([':id' => $id]);

    echo json_encode(['exito' => true], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if (http_response_code() < 400) {
        http_response_code(500);
    }
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
