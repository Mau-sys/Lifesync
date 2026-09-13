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

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db instanceof PDO) {
        throw new Exception("No se pudo conectar con la base de datos.");
    }

    $consulta = $db->prepare("
        SELECT
            hu.id_habito_usuario,
            h.id_habito,
            h.nombre_habito,
            h.descripcion,
            h.color,
            h.imagen_url,
            hu.objetivo,
            hu.unidad,
            hu.frecuencia,
            hu.duracion_minutos,
            hu.fecha_inicio,
            hu.fecha_fin,
            COALESCE(
                (
                    SELECT SUM(r.valor_registrado)
                    FROM registros_habitos r
                    WHERE r.id_habito_usuario = hu.id_habito_usuario
                    AND DATE(r.fecha_registro) = CURDATE()
                ),
                0
            ) AS progreso
        FROM habitos_usuario hu
        INNER JOIN habitos h
            ON h.id_habito = hu.id_habito
        INNER JOIN categorias c
            ON c.id_categoria = h.id_categoria
        WHERE hu.id_usuario = :id_usuario
        AND hu.activo = TRUE
        AND c.nombre = 'Hábito Personalizado'
        ORDER BY h.fecha_creacion DESC
    ");

    $consulta->execute([
        ":id_usuario" => $usuarioId
    ]);

    $habitos = $consulta->fetchAll(PDO::FETCH_ASSOC);

    foreach ($habitos as &$habito) {
        $habito["id_habito_usuario"] = (int) $habito["id_habito_usuario"];
        $habito["id_habito"] = (int) $habito["id_habito"];
        $habito["objetivo"] = (float) $habito["objetivo"];
        $habito["duracion_minutos"] = $habito["duracion_minutos"] !== null
            ? (int) $habito["duracion_minutos"]
            : null;
        $habito["progreso"] = (float) $habito["progreso"];
    }

    unset($habito);

    echo json_encode([
        "exito" => true,
        "habitos" => $habitos,
        "total" => count($habitos)
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Throwable $error) {
    error_log(
        "LifeSync obtener-personalizados.php: " .
        $error->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ocurrió un error al obtener los hábitos."
    ], JSON_UNESCAPED_UNICODE);
}