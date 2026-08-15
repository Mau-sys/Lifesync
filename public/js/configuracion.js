(function () {

    "use strict";


    const CLAVE_CONFIGURACION =
        "lifeSyncConfiguracion";


    const CONFIGURACION_POR_DEFECTO = {

        modoOscuro: true,

        notificaciones: true,

        sonidos: true,

        correo: true,

        idioma: "es",

        sincronizacion: true

    };


    function obtenerConfiguracion() {

        const guardada =
            localStorage.getItem(
                CLAVE_CONFIGURACION
            );


        if (!guardada) {

            return {
                ...CONFIGURACION_POR_DEFECTO
            };

        }


        try {

            const configuracion =
                JSON.parse(guardada);


            return {

                ...CONFIGURACION_POR_DEFECTO,

                ...configuracion

            };

        } catch (error) {

            console.error(
                "No se pudo leer la configuración:",
                error
            );


            return {
                ...CONFIGURACION_POR_DEFECTO
            };

        }

    }


    function guardarConfiguracionLocal(
        configuracion
    ) {

        localStorage.setItem(

            CLAVE_CONFIGURACION,

            JSON.stringify(configuracion)

        );

    }


    function aplicarConfiguracionTema(
        activado
    ) {

        if (
            typeof window.aplicarTemaGlobal !==
            "function"
        ) {

            console.error(
                "tema-global.js no está cargado."
            );

            return;

        }


        window.aplicarTemaGlobal(
            activado
                ? "oscuro"
                : "claro"
        );

    }


    function actualizarMensajesEstado() {

        const estado =
            document.getElementById(
                "estadoSincronizacion"
            );


        const texto =
            document.getElementById(
                "textoEstadoSincronizacion"
            );


        const sincronizacion =
            document.getElementById(
                "sincronizacion"
            );


        if (
            !estado ||
            !texto ||
            !sincronizacion
        ) {

            return;

        }


        const idioma =
            document.getElementById(
                "idioma"
            )?.value || "es";


        if (idioma === "en") {

            if (sincronizacion.checked) {

                estado.textContent =
                    "● Synchronized";

                texto.textContent =
                    "Your information is backed up correctly.";

            } else {

                estado.textContent =
                    "● Not synchronized";

                texto.textContent =
                    "Automatic synchronization is disabled.";

            }

        } else {

            if (sincronizacion.checked) {

                estado.textContent =
                    "● Sincronizada";

                texto.textContent =
                    "Tu información se encuentra respaldada correctamente.";

            } else {

                estado.textContent =
                    "● No sincronizada";

                texto.textContent =
                    "La sincronización automática está desactivada.";

            }

        }

    }


    function cargarControles() {

        const configuracion =
            obtenerConfiguracion();


        const modoOscuro =
            document.getElementById(
                "modoOscuro"
            );


        const notificaciones =
            document.getElementById(
                "notificaciones"
            );


        const sonidos =
            document.getElementById(
                "sonidos"
            );


        const correo =
            document.getElementById(
                "correo"
            );


        const idioma =
            document.getElementById(
                "idioma"
            );


        const sincronizacion =
            document.getElementById(
                "sincronizacion"
            );


        if (modoOscuro) {

            modoOscuro.checked =
                configuracion.modoOscuro;

        }


        if (notificaciones) {

            notificaciones.checked =
                configuracion.notificaciones;

        }


        if (sonidos) {

            sonidos.checked =
                configuracion.sonidos;

        }


        if (correo) {

            correo.checked =
                configuracion.correo;

        }


        if (idioma) {

            idioma.value =
                configuracion.idioma;

        }


        if (sincronizacion) {

            sincronizacion.checked =
                configuracion.sincronizacion;

        }


        aplicarConfiguracionTema(
            configuracion.modoOscuro
        );


        if (
            typeof window.aplicarIdiomaGlobal ===
            "function"
        ) {

            window.aplicarIdiomaGlobal(
                configuracion.idioma
            );

        }


        actualizarMensajesEstado();

    }


    function mostrarMensaje(
        elemento,
        mensaje
    ) {

        if (!elemento) {
            return;
        }


        elemento.textContent =
            mensaje;


        setTimeout(function () {

            elemento.textContent =
                "";

        }, 3500);

    }


    function inicializar() {

        cargarControles();

        const modoOscuro =
            document.getElementById(
                "modoOscuro"
            );


        if (modoOscuro) {

            modoOscuro.addEventListener(
                "change",
                function () {

                    aplicarConfiguracionTema(
                        modoOscuro.checked
                    );

                }
            );

        }

        const idioma =
            document.getElementById(
                "idioma"
            );


        if (idioma) {

            idioma.addEventListener(
                "change",
                function () {

                    if (
                        typeof window.aplicarIdiomaGlobal ===
                        "function"
                    ) {

                        window.aplicarIdiomaGlobal(
                            idioma.value
                        );

                    }


                    actualizarMensajesEstado();

                }
            );

        }

        const sincronizacion =
            document.getElementById(
                "sincronizacion"
            );


        if (sincronizacion) {

            sincronizacion.addEventListener(
                "change",
                function () {

                    actualizarMensajesEstado();

                }
            );

        }

        const formulario =
            document.getElementById(
                "configuracionForm"
            );


        if (formulario) {

            formulario.addEventListener(
                "submit",
                function (evento) {

                    evento.preventDefault();


                    const configuracion = {

                        modoOscuro:
                            document.getElementById(
                                "modoOscuro"
                            ).checked,

                        notificaciones:
                            document.getElementById(
                                "notificaciones"
                            ).checked,

                        sonidos:
                            document.getElementById(
                                "sonidos"
                            ).checked,

                        correo:
                            document.getElementById(
                                "correo"
                            ).checked,

                        idioma:
                            document.getElementById(
                                "idioma"
                            ).value,

                        sincronizacion:
                            document.getElementById(
                                "sincronizacion"
                            ).checked

                    };


                    guardarConfiguracionLocal(
                        configuracion
                    );


                    aplicarConfiguracionTema(
                        configuracion.modoOscuro
                    );


                    if (
                        typeof window.aplicarIdiomaGlobal ===
                        "function"
                    ) {

                        window.aplicarIdiomaGlobal(
                            configuracion.idioma
                        );

                    }


                    actualizarMensajesEstado();


                    const mensaje =
                        document.getElementById(
                            "mensajeConfiguracion"
                        );


                    mostrarMensaje(

                        mensaje,

                        configuracion.idioma === "en"
                            ? "Changes saved successfully."
                            : "Los cambios se guardaron correctamente."

                    );

                }
            );

        }

        const modalContrasena =
            document.getElementById(
                "modalContrasena"
            );


        const btnCambiarContrasena =
            document.getElementById(
                "btnCambiarContrasena"
            );


        const btnCancelarContrasena =
            document.getElementById(
                "btnCancelarContrasena"
            );


        const btnGuardarContrasena =
            document.getElementById(
                "btnGuardarContrasena"
            );


        if (
            modalContrasena &&
            btnCambiarContrasena
        ) {

            btnCambiarContrasena.addEventListener(
                "click",
                function () {

                    modalContrasena.classList.add(
                        "activo"
                    );


                    document.body.style.overflow =
                        "hidden";

                }
            );

        }


        function cerrarModalContrasena() {

            if (!modalContrasena) {
                return;
            }


            modalContrasena.classList.remove(
                "activo"
            );


            document.body.style.overflow =
                "";


            const actual =
                document.getElementById(
                    "actual"
                );


            const nueva =
                document.getElementById(
                    "nueva"
                );


            const confirmar =
                document.getElementById(
                    "confirmar"
                );


            const mensaje =
                document.getElementById(
                    "mensajeContrasena"
                );


            if (actual) {
                actual.value = "";
            }


            if (nueva) {
                nueva.value = "";
            }


            if (confirmar) {
                confirmar.value = "";
            }


            if (mensaje) {
                mensaje.textContent = "";
            }

        }


        if (btnCancelarContrasena) {

            btnCancelarContrasena.addEventListener(
                "click",
                cerrarModalContrasena
            );

        }


        if (btnGuardarContrasena) {

            btnGuardarContrasena.addEventListener(
                "click",
                function () {

                    const actual =
                        document.getElementById(
                            "actual"
                        )?.value.trim();


                    const nueva =
                        document.getElementById(
                            "nueva"
                        )?.value.trim();


                    const confirmar =
                        document.getElementById(
                            "confirmar"
                        )?.value.trim();


                    const mensaje =
                        document.getElementById(
                            "mensajeContrasena"
                        );


                    const idiomaActual =
                        document.getElementById(
                            "idioma"
                        )?.value || "es";


                    if (
                        !actual ||
                        !nueva ||
                        !confirmar
                    ) {

                        if (mensaje) {

                            mensaje.textContent =
                                idiomaActual === "en"
                                    ? "Please complete all fields."
                                    : "Completa todos los campos.";

                        }

                        return;

                    }


                    if (nueva.length < 8) {

                        if (mensaje) {

                            mensaje.textContent =
                                idiomaActual === "en"
                                    ? "The new password must contain at least 8 characters."
                                    : "La nueva contraseña debe tener al menos 8 caracteres.";

                        }

                        return;

                    }


                    if (nueva !== confirmar) {

                        if (mensaje) {

                            mensaje.textContent =
                                idiomaActual === "en"
                                    ? "The new passwords do not match."
                                    : "Las nuevas contraseñas no coinciden.";

                        }

                        return;

                    }


                    if (mensaje) {

                        mensaje.textContent =
                            idiomaActual === "en"
                                ? "The form is ready. The real password change will be connected when the account system is available."
                                : "El formulario está listo. El cambio real de contraseña se conectará cuando esté disponible el sistema de cuentas.";

                    }

                }
            );

        }

        const modalSesiones =
            document.getElementById(
                "modalSesiones"
            );


        const btnSesiones =
            document.getElementById(
                "btnSesiones"
            );


        const btnCerrarModalSesiones =
            document.getElementById(
                "btnCerrarModalSesiones"
            );


        if (
            modalSesiones &&
            btnSesiones
        ) {

            btnSesiones.addEventListener(
                "click",
                function () {

                    cargarSesiones();


                    modalSesiones.classList.add(
                        "activo"
                    );


                    document.body.style.overflow =
                        "hidden";

                }
            );

        }


        function cerrarModalSesiones() {

            if (!modalSesiones) {
                return;
            }


            modalSesiones.classList.remove(
                "activo"
            );


            document.body.style.overflow =
                "";

        }


        if (btnCerrarModalSesiones) {

            btnCerrarModalSesiones.addEventListener(
                "click",
                cerrarModalSesiones
            );

        }


        function cargarSesiones() {

            const lista =
                document.getElementById(
                    "listaSesiones"
                );


            const idiomaActual =
                document.getElementById(
                    "idioma"
                )?.value || "es";


            if (!lista) {
                return;
            }


            lista.innerHTML = "";


            const dispositivo =
                document.createElement(
                    "div"
                );


            dispositivo.style.padding =
                "16px";


            dispositivo.style.marginBottom =
                "12px";


            dispositivo.style.border =
                "1px solid var(--color-borde)";


            dispositivo.style.borderRadius =
                "var(--radio-medio)";


            dispositivo.innerHTML = `

                <strong>
                    💻 ${
                        idiomaActual === "en"
                            ? "Current device"
                            : "Dispositivo actual"
                    }
                </strong>

                <p style="margin: 8px 0 0;">
                    ${
                        idiomaActual === "en"
                            ? "This session"
                            : "Esta sesión"
                    }
                </p>

            `;


            lista.appendChild(
                dispositivo
            );


            const mensaje =
                document.getElementById(
                    "mensajeSesiones"
                );


            if (mensaje) {

                mensaje.textContent =
                    idiomaActual === "en"
                        ? "Other sessions will appear here when the account system is connected."
                        : "Las demás sesiones aparecerán aquí cuando el sistema de cuentas esté conectado.";

            }

        }

        if (modalContrasena) {

            modalContrasena.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento.target ===
                        modalContrasena
                    ) {

                        cerrarModalContrasena();

                    }

                }
            );

        }


        if (modalSesiones) {

            modalSesiones.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento.target ===
                        modalSesiones
                    ) {

                        cerrarModalSesiones();

                    }

                }
            );

        }


        document.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key !== "Escape"
                ) {

                    return;

                }


                if (
                    modalContrasena &&
                    modalContrasena.classList.contains(
                        "activo"
                    )
                ) {

                    cerrarModalContrasena();

                }


                if (
                    modalSesiones &&
                    modalSesiones.classList.contains(
                        "activo"
                    )
                ) {

                    cerrarModalSesiones();

                }

            }
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar
        );

    } else {

        inicializar();

    }


})();