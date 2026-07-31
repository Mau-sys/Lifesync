document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registroForm");
    const mensajeError = document.getElementById("mensajeError");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const password = document.getElementById("password").value;
        const confirmarPassword = document.getElementById("confirmarPassword").value;

        mensajeError.textContent = "";

        if (password !== confirmarPassword) {
            mensajeError.textContent = "Las contraseñas no coinciden.";
            return;
        }

        try {

            const respuesta = await fetch("../auth/registro.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre,
                    correo,
                    password
                })
            });

            const datos = await respuesta.json();

            if (datos.success) {

                alert("Registro exitoso");

                window.location.href = "preferencias.html";

            } else {

                mensajeError.textContent = datos.message;
            }

        } catch (error) {

            mensajeError.textContent =
                "Error al conectar con el servidor.";
        }

        fetch("../auth/registro.php")

    });

});