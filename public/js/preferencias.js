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
           CARGAR PREFERENCIAS
           ================================================= */

        async function cargarPreferencias() {

            try {

                const respuesta =
                    await fetch(
                        "../auth/preferencias.php",
                        {
                            method: "GET",

                            credentials:
                                "include",

                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                const datos =
                    await respuesta.json();


                if (
                    !respuesta.ok ||
                    !datos.exito
                ) {

                    mostrarMensaje(
                        datos.mensaje ||
                        texto(
                            "noCargarPreferencias"
                        )
                    );

                    return;
                }


                const categoriasActivas =
                    datos.categorias_activas || [];


                /*
                 * Marcar los switches que el usuario
                 * ya tiene activos.
                 */

                checkboxes.forEach(
                    (checkbox) => {

                        const idCategoria =
                            parseInt(
                                checkbox.value
                            );


                        checkbox.checked =
                            categoriasActivas.includes(
                                idCategoria
                            );

                    }
                );


            } catch (error) {

                console.error(
                    "Error al cargar preferencias:",
                    error
                );

                mostrarMensaje(
                    texto(
                        "errorConexion"
                    )
                );

            }

        }


        /* =================================================
           CAMBIOS EN CHECKBOXES
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
                                parseInt(
                                    checkbox.value
                                )
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


                    const datos =
                        await respuesta.json();


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


                    /*
                     * Preferencias guardadas.
                     */

                    window.location.href =
                        "inicio.html";


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


        /* =================================================
           INICIAR
           ================================================= */

        cargarPreferencias();

    }
);