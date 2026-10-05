<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../config/conexion.php';

function responder(bool $exito, string $mensaje = '', array $datos = [], int $codigo = 200): never {
    http_response_code($codigo);
    echo json_encode(array_merge(['exito' => $exito, 'mensaje' => $mensaje], $datos), JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    responder(false, 'La sesión ha expirado.', [], 401);
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
        "SELECT hu.id_habito_usuario, h.id_categoria, h.nombre_habito, h.es_base,
                c.nombre AS nombre_categoria, hu.objetivo, hu.frecuencia, hu.fecha_inicio, hu.fecha_fin
         FROM habitos_usuario hu
         INNER JOIN habitos h ON h.id_habito = hu.id_habito
         LEFT JOIN categorias c ON c.id_categoria = h.id_categoria
         WHERE hu.id_usuario = :id_usuario AND hu.activo = TRUE"
    );
    $consultaHabitos->execute([':id_usuario' => $idUsuario]);
    $habitos = $consultaHabitos->fetchAll(PDO::FETCH_ASSOC);

    $consultaRegistros = $db->prepare(
        "SELECT r.id_habito_usuario, DATE(r.fecha_registro) AS fecha, SUM(r.valor_registrado) AS total_dia
         FROM registros_habitos r
         INNER JOIN habitos_usuario hu ON hu.id_habito_usuario = r.id_habito_usuario
         WHERE hu.id_usuario = :id_usuario
           AND DATE(r.fecha_registro) BETWEEN :inicio AND :fin
         GROUP BY r.id_habito_usuario, DATE(r.fecha_registro)"
    );
    $consultaRegistros->execute([
        ':id_usuario' => $idUsuario,
        ':inicio' => $fechaInicio->format('Y-m-d'),
        ':fin' => $fechaFin->format('Y-m-d')
    ]);
    $registrosBD = $consultaRegistros->fetchAll(PDO::FETCH_ASSOC);

    $matrizRegistros = [];
    foreach ($registrosBD as $reg) {
        $matrizRegistros[(int)$reg['id_habito_usuario']][$reg['fecha']] = (float)$reg['total_dia'];
    }

    $diasPersonalizados = [];
    $consultaDias = $db->query("SELECT id_habito_usuario, dia_semana FROM habito_dias");
    foreach ($consultaDias->fetchAll(PDO::FETCH_ASSOC) as $dia) {
        $diasPersonalizados[(int)$dia['id_habito_usuario']][] = (int)$dia['dia_semana'];
    }

    $grafica = [];
    $cursor = $fechaInicio;
    $totalCompletadosPeriodo = 0;

    while ($cursor <= $fechaFin) {
        $fechaStr = $cursor->format('Y-m-d');
        $numDiaSemana = (int)$cursor->format('N');
        $esperados = 0;
        $completados = 0;

        foreach ($habitos as $habito) {
            $idHU = (int)$habito['id_habito_usuario'];

            if ($habito['fecha_inicio'] > $fechaStr || ($habito['fecha_fin'] !== null && $habito['fecha_fin'] < $fechaStr)) {
                continue;
            }

            $corresponde = $habito['frecuencia'] === 'diaria';
            if ($habito['frecuencia'] === 'dias específicos' || $habito['frecuencia'] === 'personalizada') {
                $corresponde = in_array($numDiaSemana, $diasPersonalizados[$idHU] ?? [], true);
            }

            if (!$corresponde) continue;

            $esperados++;
            $avance = $matrizRegistros[$idHU][$fechaStr] ?? 0;
            if ($avance >= (float)$habito['objetivo']) {
                $completados++;
            }
        }

        $porcentajeDia = $esperados > 0 ? round(($completados / $esperados) * 100, 2) : 0;
        $totalCompletadosPeriodo += $completados;

        $grafica[] = [
            'fecha' => $fechaStr,
            'porcentaje' => $porcentajeDia,
            'completados' => $completados,
            'esperados' => $esperados
        ];

        $cursor = $cursor->modify('+1 day');
    }

    $consultaRacha = $db->prepare(
        "SELECT COALESCE(racha_general_actual, 0) 
         FROM rachas_usuario 
         WHERE id_usuario = :id_usuario LIMIT 1"
    );
    $consultaRacha->execute([':id_usuario' => $idUsuario]);
    $diasRacha = (int) $consultaRacha->fetchColumn();

    $sumaPorcentajes = array_sum(array_column($grafica, 'porcentaje'));
    $progresoGeneral = count($grafica) > 0 ? round($sumaPorcentajes / count($grafica), 2) : 0;

    $consultaCategorias = $db->query("SELECT id_categoria, nombre FROM categorias ORDER BY id_categoria");
    $categoriasBD = $consultaCategorias->fetchAll(PDO::FETCH_ASSOC);

    $categorias = [];
    foreach ($categoriasBD as $cat) {
        $idCat = (int)$cat['id_categoria'];
        $habsCat = array_filter($habitos, fn($h) => (int)$h['id_categoria'] === $idCat);
        $totalHabs = count($habsCat);
        $completadosHoy = 0;

        foreach ($habsCat as $h) {
            $idHU = (int)$h['id_habito_usuario'];
            $avanceHoy = $matrizRegistros[$idHU][$hoy->format('Y-m-d')] ?? 0;
            if ($avanceHoy >= (float)$h['objetivo']) {
                $completadosHoy++;
            }
        }

        $categorias[] = [
            'id_categoria' => $idCat,
            'nombre_categoria' => $cat['nombre'],
            'total_habitos' => $totalHabs,
            'completados_hoy' => $completadosHoy,
            'porcentaje' => $totalHabs > 0 ? round(($completadosHoy / $totalHabs) * 100, 2) : 0
        ];
    }

    $habitosPersonalizados = [];
    foreach ($habitos as $h) {
        if (!(bool)$h['es_base']) {
            $idHU = (int)$h['id_habito_usuario'];
            $totalRegs = count($matrizRegistros[$idHU] ?? []);
            $avanceHoy = $matrizRegistros[$idHU][$hoy->format('Y-m-d')] ?? 0;
            $pctHoy = min(100, round(($avanceHoy / (float)$h['objetivo']) * 100, 2));

            $habitosPersonalizados[] = [
                'nombre' => $h['nombre_habito'],
                'detalle' => $totalRegs . ($totalRegs === 1 ? ' registro en el período' : ' registros en el período'),
                'porcentaje' => $pctHoy
            ];
        }
    }

    responder(true, '', [
        'resumen' => [
            'progreso_general' => $progresoGeneral,
            'dias_racha' => $diasRacha,
            'habitos_completados' => $totalCompletadosPeriodo
        ],
        'grafica' => $grafica,
        'categorias' => $categorias,
        'habitos' => $habitosPersonalizados
    ]);

} catch (Throwable $e) {
    error_log("Error en estadisticas.php: " . $e->getMessage());
    responder(false, "No se pudieron obtener las estadísticas.", [], 500);
}