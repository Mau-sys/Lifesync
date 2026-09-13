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

    $sql = "DELETE r FROM registros_habitos r INNER JOIN habitos_usuario hu ON hu.id_habito_usuario = r.id_habito_usuario WHERE r.id_habito_usuario = :id AND hu.id_usuario = :usuario AND DATE(r.fecha_registro) = CURDATE()";
    $params = [':id' => $id, ':usuario' => (int) $_SESSION['usuario_id']];

    if ($observacion !== '') {
        $sql .= " AND r.observaciones = :observacion ORDER BY r.id_registro DESC LIMIT 1";
        $params[':observacion'] = $observacion;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    $db->prepare("DELETE FROM estadisticas_habitos WHERE id_habito_usuario = :id AND fecha = CURDATE()")->execute([':id' => $id]);

    echo json_encode(['exito' => true], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if (http_response_code() < 400) http_response_code(500);
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
