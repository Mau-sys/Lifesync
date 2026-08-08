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
            "mensaje" =>
                "No se pudo conectar con la base de datos."
        ]);

        exit;
    }

    $hoy = date("Y-m-d");

    $creadas = 0;

    function existeNotificacion(
        PDO $db,
        int $usuarioId,
        string $titulo,
        string $mensaje
    ): bool {

        $consulta = $db->prepare(
            "SELECT COUNT(*)
             FROM notificaciones
             WHERE id_usuario = :id_usuario
             AND titulo = :titulo
             AND mensaje = :mensaje
             AND DATE(fecha_notificacion) = CURDATE()"
        );

        $consulta->execute([
            ":id_usuario" => $usuarioId,
            ":titulo" => $titulo,
            ":mensaje" => $mensaje
        ]);

        return
            (int) $consulta->fetchColumn() > 0;
    }

    function crearNotificacion(
        PDO $db,
        int $usuarioId,
        string $titulo,
        string $mensaje
    ): bool {

        if (
            existeNotificacion(
                $db,
                $usuarioId,
                $titulo,
                $mensaje
            )
        ) {
            return false;
        }

        $consulta = $db->prepare(
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
                FALSE
            )"
        );

        $consulta->execute([
            ":id_usuario" => $usuarioId,
            ":titulo" => $titulo,
            ":mensaje" => $mensaje
        ]);

        return true;
    }


    /*
     * PROGRESO DEL DÍA
     */

    $consultaHabitos = $db->prepare(
        "SELECT
            h.id_habito,
            h.nombre_habito,
            h.objetivo,
            h.tipo_medicion,

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

         WHERE h.id_usuario = :id_usuario
         AND h.activo = TRUE"
    );

    $consultaHabitos->execute([
        ":id_usuario" => $usuarioId
    ]);

    $habitos =
        $consultaHabitos->fetchAll(PDO::FETCH_ASSOC);

    $totalHabitos = 0;
    $completados = 0;

    foreach ($habitos as $habito) {

        $objetivo =
            (float) $habito["objetivo"];

        $progreso =
            (float) $habito["progreso"];

        if ($objetivo <= 0) {
            continue;
        }

        $totalHabitos++;

        if ($progreso >= $objetivo) {

            $completados++;

            $titulo =
                "Hábito completado";

            $mensaje =
                "¡Completaste tu hábito \""
                . $habito["nombre_habito"]
                . "\" hoy!";

            if (
                crearNotificacion(
                    $db,
                    $usuarioId,
                    $titulo,
                    $mensaje
                )
            ) {

                $creadas++;
            }
        }
    }


    /*
     * PROGRESO GENERAL
     */

    if ($totalHabitos > 0) {

        $porcentaje =
            ($completados / $totalHabitos) * 100;

        if ($porcentaje >= 100) {

            $titulo =
                "¡Día completado!";

            $mensaje =
                "Completaste todos tus hábitos de hoy. ¡Excelente trabajo!";

            if (
                crearNotificacion(
                    $db,
                    $usuarioId,
                    $titulo,
                    $mensaje
                )
            ) {

                $creadas++;
            }

        } elseif ($porcentaje >= 75) {

            $titulo =
                "¡Vas muy bien!";

            $mensaje =
                "Ya completaste más del 75% de tus hábitos de hoy.";

            if (
                crearNotificacion(
                    $db,
                    $usuarioId,
                    $titulo,
                    $mensaje
                )
            ) {

                $creadas++;
            }
        }
    }


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
         AND h.activo = TRUE"
    );

    $consultaRacha->execute([
        ":id_usuario" => $usuarioId
    ]);

    $racha =
        (int) (
            $consultaRacha->fetchColumn() ?: 0
        );

    $hitosRacha = [
        3,
        7,
        14,
        30,
        60,
        100
    ];

    if (
        in_array(
            $racha,
            $hitosRacha,
            true
        )
    ) {

        $titulo =
            "🔥 ¡Nueva racha!";

        $mensaje =
            "Llevas "
            . $racha
            . " días manteniendo tus hábitos.";

        if (
            crearNotificacion(
                $db,
                $usuarioId,
                $titulo,
                $mensaje
            )
        ) {

            $creadas++;
        }
    }


    /*
     * RECORDATORIOS
     *
     * Los recordatorios existentes se
     * convierten en notificaciones cuando
     * corresponden al momento actual.
     */

    $horaActual =
        date("H:i");

    $consultaRecordatorios = $db->prepare(
        "SELECT
            id_recordatorio,
            titulo,
            mensaje,
            hora,
            fecha,
            repeticion

         FROM recordatorios

         WHERE id_usuario = :id_usuario
         AND activo = TRUE

         AND (
             (
                 fecha IS NULL
                 AND hora <= :hora_actual
             )
             OR
             (
                 fecha = :hoy
                 AND hora <= :hora_actual
             )
         )

         ORDER BY hora ASC"
    );

    $consultaRecordatorios->execute([
        ":id_usuario" => $usuarioId,
        ":hora_actual" => $horaActual,
        ":hoy" => $hoy
    ]);

    $recordatorios =
        $consultaRecordatorios->fetchAll(PDO::FETCH_ASSOC);

    foreach ($recordatorios as $recordatorio) {

        $titulo =
            $recordatorio["titulo"]
            ?: "Recordatorio";

        $mensaje =
            $recordatorio["mensaje"]
            ?: "Tienes un recordatorio pendiente.";

        if (
            crearNotificacion(
                $db,
                $usuarioId,
                $titulo,
                $mensaje
            )
        ) {

            $creadas++;
        }
    }


    echo json_encode([
        "exito" => true,
        "creadas" => $creadas
    ]);

} catch (PDOException $error) {

    http_response_code(500);

    echo json_encode([
        "exito" => false,
        "mensaje" =>
            "No se pudieron procesar las notificaciones."
    ]);
}
?>