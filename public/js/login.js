const loginForm = document.getElementById("loginForm");
const correoInput = document.getElementById("correo");
const passwordInput = document.getElementById("password");
const mensajeError = document.getElementById("mensajeError");
const btnLogin = document.getElementById("btnLogin");

const googleLogin = document.getElementById("googleLogin");
const appleLogin = document.getElementById("appleLogin");

const ENDPOINT_LOGIN = "auth/login.php";


function mostrarMensaje(mensaje) {

    if (!mensajeError) {
        return;
    }

    mensajeError.textContent = mensaje;
}


function limpiarMensaje() {

    if (!mensajeError) {
        return;
    }

    mensajeError.textContent = "";
}


function cambiarEstadoBoton(cargando) {

    if (!btnLogin) {
        return;
    }

    btnLogin.disabled = cargando;

    btnLogin.textContent = cargando
        ? "Iniciando sesión..."
        : "Iniciar sesión";
}


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            limpiarMensaje();

            const correo = correoInput.value.trim();
            const password = passwordInput.value;

            if (!correo || !password) {

                mostrarMensaje(
                    "Completa todos los campos."
                );

                return;
            }

            if (!correoInput.checkValidity()) {

                mostrarMensaje(
                    "Ingresa un correo electrónico válido."
                );

                return;
            }

            cambiarEstadoBoton(true);

            try {

                const respuesta = await fetch(
                    ENDPOINT_LOGIN,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },

                        credentials: "same-origin",

                        body: JSON.stringify({
                            correo: correo,
                            password: password
                        })
                    }
                );

                let datos;

                try {

                    datos = await respuesta.json();

                } catch (error) {

                    mostrarMensaje(
                        "El servidor devolvió una respuesta no válida."
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
                        "El correo o la contraseña son incorrectos."
                    );

                    cambiarEstadoBoton(false);

                    return;
                }

                if (datos.usuario) {

                    localStorage.setItem(
                        "lifesync_usuario",
                        JSON.stringify(datos.usuario)
                    );
                }

                window.location.href = "inicio.html";

            } catch (error) {

                console.error(
                    "Error al iniciar sesión:",
                    error
                );

                mostrarMensaje(
                    "No se pudo conectar con el servidor. Inténtalo nuevamente."
                );

                cambiarEstadoBoton(false);
            }
        }
    );
}


if (googleLogin) {

    googleLogin.addEventListener(
        "click",
        function () {

            mostrarMensaje(
                "El inicio de sesión con Google estará disponible próximamente."
            );

        }
    );
}


if (appleLogin) {

    appleLogin.addEventListener(
        "click",
        function () {

            mostrarMensaje(
                "El inicio de sesión con Apple estará disponible próximamente."
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