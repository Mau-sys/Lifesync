/* =========================================================
   LIFESYNC — IDIOMA GLOBAL
   Español / English
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       IDIOMAS DISPONIBLES
       ===================================================== */

    const TRADUCCIONES = {

        es: {

            /* =================================================
               COMUN
               ================================================= */

            "comun.volver": "Volver",
            "comun.guardar": "Guardar",
            "comun.guardarCambios": "Guardar cambios",
            "comun.cancelar": "Cancelar",
            "comun.eliminar": "Eliminar",
            "comun.editar": "Editar",
            "comun.aceptar": "Aceptar",
            "comun.cerrar": "Cerrar",
            "comun.continuar": "Continuar",
            "comun.regresar": "Regresar",
            "comun.si": "Sí",
            "comun.no": "No",
            "comun.hoy": "Hoy",
            "comun.ayer": "Ayer",
            "comun.manana": "Mañana",
            "comun.diario": "Diario",
            "comun.semanal": "Semanal",
            "comun.mensual": "Mensual",
            "comun.cargando": "Cargando...",
            "comun.usuario": "Usuario",
            "comun.error": "Error",
            "comun.exito": "Éxito",
            "comun.sinDatos": "Sin datos",
            "comun.verMas": "Ver más",
            "comun.abrir": "Abrir",
            "comun.actualizar": "Actualizar",


            /* =================================================
               LOGIN
               ================================================= */

            "iniciarSesion": "Iniciar sesión",
            "iniciandoSesion": "Iniciando sesión...",
            "completaCampos": "Completa todos los campos.",
            "correoValido": "Ingresa un correo electrónico válido.",
            "credencialesIncorrectas": "El correo o la contraseña son incorrectos.",
            "servidorRespuestaInvalida": "El servidor devolvió una respuesta no válida.",
            "errorConexion": "No se pudo conectar con el servidor. Inténtalo nuevamente.",
            "loginGoogleProximamente": "El inicio de sesión con Google estará disponible próximamente.",
            "loginAppleProximamente": "El inicio de sesión con Apple estará disponible próximamente.",


            /* =================================================
               REGISTRO
               ================================================= */

            "registrarse": "Registrarse",
            "registrando": "Registrando...",
            "camposIncompletos": "Completa todos los campos.",
            "nombreMaximo": "El nombre no puede superar los 50 caracteres.",
            "contrasenaCorta": "La contraseña debe tener al menos 8 caracteres.",
            "contrasenasNoCoinciden": "Las contraseñas no coinciden.",
            "servidorRespuestaInvalida": "El servidor no devolvió una respuesta válida.",
            "noCompletarRegistro": "No se pudo completar el registro.",
            "registroGoogleProximamente": "El registro con Google estará disponible próximamente.",
            "registroAppleProximamente": "El registro con Apple estará disponible próximamente.",


            /* =================================================
               PREFERENCIAS
               ================================================= */

            "guardar": "Guardar",
            "guardando": "Guardando...",
            "seleccionaCategoria": "Selecciona al menos una categoría.",
            "seleccionaAlMenosUnaCategoria": "Selecciona al menos una categoría.",
            "errorRespuestaServidor": "El servidor devolvió una respuesta inesperada.",
            "servidorRespuestaInesperada": "El servidor devolvió una respuesta inesperada.",
            "noGuardarPreferencias": "No se pudieron guardar las preferencias.",
            "noSePudieronGuardarPreferencias": "No se pudieron guardar las preferencias.",


            /* =================================================
               INICIO
               ================================================= */

            "inicio.hola": "Hola",
            "inicio.usuario": "Usuario",
            "inicio.hoy": "Hoy",
            "inicio.buenosHabitos": "Buenos hábitos",
            "inicio.tusHabitos": "Tus hábitos",
            "inicio.habitosHoy": "Hábitos de hoy",
            "inicio.progreso": "Progreso",
            "inicio.progresoHoy": "Progreso de hoy",
            "inicio.verCategorias": "Ver categorías",
            "inicio.verEstadisticas": "Ver estadísticas",
            "inicio.verRachas": "Ver rachas",
            "inicio.sinHabitos": "No tienes hábitos para hoy.",
            "inicio.noHabitosPendientes": "No tienes hábitos pendientes para hoy.",
            "inicio.noSePudieronCargarHabitos": "No se pudieron cargar los hábitos.",
            "inicio.cargandoHabitos": "Cargando hábitos...",
            "inicio.completado": "Completado",
            "inicio.pendiente": "Pendiente",
            "inicio.completar": "Completar",
            "inicio.metaAlcanzada": "¡Meta alcanzada!",
            "inicio.bienHecho": "¡Bien hecho!",
            "inicio.continuar": "Continuar",


            /* =================================================
               PERFIL
               ================================================= */

            "perfil.titulo": "Perfil",
            "perfil.hola": "Hola",
            "perfil.datosPersonales": "Datos personales",
            "perfil.habitosPersonalizados": "Hábitos personalizados",
            "perfil.recordatorios": "Recordatorios",
            "perfil.estadisticas": "Estadísticas",
            "perfil.configuracion": "Configuración",
            "perfil.cerrarSesion": "Cerrar sesión",
            "perfil.cerrarSesionConfirmacion": "¿Quieres cerrar sesión?",
            "perfil.cerrandoSesion": "Cerrando sesión...",
            "perfil.noSePudoCargarPerfil": "No se pudo cargar el perfil.",
            "perfil.noSePudoCerrarSesion": "No se pudo cerrar la sesión.",
            "perfil.errorCerrarSesion": "No se pudo cerrar la sesión. Inténtalo nuevamente.",

            /* Claves utilizadas directamente por perfil.js */

            "usuario": "Usuario",
            "cerrarSesion": "Cerrar sesión",
            "cerrandoSesion": "Cerrando sesión...",
            "cerrarSesionConfirmacion": "¿Quieres cerrar sesión?",
            "noCargarPerfil": "No se pudo cargar el perfil.",
            "noSePudoCargarPerfil": "No se pudo cargar el perfil.",
            "noCerrarSesion": "No se pudo cerrar la sesión.",
            "noSePudoCerrarSesion": "No se pudo cerrar la sesión.",
            "errorCerrarSesion": "No se pudo cerrar la sesión. Inténtalo nuevamente.",


            /* =================================================
               CONFIGURACIÓN
               ================================================= */

            "configuracion.titulo": "Configuración",
            "configuracion.descripcion": "Personaliza LifeSync según tus preferencias.",
            "configuracion.apariencia": "Apariencia",
            "configuracion.modoOscuro": "Modo oscuro",
            "configuracion.descripcionModoOscuro": "Utiliza el tema oscuro para una experiencia más cómoda.",
            "configuracion.modoClaro": "Modo claro",
            "configuracion.modoSistema": "Usar configuración del sistema",

            "configuracion.notificacionesTitulo": "Notificaciones",
            "configuracion.recordatorios": "Recordatorios",
            "configuracion.descripcionRecordatorios": "Recibe recordatorios para mantener tus hábitos.",
            "configuracion.sonidos": "Sonidos",
            "configuracion.descripcionSonidos": "Reproduce sonidos cuando recibas una notificación.",
            "configuracion.correos": "Correos electrónicos",
            "configuracion.descripcionCorreos": "Recibe información y recordatorios por correo.",

            "configuracion.idiomaTitulo": "Idioma",
            "configuracion.seleccionarIdioma": "Seleccionar idioma",
            "configuracion.espanol": "Español",
            "configuracion.ingles": "Inglés",

            "configuracion.sincronizacionTitulo": "Sincronización",
            "configuracion.sincronizacionAutomatica": "Sincronización automática",
            "configuracion.descripcionSincronizacion": "Mantén tus datos sincronizados automáticamente.",
            "configuracion.estadoSincronizacionTitulo": "Estado de sincronización",
            "configuracion.sincronizado": "Sincronizado",
            "configuracion.sincronizando": "Sincronizando...",
            "configuracion.noSincronizado": "No sincronizado",
            "configuracion.informacionRespaldada": "Tu información está respaldada correctamente.",

            "configuracion.seguridadTitulo": "Seguridad",
            "configuracion.cambiarContrasena": "Cambiar contraseña",
            "configuracion.descripcionContrasena": "Actualiza tu contraseña para mantener tu cuenta segura.",
            "configuracion.cambiar": "Cambiar",
            "configuracion.sesionesActivas": "Sesiones activas",
            "configuracion.descripcionSesiones": "Administra los dispositivos donde has iniciado sesión.",
            "configuracion.administrar": "Administrar",

            "configuracion.guardar": "Guardar cambios",
            "configuracion.guardando": "Guardando...",
            "configuracion.cambiosGuardados": "Cambios guardados correctamente.",
            "configuracion.errorGuardar": "No se pudieron guardar los cambios.",


            /* =================================================
               ESTADÍSTICAS
               ================================================= */

            "estadisticas.titulo": "Estadísticas",
            "estadisticas.descripcion": "Consulta tu progreso y rendimiento.",
            "estadisticas.progresoGeneral": "Progreso general",
            "estadisticas.diasRacha": "Días de racha",
            "estadisticas.habitosCompletados": "Hábitos completados",
            "estadisticas.periodo": "Periodo",
            "estadisticas.semana": "Semana",
            "estadisticas.mes": "Mes",
            "estadisticas.ano": "Año",
            "estadisticas.categorias": "Categorías",
            "estadisticas.habitosPersonalizados": "Hábitos personalizados",
            "estadisticas.grafica": "Gráfica",
            "estadisticas.sinDatos": "No hay datos suficientes.",
            "estadisticas.servidorRespuestaInvalida": "El servidor devolvió una respuesta no válida.",
            "estadisticas.noEstadisticas": "No se pudieron cargar las estadísticas.",

            /* Claves utilizadas por estadísticas.js */

            "graficaSinDatos": "No hay datos suficientes para mostrar la gráfica.",
            "sinInformacion": "Sin información disponible.",
            "sinCategorias": "Todavía no hay datos de categorías.",
            "sinHabitosPersonalizados": "Todavía no tienes hábitos personalizados.",
            "noEstadisticas": "No se pudieron cargar las estadísticas.",
            "servidorRespuestaInvalida": "El servidor devolvió una respuesta no válida.",


            /* =================================================
               CREAR HÁBITO
               ================================================= */

            "crearHabito.tituloPagina": "LifeSync | Crear hábito personalizado",
            "crearHabito.descripcionMeta": "Crea un hábito personalizado en LifeSync.",
            "crearHabito.titulo": "Define tu hábito",
            "crearHabito.descripcion": "Personaliza un hábito que se adapte a tus objetivos.",
            "crearHabito.nombreHabito": "Nombre del hábito",
            "crearHabito.placeholderNombre": "Ej. Leer 20 páginas",
            "crearHabito.objetivo": "Objetivo",
            "crearHabito.placeholderObjetivo": "Describe el objetivo de tu hábito...",
            "crearHabito.frecuencia": "Frecuencia",
            "crearHabito.seleccionar": "Selecciona una opción",
            "crearHabito.diaria": "Diario",
            "crearHabito.semanal": "Semanal",
            "crearHabito.mensual": "Mensual",
            "crearHabito.fechaInicio": "Fecha de inicio",
            "crearHabito.fechaFin": "Fecha de finalización",
            "crearHabito.ayudaFechaFin": "Puedes dejarla vacía si el hábito no tiene fecha de finalización.",
            "crearHabito.guardar": "Guardar hábito",
            "crearHabito.guardando": "Guardando...",
            "crearHabito.camposObligatorios": "Completa todos los campos obligatorios.",
            "crearHabito.nombreMinimo": "El nombre del hábito debe tener al menos 2 caracteres.",
            "crearHabito.objetivoMinimo": "Describe brevemente el objetivo del hábito.",
            "crearHabito.fechaInvalida": "La fecha de finalización no puede ser anterior a la fecha de inicio.",
            "crearHabito.servidorInvalido": "El servidor devolvió una respuesta inválida.",
            "crearHabito.noGuardar": "No se pudo guardar el hábito.",


            /* =================================================
               CATEGORÍAS
               ================================================= */

            "categorias.descripcionMeta": "Categorías disponibles en LifeSync.",
            "categorias.titulo": "Categorías",
            "categorias.descripcion": "Selecciona una categoría para administrar tus hábitos.",
            "categorias.vistaPrevia": "Vista previa de una categoría",
            "categorias.iconoCategoria": "Icono de categoría",
            "categorias.nombreCategoria": "Nombre de la categoría",
            "categorias.objetivoEjemplo": "Aquí aparecerá el objetivo del hábito seleccionado por el usuario.",
            "categorias.estadoHabito": "Estado del hábito",
            "categorias.progresoDiario": "Progreso diario",
            "categorias.registro": "Registro",
            "categorias.datosHabito": "Aquí se mostrarán automáticamente los datos del hábito.",
            "categorias.abrirCategoria": "Abrir categoría",
            "categorias.cargando": "Cargando categorías...",
            "categorias.sinCategorias": "No tienes categorías activas.",
            "categorias.error": "No se pudieron cargar las categorías.",
            "categorias.hidratacion": "Hidratación",
            "categorias.alimentacion": "Alimentación",
            "categorias.saludMental": "Salud Mental",
            "categorias.actividadFisica": "Actividad Física",
            "categorias.registroAcademico": "Registro Académico",
            "categorias.habitoPersonalizado": "Hábito Personalizado",
            "categorias.completado": "Completado",
            "categorias.pendiente": "Pendiente",


            /* =================================================
               RACHAS
               ================================================= */

            "racha.titulo": "Rachas",
            "racha.descripcion": "Mantén tus hábitos y aumenta tus rachas.",
            "racha.constelacion": "Tu constelación",
            "racha.constelacionDescripcion": "Cada día que completas tus hábitos ayuda a construir tu constelación.",
            "racha.rachaActual": "Racha actual",
            "racha.dias": "días",
            "racha.resumen": "Resumen",
            "racha.mejorRacha": "Mejor racha",
            "racha.habitosCompletados": "Hábitos completados",
            "racha.categorias": "Rachas por categoría",
            "racha.historial": "Historial de rachas",
            "racha.verHistorial": "Ver historial",
            "racha.cerrar": "Cerrar",
            "racha.sinCategorias": "No hay categorías con rachas todavía.",
            "racha.sinHistorial": "No hay historial de rachas disponible.",
            "racha.sinDatos": "No hay datos disponibles.",
            "racha.cargando": "Cargando rachas...",
            "racha.error": "No se pudieron cargar las rachas.",
            "racha.hoy": "Hoy",
            "racha.ayer": "Ayer",
            "racha.mejor": "Mejor",
            "racha.actual": "Actual",
            "racha.progreso": "Progreso",
            "racha.historialFecha": "Fecha",
            "racha.historialRacha": "Racha",
            "racha.ninguna": "Ninguna racha",


            /* =================================================
               HIDRATACIÓN
               ================================================= */

            "hidratacion.titulo": "Hidratación",
            "hidratacion.objetivo": "Objetivo diario",
            "hidratacion.vasos": "vasos",
            "hidratacion.vaso": "vaso",
            "hidratacion.litros": "Litros",
            "hidratacion.porVaso": "por vaso",
            "hidratacion.agregarVaso": "+1 vaso",
            "hidratacion.metaAlcanzada": "¡Meta alcanzada!",
            "hidratacion.editarMeta": "Editar meta",
            "hidratacion.reiniciar": "Reiniciar",
            "hidratacion.reiniciarConfirmacion": "¿Quieres reiniciar la cuenta a 0?",
            "hidratacion.configurar": "Configurar hidratación",
            "hidratacion.cantidadVasos": "Cantidad de vasos",
            "hidratacion.capacidadVaso": "Capacidad del vaso",
            "hidratacion.guardar": "Guardar configuración",
            "hidratacion.vasosDia": "vasos al día",
            "hidratacion.mlVaso": "ml/vaso",
            "hidratacion.litrosDia": "Litros / día",
            "hidratacion.errorVasos": "Ingresa una cantidad de vasos válida.",
            "hidratacion.errorCapacidad": "Ingresa una capacidad de vaso válida.",


            /* =================================================
               ALIMENTACIÓN
               ================================================= */

            "alimentacion.titulo": "Alimentación",
            "alimentacion.objetivo": "Objetivo diario",
            "alimentacion.comidas": "Comidas",
            "alimentacion.comida": "Comida",
            "alimentacion.registrar": "Registrar comida",
            "alimentacion.completado": "Completado",
            "alimentacion.pendiente": "Pendiente",
            "alimentacion.metaAlcanzada": "¡Meta alcanzada!",
            "alimentacion.sinRegistros": "No hay registros todavía.",


            /* =================================================
               ACTIVIDAD FÍSICA
               ================================================= */

            "actividadFisica.titulo": "Actividad Física",
            "actividadFisica.objetivo": "Objetivo diario",
            "actividadFisica.tiempo": "Tiempo",
            "actividadFisica.minutos": "minutos",
            "actividadFisica.registrar": "Registrar actividad",
            "actividadFisica.completado": "Completado",
            "actividadFisica.pendiente": "Pendiente",
            "actividadFisica.sinRegistros": "No hay registros todavía.",


            /* =================================================
               SALUD MENTAL
               ================================================= */

            "saludMental.titulo": "Salud Mental",
            "saludMental.objetivo": "Objetivo",
            "saludMental.bienestar": "Bienestar",
            "saludMental.descanso": "Descanso",
            "saludMental.registrar": "Registrar",
            "saludMental.completado": "Completado",
            "saludMental.pendiente": "Pendiente",
            "saludMental.sinRegistros": "No hay registros todavía.",


            /* =================================================
               REGISTRO ACADÉMICO
               ================================================= */

            "registroAcademico.titulo": "Registro Académico",
            "registroAcademico.objetivo": "Objetivo académico",
            "registroAcademico.tarea": "Tarea",
            "registroAcademico.tareas": "Tareas",
            "registroAcademico.registrar": "Registrar tarea",
            "registroAcademico.completado": "Completado",
            "registroAcademico.pendiente": "Pendiente",
            "registroAcademico.sinRegistros": "No hay registros todavía.",


            /* =================================================
               HÁBITOS PERSONALIZADOS
               ================================================= */

            "personalizado.titulo": "Hábitos personalizados",
            "personalizado.descripcion": "Crea y administra tus hábitos personalizados.",
            "personalizado.nuevo": "Nuevo hábito",
            "personalizado.editar": "Editar hábito",
            "personalizado.eliminar": "Eliminar hábito",
            "personalizado.sinHabitos": "Todavía no tienes hábitos personalizados.",
            "personalizado.completado": "Completado",
            "personalizado.pendiente": "Pendiente",


            /* =================================================
               RECORDATORIOS
               ================================================= */

            "recordatorio.titulo": "Recordatorios",
            "recordatorio.descripcion": "Administra tus recordatorios.",
            "recordatorio.nuevo": "Nuevo recordatorio",
            "recordatorio.tituloCampo": "Título",
            "recordatorio.hora": "Hora",
            "recordatorio.repeticion": "Repetición",
            "recordatorio.diario": "Diario",
            "recordatorio.lunesViernes": "Lunes a viernes",
            "recordatorio.unaVez": "Una vez",
            "recordatorio.personalizado": "Personalizado",
            "recordatorio.mensaje": "Mensaje",
            "recordatorio.guardar": "Guardar recordatorio",
            "recordatorio.cancelar": "Cancelar",
            "recordatorio.editar": "Editar",
            "recordatorio.eliminar": "Eliminar",
            "recordatorio.sinRecordatorios": "No tienes recordatorios.",
            "recordatorio.activo": "Activo",
            "recordatorio.inactivo": "Inactivo",


            /* =================================================
               DATOS PERSONALES
               ================================================= */

            "datosPersonales.titulo": "Datos personales",
            "datosPersonales.usuario": "Usuario",
            "datosPersonales.nombreCompleto": "Nombre completo",
            "datosPersonales.correo": "Correo electrónico",
            "datosPersonales.fechaNacimiento": "Fecha de nacimiento",
            "datosPersonales.genero": "Género",
            "datosPersonales.femenino": "Femenino",
            "datosPersonales.masculino": "Masculino",
            "datosPersonales.otro": "Otro",
            "datosPersonales.contrasenaActual": "Contraseña actual",
            "datosPersonales.nuevaContrasena": "Nueva contraseña",
            "datosPersonales.confirmarContrasena": "Confirmar contraseña",
            "datosPersonales.foto": "Foto de perfil",
            "datosPersonales.guardar": "Guardar cambios",
            "datosPersonales.cancelar": "Cancelar",
            "datosPersonales.guardando": "Guardando...",
            "datosPersonales.cambiosGuardados": "Cambios guardados correctamente.",
            "datosPersonales.imagenValida": "Selecciona una imagen válida.",
            "datosPersonales.errorGuardar": "Ocurrió un error al guardar los cambios.",

        },


        /* =====================================================
           ENGLISH
           ===================================================== */

        en: {

            /* =================================================
               COMMON
               ================================================= */

            "comun.volver": "Back",
            "comun.guardar": "Save",
            "comun.guardarCambios": "Save changes",
            "comun.cancelar": "Cancel",
            "comun.eliminar": "Delete",
            "comun.editar": "Edit",
            "comun.aceptar": "Accept",
            "comun.cerrar": "Close",
            "comun.continuar": "Continue",
            "comun.regresar": "Back",
            "comun.si": "Yes",
            "comun.no": "No",
            "comun.hoy": "Today",
            "comun.ayer": "Yesterday",
            "comun.manana": "Tomorrow",
            "comun.diario": "Daily",
            "comun.semanal": "Weekly",
            "comun.mensual": "Monthly",
            "comun.cargando": "Loading...",
            "comun.usuario": "User",
            "comun.error": "Error",
            "comun.exito": "Success",
            "comun.sinDatos": "No data",
            "comun.verMas": "View more",
            "comun.abrir": "Open",
            "comun.actualizar": "Update",


            /* =================================================
               LOGIN
               ================================================= */

            "iniciarSesion": "Log in",
            "iniciandoSesion": "Logging in...",
            "completaCampos": "Complete all fields.",
            "correoValido": "Enter a valid email address.",
            "credencialesIncorrectas": "The email or password is incorrect.",
            "servidorRespuestaInvalida": "The server returned an invalid response.",
            "errorConexion": "Could not connect to the server. Please try again.",
            "loginGoogleProximamente": "Google login will be available soon.",
            "loginAppleProximamente": "Apple login will be available soon.",


            /* =================================================
               REGISTER
               ================================================= */

            "registrarse": "Sign up",
            "registrando": "Signing up...",
            "camposIncompletos": "Complete all fields.",
            "nombreMaximo": "The name cannot exceed 50 characters.",
            "contrasenaCorta": "The password must contain at least 8 characters.",
            "contrasenasNoCoinciden": "The passwords do not match.",
            "servidorRespuestaInvalida": "The server did not return a valid response.",
            "noCompletarRegistro": "The registration could not be completed.",
            "registroGoogleProximamente": "Google sign-up will be available soon.",
            "registroAppleProximamente": "Apple sign-up will be available soon.",


            /* =================================================
               PREFERENCES
               ================================================= */

            "guardar": "Save",
            "guardando": "Saving...",
            "seleccionaCategoria": "Select at least one category.",
            "seleccionaAlMenosUnaCategoria": "Select at least one category.",
            "errorRespuestaServidor": "The server returned an unexpected response.",
            "servidorRespuestaInesperada": "The server returned an unexpected response.",
            "noGuardarPreferencias": "The preferences could not be saved.",
            "noSePudieronGuardarPreferencias": "The preferences could not be saved.",


            /* =================================================
               HOME
               ================================================= */

            "inicio.hola": "Hello",
            "inicio.usuario": "User",
            "inicio.hoy": "Today",
            "inicio.buenosHabitos": "Good habits",
            "inicio.tusHabitos": "Your habits",
            "inicio.habitosHoy": "Today's habits",
            "inicio.progreso": "Progress",
            "inicio.progresoHoy": "Today's progress",
            "inicio.verCategorias": "View categories",
            "inicio.verEstadisticas": "View statistics",
            "inicio.verRachas": "View streaks",
            "inicio.sinHabitos": "You have no habits for today.",
            "inicio.noHabitosPendientes": "You have no pending habits for today.",
            "inicio.noSePudieronCargarHabitos": "The habits could not be loaded.",
            "inicio.cargandoHabitos": "Loading habits...",
            "inicio.completado": "Completed",
            "inicio.pendiente": "Pending",
            "inicio.completar": "Complete",
            "inicio.metaAlcanzada": "Goal reached!",
            "inicio.bienHecho": "Well done!",
            "inicio.continuar": "Continue",


            /* =================================================
               PROFILE
               ================================================= */

            "perfil.titulo": "Profile",
            "perfil.hola": "Hello",
            "perfil.datosPersonales": "Personal information",
            "perfil.habitosPersonalizados": "Custom habits",
            "perfil.recordatorios": "Reminders",
            "perfil.estadisticas": "Statistics",
            "perfil.configuracion": "Settings",
            "perfil.cerrarSesion": "Log out",
            "perfil.cerrarSesionConfirmacion": "Do you want to log out?",
            "perfil.cerrandoSesion": "Logging out...",
            "perfil.noSePudoCargarPerfil": "The profile could not be loaded.",
            "perfil.noSePudoCerrarSesion": "Could not log out.",
            "perfil.errorCerrarSesion": "Could not log out. Please try again.",

            "usuario": "User",
            "cerrarSesion": "Log out",
            "cerrandoSesion": "Logging out...",
            "cerrarSesionConfirmacion": "Do you want to log out?",
            "noCargarPerfil": "The profile could not be loaded.",
            "noSePudoCargarPerfil": "The profile could not be loaded.",
            "noCerrarSesion": "Could not log out.",
            "noSePudoCerrarSesion": "Could not log out.",
            "errorCerrarSesion": "Could not log out. Please try again.",


            /* =================================================
               SETTINGS
               ================================================= */

            "configuracion.titulo": "Settings",
            "configuracion.descripcion": "Customize LifeSync according to your preferences.",
            "configuracion.apariencia": "Appearance",
            "configuracion.modoOscuro": "Dark mode",
            "configuracion.descripcionModoOscuro": "Use dark mode for a more comfortable experience.",
            "configuracion.modoClaro": "Light mode",
            "configuracion.modoSistema": "Use system settings",

            "configuracion.notificacionesTitulo": "Notifications",
            "configuracion.recordatorios": "Reminders",
            "configuracion.descripcionRecordatorios": "Receive reminders to keep up with your habits.",
            "configuracion.sonidos": "Sounds",
            "configuracion.descripcionSonidos": "Play sounds when you receive a notification.",
            "configuracion.correos": "Email notifications",
            "configuracion.descripcionCorreos": "Receive information and reminders by email.",

            "configuracion.idiomaTitulo": "Language",
            "configuracion.seleccionarIdioma": "Select language",
            "configuracion.espanol": "Spanish",
            "configuracion.ingles": "English",

            "configuracion.sincronizacionTitulo": "Synchronization",
            "configuracion.sincronizacionAutomatica": "Automatic synchronization",
            "configuracion.descripcionSincronizacion": "Keep your data synchronized automatically.",
            "configuracion.estadoSincronizacionTitulo": "Synchronization status",
            "configuracion.sincronizado": "Synchronized",
            "configuracion.sincronizando": "Synchronizing...",
            "configuracion.noSincronizado": "Not synchronized",
            "configuracion.informacionRespaldada": "Your information is backed up correctly.",

            "configuracion.seguridadTitulo": "Security",
            "configuracion.cambiarContrasena": "Change password",
            "configuracion.descripcionContrasena": "Update your password to keep your account secure.",
            "configuracion.cambiar": "Change",
            "configuracion.sesionesActivas": "Active sessions",
            "configuracion.descripcionSesiones": "Manage the devices where you are signed in.",
            "configuracion.administrar": "Manage",

            "configuracion.guardar": "Save changes",
            "configuracion.guardando": "Saving...",
            "configuracion.cambiosGuardados": "Changes saved successfully.",
            "configuracion.errorGuardar": "The changes could not be saved.",


            /* =================================================
               STATISTICS
               ================================================= */

            "estadisticas.titulo": "Statistics",
            "estadisticas.descripcion": "Check your progress and performance.",
            "estadisticas.progresoGeneral": "Overall progress",
            "estadisticas.diasRacha": "Streak days",
            "estadisticas.habitosCompletados": "Completed habits",
            "estadisticas.periodo": "Period",
            "estadisticas.semana": "Week",
            "estadisticas.mes": "Month",
            "estadisticas.ano": "Year",
            "estadisticas.categorias": "Categories",
            "estadisticas.habitosPersonalizados": "Custom habits",
            "estadisticas.grafica": "Chart",
            "estadisticas.sinDatos": "There is not enough data.",
            "estadisticas.servidorRespuestaInvalida": "The server returned an invalid response.",
            "estadisticas.noEstadisticas": "The statistics could not be loaded.",

            "graficaSinDatos": "There is not enough data to display the chart.",
            "sinInformacion": "No information available.",
            "sinCategorias": "There is no category data yet.",
            "sinHabitosPersonalizados": "You do not have any custom habits yet.",
            "noEstadisticas": "The statistics could not be loaded.",
            "servidorRespuestaInvalida": "The server returned an invalid response.",


            /* =================================================
               CREATE HABIT
               ================================================= */

            "crearHabito.tituloPagina": "LifeSync | Create custom habit",
            "crearHabito.descripcionMeta": "Create a custom habit in LifeSync.",
            "crearHabito.titulo": "Define your habit",
            "crearHabito.descripcion": "Customize a habit that fits your goals.",
            "crearHabito.nombreHabito": "Habit name",
            "crearHabito.placeholderNombre": "E.g. Read 20 pages",
            "crearHabito.objetivo": "Goal",
            "crearHabito.placeholderObjetivo": "Describe your habit goal...",
            "crearHabito.frecuencia": "Frequency",
            "crearHabito.seleccionar": "Select an option",
            "crearHabito.diaria": "Daily",
            "crearHabito.semanal": "Weekly",
            "crearHabito.mensual": "Monthly",
            "crearHabito.fechaInicio": "Start date",
            "crearHabito.fechaFin": "End date",
            "crearHabito.ayudaFechaFin": "You can leave this empty if the habit has no end date.",
            "crearHabito.guardar": "Save habit",
            "crearHabito.guardando": "Saving...",
            "crearHabito.camposObligatorios": "Complete all required fields.",
            "crearHabito.nombreMinimo": "The habit name must contain at least 2 characters.",
            "crearHabito.objetivoMinimo": "Briefly describe the goal of the habit.",
            "crearHabito.fechaInvalida": "The end date cannot be earlier than the start date.",
            "crearHabito.servidorInvalido": "The server returned an invalid response.",
            "crearHabito.noGuardar": "The habit could not be saved.",


            /* =================================================
               CATEGORIES
               ================================================= */

            "categorias.descripcionMeta": "Categories available in LifeSync.",
            "categorias.titulo": "Categories",
            "categorias.descripcion": "Select a category to manage your habits.",
            "categorias.vistaPrevia": "Category preview",
            "categorias.iconoCategoria": "Category icon",
            "categorias.nombreCategoria": "Category name",
            "categorias.objetivoEjemplo": "The goal of the habit selected by the user will appear here.",
            "categorias.estadoHabito": "Habit status",
            "categorias.progresoDiario": "Daily progress",
            "categorias.registro": "Record",
            "categorias.datosHabito": "The habit data will appear here automatically.",
            "categorias.abrirCategoria": "Open category",
            "categorias.cargando": "Loading categories...",
            "categorias.sinCategorias": "You do not have any active categories.",
            "categorias.error": "The categories could not be loaded.",
            "categorias.hidratacion": "Hydration",
            "categorias.alimentacion": "Nutrition",
            "categorias.saludMental": "Mental Health",
            "categorias.actividadFisica": "Physical Activity",
            "categorias.registroAcademico": "Academic Habits",
            "categorias.habitoPersonalizado": "Custom Habit",
            "categorias.completado": "Completed",
            "categorias.pendiente": "Pending",


            /* =================================================
               STREAKS
               ================================================= */

            "racha.titulo": "Streaks",
            "racha.descripcion": "Keep up your habits and increase your streaks.",
            "racha.constelacion": "Your constellation",
            "racha.constelacionDescripcion": "Every day you complete your habits helps build your constellation.",
            "racha.rachaActual": "Current streak",
            "racha.dias": "days",
            "racha.resumen": "Summary",
            "racha.mejorRacha": "Best streak",
            "racha.habitosCompletados": "Completed habits",
            "racha.categorias": "Streaks by category",
            "racha.historial": "Streak history",
            "racha.verHistorial": "View history",
            "racha.cerrar": "Close",
            "racha.sinCategorias": "There are no category streaks yet.",
            "racha.sinHistorial": "There is no streak history available.",
            "racha.sinDatos": "There is no data available.",
            "racha.cargando": "Loading streaks...",
            "racha.error": "The streaks could not be loaded.",
            "racha.hoy": "Today",
            "racha.ayer": "Yesterday",
            "racha.mejor": "Best",
            "racha.actual": "Current",
            "racha.progreso": "Progress",
            "racha.historialFecha": "Date",
            "racha.historialRacha": "Streak",
            "racha.ninguna": "No streak",


            /* =================================================
               HYDRATION
               ================================================= */

            "hidratacion.titulo": "Hydration",
            "hidratacion.objetivo": "Daily goal",
            "hidratacion.vasos": "glasses",
            "hidratacion.vaso": "glass",
            "hidratacion.litros": "Liters",
            "hidratacion.porVaso": "per glass",
            "hidratacion.agregarVaso": "+1 glass",
            "hidratacion.metaAlcanzada": "Goal reached!",
            "hidratacion.editarMeta": "Edit goal",
            "hidratacion.reiniciar": "Reset",
            "hidratacion.reiniciarConfirmacion": "Do you want to reset the count to 0?",
            "hidratacion.configurar": "Hydration settings",
            "hidratacion.cantidadVasos": "Number of glasses",
            "hidratacion.capacidadVaso": "Glass capacity",
            "hidratacion.guardar": "Save settings",
            "hidratacion.vasosDia": "glasses per day",
            "hidratacion.mlVaso": "ml/glass",
            "hidratacion.litrosDia": "Liters / day",
            "hidratacion.errorVasos": "Enter a valid number of glasses.",
            "hidratacion.errorCapacidad": "Enter a valid glass capacity.",


            /* =================================================
               NUTRITION
               ================================================= */

            "alimentacion.titulo": "Nutrition",
            "alimentacion.objetivo": "Daily goal",
            "alimentacion.comidas": "Meals",
            "alimentacion.comida": "Meal",
            "alimentacion.registrar": "Log meal",
            "alimentacion.completado": "Completed",
            "alimentacion.pendiente": "Pending",
            "alimentacion.metaAlcanzada": "Goal reached!",
            "alimentacion.sinRegistros": "There are no records yet.",


            /* =================================================
               PHYSICAL ACTIVITY
               ================================================= */

            "actividadFisica.titulo": "Physical Activity",
            "actividadFisica.objetivo": "Daily goal",
            "actividadFisica.tiempo": "Time",
            "actividadFisica.minutos": "minutes",
            "actividadFisica.registrar": "Log activity",
            "actividadFisica.completado": "Completed",
            "actividadFisica.pendiente": "Pending",
            "actividadFisica.sinRegistros": "There are no records yet.",


            /* =================================================
               MENTAL HEALTH
               ================================================= */

            "saludMental.titulo": "Mental Health",
            "saludMental.objetivo": "Goal",
            "saludMental.bienestar": "Well-being",
            "saludMental.descanso": "Rest",
            "saludMental.registrar": "Log",
            "saludMental.completado": "Completed",
            "saludMental.pendiente": "Pending",
            "saludMental.sinRegistros": "There are no records yet.",


            /* =================================================
               ACADEMIC HABITS
               ================================================= */

            "registroAcademico.titulo": "Academic Habits",
            "registroAcademico.objetivo": "Academic goal",
            "registroAcademico.tarea": "Task",
            "registroAcademico.tareas": "Tasks",
            "registroAcademico.registrar": "Log task",
            "registroAcademico.completado": "Completed",
            "registroAcademico.pendiente": "Pending",
            "registroAcademico.sinRegistros": "There are no records yet.",


            /* =================================================
               CUSTOM HABITS
               ================================================= */

            "personalizado.titulo": "Custom habits",
            "personalizado.descripcion": "Create and manage your custom habits.",
            "personalizado.nuevo": "New habit",
            "personalizado.editar": "Edit habit",
            "personalizado.eliminar": "Delete habit",
            "personalizado.sinHabitos": "You do not have any custom habits yet.",
            "personalizado.completado": "Completed",
            "personalizado.pendiente": "Pending",


            /* =================================================
               REMINDERS
               ================================================= */

            "recordatorio.titulo": "Reminders",
            "recordatorio.descripcion": "Manage your reminders.",
            "recordatorio.nuevo": "New reminder",
            "recordatorio.tituloCampo": "Title",
            "recordatorio.hora": "Time",
            "recordatorio.repeticion": "Repeat",
            "recordatorio.diario": "Daily",
            "recordatorio.lunesViernes": "Monday to Friday",
            "recordatorio.unaVez": "Once",
            "recordatorio.personalizado": "Custom",
            "recordatorio.mensaje": "Message",
            "recordatorio.guardar": "Save reminder",
            "recordatorio.cancelar": "Cancel",
            "recordatorio.editar": "Edit",
            "recordatorio.eliminar": "Delete",
            "recordatorio.sinRecordatorios": "You have no reminders.",
            "recordatorio.activo": "Active",
            "recordatorio.inactivo": "Inactive",


            /* =================================================
               PERSONAL INFORMATION
               ================================================= */

            "datosPersonales.titulo": "Personal information",
            "datosPersonales.usuario": "Username",
            "datosPersonales.nombreCompleto": "Full name",
            "datosPersonales.correo": "Email address",
            "datosPersonales.fechaNacimiento": "Date of birth",
            "datosPersonales.genero": "Gender",
            "datosPersonales.femenino": "Female",
            "datosPersonales.masculino": "Male",
            "datosPersonales.otro": "Other",
            "datosPersonales.contrasenaActual": "Current password",
            "datosPersonales.nuevaContrasena": "New password",
            "datosPersonales.confirmarContrasena": "Confirm password",
            "datosPersonales.foto": "Profile picture",
            "datosPersonales.guardar": "Save changes",
            "datosPersonales.cancelar": "Cancel",
            "datosPersonales.guardando": "Saving...",
            "datosPersonales.cambiosGuardados": "Changes saved successfully.",
            "datosPersonales.imagenValida": "Select a valid image.",
            "datosPersonales.errorGuardar": "An error occurred while saving the changes."

        }

    };


    /* =====================================================
       IDIOMA POR DEFECTO
       ===================================================== */

    const IDIOMA_DEFAULT = "es";


    /* =====================================================
       OBTENER IDIOMA GUARDADO
       ===================================================== */

    function obtenerIdioma() {

        const guardado =
            localStorage.getItem(
                "lifeSyncIdioma"
            );

        if (
            guardado === "en" ||
            guardado === "es"
        ) {

            return guardado;

        }


        const configuracion =
            localStorage.getItem(
                "lifeSyncConfiguracion"
            );


        if (configuracion) {

            try {

                const datos =
                    JSON.parse(
                        configuracion
                    );


                if (
                    datos.idioma === "en" ||
                    datos.idioma === "es"
                ) {

                    return datos.idioma;

                }

            } catch (error) {

                console.warn(
                    "No se pudo leer el idioma guardado.",
                    error
                );

            }

        }


        return IDIOMA_DEFAULT;

    }


    let idiomaActual =
        obtenerIdioma();


    /* =====================================================
       TRADUCIR UNA CLAVE
       ===================================================== */

    function traducirLifeSync(clave) {

        if (
            typeof clave !== "string"
        ) {

            return clave;

        }


        const idioma =
            TRADUCCIONES[idiomaActual];


        if (
            idioma &&
            Object.prototype.hasOwnProperty.call(
                idioma,
                clave
            )
        ) {

            return idioma[clave];

        }


        /*
         * Si la clave no existe, no mostramos
         * "inicio.hola" o "categorias.titulo".
         *
         * Buscamos primero en español.
         */

        if (
            TRADUCCIONES.es &&
            Object.prototype.hasOwnProperty.call(
                TRADUCCIONES.es,
                clave
            )
        ) {

            return TRADUCCIONES.es[clave];

        }


        /*
         * Último respaldo:
         * devolvemos la clave solamente si realmente
         * no existe ninguna traducción.
         */

        return clave;

    }


    /* =====================================================
       APLICAR DATA-I18N
       ===================================================== */

    function aplicarTraducciones() {

        const elementos =
            document.querySelectorAll(
                "[data-i18n]"
            );


        elementos.forEach(
            (elemento) => {

                const clave =
                    elemento.getAttribute(
                        "data-i18n"
                    );


                if (!clave) {
                    return;
                }


                elemento.textContent =
                    traducirLifeSync(
                        clave
                    );

            }
        );


        /* =================================================
           PLACEHOLDERS
           ================================================= */

        const placeholders =
            document.querySelectorAll(
                "[data-i18n-placeholder]"
            );


        placeholders.forEach(
            (elemento) => {

                const clave =
                    elemento.getAttribute(
                        "data-i18n-placeholder"
                    );


                if (!clave) {
                    return;
                }


                elemento.setAttribute(
                    "placeholder",
                    traducirLifeSync(
                        clave
                    )
                );

            }
        );


        /* =================================================
           ALT DE IMÁGENES
           ================================================= */

        const imagenes =
            document.querySelectorAll(
                "[data-i18n-alt]"
            );


        imagenes.forEach(
            (imagen) => {

                const clave =
                    imagen.getAttribute(
                        "data-i18n-alt"
                    );


                if (!clave) {
                    return;
                }


                imagen.setAttribute(
                    "alt",
                    traducirLifeSync(
                        clave
                    )
                );

            }
        );


        /* =================================================
           TITLE
           ================================================= */

        const titulos =
            document.querySelectorAll(
                "[data-i18n-title]"
            );


        titulos.forEach(
            (elemento) => {

                const clave =
                    elemento.getAttribute(
                        "data-i18n-title"
                    );


                if (!clave) {
                    return;
                }


                elemento.setAttribute(
                    "title",
                    traducirLifeSync(
                        clave
                    )
                );

            }
        );


        /* =================================================
           LANG DEL HTML
           ================================================= */

        document.documentElement.lang =
            idiomaActual;


        /* =================================================
           ACTUALIZAR SELECTOR DE IDIOMA
           ================================================= */

        const selectores =
            document.querySelectorAll(
                "#idioma, #selectorIdioma, [name='idioma']"
            );


        selectores.forEach(
            (selector) => {

                if (
                    selector.value !==
                    idiomaActual
                ) {

                    selector.value =
                        idiomaActual;

                }

            }
        );

    }


    /* =====================================================
       CAMBIAR IDIOMA
       ===================================================== */

    function cambiarIdioma(nuevoIdioma) {

        if (
            nuevoIdioma !== "es" &&
            nuevoIdioma !== "en"
        ) {

            nuevoIdioma =
                IDIOMA_DEFAULT;

        }


        idiomaActual =
            nuevoIdioma;


        localStorage.setItem(
            "lifeSyncIdioma",
            idiomaActual
        );


        /*
         * Guardamos también el idioma dentro de
         * lifeSyncConfiguracion para mantener compatibilidad
         * con la configuración existente.
         */

        let configuracion = {};

        const configuracionGuardada =
            localStorage.getItem(
                "lifeSyncConfiguracion"
            );


        if (configuracionGuardada) {

            try {

                configuracion =
                    JSON.parse(
                        configuracionGuardada
                    ) || {};

            } catch (error) {

                configuracion = {};

            }

        }


        configuracion.idioma =
            idiomaActual;


        localStorage.setItem(
            "lifeSyncConfiguracion",
            JSON.stringify(
                configuracion
            )
        );


        aplicarTraducciones();


        /*
         * Avisamos a los demás JS de la aplicación.
         *
         * Por ejemplo:
         * inicio.js
         * estadisticas.js
         * rachas.js
         * categorias.js
         * perfil.js
         * preferencias.js
         */

        window.dispatchEvent(
            new CustomEvent(
                "lifesyncIdiomaCambiado",
                {
                    detail: {
                        idioma:
                            idiomaActual
                    }
                }
            )
        );

    }


    /* =====================================================
       OBTENER IDIOMA ACTUAL
       ===================================================== */

    function obtenerIdiomaActual() {

        return idiomaActual;

    }


    /* =====================================================
       EXPONER FUNCIONES GLOBALMENTE
       ===================================================== */

    window.traducirLifeSync =
        traducirLifeSync;


    window.cambiarIdiomaLifeSync =
        cambiarIdioma;


    window.obtenerIdiomaLifeSync =
        obtenerIdiomaActual;


    window.aplicarIdiomaLifeSync =
        aplicarTraducciones;


    /* =====================================================
       SELECTORES DE IDIOMA
       ===================================================== */

    document.addEventListener(
        "change",
        (evento) => {

            const elemento =
                evento.target;


            if (!elemento) {
                return;
            }


            if (
                elemento.matches(
                    "#idioma, #selectorIdioma, [name='idioma']"
                )
            ) {

                cambiarIdioma(
                    elemento.value
                );

            }

        }
    );


    /* =====================================================
       INICIALIZACIÓN
       ===================================================== */

    function iniciarIdioma() {

        aplicarTraducciones();

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


})();