const loginForm =
    document.getElementById("loginForm");

const correoInput =
    document.getElementById("correo");

const passwordInput =
    document.getElementById("password");

const mensajeError =
    document.getElementById("mensajeError");

const btnLogin =
    document.getElementById("btnLogin");

const googleLogin =
    document.getElementById("googleLogin");

const appleLogin =
    document.getElementById("appleLogin");

const ENDPOINT_LOGIN =
    "auth/login.php";


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


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            limpiarMensaje();


            const correo =
                correoInput.value.trim();

            const password =
                passwordInput.value;


            if (!correo || !password) {

                mostrarMensaje(
                    texto("camposIncompletos")
                );

                return;
            }


            if (!correoInput.checkValidity()) {

                mostrarMensaje(
                    texto(
                        "Ingresa un correo electrónico válido."
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
                            method: "POST",

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
                            "El servidor devolvió una respuesta no válida."
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
                            "El correo o la contraseña son incorrectos."
                        )
                    );

                    cambiarEstadoBoton(
                        false
                    );

                    return;
                }


                if (datos.usuario) {

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
                        "No se pudo conectar con el servidor. Inténtalo nuevamente."
                    )
                );

                cambiarEstadoBoton(
                    false
                );

            }

        }
    );
}


if (googleLogin) {

    googleLogin.addEventListener(
        "click",
        function () {

            mostrarMensaje(
                texto(
                    "loginGoogleProximamente"
                )
            );

        }
    );
}


if (appleLogin) {

    appleLogin.addEventListener(
        "click",
        function () {

            mostrarMensaje(
                texto(
                    "loginAppleProximamente"
                )
            );

        }
    );
}


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