document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("recuperarForm");
    const correo = document.getElementById("correo");
    const mensaje = document.getElementById("mensajeRecuperacion");
    const boton = document.getElementById("btnRecuperar");
    const texto = clave => typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(clave) : clave;

    form?.addEventListener("submit", async event => {
        event.preventDefault();
        if (!correo?.checkValidity()) {
            if (mensaje) mensaje.textContent = texto("correoValido");
            return;
        }

        if (mensaje) mensaje.textContent = "";
        if (boton) {
            boton.disabled = true;
            boton.textContent = texto("enviando");
        }

        try {
            const respuesta = await fetch("../auth/recuperar-contrasena.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ correo: correo.value.trim() })
            });
            const datos = await respuesta.json();
            if (!respuesta.ok || !datos.exito) throw new Error(datos.mensaje || texto("errorRecuperacion"));
            if (mensaje) {
                mensaje.classList.add("exito");
                mensaje.textContent = datos.mensaje || texto("recuperacionEnviada");
            }
            form.reset();
        } catch (error) {
            if (mensaje) {
                mensaje.classList.remove("exito");
                mensaje.textContent = error.message || texto("errorRecuperacion");
            }
        } finally {
            if (boton) {
                boton.disabled = false;
                boton.textContent = texto("recuperar.boton");
            }
        }
    });
});
