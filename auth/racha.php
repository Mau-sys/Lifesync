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

    $diasMap = [];
    $stmtDiasHabito = $db->prepare("SELECT dia_semana FROM habito_dias WHERE id_habito_usuario = :id_habito_usuario");
    foreach ($habitos as $habito) {
        if ($habito['frecuencia'] === 'dias específicos' || $habito['frecuencia'] === 'personalizada') {
            $stmtDiasHabito->execute([':id_habito_usuario' => (int) $habito['id_habito_usuario']]);
            $diasMap[(int)$habito['id_habito_usuario']] = array_map('intval', $stmtDiasHabito->fetchAll(PDO::FETCH_COLUMN));
        }
    }

    $hoy = new DateTimeImmutable('today');
    $fechaHoy = $hoy->format('Y-m-d');

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

    $stmtRachaHabitoSelect = $db->prepare("SELECT racha_actual, mejor_racha, total_completados, ultima_fecha FROM rachas_habito WHERE id_habito_usuario = :id");
    $stmtRachaHabitoInsert = $db->prepare("
        INSERT INTO rachas_habito (id_habito_usuario, racha_actual, mejor_racha, total_completados, ultima_fecha)
        VALUES (:id, :racha_actual, :mejor_racha, :total_completados, :ultima_fecha)
        ON DUPLICATE KEY UPDATE
            racha_actual = VALUES(racha_actual),
            mejor_racha = VALUES(mejor_racha),
            total_completados = VALUES(total_completados),
            ultima_fecha = VALUES(ultima_fecha)
    ");

    foreach ($habitos as $habito) {
        $idHU = (int) $habito['id_habito_usuario'];
        
        $rachaHabito = 0;
        $mejorRachaHabito = 0;
        $totalCompletadosHabito = 0;
        $ultimaFechaCompletado = null;

        $rachaContando = true;
        for ($offset = 0; $offset < 365; $offset++) {
            $fechaEval = $hoy->modify("-$offset days");
            $fText = $fechaEval->format('Y-m-d');
            $diaSem = (int) $fechaEval->format('N');

            if ($habito['fecha_inicio'] > $fText) continue;
            if (!empty($habito['fecha_fin']) && $habito['fecha_fin'] < $fText) continue;

            $programado = ($habito['frecuencia'] === 'diaria');
            if ($habito['frecuencia'] === 'dias específicos' || $habito['frecuencia'] === 'personalizada') {
                $diasProgramados = $diasMap[$idHU] ?? [];
                $programado = in_array($diaSem, $diasProgramados, true);
            }

            if ($programado) {
                $cumplido = $calcularProgresoHabito($idHU, (string)$habito['unidad'], (float)$habito['objetivo'], $fText);
                if ($cumplido) {
                    $totalCompletadosHabito++;
                    if ($ultimaFechaCompletado === null) {
                        $ultimaFechaCompletado = $fText;
                    }
                    if ($rachaContando) {
                        $rachaHabito++;
                    }
                } else {
                    if ($offset === 0) {
                        continue;
                    }
                    $rachaContando = false;
                }
            }
        }
        $stmtRachaHabitoSelect->execute([':id' => $idHU]);
        $rachaGuardada = $stmtRachaHabitoSelect->fetch(PDO::FETCH_ASSOC);
        $mejorRachaHabito = max($rachaHabito, (int)($rachaGuardada['mejor_racha'] ?? 0));

        $stmtRachaHabitoInsert->execute([
            ':id' => $idHU,
            ':racha_actual' => $rachaHabito,
            ':mejor_racha' => $mejorRachaHabito,
            ':total_completados' => $totalCompletadosHabito,
            ':ultima_fecha' => $ultimaFechaCompletado
        ]);
    }
    $fechasCompletas = [];
    $stmtConstelacionInsert = $db->prepare("
        INSERT IGNORE INTO constelacion_dias (id_usuario, fecha) VALUES (:id_usuario, :fecha)
    ");

    for ($offset = 0; $offset < 365; $offset++) {
        $fechaEvaluar = $hoy->modify("-$offset days");
        $fechaTexto = $fechaEvaluar->format('Y-m-d');
        $diaSemana = (int) $fechaEvaluar->format('N');

        $esperados = 0;
        $completados = 0;

        foreach ($habitos as $habito) {
            $idHU = (int) $habito['id_habito_usuario'];

            if ($habito['fecha_inicio'] > $fechaTexto) continue;
            if (!empty($habito['fecha_fin']) && $habito['fecha_fin'] < $fechaTexto) continue;

            $programado = ($habito['frecuencia'] === 'diaria');
            if ($habito['frecuencia'] === 'dias específicos' || $habito['frecuencia'] === 'personalizada') {
                $diasProgramados = $diasMap[$idHU] ?? [];
                $programado = in_array($diaSemana, $diasProgramados, true);
            }

            if ($programado) {
                $esperados++;
                if ($calcularProgresoHabito($idHU, (string)$habito['unidad'], (float)$habito['objetivo'], $fechaTexto)) {
                    $completados++;
                }
            }
        }

        if ($esperados > 0 && $completados === $esperados) {
            $fechasCompletas[] = $fechaTexto;
            $stmtConstelacionInsert->execute([
                ':id_usuario' => $idUsuario,
                ':fecha' => $fechaTexto
            ]);
        }
    }
    $diasConAlMenosUnHabito = [];
    $stmtDiasConActividad = $db->prepare("
        SELECT DISTINCT DATE(r.fecha_registro) as fecha_actividad
        FROM registros_habitos r
        INNER JOIN habitos_usuario hu ON hu.id_habito_usuario = r.id_habito_usuario
        WHERE hu.id_usuario = :id_usuario
        ORDER BY fecha_actividad DESC
    ");
    $stmtDiasConActividad->execute([':id_usuario' => $idUsuario]);
    $diasConAlMenosUnHabito = $stmtDiasConActividad->fetchAll(PDO::FETCH_COLUMN);

    $hoyTieneActividad = in_array($fechaHoy, $diasConAlMenosUnHabito, true);
    $offsetGeneral = $hoyTieneActividad ? 0 : 1;
    $rachaGeneralActual = 0;

    while (in_array($hoy->modify("-$offsetGeneral days")->format('Y-m-d'), $diasConAlMenosUnHabito, true)) {
        $rachaGeneralActual++;
        $offsetGeneral++;
    }

    $stmtRachaUsuarioSelect = $db->prepare("SELECT mejor_racha_general FROM rachas_usuario WHERE id_usuario = :id_usuario");
    $stmtRachaUsuarioSelect->execute([':id_usuario' => $idUsuario]);
    $rachaUsuarioGuardada = $stmtRachaUsuarioSelect->fetch(PDO::FETCH_ASSOC);

    $mejorRachaGeneral = max($rachaGeneralActual, (int)($rachaUsuarioGuardada['mejor_racha_general'] ?? 0));
    $ultimaFechaActividad = $diasConAlMenosUnHabito[0] ?? null;

    $stmtRachaUsuarioInsert = $db->prepare("
        INSERT INTO rachas_usuario (id_usuario, racha_general_actual, mejor_racha_general, ultima_fecha_actividad)
        VALUES (:id_usuario, :racha_actual, :mejor_racha, :ultima_fecha)
        ON DUPLICATE KEY UPDATE
            racha_general_actual = VALUES(racha_general_actual),
            mejor_racha_general = VALUES(mejor_racha_general),
            ultima_fecha_actividad = VALUES(ultima_fecha_actividad)
    ");
    $stmtRachaUsuarioInsert->execute([
        ':id_usuario' => $idUsuario,
        ':racha_actual' => $rachaGeneralActual,
        ':mejor_racha' => $mejorRachaGeneral,
        ':ultima_fecha' => $ultimaFechaActividad
    ]);

    $constelacionActual = array_values(array_filter($fechasCompletas, function ($f) use ($hoy) {
        return str_starts_with($f, $hoy->format('Y-m'));
    }));

    $categoriasMap = [];
    $diaSemanaHoy = (int) $hoy->format('N');

    foreach ($habitos as $habito) {
        $idHU = (int) $habito['id_habito_usuario'];
        $nombreCat = $habito['nombre_categoria'] ?? 'Hábito Personalizado';
        if (!isset($categoriasMap[$nombreCat])) {
            $categoriasMap[$nombreCat] = ['total' => 0, 'completados' => 0];
        }

        $programadoHoy = ($habito['frecuencia'] === 'diaria');
        if ($habito['frecuencia'] === 'dias específicos' || $habito['frecuencia'] === 'personalizada') {
            $dias = $diasMap[$idHU] ?? [];
            $programadoHoy = in_array($diaSemanaHoy, $dias, true);
        }

        if ($programadoHoy) {
            $categoriasMap[$nombreCat]['total']++;
            if ($calcularProgresoHabito($idHU, (string)$habito['unidad'], (float)$habito['objetivo'], $fechaHoy)) {
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

    $habitosCompletadosHoy = 0;
    foreach ($habitos as $habito) {
        if ($calcularProgresoHabito((int)$habito['id_habito_usuario'], (string)$habito['unidad'], (float)$habito['objetivo'], $fechaHoy)) {
            $habitosCompletadosHoy++;
        }
    }

    $diasRegistrados = count($diasConAlMenosUnHabito);

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
    responderRacha(true, 'Rachas sincronizadas y guardadas correctamente.', [
        'racha_actual' => $rachaGeneralActual,       
        'mejor_racha' => $mejorRachaGeneral,        
        'habitos_completados' => $habitosCompletadosHoy,
        'dias_registrados' => $diasRegistrados,
        'constelacion_actual' => $constelacionActual,
        'categorias' => $categoriasFormateadas,
        'historial_constelaciones' => $historial
    ]);

} catch (Throwable $error) {
    error_log('LifeSync racha.php error: ' . $error->getMessage());
    responderRacha(false, 'No se pudieron sincronizar las rachas.', [], 500);
}