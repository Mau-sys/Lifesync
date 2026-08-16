(function () {
    "use strict";

    const CLAVE_IDIOMA = "lifeSyncIdioma";

    const traducciones = {

        es: {

            // GENERALES
            volver: "← Volver",
            regresar: "Regresar",
            guardar: "Guardar",
            cancelar: "Cancelar",
            cerrar: "Cerrar",
            cambiar: "Cambiar",
            administrar: "Administrar",
            editar: "Editar",
            eliminar: "Eliminar",
            aceptar: "Aceptar",
            confirmar: "Confirmar",
            guardarCambios: "Guardar cambios",

            // CONFIGURACIÓN
            configuracion: "Configuración",
            descripcionConfiguracion:
                "Personaliza el funcionamiento de tu cuenta y de la aplicación.",

            apariencia: "🎨 Apariencia",
            modoOscuro: "Modo oscuro",
            descripcionModoOscuro:
                "Activa el tema oscuro para una experiencia más cómoda durante la noche.",

            notificacionesTitulo: "🔔 Notificaciones",
            recordatorios: "Recordatorios",
            descripcionRecordatorios:
                "Recibe recordatorios para completar tus hábitos diarios.",

            sonidos: "Sonidos de la aplicación",
            descripcionSonidos:
                "Reproduce sonidos al completar hábitos, obtener logros y recibir notificaciones.",

            correos: "Correos electrónicos",
            descripcionCorreos:
                "Envía recordatorios importantes y resúmenes semanales a tu correo.",

            idiomaTitulo: "🌐 Idioma",
            seleccionarIdioma: "Selecciona el idioma",
            espanol: "Español",
            ingles: "English",

            sincronizacionTitulo: "☁️ Sincronización",
            sincronizacionAutomatica:
                "Sincronización automática",
            descripcionSincronizacion:
                "Guarda automáticamente tus hábitos, estadísticas, rachas y configuraciones para mantenerlas disponibles en todos tus dispositivos.",

            estadoSincronizacionTitulo:
                "Estado de sincronización",

            sincronizada:
                "● Sincronizada",

            noSincronizada:
                "● No sincronizada",

            textoSincronizada:
                "Tu información se encuentra respaldada correctamente.",

            textoNoSincronizada:
                "La sincronización automática está desactivada.",

            seguridadTitulo: "🔒 Seguridad",

            cambiarContrasena:
                "Cambiar contraseña",

            descripcionContrasena:
                "Actualiza tu contraseña para proteger tu cuenta.",

            sesionesActivas:
                "Sesiones activas",

            descripcionSesiones:
                "Consulta y administra los dispositivos donde has iniciado sesión.",

            introducirContrasenas:
                "Introduce tu contraseña actual y después la nueva contraseña.",

            contrasenaActual:
                "Contraseña actual",

            nuevaContrasena:
                "Nueva contraseña",

            confirmarContrasena:
                "Confirmar nueva contraseña",

            descripcionModalSesiones:
                "Aquí aparecerán los dispositivos donde hayas iniciado sesión. También podrás cerrar cualquier sesión de forma segura.",

            // MENSAJES
            cambiosGuardados:
                "Los cambios se guardaron correctamente.",

            completaCampos:
                "Completa todos los campos.",

            contrasenaMinima:
                "La nueva contraseña debe tener al menos 8 caracteres.",

            contrasenasNoCoinciden:
                "Las nuevas contraseñas no coinciden.",

            formularioListo:
                "El formulario está listo. El cambio real de contraseña se conectará cuando esté disponible el sistema de cuentas.",

            // HÁBITOS / INICIO
            sinHabitosPendientes:
                "No tienes hábitos pendientes para hoy.",

            habitoPersonalizado:
                "Hábito Personalizado",

            habitosPendientes:
                "hábitos pendientes",

            habitoPendiente:
                "hábito pendiente",

            // NOTIFICACIONES
            notificacion:
                "Notificación",

            noLeida:
                "No leída",

            todoAlDia:
                "Todo está al día",

            descripcionSinNotificaciones:
                "Aquí aparecerán tus recordatorios, logros, rachas, hábitos completados y avisos de LifeSync.",

            errorNotificaciones:
                "No se pudieron cargar las notificaciones",

            intentaNuevamente:
                "Intenta nuevamente más tarde.",

            // ACCIONES
            reiniciar:
                "Reiniciar",

            nuevaSesion:
                "Nueva sesión",

            actividad:
                "Actividad",

            minutos:
                "minutos",

            // VALIDACIONES
            especificaHoras:
                "Por favor especifica las horas de inicio y fin para",

            horaInicioAnterior:
                "La hora de inicio debe ser anterior a la hora de fin.",

            incongruencia:
                "Incongruencia: el horario se traslapa o es anterior al horario anterior.",

            // FECHAS
            hoy:
                "Hoy",

            ayer:
                "Ayer",

            manana:
                "Mañana"
        },


        en: {

            // GENERAL
            volver: "← Back",
            regresar: "Back",
            guardar: "Save",
            cancelar: "Cancel",
            cerrar: "Close",
            cambiar: "Change",
            administrar: "Manage",
            editar: "Edit",
            eliminar: "Delete",
            aceptar: "Accept",
            confirmar: "Confirm",
            guardarCambios: "Save changes",

            // SETTINGS
            configuracion: "Settings",
            descripcionConfiguracion:
                "Customize how your account and application work.",

            apariencia: "🎨 Appearance",
            modoOscuro: "Dark mode",
            descripcionModoOscuro:
                "Enable dark mode for a more comfortable experience at night.",

            notificacionesTitulo: "🔔 Notifications",
            recordatorios: "Reminders",
            descripcionRecordatorios:
                "Receive reminders to complete your daily habits.",

            sonidos: "Application sounds",
            descripcionSonidos:
                "Play sounds when completing habits, earning achievements, and receiving notifications.",

            correos: "Emails",
            descripcionCorreos:
                "Receive important reminders and weekly summaries by email.",

            idiomaTitulo: "🌐 Language",
            seleccionarIdioma: "Select language",
            espanol: "Spanish",
            ingles: "English",

            sincronizacionTitulo: "☁️ Synchronization",
            sincronizacionAutomatica:
                "Automatic synchronization",

            descripcionSincronizacion:
                "Automatically save your habits, statistics, streaks, and settings to keep them available across your devices.",

            estadoSincronizacionTitulo:
                "Synchronization status",

            sincronizada:
                "● Synchronized",

            noSincronizada:
                "● Not synchronized",

            textoSincronizada:
                "Your information is backed up correctly.",

            textoNoSincronizada:
                "Automatic synchronization is disabled.",

            seguridadTitulo: "🔒 Security",

            cambiarContrasena:
                "Change password",

            descripcionContrasena:
                "Update your password to protect your account.",

            sesionesActivas:
                "Active sessions",

            descripcionSesiones:
                "View and manage the devices where you are signed in.",

            introducirContrasenas:
                "Enter your current password and then your new password.",

            contrasenaActual:
                "Current password",

            nuevaContrasena:
                "New password",

            confirmarContrasena:
                "Confirm new password",

            descripcionModalSesiones:
                "Your signed-in devices will appear here. You will also be able to safely close any session.",

            // MESSAGES
            cambiosGuardados:
                "Changes saved successfully.",

            completaCampos:
                "Please complete all fields.",

            contrasenaMinima:
                "The new password must contain at least 8 characters.",

            contrasenasNoCoinciden:
                "The new passwords do not match.",

            formularioListo:
                "The form is ready. The real password change will be connected when the account system is available.",

            // HABITS / HOME
            sinHabitosPendientes:
                "You have no pending habits for today.",

            habitoPersonalizado:
                "Custom Habit",

            habitosPendientes:
                "pending habits",

            habitoPendiente:
                "pending habit",

            // NOTIFICATIONS
            notificacion:
                "Notification",

            noLeida:
                "Unread",

            todoAlDia:
                "Everything is up to date",

            descripcionSinNotificaciones:
                "Your reminders, achievements, streaks, completed habits, and LifeSync notices will appear here.",

            errorNotificaciones:
                "Notifications could not be loaded",

            intentaNuevamente:
                "Please try again later.",

            // ACTIONS
            reiniciar:
                "Reset",

            nuevaSesion:
                "New session",

            actividad:
                "Activity",

            minutos:
                "minutes",

            // VALIDATIONS
            especificaHoras:
                "Please specify the start and end times for",

            horaInicioAnterior:
                "The start time must be earlier than the end time.",

            incongruencia:
                "Inconsistency: the schedule overlaps with or comes before the previous schedule.",

            // DATES
            hoy:
                "Today",

            ayer:
                "Yesterday",

            manana:
                "Tomorrow"
        }
    };


    function obtenerIdioma() {

        const guardado =
            localStorage.getItem(CLAVE_IDIOMA);

        if (guardado === "en") {
            return "en";
        }

        return "es";
    }


    function traducir(clave) {

        const idioma =
            obtenerIdioma();

        return (
            traducciones[idioma]?.[clave] ??
            traducciones.es[clave] ??
            clave
        );
    }


    function aplicarIdioma() {

        const idioma =
            obtenerIdioma();

        document.documentElement.lang =
            idioma;

        document
            .querySelectorAll("[data-i18n]")
            .forEach(elemento => {

                const clave =
                    elemento.dataset.i18n;

                const texto =
                    traducir(clave);

                if (texto) {
                    elemento.textContent =
                        texto;
                }
            });


        document
            .querySelectorAll("[data-i18n-placeholder]")
            .forEach(elemento => {

                const clave =
                    elemento.dataset.i18nPlaceholder;

                elemento.placeholder =
                    traducir(clave);
            });


        document
            .querySelectorAll("[data-i18n-title]")
            .forEach(elemento => {

                const clave =
                    elemento.dataset.i18nTitle;

                elemento.title =
                    traducir(clave);
            });


        document
            .querySelectorAll("[data-i18n-aria-label]")
            .forEach(elemento => {

                const clave =
                    elemento.dataset.i18nAriaLabel;

                elemento.setAttribute(
                    "aria-label",
                    traducir(clave)
                );
            });
    }


    function establecerIdioma(idioma) {

        if (
            idioma !== "es" &&
            idioma !== "en"
        ) {
            idioma = "es";
        }

        localStorage.setItem(
            CLAVE_IDIOMA,
            idioma
        );

        aplicarIdioma();

        document.dispatchEvent(
            new CustomEvent(
                "lifeSyncIdiomaCambiado",
                {
                    detail: {
                        idioma: idioma
                    }
                }
            )
        );
    }


    window.LifeSyncIdioma = {

        obtener: obtenerIdioma,

        traducir: traducir,

        cambiar: establecerIdioma,

        aplicar: aplicarIdioma,

        traducciones: traducciones
    };


    window.traducirLifeSync =
        traducir;


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            aplicarIdioma();

        }
    );

})();