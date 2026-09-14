document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("restablecerForm");
    const password = document.getElementById("nuevaPassword");
    const confirmar = document.getElementById("confirmarPassword");
    const mensaje = document.getElementById("mensajeRestablecer");
    const boton = document.getElementById("btnRestablecer");
    const texto = clave => typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(clave) : clave;
    const token = new URLSearchParams(window.location.search).get("token") || "";

    form?.addEventListener("submit", async event => {
        event.preventDefault();
        if (!token) {
            mensaje.textContent = texto("enlaceRecuperacionInvalido");
            return;
        }
        if (password.value.length < 8) {
            mensaje.textContent = texto("contrasenaCorta");
            return;
        }
        if (password.value !== confirmar.value) {
            mensaje.textContent = texto("contrasenasNoCoinciden");
            return;
        }

        mensaje.textContent = "";
        boton.disabled = true;
        boton.textContent = texto("guardando");

        try {
            const respuesta = await fetch("../auth/restablecer-contrasena.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ token, password: password.value, confirmar_password: confirmar.value })
            });
            const datos = await respuesta.json();
            if (!respuesta.ok || !datos.exito) throw new Error(datos.mensaje || texto("errorRecuperacion"));
            mensaje.classList.add("exito");
            mensaje.textContent = datos.mensaje || texto("contrasenaActualizada");
            form.reset();
            setTimeout(() => window.location.href = "Inicio-sesion.html", 1500);
        } catch (error) {
            mensaje.classList.remove("exito");
            mensaje.textContent = error.message || texto("errorRecuperacion");
            boton.disabled = false;
            boton.textContent = texto("restablecer.boton");
        }
    });
});
