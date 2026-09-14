<?php

declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../config/conexion.php';

function responderEstadisticas(bool $exito, string $mensaje = '', array $datos = [], int $codigo = 200): never
{
    http_response_code($codigo);
    echo json_encode(array_merge(['exito' => $exito, 'mensaje' => $mensaje], $datos), JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    responderEstadisticas(false, 'La sesión ha expirado.', [], 401);
}

$idUsuario = (int) $_SESSION['usuario_id'];
$periodo = $_GET['periodo'] ?? 'semana';
if (!in_array($periodo, ['semana', 'mes', 'anio'], true)) {
    $periodo = 'semana';
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $hoy = new DateTimeImmutable('today');
    $fechaFin = $hoy;
    if ($periodo === 'semana') {
        $fechaInicio = $hoy->modify('-6 days');
    } elseif ($periodo === 'mes') {
        $fechaInicio = $hoy->modify('first day of this month');
    } else {
        $fechaInicio = $hoy->modify('first day of January this year');
    }

    $consultaHabitos = $db->prepare(
        "SELECT
            hu.id_habito_usuario,
            h.id_habito,
            h.id_categoria,
            h.nombre_habito,
            h.descripcion,
            h.imagen_url,
            h.es_base,
            c.nombre AS nombre_categoria,
            hu.objetivo,
            hu.unidad,
            hu.frecuencia,
            hu.duracion_minutos,
            hu.fecha_inicio,
            hu.fecha_fin
         FROM habitos_usuario hu
         INNER JOIN habitos h ON h.id_habito = hu.id_habito
         LEFT JOIN categorias c ON c.id_categoria = h.id_categoria
         WHERE hu.id_usuario = :id_usuario
         AND hu.activo = TRUE
         ORDER BY h.id_categoria, h.id_habito"
    );
    $consultaHabitos->execute([':id_usuario' => $idUsuario]);
    $habitos = $consultaHabitos->fetchAll(PDO::FETCH_ASSOC);

    $consultaCategorias = $db->query(
        "SELECT id_categoria, nombre
         FROM categorias
         ORDER BY id_categoria"
    );
    $categoriasBD = $consultaCategorias->fetchAll(PDO::FETCH_ASSOC);

    $consultaRegistros = $db->prepare(
        "SELECT
            r.id_habito_usuario,
            DATE(r.fecha_registro) AS fecha,
            r.valor_registrado
         FROM registros_habitos r
         INNER JOIN habitos_usuario hu ON hu.id_habito_usuario = r.id_habito_usuario
         WHERE hu.id_usuario = :id_usuario
         AND DATE(r.fecha_registro) BETWEEN :inicio AND :fin
         ORDER BY r.fecha_registro"
    );
    $consultaRegistros->execute([
        ':id_usuario' => $idUsuario,
        ':inicio' => $fechaInicio->format('Y-m-d'),
        ':fin' => $fechaFin->format('Y-m-d')
    ]);
    $registros = $consultaRegistros->fetchAll(PDO::FETCH_ASSOC);

    $porHabito = [];
    foreach ($registros as $registro) {
        $idHabitoUsuario = (int) $registro['id_habito_usuario'];
        if (!isset($porHabito[$idHabitoUsuario])) {
            $porHabito[$idHabitoUsuario] = [];
        }
        $porHabito[$idHabitoUsuario][] = $registro;
    }

    $diaSemana = (int) $hoy->format('N');
    $progresoGeneral = 0;
    $habitosCompletados = 0;
    $habitosContados = 0;
    $habitosPersonalizados = [];

    foreach ($habitos as $habito) {
        $idHU = (int) $habito['id_habito_usuario'];
        $objetivo = (float) $habito['objetivo'];
        if ($objetivo <= 0) {
            continue;
        }

        $registrosHabito = $porHabito[$idHU] ?? [];
        $total = 0;
        foreach ($registrosHabito as $registro) {
            $total += (float) $registro['valor_registrado'];
        }

        $porcentaje = min(100, ($total / $objetivo) * 100);
        $progresoGeneral += $porcentaje;
        $habitosContados++;

        $progresoHoy = 0;
        foreach ($registrosHabito as $registro) {
            if ($registro['fecha'] === $hoy->format('Y-m-d')) {
                $progresoHoy += (float) $registro['valor_registrado'];
            }
        }
        if ($progresoHoy >= $objetivo) {
            $habitosCompletados++;
        }

        if (!(bool) $habito['es_base']) {
            $habitosPersonalizados[] = [
                'nombre' => $habito['nombre_habito'],
                'detalle' => count($registrosHabito) . (count($registrosHabito) === 1 ? ' registro' : ' registros'),
                'porcentaje' => round($porcentaje, 2)
            ];
        }
    }

    $categorias = [];
    foreach ($categoriasBD as $categoria) {
        $idCategoria = (int) $categoria['id_categoria'];
        $habitosCategoria = array_filter($habitos, fn($habito) => (int) $habito['id_categoria'] === $idCategoria);
        $totalHabitos = count($habitosCategoria);
        $completadosHoy = 0;
        $sumaPorcentajes = 0;

        foreach ($habitosCategoria as $habito) {
            $idHU = (int) $habito['id_habito_usuario'];
            $objetivo = (float) $habito['objetivo'];
            $progresoHoy = 0;
            foreach ($porHabito[$idHU] ?? [] as $registro) {
                if ($registro['fecha'] === $hoy->format('Y-m-d')) {
                    $progresoHoy += (float) $registro['valor_registrado'];
                }
            }
            $porcentajeHoy = $objetivo > 0 ? min(100, ($progresoHoy / $objetivo) * 100) : 0;
            $sumaPorcentajes += $porcentajeHoy;
            if ($porcentajeHoy >= 100) {
                $completadosHoy++;
            }
        }

        $categorias[] = [
            'id_categoria' => $idCategoria,
            'nombre_categoria' => $categoria['nombre'],
            'descripcion' => 'Administra tus hábitos de esta categoría.',
            'seleccionada' => $totalHabitos > 0,
            'porcentaje' => $totalHabitos > 0 ? round($sumaPorcentajes / $totalHabitos, 2) : 0,
            'total_habitos' => $totalHabitos,
            'completados_hoy' => $completadosHoy
        ];
    }

    $diasPersonalizados = [];
    $consultaDias = $db->query(
        "SELECT id_habito_usuario, dia_semana
         FROM habito_dias"
    );
    foreach ($consultaDias->fetchAll(PDO::FETCH_ASSOC) as $dia) {
        $idHU = (int) $dia['id_habito_usuario'];
        $diasPersonalizados[$idHU][] = (int) $dia['dia_semana'];
    }

    $consultaRacha = $db->prepare(
        "SELECT COALESCE(MAX(r.racha_actual), 0)
         FROM rachas r
         INNER JOIN habitos_usuario hu ON hu.id_habito_usuario = r.id_habito_usuario
         WHERE hu.id_usuario = :id_usuario
         AND hu.activo = TRUE"
    );
    $consultaRacha->execute([':id_usuario' => $idUsuario]);
    $diasRacha = (int) $consultaRacha->fetchColumn();

    $grafica = [];
    $cursor = $fechaInicio;
    while ($cursor <= $fechaFin) {
        $fecha = $cursor->format('Y-m-d');
        $esperados = 0;
        $completados = 0;
        $dia = (int) $cursor->format('N');

        foreach ($habitos as $habito) {
            if ($habito['fecha_inicio'] > $fecha || ($habito['fecha_fin'] !== null && $habito['fecha_fin'] < $fecha)) {
                continue;
            }
            $programado = $habito['frecuencia'] === 'diaria';
            if ($habito['frecuencia'] === 'personalizada') {
                $programado = in_array(
                    $dia,
                    $diasPersonalizados[(int) $habito['id_habito_usuario']] ?? [],
                    true
                );
            }
            if (!$programado) {
                continue;
            }
            $esperados++;
            $progreso = 0;
            foreach ($porHabito[(int) $habito['id_habito_usuario']] ?? [] as $registro) {
                if ($registro['fecha'] === $fecha) {
                    $progreso += (float) $registro['valor_registrado'];
                }
            }
            if ($progreso >= (float) $habito['objetivo']) {
                $completados++;
            }
        }

        $grafica[] = [
            'fecha' => $fecha,
            'porcentaje' => $esperados > 0 ? round(($completados / $esperados) * 100, 2) : 0,
            'completados' => $completados,
            'esperados' => $esperados
        ];
        $cursor = $cursor->modify('+1 day');
    }

    responderEstadisticas(true, '', [
        'periodo' => $periodo,
        'fecha_inicio' => $fechaInicio->format('Y-m-d'),
        'fecha_fin' => $fechaFin->format('Y-m-d'),
        'resumen' => [
            'progreso_general' => $habitosContados > 0 ? round($progresoGeneral / $habitosContados, 2) : 0,
            'dias_racha' => $diasRacha,
            'habitos_completados' => $habitosCompletados
        ],
        'grafica' => $grafica,
        'categorias' => $categorias,
        'habitos' => $habitosPersonalizados
    ]);

} catch (Throwable $error) {
    error_log('LifeSync estadisticas.php: ' . $error->getMessage());
    responderEstadisticas(false, 'No se pudieron cargar las estadísticas.', [], 500);
}
