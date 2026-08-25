<?php
header("Content-Type: application/json; charset=UTF-8");
session_start();

require_once("../config/conexion.php");

try {
    $database = new Database();
    $db = $database->getConnection();

    // Obtener id de usuario en sesión o utilizar 1 por defecto para pruebas
    $id_usuario = $_SESSION['id_usuario'] ?? 1;

    // 1. Obtener o consultar el hábito activo de Salud Mental para el usuario
    $queryHabito = "SELECT id_habito, objetivo, unidad_medida 
                    FROM habitos 
                    WHERE id_usuario = :id_usuario 
                      AND (id_categoria = 3 OR nombre_habito = 'Salud Mental') 
                      AND activo = TRUE 
                    LIMIT 1";
                    
    $stmtHabito = $db->prepare($queryHabito);
    $stmtHabito->bindParam(":id_usuario", $id_usuario, PDO::PARAM_INT);
    $stmtHabito->execute();

    $habito = $stmtHabito->fetch(PDO::FETCH_ASSOC);

    // Si no existe un hábito de Salud Mental para este usuario, lo creamos dinámicamente
    if (!$habito) {
        $queryInsertHabito = "INSERT INTO habitos (id_usuario, id_categoria, nombre_habito, descripcion, tipo_medicion, objetivo, unidad_medida, frecuencia, fecha_inicio, activo) 
                              VALUES (:id_usuario, 3, 'Salud Mental', 'Pausas activas y descansos', 'cantidad', 2.00, '15', 'diaria', CURDATE(), TRUE)";
        $stmtInsert = $db->prepare($queryInsertHabito);
        $stmtInsert->bindParam(":id_usuario", $id_usuario, PDO::PARAM_INT);
        $stmtInsert->execute();

        $id_habito = $db->lastInsertId();
        $objetivo = 2;
        $duracion = 15;
    } else {
        $id_habito = (int)$habito['id_habito'];
        $objetivo = (int)$habito['objetivo'];
        $duracion = !empty($habito['unidad_medida']) ? (int)$habito['unidad_medida'] : 15;
    }

    // 2. Obtener los registros de pausas realizadas el día de hoy
    $queryRegistros = "SELECT id_registro, valor_registrado, DATE_FORMAT(fecha_registro, '%h:%i %p') AS hora 
                       FROM registros_habitos 
                       WHERE id_habito = :id_habito 
                         AND DATE(fecha_registro) = CURDATE() 
                       ORDER BY fecha_registro DESC";

    $stmtRegistros = $db->prepare($queryRegistros);
    $stmtRegistros->bindParam(":id_habito", $id_habito, PDO::PARAM_INT);
    $stmtRegistros->execute();

    $registros = $stmtRegistros->fetchAll(PDO::FETCH_ASSOC);
    $total_pausas = count($registros);

    echo json_encode([
        "success" => true,
        "data" => [
            "id_habito" => $id_habito,
            "objetivo" => $objetivo,
            "duracion_minutos" => $duracion,
            "total_pausas" => $total_pausas,
            "registros" => $registros
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión o consulta: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}