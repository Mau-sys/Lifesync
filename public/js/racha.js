document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       ELEMENTOS DEL HTML
       ========================================================= */

    const elementoRachaActual =
        document.getElementById("rachaActual");

    const elementoMejorRacha =
        document.getElementById("mejorRacha");

    const elementoHabitosCompletados =
        document.getElementById("habitosCompletados");

    const elementoDiasRegistrados =
        document.getElementById("diasRegistrados");

    const elementoConstelacion =
        document.getElementById("constelacionUsuario");

    const elementoCategorias =
        document.getElementById("listaCategorias");

    const elementoHistorial =
        document.getElementById("historialRachas");

    const elementoHistorialConstelaciones =
        document.getElementById("historialConstelaciones");

    const botonAbrirHistorial =
        document.getElementById("abrirHistorial");

    const botonCerrarHistorial =
        document.getElementById("cerrarHistorial");

    const modal =
        document.getElementById("modalConstelaciones");


    /* =========================================================
       TRADUCCIÓN
       ========================================================= */

    function LS(clave, textoEspanol = "") {

        if (
            typeof window !== "undefined" &&
            typeof window.traducirLifeSync === "function"
        ) {

            const resultado =
                window.traducirLifeSync(clave);

            /*
             * Si la clave existe en idioma-global.js,
             * utilizamos su traducción.
             */

            if (
                resultado &&
                resultado !== clave
            ) {

                return resultado;

            }

        }

        /*
         * Si la clave todavía no existe en el sistema global,
         * utilizamos el texto español como respaldo.
         */

        return textoEspanol || clave;

    }


    function obtenerIdioma() {

        const idiomaHTML =
            document.documentElement.lang;

        if (
            idiomaHTML === "en" ||
            idiomaHTML === "en-US"
        ) {

            return "en";

        }

        return "es";

    }


    function textoDias(cantidad) {

        const numero =
            Number(cantidad) || 0;

        const idioma =
            obtenerIdioma();


        if (idioma === "en") {

            return `${numero} ${numero === 1 ? "day" : "days"}`;

        }


        return `${numero} ${numero === 1 ? "día" : "días"}`;

    }


    function textoConstancia(porcentaje) {

        const numero =
            Math.round(
                Number(porcentaje) || 0
            );


        const idioma =
            obtenerIdioma();


        if (idioma === "en") {

            return `${numero}% consistency`;

        }


        return `${numero}% de constancia`;

    }


    function textoDiasRegistrados(cantidad) {

        const numero =
            Number(cantidad) || 0;

        const idioma =
            obtenerIdioma();


        if (idioma === "en") {

            return `${numero} ${numero === 1 ? "registered day" : "registered days"}`;

        }


        return `${numero} ${numero === 1 ? "día registrado" : "días registrados"}`;

    }


    function textoDiasConRegistros(cantidad) {

        const numero =
            Number(cantidad) || 0;

        const idioma =
            obtenerIdioma();


        if (idioma === "en") {

            return `${numero} ${numero === 1 ? "day with records" : "days with records"}`;

        }


        return `${numero} ${numero === 1 ? "día con registros" : "días con registros"}`;

    }


    function nombreCategoria(nombre) {

        const traducciones = {

            "Hidratación":
                LS("categorias.hidratacion", "Hidratación"),

            "Alimentación":
                LS("categorias.alimentacion", "Alimentación"),

            "Salud Mental":
                LS("categorias.saludMental", "Salud Mental"),

            "Actividad Física":
                LS("categorias.actividadFisica", "Actividad Física"),

            "Registro Académico":
                LS("categorias.registroAcademico", "Registro Académico"),

            "Hábito Personalizado":
                LS("categorias.habitoPersonalizado", "Hábito Personalizado")

        };


        return traducciones[nombre] || nombre;

    }


    /* =========================================================
       ICONOS
       ========================================================= */

    const iconosCategorias = {

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


    /* =========================================================
       CARGAR RACHAS
       ========================================================= */

    async function cargarRachas() {

        try {

            const respuesta =
                await fetch(
                    "auth/racha.php",
                    {
                        method: "GET",

                        credentials:
                            "same-origin",

                        cache:
                            "no-store",

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

                throw new Error(
                    datos.mensaje ||
                    LS(
                        "racha.errorCarga",
                        "No se pudieron cargar las rachas."
                    )
                );

            }


            const resumen =
                datos.resumen || {};


            /* =================================================
               RESUMEN
               ================================================= */

            actualizarTexto(
                elementoRachaActual,
                textoDias(
                    resumen.racha_actual
                )
            );


            actualizarTexto(
                elementoMejorRacha,
                textoDias(
                    resumen.mejor_racha
                )
            );


            actualizarTexto(
                elementoHabitosCompletados,
                resumen.total_completados || 0
            );


            /*
             * Días registrados.
             *
             * Si el PHP devuelve historial,
             * contamos las fechas disponibles.
             */

            const historial =
                datos.historial || [];


            actualizarTexto(
                elementoDiasRegistrados,
                historial.length
            );


            /* =================================================
               CONSTELACIÓN ACTUAL
               ================================================= */

            crearConstelacionActual(
                historial
            );


            /* =================================================
               CATEGORÍAS
               ================================================= */

            crearCategorias(
                datos.categorias || []
            );


            /* =================================================
               HISTORIAL
               ================================================= */

            crearHistorial(
                historial
            );


            crearHistorialConstelaciones(
                historial
            );

        } catch (error) {

            console.error(
                "Error en racha.js:",
                error
            );


            mostrarError(
                error.message ||
                LS(
                    "racha.errorDatos",
                    "No se pudieron cargar los datos."
                )
            );

        }

    }


    /* =========================================================
       ACTUALIZAR TEXTO
       ========================================================= */

    function actualizarTexto(
        elemento,
        valor
    ) {

        if (elemento) {

            elemento.textContent =
                valor;

        }

    }


    /* =========================================================
       CONSTELACIÓN ACTUAL
       ========================================================= */

    function crearConstelacionActual(
        historial
    ) {

        if (!elementoConstelacion) {
            return;
        }


        elementoConstelacion.innerHTML = "";


        const fechas =
            new Set(
                historial.map(
                    registro =>
                        registro.fecha
                )
            );


        const fechaActual =
            new Date();


        const anio =
            fechaActual.getFullYear();


        const mes =
            fechaActual.getMonth();


        const cantidadDias =
            new Date(
                anio,
                mes + 1,
                0
            ).getDate();


        for (
            let dia = 1;
            dia <= cantidadDias;
            dia++
        ) {

            const fecha =
                `${anio}-${String(
                    mes + 1
                ).padStart(
                    2,
                    "0"
                )}-${String(
                    dia
                ).padStart(
                    2,
                    "0"
                )}`;


            const estrella =
                document.createElement(
                    "span"
                );


            estrella.className =
                "estrella";


            estrella.textContent =
                "★";


            const idioma =
                obtenerIdioma();


            estrella.title =
                idioma === "en"
                    ? `Day ${dia}`
                    : `Día ${dia}`;


            if (
                fechas.has(
                    fecha
                )
            ) {

                estrella.classList.add(
                    "activa"
                );

            }


            elementoConstelacion.appendChild(
                estrella
            );

        }

    }


    /* =========================================================
       CREAR CATEGORÍAS
       ========================================================= */

    function crearCategorias(
        categorias
    ) {

        if (!elementoCategorias) {
            return;
        }


        elementoCategorias.innerHTML = "";


        if (
            !Array.isArray(categorias) ||
            categorias.length === 0
        ) {

            const mensaje =
                document.createElement("p");


            mensaje.textContent =
                LS(
                    "racha.sinCategorias",
                    "Todavía no tienes datos de categorías."
                );


            elementoCategorias.appendChild(
                mensaje
            );


            return;

        }


        categorias.forEach(
            categoria => {

                const tarjeta =
                    document.createElement(
                        "div"
                    );


                tarjeta.className =
                    "categoria-racha";


                /* =========================================
                   ICONO
                   ========================================= */

                const imagen =
                    document.createElement(
                        "img"
                    );


                imagen.src =
                    iconosCategorias[
                        categoria.nombre_categoria
                    ] ||
                    "img/H-Perzona.png";


                imagen.alt =
                    nombreCategoria(
                        categoria.nombre_categoria
                    );


                /* =========================================
                   INFORMACIÓN
                   ========================================= */

                const informacion =
                    document.createElement(
                        "div"
                    );


                informacion.className =
                    "info-categoria";


                const titulo =
                    document.createElement(
                        "h3"
                    );


                titulo.textContent =
                    nombreCategoria(
                        categoria.nombre_categoria
                    );


                /* =========================================
                   BARRA
                   ========================================= */

                const barra =
                    document.createElement(
                        "div"
                    );


                barra.className =
                    "barra";


                const progreso =
                    document.createElement(
                        "span"
                    );


                /*
                 * El PHP nuevo puede no devolver porcentaje
                 * directamente para categorías.
                 *
                 * Lo calculamos a partir de la racha actual
                 * y la mejor racha.
                 */

                const mejor =
                    Number(
                        categoria.mejor_racha
                    ) || 0;


                const actual =
                    Number(
                        categoria.racha_actual
                    ) || 0;


                let porcentaje = 0;


                if (mejor > 0) {

                    porcentaje =
                        (actual / mejor) * 100;

                }


                porcentaje =
                    Math.min(
                        100,
                        Math.max(
                            0,
                            porcentaje
                        )
                    );


                progreso.style.width =
                    `${porcentaje}%`;


                barra.appendChild(
                    progreso
                );


                /* =========================================
                   TEXTO
                   ========================================= */

                const texto =
                    document.createElement(
                        "p"
                    );


                texto.className =
                    "porcentaje";


                texto.textContent =
                    textoConstancia(
                        porcentaje
                    );


                informacion.appendChild(
                    titulo
                );


                informacion.appendChild(
                    barra
                );


                informacion.appendChild(
                    texto
                );


                tarjeta.appendChild(
                    imagen
                );


                tarjeta.appendChild(
                    informacion
                );


                elementoCategorias.appendChild(
                    tarjeta
                );

            }
        );

    }


    /* =========================================================
       HISTORIAL
       ========================================================= */

    function crearHistorial(
        historial
    ) {

        if (!elementoHistorial) {
            return;
        }


        elementoHistorial.innerHTML = "";


        if (
            !Array.isArray(historial) ||
            historial.length === 0
        ) {

            const mensaje =
                document.createElement(
                    "p"
                );


            mensaje.textContent =
                LS(
                    "racha.sinHistorial",
                    "Todavía no hay historial de rachas."
                );


            elementoHistorial.appendChild(
                mensaje
            );


            return;

        }


        historial.forEach(
            registro => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "historial-item";


                const contenido =
                    document.createElement(
                        "div"
                    );


                const titulo =
                    document.createElement(
                        "strong"
                    );


                titulo.textContent =
                    formatearFecha(
                        registro.fecha
                    );


                const descripcion =
                    document.createElement(
                        "p"
                    );


                descripcion.textContent =
                    textoDiasRegistrados(
                        registro.habitos_completados
                    );


                contenido.appendChild(
                    titulo
                );


                contenido.appendChild(
                    descripcion
                );


                const cantidad =
                    document.createElement(
                        "span"
                    );


                cantidad.textContent =
                    textoDias(
                        registro.habitos_completados
                    );


                item.appendChild(
                    contenido
                );


                item.appendChild(
                    cantidad
                );


                elementoHistorial.appendChild(
                    item
                );

            }
        );

    }


    /* =========================================================
       HISTORIAL DE CONSTELACIONES
       ========================================================= */

    function crearHistorialConstelaciones(
        historial
    ) {

        if (
            !elementoHistorialConstelaciones
        ) {

            return;

        }


        elementoHistorialConstelaciones.innerHTML =
            "";


        if (
            !Array.isArray(historial) ||
            historial.length === 0
        ) {

            const mensaje =
                document.createElement(
                    "p"
                );


            mensaje.textContent =
                LS(
                    "racha.sinConstelaciones",
                    "Todavía no existen constelaciones anteriores."
                );


            elementoHistorialConstelaciones.appendChild(
                mensaje
            );


            return;

        }


        /*
         * Agrupamos el historial por mes.
         */

        const meses = {};


        historial.forEach(
            registro => {

                if (!registro.fecha) {
                    return;
                }


                const partes =
                    registro.fecha.split("-");


                if (
                    partes.length < 2
                ) {

                    return;

                }


                const clave =
                    `${partes[0]}-${partes[1]}`;


                if (!meses[clave]) {

                    meses[clave] = [];

                }


                meses[clave].push(
                    registro
                );

            }
        );


        Object.keys(meses)
            .sort()
            .reverse()
            .forEach(
                mes => {

                    const contenedorMes =
                        document.createElement(
                            "div"
                        );


                    contenedorMes.className =
                        "mes-constelacion";


                    const titulo =
                        document.createElement(
                            "h3"
                        );


                    titulo.textContent =
                        formatearMes(
                            mes
                        );


                    const informacion =
                        document.createElement(
                            "p"
                        );


                    const cantidad =
                        meses[mes].length;


                    informacion.textContent =
                        textoDiasConRegistros(
                            cantidad
                        );


                    contenedorMes.appendChild(
                        titulo
                    );


                    contenedorMes.appendChild(
                        informacion
                    );


                    elementoHistorialConstelaciones.appendChild(
                        contenedorMes
                    );

                }
            );

    }


    /* =========================================================
       FORMATEAR FECHA
       ========================================================= */

    function formatearFecha(
        valor
    ) {

        if (!valor) {
            return "";
        }


        const partes =
            valor.split("-");


        if (
            partes.length !== 3
        ) {

            return valor;

        }


        const fecha =
            new Date(
                Number(partes[0]),
                Number(partes[1]) - 1,
                Number(partes[2])
            );


        return fecha.toLocaleDateString(
            obtenerIdioma() === "en"
                ? "en-US"
                : "es-SV",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    }


    /* =========================================================
       FORMATEAR MES
       ========================================================= */

    function formatearMes(
        valor
    ) {

        if (!valor) {
            return "";
        }


        const partes =
            valor.split("-");


        if (
            partes.length !== 2
        ) {

            return valor;

        }


        const fecha =
            new Date(
                Number(partes[0]),
                Number(partes[1]) - 1,
                1
            );


        return fecha.toLocaleDateString(
            obtenerIdioma() === "en"
                ? "en-US"
                : "es-SV",
            {
                month: "long",
                year: "numeric"
            }
        );

    }


    /* =========================================================
       ABRIR MODAL
       ========================================================= */

    if (botonAbrirHistorial) {

        botonAbrirHistorial.addEventListener(
            "click",
            () => {

                if (modal) {

                    modal.classList.add(
                        "activo"
                    );

                    document.body.style.overflow =
                        "hidden";

                }

            }
        );

    }


    /* =========================================================
       CERRAR MODAL
       ========================================================= */

    if (botonCerrarHistorial) {

        botonCerrarHistorial.addEventListener(
            "click",
            cerrarModal
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            evento => {

                if (
                    evento.target ===
                    modal
                ) {

                    cerrarModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                "Escape"
            ) {

                cerrarModal();

            }

        }
    );


    function cerrarModal() {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "activo"
        );


        document.body.style.overflow =
            "";

    }


    /* =========================================================
       ERROR
       ========================================================= */

    function mostrarError(
        mensaje
    ) {

        if (!elementoCategorias) {
            return;
        }


        elementoCategorias.innerHTML =
            "";


        const error =
            document.createElement(
                "p"
            );


        error.textContent =
            mensaje ||
            LS(
                "racha.errorDatos",
                "No se pudieron cargar los datos."
            );


        elementoCategorias.appendChild(
            error
        );

    }


    /* =========================================================
       INICIAR
       ========================================================= */

    cargarRachas();


    /* =========================================================
       CAMBIO DE IDIOMA
       ========================================================= */

    window.addEventListener(
        "lifesyncIdiomaCambiado",
        () => {

            cargarRachas();

        }
    );

});