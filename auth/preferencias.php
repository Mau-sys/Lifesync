<?php

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

if (!isset($_SESSION["usuario_id"])) {
    http_response_code(401);
    echo json_encode([
        "exito" => false,
        "mensaje" => "La sesión ha expirado."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$usuarioId = (int) $_SESSION["usuario_id"];

try {
    $database = new Database();
    $db = $database->getConnection();

    $consultaConfiguracion = $db->prepare(
        "SELECT notificaciones_activas
         FROM preferencias_usuario
         WHERE id_usuario = :id_usuario
         LIMIT 1"
    );
    $consultaConfiguracion->execute([":id_usuario" => $usuarioId]);
    $configuracion = $consultaConfiguracion->fetch(PDO::FETCH_ASSOC);
    $notificacionesActivas = !$configuracion || (bool) $configuracion["notificaciones_activas"];

    if (!$notificacionesActivas) {
        echo json_encode([
            "exito" => true,
            "creadas" => 0,
            "notificaciones_activas" => false
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $existe = $db->prepare(
        "SELECT COUNT(*)
         FROM notificaciones
         WHERE id_usuario = :id_usuario
         AND titulo = :titulo
         AND mensaje = :mensaje
         AND DATE(fecha_notificacion) = CURDATE()"
    );

    $crear = $db->prepare(
        "INSERT INTO notificaciones
        (id_usuario, titulo, mensaje, leida)
        VALUES (:id_usuario, :titulo, :mensaje, FALSE)"
    );

    $crearNotificacion = function (string $titulo, string $mensaje) use ($db, $existe, $crear, $usuarioId): bool {
        $existe->execute([
            ":id_usuario" => $usuarioId,
            ":titulo" => $titulo,
            ":mensaje" => $mensaje
        ]);

        if ((int) $existe->fetchColumn() > 0) {
            return false;
        }

        $crear->execute([
            ":id_usuario" => $usuarioId,
            ":titulo" => $titulo,
            ":mensaje" => $mensaje
        ]);
        return true;
    };

    $creadas = 0;
    $hoy = date("Y-m-d");
    $diaSemana = (int) date("N");

    $consultaHabitos = $db->prepare(
        "SELECT
            hu.id_habito_usuario,
            h.nombre_habito,
            hu.objetivo,
            hu.frecuencia,
            COALESCE((
                SELECT SUM(r.valor_registrado)
                FROM registros_habitos r
                WHERE r.id_habito_usuario = hu.id_habito_usuario
                AND DATE(r.fecha_registro) = :hoy
            ), 0) AS progreso
         FROM habitos_usuario hu
         INNER JOIN habitos h ON h.id_habito = hu.id_habito
         WHERE hu.id_usuario = :id_usuario
         AND hu.activo = TRUE
         AND (
             hu.frecuencia = 'diaria'
             OR (
                 hu.frecuencia = 'personalizada'
                 AND EXISTS (
                     SELECT 1
                     FROM habito_dias hd
                     WHERE hd.id_habito_usuario = hu.id_habito_usuario
                     AND hd.dia_semana = :dia_semana
                 )
             )
         )"
    );
    $consultaHabitos->execute([
        ":hoy" => $hoy,
        ":id_usuario" => $usuarioId,
        ":dia_semana" => $diaSemana
    ]);
    $habitos = $consultaHabitos->fetchAll(PDO::FETCH_ASSOC);

    $totalHabitos = 0;
    $completados = 0;

    foreach ($habitos as $habito) {
        $objetivo = (float) $habito["objetivo"];
        $progreso = (float) $habito["progreso"];

        if ($objetivo <= 0) {
            continue;
        }

        $totalHabitos++;

        if ($progreso >= $objetivo) {
            $completados++;
            if ($crearNotificacion(
                "Hábito completado",
                '¡Completaste tu hábito "' . $habito["nombre_habito"] . '" hoy!'
            )) {
                $creadas++;
            }
        }
    }

    if ($totalHabitos > 0) {
        $porcentaje = ($completados / $totalHabitos) * 100;

        if ($porcentaje >= 100) {
            if ($crearNotificacion(
                "¡Día completado!",
                "Completaste todos tus hábitos programados de hoy. ¡Excelente trabajo!"
            )) {
                $creadas++;
            }
        } elseif ($porcentaje >= 75) {
            if ($crearNotificacion(
                "¡Vas muy bien!",
                "Ya completaste más del 75% de tus hábitos programados de hoy."
            )) {
                $creadas++;
            }
        }
    }

    $consultaRacha = $db->prepare(
        "SELECT COALESCE(MAX(r.racha_actual), 0)
         FROM rachas r
         INNER JOIN habitos_usuario hu
            ON hu.id_habito_usuario = r.id_habito_usuario
         WHERE hu.id_usuario = :id_usuario
         AND hu.activo = TRUE"
    );
    $consultaRacha->execute([":id_usuario" => $usuarioId]);
    $racha = (int) $consultaRacha->fetchColumn();

    if (in_array($racha, [3, 7, 14, 30, 60, 100], true)) {
        if ($crearNotificacion(
            "🔥 ¡Nueva racha!",
            "Llevas " . $racha . " días manteniendo tus hábitos."
        )) {
            $creadas++;
        }
    }

    $horaActual = date("H:i:s");
    $consultaRecordatorios = $db->prepare(
        "SELECT
            id_recordatorio,
            titulo,
            mensaje,
            hora,
            repeticion,
            fecha_recordatorio
         FROM recordatorios
         WHERE id_usuario = :id_usuario
         AND activo = TRUE
         AND hora <= :hora_actual
         AND (
             repeticion = 'diario'
             OR (
                 repeticion = 'lunes_viernes'
                 AND :dia_semana <= 5
             )
             OR (
                 repeticion = 'una_vez'
                 AND fecha_recordatorio = :hoy
             )
         )
         ORDER BY hora ASC"
    );
    $consultaRecordatorios->execute([
        ":id_usuario" => $usuarioId,
        ":hora_actual" => $horaActual,
        ":dia_semana" => $diaSemana,
        ":hoy" => $hoy
    ]);
    $recordatorios = $consultaRecordatorios->fetchAll(PDO::FETCH_ASSOC);

    foreach ($recordatorios as $recordatorio) {
        $titulo = trim($recordatorio["titulo"] ?: "Recordatorio");
        $mensaje = trim($recordatorio["mensaje"] ?: "Tienes un recordatorio pendiente.");

        if ($crearNotificacion($titulo, $mensaje)) {
            $creadas++;
        }
    }

    echo json_encode([
        "exito" => true,
        "creadas" => $creadas,
        "notificaciones_activas" => true
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        "exito" => false,
        "mensaje" => "No se pudieron procesar las notificaciones."
    ], JSON_UNESCAPED_UNICODE);
}
