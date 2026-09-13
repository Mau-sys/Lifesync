document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("preferenciasForm");
    const mensaje = document.getElementById("mensajePreferencias");
    const boton = document.getElementById("btnGuardarPreferencias");
    const checkboxes = document.querySelectorAll('input[name="categorias"]');

    function texto(clave) {
        return typeof window.traducirLifeSync === "function"
            ? window.traducirLifeSync(clave)
            : clave;
    }

    function mostrarMensaje(textoMensaje) {
        if (mensaje) {
            mensaje.textContent = textoMensaje;
        }
    }

    function limpiarMensaje() {
        if (mensaje) {
            mensaje.textContent = "";
        }
    }

    function cambiarEstadoBoton(cargando) {
        if (!boton) {
            return;
        }

        boton.disabled = cargando;
        boton.textContent = cargando
            ? texto("guardando")
            : texto("guardar");
    }

    async function cargarPreferencias() {
        try {
            const respuesta = await fetch("../auth/preferencias.php", {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json"
                }
            });

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exito) {
                mostrarMensaje(
                    datos.mensaje || texto("noCargarPreferencias")
                );
                return;
            }

            const categoriasActivas = (datos.categorias_activas || [])
                .map(Number);

            checkboxes.forEach((checkbox) => {
                const idCategoria = Number(checkbox.value);
                checkbox.checked = categoriasActivas.includes(idCategoria);
            });
        } catch (error) {
            console.error("Error al cargar preferencias:", error);
            mostrarMensaje(texto("errorConexion"));
        }
    }

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", limpiarMensaje);
    });

    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        limpiarMensaje();

        const seleccionadas = Array.from(checkboxes)
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => Number(checkbox.value));

        if (seleccionadas.length === 0) {
            mostrarMensaje(texto("seleccionaCategoria"));
            return;
        }

        cambiarEstadoBoton(true);

        try {
            const respuesta = await fetch("../auth/preferencias.php", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    categorias: seleccionadas
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exito) {
                mostrarMensaje(
                    datos.mensaje || texto("noGuardarPreferencias")
                );
                cambiarEstadoBoton(false);
                return;
            }

            window.location.href = "inicio.html";
        } catch (error) {
            console.error("Error al guardar preferencias:", error);
            mostrarMensaje(texto("errorConexion"));
            cambiarEstadoBoton(false);
        }
    });

    window.addEventListener("lifesyncIdiomaCambiado", () => {
        if (boton && !boton.disabled) {
            boton.textContent = texto("guardar");
        }
    });

    cargarPreferencias();
});