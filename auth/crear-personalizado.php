<?php
if (ob_get_length()) ob_clean();

session_start();
header('Content-Type: application/json; charset=utf-8');

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

    $database = new Database();
    $db = $database->getConnection();

    // Validar existencia del usuario
    $stmtVerificarUser = $db->prepare("SELECT id_usuario FROM usuario WHERE id_usuario = :id LIMIT 1");
    $stmtVerificarUser->execute([':id' => $usuarioId]);
    
    if (!$stmtVerificarUser->fetch()) {
        session_destroy();
        http_response_code(401);
        echo json_encode([
            'exito' => false, 
            'mensaje' => 'La sesión actual pertenece a un usuario inexistente. Por favor, vuelve a iniciar sesión.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Leer payload JSON o FormData POST
    $inputRaw = file_get_contents('php://input');
    $data = json_decode($inputRaw, true);
    if (!is_array($data)) {
        $data = $_POST;
    }

    // Normalización de campos
    $nombre = trim((string)($data['nombre_habito'] ?? $data['nombre'] ?? ''));
    $descripcion = trim((string)($data['descripcion'] ?? 'Hábito personalizado'));
    $idCategoria = isset($data['id_categoria']) ? (int)$data['id_categoria'] : 0;
    $frecuenciaBD = trim((string)($data['frecuencia'] ?? 'diaria'));
    $objetivo = !empty($data['objetivo']) ? (float)$data['objetivo'] : 1.00;
    $unidad = trim((string)($data['unidad'] ?? 'completar'));
    
    // Normalización de duración para evitar CHECK CONSTRAINT
    $duracionVal = isset($data['duracion_minutos']) ? (int)$data['duracion_minutos'] : 0;
    $duracionMinutos = ($duracionVal > 0) ? $duracionVal : null;

    $fechaInicio = !empty($data['fecha_inicio']) ? $data['fecha_inicio'] : date('Y-m-d');
    $fechaFin = !empty($data['fecha_fin']) ? $data['fecha_fin'] : null;

    if ($nombre === '') {
        http_response_code(400);
        echo json_encode(['exito' => false, 'mensaje' => 'El nombre del hábito es obligatorio.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $db->beginTransaction();

    // 1. Categoria válida
    if ($idCategoria <= 0) {
        $stmtCat = $db->prepare("SELECT id_categoria FROM categorias WHERE nombre LIKE '%personalizado%' OR nombre LIKE '%otro%' LIMIT 1");
        $stmtCat->execute();
        $idCategoria = (int)$stmtCat->fetchColumn();

        if ($idCategoria <= 0) {
            $stmtCatFallback = $db->query("SELECT id_categoria FROM categorias ORDER BY id_categoria ASC LIMIT 1");
            $idCategoria = (int)$stmtCatFallback->fetchColumn();
        }
    }

    // 2. Insertar en habitos
    $stmtHabito = $db->prepare("
        INSERT INTO habitos (id_categoria, nombre_habito, descripcion, es_base, color, imagen_url) 
        VALUES (:id_cat, :nombre, :desc, 0, '#81C784', 'img/H-Perzona.png')
    ");
    $stmtHabito->execute([
        ':id_cat' => $idCategoria,
        ':nombre' => $nombre,
        ':desc'   => $descripcion
    ]);

    $idHabito = (int) $db->lastInsertId();

    // 3. Insertar en habitos_usuario
    $stmtUsuario = $db->prepare("
        INSERT INTO habitos_usuario (
            id_usuario, id_habito, activo, objetivo, unidad, frecuencia, duracion_minutos, fecha_inicio, fecha_fin
        ) VALUES (
            :id_u, :id_h, 1, :obj, :uni, :frec, :dur, :f_ini, :f_fin
        )
    ");
    $stmtUsuario->execute([
        ':id_u'   => $usuarioId,
        ':id_h'   => $idHabito,
        ':obj'    => $objetivo,
        ':uni'    => $unidad,
        ':frec'   => $frecuenciaBD,
        ':dur'    => $duracionMinutos,
        ':f_ini'  => $fechaInicio,
        ':f_fin'  => $fechaFin
    ]);

    $idHabitoUsuario = (int) $db->lastInsertId();

    $db->commit();

    echo json_encode([
        'exito' => true,
        'mensaje' => 'Hábito creado con éxito.',
        'id_habito_usuario' => $idHabitoUsuario
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error SQL/Servidor: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}