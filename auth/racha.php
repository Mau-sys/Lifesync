<?php

declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../config/conexion.php';

function responderRacha(bool $exito, string $mensaje = '', array $datos = [], int $codigo = 200): never
{
    http_response_code($codigo);
    echo json_encode(array_merge(['exito' => $exito, 'mensaje' => $mensaje], $datos), JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
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
            hu.fecha_fin,
            ra.racha_actual,
            ra.mejor_racha,
            ra.total_completados
         FROM habitos_usuario hu
         INNER JOIN habitos h ON h.id_habito = hu.id_habito
         LEFT JOIN categorias c ON c.id_categoria = h.id_categoria
         LEFT JOIN rachas ra ON ra.id_habito_usuario = hu.id_habito_usuario
         WHERE hu.id_usuario = :id_usuario
         AND hu.activo = TRUE
         AND hu.fecha_inicio <= CURDATE()
         AND (hu.fecha_fin IS NULL OR hu.fecha_fin >= CURDATE())
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

    $hoy = new DateTimeImmutable('today');
    $diaSemana = (int) $hoy->format('N');

    $programados = [];
    foreach ($habitos as $habito) {
        $frecuencia = $habito['frecuencia'];
        $programadoHoy = $frecuencia === 'diaria';

        if ($frecuencia === 'personalizada') {
            $dias = $db->prepare(
                "SELECT dia_semana FROM habito_dias WHERE id_habito_usuario = :id_habito_usuario"
            );
            $dias->execute([':id_habito_usuario' => (int) $habito['id_habito_usuario']]);
            $programadoHoy = in_array($diaSemana, array_map('intval', $dias->fetchAll(PDO::FETCH_COLUMN)), true);
        }

        if ($programadoHoy) {
            $programados[] = $habito;
        }
    }

    $completadosHoy = 0;
    $habitosPorCategoria = [];
    foreach ($programados as $habito) {
        $consultaProgreso = $db->prepare(
            "SELECT COALESCE(SUM(valor_registrado), 0)
             FROM registros_habitos
             WHERE id_habito_usuario = :id_habito_usuario
             AND DATE(fecha_registro) = CURDATE()"
        );
        $consultaProgreso->execute([':id_habito_usuario' => (int) $habito['id_habito_usuario']]);
        $progreso = (float) $consultaProgreso->fetchColumn();
        $completado = $progreso >= (float) $habito['objetivo'];
        if ($completado) {
            $completadosHoy++;
        }

        $idCategoria = (int) $habito['id_categoria'];
        if (!isset($habitosPorCategoria[$idCategoria])) {
            $habitosPorCategoria[$idCategoria] = [];
        }
        $habitosPorCategoria[$idCategoria][] = [
            'id_habito_usuario' => (int) $habito['id_habito_usuario'],
            'nombre_habito' => $habito['nombre_habito'],
            'progreso' => $progreso,
            'objetivo' => (float) $habito['objetivo'],
            'completado' => $completado
        ];
    }

    $diasCompletos = [];
    $consultaDias = $db->prepare(
        "SELECT DISTINCT DATE(r.fecha_registro) AS fecha
         FROM registros_habitos r
         INNER JOIN habitos_usuario hu ON hu.id_habito_usuario = r.id_habito_usuario
         WHERE hu.id_usuario = :id_usuario
         AND hu.activo = TRUE
         ORDER BY fecha DESC"
    );
    $consultaDias->execute([':id_usuario' => $idUsuario]);
    $fechasConRegistro = $consultaDias->fetchAll(PDO::FETCH_COLUMN);

    $fechasCompletas = [];
    $consultaProgramados = $db->prepare(
        "SELECT
            hu.id_habito_usuario,
            hu.frecuencia
         FROM habitos_usuario hu
         WHERE hu.id_usuario = :id_usuario
         AND hu.activo = TRUE
         AND hu.fecha_inicio <= :fecha
         AND (hu.fecha_fin IS NULL OR hu.fecha_fin >= :fecha)"
    );

    $consultaDiasHabito = $db->prepare(
        "SELECT dia_semana FROM habito_dias WHERE id_habito_usuario = :id_habito_usuario"
    );

    $consultaRegistrosDia = $db->prepare(
        "SELECT COALESCE(SUM(valor_registrado), 0)
         FROM registros_habitos
         WHERE id_habito_usuario = :id_habito_usuario
         AND DATE(fecha_registro) = :fecha"
    );

    $consultaObjetivo = $db->prepare(
        "SELECT objetivo FROM habitos_usuario WHERE id_habito_usuario = :id_habito_usuario"
    );

    for ($offset = 0; $offset < 366; $offset++) {
        $fecha = $hoy->modify("-$offset days");
        $fechaTexto = $fecha->format('Y-m-d');
        $dia = (int) $fecha->format('N');

        $consultaProgramados->execute([
            ':id_usuario' => $idUsuario,
            ':fecha' => $fechaTexto
        ]);
        $habitosDia = $consultaProgramados->fetchAll(PDO::FETCH_ASSOC);

        $esperados = 0;
        $completados = 0;
        foreach ($habitosDia as $habitoDia) {
            $programado = $habitoDia['frecuencia'] === 'diaria';
            if ($habitoDia['frecuencia'] === 'personalizada') {
                $consultaDiasHabito->execute([':id_habito_usuario' => (int) $habitoDia['id_habito_usuario']]);
                $programado = in_array($dia, array_map('intval', $consultaDiasHabito->fetchAll(PDO::FETCH_COLUMN)), true);
            }
            if (!$programado) {
                continue;
            }

            $esperados++;
            $consultaRegistrosDia->execute([
                ':id_habito_usuario' => (int) $habitoDia['id_habito_usuario'],
                ':fecha' => $fechaTexto
            ]);
            $progreso = (float) $consultaRegistrosDia->fetchColumn();
            $consultaObjetivo->execute([':id_habito_usuario' => (int) $habitoDia['id_habito_usuario']]);
            $objetivo = (float) $consultaObjetivo->fetchColumn();
            if ($objetivo > 0 && $progreso >= $objetivo) {
                $completados++;
            }
        }

        if ($esperados > 0 && $completados === $esperados) {
            $fechasCompletas[] = $fechaTexto;
        }

        if ($offset > 0 && $esperados === 0 && $fechaTexto < $habitos[0]['fecha_inicio']) {
            break;
        }
    }

    $rachaActual = 0;
    foreach ($fechasCompletas as $fecha) {
        $esperada = $hoy->modify("-$rachaActual days")->format('Y-m-d');
        if ($fecha !== $esperada) {
            break;
        }
        $rachaActual++;
    }

    $mejorRacha = 0;
    $rachaTemporal = 0;
    $anterior = null;
    foreach (array_reverse($fechasCompletas) as $fecha) {
        if ($anterior === null || (new DateTimeImmutable($fecha))->modify('+1 day')->format('Y-m-d') === $anterior) {
            $rachaTemporal++;
        } else {
            $rachaTemporal = 1;
        }
        $mejorRacha = max($mejorRacha, $rachaTemporal);
        $anterior = $fecha;
    }

    $habitosCompletados = $completadosHoy;
    $diasRegistrados = count($fechasConRegistro);

    $constelacionActual = [];
    foreach ($programados as $habito) {
        $idCategoria = (int) $habito['id_categoria'];
        $progresoCategoria = $habitosPorCategoria[$idCategoria] ?? [];
        $completo = false;
        foreach ($progresoCategoria as $item) {
            if ($item['id_habito_usuario'] === (int) $habito['id_habito_usuario']) {
                $completo = $item['completado'];
                break;
            }
        }
        $constelacionActual[] = [
            'id_habito_usuario' => (int) $habito['id_habito_usuario'],
            'nombre_habito' => $habito['nombre_habito'],
            'categoria' => $habito['nombre_categoria'],
            'completado' => $completo
        ];
    }

    $categorias = [];
    foreach ($habitos as $habito) {
        $idCategoria = (int) $habito['id_categoria'];
        if (isset($categorias[$idCategoria])) {
            continue;
        }
        $items = $habitosPorCategoria[$idCategoria] ?? [];
        $total = count($items);
        $completados = count(array_filter($items, fn($item) => $item['completado']));
        $categorias[$idCategoria] = [
            'id_categoria' => $idCategoria,
            'nombre_categoria' => $habito['nombre_categoria'],
            'total_habitos' => $total,
            'completados_hoy' => $completados,
            'porcentaje' => $total > 0 ? round(($completados / $total) * 100, 2) : 0
        ];
    }

    $historial = [];
    for ($i = 0; $i < 12; $i++) {
        $mes = $hoy->modify("-$i months");
        $inicio = $mes->modify('first day of this month')->format('Y-m-d');
        $fin = $mes->modify('last day of this month')->format('Y-m-d');
        $consulta = $db->prepare(
            "SELECT COUNT(DISTINCT DATE(r.fecha_registro))
             FROM registros_habitos r
             INNER JOIN habitos_usuario hu ON hu.id_habito_usuario = r.id_habito_usuario
             WHERE hu.id_usuario = :id_usuario
             AND DATE(r.fecha_registro) BETWEEN :inicio AND :fin"
        );
        $consulta->execute([
            ':id_usuario' => $idUsuario,
            ':inicio' => $inicio,
            ':fin' => $fin
        ]);
        $historial[] = [
            'mes' => $mes->format('Y-m'),
            'dias_con_registro' => (int) $consulta->fetchColumn()
        ];
    }

    responderRacha(true, '', [
        'racha_actual' => $rachaActual,
        'mejor_racha' => $mejorRacha,
        'habitos_completados' => $habitosCompletados,
        'dias_registrados' => $diasRegistrados,
        'constelacion_actual' => $constelacionActual,
        'categorias' => array_values($categorias),
        'historial_constelaciones' => $historial
    ]);

} catch (Throwable $error) {
    error_log('LifeSync racha.php: ' . $error->getMessage());
    responderRacha(false, 'No se pudieron cargar las rachas.', [], 500);
}
