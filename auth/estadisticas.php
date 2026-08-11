<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";


function responderJSON(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);

    echo json_encode(
        $datos,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}


function limitarPorcentaje(float $valor): float
{
    return round(
        max(0, min(100, $valor)),
        2
    );
}


function fechaActiva(array $habito, DateTime $fecha): bool
{
    $fechaInicio = new DateTime(
        $habito["fecha_inicio"]
    );

    if ($fecha < $fechaInicio) {
        return false;
    }

    if (
        $habito["fecha_fin"] !== null &&
        $habito["fecha_fin"] !== "" &&
        $fecha->format("Y-m-d") > $habito["fecha_fin"]
    ) {
        return false;
    }

    return true;
}


function diaProgramado(array $habito, DateTime $fecha): bool
{
    $frecuencia =
        strtolower(
            trim(
                (string)$habito["frecuencia"]
            )
        );


    if ($frecuencia === "diaria") {
        return true;
    }


    if ($frecuencia === "semanal") {

        $diasSemana =
            trim(
                (string)(
                    $habito["dias_semana"] ?? ""
                )
            );


        if ($diasSemana === "") {

            $fechaInicio =
                new DateTime(
                    $habito["fecha_inicio"]
                );

            return
                $fecha->format("N") ===
                $fechaInicio->format("N");
        }


        $dias =
            preg_split(
                "/[\s,;|]+/",
                $diasSemana,
                -1,
                PREG_SPLIT_NO_EMPTY
            );


        $numeroDia =
            $fecha->format("N");


        $equivalencias = [
            "lunes" => "1",
            "martes" => "2",
            "miercoles" => "3",
            "miércoles" => "3",
            "jueves" => "4",
            "viernes" => "5",
            "sabado" => "6",
            "sábado" => "6",
            "domingo" => "7"
        ];


        foreach ($dias as $dia) {

            $dia =
                strtolower(
                    trim($dia)
                );


            if (
                (string)$dia ===
                (string)$numeroDia
            ) {
                return true;
            }


            if (
                isset($equivalencias[$dia]) &&
                $equivalencias[$dia] ===
                (string)$numeroDia
            ) {
                return true;
            }
        }


        return false;
    }


    if ($frecuencia === "mensual") {

        $fechaInicio =
            new DateTime(
                $habito["fecha_inicio"]
            );

        return
            $fecha->format("d") ===
            $fechaInicio->format("d");
    }


    return false;
}


function porcentajeDelDia(
    array $habito,
    float $valor
): float {

    $tipo =
        strtolower(
            trim(
                (string)$habito["tipo_medicion"]
            )
        );


    if ($tipo === "completar") {
        return $valor > 0 ? 100 : 0;
    }


    $objetivo =
        (float)$habito["objetivo"];


    if ($objetivo <= 0) {
        return $valor > 0 ? 100 : 0;
    }


    return limitarPorcentaje(
        ($valor / $objetivo) * 100
    );
}


function fechaCompletada(
    array $habito,
    float $valor
): bool {

    return
        porcentajeDelDia(
            $habito,
            $valor
        ) >= 100;
}


