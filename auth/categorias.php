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

    $consultaCategorias = $db->query(
        'SELECT id_categoria, nombre
         FROM categorias
         ORDER BY id_categoria ASC'
    );
    $categorias = $consultaCategorias->fetchAll(PDO::FETCH_ASSOC);

    $consultaHabitos = $db->prepare(
        'SELECT
            hu.id_habito_usuario,
            h.id_habito,
            h.id_categoria,
            h.nombre_habito,
            h.descripcion,
            h.imagen_url,
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
         WHERE hu.id_usuario = :id_usuario
           AND hu.activo = TRUE
           AND hu.fecha_inicio <= CURDATE()
           AND (hu.fecha_fin IS NULL OR hu.fecha_fin >= CURDATE())
         ORDER BY h.id_habito ASC'
    );
    $consultaHabitos->execute([':id_usuario' => $usuarioId]);
    $habitosUsuario = $consultaHabitos->fetchAll(PDO::FETCH_ASSOC);

    $porCategoria = [];
    foreach ($habitosUsuario as $habito) {
        $idCategoria = (int) $habito['id_categoria'];
        $objetivo = (float) $habito['objetivo'];
        $progreso = (float) $habito['progreso_hoy'];
        $porcentaje = $objetivo > 0 ? min(100, max(0, ($progreso / $objetivo) * 100)) : 0;

        $habito['id_habito_usuario'] = (int) $habito['id_habito_usuario'];
        $habito['id_habito'] = (int) $habito['id_habito'];
        $habito['objetivo'] = $objetivo;
        $habito['progreso_hoy'] = $progreso;
        $habito['porcentaje'] = round($porcentaje, 2);
        $habito['completado'] = $porcentaje >= 100;
        $habito['duracion_minutos'] = $habito['duracion_minutos'] !== null ? (int) $habito['duracion_minutos'] : null;

        $porCategoria[$idCategoria][] = $habito;
    }

    foreach ($categorias as &$categoria) {
        $idCategoria = (int) $categoria['id_categoria'];
        $habitos = $porCategoria[$idCategoria] ?? [];

        $suma = 0;
        $completados = 0;
        foreach ($habitos as $habito) {
            $suma += (float) $habito['porcentaje'];
            if ($habito['completado']) {
                $completados++;
            }
        }

        $progreso = count($habitos) > 0 ? $suma / count($habitos) : 0;

        if (count($habitos) === 0) {
            $estado = 'sin_habito';
        } elseif ($progreso >= 100) {
            $estado = 'completado';
        } elseif ($progreso > 0) {
            $estado = 'en_progreso';
        } else {
            $estado = 'pendiente';
        }

        $categoria['habitos'] = $habitos;
        $categoria['total_habitos'] = count($habitos);
        $categoria['completados_hoy'] = $completados;
        $categoria['progreso'] = round($progreso, 2);
        $categoria['estado'] = $estado;
    }
    unset($categoria);

    echo json_encode([
        'exito' => true,
        'categorias' => $categorias
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {
    error_log('LifeSync auth/categorias.php: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'No se pudieron cargar las categorías.'
    ], JSON_UNESCAPED_UNICODE);
}
