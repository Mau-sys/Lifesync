function LS(clave, predeterminado = "") {
    if (typeof window !== "undefined" && typeof window.traducirLifeSync === "function") {
        const res = window.traducirLifeSync(clave, predeterminado);
        if (res && res !== clave) return res;
    }
    return predeterminado || clave;
}

document.addEventListener("DOMContentLoaded", () => {
    cargarHabitos();

    const btnNuevoHabito = document.getElementById("btnNuevoHabito");
    const modalNuevoHabito = document.getElementById("modalNuevoHabito");
    const cerrarModal = document.getElementById("cerrarModal");
    const cancelarModal = document.getElementById("cancelarModal");
    const habitoForm = document.getElementById("habitoForm");
    const modalEliminar = document.getElementById("modalEliminar");
    const cancelarEliminar = document.getElementById("cancelarEliminar");
    const confirmarEliminar = document.getElementById("confirmarEliminar");

    if (btnNuevoHabito) {
        btnNuevoHabito.addEventListener("click", () => {
            if (modalNuevoHabito) {
                modalNuevoHabito.classList.remove("oculto");
            }
        });
    }

    if (cerrarModal) {
        cerrarModal.addEventListener("click", cerrarModalNuevo);
    }

    if (cancelarModal) {
        cancelarModal.addEventListener("click", cerrarModalNuevo);
    }

    if (cancelarEliminar) {
        cancelarEliminar.addEventListener("click", () => {
            if (modalEliminar) {
                modalEliminar.classList.add("oculto");
            }
        });
    }

    if (habitoForm) {
        habitoForm.addEventListener("submit", crearHabito);
    }

    if (confirmarEliminar) {
        confirmarEliminar.addEventListener("click", eliminarHabito);
    }

    window.addEventListener("lifesyncIdiomaCambiado", function () {
        cargarHabitos();
    });
});

let habitoAEliminar = null;

function traducir(clave, predeterminado = "") {
    return LS(clave, predeterminado);
}

function cerrarModalNuevo() {
    const modal = document.getElementById("modalNuevoHabito");
    const formulario = document.getElementById("habitoForm");

    if (modal) {
        modal.classList.add("oculto");
    }

    if (formulario) {
        formulario.reset();
    }
}