try {

    if (!isset($_SESSION["usuario_id"])) {

        responderJSON(
            [
                "exito" => false,
                "mensaje" =>
                    "La sesión ha expirado. Inicia sesión nuevamente."
            ],
            401
        );
    }


    $usuarioId =
        (int)$_SESSION["usuario_id"];


    $periodo =
        $_GET["periodo"] ?? "semana";


    if (
        !in_array(
            $periodo,
            [
                "semana",
                "mes",
                "anio"
            ],
            true
        )
    ) {
        $periodo = "semana";
    }


    $hoy =
        new DateTime(
            "today"
        );


    if ($periodo === "semana") {

        $fechaInicioObjeto =
            (clone $hoy)->modify("-6 days");

    } elseif ($periodo === "mes") {

        $fechaInicioObjeto =
            (clone $hoy)->modify(
                "first day of this month"
            );

    } else {

        $fechaInicioObjeto =
            (clone $hoy)->modify(
                "first day of January"
            );
    }


    $fechaFinObjeto =
        clone $hoy;


    $fechaInicio =
        $fechaInicioObjeto->format("Y-m-d");


    $fechaFin =
        $fechaFinObjeto->format("Y-m-d");


    $database =
        new Database();


    $db =
        $database->getConnection();


    if (!$db instanceof PDO) {

        throw new Exception(
            "No se pudo establecer la conexión con la base de datos."
        );
    }


    $db->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );


    /*
     * HÁBITOS ACTIVOS DEL USUARIO
     */

    $consultaHabitos =
        $db->prepare(
            "SELECT
                h.id_habito,
                h.id_categoria,
                h.nombre_habito,
                h.descripcion,
                h.tipo_medicion,
                h.objetivo,
                h.unidad_medida,
                h.frecuencia,
                h.dias_semana,
                h.fecha_inicio,
                h.fecha_fin,
                h.activo,
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


    $consultaHabitos->execute(
        [
            ":id_usuario" =>
                $usuarioId,

            ":fecha_inicio" =>
                $fechaInicio,

            ":fecha_fin" =>
                $fechaFin
        ]
    );


    $habitos =
        $consultaHabitos->fetchAll(
            PDO::FETCH_ASSOC
        );


    /*
     * SI EL USUARIO TODAVÍA NO TIENE HÁBITOS
     */

    if (!$habitos) {

        responderJSON(
            [
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
            ]
        );
    }


    /*
     * REGISTROS DEL PERÍODO
     */

    $consultaRegistros =
        $db->prepare(
            "SELECT
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


    $consultaRegistros->execute(
        [
            ":id_usuario" =>
                $usuarioId,

            ":fecha_inicio" =>
                $fechaInicio,

            ":fecha_fin" =>
                $fechaFin
        ]
    );


    $registros =
        $consultaRegistros->fetchAll(
            PDO::FETCH_ASSOC
        );


    /*
     * AGRUPAR REGISTROS
     */

    $registrosPorHabito = [];


    foreach ($registros as $registro) {

        $idHabito =
            (int)$registro["id_habito"];


        $fecha =
            $registro["fecha"];


        $valor =
            (float)$registro["valor_registrado"];


        if (
            !isset(
                $registrosPorHabito[$idHabito]
            )
        ) {
            $registrosPorHabito[$idHabito] = [];
        }


        if (
            !isset(
                $registrosPorHabito[$idHabito][$fecha]
            )
        ) {
            $registrosPorHabito[$idHabito][$fecha] = 0;
        }


        $registrosPorHabito[$idHabito][$fecha]
            += $valor;
    }


    /*
     * DATOS GENERALES POR HÁBITO
     */

    $datosHabitos = [];

    $sumaPorcentajes = 0;

    $cantidadHabitos = 0;

    $totalCompletados = 0;


    foreach ($habitos as $habito) {

        $idHabito =
            (int)$habito["id_habito"];


        $porcentajeAcumulado = 0;

        $ocurrenciasEvaluadas = 0;

        $diasCompletados = 0;


        $fechaActual =
            clone $fechaInicioObjeto;


        while ($fechaActual <= $fechaFinObjeto) {

            if (
                fechaActiva(
                    $habito,
                    $fechaActual
                )
                &&
                diaProgramado(
                    $habito,
                    $fechaActual
                )
            ) {

                $fecha =
                    $fechaActual->format("Y-m-d");


                $valor =
                    $registrosPorHabito[
                        $idHabito
                    ][$fecha] ?? 0;


                $porcentajeDia =
                    porcentajeDelDia(
                        $habito,
                        (float)$valor
                    );


                $porcentajeAcumulado
                    += $porcentajeDia;


                $ocurrenciasEvaluadas++;


                if (
                    fechaCompletada(
                        $habito,
                        (float)$valor
                    )
                ) {
                    $diasCompletados++;
                }
            }


            $fechaActual->modify("+1 day");
        }


        $porcentaje = 0;


        if ($ocurrenciasEvaluadas > 0) {

            $porcentaje =
                $porcentajeAcumulado /
                $ocurrenciasEvaluadas;
        }


        $porcentaje =
            limitarPorcentaje(
                $porcentaje
            );


        $sumaPorcentajes +=
            $porcentaje;


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

            "porcentaje" =>
                $porcentaje,

            "completados" =>
                $diasCompletados
        ];
    }


    /*
     * PROGRESO GENERAL
     */

    $progresoGeneral = 0;


    if ($cantidadHabitos > 0) {

        $progresoGeneral =
            $sumaPorcentajes /
            $cantidadHabitos;
    }


    $progresoGeneral =
        limitarPorcentaje(
            $progresoGeneral
        );


    /*
     * GRÁFICA DIARIA
     */

    $grafica = [];


    $fechaActual =
        clone $fechaInicioObjeto;


    while ($fechaActual <= $fechaFinObjeto) {

        $fecha =
            $fechaActual->format("Y-m-d");


        $sumaDia = 0;

        $cantidadDia = 0;


        foreach ($habitos as $habito) {

            if (
                !fechaActiva(
                    $habito,
                    $fechaActual
                )
                ||
                !diaProgramado(
                    $habito,
                    $fechaActual
                )
            ) {
                continue;
            }


            $idHabito =
                (int)$habito["id_habito"];


            $valor =
                $registrosPorHabito[
                    $idHabito
                ][$fecha] ?? 0;


            $sumaDia +=
                porcentajeDelDia(
                    $habito,
                    (float)$valor
                );


            $cantidadDia++;
        }


        $porcentajeDia =
            0;


        if ($cantidadDia > 0) {

            $porcentajeDia =
                $sumaDia /
                $cantidadDia;
        }


        $grafica[] = [

            "fecha" =>
                $fecha,

            "etiqueta" =>
                $fechaActual->format("d/m"),

            "porcentaje" =>
                limitarPorcentaje(
                    $porcentajeDia
                )
        ];


        $fechaActual->modify("+1 day");
    }


    /*
     * CATEGORÍAS
     */

    $categorias = [];


    foreach ($datosHabitos as $habito) {

        $nombreCategoria =
            $habito["categoria"]
            ?: "Sin categoría";


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


        $categorias[
            $nombreCategoria
        ]["suma"]
            += $habito["porcentaje"];


        $categorias[
            $nombreCategoria
        ]["cantidad"]++;


        $categorias[
            $nombreCategoria
        ]["completados"]
            += $habito["completados"];
    }


    $listaCategorias = [];


    foreach ($categorias as $categoria) {

        $porcentaje = 0;


        if ($categoria["cantidad"] > 0) {

            $porcentaje =
                $categoria["suma"] /
                $categoria["cantidad"];
        }


        $listaCategorias[] = [

            "nombre" =>
                $categoria["nombre"],

            "porcentaje" =>
                limitarPorcentaje(
                    $porcentaje
                ),

            "completados" =>
                (int)$categoria["completados"]
        ];
    }


    /*
     * HÁBITOS PERSONALIZADOS
     */

    $habitosPersonalizados = [];


    foreach ($habitos as $habito) {

        $nombreCategoria =
            trim(
                (string)(
                    $habito["nombre_categoria"]
                    ?? ""
                )
            );


        if (
            $nombreCategoria !==
            "Hábito Personalizado"
        ) {
            continue;
        }


        $idHabito =
            (int)$habito["id_habito"];


        if (
            !isset(
                $datosHabitos[$idHabito]
            )
        ) {
            continue;
        }


        $datos =
            $datosHabitos[$idHabito];


        $habitosPersonalizados[] = [

            "id_habito" =>
                $idHabito,

            "nombre" =>
                $datos["nombre"],

            "porcentaje" =>
                $datos["porcentaje"],

            "completados" =>
                $datos["completados"]
        ];
    }


    /*
     * RACHA ACTUAL
     *
     * Se obtiene el máximo de días consecutivos
     * completados entre los hábitos del usuario.
     */

    $mejorRachaActual = 0;


    foreach ($habitos as $habito) {

        $idHabito =
            (int)$habito["id_habito"];


        $rachaActual = 0;


        $fechaRevision =
            clone $hoy;


        while (true) {

            if (
                !fechaActiva(
                    $habito,
                    $fechaRevision
                )
                ||
                !diaProgramado(
                    $habito,
                    $fechaRevision
                )
            ) {

                $fechaRevision->modify("-1 day");

                if (
                    $fechaRevision <
                    new DateTime(
                        $habito["fecha_inicio"]
                    )
                ) {
                    break;
                }

                continue;
            }


            $fecha =
                $fechaRevision->format("Y-m-d");


            $valor =
                $registrosPorHabito[
                    $idHabito
                ][$fecha] ?? 0;


            if (
                fechaCompletada(
                    $habito,
                    (float)$valor
                )
            ) {

                $rachaActual++;

                $fechaRevision->modify("-1 day");

            } else {

                break;
            }
        }


        if (
            $rachaActual >
            $mejorRachaActual
        ) {
            $mejorRachaActual =
                $rachaActual;
        }
    }


    /*
     * RESPUESTA FINAL
     */

    responderJSON(

        [

            "exito" =>
                true,

            "periodo" =>
                $periodo,

            "fecha_inicio" =>
                $fechaInicio,

            "fecha_fin" =>
                $fechaFin,

            "progreso_general" =>
                $progresoGeneral,

            "dias_racha" =>
                $mejorRachaActual,

            "habitos_completados" =>
                $totalCompletados,

            "grafica" =>
                $grafica,

            "categorias" =>
                $listaCategorias,

            "habitos_personalizados" =>
                $habitosPersonalizados
        ]

    );


} catch (Throwable $error) {

    error_log(
        "LifeSync - Error en estadisticas.php: " .
        $error->getMessage() .
        " | " .
        $error->getFile() .
        ":" .
        $error->getLine()
    );


    responderJSON(

        [

            "exito" =>
                false,

            "mensaje" =>
                "No se pudieron cargar las estadísticas."
        ],

        500

    );
}