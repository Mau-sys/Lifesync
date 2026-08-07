document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("preferenciasForm");

    const mensaje = document.getElementById("mensajePreferencias");

    const boton = document.getElementById("btnGuardarPreferencias");

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

        checkbox.addEventListener("change", limpiarMensaje);

    });


    form.addEventListener("submit", async (event) => {

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
            document.getElementById("habitoPersonalizado").checked;


        cambiarEstadoBoton(true);


        try {

            const respuesta = await fetch(
                "../auth/preferencias.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        categorias: seleccionadas
                    })
                }
            );


            const datos = await respuesta.json();


            if (!respuesta.ok || !datos.exito) {

                mostrarMensaje(
                    datos.mensaje ||
                    "No se pudieron guardar tus preferencias."
                );

                cambiarEstadoBoton(false);

                return;

            }


            if (tienePersonalizado) {

                window.location.href = "Crear-habito.html";

            } else {

                window.location.href = "Inicio.html";

            }

        } catch (error) {

            console.error(
                "Error al guardar preferencias:",
                error
            );

            mostrarMensaje(
                "No se pudo conectar con el servidor. Inténtalo nuevamente."
            );

            cambiarEstadoBoton(false);

        }

    });

});