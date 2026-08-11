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

$usuarioId = (int) $_SESSION["usuario_id"];

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

    $db->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );


    /*
     * USUARIO
     */

    $consultaUsuario = $db->prepare(
        "SELECT
            u.nombre_usuario,
            p.foto_perfil
         FROM usuario u
         LEFT JOIN perfil_usuario p
            ON p.id_usuario = u.id_usuario
         WHERE u.id_usuario = :id_usuario
         LIMIT 1"
    );

    $consultaUsuario->execute([
        ":id_usuario" => $usuarioId
    ]);

    $usuario =
        $consultaUsuario->fetch(
            PDO::FETCH_ASSOC
        );

    if (!$usuario) {

        http_response_code(404);

        echo json_encode([
            "exito" => false,
            "mensaje" => "Usuario no encontrado."
        ]);

        exit;
    }


    /*
     * HÁBITOS
     */

    $consultaHabitos = $db->prepare(
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

            c.nombre_categoria AS categoria,

            COALESCE(
                (
                    SELECT SUM(rh.valor_registrado)
                    FROM registros_habitos rh
                    WHERE rh.id_habito = h.id_habito
                    AND DATE(rh.fecha_registro) = CURDATE()
                ),
                0
            ) AS progreso

         FROM habitos h

         LEFT JOIN categorias c
            ON c.id_categoria = h.id_categoria

         WHERE h.id_usuario = :id_usuario
         AND h.activo = 1

         ORDER BY h.fecha_creacion ASC"
    );

    $consultaHabitos->execute([
        ":id_usuario" => $usuarioId
    ]);

    $habitos =
        $consultaHabitos->fetchAll(
            PDO::FETCH_ASSOC
        );


    /*
     * HÁBITOS DE HOY
     */

    $habitosHoy = [];

    $habitosPendientes = [];

    $totalHabitos = 0;

    $habitosCompletados = 0;

    $diaSemanaActual =
        (int) date("N");


    foreach ($habitos as $habito) {

        $frecuencia =
            strtolower(
                trim(
                    (string) (
                        $habito["frecuencia"] ?? ""
                    )
                )
            );


        $debeMostrarHoy = false;


        if (
            $frecuencia === "" ||
            $frecuencia === "diaria" ||
            $frecuencia === "diario"
        ) {

            $debeMostrarHoy = true;

        } elseif (
            $frecuencia === "semanal" ||
            $frecuencia === "semanalmente"
        ) {

            $dias =
                trim(
                    (string) (
                        $habito["dias_semana"] ?? ""
                    )
                );


            if ($dias === "") {

                $debeMostrarHoy = true;

            } else {

                $listaDias =
                    preg_split(
                        "/[,; ]+/",
                        $dias,
                        -1,
                        PREG_SPLIT_NO_EMPTY
                    );


                $listaDiasNumeros = [];


                foreach ($listaDias as $dia) {

                    $dia = trim($dia);


                    if (is_numeric($dia)) {

                        $numero =
                            (int) $dia;

                        if (
                            $numero >= 1 &&
                            $numero <= 7
                        ) {

                            $listaDiasNumeros[] =
                                $numero;

                        }

                    }

                }


                $debeMostrarHoy =
                    in_array(
                        $diaSemanaActual,
                        $listaDiasNumeros,
                        true
                    );
            }

        } else {

            /*
             * Si existe una frecuencia diferente
             * pero el hábito está activo y no se
             * puede interpretar, se muestra para
             * evitar que desaparezca del Inicio.
             */

            $debeMostrarHoy = true;

        }


        if (!$debeMostrarHoy) {
            continue;
        }


        $totalHabitos++;


        $objetivo =
            (float) (
                $habito["objetivo"] ?? 0
            );


        $progreso =
            (float) (
                $habito["progreso"] ?? 0
            );


        $porcentaje = 0;


        if ($objetivo > 0) {

            $porcentaje =
                (
                    $progreso /
                    $objetivo
                ) * 100;

        } elseif (
            strtolower(
                trim(
                    (string) (
                        $habito["tipo_medicion"] ?? ""
                    )
                )
            ) === "completar"
        ) {

            /*
             * Para hábitos de tipo completar,
             * un registro con valor >= 1 significa
             * que fue completado.
             */

            $porcentaje =
                $progreso > 0
                    ? 100
                    : 0;

        }


        $porcentaje =
            max(
                0,
                min(
                    100,
                    $porcentaje
                )
            );


        $completado =
            $porcentaje >= 100;


        if ($completado) {

            $habitosCompletados++;

        }


        $detalle = "";


        $tipoMedicion =
            strtolower(
                trim(
                    (string) (
                        $habito["tipo_medicion"] ?? ""
                    )
                )
            );


        if ($tipoMedicion === "completar") {

            $detalle =
                $completado
                    ? "Completado"
                    : "Pendiente";

        } else {

            $detalle =
                number_format(
                    $progreso,
                    0
                )
                .
                " de "
                .
                number_format(
                    $objetivo,
                    0
                )
                .
                (
                    !empty(
                        $habito["unidad_medida"]
                    )
                        ? " " .
                            $habito["unidad_medida"]
                        : ""
                );

        }


        $datosHabito = [

            "id_habito" =>
                (int) $habito["id_habito"],

            "nombre_habito" =>
                $habito["nombre_habito"],

            "descripcion" =>
                $habito["descripcion"],

            "categoria" =>
                $habito["categoria"]
                    ?: "Hábito Personalizado",

            "objetivo" =>
                $objetivo,

            "progreso" =>
                $progreso,

            "unidad_medida" =>
                $habito["unidad_medida"],

            "tipo_medicion" =>
                $habito["tipo_medicion"],

            "frecuencia" =>
                $habito["frecuencia"],

            "porcentaje" =>
                round(
                    $porcentaje,
                    2
                ),

            "completado" =>
                $completado,

            "detalle" =>
                $detalle

        ];


        /*
         * TODOS LOS HÁBITOS DE HOY
         */

        $habitosHoy[] =
            $datosHabito;


        /*
         * HÁBITOS PENDIENTES
         */

        if (!$completado) {

            $habitosPendientes[] =
                $datosHabito;

        }

    }


    /*
     * PROGRESO GENERAL
     */

    $porcentajeGeneral = 0;


    if ($totalHabitos > 0) {

        $porcentajeGeneral =
            (
                $habitosCompletados /
                $totalHabitos
            ) * 100;

    }


    $porcentajeGeneral =
        max(
            0,
            min(
                100,
                $porcentajeGeneral
            )
        );


    /*
     * RACHA
     */

    $consultaRacha = $db->prepare(
        "SELECT
            COALESCE(
                MAX(r.racha_actual),
                0
            ) AS racha

         FROM rachas r

         INNER JOIN habitos h
            ON h.id_habito = r.id_habito

         WHERE h.id_usuario = :id_usuario
         AND h.activo = 1"
    );

    $consultaRacha->execute([
        ":id_usuario" => $usuarioId
    ]);

    $racha =
        (int) (
            $consultaRacha->fetchColumn() ?: 0
        );


    /*
     * NOTIFICACIONES
     */

    $consultaNotificaciones = $db->prepare(
        "SELECT
            id_notificacion,
            titulo,
            mensaje,
            leida,
            fecha_notificacion

         FROM notificaciones

         WHERE id_usuario = :id_usuario

         ORDER BY fecha_notificacion DESC

         LIMIT 50"
    );

    $consultaNotificaciones->execute([
        ":id_usuario" => $usuarioId
    ]);

    $notificacionesBD =
        $consultaNotificaciones->fetchAll(
            PDO::FETCH_ASSOC
        );


    $notificaciones = [];


    foreach (
        $notificacionesBD
        as $notificacion
    ) {

        $fecha =
            new DateTime(
                $notificacion[
                    "fecha_notificacion"
                ]
            );


        $notificaciones[] = [

            "id_notificacion" =>
                (int) $notificacion[
                    "id_notificacion"
                ],

            "titulo" =>
                $notificacion["titulo"],

            "mensaje" =>
                $notificacion["mensaje"],

            "leida" =>
                (
                    (int) $notificacion["leida"]
                    === 1
                ),

            "fecha_formateada" =>
                $fecha->format(
                    "d/m/Y H:i"
                )

        ];

    }


    /*
     * NOTIFICACIÓN DE BIENVENIDA
     *
     * Solo se crea si el usuario todavía
     * no tiene ninguna notificación.
     */

    if (
        count($notificaciones) === 0
    ) {

        $titulo =
            "Bienvenido a LifeSync";

        $mensaje =
            "Activa los permisos de notificaciones y recordatorios para recibir avisos importantes de tus hábitos y rachas.";


        $insertarNotificacion =
            $db->prepare(
                "INSERT INTO notificaciones
                (
                    id_usuario,
                    titulo,
                    mensaje,
                    leida
                )
                VALUES
                (
                    :id_usuario,
                    :titulo,
                    :mensaje,
                    0
                )"
            );


        $insertarNotificacion->execute([
            ":id_usuario" =>
                $usuarioId,

            ":titulo" =>
                $titulo,

            ":mensaje" =>
                $mensaje
        ]);


        $notificaciones = [

            [

                "id_notificacion" =>
                    (int) $db->lastInsertId(),

                "titulo" =>
                    $titulo,

                "mensaje" =>
                    $mensaje,

                "leida" =>
                    false,

                "fecha_formateada" =>
                    date("d/m/Y H:i")

            ]

        ];

    }


    /*
     * NOTIFICACIONES NO LEÍDAS
     */

    $consultaNoLeidas =
        $db->prepare(
            "SELECT COUNT(*)

             FROM notificaciones

             WHERE id_usuario = :id_usuario

             AND leida = 0"
        );


    $consultaNoLeidas->execute([
        ":id_usuario" =>
            $usuarioId
    ]);


    $notificacionesNoLeidas =
        (int) (
            $consultaNoLeidas->fetchColumn()
            ?: 0
        );


    /*
     * RESPUESTA FINAL
     */

    echo json_encode(
        [

            "exito" =>
                true,

            "usuario" => [

                "nombre" =>
                    $usuario[
                        "nombre_usuario"
                    ],

                "foto" =>
                    $usuario[
                        "foto_perfil"
                    ]
                        ?: null

            ],

            "progreso" => [

                "porcentaje" =>
                    round(
                        $porcentajeGeneral,
                        2
                    ),

                "total_habitos" =>
                    $totalHabitos,

                "completados" =>
                    $habitosCompletados,

                "pendientes" =>
                    count(
                        $habitosPendientes
                    )

            ],

            "racha" =>
                $racha,

            "habitos_hoy" =>
                $habitosHoy,

            "habitos_pendientes" =>
                $habitosPendientes,

            "notificaciones" =>
                $notificaciones,

            "notificaciones_no_leidas" =>
                $notificacionesNoLeidas

        ],
        JSON_UNESCAPED_UNICODE
    );


} catch (Throwable $error) {

    http_response_code(500);

    error_log(
        "LifeSync auth/inicio.php: " .
        $error->getMessage()
    );

    echo json_encode(
        [

            "exito" =>
                false,

            "mensaje" =>
                "No se pudo cargar la información de LifeSync."

        ],
        JSON_UNESCAPED_UNICODE
    );

}