<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";


try {

    /*
     * =====================================================
     * OBTENER USUARIO DE LA SESIÓN
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
     * OBTENER CATEGORÍAS DEL USUARIO
     * =====================================================
     */

    $sql = "
        SELECT
            c.id_categoria,
            c.nombre_categoria,
            c.descripcion
        FROM categorias c
        INNER JOIN usuario_categorias uc
            ON uc.id_categoria = c.id_categoria
        WHERE uc.id_usuario = :id_usuario
        ORDER BY c.id_categoria ASC
    ";


    $stmt = $conexion->prepare($sql);

    $stmt->execute([
        ":id_usuario" => $idUsuario
    ]);


    $categorias = $stmt->fetchAll();


    /*
     * =====================================================
     * OBTENER HÁBITOS Y PROGRESO DE CADA CATEGORÍA
     * =====================================================
     */

    foreach ($categorias as &$categoria) {

        $sqlHabitos = "
            SELECT
                h.id_habito,
                h.nombre_habito,
                h.descripcion,
                h.objetivo,
                h.unidad_medida,
                h.frecuencia,
                h.color,
                h.icono,

                COALESCE(
                    (
                        SELECT SUM(rh.valor_registrado)
                        FROM registros_habitos rh
                        WHERE rh.id_habito = h.id_habito
                        AND DATE(rh.fecha_registro) = CURDATE()
                    ),
                    0
                ) AS progreso_hoy

            FROM habitos h

            WHERE h.id_usuario = :id_usuario
            AND h.id_categoria = :id_categoria
            AND h.activo = 1

            ORDER BY h.fecha_creacion DESC
        ";


        $stmtHabitos =
            $conexion->prepare($sqlHabitos);


        $stmtHabitos->execute([
            ":id_usuario" => $idUsuario,
            ":id_categoria" => $categoria["id_categoria"]
        ]);


        $habitos =
            $stmtHabitos->fetchAll();


        foreach ($habitos as &$habito) {

            $objetivo =
                (float) $habito["objetivo"];

            $progreso =
                (float) $habito["progreso_hoy"];


            if ($objetivo > 0) {

                $porcentaje =
                    ($progreso / $objetivo) * 100;

            } else {

                $porcentaje = 0;

            }


            $porcentaje =
                max(
                    0,
                    min(
                        100,
                        $porcentaje
                    )
                );


            $habito["objetivo"] =
                (float) $objetivo;

            $habito["progreso_hoy"] =
                (float) $progreso;

            $habito["porcentaje"] =
                round($porcentaje, 2);

        }


        $categoria["habitos"] =
            $habitos;


        /*
         * =================================================
         * PROGRESO GENERAL DE LA CATEGORÍA
         * =================================================
         */

        if (count($habitos) > 0) {

            $sumaPorcentajes = 0;

            foreach ($habitos as $habito) {

                $sumaPorcentajes +=
                    (float) $habito["porcentaje"];

            }


            $progresoCategoria =
                $sumaPorcentajes /
                count($habitos);

        } else {

            $progresoCategoria = 0;

        }


        $categoria["progreso"] =
            round(
                max(
                    0,
                    min(
                        100,
                        $progresoCategoria
                    )
                ),
                2
            );


        /*
         * =================================================
         * ESTADO
         * =================================================
         */

        if (count($habitos) === 0) {

            $categoria["estado"] =
                "sin_habito";

        } elseif ($categoria["progreso"] >= 100) {

            $categoria["estado"] =
                "completado";

        } elseif ($categoria["progreso"] > 0) {

            $categoria["estado"] =
                "en_progreso";

        } else {

            $categoria["estado"] =
                "pendiente";

        }

    }


    unset($categoria);


    /*
     * =====================================================
     * RESPUESTA
     * =====================================================
     */

    echo json_encode(
        [
            "exito" => true,
            "categorias" => $categorias
        ],
        JSON_UNESCAPED_UNICODE
    );


} catch (Throwable $error) {

    error_log(
        "Error en categorias.php: " .
        $error->getMessage()
    );


    http_response_code(500);


    echo json_encode(
        [
            "exito" => false,
            "mensaje" =>
                "No se pudieron cargar las categorías."
        ],
        JSON_UNESCAPED_UNICODE
    );

}