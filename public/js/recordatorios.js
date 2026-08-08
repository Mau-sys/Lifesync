document.addEventListener("DOMContentLoaded", () => {

    const btnNuevoRecordatorio =
        document.getElementById("btnNuevoRecordatorio");

    const modal =
        document.getElementById("modalRecordatorio");

    const cerrarModal =
        document.getElementById("cerrarModal");

    const cancelarRecordatorio =
        document.getElementById("cancelarRecordatorio");

    const formulario =
        document.getElementById("recordatorioForm");

    const lista =
        document.getElementById("listaRecordatorios");

    const sinRecordatorios =
        document.getElementById("sinRecordatorios");

    const repeticion =
        document.getElementById("repeticion");

    const campoFecha =
        document.getElementById("campoFecha");

    const fechaRecordatorio =
        document.getElementById("fechaRecordatorio");

    const titulo =
        document.getElementById("titulo");


    function abrirModal() {

        modal.classList.remove("oculto");

        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        setTimeout(() => {

            titulo.focus();

        }, 100);

    }


    function cerrarModalFuncion() {

        modal.classList.add("oculto");

        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        formulario.reset();

        actualizarCampoFecha();

    }


    function actualizarCampoFecha() {

        if (repeticion.value === "una_vez") {

            campoFecha.hidden = false;

            fechaRecordatorio.required = true;

        } else {

            campoFecha.hidden = true;

            fechaRecordatorio.required = false;

            fechaRecordatorio.value = "";

        }

    }


    btnNuevoRecordatorio.addEventListener(
        "click",
        abrirModal
    );


    cerrarModal.addEventListener(
        "click",
        cerrarModalFuncion
    );


    cancelarRecordatorio.addEventListener(
        "click",
        cerrarModalFuncion
    );


    repeticion.addEventListener(
        "change",
        actualizarCampoFecha
    );


    modal.addEventListener("click", (evento) => {

        if (evento.target === modal) {

            cerrarModalFuncion();

        }

    });


    document.addEventListener("keydown", (evento) => {

        if (
            evento.key === "Escape" &&
            !modal.classList.contains("oculto")
        ) {

            cerrarModalFuncion();

        }

    });


    formulario.addEventListener("submit", async (evento) => {

        evento.preventDefault();


        const datos = {

            accion: "crear",

            titulo:
                document.getElementById("titulo").value.trim(),

            id_categoria:
                document.getElementById("categoria").value,

            hora:
                document.getElementById("hora").value,

            repeticion:
                document.getElementById("repeticion").value,

            fecha_recordatorio:
                document.getElementById("fechaRecordatorio").value,

            mensaje:
                document.getElementById("mensaje").value.trim()

        };


        if (!datos.titulo) {

            alert(
                "Escribe un nombre para el recordatorio."
            );

            return;

        }


        if (!datos.hora) {

            alert(
                "Selecciona una hora."
            );

            return;

        }


        if (
            datos.repeticion === "una_vez" &&
            !datos.fecha_recordatorio
        ) {

            alert(
                "Selecciona la fecha del recordatorio."
            );

            return;

        }


        try {

            const respuesta = await fetch(
                "auth/recordatorios.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(datos)

                }
            );


            const resultado =
                await respuesta.json();


            if (!resultado.exito) {

                alert(resultado.mensaje);

                return;

            }


            cerrarModalFuncion();

            cargarRecordatorios();


        } catch (error) {

            console.error(error);

            alert(
                "No se pudo guardar el recordatorio."
            );

        }

    });


    async function cargarRecordatorios() {

        try {

            const respuesta = await fetch(
                "auth/recordatorios.php?accion=listar"
            );


            const resultado =
                await respuesta.json();


            if (!resultado.exito) {

                alert(resultado.mensaje);

                return;

            }


            lista.innerHTML = "";


            if (
                !resultado.recordatorios ||
                resultado.recordatorios.length === 0
            ) {

                sinRecordatorios.style.display = "block";

                return;

            }


            sinRecordatorios.style.display = "none";


            resultado.recordatorios.forEach(
                (recordatorio) => {

                    const tarjeta =
                        crearTarjeta(recordatorio);

                    lista.appendChild(tarjeta);

                }
            );


        } catch (error) {

            console.error(error);

        }

    }


    function crearTarjeta(recordatorio) {

        const articulo =
            document.createElement("article");

        articulo.className =
            "tarjeta-recordatorio";


        const contenido =
            document.createElement("div");

        contenido.className =
            "informacion-recordatorio";


        const tituloTarjeta =
            document.createElement("h3");

        tituloTarjeta.textContent =
            recordatorio.titulo;


        const detalles =
            document.createElement("p");

        detalles.className =
            "detalles-recordatorio";


        const detalle =
            document.createElement("span");

        detalle.className =
            "detalle-recordatorio";

        detalle.textContent =
            construirDetalle(recordatorio);


        detalles.appendChild(detalle);


        contenido.appendChild(tituloTarjeta);

        contenido.appendChild(detalles);


        if (recordatorio.mensaje) {

            const mensaje =
                document.createElement("p");

            mensaje.textContent =
                recordatorio.mensaje;

            contenido.appendChild(mensaje);

        }


        const acciones =
            document.createElement("div");

        acciones.className =
            "acciones-recordatorio";


        const hora =
            document.createElement("strong");

        hora.className =
            "hora-recordatorio";

        hora.textContent =
            String(recordatorio.hora).substring(0, 5);


        const eliminar =
            document.createElement("button");

        eliminar.type = "button";

        eliminar.className =
            "btn-eliminar-recordatorio";

        eliminar.textContent = "🗑";

        eliminar.setAttribute(
            "aria-label",
            "Eliminar recordatorio"
        );


        eliminar.addEventListener(
            "click",
            () => {

                eliminarRecordatorio(
                    recordatorio.id_recordatorio
                );

            }
        );


        acciones.appendChild(hora);

        acciones.appendChild(eliminar);


        articulo.appendChild(contenido);

        articulo.appendChild(acciones);


        return articulo;

    }


    function construirDetalle(recordatorio) {

        const repeticionTexto = {

            diario:
                "Todos los días",

            lunes_viernes:
                "Lunes a viernes",

            una_vez:
                "Solo una vez",

            personalizado:
                "Personalizado"

        };


        let texto =
            (
                recordatorio.categoria ||
                "Sin categoría"
            ) +
            " • " +
            (
                repeticionTexto[
                    recordatorio.repeticion
                ] ||
                recordatorio.repeticion
            );


        if (
            recordatorio.repeticion === "una_vez" &&
            recordatorio.fecha_recordatorio
        ) {

            texto +=
                " • " +
                recordatorio.fecha_recordatorio;

        }


        return texto;

    }


    async function eliminarRecordatorio(id) {

        const confirmar =
            confirm(
                "¿Quieres eliminar este recordatorio?"
            );


        if (!confirmar) {

            return;

        }


        try {

            const respuesta = await fetch(
                "auth/recordatorios.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        accion: "eliminar",

                        id_recordatorio: id

                    })

                }
            );


            const resultado =
                await respuesta.json();


            if (!resultado.exito) {

                alert(resultado.mensaje);

                return;

            }


            cargarRecordatorios();


        } catch (error) {

            console.error(error);

            alert(
                "No se pudo eliminar el recordatorio."
            );

        }

    }


    actualizarCampoFecha();

    cargarRecordatorios();

});