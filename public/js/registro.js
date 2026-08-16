document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "registroForm"
            );

        const nombreInput =
            document.getElementById(
                "nombre"
            );

        const correoInput =
            document.getElementById(
                "correo"
            );

        const passwordInput =
            document.getElementById(
                "password"
            );

        const confirmarPasswordInput =
            document.getElementById(
                "confirmarPassword"
            );

        const mensajeError =
            document.getElementById(
                "mensajeError"
            );

        const btnRegistro =
            document.getElementById(
                "btnRegistro"
            );

        const googleRegister =
            document.getElementById(
                "googleRegister"
            );

        const appleRegister =
            document.getElementById(
                "appleRegister"
            );


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


        function cambiarEstadoBoton(cargando) {

            btnRegistro.disabled =
                cargando;

            btnRegistro.textContent =
                cargando
                    ? texto("registrando")
                    : texto("registrarse");

        }


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
                    nombre === "" ||
                    correo === "" ||
                    password === "" ||
                    confirmarPassword === ""
                ) {

                    mostrarMensaje(
                        texto(
                            "camposIncompletos"
                        )
                    );

                    return;
                }


                if (
                    !correoInput.checkValidity()
                ) {

                    mostrarMensaje(
                        texto(
                            "Ingresa un correo electrónico válido."
                        )
                    );

                    return;
                }


                if (nombre.length > 50) {

                    mostrarMensaje(
                        texto(
                            "El nombre no puede superar los 50 caracteres."
                        )
                    );

                    return;
                }


                if (password.length < 8) {

                    mostrarMensaje(
                        texto(
                            "contrasenaCorta"
                        )
                    );

                    return;
                }


                if (
                    password !==
                    confirmarPassword
                ) {

                    mostrarMensaje(
                        texto(
                            "contrasenasNoCoinciden"
                        )
                    );

                    return;
                }


                cambiarEstadoBoton(
                    true
                );


                try {

                    const respuesta =
                        await fetch(
                            "/LifeSync/auth/registro.php",
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
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


                    const respuestaTexto =
                        await respuesta.text();


                    let datos;


                    try {

                        datos =
                            JSON.parse(
                                respuestaTexto
                            );

                    } catch (error) {

                        console.error(
                            "Respuesta del servidor:",
                            respuestaTexto
                        );

                        mostrarMensaje(
                            texto(
                                "El servidor no devolvió una respuesta válida."
                            )
                        );

                        cambiarEstadoBoton(
                            false
                        );

                        return;
                    }


                    if (
                        !respuesta.ok ||
                        !datos.exito
                    ) {

                        mostrarMensaje(
                            datos.mensaje ||
                            texto(
                                "No se pudo completar el registro."
                            )
                        );

                        cambiarEstadoBoton(
                            false
                        );

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
                        texto(
                            "No se pudo conectar con el servidor. Inténtalo nuevamente."
                        )
                    );

                    cambiarEstadoBoton(
                        false
                    );

                }

            }
        );


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


        nombreInput.addEventListener(
            "input",
            limpiarMensaje
        );

        correoInput.addEventListener(
            "input",
            limpiarMensaje
        );

        passwordInput.addEventListener(
            "input",
            limpiarMensaje
        );

        confirmarPasswordInput.addEventListener(
            "input",
            limpiarMensaje
        );

    }
);