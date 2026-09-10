<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/conexion.php";


/* =========================================================
   VERIFICAR SESIÓN
   ========================================================= */

if (!isset($_SESSION["usuario_id"])) {

    http_response_code(401);

    echo json_encode([
        "exito" => false,
        "mensaje" => "La sesión ha expirado."
    ]);

    exit;
}


$usuarioId = (int) $_SESSION["usuario_id"];


/* =========================================================
   CONEXIÓN
   ========================================================= */

try {

    $database = new Database();

    $db = $database->getConnection();


    if ($db === null) {

        http_response_code(500);

        echo json_encode([
            "exito" => false,
            "mensaje" => "No se pudo conectar con la base de datos."
        ]);

        exit;
    }


    /* =====================================================
       MÉTODO HTTP
       ===================================================== */

    $metodo = $_SERVER["REQUEST_METHOD"];


    /* =====================================================
       GET
       Obtener preferencias actuales
       ===================================================== */

    if ($metodo === "GET") {

        $consulta = $db->prepare(
            "SELECT
                h.id_habito,
                h.id_categoria,
                h.nombre_habito,
                hu.id_habito_usuario,
                hu.activo
             
             FROM habitos h

             LEFT JOIN habitos_usuario hu
                ON hu.id_habito = h.id_habito
                AND hu.id_usuario = :id_usuario

             WHERE h.es_base = TRUE

             ORDER BY h.id_habito"
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


        echo json_encode([

            "exito" => true,

            "categorias_activas" =>
                $categoriasActivas,

            "habitos" =>
                $habitos

        ]);

        exit;
    }


    /* =====================================================
       POST
       Guardar / sincronizar preferencias
       ===================================================== */

    if ($metodo === "POST") {


        $datos = json_decode(
            file_get_contents("php://input"),
            true
        );


        if (!is_array($datos)) {

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "Los datos enviados no son válidos."
            ]);

            exit;
        }


        $categorias =
            $datos["categorias"] ?? [];


        if (!is_array($categorias)) {

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "Las categorías no son válidas."
            ]);

            exit;
        }


        /*
         * Convertimos todos los valores a enteros
         * y eliminamos duplicados.
         */

        $categorias = array_unique(
            array_map("intval", $categorias)
        );


        /*
         * Solo permitimos las 5 categorías existentes.
         */

        $categoriasPermitidas = [1, 2, 3, 4, 5];


        foreach ($categorias as $idCategoria) {

            if (
                !in_array(
                    $idCategoria,
                    $categoriasPermitidas,
                    true
                )
            ) {

                http_response_code(400);

                echo json_encode([
                    "exito" => false,
                    "mensaje" => "Se recibió una categoría no válida."
                ]);

                exit;
            }
        }


        /* =================================================
           TRANSACCIÓN
           ================================================= */

        $db->beginTransaction();


        /*
         * Obtenemos los hábitos base correspondientes
         * a las categorías seleccionadas.
         */

        $consulta = $db->prepare(
            "SELECT
                id_habito,
                id_categoria,
                nombre_habito

             FROM habitos

             WHERE es_base = TRUE
             AND id_categoria = :id_categoria

             LIMIT 1"
        );


        /*
         * Consulta para comprobar si el hábito
         * ya está asignado al usuario.
         */

        $consultaExistente = $db->prepare(
            "SELECT
                id_habito_usuario

             FROM habitos_usuario

             WHERE id_usuario = :id_usuario
             AND id_habito = :id_habito

             LIMIT 1"
        );


        /*
         * Insertar un hábito nuevo.
         */

        $insertar = $db->prepare(
            "INSERT INTO habitos_usuario
            (
                id_usuario,
                id_habito,
                activo,
                objetivo,
                unidad,
                frecuencia,
                duracion_minutos
            )
            VALUES
            (
                :id_usuario,
                :id_habito,
                TRUE,
                :objetivo,
                :unidad,
                :frecuencia,
                :duracion_minutos
            )"
        );


        /*
         * Reactivar un hábito existente.
         */

        $activar = $db->prepare(
            "UPDATE habitos_usuario

             SET activo = TRUE

             WHERE id_habito_usuario = :id_habito_usuario
             AND id_usuario = :id_usuario"
        );


        /*
         * Desactivar hábitos base que NO fueron seleccionados.
         */

        $desactivarTodos = $db->prepare(
            "UPDATE habitos_usuario hu

             INNER JOIN habitos h
                ON h.id_habito = hu.id_habito

             SET hu.activo = FALSE

             WHERE hu.id_usuario = :id_usuario
             AND h.es_base = TRUE"
        );


        $desactivarTodos->execute([
            ":id_usuario" => $usuarioId
        ]);


        /*
         * Procesamos cada categoría seleccionada.
         */

        foreach ($categorias as $idCategoria) {


            $consulta->execute([
                ":id_categoria" => $idCategoria
            ]);


            $habito = $consulta->fetch(
                PDO::FETCH_ASSOC
            );


            if (!$habito) {

                throw new Exception(
                    "No se encontró el hábito base de la categoría."
                );
            }


            $idHabito =
                (int) $habito["id_habito"];


            /*
             * Comprobar si ya existe.
             */

            $consultaExistente->execute([

                ":id_usuario" =>
                    $usuarioId,

                ":id_habito" =>
                    $idHabito

            ]);


            $existente =
                $consultaExistente->fetch(
                    PDO::FETCH_ASSOC
                );


            if ($existente) {


                /*
                 * Ya existe:
                 * simplemente lo activamos.
                 */

                $activar->execute([

                    ":id_habito_usuario" =>
                        $existente["id_habito_usuario"],

                    ":id_usuario" =>
                        $usuarioId

                ]);


            } else {


                /*
                 * Valores predeterminados
                 * para cada hábito base.
                 */

                $objetivo = 1;
                $unidad = "sesiones";
                $frecuencia = "diaria";
                $duracion = null;


                switch ($idCategoria) {


                    /* HIDRATACIÓN */

                    case 1:

                        $objetivo = 8;
                        $unidad = "vasos";
                        $frecuencia = "diaria";

                        break;


                    /* SALUD MENTAL */

                    case 2:

                        $objetivo = 2;
                        $unidad = "sesiones";
                        $frecuencia = "diaria";
                        $duracion = 15;

                        break;


                    /* ACADÉMICO */

                    case 3:

                        $objetivo = 1;
                        $unidad = "sesiones";
                        $frecuencia = "dias específicos";
                        $duracion = 30;

                        break;


                    /* ACTIVIDAD FÍSICA */

                    case 4:

                        $objetivo = 1;
                        $unidad = "sesiones";
                        $frecuencia = "diaria";
                        $duracion = 30;

                        break;


                    /* ALIMENTACIÓN */

                    case 5:

                        $objetivo = 3;
                        $unidad = "comidas";
                        $frecuencia = "diaria";

                        break;

                }


                $insertar->execute([

                    ":id_usuario" =>
                        $usuarioId,

                    ":id_habito" =>
                        $idHabito,

                    ":objetivo" =>
                        $objetivo,

                    ":unidad" =>
                        $unidad,

                    ":frecuencia" =>
                        $frecuencia,

                    ":duracion_minutos" =>
                        $duracion

                ]);


                /*
                 * Si el hábito académico se crea por primera vez,
                 * asignamos martes y jueves.
                 *
                 * 1 = lunes
                 * 2 = martes
                 * 3 = miércoles
                 * 4 = jueves
                 * 5 = viernes
                 * 6 = sábado
                 * 7 = domingo
                 */

                if ($idCategoria === 3) {

                    $idHabitoUsuario =
                        $db->lastInsertId();


                    $insertarDia =
                        $db->prepare(
                            "INSERT INTO habito_dias
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


                    $insertarDia->execute([

                        ":id_habito_usuario" =>
                            $idHabitoUsuario,

                        ":dia_semana" =>
                            2

                    ]);


                    $insertarDia->execute([

                        ":id_habito_usuario" =>
                            $idHabitoUsuario,

                        ":dia_semana" =>
                            4

                    ]);

                }

            }

        }


        $db->commit();


        echo json_encode([

            "exito" => true,

            "mensaje" =>
                "Preferencias guardadas correctamente."

        ]);

        exit;
    }


    /* =====================================================
       PUT
       Activar / desactivar un hábito
       ===================================================== */

    if ($metodo === "PUT") {


        $datos = json_decode(
            file_get_contents("php://input"),
            true
        );


        $idHabitoUsuario =
            (int) ($datos["id_habito_usuario"] ?? 0);


        $activo =
            isset($datos["activo"])
                ? (bool) $datos["activo"]
                : null;


        if (
            $idHabitoUsuario <= 0 ||
            $activo === null
        ) {

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "Datos inválidos."
            ]);

            exit;
        }


        $consulta = $db->prepare(
            "UPDATE habitos_usuario

             SET activo = :activo

             WHERE id_habito_usuario = :id_habito_usuario
             AND id_usuario = :id_usuario"
        );


        $consulta->execute([

            ":activo" =>
                $activo ? 1 : 0,

            ":id_habito_usuario" =>
                $idHabitoUsuario,

            ":id_usuario" =>
                $usuarioId

        ]);


        echo json_encode([

            "exito" => true,

            "mensaje" =>
                "Estado del hábito actualizado."

        ]);

        exit;
    }


    /* =====================================================
       DELETE
       Eliminar asignación del usuario
       ===================================================== */

    if ($metodo === "DELETE") {


        $datos = json_decode(
            file_get_contents("php://input"),
            true
        );


        $idHabitoUsuario =
            (int) ($datos["id_habito_usuario"] ?? 0);


        if ($idHabitoUsuario <= 0) {

            http_response_code(400);

            echo json_encode([
                "exito" => false,
                "mensaje" => "Hábito inválido."
            ]);

            exit;
        }


        $consulta = $db->prepare(
            "DELETE FROM habitos_usuario

             WHERE id_habito_usuario = :id_habito_usuario

             AND id_usuario = :id_usuario"
        );


        $consulta->execute([

            ":id_habito_usuario" =>
                $idHabitoUsuario,

            ":id_usuario" =>
                $usuarioId

        ]);


        echo json_encode([

            "exito" => true,

            "mensaje" =>
                "Hábito eliminado correctamente."

        ]);

        exit;
    }


    /* =====================================================
       MÉTODO NO SOPORTADO
       ===================================================== */

    http_response_code(405);

    echo json_encode([

        "exito" => false,

        "mensaje" =>
            "Método HTTP no permitido."

    ]);


} catch (Exception $error) {


    if (
        isset($db) &&
        $db->inTransaction()
    ) {

        $db->rollBack();

    }


    http_response_code(500);


    echo json_encode([

        "exito" => false,

        "mensaje" =>
            "Ocurrió un error al guardar las preferencias.",

        "detalle" =>
            $error->getMessage()

    ]);

}

?>