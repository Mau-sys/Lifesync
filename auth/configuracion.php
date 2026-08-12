<?php

declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/conexion.php';


function responder(
    bool $exito,
    string $mensaje = '',
    array $datos = [],
    int $codigo = 200
): never {

    http_response_code($codigo);

    echo json_encode(
        array_merge(
            [
                'exito' => $exito,
                'mensaje' => $mensaje
            ],
            $datos
        ),
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


function obtenerUsuarioSesion(): int {

    $ids = [
        $_SESSION['id_usuario'] ?? null,
        $_SESSION['usuario_id'] ?? null,
        $_SESSION['id'] ?? null
    ];

    foreach ($ids as $id) {

        if (
            is_numeric($id) &&
            (int) $id > 0
        ) {

            return (int) $id;
        }
    }

    responder(
        false,
        'La sesión del usuario no es válida.',
        [],
        401
    );
}


function obtenerTokenSesion(): ?string {

    $token =
        $_SESSION['token_sesion'] ??
        null;

    if (
        is_string($token) &&
        $token !== ''
    ) {

        return $token;
    }

    return null;
}


function valorBooleano(mixed $valor): int {

    if (
        $valor === '1' ||
        $valor === 1 ||
        $valor === true ||
        $valor === 'true' ||
        $valor === 'on'
    ) {

        return 1;
    }

    return 0;
}


try {

    if (
        !isset($pdo) ||
        !($pdo instanceof PDO)
    ) {

        responder(
            false,
            'No se pudo establecer la conexión con la base de datos.',
            [],
            500
        );
    }


    $idUsuario =
        obtenerUsuarioSesion();


    $accion =
        $_POST['accion'] ??
        $_GET['accion'] ??
        '';


    if ($accion === 'obtener') {

        $consulta = $pdo->prepare(
            "
            SELECT
                p.tema,
                p.idioma,
                p.notificaciones_activas,
                p.sonidos_activados,
                p.sincronizacion_automatica,

                COALESCE(
                    cn.correo_recordatorios,
                    1
                ) AS correo_recordatorios,

                COALESCE(
                    cn.correo_logros,
                    1
                ) AS correo_logros

            FROM preferencias_usuario p

            LEFT JOIN configuracion_notificaciones cn
                ON cn.id_usuario = p.id_usuario

            WHERE p.id_usuario = :id_usuario

            LIMIT 1
            "
        );


        $consulta->execute(
            [
                ':id_usuario' => $idUsuario
            ]
        );


        $configuracion =
            $consulta->fetch(
                PDO::FETCH_ASSOC
            );


        if (!$configuracion) {

            $pdo->beginTransaction();

            try {

                $crearPreferencias =
                    $pdo->prepare(
                        "
                        INSERT INTO preferencias_usuario
                        (
                            id_usuario,
                            tema,
                            idioma,
                            notificaciones_activas,
                            sonidos_activados,
                            sincronizacion_automatica
                        )
                        VALUES
                        (
                            :id_usuario,
                            'oscuro',
                            'es',
                            1,
                            1,
                            1
                        )
                        "
                    );


                $crearPreferencias->execute(
                    [
                        ':id_usuario' => $idUsuario
                    ]
                );


                $crearNotificaciones =
                    $pdo->prepare(
                        "
                        INSERT INTO configuracion_notificaciones
                        (
                            id_usuario,
                            correo_recordatorios,
                            correo_logros
                        )
                        VALUES
                        (
                            :id_usuario,
                            1,
                            1
                        )
                        "
                    );


                $crearNotificaciones->execute(
                    [
                        ':id_usuario' => $idUsuario
                    ]
                );


                $crearConfiguracionUsuario =
                    $pdo->prepare(
                        "
                        INSERT INTO configuracion_usuario
                        (
                            id_usuario,
                            modo_tema,
                            idioma,
                            notificaciones,
                            sonidos
                        )
                        VALUES
                        (
                            :id_usuario,
                            'oscuro',
                            'es',
                            1,
                            1
                        )
                        "
                    );


                $crearConfiguracionUsuario->execute(
                    [
                        ':id_usuario' => $idUsuario
                    ]
                );


                $pdo->commit();


            } catch (Throwable $error) {

                if ($pdo->inTransaction()) {

                    $pdo->rollBack();
                }

                throw $error;
            }


            $configuracion = [
                'tema' => 'oscuro',
                'idioma' => 'es',
                'notificaciones_activas' => 1,
                'sonidos_activados' => 1,
                'sincronizacion_automatica' => 1,
                'correo_recordatorios' => 1,
                'correo_logros' => 1
            ];
        }


        responder(
            true,
            'Configuración cargada correctamente.',
            [
                'configuracion' =>
                    $configuracion
            ]
        );
    }


    if ($accion === 'guardar') {

        $tema =
            $_POST['tema'] ??
            'oscuro';


        $idioma =
            $_POST['idioma'] ??
            'es';


        $notificaciones =
            valorBooleano(
                $_POST['notificaciones'] ?? 0
            );


        $sonidos =
            valorBooleano(
                $_POST['sonidos'] ?? 0
            );


        $correoRecordatorios =
            valorBooleano(
                $_POST['correo_recordatorios'] ?? 0
            );


        $correoLogros =
            valorBooleano(
                $_POST['correo_logros'] ?? 0
            );


        $sincronizacion =
            valorBooleano(
                $_POST['sincronizacion'] ?? 0
            );


        if (
            !in_array(
                $tema,
                [
                    'oscuro',
                    'claro'
                ],
                true
            )
        ) {

            responder(
                false,
                'El tema seleccionado no es válido.',
                [],
                400
            );
        }


        if (
            !in_array(
                $idioma,
                [
                    'es',
                    'en'
                ],
                true
            )
        ) {

            responder(
                false,
                'El idioma seleccionado no es válido.',
                [],
                400
            );
        }


        $pdo->beginTransaction();

        try {

            $consulta =
                $pdo->prepare(
                    "
                    INSERT INTO preferencias_usuario
                    (
                        id_usuario,
                        tema,
                        idioma,
                        notificaciones_activas,
                        sonidos_activados,
                        sincronizacion_automatica
                    )
                    VALUES
                    (
                        :id_usuario,
                        :tema,
                        :idioma,
                        :notificaciones,
                        :sonidos,
                        :sincronizacion
                    )

                    ON DUPLICATE KEY UPDATE

                        tema = VALUES(tema),

                        idioma = VALUES(idioma),

                        notificaciones_activas =
                            VALUES(notificaciones_activas),

                        sonidos_activados =
                            VALUES(sonidos_activados),

                        sincronizacion_automatica =
                            VALUES(sincronizacion_automatica)
                    "
                );


            $consulta->execute(
                [
                    ':id_usuario' =>
                        $idUsuario,

                    ':tema' =>
                        $tema,

                    ':idioma' =>
                        $idioma,

                    ':notificaciones' =>
                        $notificaciones,

                    ':sonidos' =>
                        $sonidos,

                    ':sincronizacion' =>
                        $sincronizacion
                ]
            );


            $consultaCorreo =
                $pdo->prepare(
                    "
                    INSERT INTO configuracion_notificaciones
                    (
                        id_usuario,
                        correo_recordatorios,
                        correo_logros
                    )
                    VALUES
                    (
                        :id_usuario,
                        :correo_recordatorios,
                        :correo_logros
                    )

                    ON DUPLICATE KEY UPDATE

                        correo_recordatorios =
                            VALUES(correo_recordatorios),

                        correo_logros =
                            VALUES(correo_logros)
                    "
                );


            $consultaCorreo->execute(
                [
                    ':id_usuario' =>
                        $idUsuario,

                    ':correo_recordatorios' =>
                        $correoRecordatorios,

                    ':correo_logros' =>
                        $correoLogros
                ]
            );


            $consultaUsuario =
                $pdo->prepare(
                    "
                    INSERT INTO configuracion_usuario
                    (
                        id_usuario,
                        modo_tema,
                        idioma,
                        notificaciones,
                        sonidos
                    )
                    VALUES
                    (
                        :id_usuario,
                        :tema,
                        :idioma,
                        :notificaciones,
                        :sonidos
                    )

                    ON DUPLICATE KEY UPDATE

                        modo_tema =
                            VALUES(modo_tema),

                        idioma =
                            VALUES(idioma),

                        notificaciones =
                            VALUES(notificaciones),

                        sonidos =
                            VALUES(sonidos)
                    "
                );


            $consultaUsuario->execute(
                [
                    ':id_usuario' =>
                        $idUsuario,

                    ':tema' =>
                        $tema,

                    ':idioma' =>
                        $idioma,

                    ':notificaciones' =>
                        $notificaciones,

                    ':sonidos' =>
                        $sonidos
                ]
            );


            $pdo->commit();


        } catch (Throwable $error) {

            if ($pdo->inTransaction()) {

                $pdo->rollBack();
            }

            throw $error;
        }


        responder(
            true,
            'Configuración guardada correctamente.',
            [
                'configuracion' => [
                    'tema' =>
                        $tema,

                    'idioma' =>
                        $idioma,

                    'notificaciones_activas' =>
                        $notificaciones,

                    'sonidos_activados' =>
                        $sonidos,

                    'sincronizacion_automatica' =>
                        $sincronizacion,

                    'correo_recordatorios' =>
                        $correoRecordatorios,

                    'correo_logros' =>
                        $correoLogros
                ]
            ]
        );
    }


    if ($accion === 'cambiar_contrasena') {

        $actual =
            $_POST['actual'] ??
            '';


        $nueva =
            $_POST['nueva'] ??
            '';


        if (
            $actual === '' ||
            $nueva === ''
        ) {

            responder(
                false,
                'Debes completar todos los campos.',
                [],
                400
            );
        }


        if (
            strlen($nueva) < 8
        ) {

            responder(
                false,
                'La nueva contraseña debe tener al menos 8 caracteres.',
                [],
                400
            );
        }


        $consulta =
            $pdo->prepare(
                "
                SELECT
                    password_hash

                FROM usuario

                WHERE id_usuario =
                    :id_usuario

                LIMIT 1
                "
            );


        $consulta->execute(
            [
                ':id_usuario' =>
                    $idUsuario
            ]
        );


        $usuario =
            $consulta->fetch(
                PDO::FETCH_ASSOC
            );


        if (!$usuario) {

            responder(
                false,
                'No se encontró el usuario.',
                [],
                404
            );
        }


        if (
            !password_verify(
                $actual,
                $usuario['password_hash']
            )
        ) {

            responder(
                false,
                'La contraseña actual no es correcta.',
                [],
                400
            );
        }


        $nuevoHash =
            password_hash(
                $nueva,
                PASSWORD_DEFAULT
            );


        $actualizar =
            $pdo->prepare(
                "
                UPDATE usuario

                SET password_hash =
                    :password_hash

                WHERE id_usuario =
                    :id_usuario
                "
            );


        $actualizar->execute(
            [
                ':password_hash' =>
                    $nuevoHash,

                ':id_usuario' =>
                    $idUsuario
            ]
        );


        responder(
            true,
            'Contraseña actualizada correctamente.'
        );
    }


    if ($accion === 'sesiones') {

        $consulta =
            $pdo->prepare(
                "
                SELECT
                    id_sesion,
                    dispositivo,
                    ip,
                    fecha_inicio,
                    ultimo_acceso,
                    activa

                FROM sesiones_usuario

                WHERE id_usuario =
                    :id_usuario

                AND activa = 1

                ORDER BY
                    ultimo_acceso DESC
                "
            );


        $consulta->execute(
            [
                ':id_usuario' =>
                    $idUsuario
            ]
        );


        $sesiones =
            $consulta->fetchAll(
                PDO::FETCH_ASSOC
            );


        responder(
            true,
            'Sesiones cargadas correctamente.',
            [
                'sesiones' =>
                    $sesiones
            ]
        );
    }


    if ($accion === 'cerrar_sesion') {

        $idSesion =
            isset($_POST['id_sesion'])
                ? (int) $_POST['id_sesion']
                : 0;


        if ($idSesion <= 0) {

            responder(
                false,
                'La sesión seleccionada no es válida.',
                [],
                400
            );
        }


        $consulta =
            $pdo->prepare(
                "
                SELECT
                    id_sesion,
                    token_sesion

                FROM sesiones_usuario

                WHERE id_sesion =
                    :id_sesion

                AND id_usuario =
                    :id_usuario

                AND activa = 1

                LIMIT 1
                "
            );


        $consulta->execute(
            [
                ':id_sesion' =>
                    $idSesion,

                ':id_usuario' =>
                    $idUsuario
            ]
        );


        $sesion =
            $consulta->fetch(
                PDO::FETCH_ASSOC
            );


        if (!$sesion) {

            responder(
                false,
                'La sesión no existe o ya fue cerrada.',
                [],
                404
            );
        }


        $tokenActual =
            obtenerTokenSesion();


        $esSesionActual =
            $tokenActual !== null &&
            hash_equals(
                (string) $sesion['token_sesion'],
                $tokenActual
            );


        $cerrar =
            $pdo->prepare(
                "
                UPDATE sesiones_usuario

                SET activa = 0

                WHERE id_sesion =
                    :id_sesion

                AND id_usuario =
                    :id_usuario
                "
            );


        $cerrar->execute(
            [
                ':id_sesion' =>
                    $idSesion,

                ':id_usuario' =>
                    $idUsuario
            ]
        );


        if ($esSesionActual) {

            $_SESSION = [];


            if (
                ini_get('session.use_cookies')
            ) {

                $parametros =
                    session_get_cookie_params();


                setcookie(
                    session_name(),
                    '',
                    time() - 42000,
                    $parametros['path'],
                    $parametros['domain'],
                    $parametros['secure'],
                    $parametros['httponly']
                );
            }


            session_destroy();


            responder(
                true,
                'La sesión actual fue cerrada.',
                [
                    'sesion_actual' =>
                        true
                ]
            );
        }


        responder(
            true,
            'La sesión fue cerrada correctamente.',
            [
                'sesion_actual' =>
                    false
            ]
        );
    }


    responder(
        false,
        'La acción solicitada no es válida.',
        [],
        400
    );


} catch (Throwable $error) {

    if (
        isset($pdo) &&
        $pdo instanceof PDO &&
        $pdo->inTransaction()
    ) {

        $pdo->rollBack();
    }


    error_log(
        'Error en configuracion.php: ' .
        $error->getMessage()
    );


    responder(
        false,
        'Ocurrió un error interno al procesar la configuración.',
        [],
        500
    );
}