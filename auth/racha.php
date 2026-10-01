<?php

declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=UTF-8');

$rutaConexion = __DIR__ . '/../config/conexion.php';
if (!file_exists($rutaConexion)) {
    $rutaConexion = '../config/conexion.php';
}
require_once $rutaConexion;

function responderRacha(bool $exito, string $mensaje = '', array $datos = [], int $codigo = 200): never
{
    http_response_code($codigo);
    echo json_encode(array_merge(['exito' => $exito, 'mensaje' => $mensaje], $datos), JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($_SESSION['usuario_id'])) {
    responderRacha(false, 'La sesión ha expirado.', ['codigo' => 'SESION_INVALIDA'], 401);
}

$idUsuario = (int) $_SESSION['usuario_id'];

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Obtener todos los hábitos del usuario
    $consulta = $db->prepare(
        "SELECT
            hu.id_habito_usuario,
            h.id_habito,
            h.id_categoria,
            h.nombre_habito,
            c.nombre AS nombre_categoria,
            hu.objetivo,
            hu.unidad,
            hu.frecuencia,
            hu.fecha_inicio,
            hu.fecha_fin
         FROM habitos_usuario hu
         INNER JOIN habitos h ON h.id_habito = hu.id_habito
         LEFT JOIN categorias c ON c.id_categoria = h.id_categoria
         WHERE hu.id_usuario = :id_usuario
         AND hu.activo = 1
         ORDER BY h.id_categoria, h.id_habito"
    );
    $consulta->execute([':id_usuario' => $idUsuario]);
    $habitos = $consulta->fetchAll(PDO::FETCH_ASSOC);

    if (!$habitos) {
        responderRacha(true, 'No hay hábitos activos todavía.', [
            'codigo' => 'SIN_HABITOS',
            'racha_actual' => 0,
            'mejor_racha' => 0,
            'habitos_completados' => 0,
            'dias_registrados' => 0,
            'constelacion_actual' => [],
            'categorias' => [],
            'historial_constelaciones' => []
        ]);
    }

    // Precargar días personalizados en memoria para optimizar rendimiento
    $diasMap = [];
    $stmtDiasHabito = $db->prepare("SELECT dia_semana FROM habito_dias WHERE id_habito_usuario = :id_habito_usuario");
    foreach ($habitos as $habito) {
        if ($habito['frecuencia'] === 'personalizada') {
            $stmtDiasHabito->execute([':id_habito_usuario' => (int) $habito['id_habito_usuario']]);
            $diasMap[(int)$habito['id_habito_usuario']] = array_map('intval', $stmtDiasHabito->fetchAll(PDO::FETCH_COLUMN));
        }
    }

    $hoy = new DateTimeImmutable('today');

    // Función auxiliar para calcular el progreso de un hábito en una fecha dada
    $calcularProgresoHabito = function (int $idHU, string $unidadHabito, float $objetivo, string $fechaTexto) use ($db): bool {
        $stmtSum = $db->prepare("
            SELECT 
                COALESCE(SUM(valor_registrado), 0) AS suma_dia, 
                COUNT(*) AS registros_dia 
            FROM registros_habitos 
            WHERE id_habito_usuario = :id 
              AND DATE(fecha_registro) = :fecha
        ");
        $stmtSum->execute([':id' => $idHU, ':fecha' => $fechaTexto]);
        $conteo = $stmtSum->fetch(PDO::FETCH_ASSOC);

        $suma = (float) ($conteo['suma_dia'] ?? 0);
        $registros = (int) ($conteo['registros_dia'] ?? 0);

        $unidad = mb_strtolower((string) $unidadHabito, 'UTF-8');
        $esSesion = str_contains($unidad, 'sesion') || str_contains($unidad, 'registro') || str_contains($unidad, 'comida') || str_contains($unidad, 'pausa');
        
        $progreso = $esSesion ? $registros : $suma;
        return $objetivo > 0 && $progreso >= $objetivo;
    };

    // 2. Evaluamos días completados en los últimos 365 días
    $fechasCompletas = [];

    for ($offset = 0; $offset < 365; $offset++) {
        $fechaEvaluar = $hoy->modify("-$offset days");
        $fechaTexto = $fechaEvaluar->format('Y-m-d');
        $diaSemana = (int) $fechaEvaluar->format('N');

        $esperados = 0;
        $completados = 0;

        foreach ($habitos as $habito) {
            $idHU = (int) $habito['id_habito_usuario'];

            // Vigencia del hábito
            if ($habito['fecha_inicio'] > $fechaTexto) {
                continue;
            }
            if (!empty($habito['fecha_fin']) && $habito['fecha_fin'] < $fechaTexto) {
                continue;
            }

            // Frecuencia del hábito
            $programado = ($habito['frecuencia'] === 'diaria');
            if ($habito['frecuencia'] === 'personalizada') {
                $diasProgramados = $diasMap[$idHU] ?? [];
                $programado = in_array($diaSemana, $diasProgramados, true);
            }

            if ($programado) {
                $esperados++;
                $completado = $calcularProgresoHabito(
                    $idHU,
                    (string) $habito['unidad'],
                    (float) $habito['objetivo'],
                    $fechaTexto
                );
                if ($completado) {
                    $completados++;
                }
            }
        }

        if ($esperados > 0 && $completados === $esperados) {
            $fechasCompletas[] = $fechaTexto;
        }
    }

    // 3. Cálculo de Racha Actual y Mejor Racha
    $fechaHoy = $hoy->format('Y-m-d');
    $hoyCompletado = in_array($fechaHoy, $fechasCompletas, true);
    
    // Si hoy no está completado, empezamos a contar la racha desde ayer
    $offsetRacha = $hoyCompletado ? 0 : 1;
    $rachaActual = 0;

    while (in_array($hoy->modify("-$offsetRacha days")->format('Y-m-d'), $fechasCompletas, true)) {
        $rachaActual++;
        $offsetRacha++;
    }

    // Calcular mejor racha histórica
    $mejorRacha = 0;
    $rachaTemp = 0;
    $fechaAnterior = null;

    $fechasOrdenadas = $fechasCompletas;
    sort($fechasOrdenadas); // Orden cronológico ascendente

    foreach ($fechasOrdenadas as $f) {
        $fechaObj = new DateTimeImmutable($f);
        if ($fechaAnterior === null) {
            $rachaTemp = 1;
        } else {
            $diferencia = $fechaAnterior->diff($fechaObj)->days;
            if ($diferencia === 1) {
                $rachaTemp++;
            } else {
                $rachaTemp = 1;
            }
        }
        $fechaAnterior = $fechaObj;
        $mejorRacha = max($mejorRacha, $rachaTemp);
    }

    // 4. Mapeo de Constelación del Mes Actual
    $constelacionActual = array_values(array_filter($fechasCompletas, function ($f) use ($hoy) {
        return str_starts_with($f, $hoy->format('Y-m'));
    }));

    // 5. Mapeo de Constancia por Categoría para hoy
    $categoriasMap = [];
    $diaSemanaHoy = (int) $hoy->format('N');

    foreach ($habitos as $habito) {
        $idHU = (int) $habito['id_habito_usuario'];
        $nombreCat = $habito['nombre_categoria'] ?? 'Hábito Personalizado';
        if (!isset($categoriasMap[$nombreCat])) {
            $categoriasMap[$nombreCat] = ['total' => 0, 'completados' => 0];
        }

        $programadoHoy = ($habito['frecuencia'] === 'diaria');
        if ($habito['frecuencia'] === 'personalizada') {
            $dias = $diasMap[$idHU] ?? [];
            $programadoHoy = in_array($diaSemanaHoy, $dias, true);
        }

        if ($programadoHoy) {
            $categoriasMap[$nombreCat]['total']++;
            $estaCompleto = $calcularProgresoHabito(
                $idHU,
                (string) $habito['unidad'],
                (float) $habito['objetivo'],
                $fechaHoy
            );
            if ($estaCompleto) {
                $categoriasMap[$nombreCat]['completados']++;
            }
        }
    }

    $categoriasFormateadas = [];
    foreach ($categoriasMap as $nombre => $datos) {
        $porcentaje = $datos['total'] > 0 ? round(($datos['completados'] / $datos['total']) * 100, 2) : 0;
        $categoriasFormateadas[] = [
            'nombre_categoria' => $nombre,
            'porcentaje' => $porcentaje
        ];
    }

    // 6. Totales Generales
    $habitosCompletadosHoy = 0;
    foreach ($habitos as $habito) {
        if ($calcularProgresoHabito((int)$habito['id_habito_usuario'], (string)$habito['unidad'], (float)$habito['objetivo'], $fechaHoy)) {
            $habitosCompletadosHoy++;
        }
    }

    $stmtDiasReg = $db->prepare("
        SELECT COUNT(DISTINCT DATE(r.fecha_registro))
        FROM registros_habitos r
        INNER JOIN habitos_usuario hu ON hu.id_habito_usuario = r.id_habito_usuario
        WHERE hu.id_usuario = :id_usuario
    ");
    $stmtDiasReg->execute([':id_usuario' => $idUsuario]);
    $diasRegistrados = (int) $stmtDiasReg->fetchColumn();

    // 7. Historial de los últimos 12 meses
    $historial = [];
    for ($i = 0; $i < 12; $i++) {
        $mesEval = $hoy->modify("-$i months");
        $inicioMes = $mesEval->modify('first day of this month')->format('Y-m-d');
        $finMes = $mesEval->modify('last day of this month')->format('Y-m-d');

        $stmtHist = $db->prepare("
            SELECT COUNT(DISTINCT DATE(r.fecha_registro))
            FROM registros_habitos r
            INNER JOIN habitos_usuario hu ON hu.id_habito_usuario = r.id_habito_usuario
            WHERE hu.id_usuario = :id_usuario
              AND DATE(r.fecha_registro) BETWEEN :inicio AND :fin
        ");
        $stmtHist->execute([':id_usuario' => $idUsuario, ':inicio' => $inicioMes, ':fin' => $finMes]);

        $historial[] = [
            'mes' => $mesEval->format('Y-m'),
            'dias_con_registro' => (int) $stmtHist->fetchColumn()
        ];
    }

    responderRacha(true, '', [
        'racha_actual' => $rachaActual,
        'mejor_racha' => $mejorRacha,
        'habitos_completados' => $habitosCompletadosHoy,
        'dias_registrados' => $diasRegistrados,
        'constelacion_actual' => $constelacionActual,
        'categorias' => $categoriasFormateadas,
        'historial_constelaciones' => $historial
    ]);

} catch (Throwable $error) {
    error_log('LifeSync racha.php error: ' . $error->getMessage());
    responderRacha(false, 'No se pudieron cargar las rachas.', [], 500);
}