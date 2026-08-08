<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

ini_set("display_errors", "0");
ini_set("log_errors", "1");

require_once __DIR__ . "/../config/conexion.php";


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


$usuarioId = (int) $_SESSION["usuario_id"];


try {

    $database = new Database();

    $db = $database->getConnection();


    if (!$db) {

        responder(
            [
                "exito" => false,
                "mensaje" => "No se pudo conectar con la base de datos."
            ],
            500
        );

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
            nombre_usuario
         FROM usuario
         WHERE id_usuario = :id_usuario
         LIMIT 1"
    );


    $consultaUsuario->execute(
        [
            ":id_usuario" => $usuarioId
        ]
    );


    $usuario = $consultaUsuario->fetch(
        PDO::FETCH_ASSOC
    );


    if (!$usuario) {

        responder(
            [
                "exito" => false,
                "mensaje" => "Usuario no encontrado."
            ],
            404
        );

    }


    /*
     * FOTO DE PERFIL
     *
     * Si la tabla existe y tiene foto,
     * se obtiene. Si no, se deja vacía.
     */

    $fotoPerfil = null;


    try {

        $consultaFoto = $db->prepare(
            "SELECT foto_perfil
             FROM perfil_usuario
             WHERE id_usuario = :id_usuario
             LIMIT 1"
        );


        $consultaFoto->execute(
            [
                ":id_usuario" => $usuarioId
            ]
        );


        $perfil = $consultaFoto->fetch(
            PDO::FETCH_ASSOC
        );


        if (
            $perfil &&
            !empty($perfil["foto_perfil"])
        ) {

            $fotoPerfil = $perfil["foto_perfil"];

        }

    } catch (Throwable $error) {

        $fotoPerfil = null;

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


    $consultaHabitos->execute(
        [
            ":id_usuario" => $usuarioId
        ]
    );


    $habitos = $consultaHabitos->fetchAll(
        PDO::FETCH_ASSOC
    );


    $habitosPendientes = [];

    $totalHabitos = 0;

    $habitosCompletados = 0;


    $diaSemanaActual = (int) date("N");


    foreach ($habitos as $habito) {

        $frecuencia = strtolower(
            trim(
                (string) ($habito["frecuencia"] ?? "")
            )
        );


        $debeMostrarHoy = false;


        if (
            $frecuencia === "diaria" ||
            $frecuencia === "diario"
        ) {

            $debeMostrarHoy = true;

        }


        elseif (
            $frecuencia === "semanal" ||
            $frecuencia === "semanalmente"
        ) {

            $dias = trim(
                (string) ($habito["dias_semana"] ?? "")
            );


            if ($dias === "") {

                $debeMostrarHoy = true;

            } else {

                $listaDias = preg_split(
                    "/[,; ]+/",
                    $dias,
                    -1,
                    PREG_SPLIT_NO_EMPTY
                );


                $listaDias = array_map(
                    "intval",
                    $listaDias
                );


                $debeMostrarHoy = in_array(
                    $diaSemanaActual,
                    $listaDias,
                    true
                );

            }

        }


        elseif ($frecuencia === "") {

            $debeMostrarHoy = true;

        }


        if (!$debeMostrarHoy) {
            continue;
        }


        $totalHabitos++;


        $objetivo = (float) (
            $habito["objetivo"] ?? 0
        );


        $progreso = (float) (
            $habito["progreso"] ?? 0
        );


        $porcentaje = 0;


        if ($objetivo > 0) {

            $porcentaje =
                ($progreso / $objetivo) * 100;

        }


        $porcentaje = max(
            0,
            min(
                100,
                $porcentaje
            )
        );


        $completado = $porcentaje >= 100;


        if ($completado) {

            $habitosCompletados++;

        }


        $categoria = trim(
            (string) (
                $habito["categoria"] ?? ""
            )
        );


        if ($categoria === "") {

            $categoria = "Hábito Personalizado";

        }


        $unidad = trim(
            (string) (
                $habito["unidad_medida"] ?? ""
            )
        );


        $tipoMedicion = strtolower(
            trim(
                (string) (
                    $habito["tipo_medicion"] ?? ""
                )
            )
        );


        if ($tipoMedicion === "completar") {

            $detalle = $completado
                ? "Completado"
                : "Pendiente";

        } else {

            $progresoTexto = number_format(
                $progreso,
                0
            );


            $objetivoTexto = number_format(
                $objetivo,
                0
            );


            $detalle =
                $progresoTexto .
                " de " .
                $objetivoTexto;


            if ($unidad !== "") {

                $detalle .= " " . $unidad;

            }

        }


        $habitosPendientes[] = [

            "id_habito" =>
                (int) $habito["id_habito"],

            "nombre_habito" =>
                $habito["nombre_habito"],

            "descripcion" =>
                $habito["descripcion"],

            "categoria" =>
                $categoria,

            "objetivo" =>
                $objetivo,

            "progreso" =>
                $progreso,

            "unidad_medida" =>
                $unidad,

            "frecuencia" =>
                $frecuencia,

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


    /*
     * RACHA
     */

    $racha = 0;


    try {

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


        $consultaRacha->execute(
            [
                ":id_usuario" => $usuarioId
            ]
        );


        $racha = (int) (
            $consultaRacha->fetchColumn() ?: 0
        );

    } catch (Throwable $error) {

        $racha = 0;

    }


    /*
     * NOTIFICACIONES
     */

    $notificaciones = [];

    $notificacionesNoLeidas = 0;


    try {

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


        $consultaNotificaciones->execute(
            [
                ":id_usuario" => $usuarioId
            ]
        );


        $notificacionesBD =
            $consultaNotificaciones->fetchAll(
                PDO::FETCH_ASSOC
            );


        foreach (
            $notificacionesBD
            as $notificacion
        ) {

            $fecha = new DateTime(
                $notificacion["fecha_notificacion"]
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
                    ) === 1,

                "fecha_formateada" =>
                    $fecha->format(
                        "d/m/Y H:i"
                    )
            ];

        }


        if (count($notificaciones) === 0) {

            $titulo =
                "Bienvenido a LifeSync";


            $mensaje =
                "Aquí aparecerán tus recordatorios, logros, rachas y avisos de LifeSync.";


            $insertarNotificacion =
                $db->prepare(
                    "INSERT INTO notificaciones
                    (
                        id_usuario,
                        titulo,
                        mensaje
                    )
                    VALUES
                    (
                        :id_usuario,
                        :titulo,
                        :mensaje
                    )"
                );


            $insertarNotificacion->execute(
                [
                    ":id_usuario" =>
                        $usuarioId,

                    ":titulo" =>
                        $titulo,

                    ":mensaje" =>
                        $mensaje
                ]
            );


            $notificaciones[] = [

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
            ];

        }


        $consultaNoLeidas = $db->prepare(
            "SELECT COUNT(*)
             FROM notificaciones
             WHERE id_usuario = :id_usuario
             AND leida = 0"
        );


        $consultaNoLeidas->execute(
            [
                ":id_usuario" => $usuarioId
            ]
        );


        $notificacionesNoLeidas =
            (int) $consultaNoLeidas->fetchColumn();

    } catch (Throwable $error) {

        $notificaciones = [];

        $notificacionesNoLeidas = 0;

    }


    /*
     * RESPUESTA FINAL
     */

    responder(
        [

            "exito" =>
                true,

            "usuario" => [

                "nombre" =>
                    $usuario["nombre_usuario"],

                "foto" =>
                    $fotoPerfil
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
                    $habitosCompletados
            ],

            "racha" =>
                $racha,

            "habitos_pendientes" =>
                $habitosPendientes,

            "notificaciones" =>
                $notificaciones,

            "notificaciones_no_leidas" =>
                $notificacionesNoLeidas
        ]
    );


} catch (Throwable $error) {

    error_log(
        "LifeSync auth/inicio.php: " .
        $error->getMessage()
    );


    responder(
        [

            "exito" =>
                false,

            "mensaje" =>
                "No se pudo cargar la información de LifeSync.",

            "error" =>
                $error->getMessage()
        ],
        500
    );

}

?>