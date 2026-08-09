document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("preferenciasForm");

    const mensaje = document.getElementById(
        "mensajePreferencias"
    );

    const boton = document.getElementById(
        "btnGuardarPreferencias"
    );

    const checkboxes = document.querySelectorAll(
        'input[name="categorias"]'
    );


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
            : "Guardar";

    }


    checkboxes.forEach((checkbox) => {

        checkbox.addEventListener(
            "change",
            limpiarMensaje
        );

    });


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            limpiarMensaje();


            const seleccionadas = Array.from(checkboxes)
                .filter((checkbox) => checkbox.checked)
                .map((checkbox) => checkbox.value);


            if (seleccionadas.length === 0) {

                mostrarMensaje(
                    "Selecciona al menos una categoría."
                );

                return;
            }


            const tienePersonalizado =
                document.getElementById(
                    "habitoPersonalizado"
                ).checked;


            cambiarEstadoBoton(true);


            try {

                const respuesta = await fetch(
                    "../auth/preferencias.php",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body: JSON.stringify({
                            categorias:
                                seleccionadas
                        })
                    }
                );


                const textoRespuesta =
                    await respuesta.text();


                console.log(
                    "Respuesta de preferencias.php:",
                    textoRespuesta
                );


                let datos;


                try {

                    datos = JSON.parse(
                        textoRespuesta
                    );

                } catch (error) {

                    console.error(
                        "La respuesta no es JSON válido:",
                        textoRespuesta
                    );

                    mostrarMensaje(
                        "El servidor devolvió una respuesta inesperada."
                    );

                    cambiarEstadoBoton(false);

                    return;
                }


                if (
                    !respuesta.ok ||
                    !datos.exito
                ) {

                    console.error(
                        "Error del servidor:",
                        datos
                    );


                    mostrarMensaje(
                    datos.detalle ||
                    datos.mensaje ||
                    "No se pudieron guardar las preferencias."
                    );

console.log("Respuesta completa del servidor:", datos);

                    cambiarEstadoBoton(false);

                    return;
                }


                console.log(
                    "Preferencias guardadas:",
                    datos
                );


                if (tienePersonalizado) {

                    window.location.href =
                        "Crear-habito.html";

                } else {

                    window.location.href =
                        "Inicio.html";

                }

            } catch (error) {

                console.error(
                    "Error de conexión:",
                    error
                );


                mostrarMensaje(
                    "No se pudo conectar con el servidor. Inténtalo nuevamente."
                );


                cambiarEstadoBoton(false);

            }

        }
    );

});