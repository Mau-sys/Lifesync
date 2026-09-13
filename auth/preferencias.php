<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/conexion.php";

function responder(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);

    echo json_encode(
        $datos,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}

if (!isset($_SESSION["usuario_id"])) {
    responder([
        "exito" => false,
        "mensaje" => "La sesión ha expirado."
    ], 401);
}

$usuarioId = (int) $_SESSION["usuario_id"];

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db instanceof PDO) {
        throw new Exception("No se pudo conectar con la base de datos.");
    }

    $metodo = $_SERVER["REQUEST_METHOD"];

    if ($metodo === "GET") {
        $consulta = $db->prepare(
            "SELECT
                h.id_habito,
                h.id_categoria,
                h.nombre_habito,
                h.descripcion,
                h.color,
                h.imagen_url,
                hu.id_habito_usuario,
                hu.activo,
                hu.objetivo,
                hu.unidad,
                hu.frecuencia,
                hu.duracion_minutos,
                hu.fecha_inicio,
                hu.fecha_fin

             FROM habitos h

             LEFT JOIN habitos_usuario hu
                ON hu.id_habito = h.id_habito
                AND hu.id_usuario = :id_usuario

             WHERE h.es_base = TRUE

             ORDER BY h.id_habito ASC"
        );

        $consulta->execute([
            ":id_usuario" => $usuarioId
        ]);

        $habitos = $consulta->fetchAll(PDO::FETCH_ASSOC);

        $categoriasActivas = [];

        foreach ($habitos as $habito) {
            if (
                $habito["activo"] !== null &&
                (int) $habito["activo"] === 1
            ) {
                $categoriasActivas[] =
                    (int) $habito["id_categoria"];
            }
        }

        responder([
            "exito" => true,
            "categorias_activas" => array_values(
                array_unique($categoriasActivas)
            ),
            "habitos" => $habitos
        ]);
    }

    if ($metodo === "POST") {
        $datos = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($datos)) {
            responder([
                "exito" => false,
                "mensaje" => "Los datos enviados no son válidos."
            ], 400);
        }

        $categorias = $datos["categorias"] ?? [];

        if (!is_array($categorias)) {
            responder([
                "exito" => false,
                "mensaje" => "Las categorías no son válidas."
            ], 400);
        }

        $categorias = array_values(
            array_unique(
                array_map("intval", $categorias)
            )
        );

        $consultaCategorias = $db->prepare(
            "SELECT
                h.id_habito,
                h.id_categoria,
                h.nombre_habito

             FROM habitos h

             WHERE h.es_base = TRUE
             AND h.id_categoria = :id_categoria

             LIMIT 1"
        );

        $consultaExistente = $db->prepare(
            "SELECT
                hu.id_habito_usuario,
                hu.activo

             FROM habitos_usuario hu

             WHERE hu.id_usuario = :id_usuario
             AND hu.id_habito = :id_habito

             LIMIT 1"
        );

        $insertarHabitoUsuario = $db->prepare(
            "INSERT INTO habitos_usuario
            (
                id_usuario,
                id_habito,
                activo,
                objetivo,
                unidad,
                frecuencia,
                duracion_minutos,
                fecha_inicio,
                fecha_fin
            )
            VALUES
            (
                :id_usuario,
                :id_habito,
                TRUE,
                :objetivo,
                :unidad,
                :frecuencia,
                :duracion_minutos,
                CURDATE(),
                NULL
            )"
        );

        $activarHabito = $db->prepare(
            "UPDATE habitos_usuario

             SET activo = TRUE

             WHERE id_habito_usuario = :id_habito_usuario
             AND id_usuario = :id_usuario"
        );

        $desactivarHabitosBase = $db->prepare(
            "UPDATE habitos_usuario hu

             INNER JOIN habitos h
                ON h.id_habito = hu.id_habito

             SET hu.activo = FALSE

             WHERE hu.id_usuario = :id_usuario
             AND h.es_base = TRUE"
        );

        $crearRacha = $db->prepare(
            "INSERT INTO rachas
            (
                id_habito_usuario,
                racha_actual,
                mejor_racha,
                total_completados,
                ultima_fecha
            )
            VALUES
            (
                :id_habito_usuario,
                0,
                0,
                0,
                NULL
            )"
        );

        $buscarRacha = $db->prepare(
            "SELECT id_racha
             FROM rachas
             WHERE id_habito_usuario = :id_habito_usuario
             LIMIT 1"
        );

        $insertarDia = $db->prepare(
            "INSERT IGNORE INTO habito_dias
            (
                id_habito_usuario,
                dia_semana
            )
            VALUES
            (
                :id_habito_usuario,
                :dia_semana
            )"
        );

        $db->beginTransaction();

        $desactivarHabitosBase->execute([
            ":id_usuario" => $usuarioId
        ]);

        foreach ($categorias as $idCategoria) {
            $consultaCategorias->execute([
                ":id_categoria" => $idCategoria
            ]);

            $habito = $consultaCategorias->fetch(
                PDO::FETCH_ASSOC
            );

            if (!$habito) {
                throw new Exception(
                    "No se encontró el hábito correspondiente a una categoría seleccionada."
                );
            }

            $idHabito = (int) $habito["id_habito"];
            $nombreHabito = $habito["nombre_habito"];

            $consultaExistente->execute([
                ":id_usuario" => $usuarioId,
                ":id_habito" => $idHabito
            ]);

            $existente = $consultaExistente->fetch(
                PDO::FETCH_ASSOC
            );

            if ($existente) {
                $idHabitoUsuario =
                    (int) $existente["id_habito_usuario"];

                $activarHabito->execute([
                    ":id_habito_usuario" =>
                        $idHabitoUsuario,
                    ":id_usuario" =>
                        $usuarioId
                ]);
            } else {
                $objetivo = 1;
                $unidad = "sesiones";
                $frecuencia = "diaria";
                $duracion = null;

                switch ($nombreHabito) {
                    case "Hidratación":
                        $objetivo = 8;
                        $unidad = "vasos";
                        $frecuencia = "diaria";
                        break;

                    case "Alimentación":
                        $objetivo = 3;
                        $unidad = "comidas";
                        $frecuencia = "diaria";
                        break;

                    case "Salud Mental":
                        $objetivo = 2;
                        $unidad = "sesiones";
                        $frecuencia = "diaria";
                        $duracion = 15;
                        break;

                    case "Actividad Física":
                        $objetivo = 1;
                        $unidad = "sesiones";
                        $frecuencia = "diaria";
                        $duracion = 30;
                        break;

                    case "Registro Académico":
                        $objetivo = 1;
                        $unidad = "sesiones";
                        $frecuencia = "dias específicos";
                        $duracion = 30;
                        break;
                }

                $insertarHabitoUsuario->execute([
                    ":id_usuario" => $usuarioId,
                    ":id_habito" => $idHabito,
                    ":objetivo" => $objetivo,
                    ":unidad" => $unidad,
                    ":frecuencia" => $frecuencia,
                    ":duracion_minutos" => $duracion
                ]);

                $idHabitoUsuario =
                    (int) $db->lastInsertId();
            }

            $buscarRacha->execute([
                ":id_habito_usuario" =>
                    $idHabitoUsuario
            ]);

            $racha = $buscarRacha->fetch(
                PDO::FETCH_ASSOC
            );

            if (!$racha) {
                $crearRacha->execute([
                    ":id_habito_usuario" =>
                        $idHabitoUsuario
                ]);
            }

            if ($nombreHabito === "Registro Académico") {
                $insertarDia->execute([
                    ":id_habito_usuario" =>
                        $idHabitoUsuario,
                    ":dia_semana" => 2
                ]);

                $insertarDia->execute([
                    ":id_habito_usuario" =>
                        $idHabitoUsuario,
                    ":dia_semana" => 4
                ]);
            }
        }

        $db->commit();

        responder([
            "exito" => true,
            "mensaje" => "Preferencias guardadas correctamente.",
            "categorias_activas" => $categorias
        ]);
    }

    if ($metodo === "PUT") {
        $datos = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($datos)) {
            responder([
                "exito" => false,
                "mensaje" => "Los datos enviados no son válidos."
            ], 400);
        }

        $idHabitoUsuario =
            (int) ($datos["id_habito_usuario"] ?? 0);

        if (
            !array_key_exists("activo", $datos) ||
            $idHabitoUsuario <= 0
        ) {
            responder([
                "exito" => false,
                "mensaje" => "Datos inválidos."
            ], 400);
        }

        $activo = filter_var(
            $datos["activo"],
            FILTER_VALIDATE_BOOLEAN,
            FILTER_NULL_ON_FAILURE
        );

        if ($activo === null) {
            responder([
                "exito" => false,
                "mensaje" => "El estado del hábito no es válido."
            ], 400);
        }

        $consulta = $db->prepare(
            "UPDATE habitos_usuario

             SET activo = :activo

             WHERE id_habito_usuario = :id_habito_usuario
             AND id_usuario = :id_usuario"
        );

        $consulta->execute([
            ":activo" => $activo ? 1 : 0,
            ":id_habito_usuario" => $idHabitoUsuario,
            ":id_usuario" => $usuarioId
        ]);

        responder([
            "exito" => true,
            "mensaje" => "Estado del hábito actualizado."
        ]);
    }

    if ($metodo === "DELETE") {
        $datos = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($datos)) {
            responder([
                "exito" => false,
                "mensaje" => "Los datos enviados no son válidos."
            ], 400);
        }

        $idHabitoUsuario =
            (int) ($datos["id_habito_usuario"] ?? 0);

        if ($idHabitoUsuario <= 0) {
            responder([
                "exito" => false,
                "mensaje" => "Hábito inválido."
            ], 400);
        }

        $consulta = $db->prepare(
            "DELETE FROM habitos_usuario

             WHERE id_habito_usuario = :id_habito_usuario
             AND id_usuario = :id_usuario"
        );

        $consulta->execute([
            ":id_habito_usuario" => $idHabitoUsuario,
            ":id_usuario" => $usuarioId
        ]);

        responder([
            "exito" => true,
            "mensaje" => "Hábito eliminado correctamente."
        ]);
    }

    responder([
        "exito" => false,
        "mensaje" => "Método HTTP no permitido."
    ], 405);

} catch (Throwable $error) {
    if (
        isset($db) &&
        $db instanceof PDO &&
        $db->inTransaction()
    ) {
        $db->rollBack();
    }

    error_log(
        "LifeSync preferencias.php: " .
        $error->getMessage()
    );

    responder([
        "exito" => false,
        "mensaje" => "Ocurrió un error al guardar las preferencias."
    ], 500);
}