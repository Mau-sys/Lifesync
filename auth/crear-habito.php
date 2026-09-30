<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/conexion.php";

function responder(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (!isset($_SESSION["usuario_id"])) {
    responder(["exito" => false, "mensaje" => "La sesión ha expirado. Inicia sesión nuevamente."], 401);
}

$datos = json_decode(file_get_contents("php://input"), true);
if (!is_array($datos)) {
    responder(["exito" => false, "mensaje" => "Los datos enviados no son válidos."], 400);
}

// Normalización de claves
$nombre = trim($datos["nombre_habito"] ?? $datos["nombre"] ?? "");
$descripcion = trim($datos["descripcion"] ?? $datos["objetivo"] ?? "");
$frecuenciaRaw = trim($datos["frecuencia"] ?? "");
$fechaInicio = trim($datos["fecha_inicio"] ?? $datos["fechaInicio"] ?? "");
$fechaFin = trim($datos["fecha_fin"] ?? $datos["fechaFin"] ?? "");

// Aceptar días de la semana
$diasEntrada = $datos["dias_activos"] ?? $datos["dias_semana"] ?? $datos["dias"] ?? [];

if ($nombre === "" || $descripcion === "" || $frecuenciaRaw === "") {
    responder(["exito" => false, "mensaje" => "Completa todos los campos obligatorios."], 400);
}

if ($fechaInicio === "") {
    $fechaInicio = date("Y-m-d");
}

// Normalizar ENUM frecuencia MySQL
$frecuencia = strtolower($frecuenciaRaw);
if ($frecuencia === "diario" || $frecuencia === "diaria") {
    $frecuenciaBD = "diaria";
} elseif ($frecuencia === "semanal") {
    $frecuenciaBD = "semanal";
} elseif ($frecuencia === "mensual") {
    $frecuenciaBD = "mensual";
} else {
    $frecuenciaBD = "dias específicos";
}

$usuarioId = (int) $_SESSION["usuario_id"];

try {
    $database = new Database();
    $db = $database->getConnection();
    $db->beginTransaction();

    $categoriaQuery = $db->prepare("SELECT id_categoria FROM categorias WHERE nombre = 'Hábito Personalizado' LIMIT 1");
    $categoriaQuery->execute();
    $idCategoria = $categoriaQuery->fetchColumn();

    if (!$idCategoria) {
        throw new Exception("La categoría 'Hábito Personalizado' no existe en la base de datos.");
    }

    // 1. Insertar en habitos
    $insertarHabito = $db->prepare("
        INSERT INTO habitos (id_categoria, nombre_habito, descripcion, es_base, color, imagen_url) 
        VALUES (:id_categoria, :nombre, :descripcion, FALSE, '#F59E0B', 'img/H-Perzona.png')
    ");
    $insertarHabito->execute([
        ":id_categoria" => (int) $idCategoria,
        ":nombre" => $nombre,
        ":descripcion" => $descripcion
    ]);

    $idHabito = (int) $db->lastInsertId();

    // 2. Insertar en habitos_usuario
    $insertarUsuarioHabito = $db->prepare("
        INSERT INTO habitos_usuario (id_usuario, id_habito, activo, objetivo, unidad, frecuencia, fecha_inicio, fecha_fin) 
        VALUES (:id_usuario, :id_habito, TRUE, 1.00, 'registros', :frecuencia, :fecha_inicio, :fecha_fin)
    ");
    $insertarUsuarioHabito->execute([
        ":id_usuario" => $usuarioId,
        ":id_habito" => $idHabito,
        ":frecuencia" => $frecuenciaBD,
        ":fecha_inicio" => $fechaInicio,
        ":fecha_fin" => !empty($fechaFin) ? $fechaFin : null
    ]);

    $idHabitoUsuario = (int) $db->lastInsertId();

    // 3. Guardar en habito_dias si es frecuencia específica
    if ($frecuenciaBD === "dias específicos" && is_array($diasEntrada)) {
        $stmtDia = $db->prepare("INSERT INTO habito_dias (id_habito_usuario, dia_semana) VALUES (:id_hu, :dia)");
        foreach ($diasEntrada as $dia) {
            $diaInt = (int) $dia;
            if ($diaInt >= 1 && $diaInt <= 7) {
                $stmtDia->execute([":id_hu" => $idHabitoUsuario, ":dia" => $diaInt]);
            }
        }
    }

    // 4. Crear racha inicial
    $insertarRacha = $db->prepare("
        INSERT INTO rachas (id_habito_usuario, racha_actual, mejor_racha, total_completados, ultima_fecha) 
        VALUES (:id_hu, 0, 0, 0, NULL)
    ");
    $insertarRacha->execute([":id_hu" => $idHabitoUsuario]);

    $db->commit();

    responder([
        "exito" => true,
        "mensaje" => "Hábito creado correctamente.",
        "habito" => [
            "id_habito" => $idHabito,
            "id_habito_usuario" => $idHabitoUsuario,
            "nombre" => $nombre,
            "frecuencia" => $frecuenciaBD
        ]
    ]);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    responder(["exito" => false, "mensaje" => $error->getMessage()], 500);
}