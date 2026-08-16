(function () {

    "use strict";

    const CLAVE_IDIOMA = "lifesync_idioma";

    const traducciones = {

        es: {

            /* =========================
               CONFIGURACIÓN
               ========================= */

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
                "Cerrar",

            /* =========================
               CATEGORÍAS
               ========================= */

            categorias: "Categorías",

            descripcionCategorias:
                "Selecciona una categoría para administrar tus hábitos.",

            regresar: "← Regresar",

            vistaPreviaCategoria:
                "Vista previa de una categoría",

            nombreCategoria:
                "Nombre de la categoría",

            objetivoCategoria:
                "Aquí aparecerá el objetivo del hábito seleccionado por el usuario.",

            estadoHabito:
                "Estado del hábito",

            progresoDiario:
                "Progreso diario",

            registro:
                "Registro",

            datosHabito:
                "Aquí se mostrarán automáticamente los datos del hábito.",

            abrirCategoria:
                "Abrir categoría",

            hidratacion:
                "Hidratación",

            nutricion:
                "Alimentación",

            saludMental:
                "Salud Mental",

            actividadFisica:
                "Actividad Física",

            habitosAcademicos:
                "Hábitos Académicos",

            habitoPersonalizado:
                "Hábito personalizado",

            /* =========================
               DATOS PERSONALES
               ========================= */

            datosPersonales:
                "Datos personales",

            fotoPerfil:
                "Foto de perfil",

            cambiarFoto:
                "Cambiar foto",

            nombreUsuario:
                "Nombre de usuario",

            nombreCompleto:
                "Nombre completo",

            correoElectronico:
                "Correo electrónico",

            fechaNacimiento:
                "Fecha de nacimiento",

            genero:
                "Género",

            seleccionar:
                "Seleccionar",

            femenino:
                "Femenino",

            masculino:
                "Masculino",

            prefieroNoDecirlo:
                "Prefiero no decirlo",

            seguridad:
                "Seguridad",

            guardarCambiosDatos:
                "Guardar cambios",

            cancelarDatos:
                "Cancelar",

            /* =========================
               CREAR HÁBITO
               ========================= */

            definirHabito:
                "Define tu hábito",

            descripcionCrearHabito:
                "Personaliza un hábito que se adapte a tus objetivos.",

            nombreHabito:
                "Nombre del hábito",

            ejemploHabito:
                "Ej. Leer 20 páginas",

            objetivo:
                "Objetivo",

            descripcionObjetivo:
                "Describe el objetivo de tu hábito...",

            frecuencia:
                "Frecuencia",

            seleccionarOpcion:
                "Selecciona una opción",

            diario:
                "Diario",

            semanal:
                "Semanal",

            mensual:
                "Mensual",

            fechaInicio:
                "Fecha de inicio",

            fechaFinalizacion:
                "Fecha de finalización",

            fechaFinalizacionAyuda:
                "Puedes dejarla vacía si el hábito no tiene fecha de finalización.",

            guardarHabito:
                "Guardar hábito",

            /* =========================
               ESTADÍSTICAS
               ========================= */

            estadisticas:
                "Estadísticas",

            descripcionEstadisticas:
                "Consulta tu progreso y analiza el cumplimiento de tus hábitos.",

            progresoGeneral:
                "Progreso general",

            diasRacha:
                "Días en racha",

            habitosCompletados:
                "Hábitos completados",

            mostrarEstadisticas:
                "Mostrar estadísticas de:",

            estaSemana:
                "Esta semana",

            esteMes:
                "Este mes",

            esteAnio:
                "Este año",

            categoriasEstadisticas:
                "Categorías",

            habitosPersonalizados:
                "Hábitos personalizados",

            /* =========================
               MENSAJES
               ========================= */

            cambiosGuardados:
                "Los cambios se guardaron correctamente.",

            completaTodosCampos:
                "Completa todos los campos.",

            contrasenaMinima:
                "La nueva contraseña debe tener al menos 8 caracteres.",

            contrasenasNoCoinciden:
                "Las nuevas contraseñas no coinciden.",

            sistemaCuentas:
                "El formulario está listo. El cambio real de contraseña se conectará cuando esté disponible el sistema de cuentas.",

            dispositivoActual:
                "Dispositivo actual",

            estaSesion:
                "Esta sesión",

            otrasSesiones:
                "Las demás sesiones aparecerán aquí cuando el sistema de cuentas esté conectado."

        },


        en: {

            /* =========================
               SETTINGS
               ========================= */

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
                "Close",

            /* =========================
               CATEGORIES
               ========================= */

            categorias:
                "Categories",

            descripcionCategorias:
                "Select a category to manage your habits.",

            regresar:
                "← Back",

            vistaPreviaCategoria:
                "Category preview",

            nombreCategoria:
                "Category name",

            objetivoCategoria:
                "The objective of the selected habit will appear here.",

            estadoHabito:
                "Habit status",

            progresoDiario:
                "Daily progress",

            registro:
                "Record",

            datosHabito:
                "The habit data will be displayed here automatically.",

            abrirCategoria:
                "Open category",

            hidratacion:
                "Hydration",

            nutricion:
                "Nutrition",

            saludMental:
                "Mental Health",

            actividadFisica:
                "Physical Activity",

            habitosAcademicos:
                "Academic Habits",

            habitoPersonalizado:
                "Custom habit",

            /* =========================
               PERSONAL DATA
               ========================= */

            datosPersonales:
                "Personal information",

            fotoPerfil:
                "Profile picture",

            cambiarFoto:
                "Change photo",

            nombreUsuario:
                "Username",

            nombreCompleto:
                "Full name",

            correoElectronico:
                "Email address",

            fechaNacimiento:
                "Date of birth",

            genero:
                "Gender",

            seleccionar:
                "Select",

            femenino:
                "Female",

            masculino:
                "Male",

            prefieroNoDecirlo:
                "Prefer not to say",

            seguridad:
                "Security",

            guardarCambiosDatos:
                "Save changes",

            cancelarDatos:
                "Cancel",

            /* =========================
               CREATE HABIT
               ========================= */

            definirHabito:
                "Define your habit",

            descripcionCrearHabito:
                "Customize a habit that fits your goals.",

            nombreHabito:
                "Habit name",

            ejemploHabito:
                "E.g. Read 20 pages",

            objetivo:
                "Goal",

            descripcionObjetivo:
                "Describe the goal of your habit...",

            frecuencia:
                "Frequency",

            seleccionarOpcion:
                "Select an option",

            diario:
                "Daily",

            semanal:
                "Weekly",

            mensual:
                "Monthly",

            fechaInicio:
                "Start date",

            fechaFinalizacion:
                "End date",

            fechaFinalizacionAyuda:
                "You can leave it empty if the habit has no end date.",

            guardarHabito:
                "Save habit",

            /* =========================
               STATISTICS
               ========================= */

            estadisticas:
                "Statistics",

            descripcionEstadisticas:
                "Check your progress and analyze your habit completion.",

            progresoGeneral:
                "Overall progress",

            diasRacha:
                "Streak days",

            habitosCompletados:
                "Completed habits",

            mostrarEstadisticas:
                "Show statistics for:",

            estaSemana:
                "This week",

            esteMes:
                "This month",

            esteAnio:
                "This year",

            categoriasEstadisticas:
                "Categories",

            habitosPersonalizados:
                "Custom habits",

            /* =========================
               MESSAGES
               ========================= */

            cambiosGuardados:
                "Changes saved successfully.",

            completaTodosCampos:
                "Please complete all fields.",

            contrasenaMinima:
                "The new password must contain at least 8 characters.",

            contrasenasNoCoinciden:
                "The new passwords do not match.",

            sistemaCuentas:
                "The form is ready. The real password change will be connected when the account system is available.",

            dispositivoActual:
                "Current device",

            estaSesion:
                "This session",

            otrasSesiones:
                "Other sessions will appear here when the account system is connected."

        }

    };


    /* =====================================================
       OBTENER IDIOMA
       ===================================================== */

    function obtenerIdioma() {

        const guardado =
            localStorage.getItem(CLAVE_IDIOMA);

        return guardado === "en"
            ? "en"
            : "es";
    }


    /* =====================================================
       APLICAR IDIOMA
       ===================================================== */

    function aplicarIdiomaGlobal(idioma) {

        if (!traducciones[idioma]) {
            idioma = "es";
        }


        const textos =
            traducciones[idioma];


        document.documentElement.lang =
            idioma;


        /* -----------------------------------------------
           TEXTOS
           ----------------------------------------------- */

        document
            .querySelectorAll("[data-i18n]")
            .forEach(function (elemento) {

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


        /* -----------------------------------------------
           PLACEHOLDERS
           ----------------------------------------------- */

        document
            .querySelectorAll("[data-i18n-placeholder]")
            .forEach(function (elemento) {

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


        /* -----------------------------------------------
           ARIA LABEL
           ----------------------------------------------- */

        document
            .querySelectorAll("[data-i18n-aria-label]")
            .forEach(function (elemento) {

                const clave =
                    elemento.dataset.i18nAriaLabel;


                if (
                    Object.prototype.hasOwnProperty.call(
                        textos,
                        clave
                    )
                ) {

                    elemento.setAttribute(
                        "aria-label",
                        textos[clave]
                    );

                }

            });


        /* -----------------------------------------------
           TITLE
           ----------------------------------------------- */

        document
            .querySelectorAll("[data-i18n-title]")
            .forEach(function (elemento) {

                const clave =
                    elemento.dataset.i18nTitle;


                if (
                    Object.prototype.hasOwnProperty.call(
                        textos,
                        clave
                    )
                ) {

                    elemento.setAttribute(
                        "title",
                        textos[clave]
                    );

                }

            });


        /* -----------------------------------------------
           GUARDAR
           ----------------------------------------------- */

        localStorage.setItem(
            CLAVE_IDIOMA,
            idioma
        );


        /* -----------------------------------------------
           SINCRONIZAR CONFIGURACIÓN
           ----------------------------------------------- */

        const CLAVE_CONFIG =
            "lifeSyncConfiguracion";


        const configuracionGuardada =
            localStorage.getItem(CLAVE_CONFIG);


        if (configuracionGuardada) {

            try {

                const configuracion =
                    JSON.parse(configuracionGuardada);


                configuracion.idioma =
                    idioma;


                localStorage.setItem(
                    CLAVE_CONFIG,
                    JSON.stringify(configuracion)
                );

            } catch (error) {

                console.warn(
                    "No se pudo sincronizar el idioma con la configuración.",
                    error
                );

            }

        }


        /* -----------------------------------------------
           AVISAR A TODA LA APLICACIÓN
           ----------------------------------------------- */

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


    /* =====================================================
       OBTENER TEXTO
       ===================================================== */

    function obtenerTraduccion(clave, idioma) {

        idioma =
            idioma || obtenerIdioma();


        if (
            traducciones[idioma] &&
            Object.prototype.hasOwnProperty.call(
                traducciones[idioma],
                clave
            )
        ) {

            return traducciones[idioma][clave];

        }


        return clave;
    }


    /* =====================================================
       EXPONER FUNCIONES
       ===================================================== */

    window.aplicarIdiomaGlobal =
        aplicarIdiomaGlobal;


    window.obtenerIdiomaGlobal =
        obtenerIdioma;


    window.obtenerTraduccionGlobal =
        obtenerTraduccion;


    /* =====================================================
       CARGAR AL ABRIR CUALQUIER PÁGINA
       ===================================================== */

    function iniciarIdioma() {

        aplicarIdiomaGlobal(
            obtenerIdioma()
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciarIdioma
        );

    } else {

        iniciarIdioma();

    }


    /* =====================================================
       SI CAMBIA DESDE OTRA PESTAÑA
       ===================================================== */

    window.addEventListener(
        "storage",
        function (evento) {

            if (
                evento.key !== CLAVE_IDIOMA
            ) {

                return;

            }


            const nuevoIdioma =
                evento.newValue === "en"
                    ? "en"
                    : "es";


            aplicarIdiomaGlobal(
                nuevoIdioma
            );

        }
    );


})();