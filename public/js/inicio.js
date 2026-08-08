document.addEventListener("DOMContentLoaded", () => {

    const btnNotificaciones =
        document.getElementById("btnNotificaciones");

    const panelNotificaciones =
        document.getElementById("panelNotificaciones");

    const overlayNotificaciones =
        document.getElementById("overlayNotificaciones");

    const cerrarPanel =
        document.getElementById("cerrarPanel");

    const listaNotificaciones =
        document.getElementById("listaNotificaciones");

    const contadorNotificaciones =
        document.getElementById("contadorNotificaciones");

    const nombreUsuario =
        document.getElementById("nombreUsuario");

    const fechaActual =
        document.getElementById("fechaActual");

    const fotoPerfil =
        document.getElementById("fotoPerfil");


    function abrirNotificaciones() {

        if (!panelNotificaciones) {
            return;
        }

        panelNotificaciones.classList.remove("oculto");

        if (overlayNotificaciones) {
            overlayNotificaciones.classList.remove("oculto");
        }

        panelNotificaciones.setAttribute(
            "aria-hidden",
            "false"
        );

        if (btnNotificaciones) {
            btnNotificaciones.setAttribute(
                "aria-expanded",
                "true"
            );
        }

        document.body.classList.add(
            "panel-notificaciones-abierto"
        );

        cargarNotificaciones();

    }


    function cerrarNotificaciones() {

        if (!panelNotificaciones) {
            return;
        }

        panelNotificaciones.classList.add("oculto");

        if (overlayNotificaciones) {
            overlayNotificaciones.classList.add("oculto");
        }

        panelNotificaciones.setAttribute(
            "aria-hidden",
            "true"
        );

        if (btnNotificaciones) {
            btnNotificaciones.setAttribute(
                "aria-expanded",
                "false"
            );
        }

        document.body.classList.remove(
            "panel-notificaciones-abierto"
        );

    }


    if (btnNotificaciones) {

        btnNotificaciones.addEventListener(
            "click",
            () => {

                const estaOculto =
                    panelNotificaciones.classList.contains(
                        "oculto"
                    );

                if (estaOculto) {

                    abrirNotificaciones();

                } else {

                    cerrarNotificaciones();

                }

            }
        );

    }


    if (cerrarPanel) {

        cerrarPanel.addEventListener(
            "click",
            cerrarNotificaciones
        );

    }


    if (overlayNotificaciones) {

        overlayNotificaciones.addEventListener(
            "click",
            cerrarNotificaciones
        );

    }


    document.addEventListener(
        "keydown",
        (evento) => {

            if (
                evento.key === "Escape" &&
                panelNotificaciones &&
                !panelNotificaciones.classList.contains(
                    "oculto"
                )
            ) {

                cerrarNotificaciones();

            }

        }
    );


    async function cargarNotificaciones() {

        try {

            const respuesta =
                await fetch(
                    "auth/inicio.php",
                    {
                        method: "GET",
                        cache: "no-cache"
                    }
                );


            if (!respuesta.ok) {

                throw new Error(
                    "No se pudieron cargar las notificaciones."
                );

            }


            const resultado =
                await respuesta.json();


            if (!resultado.exito) {

                mostrarErrorNotificaciones(
                    resultado.mensaje
                );

                return;

            }


            actualizarContador(
                resultado.notificaciones_no_leidas
            );


            mostrarNotificaciones(
                resultado.notificaciones
            );


        } catch (error) {

            console.error(
                "Error al cargar notificaciones:",
                error
            );

        }

    }


    function actualizarContador(cantidad) {

        const numero =
            Number(cantidad) || 0;


        if (!contadorNotificaciones) {
            return;
        }


        contadorNotificaciones.textContent =
            numero > 99
                ? "99+"
                : numero;


        if (numero > 0) {

            contadorNotificaciones.classList.add(
                "activo"
            );

            if (btnNotificaciones) {

                btnNotificaciones.classList.add(
                    "tiene-notificaciones"
                );

            }

        } else {

            contadorNotificaciones.classList.remove(
                "activo"
            );

            if (btnNotificaciones) {

                btnNotificaciones.classList.remove(
                    "tiene-notificaciones"
                );

            }

        }

    }


    function mostrarNotificaciones(
        notificaciones
    ) {

        if (!listaNotificaciones) {
            return;
        }


        listaNotificaciones.innerHTML = "";


        if (
            !Array.isArray(notificaciones) ||
            notificaciones.length === 0
        ) {

            mostrarSinNotificaciones();

            return;

        }


        notificaciones.forEach(
            (notificacion) => {

                const tarjeta =
                    crearNotificacion(
                        notificacion
                    );

                listaNotificaciones.appendChild(
                    tarjeta
                );

            }
        );

    }


    function crearNotificacion(
        notificacion
    ) {

        const articulo =
            document.createElement("article");

        articulo.className =
            "notificacion-item";


        const estaLeida =
            notificacion.leida === true ||
            Number(notificacion.leida) === 1;


        if (!estaLeida) {

            articulo.classList.add(
                "notificacion-no-leida"
            );

        }


        const contenido =
            document.createElement("div");

        contenido.className =
            "notificacion-contenido";


        const encabezado =
            document.createElement("div");

        encabezado.className =
            "notificacion-titulo";


        const titulo =
            document.createElement("h3");

        titulo.textContent =
            notificacion.titulo ||
            "Notificación";


        encabezado.appendChild(
            titulo
        );


        if (!estaLeida) {

            const punto =
                document.createElement("span");

            punto.className =
                "punto-notificacion";

            punto.setAttribute(
                "aria-label",
                "No leída"
            );

            encabezado.appendChild(
                punto
            );

        }


        const mensaje =
            document.createElement("p");

        mensaje.textContent =
            notificacion.mensaje ||
            "";


        const fecha =
            document.createElement("time");

        fecha.textContent =
            notificacion.fecha_formateada ||
            "";


        contenido.appendChild(
            encabezado
        );

        contenido.appendChild(
            mensaje
        );

        contenido.appendChild(
            fecha
        );


        articulo.appendChild(
            contenido
        );


        return articulo;

    }


    function mostrarSinNotificaciones() {

        if (!listaNotificaciones) {
            return;
        }


        const contenedor =
            document.createElement("div");

        contenedor.className =
            "sin-notificaciones";


        const imagen =
            document.createElement("img");

        imagen.src =
            "img/Campana.png";

        imagen.alt =
            "Sin notificaciones";


        const titulo =
            document.createElement("h3");

        titulo.textContent =
            "Todo está al día";


        const texto =
            document.createElement("p");

        texto.textContent =
            "Aquí aparecerán tus recordatorios, logros, rachas, hábitos completados y avisos de LifeSync.";


        contenedor.appendChild(
            imagen
        );

        contenedor.appendChild(
            titulo
        );

        contenedor.appendChild(
            texto
        );


        listaNotificaciones.appendChild(
            contenedor
        );

    }


    function mostrarErrorNotificaciones(
        mensaje
    ) {

        if (!listaNotificaciones) {
            return;
        }


        listaNotificaciones.innerHTML = "";


        const contenedor =
            document.createElement("div");

        contenedor.className =
            "sin-notificaciones";


        const titulo =
            document.createElement("h3");

        titulo.textContent =
            "No se pudieron cargar las notificaciones";


        const texto =
            document.createElement("p");

        texto.textContent =
            mensaje ||
            "Intenta nuevamente más tarde.";


        contenedor.appendChild(
            titulo
        );

        contenedor.appendChild(
            texto
        );


        listaNotificaciones.appendChild(
            contenedor
        );

    }


    async function marcarNotificacionesLeidas() {

        try {

            const respuesta =
                await fetch(
                    "auth/notificaciones-leer.php",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            if (!respuesta.ok) {
                return;
            }


            const resultado =
                await respuesta.json();


            if (!resultado.exito) {

                console.error(
                    resultado.mensaje
                );

                return;

            }


            actualizarContador(0);


            setTimeout(
                cargarNotificaciones,
                300
            );


        } catch (error) {

            console.error(
                "Error al marcar notificaciones:",
                error
            );

        }

    }


    function formatearFecha(fecha) {

        if (!fecha) {
            return "";
        }


        const fechaConvertida =
            new Date(
                String(fecha).replace(
                    " ",
                    "T"
                )
            );


        if (
            Number.isNaN(
                fechaConvertida.getTime()
            )
        ) {

            return fecha;

        }


        return fechaConvertida.toLocaleString(
            "es-ES",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    function mostrarFechaActual() {

        if (!fechaActual) {
            return;
        }


        const ahora =
            new Date();


        fechaActual.textContent =
            ahora.toLocaleDateString(
                "es-ES",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    }


    async function cargarDatosUsuario() {

        if (!nombreUsuario) {
            return;
        }


        try {

            const respuesta =
                await fetch(
                    "auth/usuario.php",
                    {
                        method: "GET",
                        cache: "no-cache"
                    }
                );


            if (!respuesta.ok) {
                return;
            }


            const resultado =
                await respuesta.json();


            if (
                resultado.exito &&
                resultado.usuario
            ) {

                nombreUsuario.textContent =
                    resultado.usuario.nombre ||
                    resultado.usuario.nombre_usuario ||
                    "Usuario";


                if (
                    fotoPerfil &&
                    resultado.usuario.foto
                ) {

                    fotoPerfil.src =
                        resultado.usuario.foto;

                }

            }

        } catch (error) {

            console.error(
                "No se pudo cargar el usuario:",
                error
            );

        }

    }


    async function cargarResumenInicio() {

        try {

            const respuesta =
                await fetch(
                    "auth/inicio.php",
                    {
                        method: "GET",
                        cache: "no-cache"
                    }
                );


            if (!respuesta.ok) {
                return;
            }


            const resultado =
                await respuesta.json();


            if (!resultado.exito) {
                return;
            }


            actualizarRacha(
                resultado.racha
            );


            actualizarProgreso(
                resultado.progreso
            );


            actualizarCategorias(
                resultado.habitos_pendientes
            );

        } catch (error) {

            console.error(
                "No se pudo cargar el resumen de Inicio:",
                error
            );

        }

    }


    function actualizarRacha(racha) {

        const diasRacha =
            document.getElementById(
                "diasRacha"
            );


        if (!diasRacha) {
            return;
        }


        const valor =
            Number(racha) || 0;


        diasRacha.textContent =
            valor;

    }


    function actualizarProgreso(
        progreso
    ) {

        const porcentajeGeneral =
            document.getElementById(
                "porcentajeGeneral"
            );

        const barraProgreso =
            document.getElementById(
                "barraProgreso"
            );


        let valor = 0;


        if (
            progreso &&
            typeof progreso === "object"
        ) {

            valor =
                Number(
                    progreso.porcentaje
                ) || 0;

        } else {

            valor =
                Number(progreso) || 0;

        }


        valor =
            Math.max(
                0,
                Math.min(
                    100,
                    valor
                )
            );


        if (porcentajeGeneral) {

            porcentajeGeneral.textContent =
                `${valor}%`;

        }


        if (barraProgreso) {

            barraProgreso.style.width =
                `${valor}%`;

        }

    }


    function actualizarCategorias(
        habitos
    ) {

        const contenedor =
            document.getElementById(
                "contenedorCategorias"
            );


        if (!contenedor) {
            return;
        }


        contenedor.innerHTML = "";


        if (
            !Array.isArray(habitos) ||
            habitos.length === 0
        ) {

            const mensaje =
                document.createElement("p");

            mensaje.className =
                "categoria-vacia";

            mensaje.textContent =
                "No tienes hábitos pendientes para hoy.";

            contenedor.appendChild(
                mensaje
            );

            return;

        }


        const grupos =
            agruparHabitosPorCategoria(
                habitos
            );


        Object.values(grupos).forEach(
            (grupo) => {

                const articulo =
                    document.createElement(
                        "article"
                    );

                articulo.className =
                    "categoria";


                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "categoria-info";


                const imagen =
                    document.createElement(
                        "img"
                    );

                imagen.src =
                    obtenerIconoCategoria(
                        grupo.nombre
                    );

                imagen.alt =
                    grupo.nombre;


                const texto =
                    document.createElement(
                        "div"
                    );


                const titulo =
                    document.createElement(
                        "h3"
                    );

                titulo.className =
                    "nombre-categoria";

                titulo.textContent =
                    grupo.nombre;


                const detalle =
                    document.createElement(
                        "p"
                    );

                detalle.className =
                    "detalle-categoria";

                detalle.textContent =
                    `${grupo.completados} de ${grupo.total} hábitos pendientes`;


                texto.appendChild(
                    titulo
                );

                texto.appendChild(
                    detalle
                );


                info.appendChild(
                    imagen
                );

                info.appendChild(
                    texto
                );


                const circulo =
                    document.createElement(
                        "div"
                    );

                circulo.className =
                    "circulo";


                const porcentaje =
                    grupo.total > 0
                        ? Math.round(
                            (
                                grupo.completados /
                                grupo.total
                            ) * 100
                        )
                        : 0;


                circulo.textContent =
                    `${porcentaje}%`;


                articulo.appendChild(
                    info
                );

                articulo.appendChild(
                    circulo
                );


                contenedor.appendChild(
                    articulo
                );

            }
        );

    }


    function agruparHabitosPorCategoria(
        habitos
    ) {

        const grupos = {};


        habitos.forEach(
            (habito) => {

                const nombre =
                    habito.categoria ||
                    "Hábito Personalizado";


                if (!grupos[nombre]) {

                    grupos[nombre] = {
                        nombre: nombre,
                        total: 0,
                        completados: 0
                    };

                }


                grupos[nombre].total++;


                const progreso =
                    Number(
                        habito.progreso
                    ) || 0;

                const objetivo =
                    Number(
                        habito.objetivo
                    ) || 0;


                if (
                    objetivo > 0 &&
                    progreso >= objetivo
                ) {

                    grupos[nombre].completados++;

                }

            }
        );


        return grupos;

    }


    function obtenerIconoCategoria(
        nombre
    ) {

        const iconos = {

            "Hidratación":
                "img/Hidrat.png",

            "Alimentación":
                "img/Alimentacion.png",

            "Salud Mental":
                "img/SaludMental.png",

            "Actividad Física":
                "img/ActividadFisica.png",

            "Registro Académico":
                "img/Academico.png",

            "Hábito Personalizado":
                "img/H-Perzona.png"

        };


        return (
            iconos[nombre] ||
            "img/H-Perzona.png"
        );

    }


    async function actualizarNotificacionesIniciales() {

        await cargarNotificaciones();

    }


    mostrarFechaActual();

    cargarDatosUsuario();

    cargarResumenInicio();

    actualizarNotificacionesIniciales();


    setInterval(
        cargarNotificaciones,
        30000
    );


    if (panelNotificaciones) {

        panelNotificaciones.addEventListener(
            "transitionend",
            () => {

                const estaAbierto =
                    !panelNotificaciones.classList.contains(
                        "oculto"
                    );

                if (estaAbierto) {

                    marcarNotificacionesLeidas();

                }

            }
        );

    }

});