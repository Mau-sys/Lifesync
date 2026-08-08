document.addEventListener("DOMContentLoaded", () => {

    cargarHabitos();

    const btnNuevoHabito =
        document.getElementById("btnNuevoHabito");

    const modalNuevoHabito =
        document.getElementById("modalNuevoHabito");

    const cerrarModal =
        document.getElementById("cerrarModal");

    const cancelarModal =
        document.getElementById("cancelarModal");

    const habitoForm =
        document.getElementById("habitoForm");

    const modalEliminar =
        document.getElementById("modalEliminar");

    const cancelarEliminar =
        document.getElementById("cancelarEliminar");

    const confirmarEliminar =
        document.getElementById("confirmarEliminar");


    btnNuevoHabito.addEventListener("click", () => {

        modalNuevoHabito.classList.remove("oculto");

    });


    cerrarModal.addEventListener("click", cerrarModalNuevo);


    cancelarModal.addEventListener("click", cerrarModalNuevo);


    cancelarEliminar.addEventListener("click", () => {

        modalEliminar.classList.add("oculto");

    });


    habitoForm.addEventListener("submit", crearHabito);


    confirmarEliminar.addEventListener(
        "click",
        eliminarHabito
    );

});


let habitoAEliminar = null;


function cerrarModalNuevo() {

    const modal =
        document.getElementById("modalNuevoHabito");

    const formulario =
        document.getElementById("habitoForm");

    modal.classList.add("oculto");

    formulario.reset();

}


async function cargarHabitos() {

    const contenedor =
        document.getElementById("contenedorHabitos");


    if (!contenedor) {
        return;
    }


    try {

        const respuesta = await fetch(
            "auth/obtener-personalizados.php",
            {
                method: "GET",
                credentials: "include"
            }
        );


        const datos = await respuesta.json();


        if (!respuesta.ok || !datos.exito) {

            console.error(
                datos.mensaje ||
                "No se pudieron cargar los hábitos."
            );

            contenedor.innerHTML = "";

            return;

        }


        contenedor.innerHTML = "";


        if (
            !datos.habitos ||
            datos.habitos.length === 0
        ) {

            return;

        }


        datos.habitos.forEach((habito) => {

            crearTarjetaHabito(
                habito,
                contenedor
            );

        });


    } catch (error) {

        console.error(
            "Error al cargar los hábitos:",
            error
        );

    }

}


function crearTarjetaHabito(
    habito,
    contenedor
) {

    const tarjeta =
        document.createElement("article");

    tarjeta.className =
        "tarjeta-habito";


    const botonEliminar =
        document.createElement("button");

    botonEliminar.type = "button";

    botonEliminar.className =
        "btn-eliminar";

    botonEliminar.setAttribute(
        "aria-label",
        "Eliminar hábito"
    );

    botonEliminar.textContent = "🗑";


    botonEliminar.addEventListener(
        "click",
        (evento) => {

            evento.preventDefault();
            evento.stopPropagation();

            abrirModalEliminar(
                habito.id_habito
            );

        }
    );


    const contenido =
        document.createElement("a");

    contenido.className =
        "contenido-habito";

    contenido.href =
        "HHabitoPersonalizado.html?id=" +
        encodeURIComponent(habito.id_habito);


    const informacion =
        document.createElement("div");

    informacion.className =
        "habito-info";


    const imagen =
        document.createElement("img");

    imagen.src =
        habito.icono ||
        "img/H-Perzona.png";

    imagen.alt =
        "Hábito personalizado";


    const datos =
        document.createElement("div");


    const titulo =
        document.createElement("h3");

    titulo.textContent =
        habito.nombre_habito;


    const descripcion =
        document.createElement("p");

    descripcion.textContent =
        obtenerTextoHabito(habito);


    datos.appendChild(titulo);
    datos.appendChild(descripcion);


    informacion.appendChild(imagen);
    informacion.appendChild(datos);


    const progreso =
        document.createElement("div");

    progreso.className =
        "circulo-progreso";

    progreso.textContent =
        calcularProgreso(habito) + "%";


    contenido.appendChild(informacion);
    contenido.appendChild(progreso);


    tarjeta.appendChild(botonEliminar);
    tarjeta.appendChild(contenido);


    contenedor.appendChild(tarjeta);

}


function obtenerTextoHabito(habito) {

    const frecuencia =
        traducirFrecuencia(
            habito.frecuencia
        );


    const porcentaje =
        calcularProgreso(habito);


    return `${frecuencia} • ${porcentaje}% completado`;

}


function traducirFrecuencia(frecuencia) {

    switch (frecuencia) {

        case "diaria":
            return "Diario";

        case "semanal":
            return "Semanal";

        case "mensual":
            return "Mensual";

        default:
            return frecuencia || "";

    }

}


function calcularProgreso(habito) {

    const objetivo =
        Number(habito.objetivo);


    const progreso =
        Number(habito.progreso);


    if (!objetivo || objetivo <= 0) {
        return 0;
    }


    const porcentaje =
        (progreso / objetivo) * 100;


    return Math.min(
        100,
        Math.max(
            0,
            Math.round(porcentaje)
        )
    );

}


async function crearHabito(evento) {

    evento.preventDefault();


    const nombreHabito =
        document.getElementById("nombreHabito").value.trim();


    const objetivoTexto =
        document.getElementById("objetivo").value.trim();


    const frecuencia =
        document.getElementById("frecuencia").value;


    const fechaInicio =
        document.getElementById("fechaInicio").value;


    const fechaFin =
        document.getElementById("fechaFin").value;


    if (!nombreHabito ||
        !objetivoTexto ||
        !frecuencia ||
        !fechaInicio) {

        alert(
            "Completa los campos obligatorios."
        );

        return;

    }


    try {

        const respuesta = await fetch(
            "auth/crear-personalizado.php",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                credentials: "include",
                body: JSON.stringify({

                    nombre_habito:
                        nombreHabito,

                    descripcion:
                        objetivoTexto,

                    frecuencia:
                        frecuencia,

                    fecha_inicio:
                        fechaInicio,

                    fecha_fin:
                        fechaFin || null

                })
            }
        );


        const datos =
            await respuesta.json();


        if (!respuesta.ok || !datos.exito) {

            alert(
                datos.mensaje ||
                "No se pudo crear el hábito."
            );

            return;

        }


        cerrarModalNuevo();

        await cargarHabitos();


    } catch (error) {

        console.error(
            "Error al crear el hábito:",
            error
        );

        alert(
            "Ocurrió un error al crear el hábito."
        );

    }

}


function abrirModalEliminar(idHabito) {

    habitoAEliminar =
        idHabito;


    const modal =
        document.getElementById("modalEliminar");


    modal.classList.remove("oculto");

}


async function eliminarHabito() {

    if (!habitoAEliminar) {
        return;
    }


    try {

        const respuesta = await fetch(
            "auth/eliminar-personalizado.php",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                credentials: "include",
                body: JSON.stringify({

                    id_habito:
                        habitoAEliminar

                })
            }
        );


        const datos =
            await respuesta.json();


        if (!respuesta.ok || !datos.exito) {

            alert(
                datos.mensaje ||
                "No se pudo eliminar el hábito."
            );

            return;

        }


        document
            .getElementById("modalEliminar")
            .classList.add("oculto");


        habitoAEliminar = null;


        await cargarHabitos();


    } catch (error) {

        console.error(
            "Error al eliminar el hábito:",
            error
        );

        alert(
            "Ocurrió un error al eliminar el hábito."
        );

    }

}