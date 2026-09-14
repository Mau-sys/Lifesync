<?php

declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../config/conexion.php';

function responderConfiguracion(bool $exito, string $mensaje = '', array $datos = [], int $codigo = 200): never
{
    http_response_code($codigo);
    echo json_encode(array_merge([
        'exito' => $exito,
        'mensaje' => $mensaje
    ], $datos), JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    responderConfiguracion(false, 'La sesión ha expirado.', [], 401);
}

$idUsuario = (int) $_SESSION['usuario_id'];

try {
    $database = new Database();
    $db = $database->getConnection();
    $accion = $_GET['accion'] ?? $_POST['accion'] ?? '';

    if ($accion === 'obtener') {
        $consulta = $db->prepare(
            "SELECT
                p.tema,
                p.idioma,
                p.notificaciones_activas,
                p.sonidos_activados,
                p.sincronizacion_automatica,
                COALESCE(cn.correo_recordatorios, TRUE) AS correo_recordatorios,
                COALESCE(cn.correo_logros, TRUE) AS correo_logros
             FROM preferencias_usuario p
             LEFT JOIN configuracion_notificaciones cn
                ON cn.id_usuario = p.id_usuario
             WHERE p.id_usuario = :id_usuario
             LIMIT 1"
        );
        $consulta->execute([':id_usuario' => $idUsuario]);
        $configuracion = $consulta->fetch(PDO::FETCH_ASSOC);

        if (!$configuracion) {
            $configuracion = [
                'tema' => 'oscuro',
                'idioma' => 'es',
                'notificaciones_activas' => 1,
                'sonidos_activados' => 1,
                'sincronizacion_automatica' => 1,
                'correo_recordatorios' => 1,
                'correo_logros' => 1
            ];
        }

        echo json_encode([
            'exito' => true,
            'configuracion' => [
                'tema' => in_array($configuracion['tema'], ['claro', 'oscuro', 'sistema'], true) ? $configuracion['tema'] : 'oscuro',
                'idioma' => $configuracion['idioma'] === 'en' ? 'en' : 'es',
                'notificaciones_activas' => (int) $configuracion['notificaciones_activas'],
                'sonidos_activados' => (int) $configuracion['sonidos_activados'],
                'sincronizacion_automatica' => (int) $configuracion['sincronizacion_automatica'],
                'correo_recordatorios' => (int) $configuracion['correo_recordatorios'],
                'correo_logros' => (int) $configuracion['correo_logros']
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($accion === 'guardar') {
        $tema = $_POST['tema'] ?? 'oscuro';
        $idioma = $_POST['idioma'] ?? 'es';
        $notificaciones = !empty($_POST['notificaciones']) ? 1 : 0;
        $sonidos = !empty($_POST['sonidos']) ? 1 : 0;
        $sincronizacion = !empty($_POST['sincronizacion']) ? 1 : 0;
        $correoRecordatorios = !empty($_POST['correo_recordatorios']) ? 1 : 0;
        $correoLogros = !empty($_POST['correo_logros']) ? 1 : 0;

        if (!in_array($tema, ['claro', 'oscuro', 'sistema'], true)) {
            $tema = 'oscuro';
        }
        if (!in_array($idioma, ['es', 'en'], true)) {
            $idioma = 'es';
        }

        $db->beginTransaction();

        $consulta = $db->prepare(
            "INSERT INTO preferencias_usuario
            (id_usuario, tema, idioma, notificaciones_activas, sonidos_activados, sincronizacion_automatica)
            VALUES (:id_usuario, :tema, :idioma, :notificaciones, :sonidos, :sincronizacion)
            ON DUPLICATE KEY UPDATE
                tema = VALUES(tema),
                idioma = VALUES(idioma),
                notificaciones_activas = VALUES(notificaciones_activas),
                sonidos_activados = VALUES(sonidos_activados),
                sincronizacion_automatica = VALUES(sincronizacion_automatica)"
        );
        $consulta->execute([
            ':id_usuario' => $idUsuario,
            ':tema' => $tema,
            ':idioma' => $idioma,
            ':notificaciones' => $notificaciones,
            ':sonidos' => $sonidos,
            ':sincronizacion' => $sincronizacion
        ]);

        $consultaCorreo = $db->prepare(
            "INSERT INTO configuracion_notificaciones
            (id_usuario, correo_recordatorios, correo_logros)
            VALUES (:id_usuario, :correo_recordatorios, :correo_logros)
            ON DUPLICATE KEY UPDATE
                correo_recordatorios = VALUES(correo_recordatorios),
                correo_logros = VALUES(correo_logros)"
        );
        $consultaCorreo->execute([
            ':id_usuario' => $idUsuario,
            ':correo_recordatorios' => $correoRecordatorios,
            ':correo_logros' => $correoLogros
        ]);

        $db->commit();

        echo json_encode([
            'exito' => true,
            'mensaje' => 'Configuración guardada correctamente.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($accion === 'cambiar_contrasena') {
        $actual = $_POST['actual'] ?? '';
        $nueva = $_POST['nueva'] ?? '';

        if ($actual === '' || $nueva === '') {
            responderConfiguracion(false, 'Completa todos los campos.', [], 400);
        }
        if (mb_strlen($nueva) < 8) {
            responderConfiguracion(false, 'La contraseña debe tener al menos 8 caracteres.', [], 400);
        }

        $consulta = $db->prepare(
            "SELECT password_hash FROM usuario WHERE id_usuario = :id_usuario LIMIT 1"
        );
        $consulta->execute([':id_usuario' => $idUsuario]);
        $usuario = $consulta->fetch(PDO::FETCH_ASSOC);

        if (!$usuario || !password_verify($actual, $usuario['password_hash'])) {
            responderConfiguracion(false, 'La contraseña actual no es correcta.', [], 400);
        }

        $consulta = $db->prepare(
            "UPDATE usuario
             SET password_hash = :password_hash
             WHERE id_usuario = :id_usuario"
        );
        $consulta->execute([
            ':password_hash' => password_hash($nueva, PASSWORD_DEFAULT),
            ':id_usuario' => $idUsuario
        ]);

        echo json_encode([
            'exito' => true,
            'mensaje' => 'Contraseña actualizada correctamente.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($accion === 'sesiones') {
        $tokenActual = $_SESSION['token_sesion'] ?? '';
        $consulta = $db->prepare(
            "SELECT
                id_sesion,
                dispositivo,
                ip,
                DATE_FORMAT(fecha_inicio, '%d/%m/%Y %H:%i') AS fecha_inicio,
                DATE_FORMAT(ultimo_acceso, '%d/%m/%Y %H:%i') AS ultimo_acceso,
                token_sesion
             FROM sesiones_usuario
             WHERE id_usuario = :id_usuario
             AND activa = TRUE
             ORDER BY ultimo_acceso DESC"
        );
        $consulta->execute([':id_usuario' => $idUsuario]);
        $sesiones = $consulta->fetchAll(PDO::FETCH_ASSOC);

        foreach ($sesiones as &$sesion) {
            $sesion['id_sesion'] = (int) $sesion['id_sesion'];
            $sesion['sesion_actual'] = $tokenActual !== '' && hash_equals($tokenActual, $sesion['token_sesion']);
            unset($sesion['token_sesion']);
        }
        unset($sesion);

        echo json_encode([
            'exito' => true,
            'sesiones' => $sesiones
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($accion === 'cerrar_sesion') {
        $idSesion = (int) ($_POST['id_sesion'] ?? 0);
        if ($idSesion <= 0) {
            responderConfiguracion(false, 'Sesión no válida.', [], 400);
        }

        $consulta = $db->prepare(
            "SELECT token_sesion
             FROM sesiones_usuario
             WHERE id_sesion = :id_sesion
             AND id_usuario = :id_usuario
             AND activa = TRUE
             LIMIT 1"
        );
        $consulta->execute([
            ':id_sesion' => $idSesion,
            ':id_usuario' => $idUsuario
        ]);
        $sesion = $consulta->fetch(PDO::FETCH_ASSOC);

        if (!$sesion) {
            responderConfiguracion(false, 'La sesión ya no está activa.', [], 404);
        }

        $consulta = $db->prepare(
            "UPDATE sesiones_usuario
             SET activa = FALSE, ultimo_acceso = CURRENT_TIMESTAMP
             WHERE id_sesion = :id_sesion
             AND id_usuario = :id_usuario"
        );
        $consulta->execute([
            ':id_sesion' => $idSesion,
            ':id_usuario' => $idUsuario
        ]);

        $sesionActual = isset($_SESSION['token_sesion']) && hash_equals($_SESSION['token_sesion'], $sesion['token_sesion']);

        if ($sesionActual) {
            $_SESSION = [];
            if (ini_get('session.use_cookies')) {
                $parametros = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000, $parametros['path'], $parametros['domain'], $parametros['secure'], $parametros['httponly']);
            }
            session_destroy();
        }

        echo json_encode([
            'exito' => true,
            'mensaje' => 'Sesión cerrada correctamente.',
            'sesion_actual' => $sesionActual
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    responderConfiguracion(false, 'Acción no válida.', [], 400);

} catch (Throwable $error) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log('LifeSync configuracion.php: ' . $error->getMessage());
    responderConfiguracion(false, 'No se pudo procesar la configuración.', [], 500);
}
