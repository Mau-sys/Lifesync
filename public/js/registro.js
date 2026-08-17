document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("registroForm");

    const nombreInput =
        document.getElementById("nombre");

    const correoInput =
        document.getElementById("correo");

    const passwordInput =
        document.getElementById("password");

    const confirmarPasswordInput =
        document.getElementById("confirmarPassword");

    const mensajeError =
        document.getElementById("mensajeError");

    const btnRegistro =
        document.getElementById("btnRegistro");

    const googleRegister =
        document.getElementById("googleRegister");

    const appleRegister =
        document.getElementById("appleRegister");


    /* =====================================================
       TRADUCCIÓN
       ===================================================== */

    function texto(clave) {

        if (
            typeof window.traducirLifeSync ===
            "function"
        ) {

            return window.traducirLifeSync(clave);

        }

        return clave;
    }


    /* =====================================================
       MENSAJES
       ===================================================== */

    function mostrarMensaje(mensaje) {

        if (mensajeError) {

            mensajeError.textContent =
                mensaje;

        }
    }


    function limpiarMensaje() {

        if (mensajeError) {

            mensajeError.textContent =
                "";

        }
    }


    /* =====================================================
       BOTÓN
       ===================================================== */

    function cambiarEstadoBoton(cargando) {

        if (!btnRegistro) {
            return;
        }

        btnRegistro.disabled =
            cargando;

        btnRegistro.textContent =
            cargando
                ? texto("registrando")
                : texto("registrarse");
    }


    if (!form) {
        return;
    }


    /* =====================================================
       REGISTRO
       ===================================================== */

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            limpiarMensaje();


            const nombre =
                nombreInput.value.trim();

            const correo =
                correoInput.value.trim();

            const password =
                passwordInput.value;

            const confirmarPassword =
                confirmarPasswordInput.value;


            if (
                !nombre ||
                !correo ||
                !password ||
                !confirmarPassword
            ) {

                mostrarMensaje(
                    texto("camposIncompletos")
                );

                return;
            }


            if (
                !correoInput.checkValidity()
            ) {

                mostrarMensaje(
                    texto("correoValido")
                );

                return;
            }


            if (
                nombre.length > 50
            ) {

                mostrarMensaje(
                    texto("nombreMaximo")
                );

                return;
            }


            if (
                password.length < 8
            ) {

                mostrarMensaje(
                    texto("contrasenaCorta")
                );

                return;
            }


            if (
                password !==
                confirmarPassword
            ) {

                mostrarMensaje(
                    texto("contrasenasNoCoinciden")
                );

                return;
            }


            cambiarEstadoBoton(true);


            try {

                const respuesta =
                    await fetch(
                        "/LifeSync/auth/registro.php",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({
                                    nombre:
                                        nombre,

                                    correo:
                                        correo,

                                    password:
                                        password
                                })
                        }
                    );


                const textoRespuesta =
                    await respuesta.text();


                let datos;


                try {

                    datos =
                        JSON.parse(
                            textoRespuesta
                        );

                } catch (error) {

                    console.error(
                        "Respuesta del servidor:",
                        textoRespuesta
                    );

                    mostrarMensaje(
                        texto(
                            "servidorRespuestaInvalida"
                        )
                    );

                    cambiarEstadoBoton(false);

                    return;
                }


                if (
                    !respuesta.ok ||
                    !datos.exito
                ) {

                    mostrarMensaje(
                        datos.mensaje ||
                        texto(
                            "noCompletarRegistro"
                        )
                    );

                    cambiarEstadoBoton(false);

                    return;
                }


                window.location.href =
                    "Preferencias.html";


            } catch (error) {

                console.error(
                    "Error al registrar usuario:",
                    error
                );

                mostrarMensaje(
                    texto("errorConexion")
                );

                cambiarEstadoBoton(false);

            }

        }
    );


    /* =====================================================
       GOOGLE
       ===================================================== */

    if (googleRegister) {

        googleRegister.addEventListener(
            "click",
            () => {

                mostrarMensaje(
                    texto(
                        "registroGoogleProximamente"
                    )
                );

            }
        );

    }


    /* =====================================================
       APPLE
       ===================================================== */

    if (appleRegister) {

        appleRegister.addEventListener(
            "click",
            () => {

                mostrarMensaje(
                    texto(
                        "registroAppleProximamente"
                    )
                );

            }
        );

    }


    /* =====================================================
       LIMPIAR MENSAJES
       ===================================================== */

    [
        nombreInput,
        correoInput,
        passwordInput,
        confirmarPasswordInput

    ].forEach((campo) => {

        if (campo) {

            campo.addEventListener(
                "input",
                limpiarMensaje
            );

        }

    });


    /* =====================================================
       ACTUALIZAR SI CAMBIA EL IDIOMA
       ===================================================== */

    window.addEventListener(
        "lifesyncIdiomaCambiado",
        () => {

            if (
                btnRegistro &&
                !btnRegistro.disabled
            ) {

                btnRegistro.textContent =
                    texto("registrarse");

            }

        }
    );

});