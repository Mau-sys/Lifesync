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

$nombre = trim($datos["nombre"] ?? "");
$descripcion = trim($datos["descripcion"] ?? "");
$frecuencia = trim($datos["frecuencia"] ?? "");
$fechaInicio = trim($datos["fechaInicio"] ?? "");
$fechaFin = trim($datos["fechaFin"] ?? "");

if ($nombre === "" || $descripcion === "" || $frecuencia === "" || $fechaInicio === "") {
    responder(["exito" => false, "mensaje" => "Completa todos los campos obligatorios."], 400);
}

if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 150) {
    responder(["exito" => false, "mensaje" => "El nombre del hábito debe tener entre 2 y 150 caracteres."], 400);
}

if (mb_strlen($descripcion) < 3 || mb_strlen($descripcion) > 500) {
    responder(["exito" => false, "mensaje" => "La descripción debe tener entre 3 y 500 caracteres."], 400);
}

$frecuenciasPermitidas = ["diaria", "semanal", "mensual"];
if (!in_array($frecuencia, $frecuenciasPermitidas, true)) {
    responder(["exito" => false, "mensaje" => "La frecuencia seleccionada no es válida."], 400);
}

$inicio = DateTime::createFromFormat("Y-m-d", $fechaInicio);
if (!$inicio || $inicio->format("Y-m-d") !== $fechaInicio) {
    responder(["exito" => false, "mensaje" => "La fecha de inicio no es válida."], 400);
}

if ($fechaFin !== "") {
    $fin = DateTime::createFromFormat("Y-m-d", $fechaFin);
    if (!$fin || $fin->format("Y-m-d") !== $fechaFin) {
        responder(["exito" => false, "mensaje" => "La fecha de finalización no es válida."], 400);
    }
    if ($fin < $inicio) {
        responder(["exito" => false, "mensaje" => "La fecha de finalización no puede ser anterior a la fecha de inicio."], 400);
    }
} else {
    $fechaFin = null;
}

$usuarioId = (int) $_SESSION["usuario_id"];

try {
    $database = new Database();
    $db = $database->getConnection();
    $db->beginTransaction();

    $categoria = $db->prepare("SELECT id_categoria FROM categorias WHERE nombre = 'Hábito Personalizado' LIMIT 1");
    $categoria->execute();
    $idCategoria = $categoria->fetchColumn();

    if (!$idCategoria) {
        throw new Exception("La categoría de hábitos personalizados no existe. Ejecuta la migración correspondiente.");
    }

    $insertarHabito = $db->prepare("INSERT INTO habitos (id_categoria, nombre_habito, descripcion, es_base, color, imagen_url) VALUES (:id_categoria, :nombre, :descripcion, FALSE, :color, :imagen)");
    $insertarHabito->execute([
        ":id_categoria" => (int) $idCategoria,
        ":nombre" => $nombre,
        ":descripcion" => $descripcion,
        ":color" => "#F59E0B",
        ":imagen" => "img/H-Perzona.png"
    ]);

    $idHabito = (int) $db->lastInsertId();

    $insertarUsuarioHabito = $db->prepare("INSERT INTO habitos_usuario (id_usuario, id_habito, activo, objetivo, unidad, frecuencia, duracion_minutos, fecha_inicio, fecha_fin) VALUES (:id_usuario, :id_habito, TRUE, 1, 'registros', :frecuencia, NULL, :fecha_inicio, :fecha_fin)");
    $insertarUsuarioHabito->execute([
        ":id_usuario" => $usuarioId,
        ":id_habito" => $idHabito,
        ":frecuencia" => $frecuencia,
        ":fecha_inicio" => $fechaInicio,
        ":fecha_fin" => $fechaFin
    ]);

    $idHabitoUsuario = (int) $db->lastInsertId();

    $insertarRacha = $db->prepare("INSERT INTO rachas (id_habito_usuario, racha_actual, mejor_racha, total_completados, ultima_fecha) VALUES (:id_habito_usuario, 0, 0, 0, NULL)");
    $insertarRacha->execute([":id_habito_usuario" => $idHabitoUsuario]);

    $db->commit();

    responder([
        "exito" => true,
        "mensaje" => "Hábito creado correctamente.",
        "habito" => [
            "id_habito" => $idHabito,
            "id_habito_usuario" => $idHabitoUsuario,
            "nombre" => $nombre,
            "descripcion" => $descripcion,
            "frecuencia" => $frecuencia,
            "fechaInicio" => $fechaInicio,
            "fechaFin" => $fechaFin
        ]
    ]);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log("LifeSync auth/crear-habito.php: " . $error->getMessage());
    responder(["exito" => false, "mensaje" => "Ocurrió un error al crear el hábito."], 500);
}
