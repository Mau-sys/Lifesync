document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "preferenciasForm"
            );

        const mensaje =
            document.getElementById(
                "mensajePreferencias"
            );

        const boton =
            document.getElementById(
                "btnGuardarPreferencias"
            );

        const checkboxes =
            document.querySelectorAll(
                'input[name="categorias"]'
            );


        function texto(clave) {

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


        function mostrarMensaje(textoMensaje) {

            if (mensaje) {

                mensaje.textContent =
                    textoMensaje;

            }

        }


        function limpiarMensaje() {

            if (mensaje) {

                mensaje.textContent =
                    "";

            }

        }


        function cambiarEstadoBoton(cargando) {

            boton.disabled =
                cargando;

            boton.textContent =
                cargando
                    ? texto("guardando")
                    : texto("guardar");

        }


        checkboxes.forEach(
            (checkbox) => {

                checkbox.addEventListener(
                    "change",
                    limpiarMensaje
                );

            }
        );


        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                limpiarMensaje();


                const seleccionadas =
                    Array.from(
                        checkboxes
                    )
                    .filter(
                        checkbox =>
                            checkbox.checked
                    )
                    .map(
                        checkbox =>
                            checkbox.value
                    );


                if (
                    seleccionadas.length === 0
                ) {

                    mostrarMensaje(
                        texto(
                            "Selecciona al menos una categoría."
                        )
                    );

                    return;
                }


                const tienePersonalizado =
                    document.getElementById(
                        "habitoPersonalizado"
                    ).checked;


                cambiarEstadoBoton(
                    true
                );


                try {

                    const respuesta =
                        await fetch(
                            "../auth/preferencias.php",
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                credentials:
                                    "include",

                                body:
                                    JSON.stringify({
                                        categorias:
                                            seleccionadas
                                    })
                            }
                        );


                    const textoRespuesta =
                        await respuesta.text();


                    let datos;


                    try {

                        datos =
                            JSON.parse(
                                textoRespuesta
                            );

                    } catch (error) {

                        console.error(
                            "La respuesta no es JSON válido:",
                            textoRespuesta
                        );

                        mostrarMensaje(
                            texto(
                                "El servidor devolvió una respuesta inesperada."
                            )
                        );

                        cambiarEstadoBoton(
                            false
                        );

                        return;
                    }


                    if (
                        !respuesta.ok ||
                        !datos.exito
                    ) {

                        mostrarMensaje(
                            datos.detalle ||
                            datos.mensaje ||
                            texto(
                                "No se pudieron guardar las preferencias."
                            )
                        );

                        cambiarEstadoBoton(
                            false
                        );

                        return;
                    }


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
                        texto(
                            "No se pudo conectar con el servidor. Inténtalo nuevamente."
                        )
                    );

                    cambiarEstadoBoton(
                        false
                    );

                }

            }
        );

    }
);