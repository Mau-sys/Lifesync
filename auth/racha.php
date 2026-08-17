<?php

declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/conexion.php';


/*
=========================================================
RESPUESTA JSON
=========================================================
*/

function responder(
    bool $exito,
    string $mensaje = '',
    array $datos = [],
    int $codigo = 200
): never {

    http_response_code($codigo);

    echo json_encode(
        array_merge(
            [
                'exito' => $exito,
                'mensaje' => $mensaje
            ],
            $datos
        ),
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


/*
=========================================================
USUARIO DE LA SESIÓN
=========================================================
*/

function obtenerUsuarioSesion(): int
{
    $ids = [
        $_SESSION['id_usuario'] ?? null,
        $_SESSION['usuario_id'] ?? null,
        $_SESSION['id'] ?? null
    ];

    foreach ($ids as $id) {

        if (
            is_numeric($id) &&
            (int)$id > 0
        ) {

            return (int)$id;

        }

    }

    responder(
        false,
        'La sesión del usuario no es válida.',
        [
            'codigo' => 'SESION_INVALIDA'
        ],
        401
    );
}


/*
=========================================================
CONEXIÓN
=========================================================
*/

try {

    /*
    IMPORTANTE:
    Tu conexion.php devuelve la conexión mediante
    Database->getConnection().
    */

    $database = new Database();

    $conexion = $database->getConnection();

    if (!$conexion instanceof PDO) {

        responder(
            false,
            'No se pudo establecer la conexión con la base de datos.',
            [
                'codigo' => 'ERROR_CONEXION'
            ],
            500
        );

    }


    /*
    =====================================================
    USUARIO
    =====================================================
    */

    $idUsuario = obtenerUsuarioSesion();


    /*
    =====================================================
    1. OBTENER HÁBITOS ACTIVOS
    =====================================================
    */

    $sqlHabitos = "
        SELECT

            h.id_habito,
            h.id_categoria,
            h.nombre_habito,
            h.objetivo,
            h.frecuencia,
            h.fecha_inicio,
            h.fecha_fin,
            h.activo,

            c.nombre_categoria

        FROM habitos h

        LEFT JOIN categorias c
            ON c.id_categoria = h.id_categoria

        WHERE h.id_usuario = :id_usuario

        AND h.activo = 1

        AND h.fecha_inicio <= CURDATE()

        AND (
            h.fecha_fin IS NULL
            OR h.fecha_fin >= CURDATE()
        )

        ORDER BY
            h.id_categoria,
            h.id_habito
    ";

    $stmtHabitos = $conexion->prepare($sqlHabitos);

    $stmtHabitos->execute([
        ':id_usuario' => $idUsuario
    ]);

    $habitos = $stmtHabitos->fetchAll(PDO::FETCH_ASSOC);


    /*
    =====================================================
    SI NO HAY HÁBITOS
    =====================================================
    */

    if (!$habitos) {

        responder(
            true,
            'No hay hábitos activos todavía.',
            [
                'racha_actual' => 0,
                'mejor_racha' => 0,
                'habitos_completados' => 0,
                'dias_registrados' => 0,
                'constelacion_actual' => [],
                'categorias' => [],
                'historial_constelaciones' => []
            ]
        );

    }


    /*
    =====================================================
    2. PREPARAR IDS
    =====================================================
    */

    $idsHabitos = [];

    foreach ($habitos as $habito) {

        $idsHabitos[] =
            (int)$habito['id_habito'];

    }

    $placeholders = implode(
        ',',
        array_fill(
            0,
            count($idsHabitos),
            '?'
        )
    );


    /*
    =====================================================
    3. OBTENER REGISTROS DE HÁBITOS
    =====================================================

    Los PHP futuros de:

    - Hidratación
    - Alimentación
    - Salud Mental
    - Actividad Física
    - Académico
    - Personalizado

    solamente tendrán que registrar datos en:

        registros_habitos

    Rachas podrá utilizarlos automáticamente.
    =====================================================
    */

    $sqlRegistros = "
        SELECT

            rh.id_registro,
            rh.id_habito,
            DATE(rh.fecha_registro) AS fecha,
            rh.valor_registrado,
            rh.observaciones

        FROM registros_habitos rh

        WHERE rh.id_habito IN ($placeholders)

        ORDER BY
            rh.fecha_registro ASC
    ";

    $stmtRegistros =
        $conexion->prepare($sqlRegistros);

    $stmtRegistros->execute(
        $idsHabitos
    );

    $registros =
        $stmtRegistros->fetchAll(
            PDO::FETCH_ASSOC
        );


    /*
    =====================================================
    4. OBTENER ESTADÍSTICAS SI EXISTEN
    =====================================================

    Se utiliza como complemento.

    Si los PHP futuros llenan
    estadisticas_habitos, también funcionará.

    =====================================================
    */

    $sqlEstadisticas = "
        SELECT

            e.id_habito,
            e.fecha,
            e.objetivo,
            e.progreso,
            e.porcentaje,
            e.completado

        FROM estadisticas_habitos e

        WHERE e.id_habito IN ($placeholders)

        ORDER BY
            e.fecha ASC
    ";

    $stmtEstadisticas =
        $conexion->prepare(
            $sqlEstadisticas
        );

    $stmtEstadisticas->execute(
        $idsHabitos
    );

    $estadisticas =
        $stmtEstadisticas->fetchAll(
            PDO::FETCH_ASSOC
        );


    /*
    =====================================================
    5. OBJETIVOS DE LOS HÁBITOS
    =====================================================
    */

    $objetivos = [];

    foreach ($habitos as $habito) {

        $objetivos[
            (int)$habito['id_habito']
        ] =
            (float)$habito['objetivo'];

    }


    /*
    =====================================================
    6. DÍAS COMPLETADOS POR HÁBITO
    =====================================================
    */

    $diasPorHabito = [];


    /*
    -----------------------------------------------------
    REGISTROS NORMALES
    -----------------------------------------------------
    */

    foreach ($registros as $registro) {

        $idHabito =
            (int)$registro['id_habito'];

        $fecha =
            (string)$registro['fecha'];

        $valor =
            (float)$registro['valor_registrado'];

        $objetivo =
            $objetivos[$idHabito] ?? 1;


        if (
            $objetivo <= 0
        ) {

            $objetivo = 1;

        }


        /*
        Un día queda completado cuando
        el valor registrado alcanza el objetivo.
        */

        if ($valor >= $objetivo) {

            if (
                !isset(
                    $diasPorHabito[$idHabito]
                )
            ) {

                $diasPorHabito[$idHabito] = [];

            }

            $diasPorHabito[$idHabito][$fecha] = true;

        }

    }


    /*
    -----------------------------------------------------
    ESTADÍSTICAS
    -----------------------------------------------------
    */

    foreach ($estadisticas as $registro) {

        $idHabito =
            (int)$registro['id_habito'];

        $fecha =
            (string)$registro['fecha'];

        $completado =
            (int)$registro['completado'] === 1;

        $progreso =
            (float)($registro['progreso'] ?? 0);

        $objetivo =
            (float)($registro['objetivo'] ?? 0);


        if (
            !$completado &&
            $objetivo > 0 &&
            $progreso >= $objetivo
        ) {

            $completado = true;

        }


        if ($completado) {

            if (
                !isset(
                    $diasPorHabito[$idHabito]
                )
            ) {

                $diasPorHabito[$idHabito] = [];

            }

            $diasPorHabito[$idHabito][$fecha] = true;

        }

    }


    /*
    =====================================================
    7. DÍAS REGISTRADOS
    =====================================================
    */

    $diasRegistradosSet = [];

    foreach (
        $diasPorHabito as $fechas
    ) {

        foreach (
            $fechas as $fecha => $valor
        ) {

            $diasRegistradosSet[$fecha] = true;

        }

    }

    $diasRegistrados =
        count($diasRegistradosSet);


    /*
    =====================================================
    8. DÍAS COMPLETOS
    =====================================================

    Un día es completo cuando TODOS los hábitos
    activos del usuario fueron completados.

    =====================================================
    */

    $cantidadHabitos =
        count($habitos);

    $completadosPorDia = [];


    foreach (
        $diasPorHabito as $idHabito => $fechas
    ) {

        foreach (
            $fechas as $fecha => $valor
        ) {

            if (
                !isset(
                    $completadosPorDia[$fecha]
                )
            ) {

                $completadosPorDia[$fecha] = 0;

            }

            $completadosPorDia[$fecha]++;

        }

    }


    $diasCompletos = [];


    foreach (
        $completadosPorDia as $fecha => $cantidad
    ) {

        if (
            $cantidad >= $cantidadHabitos
        ) {

            $diasCompletos[] =
                $fecha;

        }

    }


    sort($diasCompletos);


    /*
    =====================================================
    9. MEJOR RACHA
    =====================================================
    */

    $mejorRacha = 0;

    $rachaTemporal = 0;

    $ultimaFecha = null;


    foreach (
        $diasCompletos as $fecha
    ) {

        if ($ultimaFecha === null) {

            $rachaTemporal = 1;

        } else {

            $fechaAnterior =
                new DateTime(
                    $ultimaFecha
                );

            $fechaActual =
                new DateTime(
                    $fecha
                );

            $diferencia =
                (int)$fechaAnterior
                    ->diff($fechaActual)
                    ->format('%a');


            if ($diferencia === 1) {

                $rachaTemporal++;

            } else {

                $rachaTemporal = 1;

            }

        }


        if (
            $rachaTemporal >
            $mejorRacha
        ) {

            $mejorRacha =
                $rachaTemporal;

        }


        $ultimaFecha =
            $fecha;

    }


    /*
    =====================================================
    10. RACHA ACTUAL
    =====================================================
    */

    $rachaActual = 0;

    $conjuntoDias =
        array_flip(
            $diasCompletos
        );


    $hoy =
        new DateTime(
            date('Y-m-d')
        );


    if (!empty($diasCompletos)) {

        $ultimaFechaCompleta =
            end($diasCompletos);

        $fechaUltima =
            new DateTime(
                $ultimaFechaCompleta
            );

        $diferenciaHoy =
            (int)$fechaUltima
                ->diff($hoy)
                ->format('%a');


        /*
        Hoy
        */

        if (
            $diferenciaHoy === 0
        ) {

            $fechaBuscada =
                clone $hoy;

            while (
                isset(
                    $conjuntoDias[
                        $fechaBuscada
                            ->format('Y-m-d')
                    ]
                )
            ) {

                $rachaActual++;

                $fechaBuscada
                    ->modify('-1 day');

            }

        /*
        Ayer
        */

        } elseif (
            $diferenciaHoy === 1
        ) {

            $fechaBuscada =
                clone $fechaUltima;

            while (
                isset(
                    $conjuntoDias[
                        $fechaBuscada
                            ->format('Y-m-d')
                    ]
                )
            ) {

                $rachaActual++;

                $fechaBuscada
                    ->modify('-1 day');

            }

        }

    }


    /*
    =====================================================
    11. HÁBITOS COMPLETADOS
    =====================================================
    */

    $habitosCompletados = 0;


    foreach (
        $diasPorHabito as $fechas
    ) {

        $habitosCompletados +=
            count($fechas);

    }


    /*
    =====================================================
    12. CONSTELACIÓN ACTUAL
    =====================================================
    */

    $primerDiaMes =
        date('Y-m-01');

    $ultimoDiaMes =
        date('Y-m-t');

    $constelacionActual = [];


    foreach (
        $diasCompletos as $fecha
    ) {

        if (
            $fecha >= $primerDiaMes &&
            $fecha <= $ultimoDiaMes
        ) {

            $constelacionActual[] =
                $fecha;

        }

    }


    /*
    =====================================================
    13. CATEGORÍAS
    =====================================================
    */

    $categorias = [];


    foreach ($habitos as $habito) {

        $idCategoria =
            $habito['id_categoria'] !== null
                ? (int)$habito['id_categoria']
                : null;


        if ($idCategoria === null) {

            continue;

        }


        if (
            !isset(
                $categorias[$idCategoria]
            )
        ) {

            $categorias[$idCategoria] = [

                'id_categoria' =>
                    $idCategoria,

                'nombre_categoria' =>
                    $habito['nombre_categoria']
                    ?? 'Categoría',

                'total_habitos' =>
                    0,

                'dias_completados' =>
                    0

            ];

        }


        $categorias[
            $idCategoria
        ]['total_habitos']++;


        $idHabito =
            (int)$habito['id_habito'];


        $diasCategoria =
            $diasPorHabito[
                $idHabito
            ] ?? [];


        $categorias[
            $idCategoria
        ]['dias_completados'] +=
            count($diasCategoria);

    }


    /*
    =====================================================
    14. PORCENTAJE DE CADA CATEGORÍA
    =====================================================
    */

    foreach (
        $categorias as &$categoria
    ) {

        $total =
            (int)$categoria[
                'total_habitos'
            ];

        $dias =
            (int)$categoria[
                'dias_completados'
            ];


        /*
        Calculamos una constancia sencilla
        basada en los últimos 30 días.

        Máximo posible:
        cantidad de hábitos × 30 días.
        */

        $maximo =
            $total * 30;


        if ($maximo > 0) {

            $porcentaje =
                ($dias / $maximo) * 100;

        } else {

            $porcentaje = 0;

        }


        $categoria['porcentaje'] =
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

    }

    unset($categoria);


    $categorias =
        array_values(
            $categorias
        );


    /*
    =====================================================
    15. HISTORIAL MENSUAL
    =====================================================
    */

    $historial = [];


    foreach (
        $diasRegistradosSet as $fecha => $valor
    ) {

        $mes =
            substr(
                $fecha,
                0,
                7
            );


        if (
            !isset(
                $historial[$mes]
            )
        ) {

            $historial[$mes] = [

                'mes' => $mes,

                'dias_con_registro' => 0

            ];

        }


        $historial[$mes][
            'dias_con_registro'
        ]++;

    }


    $historial =
        array_values(
            $historial
        );


    usort(
        $historial,
        function ($a, $b) {

            return strcmp(
                $b['mes'],
                $a['mes']
            );

        }
    );


    /*
    =====================================================
    16. RESPUESTA FINAL
    =====================================================
    */

    responder(
        true,
        'Rachas cargadas correctamente.',
        [

            'racha_actual' =>
                $rachaActual,

            'mejor_racha' =>
                $mejorRacha,

            'habitos_completados' =>
                $habitosCompletados,

            'dias_registrados' =>
                $diasRegistrados,

            'constelacion_actual' =>
                $constelacionActual,

            'categorias' =>
                $categorias,

            'historial_constelaciones' =>
                $historial

        ]
    );


} catch (Throwable $error) {

    error_log(
        'Error en racha.php: ' .
        $error->getMessage()
    );


    responder(
        false,
        'Ocurrió un error interno al cargar las rachas.',
        [
            'codigo' =>
                'ERROR_RACHAS'
        ],
        500
    );

}