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
    $conexion = $database->getConnection();

    if (!$conexion instanceof PDO) {
        throw new Exception("No se pudo conectar con la base de datos.");
    }

    $sql = "
        SELECT
            hu.id_habito_usuario,
            h.id_habito,
            h.nombre_habito,
            h.descripcion,
            h.id_categoria,
            c.nombre AS categoria,
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
            ) AS progreso_hoy

        FROM habitos_usuario hu

        INNER JOIN habitos h
            ON hu.id_habito = h.id_habito

        LEFT JOIN categorias c
            ON h.id_categoria = c.id_categoria

        WHERE hu.id_usuario = :usuario_id
        AND hu.activo = TRUE

        ORDER BY hu.id_habito_usuario ASC
    ";

    $stmt = $conexion->prepare($sql);

    $stmt->execute([
        ":usuario_id" => $usuarioId
    ]);

    $habitos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($habitos as &$habito) {
        $habito["id_habito_usuario"] =
            (int) $habito["id_habito_usuario"];

        $habito["id_habito"] =
            (int) $habito["id_habito"];

        $habito["id_categoria"] =
            $habito["id_categoria"] !== null
                ? (int) $habito["id_categoria"]
                : null;

        $habito["objetivo"] =
            (float) $habito["objetivo"];

        $habito["duracion_minutos"] =
            $habito["duracion_minutos"] !== null
                ? (int) $habito["duracion_minutos"]
                : null;

        $habito["progreso_hoy"] =
            (float) $habito["progreso_hoy"];
    }

    unset($habito);

    echo json_encode([
        "exito" => true,
        "habitos" => $habitos,
        "total" => count($habitos)
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Throwable $error) {
    error_log(
        "LifeSync habitos_activos.php: " .
        $error->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Error al obtener los hábitos."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}