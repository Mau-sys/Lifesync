<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once '../config/conexion.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'La sesión ha expirado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$usuarioId = (int) $_SESSION['usuario_id'];

try {
    $database = new Database();
    $db = $database->getConnection();

    $consultaUsuario = $db->prepare(
        'SELECT u.nombre_usuario, p.foto_perfil
         FROM usuario u
         LEFT JOIN perfil_usuario p ON p.id_usuario = u.id_usuario
         WHERE u.id_usuario = :id_usuario
         LIMIT 1'
    );
    $consultaUsuario->execute([':id_usuario' => $usuarioId]);
    $usuario = $consultaUsuario->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['exito' => false, 'mensaje' => 'Usuario no encontrado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $consultaHabitos = $db->prepare(
        'SELECT
            hu.id_habito_usuario,
            h.id_habito,
            h.nombre_habito,
            h.descripcion,
            h.id_categoria,
            c.nombre AS categoria,
            hu.objetivo,
            hu.unidad,
            hu.frecuencia,
            hu.duracion_minutos,
            COALESCE((
                SELECT CASE
                    WHEN LOWER(hu.unidad) LIKE "%sesion%"
                      OR LOWER(hu.unidad) LIKE "%registro%"
                      OR LOWER(hu.unidad) LIKE "%comida%"
                      OR LOWER(hu.unidad) LIKE "%pausa%"
                    THEN COUNT(*)
                    ELSE SUM(r.valor_registrado)
                END
                FROM registros_habitos r
                WHERE r.id_habito_usuario = hu.id_habito_usuario
                  AND DATE(r.fecha_registro) = CURDATE()
            ), 0) AS progreso_hoy
         FROM habitos_usuario hu
         INNER JOIN habitos h ON h.id_habito = hu.id_habito
         LEFT JOIN categorias c ON c.id_categoria = h.id_categoria
         WHERE hu.id_usuario = :id_usuario
           AND hu.activo = TRUE
           AND hu.fecha_inicio <= CURDATE()
           AND (hu.fecha_fin IS NULL OR hu.fecha_fin >= CURDATE())
         ORDER BY h.id_habito ASC'
    );
    $consultaHabitos->execute([':id_usuario' => $usuarioId]);
    $habitos = $consultaHabitos->fetchAll(PDO::FETCH_ASSOC);

    $diaSemana = (int) date('N');
    $habitosHoy = [];
    $habitosPendientes = [];
    $totalHabitos = 0;
    $habitosCompletados = 0;

    $consultaDias = $db->prepare(
        'SELECT dia_semana
         FROM habito_dias
         WHERE id_habito_usuario = :id_habito_usuario
         ORDER BY dia_semana'
    );

    foreach ($habitos as $habito) {
        $frecuencia = strtolower(trim((string) ($habito['frecuencia'] ?? 'diaria')));
        $debeMostrarHoy = true;

        if ($frecuencia === 'personalizada' || $frecuencia === 'dias específicos') {
            $consultaDias->execute([':id_habito_usuario' => (int) $habito['id_habito_usuario']]);
            $dias = array_map('intval', $consultaDias->fetchAll(PDO::FETCH_COLUMN));
            $debeMostrarHoy = count($dias) === 0 || in_array($diaSemana, $dias, true);
        }

        if (!$debeMostrarHoy) {
            continue;
        }

        $objetivo = (float) $habito['objetivo'];
        $progreso = (float) $habito['progreso_hoy'];
        $porcentaje = $objetivo > 0 ? min(100, max(0, ($progreso / $objetivo) * 100)) : 0;
        $completado = $porcentaje >= 100;

        $datos = [
            'id_habito_usuario' => (int) $habito['id_habito_usuario'],
            'id_habito' => (int) $habito['id_habito'],
            'nombre_habito' => $habito['nombre_habito'],
            'descripcion' => $habito['descripcion'],
            'categoria' => $habito['categoria'] ?: 'Hábito Personalizado',
            'objetivo' => $objetivo,
            'progreso' => $progreso,
            'unidad' => $habito['unidad'],
            'frecuencia' => $habito['frecuencia'],
            'duracion_minutos' => $habito['duracion_minutos'] !== null ? (int) $habito['duracion_minutos'] : null,
            'porcentaje' => round($porcentaje, 2),
            'completado' => $completado
        ];

        $habitosHoy[] = $datos;
        $totalHabitos++;

        if ($completado) {
            $habitosCompletados++;
        } else {
            $habitosPendientes[] = $datos;
        }
    }

    $porcentajeGeneral = $totalHabitos > 0
        ? ($habitosCompletados / $totalHabitos) * 100
        : 0;

    $consultaRacha = $db->prepare(
        'SELECT COALESCE(MAX(r.racha_actual), 0)
         FROM rachas r
         INNER JOIN habitos_usuario hu ON hu.id_habito_usuario = r.id_habito_usuario
         WHERE hu.id_usuario = :id_usuario
           AND hu.activo = TRUE'
    );
    $consultaRacha->execute([':id_usuario' => $usuarioId]);
    $racha = (int) ($consultaRacha->fetchColumn() ?: 0);

    $consultaNotificaciones = $db->prepare(
        'SELECT id_notificacion, titulo, mensaje, leida, fecha_notificacion
         FROM notificaciones
         WHERE id_usuario = :id_usuario
         ORDER BY fecha_notificacion DESC
         LIMIT 50'
    );
    $consultaNotificaciones->execute([':id_usuario' => $usuarioId]);
    $notificacionesBD = $consultaNotificaciones->fetchAll(PDO::FETCH_ASSOC);

    if (count($notificacionesBD) === 0) {
        $titulo = 'Bienvenido a LifeSync';
        $mensaje = 'Activa los permisos de notificaciones y recordatorios para recibir avisos importantes de tus hábitos y rachas.';

        $insertar = $db->prepare(
            'INSERT INTO notificaciones (id_usuario, titulo, mensaje, leida)
             VALUES (:id_usuario, :titulo, :mensaje, 0)'
        );
        $insertar->execute([
            ':id_usuario' => $usuarioId,
            ':titulo' => $titulo,
            ':mensaje' => $mensaje
        ]);

        $notificacionesBD = [[
            'id_notificacion' => (int) $db->lastInsertId(),
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'leida' => 0,
            'fecha_notificacion' => date('Y-m-d H:i:s')
        ]];
    }

    $notificaciones = [];
    foreach ($notificacionesBD as $notificacion) {
        $fecha = new DateTime($notificacion['fecha_notificacion']);
        $notificaciones[] = [
            'id_notificacion' => (int) $notificacion['id_notificacion'],
            'titulo' => $notificacion['titulo'],
            'mensaje' => $notificacion['mensaje'],
            'leida' => (int) $notificacion['leida'] === 1,
            'fecha_formateada' => $fecha->format('d/m/Y H:i')
        ];
    }

    $consultaNoLeidas = $db->prepare(
        'SELECT COUNT(*)
         FROM notificaciones
         WHERE id_usuario = :id_usuario AND leida = 0'
    );
    $consultaNoLeidas->execute([':id_usuario' => $usuarioId]);
    $notificacionesNoLeidas = (int) ($consultaNoLeidas->fetchColumn() ?: 0);

    echo json_encode([
        'exito' => true,
        'usuario' => [
            'nombre' => $usuario['nombre_usuario'],
            'foto' => $usuario['foto_perfil'] ?: 'img/Perfil.png'
        ],
        'progreso' => [
            'porcentaje' => round($porcentajeGeneral, 2),
            'total_habitos' => $totalHabitos,
            'completados' => $habitosCompletados,
            'pendientes' => count($habitosPendientes)
        ],
        'racha' => $racha,
        'habitos_hoy' => $habitosHoy,
        'habitos_pendientes' => $habitosPendientes,
        'notificaciones' => $notificaciones,
        'notificaciones_no_leidas' => $notificacionesNoLeidas
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {
    error_log('LifeSync auth/inicio.php: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'No se pudo cargar la información de LifeSync.'
    ], JSON_UNESCAPED_UNICODE);
}
