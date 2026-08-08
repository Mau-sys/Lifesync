<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";


if (!isset($_SESSION["usuario_id"])) {

    http_response_code(401);

    echo json_encode([
        "exito" => false,
        "mensaje" => "La sesión ha expirado."
    ]);

    exit;
}


$usuarioId = $_SESSION["usuario_id"];


try {

    $database = new Database();

    $db = $database->getConnection();


    if ($db === null) {

        http_response_code(500);

        echo json_encode([
            "exito" => false,
            "mensaje" => "No se pudo conectar con la base de datos."
        ]);

        exit;
    }


    $consulta = $db->prepare("
        SELECT
            h.id_habito,
            h.nombre_habito,
            h.descripcion,
            h.objetivo,
            h.frecuencia,
            h.fecha_inicio,
            h.fecha_fin,
            h.icono,

            COALESCE(
                SUM(r.valor_registrado),
                0
            ) AS progreso

        FROM habitos h

        INNER JOIN categorias c
            ON c.id_categoria = h.id_categoria

        LEFT JOIN registros_habitos r
            ON r.id_habito = h.id_habito

        WHERE h.id_usuario = :id_usuario

        AND c.nombre_categoria = 'Hábito Personalizado'

        AND h.activo = TRUE

        GROUP BY
            h.id_habito,
            h.nombre_habito,
            h.descripcion,
            h.objetivo,
            h.frecuencia,
            h.fecha_inicio,
            h.fecha_fin,
            h.icono

        ORDER BY h.fecha_creacion DESC
    ");


    $consulta->execute([
        ":id_usuario" => $usuarioId
    ]);


    $habitos =
        $consulta->fetchAll(PDO::FETCH_ASSOC);


    echo json_encode([
        "exito" => true,
        "habitos" => $habitos
    ]);


} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" => "Ocurrió un error al obtener los hábitos."
    ]);

}

?>