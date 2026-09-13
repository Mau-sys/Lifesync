<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/conexion.php";

if (!isset($_SESSION["usuario_id"])) {
    http_response_code(401);

    echo json_encode([
        "exito" => false,
        "mensaje" => "La sesión ha expirado."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$usuarioId = (int) $_SESSION["usuario_id"];

$datos = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($datos)) {
    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Los datos enviados no son válidos."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$idHabitoUsuario = (int) (
    $datos["id_habito_usuario"] ??
    0
);

if ($idHabitoUsuario <= 0) {
    http_response_code(400);

    echo json_encode([
        "exito" => false,
        "mensaje" => "No se indicó un hábito válido."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db instanceof PDO) {
        throw new Exception("No se pudo conectar con la base de datos.");
    }

    $consulta = $db->prepare("
        DELETE hu
        FROM habitos_usuario hu
        INNER JOIN habitos h
            ON h.id_habito = hu.id_habito
        INNER JOIN categorias c
            ON c.id_categoria = h.id_categoria
        WHERE hu.id_habito_usuario = :id_habito_usuario
        AND hu.id_usuario = :id_usuario
        AND h.es_base = FALSE
        AND c.nombre = 'Hábito Personalizado'
    ");

    $consulta->execute([
        ":id_habito_usuario" => $idHabitoUsuario,
        ":id_usuario" => $usuarioId
    ]);

    if ($consulta->rowCount() === 0) {
        http_response_code(404);

        echo json_encode([
            "exito" => false,
            "mensaje" => "No se encontró el hábito personalizado."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    echo json_encode([
        "exito" => true,
        "mensaje" => "Hábito eliminado correctamente."
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {
    error_log(
        "LifeSync eliminar-personalizado.php: " .
        $error->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ocurrió un error al eliminar el hábito."
    ], JSON_UNESCAPED_UNICODE);
}