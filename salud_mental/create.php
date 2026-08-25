<?php
header("Content-Type: application/json; charset=UTF-8");
session_start();

require_once("../config/conexion.php");

try {
    $database = new Database();
    $db = $database->getConnection();

    $id_usuario = $_SESSION['id_usuario'] ?? 1;

    // Obtener los datos JSON enviados en la petición
    $input = json_decode(file_get_contents("php://input"), true);
    $id_habito = isset($input['id_habito']) ? intval($input['id_habito']) : null;

    // Validar ID del hábito o buscarlo en la base de datos
    if (!$id_habito) {
        $queryHabito = "SELECT id_habito FROM habitos 
                        WHERE id_usuario = :id_usuario 
                          AND (id_categoria = 3 OR nombre_habito = 'Salud Mental') 
                          AND activo = TRUE 
                        LIMIT 1";
        $stmtHabito = $db->prepare($queryHabito);
        $stmtHabito->bindParam(":id_usuario", $id_usuario, PDO::PARAM_INT);
        $stmtHabito->execute();
        $row = $stmtHabito->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            echo json_encode([
                "success" => false,
                "message" => "No se encontró el hábito de Salud Mental para este usuario."
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $id_habito = (int)$row['id_habito'];
    }

    // Insertar la nueva pausa en la tabla registros_habitos
    $valor = 1.00;
    $observacion = "Pausa registrada desde la interfaz";

    $queryInsert = "INSERT INTO registros_habitos (id_habito, valor_registrado, fecha_registro, observaciones) 
                    VALUES (:id_habito, :valor, NOW(), :observacion)";
    
    $stmtInsert = $db->prepare($queryInsert);
    $stmtInsert->bindParam(":id_habito", $id_habito, PDO::PARAM_INT);
    $stmtInsert->bindParam(":valor", $valor);
    $stmtInsert->bindParam(":observacion", $observacion, PDO::PARAM_STR);

    if ($stmtInsert->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "¡Pausa registrada con éxito!"
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se pudo registrar la pausa."
        ], JSON_UNESCAPED_UNICODE);
    }

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error de base de datos: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}