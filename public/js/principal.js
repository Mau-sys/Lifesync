document.addEventListener("DOMContentLoaded", () => {

    cargarPerfil();
    cargarHabitosActivos();

});


// ==========================================
// CARGAR PERFIL
// ==========================================

async function cargarPerfil() {

    const nombreUsuario =
        document.getElementById("nombreUsuario");

    if (!nombreUsuario) {
        return;
    }

    try {

        const respuesta = await fetch(
            "../auth/perfil.php",
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito) {

            console.error(
                datos.mensaje || "No se pudo cargar el perfil."
            );

            return;
        }

        const usuario = datos.usuario;

        nombreUsuario.textContent =
            "Bienvenido " + usuario.nombre_usuario;

    } catch (error) {

        console.error(
            "Error al cargar el perfil:",
            error
        );

    }
}


// ==========================================
// CARGAR HÁBITOS ACTIVOS
// ==========================================

async function cargarHabitosActivos() {

    const listaHabitos =
        document.getElementById("listaHabitos");

    const mensajeHabitos =
        document.getElementById("mensajeHabitos");

    if (!listaHabitos) {
        return;
    }

    try {

        const respuesta = await fetch(
            "../auth/habitos_activos.php",
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito) {

            console.error(
                datos.mensaje ||
                "No se pudieron cargar los hábitos."
            );

            if (mensajeHabitos) {
                mensajeHabitos.textContent =
                    datos.mensaje ||
                    "No se pudieron cargar los hábitos.";
            }

            return;
        }

        renderizarHabitos(datos.habitos);

    } catch (error) {

        console.error(
            "Error al cargar los hábitos:",
            error
        );

        if (mensajeHabitos) {
            mensajeHabitos.textContent =
                "Ocurrió un error al cargar los hábitos.";
        }

    }
}


// ==========================================
// DIBUJAR HÁBITOS
// ==========================================

function renderizarHabitos(habitos) {

    const listaHabitos =
        document.getElementById("listaHabitos");

    const mensajeHabitos =
        document.getElementById("mensajeHabitos");

    if (!listaHabitos) {
        return;
    }

    listaHabitos.innerHTML = "";

    if (!habitos || habitos.length === 0) {

        if (mensajeHabitos) {
            mensajeHabitos.textContent =
                "No tienes hábitos activos.";
        }

        return;
    }

    if (mensajeHabitos) {
        mensajeHabitos.textContent = "";
    }

    habitos.forEach(habito => {

        const item =
            document.createElement("li");

        item.classList.add("item-habito");

        // Guardamos la ruta para cuando agregues las páginas
        item.dataset.url = "";

        item.innerHTML = `
            <h3>${escapeHTML(habito.nombre_habito)}</h3>

            <p>
                ${escapeHTML(
                    habito.descripcion || ""
                )}
            </p>
        `;

        // Hacer la tarjeta clickeable
        item.addEventListener("click", () => {

            const url = item.dataset.url;

            if (url) {
                window.location.href = url;
            } else {
                console.log(
                    "Todavía no se ha asignado una página a:",
                    habito.nombre_habito
                );
            }

        });

        listaHabitos.appendChild(item);

    });

}


// ==========================================
// SEGURIDAD
// ==========================================

function escapeHTML(texto) {

    const elemento =
        document.createElement("div");

    elemento.textContent = texto;

    return elemento.innerHTML;
}