async function cargarHabitos() {
    const contenedor = document.getElementById("contenedorHabitos");

    if (!contenedor) {
        return;
    }

    try {
        const respuesta = await fetch("../auth/obtener-personalizados.php", {
            method: "GET",
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito) {
            console.error(datos.mensaje || traducir("noSePudieronCargarHabitos", "No se pudieron cargar tus hábitos."));
            contenedor.innerHTML = "";
            return;
        }

        contenedor.innerHTML = "";

        if (!datos.habitos || datos.habitos.length === 0) {
            return;
        }

        datos.habitos.forEach((habito) => {
            crearTarjetaHabito(habito, contenedor);
        });

    } catch (error) {
        console.error("Error al cargar los hábitos:", error);
    }
}

function crearTarjetaHabito(habito, contenedor) {
    const idHU = habito.id_habito_usuario || habito.id_habito;

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-habito";

    const textoEliminar = traducir("personalizados.eliminarHabito", "Eliminar hábito");

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "btn-eliminar";
    botonEliminar.setAttribute("aria-label", textoEliminar);
    botonEliminar.title = textoEliminar;
    botonEliminar.textContent = "🗑";

    botonEliminar.addEventListener("click", (evento) => {
        evento.preventDefault();
        evento.stopPropagation();
        abrirModalEliminar(idHU);
    });

    const contenido = document.createElement("a");
    contenido.className = "contenido-habito";
    contenido.href = "HHabitoPersonalizado.html?id_habito_usuario=" + encodeURIComponent(idHU);

    const informacion = document.createElement("div");
    informacion.className = "habito-info";

    const imagen = document.createElement("img");
    imagen.src = habito.icono || habito.imagen_url || "img/H-Perzona.png";
    imagen.alt = traducir("categorias.habitoPersonalizado", "Hábito Personalizado");

    const datos = document.createElement("div");

    const titulo = document.createElement("h3");
    titulo.textContent = habito.nombre_habito || habito.nombre || traducir("categorias.habitoPersonalizado", "Hábito Personalizado");

    const descripcion = document.createElement("p");
    descripcion.textContent = obtenerTextoHabito(habito);

    datos.appendChild(titulo);
    datos.appendChild(descripcion);

    informacion.appendChild(imagen);
    informacion.appendChild(datos);

    const progreso = document.createElement("div");
    progreso.className = "circulo-progreso";
    progreso.textContent = calcularProgreso(habito) + "%";

    contenido.appendChild(informacion);
    contenido.appendChild(progreso);

    tarjeta.appendChild(botonEliminar);
    tarjeta.appendChild(contenido);

    contenedor.appendChild(tarjeta);
}

function obtenerTextoHabito(habito) {
    const frecuencia = traducirFrecuencia(habito.frecuencia);
    const porcentaje = calcularProgreso(habito);
    const textoCompletado = traducir("personalizados.completado", "completado");

    return `${frecuencia} • ${porcentaje}% ${textoCompletado}`;
}

function traducirFrecuencia(frecuencia) {
    switch (frecuencia) {
        case "diaria":
            return traducir("personalizados.frecuenciaDiaria", "Diaria");
        case "semanal":
            return traducir("personalizados.frecuenciaSemanal", "Semanal");
        case "mensual":
            return traducir("personalizados.frecuenciaMensual", "Mensual");
        default:
            return frecuencia || traducir("personalizados.frecuenciaDiaria", "Diaria");
    }
}

function calcularProgreso(habito) {
    const objetivo = Number(habito.objetivo);
    const progreso = Number(habito.progreso_hoy ?? habito.progreso ?? habito.progreso_acumulado ?? 0);

    if (!objetivo || objetivo <= 0) {
        return 0;
    }

    const porcentaje = (progreso / objetivo) * 100;
    return Math.min(100, Math.max(0, Math.round(porcentaje)));
}

async function crearHabito(evento) {
    evento.preventDefault();

    const nombreHabito = document.getElementById("nombreHabito")?.value.trim() || "";
    const objetivoTexto = document.getElementById("objetivo")?.value.trim() || "";
    const frecuencia = document.getElementById("frecuencia")?.value || "";
    const fechaInicio = document.getElementById("fechaInicio")?.value || "";
    const fechaFin = document.getElementById("fechaFin")?.value || "";

    if (!nombreHabito || !objetivoTexto || !frecuencia || !fechaInicio) {
        alert(traducir("personalizados.completaCampos", "Por favor completa todos los campos obligatorios."));
        return;
    }

    try {
        const respuesta = await fetch("../auth/crear-personalizado.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                nombre_habito: nombreHabito,
                descripcion: objetivoTexto,
                frecuencia: frecuencia,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin || null
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito) {
            alert(datos.mensaje || traducir("personalizados.noSePudoCrear", "No se pudo crear el hábito."));
            return;
        }

        cerrarModalNuevo();
        await cargarHabitos();

    } catch (error) {
        console.error("Error al crear el hábito:", error);
        alert(traducir("personalizados.errorCrear", "Error al crear el hábito personalizado."));
    }
}

function abrirModalEliminar(idHabito) {
    habitoAEliminar = idHabito;
    const modal = document.getElementById("modalEliminar");

    if (modal) {
        modal.classList.remove("oculto");
    }
}

async function eliminarHabito() {
    if (!habitoAEliminar) {
        return;
    }

    try {
        const respuesta = await fetch("../auth/eliminar-personalizado.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                id_habito_usuario: habitoAEliminar
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito) {
            alert(datos.mensaje || traducir("personalizados.noSePudoEliminar", "No se pudo eliminar el hábito."));
            return;
        }

        const modal = document.getElementById("modalEliminar");
        if (modal) {
            modal.classList.add("oculto");
        }

        habitoAEliminar = null;
        await cargarHabitos();

    } catch (error) {
        console.error("Error al eliminar el hábito:", error);
        alert(traducir("personalizados.errorEliminar", "Error al eliminar el hábito personalizado."));
    }
}