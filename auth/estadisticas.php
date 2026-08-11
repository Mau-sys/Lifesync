<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

ini_set("display_errors", "0");
ini_set("log_errors", "1");


function responder($datos, $codigo = 200)
{
    http_response_code($codigo);

    echo json_encode(
        $datos,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


if (!isset($_SESSION["usuario_id"])) {

    responder(
        [
            "exito" => false,
            "mensaje" => "La sesión ha expirado."
        ],
        401
    );
}


$usuarioId =
    (int) $_SESSION["usuario_id"];


$periodo =
    $_GET["periodo"] ?? "semana";


$periodosPermitidos = [
    "semana",
    "mes",
    "anio"
];


if (
    !in_array(
        $periodo,
        $periodosPermitidos,
        true
    )
) {
    $periodo = "semana";
}


$hoy =
    new DateTime();


$fechaInicio =
    clone $hoy;


$fechaFin =
    clone $hoy;


if ($periodo === "semana") {

    $fechaInicio->modify("-6 days");

}


if ($periodo === "mes") {

    $fechaInicio->modify(
        "first day of this month"
    );

}


if ($periodo === "anio") {

    $fechaInicio->modify(
        "first day of January this year"
    );

}


$fechaInicioTexto =
    $fechaInicio->format("Y-m-d");


$fechaFinTexto =
    $fechaFin->format("Y-m-d");


try {

    /*
     * Conexión
     *
     * __DIR__ evita problemas con rutas relativas.
     */

    require_once __DIR__ .
        "/../config/conexion.php";


    $database =
        new Database();


    $db =
        $database->getConnection();


    if (!$db) {

        responder(
            [
                "exito" => false,
                "mensaje" =>
                    "No se pudo conectar con la base de datos."
            ],
            500
        );

    }


    /*
     * ---------------------------------------------------------
     * HÁBITOS ACTIVOS
     * ---------------------------------------------------------
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
                c.nombre_categoria

             FROM habitos h

             LEFT JOIN categorias c
                ON c.id_categoria = h.id_categoria

             WHERE h.id_usuario = :id_usuario

             AND h.activo = 1

             ORDER BY h.fecha_creacion ASC"
        );


    $consultaHabitos->execute(
        [
            ":id_usuario" =>
                $usuarioId
        ]
    );


    $habitos =
        $consultaHabitos->fetchAll(
            PDO::FETCH_ASSOC
        );


    /*
     * ---------------------------------------------------------
     * RESUMEN GENERAL
     * ---------------------------------------------------------
     */

    $progresoTotal = 0;

    $objetivoTotal = 0;

    $habitosCompletados = 0;


    foreach ($habitos as $habito) {

        $objetivo =
            (float) $habito["objetivo"];


        if ($objetivo <= 0) {
            $objetivo = 1;
        }


        $fechaInicioHabito =
            $habito["fecha_inicio"];


        $fechaFinHabito =
            $habito["fecha_fin"];


        $inicioReal =
            max(
                $fechaInicioTexto,
                $fechaInicioHabito
            );


        $finReal =
            $fechaFinHabito
                ? min(
                    $fechaFinTexto,
                    $fechaFinHabito
                )
                : $fechaFinTexto;


        if ($inicioReal > $finReal) {
            continue;
        }


        $fechaInicioReal =
            new DateTime(
                $inicioReal
            );


        $fechaFinReal =
            new DateTime(
                $finReal
            );


        $diasPeriodo =
            (int)
            $fechaInicioReal
                ->diff($fechaFinReal)
                ->days + 1;


        $vecesEsperadas = 0;


        if (
            $habito["frecuencia"] ===
            "diaria"
        ) {

            $vecesEsperadas =
                $diasPeriodo;

        } elseif (
            $habito["frecuencia"] ===
            "semanal"
        ) {

            $vecesEsperadas =
                max(
                    1,
                    (int) ceil(
                        $diasPeriodo / 7
                    )
                );

        } elseif (
            $habito["frecuencia"] ===
            "mensual"
        ) {

            $mesInicio =
                (
                    (int)
                    $fechaInicioReal->format("Y")
                    * 12
                )
                +
                (int)
                $fechaInicioReal->format("m");


            $mesFin =
                (
                    (int)
                    $fechaFinReal->format("Y")
                    * 12
                )
                +
                (int)
                $fechaFinReal->format("m");


            $vecesEsperadas =
                abs(
                    $mesFin - $mesInicio
                ) + 1;

        }


        if ($vecesEsperadas <= 0) {
            $vecesEsperadas = 1;
        }


        $objetivoEsperado =
            $objetivo *
            $vecesEsperadas;


        /*
         * Registros del hábito.
         */

        $consultaProgreso =
            $db->prepare(
                "SELECT
                    COALESCE(
                        SUM(valor_registrado),
                        0
                    ) AS progreso

                 FROM registros_habitos

                 WHERE id_habito = :id_habito

                 AND DATE(fecha_registro)
                     BETWEEN :fecha_inicio
                     AND :fecha_fin"
            );


        $consultaProgreso->execute(
            [
                ":id_habito" =>
                    $habito["id_habito"],

                ":fecha_inicio" =>
                    $inicioReal,

                ":fecha_fin" =>
                    $finReal
            ]
        );


        $progreso =
            $consultaProgreso->fetch(
                PDO::FETCH_ASSOC
            );


        $valorProgreso =
            (float)
            ($progreso["progreso"] ?? 0);


        $progresoTotal +=
            $valorProgreso;


        $objetivoTotal +=
            $objetivoEsperado;


        if (
            $valorProgreso >=
            $objetivoEsperado
        ) {

            $habitosCompletados++;

        }

    }


    $progresoGeneral = 0;


    if ($objetivoTotal > 0) {

        $progresoGeneral =
            (
                $progresoTotal /
                $objetivoTotal
            ) * 100;

    }


    $progresoGeneral =
        max(
            0,
            min(
                100,
                $progresoGeneral
            )
        );


    /*
     * ---------------------------------------------------------
     * RACHA
     * ---------------------------------------------------------
     */

    $consultaRacha =
        $db->prepare(
            "SELECT
                COALESCE(
                    MAX(r.racha_actual),
                    0
                ) AS dias_racha

             FROM rachas r

             INNER JOIN habitos h
                ON h.id_habito = r.id_habito

             WHERE h.id_usuario = :id_usuario

             AND h.activo = 1"
        );


    $consultaRacha->execute(
        [
            ":id_usuario" =>
                $usuarioId
        ]
    );


    $racha =
        $consultaRacha->fetch(
            PDO::FETCH_ASSOC
        );


    $diasRacha =
        (int)
        ($racha["dias_racha"] ?? 0);


    /*
     * ---------------------------------------------------------
     * GRÁFICA GENERAL
     * ---------------------------------------------------------
     */

    $grafica = [];


    if ($periodo === "semana") {

        $cursor =
            new DateTime(
                $fechaInicioTexto
            );


        $diasEspanol = [
            "Mon" => "Lun",
            "Tue" => "Mar",
            "Wed" => "Mié",
            "Thu" => "Jue",
            "Fri" => "Vie",
            "Sat" => "Sáb",
            "Sun" => "Dom"
        ];


        for (
            $i = 0;
            $i < 7;
            $i++
        ) {

            $fecha =
                $cursor->format("Y-m-d");


            $consultaDia =
                $db->prepare(
                    "SELECT
                        COALESCE(
                            SUM(r.valor_registrado),
                            0
                        ) AS progreso

                     FROM registros_habitos r

                     INNER JOIN habitos h
                        ON h.id_habito = r.id_habito

                     WHERE h.id_usuario = :id_usuario

                     AND h.activo = 1

                     AND DATE(r.fecha_registro)
                         = :fecha"
                );


            $consultaDia->execute(
                [
                    ":id_usuario" =>
                        $usuarioId,

                    ":fecha" =>
                        $fecha
                ]
            );


            $resultadoDia =
                $consultaDia->fetch(
                    PDO::FETCH_ASSOC
                );


            $valorDia =
                (float)
                ($resultadoDia["progreso"] ?? 0);


            $objetivoDia = 0;


            foreach ($habitos as $habito) {

                if (
                    $fecha <
                    $habito["fecha_inicio"]
                ) {
                    continue;
                }


                if (
                    !empty(
                        $habito["fecha_fin"]
                    )
                    &&
                    $fecha >
                    $habito["fecha_fin"]
                ) {
                    continue;
                }


                if (
                    $habito["frecuencia"] ===
                    "diaria"
                ) {

                    $objetivoDia +=
                        max(
                            1,
                            (float)
                            $habito["objetivo"]
                        );

                }

            }


            $porcentajeDia = 0;


            if ($objetivoDia > 0) {

                $porcentajeDia =
                    (
                        $valorDia /
                        $objetivoDia
                    ) * 100;

            }


            $porcentajeDia =
                max(
                    0,
                    min(
                        100,
                        $porcentajeDia
                    )
                );


            $dia =
                $cursor->format("D");


            $grafica[] = [
                "etiqueta" =>
                    $diasEspanol[$dia]
                    ?? $dia,

                "porcentaje" =>
                    round(
                        $porcentajeDia,
                        2
                    )
            ];


            $cursor->modify("+1 day");

        }

    } else {

        $cursor =
            new DateTime(
                $fechaInicioTexto
            );


        $fin =
            new DateTime(
                $fechaFinTexto
            );


        $meses = [
            "01" => "Ene",
            "02" => "Feb",
            "03" => "Mar",
            "04" => "Abr",
            "05" => "May",
            "06" => "Jun",
            "07" => "Jul",
            "08" => "Ago",
            "09" => "Sep",
            "10" => "Oct",
            "11" => "Nov",
            "12" => "Dic"
        ];


        while ($cursor <= $fin) {

            if ($periodo === "mes") {

                $inicioBloque =
                    $cursor->format(
                        "Y-m-d"
                    );


                $finBloque =
                    $cursor->format(
                        "Y-m-d"
                    );


                $etiqueta =
                    $cursor->format("d");


                $cursor->modify(
                    "+1 day"
                );

            } else {

                $inicioBloque =
                    $cursor->format(
                        "Y-m-01"
                    );


                $finBloque =
                    $cursor->format(
                        "Y-m-t"
                    );


                if (
                    $finBloque >
                    $fechaFinTexto
                ) {

                    $finBloque =
                        $fechaFinTexto;

                }


                $etiqueta =
                    $meses[
                        $cursor->format("m")
                    ];


                $cursor->modify(
                    "+1 month"
                );

            }


            $consultaBloque =
                $db->prepare(
                    "SELECT
                        COALESCE(
                            SUM(r.valor_registrado),
                            0
                        ) AS progreso

                     FROM registros_habitos r

                     INNER JOIN habitos h
                        ON h.id_habito = r.id_habito

                     WHERE h.id_usuario = :id_usuario

                     AND h.activo = 1

                     AND DATE(r.fecha_registro)
                         BETWEEN :fecha_inicio
                         AND :fecha_fin"
                );


            $consultaBloque->execute(
                [
                    ":id_usuario" =>
                        $usuarioId,

                    ":fecha_inicio" =>
                        $inicioBloque,

                    ":fecha_fin" =>
                        $finBloque
                ]
            );


            $resultadoBloque =
                $consultaBloque->fetch(
                    PDO::FETCH_ASSOC
                );


            $valorBloque =
                (float)
                ($resultadoBloque["progreso"] ?? 0);


            $porcentajeBloque = 0;


            if (
                $progresoTotal > 0
            ) {

                $porcentajeBloque =
                    (
                        $valorBloque /
                        $progresoTotal
                    ) * 100;

            }


            $porcentajeBloque =
                max(
                    0,
                    min(
                        100,
                        $porcentajeBloque
                    )
                );


            $grafica[] = [
                "etiqueta" =>
                    $etiqueta,

                "porcentaje" =>
                    round(
                        $porcentajeBloque,
                        2
                    )
            ];

        }

    }


    /*
     * ---------------------------------------------------------
     * ESTADÍSTICAS POR CATEGORÍA
     * ---------------------------------------------------------
     */

    $categorias = [];


    $consultaCategorias =
        $db->prepare(
            "SELECT
                c.id_categoria,
                c.nombre_categoria

             FROM categorias c

             INNER JOIN habitos h
                ON h.id_categoria =
                   c.id_categoria

             WHERE h.id_usuario =
                   :id_usuario

             AND h.activo = 1

             AND c.nombre_categoria <>
                 'Hábito Personalizado'

             GROUP BY
                c.id_categoria,
                c.nombre_categoria

             ORDER BY
                c.nombre_categoria ASC"
        );


    $consultaCategorias->execute(
        [
            ":id_usuario" =>
                $usuarioId
        ]
    );


    $listaCategorias =
        $consultaCategorias->fetchAll(
            PDO::FETCH_ASSOC
        );


    foreach (
        $listaCategorias
        as $categoria
    ) {

        $consultaCategoria =
            $db->prepare(
                "SELECT

                    COALESCE(
                        SUM(r.valor_registrado),
                        0
                    ) AS progreso,

                    COUNT(
                        DISTINCT DATE(
                            r.fecha_registro
                        )
                    ) AS registros

                 FROM habitos h

                 LEFT JOIN registros_habitos r
                    ON r.id_habito =
                       h.id_habito

                    AND DATE(r.fecha_registro)
                        BETWEEN :fecha_inicio
                        AND :fecha_fin

                 WHERE h.id_usuario =
                       :id_usuario

                 AND h.id_categoria =
                     :id_categoria

                 AND h.activo = 1"
            );


        $consultaCategoria->execute(
            [
                ":fecha_inicio" =>
                    $fechaInicioTexto,

                ":fecha_fin" =>
                    $fechaFinTexto,

                ":id_usuario" =>
                    $usuarioId,

                ":id_categoria" =>
                    $categoria["id_categoria"]
            ]
        );


        $datosCategoria =
            $consultaCategoria->fetch(
                PDO::FETCH_ASSOC
            );


        $registrosCategoria =
            (int)
            ($datosCategoria["registros"] ?? 0);


        $cantidadHabitos = 0;


        foreach (
            $habitos
            as $habito
        ) {

            if (
                (int)
                $habito["id_categoria"]
                ===
                (int)
                $categoria["id_categoria"]
            ) {

                $cantidadHabitos++;

            }

        }


        $porcentajeCategoria = 0;


        if (
            $cantidadHabitos > 0 &&
            $registrosCategoria > 0
        ) {

            $porcentajeCategoria =
                min(
                    100,
                    (
                        $registrosCategoria /
                        $cantidadHabitos
                    ) * 100
                );

        }


        $categorias[] = [

            "nombre" =>
                $categoria[
                    "nombre_categoria"
                ],

            "detalle" =>
                $cantidadHabitos .
                (
                    $cantidadHabitos === 1
                        ? " hábito"
                        : " hábitos"
                ) .
                " registrado" .
                (
                    $registrosCategoria === 1
                        ? ""
                        : "s"
                ),

            "porcentaje" =>
                round(
                    $porcentajeCategoria,
                    2
                )

        ];

    }


    /*
     * ---------------------------------------------------------
     * HÁBITOS PERSONALIZADOS
     * ---------------------------------------------------------
     */

    $habitosPersonalizados = [];


    foreach (
        $habitos
        as $habito
    ) {

        if (
            $habito["nombre_categoria"] !==
            "Hábito Personalizado"
        ) {
            continue;
        }


        $consultaHabito =
            $db->prepare(
                "SELECT

                    COALESCE(
                        SUM(
                            valor_registrado
                        ),
                        0
                    ) AS progreso,

                    COUNT(
                        DISTINCT DATE(
                            fecha_registro
                        )
                    ) AS registros

                 FROM registros_habitos

                 WHERE id_habito =
                       :id_habito

                 AND DATE(fecha_registro)
                     BETWEEN :fecha_inicio
                     AND :fecha_fin"
            );


        $consultaHabito->execute(
            [
                ":id_habito" =>
                    $habito["id_habito"],

                ":fecha_inicio" =>
                    $fechaInicioTexto,

                ":fecha_fin" =>
                    $fechaFinTexto
            ]
        );


        $datosHabito =
            $consultaHabito->fetch(
                PDO::FETCH_ASSOC
            );


        $progresoHabito =
            (float)
            ($datosHabito["progreso"] ?? 0);


        $registrosHabito =
            (int)
            ($datosHabito["registros"] ?? 0);


        $objetivoHabito =
            max(
                1,
                (float)
                $habito["objetivo"]
            );


        $porcentajeHabito =
            (
                $progresoHabito /
                $objetivoHabito
            ) * 100;


        if (
            $registrosHabito === 0
        ) {

            $porcentajeHabito = 0;

        }


        $porcentajeHabito =
            max(
                0,
                min(
                    100,
                    $porcentajeHabito
                )
            );


        $detalleHabito =
            $registrosHabito .
            (
                $registrosHabito === 1
                    ? " registro"
                    : " registros"
            );


        $habitosPersonalizados[] = [

            "nombre" =>
                $habito["nombre_habito"],

            "detalle" =>
                $detalleHabito,

            "porcentaje" =>
                round(
                    $porcentajeHabito,
                    2
                )

        ];

    }


    /*
     * ---------------------------------------------------------
     * RESPUESTA FINAL
     * ---------------------------------------------------------
     */

    responder(
        [
            "exito" => true,

            "periodo" =>
                $periodo,

            "fecha_inicio" =>
                $fechaInicioTexto,

            "fecha_fin" =>
                $fechaFinTexto,

            "resumen" => [

                "progreso_general" =>
                    round(
                        $progresoGeneral,
                        2
                    ),

                "dias_racha" =>
                    $diasRacha,

                "habitos_completados" =>
                    $habitosCompletados

            ],

            "grafica" =>
                $grafica,

            "categorias" =>
                $categorias,

            "habitos" =>
                $habitosPersonalizados

        ]
    );


} catch (Throwable $error) {

    error_log(
        "LifeSync estadisticas.php: " .
        $error->getMessage() .
        " en " .
        $error->getFile() .
        ":" .
        $error->getLine()
    );


    responder(
        [
            "exito" => false,
            "mensaje" =>
                "No se pudieron cargar las estadísticas."
        ],
        500
    );

}

?>