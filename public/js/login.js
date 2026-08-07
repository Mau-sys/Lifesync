const loginForm = document.getElementById("loginForm");
const correoInput = document.getElementById("correo");
const passwordInput = document.getElementById("password");
const mensajeError = document.getElementById("mensajeError");
const btnLogin = document.getElementById("btnLogin");

const googleLogin = document.getElementById("googleLogin");
const appleLogin = document.getElementById("appleLogin");


function mostrarMensaje(mensaje) {

    mensajeError.textContent = mensaje;

}


function limpiarMensaje() {

    mensajeError.textContent = "";

}


function cambiarEstadoBoton(cargando) {

    if (cargando) {

        btnLogin.disabled = true;
        btnLogin.textContent = "Iniciando sesión...";

    } else {

        btnLogin.disabled = false;
        btnLogin.textContent = "Iniciar sesión";

    }

}


loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    limpiarMensaje();

    const correo = correoInput.value.trim();
    const password = passwordInput.value;

    if (!correo || !password) {

        mostrarMensaje("Completa todos los campos.");

        return;

    }

    if (!correoInput.checkValidity()) {

        mostrarMensaje("Ingresa un correo electrónico válido.");

        return;

    }

    cambiarEstadoBoton(true);

    try {

        const respuesta = await fetch("../auth/login.php", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                correo: correo,
                password: password
            })

        });

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito) {

            mostrarMensaje(
                datos.mensaje || "El correo o la contraseña son incorrectos."
            );

            cambiarEstadoBoton(false);

            return;

        }

        window.location.href = "inicio.html";

    } catch (error) {

        console.error("Error al iniciar sesión:", error);

        mostrarMensaje(
            "No se pudo conectar con el servidor. Inténtalo nuevamente."
        );

        cambiarEstadoBoton(false);

    }

});


googleLogin.addEventListener("click", function() {

    mostrarMensaje(
        "El inicio de sesión con Google estará disponible próximamente."
    );

});


appleLogin.addEventListener("click", function() {

    mostrarMensaje(
        "El inicio de sesión con Apple estará disponible próximamente."
    );

});


correoInput.addEventListener("input", limpiarMensaje);

passwordInput.addEventListener("input", limpiarMensaje);