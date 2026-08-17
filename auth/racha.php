<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";


try {

    /*
     * =====================================================
     * USUARIO
     * =====================================================
     */

    $idUsuario = $_SESSION["id_usuario"]
        ?? $_SESSION["usuario_id"]
        ?? null;


    if (!$idUsuario) {

        http_response_code(401);

        echo json_encode([
            "exito" => false,
            "mensaje" => "Sesión no iniciada."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    /*
     * =====================================================
     * CONEXIÓN
     * =====================================================
     */

    $database = new Database();

    $conexion = $database->getConnection();


    /*
     * =====================================================
     * OBTENER RACHAS DE LOS HÁBITOS DEL USUARIO
     * =====================================================
     */

    $sql = "
        SELECT

            h.id_habito,
            h.nombre_habito,

            c.id_categoria,
            c.nombre_categoria,

            COALESCE(r.racha_actual, 0)
                AS racha_actual,

            COALESCE(r.mejor_racha, 0)
                AS mejor_racha,

            COALESCE(r.total_completados, 0)
                AS total_completados,

            r.ultima_fecha

        FROM habitos h

        LEFT JOIN categorias c
            ON c.id_categoria = h.id_categoria

        LEFT JOIN rachas r
            ON r.id_habito = h.id_habito

        WHERE h.id_usuario = :id_usuario
        AND h.activo = 1

        ORDER BY
            COALESCE(r.racha_actual, 0) DESC,
            h.nombre_habito ASC
    ";


    $stmt =
        $conexion->prepare($sql);


    $stmt->execute([
        ":id_usuario" => $idUsuario
    ]);


    $habitos =
        $stmt->fetchAll();


    /*
     * =====================================================
     * CALCULAR RESUMEN
     * =====================================================
     */

    $rachaActual = 0;

    $mejorRacha = 0;

    $totalCompletados = 0;


    foreach ($habitos as &$habito) {

        $actual =
            (int) $habito["racha_actual"];

        $mejor =
            (int) $habito["mejor_racha"];

        $completados =
            (int) $habito["total_completados"];


        if ($actual > $rachaActual) {

            $rachaActual = $actual;

        }


        if ($mejor > $mejorRacha) {

            $mejorRacha = $mejor;

        }


        $totalCompletados +=
            $completados;

    }


    unset($habito);


    /*
     * =====================================================
     * CATEGORÍAS
     * =====================================================
     */

    $categorias = [];


    foreach ($habitos as $habito) {

        $idCategoria =
            $habito["id_categoria"];


        if (!$idCategoria) {
            continue;
        }


        if (!isset($categorias[$idCategoria])) {

            $categorias[$idCategoria] = [

                "id_categoria" =>
                    (int) $idCategoria,

                "nombre_categoria" =>
                    $habito["nombre_categoria"],

                "racha_actual" => 0,

                "mejor_racha" => 0,

                "total_completados" => 0

            ];

        }


        if (
            $habito["racha_actual"] >
            $categorias[$idCategoria]["racha_actual"]
        ) {

            $categorias[$idCategoria]["racha_actual"] =
                (int) $habito["racha_actual"];

        }


        if (
            $habito["mejor_racha"] >
            $categorias[$idCategoria]["mejor_racha"]
        ) {

            $categorias[$idCategoria]["mejor_racha"] =
                (int) $habito["mejor_racha"];

        }


        $categorias[$idCategoria]["total_completados"] +=
            (int) $habito["total_completados"];

    }


    $categorias =
        array_values($categorias);


    /*
     * =====================================================
     * HISTORIAL DE LOS ÚLTIMOS 30 DÍAS
     * =====================================================
     */

    $sqlHistorial = "
        SELECT

            DATE(rh.fecha_registro)
                AS fecha,

            COUNT(DISTINCT h.id_habito)
                AS habitos_completados

        FROM registros_habitos rh

        INNER JOIN habitos h
            ON h.id_habito = rh.id_habito

        WHERE h.id_usuario = :id_usuario

        AND rh.fecha_registro >=
            DATE_SUB(
                CURDATE(),
                INTERVAL 29 DAY
            )

        GROUP BY
            DATE(rh.fecha_registro)

        ORDER BY
            fecha DESC
    ";


    $stmtHistorial =
        $conexion->prepare(
            $sqlHistorial
        );


    $stmtHistorial->execute([
        ":id_usuario" => $idUsuario
    ]);


    $historial =
        $stmtHistorial->fetchAll();


    /*
     * =====================================================
     * RESPUESTA
     * =====================================================
     */

    echo json_encode(
        [
            "exito" => true,

            "resumen" => [

                "racha_actual" =>
                    $rachaActual,

                "mejor_racha" =>
                    $mejorRacha,

                "total_completados" =>
                    $totalCompletados,

                "habitos_activos" =>
                    count($habitos)

            ],

            "habitos" =>
                $habitos,

            "categorias" =>
                $categorias,

            "historial" =>
                $historial

        ],
        JSON_UNESCAPED_UNICODE
    );


} catch (Throwable $error) {

    error_log(
        "Error en racha.php: " .
        $error->getMessage()
    );


    http_response_code(500);


    echo json_encode(
        [
            "exito" => false,
            "mensaje" =>
                "No se pudieron cargar las rachas."
        ],
        JSON_UNESCAPED_UNICODE
    );

}