(function () {

    "use strict";


    /*
    =====================================================
    CONFIGURACIÓN GENERAL
    =====================================================
    */

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


    /*
    =====================================================
    TRADUCCIONES
    =====================================================
    */

    const traducciones = {

        es: {

            volver: "← Volver",

            configuracion: "Configuración",

            descripcionConfiguracion:
                "Personaliza el funcionamiento de tu cuenta y de la aplicación.",

            apariencia:
                "🎨 Apariencia",

            modoOscuro:
                "Modo oscuro",

            descripcionModoOscuro:
                "Activa el tema oscuro para una experiencia más cómoda durante la noche.",

            notificacionesTitulo:
                "🔔 Notificaciones",

            recordatorios:
                "Recordatorios",

            descripcionRecordatorios:
                "Recibe recordatorios para completar tus hábitos diarios.",

            sonidos:
                "Sonidos de la aplicación",

            descripcionSonidos:
                "Reproduce sonidos al completar hábitos, obtener logros y recibir notificaciones.",

            correos:
                "Correos electrónicos",

            descripcionCorreos:
                "Envía recordatorios importantes y resúmenes semanales a tu correo.",

            idiomaTitulo:
                "🌐 Idioma",

            seleccionarIdioma:
                "Selecciona el idioma",

            espanol:
                "Español",

            ingles:
                "English",

            sincronizacionTitulo:
                "☁️ Sincronización",

            sincronizacionAutomatica:
                "Sincronización automática",

            descripcionSincronizacion:
                "Guarda automáticamente tus hábitos, estadísticas, rachas y configuraciones para mantenerlas disponibles en todos tus dispositivos.",

            estadoSincronizacionTitulo:
                "Estado de sincronización",

            textoSincronizada:
                "Tu información se encuentra respaldada correctamente.",

            sincronizada:
                "● Sincronizada",

            seguridadTitulo:
                "🔒 Seguridad",

            cambiarContrasena:
                "Cambiar contraseña",

            descripcionContrasena:
                "Actualiza tu contraseña para proteger tu cuenta.",

            cambiar:
                "Cambiar",

            sesionesActivas:
                "Sesiones activas",

            descripcionSesiones:
                "Consulta y administra los dispositivos donde has iniciado sesión.",

            administrar:
                "Administrar",

            guardarCambios:
                "Guardar cambios",

            introducirContrasenas:
                "Introduce tu contraseña actual y después la nueva contraseña.",

            contrasenaActual:
                "Contraseña actual",

            nuevaContrasena:
                "Nueva contraseña",

            confirmarContrasena:
                "Confirmar nueva contraseña",

            cancelar:
                "Cancelar",

            guardar:
                "Guardar",

            descripcionModalSesiones:
                "Aquí aparecerán los dispositivos donde hayas iniciado sesión. También podrás cerrar cualquier sesión de forma segura.",

            cerrar:
                "Cerrar"

        },


        en: {

            volver: "← Back",

            configuracion:
                "Settings",

            descripcionConfiguracion:
                "Customize how your account and application work.",

            apariencia:
                "🎨 Appearance",

            modoOscuro:
                "Dark mode",

            descripcionModoOscuro:
                "Enable the dark theme for a more comfortable experience at night.",

            notificacionesTitulo:
                "🔔 Notifications",

            recordatorios:
                "Reminders",

            descripcionRecordatorios:
                "Receive reminders to complete your daily habits.",

            sonidos:
                "Application sounds",

            descripcionSonidos:
                "Play sounds when completing habits, earning achievements, and receiving notifications.",

            correos:
                "Emails",

            descripcionCorreos:
                "Receive important reminders and weekly summaries by email.",

            idiomaTitulo:
                "🌐 Language",

            seleccionarIdioma:
                "Select language",

            espanol:
                "Spanish",

            ingles:
                "English",

            sincronizacionTitulo:
                "☁️ Synchronization",

            sincronizacionAutomatica:
                "Automatic synchronization",

            descripcionSincronizacion:
                "Automatically save your habits, statistics, streaks, and settings to keep them available across your devices.",

            estadoSincronizacionTitulo:
                "Synchronization status",

            textoSincronizada:
                "Your information is backed up correctly.",

            sincronizada:
                "● Synchronized",

            seguridadTitulo:
                "🔒 Security",

            cambiarContrasena:
                "Change password",

            descripcionContrasena:
                "Update your password to protect your account.",

            cambiar:
                "Change",

            sesionesActivas:
                "Active sessions",

            descripcionSesiones:
                "View and manage the devices where you are signed in.",

            administrar:
                "Manage",

            guardarCambios:
                "Save changes",

            introducirContrasenas:
                "Enter your current password and then your new password.",

            contrasenaActual:
                "Current password",

            nuevaContrasena:
                "New password",

            confirmarContrasena:
                "Confirm new password",

            cancelar:
                "Cancel",

            guardar:
                "Save",

            descripcionModalSesiones:
                "Your signed-in devices will appear here. You will also be able to safely close any session.",

            cerrar:
                "Close"

        }

    };


    /*
    =====================================================
    OBTENER CONFIGURACIÓN
    =====================================================
    */

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


    /*
    =====================================================
    GUARDAR CONFIGURACIÓN LOCAL
    =====================================================
    */

    function guardarConfiguracionLocal(configuracion) {

        localStorage.setItem(

            CLAVE_CONFIGURACION,

            JSON.stringify(configuracion)

        );

    }


    /*
    =====================================================
    TRADUCIR LA PÁGINA
    =====================================================
    */

    function aplicarIdioma(idioma) {

        if (!traducciones[idioma]) {

            idioma = "es";

        }


        const textos =
            traducciones[idioma];


        document.documentElement.lang =
            idioma;


        const elementos =
            document.querySelectorAll(
                "[data-i18n]"
            );


        elementos.forEach(function (elemento) {

            const clave =
                elemento.dataset.i18n;


            if (
                Object.prototype.hasOwnProperty.call(
                    textos,
                    clave
                )
            ) {

                elemento.textContent =
                    textos[clave];

            }

        });


        document.title =
            idioma === "en"
                ? "LifeSync | Settings"
                : "LifeSync | Configuración";


        actualizarMensajesEstado(idioma);

    }


    /*
    =====================================================
    ACTUALIZAR TEXTO DE SINCRONIZACIÓN
    =====================================================
    */

    function actualizarMensajesEstado(idioma) {

        const estado =
            document.getElementById(
                "estadoSincronizacion"
            );


        const texto =
            document.getElementById(
                "textoEstadoSincronizacion"
            );


        if (!estado || !texto) {
            return;
        }


        if (idioma === "en") {

            if (
                document.getElementById(
                    "sincronizacion"
                ).checked
            ) {

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

            if (
                document.getElementById(
                    "sincronizacion"
                ).checked
            ) {

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


    /*
    =====================================================
    APLICAR MODO OSCURO
    =====================================================
    */

    function aplicarModoOscuro(activado) {

        document.body.classList.toggle(
            "modo-claro",
            !activado
        );


        document.documentElement.classList.toggle(
            "modo-claro",
            !activado
        );


        localStorage.setItem(
            "lifeSyncModoOscuro",
            activado ? "true" : "false"
        );


        /*
        Si tema-global.js utiliza esta misma
        clave, ambos archivos podrán compartir
        el estado del tema.
        */

    }


    /*
    =====================================================
    CARGAR CONFIGURACIÓN EN LOS CONTROLES
    =====================================================
    */

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


        aplicarModoOscuro(
            configuracion.modoOscuro
        );


        aplicarIdioma(
            configuracion.idioma
        );

    }


    /*
    =====================================================
    MOSTRAR MENSAJE GENERAL
    =====================================================
    */

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

            elemento.textContent = "";

        }, 3500);

    }


    /*
    =====================================================
    INICIALIZAR
    =====================================================
    */

    function inicializar() {

        cargarControles();


        /*
        -------------------------------------------------
        CAMBIO DE MODO OSCURO
        -------------------------------------------------
        */

        const modoOscuro =
            document.getElementById(
                "modoOscuro"
            );


        if (modoOscuro) {

            modoOscuro.addEventListener(
                "change",
                function () {

                    aplicarModoOscuro(
                        modoOscuro.checked
                    );

                }
            );

        }


        /*
        -------------------------------------------------
        CAMBIO DE IDIOMA
        -------------------------------------------------
        */

        const idioma =
            document.getElementById(
                "idioma"
            );


        if (idioma) {

            idioma.addEventListener(
                "change",
                function () {

                    aplicarIdioma(
                        idioma.value
                    );

                }
            );

        }


        /*
        -------------------------------------------------
        CAMBIO DE SINCRONIZACIÓN
        -------------------------------------------------
        */

        const sincronizacion =
            document.getElementById(
                "sincronizacion"
            );


        if (sincronizacion) {

            sincronizacion.addEventListener(
                "change",
                function () {

                    actualizarMensajesEstado(
                        document.getElementById(
                            "idioma"
                        ).value
                    );

                }
            );

        }


        /*
        -------------------------------------------------
        FORMULARIO
        -------------------------------------------------
        */

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


                    aplicarModoOscuro(
                        configuracion.modoOscuro
                    );


                    aplicarIdioma(
                        configuracion.idioma
                    );


                    const mensaje =
                        document.getElementById(
                            "mensajeConfiguracion"
                        );


                    const idiomaActual =
                        configuracion.idioma;


                    mostrarMensaje(

                        mensaje,

                        idiomaActual === "en"
                            ? "Changes saved successfully."
                            : "Los cambios se guardaron correctamente."

                    );

                }
            );

        }


        /*
        =================================================
        MODAL CAMBIAR CONTRASEÑA
        =================================================
        */

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


        if (
            modalContrasena &&
            btnCancelarContrasena
        ) {

            btnCancelarContrasena.addEventListener(
                "click",
                cerrarModalContrasena
            );

        }


        function cerrarModalContrasena() {

            modalContrasena.classList.remove(
                "activo"
            );


            document.body.style.overflow =
                "";


            document.getElementById(
                "actual"
            ).value = "";


            document.getElementById(
                "nueva"
            ).value = "";


            document.getElementById(
                "confirmar"
            ).value = "";


            document.getElementById(
                "mensajeContrasena"
            ).textContent = "";

        }


        /*
        -------------------------------------------------
        GUARDAR NUEVA CONTRASEÑA
        -------------------------------------------------
        */

        if (btnGuardarContrasena) {

            btnGuardarContrasena.addEventListener(
                "click",
                function () {

                    const actual =
                        document.getElementById(
                            "actual"
                        ).value.trim();


                    const nueva =
                        document.getElementById(
                            "nueva"
                        ).value.trim();


                    const confirmar =
                        document.getElementById(
                            "confirmar"
                        ).value.trim();


                    const mensaje =
                        document.getElementById(
                            "mensajeContrasena"
                        );


                    const idiomaActual =
                        document.getElementById(
                            "idioma"
                        ).value;


                    /*
                    IMPORTANTE:
                    Aquí todavía NO se cambia la
                    contraseña real porque no existe
                    una cuenta conectada al servidor.
                    */


                    if (!actual || !nueva || !confirmar) {

                        mensaje.textContent =
                            idiomaActual === "en"
                                ? "Please complete all fields."
                                : "Completa todos los campos.";

                        return;

                    }


                    if (nueva.length < 8) {

                        mensaje.textContent =
                            idiomaActual === "en"
                                ? "The new password must contain at least 8 characters."
                                : "La nueva contraseña debe tener al menos 8 caracteres.";

                        return;

                    }


                    if (nueva !== confirmar) {

                        mensaje.textContent =
                            idiomaActual === "en"
                                ? "The new passwords do not match."
                                : "Las nuevas contraseñas no coinciden.";

                        return;

                    }


                    mensaje.textContent =
                        idiomaActual === "en"
                            ? "The form is ready. The real password change will be connected when the account system is available."
                            : "El formulario está listo. El cambio real de contraseña se conectará cuando esté disponible el sistema de cuentas.";

                }
            );

        }


        /*
        =================================================
        MODAL SESIONES
        =================================================
        */

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


        if (
            modalSesiones &&
            btnCerrarModalSesiones
        ) {

            btnCerrarModalSesiones.addEventListener(
                "click",
                cerrarModalSesiones
            );

        }


        function cerrarModalSesiones() {

            modalSesiones.classList.remove(
                "activo"
            );


            document.body.style.overflow =
                "";

        }


        /*
        -------------------------------------------------
        LISTA DE SESIONES
        -------------------------------------------------
        */

        function cargarSesiones() {

            const lista =
                document.getElementById(
                    "listaSesiones"
                );


            const idiomaActual =
                document.getElementById(
                    "idioma"
                ).value;


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


        /*
        =================================================
        CERRAR MODALES AL HACER CLIC FUERA
        =================================================
        */

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


        /*
        =================================================
        ESC PARA CERRAR MODALES
        =================================================
        */

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


    /*
    =====================================================
    EJECUTAR CUANDO CARGUE LA PÁGINA
    =====================================================
    */

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