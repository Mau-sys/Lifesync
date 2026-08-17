function LS(clave) {
    return typeof window !== "undefined" && typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(clave) : clave;
}

document.addEventListener("DOMContentLoaded", () => {

    cargarHabitos();


    const btnNuevoHabito =
        document.getElementById(
            "btnNuevoHabito"
        );


    const modalNuevoHabito =
        document.getElementById(
            "modalNuevoHabito"
        );


    const cerrarModal =
        document.getElementById(
            "cerrarModal"
        );


    const cancelarModal =
        document.getElementById(
            "cancelarModal"
        );


    const habitoForm =
        document.getElementById(
            "habitoForm"
        );


    const modalEliminar =
        document.getElementById(
            "modalEliminar"
        );


    const cancelarEliminar =
        document.getElementById(
            "cancelarEliminar"
        );


    const confirmarEliminar =
        document.getElementById(
            "confirmarEliminar"
        );


    if (btnNuevoHabito) {

        btnNuevoHabito.addEventListener(
            "click",
            () => {

                if (modalNuevoHabito) {

                    modalNuevoHabito.classList.remove(
                        "oculto"
                    );

                }

            }
        );

    }


    if (cerrarModal) {

        cerrarModal.addEventListener(
            "click",
            cerrarModalNuevo
        );

    }


    if (cancelarModal) {

        cancelarModal.addEventListener(
            "click",
            cerrarModalNuevo
        );

    }


    if (cancelarEliminar) {

        cancelarEliminar.addEventListener(
            "click",
            () => {

                if (modalEliminar) {

                    modalEliminar.classList.add(
                        "oculto"
                    );

                }

            }
        );

    }


    if (habitoForm) {

        habitoForm.addEventListener(
            "submit",
            crearHabito
        );

    }


    if (confirmarEliminar) {

        confirmarEliminar.addEventListener(
            "click",
            eliminarHabito
        );

    }


    window.addEventListener(
        "lifesyncIdiomaCambiado",
        function () {

            cargarHabitos();

        }
    );

});


let habitoAEliminar = null;


function traducir(clave) {

    if (
        typeof window.traducirLifeSync ===
        "function"
    ) {

        return window.traducirLifeSync(
            clave
        );

    }

    return clave;

}


function cerrarModalNuevo() {

    const modal =
        document.getElementById(
            "modalNuevoHabito"
        );


    const formulario =
        document.getElementById(
            "habitoForm"
        );


    if (modal) {

        modal.classList.add(
            "oculto"
        );

    }


    if (formulario) {

        formulario.reset();

    }

}


async function cargarHabitos() {

    const contenedor =
        document.getElementById(
            "contenedorHabitos"
        );


    if (!contenedor) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                "auth/obtener-personalizados.php",
                {
                    method: "GET",

                    credentials:
                        "include"
                }
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            console.error(
                datos.mensaje ||
                LS("noSePudoCargarHabitos")
            );


            contenedor.innerHTML =
                "";

            return;

        }


        contenedor.innerHTML =
            "";


        if (
            !datos.habitos ||
            datos.habitos.length ===
                0
        ) {

            return;

        }


        datos.habitos.forEach(
            (habito) => {

                crearTarjetaHabito(
                    habito,
                    contenedor
                );

            }
        );


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
        document.createElement(
            "article"
        );


    tarjeta.className =
        "tarjeta-habito";


    const botonEliminar =
        document.createElement(
            "button"
        );


    botonEliminar.type =
        "button";


    botonEliminar.className =
        "btn-eliminar";


    botonEliminar.setAttribute(
        "aria-label",
        traducir(
            "eliminarHabito"
        )
    );


    botonEliminar.title =
        traducir(
            "eliminarHabito"
        );


    botonEliminar.textContent =
        "🗑";


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
        document.createElement(
            "a"
        );


    contenido.className =
        "contenido-habito";


    contenido.href =
        "HHabitoPersonalizado.html?id=" +
        encodeURIComponent(
            habito.id_habito
        );


    const informacion =
        document.createElement(
            "div"
        );


    informacion.className =
        "habito-info";


    const imagen =
        document.createElement(
            "img"
        );


    imagen.src =
        habito.icono ||
        "img/H-Perzona.png";


    imagen.alt =
        traducir(
            "habitoPersonalizado"
        );


    const datos =
        document.createElement(
            "div"
        );


    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        habito.nombre_habito;


    const descripcion =
        document.createElement(
            "p"
        );


    descripcion.textContent =
        obtenerTextoHabito(
            habito
        );


    datos.appendChild(
        titulo
    );


    datos.appendChild(
        descripcion
    );


    informacion.appendChild(
        imagen
    );


    informacion.appendChild(
        datos
    );


    const progreso =
        document.createElement(
            "div"
        );


    progreso.className =
        "circulo-progreso";


    progreso.textContent =
        calcularProgreso(
            habito
        ) + "%";


    contenido.appendChild(
        informacion
    );


    contenido.appendChild(
        progreso
    );


    tarjeta.appendChild(
        botonEliminar
    );


    tarjeta.appendChild(
        contenido
    );


    contenedor.appendChild(
        tarjeta
    );

}


