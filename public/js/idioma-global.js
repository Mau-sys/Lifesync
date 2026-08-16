(function () {

    "use strict";


    const CLAVE_IDIOMA =
        "lifesync_idioma";

    const CLAVE_CONFIGURACION =
        "lifeSyncConfiguracion";


    /*
    =========================================================
    TRADUCCIONES PRINCIPALES
    =========================================================
    */

    const traducciones = {

        es: {

            volver: "← Volver",
            regresar: "Regresar",
            cerrar: "Cerrar",
            cancelar: "Cancelar",
            guardar: "Guardar",
            guardarCambios: "Guardar cambios",
            reiniciar: "Reiniciar",
            eliminar: "Eliminar",
            editar: "Editar",
            cambiar: "Cambiar",
            administrar: "Administrar",
            aceptar: "Aceptar",
            continuar: "Continuar",
            siguiente: "Siguiente",
            anterior: "Anterior",

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
            sincronizacionAutomatica: "Sincronización automática",

            descripcionSincronizacion:
                "Guarda automáticamente tus hábitos, estadísticas, rachas y configuraciones para mantenerlas disponibles en todos tus dispositivos.",

            estadoSincronizacionTitulo:
                "Estado de sincronización",

            textoSincronizada:
                "Tu información se encuentra respaldada correctamente.",

            textoNoSincronizada:
                "La sincronización automática está desactivada.",

            sincronizada:
                "● Sincronizada",

            noSincronizada:
                "● No sincronizada",

            seguridadTitulo: "🔒 Seguridad",

            cambiarContrasena:
                "Cambiar contraseña",

            descripcionContrasena:
                "Actualiza tu contraseña para proteger tu cuenta.",

            sesionesActivas:
                "Sesiones activas",

            descripcionSesiones:
                "Consulta y administra los dispositivos donde has iniciado sesión.",

            cambiarContrasenaDescripcion:
                "Introduce tu contraseña actual y después la nueva contraseña.",

            contrasenaActual:
                "Contraseña actual",

            nuevaContrasena:
                "Nueva contraseña",

            confirmarContrasena:
                "Confirmar nueva contraseña",

            descripcionModalSesiones:
                "Aquí aparecerán los dispositivos donde hayas iniciado sesión. También podrás cerrar cualquier sesión de forma segura.",

            guardarConfiguracionExito:
                "Los cambios se guardaron correctamente.",

            camposIncompletos:
                "Completa todos los campos.",

            contrasenaCorta:
                "La nueva contraseña debe tener al menos 8 caracteres.",

            contrasenasNoCoinciden:
                "Las nuevas contraseñas no coinciden.",

            cambioContrasenaPendiente:
                "El formulario está listo. El cambio real de contraseña se conectará cuando esté disponible el sistema de cuentas.",

            dispositivoActual:
                "Dispositivo actual",

            estaSesion:
                "Esta sesión",

            otrasSesiones:
                "Las demás sesiones aparecerán aquí cuando el sistema de cuentas esté conectado.",

            sincronizacionDesactivada:
                "La sincronización automática está desactivada.",

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

            estaSemana:
                "Esta semana",

            esteMes:
                "Este mes",

            esteAnio:
                "Este año",

            categorias:
                "Categorías",

            habitosPersonalizados:
                "Hábitos personalizados",

            progreso:
                "Progreso",

            racha:
                "Racha",

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

            crearHabito:
                "Crear hábito personalizado",

            defineHabito:
                "Define tu hábito",

            personalizaHabito:
                "Personaliza un hábito que se adapte a tus objetivos.",

            nombreHabito:
                "Nombre del hábito",

            objetivo:
                "Objetivo",

            frecuencia:
                "Frecuencia",

            fechaInicio:
                "Fecha de inicio",

            fechaFin:
                "Fecha de finalización",

            diaria:
                "Diario",

            semanal:
                "Semanal",

            mensual:
                "Mensual",

            seleccionaOpcion:
                "Selecciona una opción",

            guardarHabito:
                "Guardar hábito",

            campoFechaAyuda:
                "Puedes dejarla vacía si el hábito no tiene fecha de finalización.",

            categoriasTitulo:
                "Categorías",

            categoriasDescripcion:
                "Selecciona una categoría para administrar tus hábitos.",

            abrirCategoria:
                "Abrir categoría",

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

            vistaPreviaCategoria:
                "Vista previa de una categoría",

            perfil:
                "Perfil",

            informacionPersonal:
                "Información personal",

            cerrarSesion:
                "Cerrar sesión",

            saludMental:
                "Salud Mental",

            editarMeta:
                "Editar meta",

            deshabilitarHabito:
                "Deshabilitar hábito",

            pausas:
                "pausas",

            pausasPeriodo:
                "Pausas del periodo",

            agregarPausa:
                "+1 pausa",

            editarMetaTitulo:
                "Editar Meta de Salud Mental",

            frecuenciaMeta:
                "Frecuencia de la meta",

            diasActivos:
                "Selecciona los días activos",

            cantidadPausas:
                "Cantidad de pausas (Máx. 50)",

            duracionPausa:
                "Duración por pausa (Máx. 4 horas / 240 min)",

            minutos:
                "minutos",

            diariaTodosDias:
                "Diaria (Todos los días)",

            semanalMeta:
                "Semanal (Meta global para la semana)",

            personalizadaDias:
                "Personalizada (Días específicos)",

            notificacionHabitoCompletado:
                "¡Hábito completado!",

            notificacionRacha:
                "¡Felicidades! Has mantenido tu racha.",

            notificacionRecordatorio:
                "Es momento de completar tu hábito.",

            notificacionLogro:
                "¡Has conseguido un nuevo logro!",

            comunRegresar:
                "Regresar",

            comunCerrar:
                "Cerrar",

            comunCancelar:
                "Cancelar",

            comunGuardar:
                "Guardar",

            comunGuardarCambios:
                "Guardar cambios",

            comunReiniciar:
                "Reiniciar"

        },


        en: {

            volver: "← Back",
            regresar: "Back",
            cerrar: "Close",
            cancelar: "Cancel",
            guardar: "Save",
            guardarCambios: "Save changes",
            reiniciar: "Reset",
            eliminar: "Delete",
            editar: "Edit",
            cambiar: "Change",
            administrar: "Manage",
            aceptar: "Accept",
            continuar: "Continue",
            siguiente: "Next",
            anterior: "Previous",

            configuracion: "Settings",
            descripcionConfiguracion:
                "Customize how your account and application work.",

            apariencia: "🎨 Appearance",
            modoOscuro: "Dark mode",
            descripcionModoOscuro:
                "Enable the dark theme for a more comfortable experience at night.",

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

            textoSincronizada:
                "Your information is backed up correctly.",

            textoNoSincronizada:
                "Automatic synchronization is disabled.",

            sincronizada:
                "● Synchronized",

            noSincronizada:
                "● Not synchronized",

            seguridadTitulo:
                "🔒 Security",

            cambiarContrasena:
                "Change password",

            descripcionContrasena:
                "Update your password to protect your account.",

            sesionesActivas:
                "Active sessions",

            descripcionSesiones:
                "View and manage the devices where you are signed in.",

            cambiarContrasenaDescripcion:
                "Enter your current password and then your new password.",

            contrasenaActual:
                "Current password",

            nuevaContrasena:
                "New password",

            confirmarContrasena:
                "Confirm new password",

            descripcionModalSesiones:
                "Your signed-in devices will appear here. You will also be able to safely close any session.",

            guardarConfiguracionExito:
                "Changes saved successfully.",

            camposIncompletos:
                "Please complete all fields.",

            contrasenaCorta:
                "The new password must contain at least 8 characters.",

            contrasenasNoCoinciden:
                "The new passwords do not match.",

            cambioContrasenaPendiente:
                "The form is ready. The real password change will be connected when the account system is available.",

            dispositivoActual:
                "Current device",

            estaSesion:
                "This session",

            otrasSesiones:
                "Other sessions will appear here when the account system is connected.",

            sincronizacionDesactivada:
                "Automatic synchronization is disabled.",

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

            estaSemana:
                "This week",

            esteMes:
                "This month",

            esteAnio:
                "This year",

            categorias:
                "Categories",

            habitosPersonalizados:
                "Personalized habits",

            progreso:
                "Progress",

            racha:
                "Streak",

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

            crearHabito:
                "Create personalized habit",

            defineHabito:
                "Define your habit",

            personalizaHabito:
                "Customize a habit that fits your goals.",

            nombreHabito:
                "Habit name",

            objetivo:
                "Goal",

            frecuencia:
                "Frequency",

            fechaInicio:
                "Start date",

            fechaFin:
                "End date",

            diaria:
                "Daily",

            semanal:
                "Weekly",

            mensual:
                "Monthly",

            seleccionaOpcion:
                "Select an option",

            guardarHabito:
                "Save habit",

            campoFechaAyuda:
                "You can leave it empty if the habit has no end date.",

            categoriasTitulo:
                "Categories",

            categoriasDescripcion:
                "Select a category to manage your habits.",

            abrirCategoria:
                "Open category",

            nombreCategoria:
                "Category name",

            objetivoCategoria:
                "The selected habit's goal will appear here.",

            estadoHabito:
                "Habit status",

            progresoDiario:
                "Daily progress",

            registro:
                "Record",

            datosHabito:
                "The habit data will appear here automatically.",

            vistaPreviaCategoria:
                "Category preview",

            perfil:
                "Profile",

            informacionPersonal:
                "Personal information",

            cerrarSesion:
                "Log out",

            saludMental:
                "Mental Health",

            editarMeta:
                "Edit goal",

            deshabilitarHabito:
                "Disable habit",

            pausas:
                "breaks",

            pausasPeriodo:
                "Breaks for the period",

            agregarPausa:
                "+1 break",

            editarMetaTitulo:
                "Edit Mental Health Goal",

            frecuenciaMeta:
                "Goal frequency",

            diasActivos:
                "Select active days",

            cantidadPausas:
                "Number of breaks (Max. 50)",

            duracionPausa:
                "Duration per break (Max. 4 hours / 240 min)",

            minutos:
                "minutes",

            diariaTodosDias:
                "Daily (Every day)",

            semanalMeta:
                "Weekly (Overall goal for the week)",

            personalizadaDias:
                "Custom (Specific days)",

            notificacionHabitoCompletado:
                "Habit completed!",

            notificacionRacha:
                "Congratulations! You have maintained your streak.",

            notificacionRecordatorio:
                "It's time to complete your habit.",

            notificacionLogro:
                "You have earned a new achievement!",

            comunRegresar:
                "Back",

            comunCerrar:
                "Close",

            comunCancelar:
                "Cancel",

            comunGuardar:
                "Save",

            comunGuardarCambios:
                "Save changes",

            comunReiniciar:
                "Reset"

        }

    };


    /*
    =========================================================
    TEXTOS ANTIGUOS / TEXTOS ESCRITOS DIRECTAMENTE
    =========================================================
    */

    const textosAntiguos = {

        "Regresar":
            "Back",

        "Cerrar":
            "Close",

        "Cancelar":
            "Cancel",

        "Guardar":
            "Save",

        "Guardar cambios":
            "Save changes",

        "Reiniciar":
            "Reset",

        "Eliminar":
            "Delete",

        "Editar":
            "Edit",

        "Cambiar":
            "Change",

        "Administrar":
            "Manage",

        "Aceptar":
            "Accept",

        "Continuar":
            "Continue",

        "Siguiente":
            "Next",

        "Anterior":
            "Previous",

        "Configuración":
            "Settings",

        "Personaliza el funcionamiento de tu cuenta y de la aplicación.":
            "Customize how your account and application work.",

        "🎨 Apariencia":
            "🎨 Appearance",

        "Modo oscuro":
            "Dark mode",

        "Activa el tema oscuro para una experiencia más cómoda durante la noche.":
            "Enable the dark theme for a more comfortable experience at night.",

        "🔔 Notificaciones":
            "🔔 Notifications",

        "Recordatorios":
            "Reminders",

        "Recibe recordatorios para completar tus hábitos diarios.":
            "Receive reminders to complete your daily habits.",

        "Sonidos de la aplicación":
            "Application sounds",

        "Reproduce sonidos al completar hábitos, obtener logros y recibir notificaciones.":
            "Play sounds when completing habits, earning achievements, and receiving notifications.",

        "Correos electrónicos":
            "Emails",

        "Envía recordatorios importantes y resúmenes semanales a tu correo.":
            "Receive important reminders and weekly summaries by email.",

        "🌐 Idioma":
            "🌐 Language",

        "Selecciona el idioma":
            "Select language",

        "Español":
            "Spanish",

        "☁️ Sincronización":
            "☁️ Synchronization",

        "Sincronización automática":
            "Automatic synchronization",

        "Estado de sincronización":
            "Synchronization status",

        "🔒 Seguridad":
            "🔒 Security",

        "Cambiar contraseña":
            "Change password",

        "Actualiza tu contraseña para proteger tu cuenta.":
            "Update your password to protect your account.",

        "Sesiones activas":
            "Active sessions",

        "Consulta y administra los dispositivos donde has iniciado sesión.":
            "View and manage the devices where you are signed in.",

        "Estadísticas":
            "Statistics",

        "Consulta tu progreso y analiza el cumplimiento de tus hábitos.":
            "Check your progress and analyze your habit completion.",

        "Progreso general":
            "Overall progress",

        "Días en racha":
            "Streak days",

        "Hábitos completados":
            "Completed habits",

        "Categorías":
            "Categories",

        "Hábitos personalizados":
            "Personalized habits",

        "Progreso":
            "Progress",

        "Racha":
            "Streak",

        "Datos personales":
            "Personal information",

        "Foto de perfil":
            "Profile picture",

        "Cambiar foto":
            "Change photo",

        "Nombre de usuario":
            "Username",

        "Nombre completo":
            "Full name",

        "Correo electrónico":
            "Email address",

        "Fecha de nacimiento":
            "Date of birth",

        "Género":
            "Gender",

        "Seleccionar":
            "Select",

        "Femenino":
            "Female",

        "Masculino":
            "Male",

        "Prefiero no decirlo":
            "Prefer not to say",

        "Crear hábito personalizado":
            "Create personalized habit",

        "Define tu hábito":
            "Define your habit",

        "Personaliza un hábito que se adapte a tus objetivos.":
            "Customize a habit that fits your goals.",

        "Nombre del hábito":
            "Habit name",

        "Objetivo":
            "Goal",

        "Frecuencia":
            "Frequency",

        "Fecha de inicio":
            "Start date",

        "Fecha de finalización":
            "End date",

        "Diario":
            "Daily",

        "Semanal":
            "Weekly",

        "Mensual":
            "Monthly",

        "Selecciona una opción":
            "Select an option",

        "Guardar hábito":
            "Save habit",

        "Hidratación":
            "Hydration",

        "Alimentación":
            "Nutrition",

        "Salud Mental":
            "Mental Health",

        "Actividad Física":
            "Physical Activity",

        "Registro Académico":
            "Academic Habits",

        "Hábito Personalizado":
            "Personalized Habit",

        "Editar meta":
            "Edit goal",

        "Deshabilitar hábito":
            "Disable habit",

        "pausas":
            "breaks",

        "Pausas del periodo":
            "Breaks for the period",

        "+1 pausa":
            "+1 break",

        "minutos":
            "minutes",

        "Diaria (Todos los días)":
            "Daily (Every day)",

        "Semanal (Meta global para la semana)":
            "Weekly (Overall goal for the week)",

        "Personalizada (Días específicos)":
            "Custom (Specific days)",

        "Nueva Sesión":
            "New Session",

        "Actividad":
            "Activity",

        "Tiempo acumulado":
            "Accumulated time",

        "+1 sesión de estudio":
            "+1 study session",

        "Gimnasio":
            "Gym",

        "Correr":
            "Running",

        "Caminar":
            "Walking",

        "Yoga / Estiramiento":
            "Yoga / Stretching",

        "Ciclismo":
            "Cycling",

        "Natación":
            "Swimming",

        "+1 vaso":
            "+1 glass",

        "¡Meta alcanzada!":
            "Goal reached!",

        "Todos los días":
            "Every day",

        "Lunes a viernes":
            "Monday to Friday",

        "Solo una vez":
            "Once",

        "Personalizado":
            "Custom",

        "Sin categoría":
            "No category",

        "Eliminar recordatorio":
            "Delete reminder",

        "¿Quieres eliminar este recordatorio?":
            "Do you want to delete this reminder?",

        "Escribe un nombre para el recordatorio.":
            "Enter a name for the reminder.",

        "Selecciona una hora.":
            "Select a time.",

        "Selecciona la fecha del recordatorio.":
            "Select the reminder date.",

        "No se pudo guardar el recordatorio.":
            "The reminder could not be saved.",

        "No se pudo eliminar el recordatorio.":
            "The reminder could not be deleted.",

        "No tienes hábitos pendientes para hoy.":
            "You have no pending habits for today.",

        "hábito(s) pendiente(s)":
            "pending habit(s)",

        "No hay datos suficientes para mostrar la gráfica.":
            "There is not enough data to display the chart.",

        "Todavía no hay datos de categorías.":
            "There is no category data yet.",

        "Todavía no tienes hábitos personalizados.":
            "You do not have any personalized habits yet.",

        "Dispositivo desconocido":
            "Unknown device",

        "Sin información":
            "No information",

        "Inicio":
            "Start",

        "Último acceso":
            "Last access",

        "Cerrar sesión":
            "Log out",

        "No se pudieron cargar las sesiones.":
            "The sessions could not be loaded.",

        "No se pudo cerrar la sesión.":
            "The session could not be closed.",

        "¿Seguro que deseas cerrar sesión?":
            "Are you sure you want to log out?",

        "Cerrando sesión...":
            "Logging out...",

        "Iniciando sesión...":
            "Signing in...",

        "Registrando...":
            "Registering...",

        "Guardando...":
            "Saving...",

        "Completa todos los campos.":
            "Please complete all fields.",

        "Ingresa un correo electrónico válido.":
            "Enter a valid email address.",

        "El nombre no puede superar los 50 caracteres.":
            "The name cannot exceed 50 characters.",

        "La contraseña debe tener al menos 8 caracteres.":
            "The password must contain at least 8 characters.",

        "Las contraseñas no coinciden.":
            "The passwords do not match.",

        "Selecciona al menos una categoría.":
            "Select at least one category.",

        "El servidor devolvió una respuesta inesperada.":
            "The server returned an unexpected response.",

        "No se pudo conectar con el servidor. Inténtalo nuevamente.":
            "Could not connect to the server. Please try again.",

        "Guardar":
            "Save"

    };


    /*
    =========================================================
    CREAR MAPA INVERSO
    =========================================================
    */

    const mapaInverso =
        {};

    Object.keys(textosAntiguos)
        .forEach(function (espanol) {

            const ingles =
                textosAntiguos[espanol];

            mapaInverso[ingles] =
                espanol;

        });


    /*
    =========================================================
    OBTENER IDIOMA
    =========================================================
    */

    function obtenerIdioma() {

        const configuracionGuardada =
            localStorage.getItem(
                CLAVE_CONFIGURACION
            );

        if (configuracionGuardada) {

            try {

                const configuracion =
                    JSON.parse(
                        configuracionGuardada
                    );

                if (
                    configuracion &&
                    (
                        configuracion.idioma === "es" ||
                        configuracion.idioma === "en"
                    )
                ) {

                    return configuracion.idioma;

                }

            } catch (error) {

                console.warn(
                    "No se pudo leer la configuración de idioma."
                );

            }

        }


        const idiomaGuardado =
            localStorage.getItem(
                CLAVE_IDIOMA
            );

        return idiomaGuardado === "en"
            ? "en"
            : "es";
    }


    /*
    =========================================================
    GUARDAR IDIOMA
    =========================================================
    */

    function guardarIdioma(idioma) {

        const idiomaValido =
            idioma === "en"
                ? "en"
                : "es";


        localStorage.setItem(
            CLAVE_IDIOMA,
            idiomaValido
        );


        let configuracion =
            {};

        try {

            configuracion =
                JSON.parse(
                    localStorage.getItem(
                        CLAVE_CONFIGURACION
                    )
                ) || {};

        } catch (error) {

            configuracion =
                {};

        }


        configuracion.idioma =
            idiomaValido;


        localStorage.setItem(
            CLAVE_CONFIGURACION,
            JSON.stringify(
                configuracion
            )
        );


        return idiomaValido;
    }


    /*
    =========================================================
    TRADUCIR TEXTO ANTIGUO
    =========================================================
    */

    function traducirTextoAntiguo(idioma) {

        if (!document.body) {
            return;
        }


        const walker =
            document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT
            );


        const nodos =
            [];


        let nodo;


        while (
            nodo =
            walker.nextNode()
        ) {

            nodos.push(
                nodo
            );

        }


        nodos.forEach(
            function (texto) {

                let contenido =
                    texto.nodeValue.trim();


                if (!contenido) {
                    return;
                }


                /*
                Guardamos el texto original
                para poder volver de inglés
                a español.
                */

                if (
                    typeof texto
                        ._lifesyncOriginal
                    === "undefined"
                ) {

                    texto._lifesyncOriginal =
                        contenido;

                }


                let original =
                    texto._lifesyncOriginal;


                /*
                Si el texto actual ya está
                en inglés, buscamos su
                equivalente español.
                */

                if (
                    mapaInverso[
                        original
                    ]
                ) {

                    original =
                        mapaInverso[
                            original
                        ];

                }


                let traducido =
                    original;


                if (
                    idioma === "en" &&
                    textosAntiguos[
                        original
                    ]
                ) {

                    traducido =
                        textosAntiguos[
                            original
                        ];

                }


                if (
                    idioma === "es"
                ) {

                    traducido =
                        original;

                }


                if (
                    texto.nodeValue.trim()
                    !== traducido
                ) {

                    texto.nodeValue =
                        texto.nodeValue.replace(
                            contenido,
                            traducido
                        );

                }

            }
        );

    }


    /*
    =========================================================
    TRADUCIR ELEMENTOS DATA-I18N
    =========================================================
    */

    function traducirElemento(
        elemento,
        textos
    ) {

        if (!elemento) {
            return;
        }


        const clave =
            elemento.dataset.i18n;


        if (
            clave &&
            Object.prototype.hasOwnProperty.call(
                textos,
                clave
            )
        ) {

            elemento.textContent =
                textos[clave];

        }

    }


    /*
    =========================================================
    TRADUCIR ATRIBUTOS
    =========================================================
    */

    function traducirAtributos(
        elemento,
        textos
    ) {

        if (!elemento) {
            return;
        }


        const atributos =
            [
                "placeholder",
                "title",
                "aria-label"
            ];


        atributos.forEach(
            function (atributo) {

                const nombreData =
                    "i18n" +
                    atributo
                        .split("-")
                        .map(
                            function (parte) {

                                return (
                                    parte
                                        .charAt(0)
                                        .toUpperCase() +
                                    parte.slice(1)
                                );

                            }
                        )
                        .join("");


                const clave =
                    elemento.dataset[
                        nombreData
                    ];


                if (
                    clave &&
                    Object.prototype.hasOwnProperty.call(
                        textos,
                        clave
                    )
                ) {

                    elemento.setAttribute(
                        atributo,
                        textos[clave]
                    );

                }

            }
        );

    }


    /*
    =========================================================
    APLICAR IDIOMA GLOBAL
    =========================================================
    */

    function aplicarIdiomaGlobal(
        idioma
    ) {

        const idiomaValido =
            idioma === "en"
                ? "en"
                : "es";


        const textos =
            traducciones[
                idiomaValido
            ];


        document.documentElement.lang =
            idiomaValido;


        /*
        DATA-I18N
        */

        const elementos =
            document.querySelectorAll(
                "[data-i18n], [data-i18n-text]"
            );


        elementos.forEach(
            function (elemento) {

                traducirElemento(
                    elemento,
                    textos
                );

                traducirAtributos(
                    elemento,
                    textos
                );

            }
        );


        /*
        PLACEHOLDERS
        */

        document
            .querySelectorAll(
                "[data-i18n-placeholder]"
            )
            .forEach(
                function (elemento) {

                    const clave =
                        elemento.dataset
                            .i18nPlaceholder;


                    if (
                        Object.prototype.hasOwnProperty.call(
                            textos,
                            clave
                        )
                    ) {

                        elemento.placeholder =
                            textos[clave];

                    }

                }
            );


        /*
        TITLES
        */

        document
            .querySelectorAll(
                "[data-i18n-title]"
            )
            .forEach(
                function (elemento) {

                    const clave =
                        elemento.dataset
                            .i18nTitle;


                    if (
                        Object.prototype.hasOwnProperty.call(
                            textos,
                            clave
                        )
                    ) {

                        elemento.title =
                            textos[clave];

                    }

                }
            );


        /*
        ARIA LABELS
        */

        document
            .querySelectorAll(
                "[data-i18n-aria-label]"
            )
            .forEach(
                function (elemento) {

                    const clave =
                        elemento.dataset
                            .i18nAriaLabel;


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

                }
            );


        /*
        TEXTOS ANTIGUOS
        */

        traducirTextoAntiguo(
            idiomaValido
        );


        /*
        SELECTOR DE IDIOMA
        */

        const selectorIdioma =
            document.getElementById(
                "idioma"
            );


        if (selectorIdioma) {

            selectorIdioma.value =
                idiomaValido;

        }


        /*
        GUARDAR
        */

        guardarIdioma(
            idiomaValido
        );


        /*
        AVISAR A LOS DEMÁS JS
        */

        window.dispatchEvent(
            new CustomEvent(
                "lifesyncIdiomaCambiado",
                {
                    detail: {
                        idioma:
                            idiomaValido
                    }
                }
            )
        );

    }


    /*
    =========================================================
    TRADUCIR UNA CLAVE DESDE CUALQUIER JS
    =========================================================
    */

    function traducir(
        clave
    ) {

        const idioma =
            obtenerIdioma();


        if (
            traducciones[idioma] &&
            Object.prototype.hasOwnProperty.call(
                traducciones[idioma],
                clave
            )
        ) {

            return traducciones[
                idioma
            ][clave];

        }


        /*
        Permite que un JS pase
        directamente el texto español.
        */

        if (
            idioma === "en" &&
            textosAntiguos[clave]
        ) {

            return textosAntiguos[
                clave
            ];

        }


        if (
            idioma === "es" &&
            mapaInverso[clave]
        ) {

            return mapaInverso[
                clave
            ];

        }


        return clave;

    }


    /*
    =========================================================
    OBSERVADOR PARA TEXTOS CREADOS DINÁMICAMENTE
    =========================================================
    */

    let observador = null;


    function iniciarObservador() {

        if (
            observador ||
            !document.body
        ) {

            return;

        }


        observador =
            new MutationObserver(
                function (mutaciones) {

                    let hayCambios =
                        false;


                    mutaciones.forEach(
                        function (mutacion) {

                            if (
                                mutacion.type ===
                                "childList"
                            ) {

                                if (
                                    mutacion.addedNodes
                                        .length
                                ) {

                                    hayCambios =
                                        true;

                                }

                            }

                        }
                    );


                    if (hayCambios) {

                        setTimeout(
                            function () {

                                traducirTextoAntiguo(
                                    obtenerIdioma()
                                );

                            },
                            0
                        );

                    }

                }
            );


        observador.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

    }


    /*
    =========================================================
    EXPORTAR FUNCIONES
    =========================================================
    */

    window.aplicarIdiomaGlobal =
        aplicarIdiomaGlobal;


    window.obtenerIdiomaGlobal =
        obtenerIdioma;


    window.traducirLifeSync =
        traducir;


    /*
    =========================================================
    INICIO
    =========================================================
    */

    function iniciar() {

        aplicarIdiomaGlobal(
            obtenerIdioma()
        );


        iniciarObservador();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciar
        );

    } else {

        iniciar();

    }


    /*
    =========================================================
    CAMBIO DE IDIOMA
    =========================================================
    */

    window.addEventListener(
        "lifesyncIdiomaCambiado",
        function () {

            setTimeout(
                function () {

                    traducirTextoAntiguo(
                        obtenerIdioma()
                    );

                },
                0
            );

        }
    );

})();