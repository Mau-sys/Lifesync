document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registroForm");

    const nombreInput = document.getElementById("nombre");
    const correoInput = document.getElementById("correo");
    const passwordInput = document.getElementById("password");
    const confirmarPasswordInput = document.getElementById("confirmarPassword");

    const mensajeError = document.getElementById("mensajeError");
    const btnRegistro = document.getElementById("btnRegistro");

    const googleRegister = document.getElementById("googleRegister");
    const appleRegister = document.getElementById("appleRegister");


    function mostrarMensaje(mensaje) {
        mensajeError.textContent = mensaje;
    }


    function limpiarMensaje() {
        mensajeError.textContent = "";
    }


    function cambiarEstadoBoton(cargando) {

        btnRegistro.disabled = cargando;

        btnRegistro.textContent = cargando
            ? "Registrando..."
            : "Registrarse";
    }


    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        limpiarMensaje();

        const nombre = nombreInput.value.trim();
        const correo = correoInput.value.trim();
        const password = passwordInput.value;
        const confirmarPassword = confirmarPasswordInput.value;


        if (
            nombre === "" ||
            correo === "" ||
            password === "" ||
            confirmarPassword === ""
        ) {

            mostrarMensaje("Completa todos los campos.");

            return;
        }


        if (!correoInput.checkValidity()) {

            mostrarMensaje("Ingresa un correo electrónico válido.");

            return;
        }


        if (nombre.length > 50) {

            mostrarMensaje(
                "El nombre no puede superar los 50 caracteres."
            );

            return;
        }


        if (password.length < 8) {

            mostrarMensaje(
                "La contraseña debe tener al menos 8 caracteres."
            );

            return;
        }


        if (password !== confirmarPassword) {

            mostrarMensaje("Las contraseñas no coinciden.");

            return;
        }


        cambiarEstadoBoton(true);


        try {

            const respuesta = await fetch(
                "/LifeSync/auth/registro.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        nombre: nombre,
                        correo: correo,
                        password: password
                    })
                }
            );


            const texto = await respuesta.text();

            let datos;

            try {

                datos = JSON.parse(texto);

            } catch (error) {

                console.error("Respuesta del servidor:", texto);

                mostrarMensaje(
                    "El servidor no devolvió una respuesta válida."
                );

                cambiarEstadoBoton(false);

                return;
            }


            if (!respuesta.ok || !datos.exito) {

                mostrarMensaje(
                    datos.mensaje ||
                    "No se pudo completar el registro."
                );

                cambiarEstadoBoton(false);

                return;
            }


            window.location.href = "Preferencias.html";


        } catch (error) {

            console.error(
                "Error al registrar usuario:",
                error
            );

            mostrarMensaje(
                "No se pudo conectar con el servidor. Inténtalo nuevamente."
            );

            cambiarEstadoBoton(false);
        }

    });


    googleRegister.addEventListener("click", () => {

        mostrarMensaje(
            "El registro con Google estará disponible próximamente."
        );

    });


    appleRegister.addEventListener("click", () => {

        mostrarMensaje(
            "El registro con Apple estará disponible próximamente."
        );

    });


    nombreInput.addEventListener("input", limpiarMensaje);
    correoInput.addEventListener("input", limpiarMensaje);
    passwordInput.addEventListener("input", limpiarMensaje);
    confirmarPasswordInput.addEventListener("input", limpiarMensaje);

});