function obtenerTextoHabito(
    habito
) {

    const frecuencia =
        traducirFrecuencia(
            habito.frecuencia
        );


    const porcentaje =
        calcularProgreso(
            habito
        );


    return (
        `${frecuencia} • ` +
        `${porcentaje}% ` +
        `${traducir("completado")}`
    );

}


function traducirFrecuencia(
    frecuencia
) {

    switch (
        frecuencia
    ) {

        case "diaria":

            return traducir(
                "frecuenciaDiario"
            );


        case "semanal":

            return traducir(
                "frecuenciaSemanal"
            );


        case "mensual":

            return traducir(
                "frecuenciaMensual"
            );


        default:

            return frecuencia || "";

    }

}


function calcularProgreso(
    habito
) {

    const objetivo =
        Number(
            habito.objetivo
        );


    const progreso =
        Number(
            habito.progreso
        );


    if (
        !objetivo ||
        objetivo <= 0
    ) {

        return 0;

    }


    const porcentaje =
        (
            progreso /
            objetivo
        ) * 100;


    return Math.min(
        100,
        Math.max(
            0,
            Math.round(
                porcentaje
            )
        )
    );

}


async function crearHabito(
    evento
) {

    evento.preventDefault();


    const nombreHabito =
        document
            .getElementById(
                "nombreHabito"
            )
            ?.value
            .trim() || "";


    const objetivoTexto =
        document
            .getElementById(
                "objetivo"
            )
            ?.value
            .trim() || "";


    const frecuencia =
        document
            .getElementById(
                "frecuencia"
            )
            ?.value || "";


    const fechaInicio =
        document
            .getElementById(
                "fechaInicio"
            )
            ?.value || "";


    const fechaFin =
        document
            .getElementById(
                "fechaFin"
            )
            ?.value || "";


    if (
        !nombreHabito ||
        !objetivoTexto ||
        !frecuencia ||
        !fechaInicio
    ) {

        alert(
            traducir(
                "completo"
            )
        );

        return;

    }


    try {

        const respuesta =
            await fetch(
                "auth/crear-personalizado.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify({

                            nombre_habito:
                                nombreHabito,

                            descripcion:
                                objetivoTexto,

                            frecuencia:
                                frecuencia,

                            fecha_inicio:
                                fechaInicio,

                            fecha_fin:
                                fechaFin ||
                                null

                        })
                }
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            alert(
                datos.mensaje ||
                traducir(
                    "noSePudoCrearHabito"
                )
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
            traducir(
                "errorCrearHabito"
            )
        );

    }

}


function abrirModalEliminar(
    idHabito
) {

    habitoAEliminar =
        idHabito;


    const modal =
        document.getElementById(
            "modalEliminar"
        );


    if (modal) {

        modal.classList.remove(
            "oculto"
        );

    }

}


async function eliminarHabito() {

    if (!habitoAEliminar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                "auth/eliminar-personalizado.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify({

                            id_habito:
                                habitoAEliminar

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            alert(
                datos.mensaje ||
                traducir(
                    "noSePudoEliminarHabito"
                )
            );

            return;

        }


        const modal =
            document.getElementById(
                "modalEliminar"
            );


        if (modal) {

            modal.classList.add(
                "oculto"
            );

        }


        habitoAEliminar =
            null;


        await cargarHabitos();


    } catch (error) {

        console.error(
            "Error al eliminar el hábito:",
            error
        );


        alert(
            traducir(
                "errorEliminarHabito"
            )
        );

    }

}