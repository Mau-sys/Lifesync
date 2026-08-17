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


        /* =================================================
           TRADUCCIÓN
           ================================================= */

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


        /* =================================================
           MENSAJES
           ================================================= */

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


        /* =================================================
           BOTÓN
           ================================================= */

        function cambiarEstadoBoton(cargando) {

            if (!boton) {
                return;
            }

            boton.disabled =
                cargando;

            boton.textContent =
                cargando
                    ? texto("guardando")
                    : texto("guardar");
        }


        /* =================================================
           CHECKBOXES
           ================================================= */

        checkboxes.forEach(
            (checkbox) => {

                checkbox.addEventListener(
                    "change",
                    limpiarMensaje
                );

            }
        );


        if (!form) {
            return;
        }


        /* =================================================
           FORMULARIO
           ================================================= */

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
                        (checkbox) =>
                            checkbox.checked
                    )
                    .map(
                        (checkbox) =>
                            checkbox.value
                    );


                if (
                    seleccionadas.length === 0
                ) {

                    mostrarMensaje(
                        texto(
                            "seleccionaCategoria"
                        )
                    );

                    return;
                }


                const checkboxPersonalizado =
                    document.getElementById(
                        "habitoPersonalizado"
                    );


                const tienePersonalizado =
                    checkboxPersonalizado
                        ? checkboxPersonalizado.checked
                        : false;


                cambiarEstadoBoton(true);


                try {

                    const respuesta =
                        await fetch(
                            "../auth/preferencias.php",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Accept":
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
                                "errorRespuestaServidor"
                            )
                        );

                        cambiarEstadoBoton(false);

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
                                "noGuardarPreferencias"
                            )
                        );

                        cambiarEstadoBoton(false);

                        return;
                    }


                    if (
                        tienePersonalizado
                    ) {

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
                            "errorConexion"
                        )
                    );

                    cambiarEstadoBoton(false);

                }

            }
        );


        /* =================================================
           CAMBIO DE IDIOMA
           ================================================= */

        window.addEventListener(
            "lifesyncIdiomaCambiado",
            () => {

                if (
                    boton &&
                    !boton.disabled
                ) {

                    boton.textContent =
                        texto("guardar");

                }

            }
        );

    }
);