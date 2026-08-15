(function () {

    "use strict";


    const CLAVE_IDIOMA =
        "lifesync_idioma";


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

            noSincronizada:
                "● No sincronizada",

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

            cambiarContrasenaDescripcion:
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

            noSincronizada:
                "● Not synchronized",

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

            cambiarContrasenaDescripcion:
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


    function obtenerIdioma() {

        const idioma =
            localStorage.getItem(
                CLAVE_IDIOMA
            );


        return idioma === "en"
            ? "en"
            : "es";

    }


    function aplicarIdiomaGlobal(idioma) {

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

        const atributos =
            document.querySelectorAll(
                "[data-i18n-placeholder]"
            );


        atributos.forEach(function (elemento) {

            const clave =
                elemento.dataset.i18nPlaceholder;


            if (
                Object.prototype.hasOwnProperty.call(
                    textos,
                    clave
                )
            ) {

                elemento.placeholder =
                    textos[clave];

            }

        });


        localStorage.setItem(
            CLAVE_IDIOMA,
            idioma
        );


        window.dispatchEvent(
            new CustomEvent(
                "lifesyncIdiomaCambiado",
                {
                    detail: {
                        idioma: idioma
                    }
                }
            )
        );

    }


    window.aplicarIdiomaGlobal =
        aplicarIdiomaGlobal;


    window.obtenerIdiomaGlobal =
        obtenerIdioma;


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            aplicarIdiomaGlobal(
                obtenerIdioma()
            );

        }
    );


})();