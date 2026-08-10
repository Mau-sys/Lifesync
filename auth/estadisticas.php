<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";

try {

    if (!isset($_SESSION["usuario_id"])) {

        http_response_code(401);

        echo json_encode([
            "exito" => false,
            "mensaje" => "La sesión ha expirado. Inicia sesión nuevamente."
        ]);

        exit;
    }


    $usuarioId = (int) $_SESSION["usuario_id"];


    $periodo = $_GET["periodo"] ?? "semana";


    $periodosPermitidos = [
        "semana",
        "mes",
        "anio"
    ];


    if (!in_array($periodo, $periodosPermitidos, true)) {

        $periodo = "semana";

    }


    $hoy = new DateTime();

    $fechaFin = $hoy->format("Y-m-d");


    if ($periodo === "semana") {

        $fechaInicio = (clone $hoy)
            ->modify("-6 days")
            ->format("Y-m-d");

    } elseif ($periodo === "mes") {

        $fechaInicio = (clone $hoy)
            ->modify("first day of this month")
            ->format("Y-m-d");

    } else {

        $fechaInicio = (clone $hoy)
            ->modify("first day of January")
            ->format("Y-m-d");

    }


    $database = new Database();

    $db = $database->getConnection();


    if (!$db) {

        throw new Exception(
            "No se pudo conectar con la base de datos."
        );

    }


    $consultaHabitos = $db->prepare(
        "SELECT
            h.id_habito,
            h.id_categoria,
            h.nombre_habito,
            h.tipo_medicion,
            h.objetivo,
            h.frecuencia,
            h.dias_semana,
            h.fecha_inicio,
            h.fecha_fin,
            c.nombre_categoria

        FROM habitos h

        LEFT JOIN categorias c
            ON c.id_categoria = h.id_categoria

        WHERE h.id_usuario = :id_usuario

        AND h.activo = 1

        AND h.fecha_inicio <= :fecha_fin

        AND (
            h.fecha_fin IS NULL
            OR h.fecha_fin >= :fecha_inicio
        )

        ORDER BY h.nombre_habito ASC"
    );


    $consultaHabitos->execute([
        ":id_usuario" => $usuarioId,
        ":fecha_inicio" => $fechaInicio,
        ":fecha_fin" => $fechaFin
    ]);


    $habitos = $consultaHabitos->fetchAll(PDO::FETCH_ASSOC);


    if (!$habitos) {

        echo json_encode([
            "exito" => true,
            "periodo" => $periodo,
            "fecha_inicio" => $fechaInicio,
            "fecha_fin" => $fechaFin,
            "progreso_general" => 0,
            "dias_racha" => 0,
            "habitos_completados" => 0,
            "grafica" => [],
            "categorias" => [],
            "habitos_personalizados" => []
        ]);

        exit;
    }


    $consultaRegistros = $db->prepare(
        "SELECT
            rh.id_registro,
            rh.id_habito,
            rh.valor_registrado,
            DATE(rh.fecha_registro) AS fecha

        FROM registros_habitos rh

        INNER JOIN habitos h
            ON h.id_habito = rh.id_habito

        WHERE h.id_usuario = :id_usuario

        AND DATE(rh.fecha_registro)
            BETWEEN :fecha_inicio AND :fecha_fin

        ORDER BY rh.fecha_registro ASC"
    );


    $consultaRegistros->execute([
        ":id_usuario" => $usuarioId,
        ":fecha_inicio" => $fechaInicio,
        ":fecha_fin" => $fechaFin
    ]);


    $registros = $consultaRegistros->fetchAll(PDO::FETCH_ASSOC);


    $registrosPorHabito = [];


    foreach ($registros as $registro) {

        $idHabito = (int) $registro["id_habito"];

        $fecha = $registro["fecha"];

        $valor = (float) $registro["valor_registrado"];


        if (!isset($registrosPorHabito[$idHabito])) {

            $registrosPorHabito[$idHabito] = [];

        }


        if (!isset($registrosPorHabito[$idHabito][$fecha])) {

            $registrosPorHabito[$idHabito][$fecha] = 0;

        }


        $registrosPorHabito[$idHabito][$fecha] += $valor;

    }


    $datosHabitos = [];

    $sumaPorcentajes = 0;

    $cantidadHabitos = 0;

    $totalCompletados = 0;


    foreach ($habitos as $habito) {

        $idHabito = (int) $habito["id_habito"];


        $objetivo = (float) $habito["objetivo"];


        if ($objetivo <= 0) {

            $objetivo = 1;

        }


        $tipoMedicion = $habito["tipo_medicion"];

        $frecuencia = $habito["frecuencia"];


        $diasConProgreso = 0;

        $diasCompletados = 0;

        $porcentajeAcumulado = 0;

        $diasEvaluados = 0;


        $fechaActual = new DateTime($fechaInicio);

        $fechaLimite = new DateTime($fechaFin);


        while ($fechaActual <= $fechaLimite) {

            $fecha = $fechaActual->format("Y-m-d");


            $fechaHabitoInicio =
                new DateTime($habito["fecha_inicio"]);


            if ($fechaActual < $fechaHabitoInicio) {

                $fechaActual->modify("+1 day");

                continue;

            }


            if (
                $habito["fecha_fin"] !== null
                &&
                $fecha > $habito["fecha_fin"]
            ) {

                $fechaActual->modify("+1 day");

                continue;

            }


            $valor =
                $registrosPorHabito[$idHabito][$fecha]
                ?? 0;


            $porcentajeDia = 0;


            if ($tipoMedicion === "completar") {

                $porcentajeDia =
                    $valor > 0
                        ? 100
                        : 0;

            } else {

                $porcentajeDia =
                    ($valor / $objetivo) * 100;

            }


            $porcentajeDia =
                max(
                    0,
                    min(
                        100,
                        $porcentajeDia
                    )
                );


            if ($frecuencia === "diaria") {

                $diasEvaluados++;

                if ($porcentajeDia > 0) {

                    $diasConProgreso++;

                }

                if ($porcentajeDia >= 100) {

                    $diasCompletados++;

                }

                $porcentajeAcumulado +=
                    $porcentajeDia;

            }


            elseif ($frecuencia === "semanal") {

                if (
                    $fechaActual->format("N")
                    ===
                    $fechaHabitoInicio->format("N")
                ) {

                    $diasEvaluados++;

                    if ($porcentajeDia > 0) {

                        $diasConProgreso++;

                    }

                    if ($porcentajeDia >= 100) {

                        $diasCompletados++;

                    }

                    $porcentajeAcumulado +=
                        $porcentajeDia;

                }

            }


            elseif ($frecuencia === "mensual") {

                if (
                    $fechaActual->format("d")
                    ===
                    $fechaHabitoInicio->format("d")
                ) {

                    $diasEvaluados++;

                    if ($porcentajeDia > 0) {

                        $diasConProgreso++;

                    }

                    if ($porcentajeDia >= 100) {

                        $diasCompletados++;

                    }

                    $porcentajeAcumulado +=
                        $porcentajeDia;

                }

            }


            $fechaActual->modify("+1 day");

        }


        if ($diasEvaluados > 0) {

            $porcentaje =
                $porcentajeAcumulado /
                $diasEvaluados;

        } else {

            $porcentaje = 0;

        }


        $porcentaje =
            round(
                max(
                    0,
                    min(
                        100,
                        $porcentaje
                    )
                ),
                2
            );


        $sumaPorcentajes += $porcentaje;

        $cantidadHabitos++;


        $totalCompletados +=
            $diasCompletados;


        $datosHabitos[$idHabito] = [

            "id_habito" =>
                $idHabito,

            "nombre" =>
                $habito["nombre_habito"],

            "categoria" =>
                $habito["nombre_categoria"]
                ?? "Sin categoría",

            "frecuencia" =>
                $frecuencia,

            "porcentaje" =>
                $porcentaje,

            "completados" =>
                $diasCompletados,

            "dias_con_progreso" =>
                $diasConProgreso

        ];

    }


    $progresoGeneral =
        $cantidadHabitos > 0
            ? $sumaPorcentajes /
              $cantidadHabitos
            : 0;


    $progresoGeneral =
        round(
            max(
                0,
                min(
                    100,
                    $progresoGeneral
                )
            ),
            2
        );


    $consultaRachas = $db->prepare(
        "SELECT
            MAX(r.racha_actual) AS racha_actual

        FROM rachas r

        INNER JOIN habitos h
            ON h.id_habito = r.id_habito

        WHERE h.id_usuario = :id_usuario

        AND h.activo = 1"
    );


    $consultaRachas->execute([
        ":id_usuario" => $usuarioId
    ]);


    $racha = $consultaRachas->fetch(PDO::FETCH_ASSOC);


    $diasRacha =
        (int) (
            $racha["racha_actual"] ?? 0
        );


    $grafica = [];


    $fechaActual =
        new DateTime($fechaInicio);

    $fechaLimite =
        new DateTime($fechaFin);


    while ($fechaActual <= $fechaLimite) {

        $fecha =
            $fechaActual->format("Y-m-d");


        $sumaDia = 0;

        $cantidadDia = 0;


        foreach ($habitos as $habito) {

            $idHabito =
                (int) $habito["id_habito"];


            $fechaHabitoInicio =
                new DateTime(
                    $habito["fecha_inicio"]
                );


            if ($fechaActual < $fechaHabitoInicio) {

                continue;

            }


            if (
                $habito["fecha_fin"] !== null
                &&
                $fecha > $habito["fecha_fin"]
            ) {

                continue;

            }


            $objetivo =
                (float) $habito["objetivo"];


            if ($objetivo <= 0) {

                $objetivo = 1;

            }


            $valor =
                $registrosPorHabito[$idHabito][$fecha]
                ?? 0;


            if (
                $habito["tipo_medicion"]
                === "completar"
            ) {

                $porcentajeDia =
                    $valor > 0
                        ? 100
                        : 0;

            } else {

                $porcentajeDia =
                    ($valor / $objetivo) * 100;

            }


            $porcentajeDia =
                max(
                    0,
                    min(
                        100,
                        $porcentajeDia
                    )
                );


            $sumaDia +=
                $porcentajeDia;

            $cantidadDia++;

        }


        $porcentajeDiaGeneral =
            $cantidadDia > 0
                ? $sumaDia / $cantidadDia
                : 0;


        $grafica[] = [

            "fecha" =>
                $fecha,

            "etiqueta" =>
                $fechaActual->format("d/m"),

            "porcentaje" =>
                round(
                    $porcentajeDiaGeneral,
                    2
                )

        ];


        $fechaActual->modify("+1 day");

    }


    $categorias = [];


    foreach ($datosHabitos as $habito) {

        $nombreCategoria =
            $habito["categoria"]
            ?? "Sin categoría";


        if (
            !isset(
                $categorias[$nombreCategoria]
            )
        ) {

            $categorias[$nombreCategoria] = [

                "nombre" =>
                    $nombreCategoria,

                "suma" =>
                    0,

                "cantidad" =>
                    0,

                "completados" =>
                    0

            ];

        }


        $categorias[$nombreCategoria]["suma"] +=
            $habito["porcentaje"];


        $categorias[$nombreCategoria]["cantidad"]++;


        $categorias[$nombreCategoria]["completados"] +=
            $habito["completados"];

    }


    $listaCategorias = [];


    foreach ($categorias as $categoria) {

        $porcentaje =
            $categoria["cantidad"] > 0
                ? $categoria["suma"] /
                  $categoria["cantidad"]
                : 0;


        $listaCategorias[] = [

            "nombre" =>
                $categoria["nombre"],

            "porcentaje" =>
                round(
                    $porcentaje,
                    2
                ),

            "completados" =>
                $categoria["completados"]

        ];

    }


    $habitosPersonalizados = [];


    foreach ($datosHabitos as $habito) {

        if (
            $habito["categoria"]
            ===
            "Hábito Personalizado"
        ) {

            $habitosPersonalizados[] = [

                "id_habito" =>
                    $habito["id_habito"],

                "nombre" =>
                    $habito["nombre"],

                "porcentaje" =>
                    $habito["porcentaje"],

                "completados" =>
                    $habito["completados"]

            ];

        }

    }


    echo json_encode([

        "exito" =>
            true,

        "periodo" =>
            $periodo,

        "fecha_inicio" =>
            $fechaInicio,

        "fecha_fin" =>
            $fechaFin,

        "progreso_general" =>
            round(
                $progresoGeneral,
                2
            ),

        "dias_racha" =>
            $diasRacha,

        "habitos_completados" =>
            $totalCompletados,

        "grafica" =>
            $grafica,

        "categorias" =>
            $listaCategorias,

        "habitos_personalizados" =>
            $habitosPersonalizados

    ]);

    exit;


} catch (Throwable $error) {

    http_response_code(500);

    echo json_encode([

        "exito" =>
            false,

        "mensaje" =>
            "No se pudieron cargar las estadísticas.",

        "detalle" =>
            $error->getMessage(),

        "archivo" =>
            $error->getFile(),

        "linea" =>
            $error->getLine()

    ]);

    exit;
}
?>