<?php
// api/habitos_usuario.php
session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php"; // Ajusta la ruta a tu conexión

// Verificar sesión de usuario
if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(["exito" => false, "mensaje" => "Sesión no iniciada"]);
    exit;
}

$id_usuario = $_SESSION['id_usuario'];
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    // ==========================================
    // READ (GET): Listar hábitos del usuario
    // ==========================================
    case 'GET':
        try {
            $sql = "SELECT 
                        hu.id_habito_usuario,
                        hu.id_habito,
                        h.nombre_habito,
                        h.descripcion,
                        c.nombre AS categoria,
                        hu.activo,
                        hu.objetivo,
                        hu.unidad,
                        hu.frecuencia,
                        hu.duracion_minutos,
                        hu.fecha_inicio,
                        hu.fecha_fin
                    FROM habitos_usuario hu
                    INNER JOIN habitos h ON hu.id_habito = h.id_habito
                    LEFT JOIN categorias c ON h.id_categoria = c.id_categoria
                    WHERE hu.id_usuario = :id_usuario
                    ORDER BY hu.activo DESC, hu.id_habito_usuario DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id_usuario' => $id_usuario]);
            $habitos = $stmt->fetchAll();

            // Cargar los días específicos si la frecuencia es 'dias específicos'
            foreach ($habitos as &$habito) {
                if ($habito['frecuencia'] === 'dias específicos') {
                    $stmtDias = $pdo->prepare("SELECT dia_semana FROM habito_dias WHERE id_habito_usuario = :id_hu");
                    $stmtDias->execute([':id_hu' => $habito['id_habito_usuario']]);
                    $habito['dias'] = $stmtDias->fetchAll(PDO::FETCH_COLUMN);
                } else {
                    $habito['dias'] = [];
                }
            }

            echo json_encode(["exito" => true, "datos" => $habitos]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["exito" => false, "mensaje" => "Error al obtener hábitos: " . $e->getMessage()]);
        }
        break;

    // ==========================================
    // CREATE (POST): Asignar/Registrar hábito
    // ==========================================
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['id_habito'], $data['objetivo'], $data['unidad'], $data['frecuencia'])) {
            http_response_code(400);
            echo json_encode(["exito" => false, "mensaje" => "Datos incompletos"]);
            exit;
        }

        try {
            $pdo->beginTransaction();

            $sql = "INSERT INTO habitos_usuario 
                    (id_usuario, id_habito, objetivo, unidad, frecuencia, duracion_minutos, fecha_inicio, fecha_fin) 
                    VALUES 
                    (:id_usuario, :id_habito, :objetivo, :unidad, :frecuencia, :duracion_minutos, :fecha_inicio, :fecha_fin)";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id_usuario'       => $id_usuario,
                ':id_habito'        => $data['id_habito'],
                ':objetivo'         => $data['objetivo'],
                ':unidad'           => $data['unidad'],
                ':frecuencia'       => $data['frecuencia'],
                ':duracion_minutos' => !empty($data['duracion_minutos']) ? $data['duracion_minutos'] : NULL,
                ':fecha_inicio'     => !empty($data['fecha_inicio']) ? $data['fecha_inicio'] : date('Y-m-d'),
                ':fecha_fin'        => !empty($data['fecha_fin']) ? $data['fecha_fin'] : NULL
            ]);

            $id_habito_usuario = $pdo->lastInsertId();

            // Si es frecuencia de días específicos, guardar en habito_dias
            if ($data['frecuencia'] === 'dias específicos' && isset($data['dias']) && is_array($data['dias'])) {
                $sqlDias = "INSERT INTO habito_dias (id_habito_usuario, dia_semana) VALUES (:id_hu, :dia)";
                $stmtDias = $pdo->prepare($sqlDias);
                foreach ($data['dias'] as $dia) {
                    $stmtDias->execute([
                        ':id_hu' => $id_habito_usuario,
                        ':dia'  => $dia
                    ]);
                }
            }

            // Opcional: Inicializar la racha del hábito
            $sqlRacha = "INSERT INTO rachas (id_habito_usuario) VALUES (:id_hu)";
            $stmtRacha = $pdo->prepare($sqlRacha);
            $stmtRacha->execute([':id_hu' => $id_habito_usuario]);

            $pdo->commit();
            echo json_encode(["exito" => true, "mensaje" => "Hábito registrado correctamente"]);

        } catch (PDOException $e) {
            $pdo->rollBack();
            // Controlar duplicados (uq_usuario_habito)
            if ($e->getCode() == 23000) {
                echo json_encode(["exito" => false, "mensaje" => "Ya tienes asignado este hábito"]);
            } else {
                http_response_code(500);
                echo json_encode(["exito" => false, "mensaje" => "Error al guardar el hábito: " . $e->getMessage()]);
            }
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["exito" => false, "mensaje" => "Método no permitido"]);
        break;
}