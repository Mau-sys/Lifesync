<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

if (!isset($_SESSION["usuario_id"])) {
    http_response_code(401);
    echo json_encode([
        "exito" => false,
        "mensaje" => "La sesión ha expirado."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$usuarioId = (int) $_SESSION["usuario_id"];

try {
    $database = new Database();
    $db = $database->getConnection();

    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {
        $stmt = $db->prepare(
            "SELECT h.id_categoria 
             FROM habitos_usuario hu
             INNER JOIN habitos h ON h.id_habito = hu.id_habito
             WHERE hu.id_usuario = :id_usuario AND hu.activo = TRUE AND h.id_categoria IS NOT NULL"
        );
        $stmt->execute([":id_usuario" => $usuarioId]);
        $categoriasActivas = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode([
            "exito" => true,
            "categorias_activas" => array_map('intval', $categoriasActivas)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($metodo === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $accion = $input['accion'] ?? 'sincronizar';

        if ($accion === 'deshabilitar') {
            $idHabitoUsuario = isset($input['id_habito_usuario']) ? (int)$input['id_habito_usuario'] : 0;

            if ($idHabitoUsuario <= 0) {
                http_response_code(400);
                echo json_encode([
                    "exito" => false,
                    "mensaje" => "Identificador de hábito no válido."
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmtDeshabilitar = $db->prepare(
                "UPDATE habitos_usuario 
                 SET activo = FALSE 
                 WHERE id_habito_usuario = :id_habito_usuario AND id_usuario = :id_usuario"
            );
            $stmtDeshabilitar->execute([
                ":id_habito_usuario" => $idHabitoUsuario,
                ":id_usuario" => $usuarioId
            ]);

            if ($stmtDeshabilitar->rowCount() > 0) {
                echo json_encode([
                    "exito" => true,
                    "mensaje" => "Hábito deshabilitado correctamente."
                ], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode([
                    "exito" => false,
                    "mensaje" => "No se encontró el hábito o ya se encuentra deshabilitado."
                ], JSON_UNESCAPED_UNICODE);
            }
            exit;
        }

        $categoriasSeleccionadas = $input['categorias'] ?? [];

        $db->beginTransaction();

        $stmtDesactivar = $db->prepare("UPDATE habitos_usuario SET activo = FALSE WHERE id_usuario = :id_usuario");
        $stmtDesactivar->execute([":id_usuario" => $usuarioId]);

        if (!empty($categoriasSeleccionadas)) {
            $placeholders = implode(',', array_fill(0, count($categoriasSeleccionadas), '?'));
            
            $stmtHabitosBase = $db->prepare("SELECT id_habito, id_categoria FROM habitos WHERE id_categoria IN ($placeholders) AND es_base = TRUE");
            $stmtHabitosBase->execute($categoriasSeleccionadas);
            $habitosBase = $stmtHabitosBase->fetchAll(PDO::FETCH_ASSOC);

            foreach ($habitosBase as $habito) {
                $idHabito = $habito['id_habito'];

                $stmtCheck = $db->prepare("SELECT id_habito_usuario FROM habitos_usuario WHERE id_usuario = ? AND id_habito = ?");
                $stmtCheck->execute([$usuarioId, $idHabito]);
                $idHabitoUsuario = $stmtCheck->fetchColumn();

                if ($idHabitoUsuario) {
                    $stmtUpdate = $db->prepare("UPDATE habitos_usuario SET activo = TRUE WHERE id_habito_usuario = ?");
                    $stmtUpdate->execute([$idHabitoUsuario]);
                } else {
                    $stmtInsert = $db->prepare("INSERT INTO habitos_usuario (id_usuario, id_habito, activo, objetivo, frecuencia) VALUES (?, ?, TRUE, 1, 'diaria')");
                    $stmtInsert->execute([$usuarioId, $idHabito]);
                }
            }
        }

        $db->commit();

        echo json_encode([
            "exito" => true,
            "mensaje" => "Preferencias guardadas correctamente."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (Throwable $error) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "exito" => false,
        "mensaje" => "No se pudieron procesar las preferencias: " . $error->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}