document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("habitoForm");

    const nombreHabito = document.getElementById("nombreHabito");

    const objetivo = document.getElementById("objetivo");

    const frecuencia = document.getElementById("frecuencia");

    const fechaInicio = document.getElementById("fechaInicio");

    const fechaFin = document.getElementById("fechaFin");

    const mensaje = document.getElementById("mensajeHabito");

    const boton = document.getElementById("guardarHabito");


    function mostrarMensaje(texto) {

        mensaje.textContent = texto;

    }


    function limpiarMensaje() {

        mensaje.textContent = "";

    }


    function cambiarEstadoBoton(cargando) {

        boton.disabled = cargando;

        boton.textContent = cargando
            ? "Guardando..."
            : "Guardar hábito";

    }


    function obtenerFechaLocal() {

        const fecha = new Date();

        const anio = fecha.getFullYear();

        const mes = String(fecha.getMonth() + 1).padStart(2, "0");

        const dia = String(fecha.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;

    }


    fechaInicio.value = obtenerFechaLocal();

    fechaInicio.min = obtenerFechaLocal();

    fechaFin.min = obtenerFechaLocal();


    fechaInicio.addEventListener("change", () => {

        limpiarMensaje();

        fechaFin.min = fechaInicio.value;

        if (
            fechaFin.value &&
            fechaFin.value < fechaInicio.value
        ) {

            fechaFin.value = "";

        }

    });


    [
        nombreHabito,
        objetivo,
        frecuencia,
        fechaInicio,
        fechaFin
    ].forEach((campo) => {

        campo.addEventListener("input", limpiarMensaje);

        campo.addEventListener("change", limpiarMensaje);

    });


    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        limpiarMensaje();


        const nombre = nombreHabito.value.trim();

        const descripcion = objetivo.value.trim();

        const frecuenciaSeleccionada = frecuencia.value;

        const inicio = fechaInicio.value;

        const fin = fechaFin.value;


        if (
            nombre === "" ||
            descripcion === "" ||
            frecuenciaSeleccionada === "" ||
            inicio === ""
        ) {

            mostrarMensaje(
                "Completa todos los campos obligatorios."
            );

            return;

        }


        if (nombre.length < 2) {

            mostrarMensaje(
                "El nombre del hábito debe tener al menos 2 caracteres."
            );

            nombreHabito.focus();

            return;

        }


        if (descripcion.length < 3) {

            mostrarMensaje(
                "Describe brevemente el objetivo del hábito."
            );

            objetivo.focus();

            return;

        }


        if (
            fin !== "" &&
            fin < inicio
        ) {

            mostrarMensaje(
                "La fecha de finalización no puede ser anterior a la fecha de inicio."
            );

            fechaFin.focus();

            return;

        }


        cambiarEstadoBoton(true);


        try {

            const respuesta = await fetch(
                "../auth/crear-habito.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        nombre: nombre,
                        descripcion: descripcion,
                        frecuencia: frecuenciaSeleccionada,
                        fechaInicio: inicio,
                        fechaFin: fin
                    })
                }
            );


            let datos;

            try {

                datos = await respuesta.json();

            } catch (error) {

                mostrarMensaje(
                    "El servidor devolvió una respuesta inválida."
                );

                cambiarEstadoBoton(false);

                return;

            }


            if (!respuesta.ok || !datos.exito) {

                mostrarMensaje(
                    datos.mensaje ||
                    "No se pudo guardar el hábito."
                );

                cambiarEstadoBoton(false);

                return;

            }


            window.location.href = "Inicio.html";


        } catch (error) {

            console.error(
                "Error al crear hábito:",
                error
            );

            mostrarMensaje(
                "No se pudo conectar con el servidor. Inténtalo nuevamente."
            );

            cambiarEstadoBoton(false);

        }

    });

});