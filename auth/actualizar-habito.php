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

    $stmt = $db->prepare("SELECT hu.* FROM habitos_usuario hu WHERE hu.id_habito_usuario = :id AND hu.id_usuario = :usuario LIMIT 1");
    $stmt->execute([':id' => $id, ':usuario' => (int) $_SESSION['usuario_id']]);
    $actual = $stmt->fetch();

    if (!$actual) {
        http_response_code(404);
        throw new Exception('Hábito no encontrado.');
    }

    $campos = [];
    $params = [':id' => $id];

    $permitidos = [
        'objetivo' => 'objetivo',
        'unidad' => 'unidad',
        'frecuencia' => 'frecuencia',
        'duracion_minutos' => 'duracion_minutos',
        'fecha_inicio' => 'fecha_inicio',
        'fecha_fin' => 'fecha_fin',
        'activo' => 'activo'
    ];

    foreach ($permitidos as $entradaKey => $columna) {
        if (array_key_exists($entradaKey, $entrada)) {
            $campos[] = "$columna = :$entradaKey";
            $params[":$entradaKey"] = $entrada[$entradaKey] === '' ? null : $entrada[$entradaKey];
        }
    }

    if (isset($entrada['frecuencia'])) {
        if ($entrada['frecuencia'] === 'diario') $entrada['frecuencia'] = 'diaria';
        if ($entrada['frecuencia'] === 'personalizado') $entrada['frecuencia'] = 'personalizada';
    }

    if (isset($entrada['frecuencia'])) {
        $params[':frecuencia'] = $entrada['frecuencia'];
    }

    if (!$campos) {
        echo json_encode(['exito' => true, 'mensaje' => 'Sin cambios.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $db->beginTransaction();

    $stmt = $db->prepare("UPDATE habitos_usuario SET " . implode(', ', $campos) . " WHERE id_habito_usuario = :id AND id_usuario = :usuario");
    $params[':usuario'] = (int) $_SESSION['usuario_id'];
    $stmt->execute($params);

    if (array_key_exists('dias', $entrada)) {
        $db->prepare("DELETE FROM habito_dias WHERE id_habito_usuario = :id")->execute([':id' => $id]);
        $dias = is_array($entrada['dias']) ? $entrada['dias'] : [];
        $insert = $db->prepare("INSERT INTO habito_dias (id_habito_usuario, dia_semana) VALUES (:id, :dia)");
        foreach ($dias as $dia) {
            $dia = (int) $dia;
            if ($dia >= 1 && $dia <= 7) {
                $insert->execute([':id' => $id, ':dia' => $dia]);
            }
        }
    }

    $db->commit();

    echo json_encode(['exito' => true, 'mensaje' => 'Hábito actualizado correctamente.'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    if (http_response_code() < 400) {
        http_response_code(500);
    }
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
