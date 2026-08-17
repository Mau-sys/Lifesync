/* =========================================================
   LOGIN — LifeSync
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       TRADUCCIÓN
       ===================================================== */

    function texto(clave) {

        if (
            typeof window.traducirLifeSync ===
            "function"
        ) {

            return window.traducirLifeSync(
                clave
            );

        }

        return clave;
    }


    /* =====================================================
       ELEMENTOS
       ===================================================== */

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    const correoInput =
        document.getElementById(
            "correo"
        );

    const passwordInput =
        document.getElementById(
            "password"
        );

    const mensajeError =
        document.getElementById(
            "mensajeError"
        );

    const btnLogin =
        document.getElementById(
            "btnLogin"
        );

    const googleLogin =
        document.getElementById(
            "googleLogin"
        );

    const appleLogin =
        document.getElementById(
            "appleLogin"
        );


    const ENDPOINT_LOGIN =
        "auth/login.php";


    /* =====================================================
       MENSAJES
       ===================================================== */

    function mostrarMensaje(mensaje) {

        if (!mensajeError) {
            return;
        }

        mensajeError.textContent =
            mensaje;
    }


    function limpiarMensaje() {

        if (!mensajeError) {
            return;
        }

        mensajeError.textContent =
            "";
    }


    /* =====================================================
       BOTÓN
       ===================================================== */

    function cambiarEstadoBoton(cargando) {

        if (!btnLogin) {
            return;
        }

        btnLogin.disabled =
            cargando;

        btnLogin.textContent =
            cargando
                ? texto("iniciandoSesion")
                : texto("iniciarSesion");
    }


    /* =====================================================
       FORMULARIO
       ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                limpiarMensaje();


                const correo =
                    correoInput.value.trim();

                const password =
                    passwordInput.value;


                if (
                    !correo ||
                    !password
                ) {

                    mostrarMensaje(
                        texto(
                            "completaCampos"
                        )
                    );

                    return;
                }


                if (
                    !correoInput.checkValidity()
                ) {

                    mostrarMensaje(
                        texto(
                            "correoValido"
                        )
                    );

                    return;
                }


                cambiarEstadoBoton(true);


                try {

                    const respuesta =
                        await fetch(
                            ENDPOINT_LOGIN,
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Accept":
                                        "application/json"
                                },

                                credentials:
                                    "same-origin",

                                body:
                                    JSON.stringify({
                                        correo:
                                            correo,

                                        password:
                                            password
                                    })
                            }
                        );


                    let datos;


                    try {

                        datos =
                            await respuesta.json();

                    } catch (error) {

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
                                "credencialesIncorrectas"
                            )
                        );

                        cambiarEstadoBoton(false);

                        return;
                    }


                    if (
                        datos.usuario
                    ) {

                        localStorage.setItem(
                            "lifesync_usuario",
                            JSON.stringify(
                                datos.usuario
                            )
                        );

                    }


                    window.location.href =
                        "inicio.html";


                } catch (error) {

                    console.error(
                        "Error al iniciar sesión:",
                        error
                    );


                    mostrarMensaje(
                        texto(
                            "errorConexion"
                        )
                    );


                    cambiarEstadoBoton(false);

                }

            }
        );

    }


    /* =====================================================
       GOOGLE
       ===================================================== */

    if (googleLogin) {

        googleLogin.addEventListener(
            "click",
            () => {

                mostrarMensaje(
                    texto(
                        "loginGoogleProximamente"
                    )
                );

            }
        );

    }


    /* =====================================================
       APPLE
       ===================================================== */

    if (appleLogin) {

        appleLogin.addEventListener(
            "click",
            () => {

                mostrarMensaje(
                    texto(
                        "loginAppleProximamente"
                    )
                );

            }
        );

    }


    /* =====================================================
       LIMPIAR MENSAJE AL ESCRIBIR
       ===================================================== */

    if (correoInput) {

        correoInput.addEventListener(
            "input",
            limpiarMensaje
        );

    }


    if (passwordInput) {

        passwordInput.addEventListener(
            "input",
            limpiarMensaje
        );

    }


    /* =====================================================
       ACTUALIZAR BOTÓN SI CAMBIA EL IDIOMA
       ===================================================== */

    window.addEventListener(
        "lifesyncIdiomaCambiado",
        () => {

            if (
                btnLogin &&
                !btnLogin.disabled
            ) {

                btnLogin.textContent =
                    texto(
                        "iniciarSesion"
                    );

            }

        }
    );

})();