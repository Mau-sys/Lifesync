document.addEventListener(
    "DOMContentLoaded",
    () => {

        "use strict";


        /* =====================================================
           ELEMENTOS
        ===================================================== */

        const rachaActual =
            document.getElementById(
                "rachaActual"
            );

        const mejorRacha =
            document.getElementById(
                "mejorRacha"
            );

        const habitosCompletados =
            document.getElementById(
                "habitosCompletados"
            );

        const diasRegistrados =
            document.getElementById(
                "diasRegistrados"
            );

        const constelacion =
            document.getElementById(
                "constelacionUsuario"
            );

        const listaCategorias =
            document.getElementById(
                "listaCategorias"
            );

        const historialRachas =
            document.getElementById(
                "historialRachas"
            );

        const historialConstelaciones =
            document.getElementById(
                "historialConstelaciones"
            );

        const abrirHistorial =
            document.getElementById(
                "abrirHistorial"
            );

        const cerrarHistorial =
            document.getElementById(
                "cerrarHistorial"
            );

        const modal =
            document.getElementById(
                "modalConstelaciones"
            );


        /* =====================================================
           IDIOMA
        ===================================================== */

        function texto(clave) {

            if (
                typeof window.traducirLifeSync ===
                "function"
            ) {

                const resultado =
                    window.traducirLifeSync(
                        clave
                    );

                /*
                Si el idioma global todavía no tiene
                esa clave, devolvemos una versión normal.
                */

                if (
                    resultado &&
                    resultado !== clave
                ) {

                    return resultado;

                }

            }

            const textosBase = {

                dia: "día",

                dias: "días",

                constancia: "constancia",

                errorCargarRachas:
                    "No se pudieron cargar las rachas.",

                sinDatosCategorias:
                    "No hay categorías con datos todavía.",

                sinHistorialRachas:
                    "Todavía no hay historial de rachas.",

                sinConstelacionesAnteriores:
                    "Todavía no hay constelaciones anteriores."

            };


            return (
                textosBase[clave] ||
                clave
            );

        }


        /* =====================================================
           FORMATO DE DÍAS
        ===================================================== */

        function dias(valor) {

            const numero =
                Number(valor) || 0;


            return (
                `${numero} ` +
                (
                    numero === 1
                        ? texto("dia")
                        : texto("dias")
                )
            );

        }


        /* =====================================================
           ICONOS
        ===================================================== */

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


        /* =====================================================
           CARGAR RACHAS
        ===================================================== */

        async function cargarRachas() {

            try {

                const respuesta =
                    await fetch(
                        "auth/racha.php",
                        {
                            method:
                                "GET",

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


                /*
                Primero comprobamos el tipo de respuesta.
                Esto evita que aparezca:
                Unexpected token '<'
                */

                const contenido =
                    respuesta.headers.get(
                        "content-type"
                    ) || "";


                if (
                    !contenido.includes(
                        "application/json"
                    )
                ) {

                    const textoServidor =
                        await respuesta.text();

                    console.error(
                        "El servidor no devolvió JSON:",
                        textoServidor
                    );

                    throw new Error(
                        texto(
                            "errorCargarRachas"
                        )
                    );

                }


                const datos =
                    await respuesta.json();


                if (
                    !respuesta.ok ||
                    !datos.exito
                ) {

                    /*
                    Si simplemente no hay hábitos,
                    no lo mostramos como error.
                    */

                    if (
                        datos.codigo ===
                        "SIN_HABITOS"
                    ) {

                        mostrarEstadoVacio();

                        return;

                    }


                    throw new Error(
                        datos.codigo ===
                            "SESION_INVALIDA"
                            ? texto(
                                "sesionNoValida"
                            )
                            : texto(
                                "errorCargarRachas"
                            )
                    );

                }


                /* =================================================
                   RESUMEN
                ================================================= */

                if (rachaActual) {

                    rachaActual.textContent =
                        dias(
                            datos.racha_actual
                        );

                }


                if (mejorRacha) {

                    mejorRacha.textContent =
                        dias(
                            datos.mejor_racha
                        );

                }


                if (habitosCompletados) {

                    habitosCompletados.textContent =
                        Number(
                            datos.habitos_completados
                        ) || 0;

                }


                if (diasRegistrados) {

                    diasRegistrados.textContent =
                        Number(
                            datos.dias_registrados
                        ) || 0;

                }


                /* =================================================
                   CONSTELACIÓN
                ================================================= */

                crearConstelacionActual(
                    datos.constelacion_actual ||
                    []
                );


                /* =================================================
                   CATEGORÍAS
                ================================================= */

                crearCategorias(
                    datos.categorias ||
                    []
                );


                /* =================================================
                   HISTORIAL
                ================================================= */

                crearHistorial(
                    datos.historial_constelaciones ||
                    []
                );


                crearHistorialConstelaciones(
                    datos.historial_constelaciones ||
                    []
                );


            } catch (error) {

                console.error(
                    "Error en rachas.js:",
                    error
                );


                mostrarError(
                    texto(
                        "errorCargarRachas"
                    )
                );

            }

        }


        /* =====================================================
           ESTADO VACÍO
        ===================================================== */

        function mostrarEstadoVacio() {

            if (rachaActual) {

                rachaActual.textContent =
                    dias(0);

            }


            if (mejorRacha) {

                mejorRacha.textContent =
                    dias(0);

            }


            if (habitosCompletados) {

                habitosCompletados.textContent =
                    "0";

            }


            if (diasRegistrados) {

                diasRegistrados.textContent =
                    "0";

            }


            crearConstelacionActual([]);

            crearCategorias([]);

            crearHistorial([]);

            crearHistorialConstelaciones([]);

        }


        /* =====================================================
           CONSTELACIÓN ACTUAL
        ===================================================== */

        function crearConstelacionActual(
            fechasActivas
        ) {

            if (!constelacion) {

                return;

            }


            constelacion.innerHTML =
                "";


            const fechas =
                new Set(
                    fechasActivas
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


                estrella.title =
                    `${texto("dia")} ${dia}`;


                if (
                    fechas.has(
                        fecha
                    )
                ) {

                    estrella.classList.add(
                        "activa"
                    );

                }


                constelacion.appendChild(
                    estrella
                );

            }

        }


        /* =====================================================
           CATEGORÍAS
        ===================================================== */

        function crearCategorias(
            categorias
        ) {

            if (!listaCategorias) {

                return;

            }


            listaCategorias.innerHTML =
                "";


            if (
                !Array.isArray(
                    categorias
                ) ||
                categorias.length === 0
            ) {

                const mensaje =
                    document.createElement(
                        "p"
                    );


                mensaje.textContent =
                    texto(
                        "sinDatosCategorias"
                    );


                listaCategorias.appendChild(
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
                        categoria.nombre_categoria ||
                        "Categoría";


                    imagen.onerror =
                        () => {

                            imagen.onerror =
                                null;

                            imagen.src =
                                "img/H-Perzona.png";

                        };


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
                        categoria.nombre_categoria ||
                        "Categoría";


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


                    const porcentaje =
                        Number(
                            categoria.porcentaje
                        ) || 0;


                    progreso.style.width =
                        Math.min(
                            100,
                            Math.max(
                                0,
                                porcentaje
                            )
                        ) + "%";


                    barra.appendChild(
                        progreso
                    );


                    const porcentajeTexto =
                        document.createElement(
                            "p"
                        );


                    porcentajeTexto.className =
                        "porcentaje";


                    porcentajeTexto.textContent =
                        `${Math.round(
                            porcentaje
                        )}% ${texto(
                            "constancia"
                        )}`;


                    informacion.appendChild(
                        titulo
                    );


                    informacion.appendChild(
                        barra
                    );


                    informacion.appendChild(
                        porcentajeTexto
                    );


                    tarjeta.appendChild(
                        imagen
                    );


                    tarjeta.appendChild(
                        informacion
                    );


                    listaCategorias.appendChild(
                        tarjeta
                    );

                }
            );

        }


        /* =====================================================
           HISTORIAL
        ===================================================== */

        function crearHistorial(
            historial
        ) {

            if (!historialRachas) {

                return;

            }


            historialRachas.innerHTML =
                "";


            if (
                !Array.isArray(
                    historial
                ) ||
                historial.length === 0
            ) {

                const mensaje =
                    document.createElement(
                        "p"
                    );


                mensaje.textContent =
                    texto(
                        "sinHistorialRachas"
                    );


                historialRachas.appendChild(
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
                        formatearMes(
                            registro.mes
                        );


                    const descripcion =
                        document.createElement(
                            "p"
                        );


                    const cantidadDias =
                        Number(
                            registro.dias_con_registro
                        ) || 0;


                    descripcion.textContent =
                        `${cantidadDias} ${
                            cantidadDias === 1
                                ? texto("dia")
                                : texto("dias")
                        }`;


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
                        dias(
                            registro.dias_con_registro
                        );


                    item.appendChild(
                        contenido
                    );


                    item.appendChild(
                        cantidad
                    );


                    historialRachas.appendChild(
                        item
                    );

                }
            );

        }


        /* =====================================================
           HISTORIAL DE CONSTELACIONES
        ===================================================== */

        function crearHistorialConstelaciones(
            historial
        ) {

            if (
                !historialConstelaciones
            ) {

                return;

            }


            historialConstelaciones.innerHTML =
                "";


            if (
                !Array.isArray(
                    historial
                ) ||
                historial.length === 0
            ) {

                const mensaje =
                    document.createElement(
                        "p"
                    );


                mensaje.textContent =
                    texto(
                        "sinConstelacionesAnteriores"
                    );


                historialConstelaciones.appendChild(
                    mensaje
                );


                return;

            }


            historial.forEach(
                registro => {

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
                            registro.mes
                        );


                    const informacion =
                        document.createElement(
                            "p"
                        );


                    const cantidad =
                        Number(
                            registro.dias_con_registro
                        ) || 0;


                    informacion.textContent =
                        `${cantidad} ${
                            cantidad === 1
                                ? texto("dia")
                                : texto("dias")
                        }`;


                    contenedorMes.appendChild(
                        titulo
                    );


                    contenedorMes.appendChild(
                        informacion
                    );


                    historialConstelaciones.appendChild(
                        contenedorMes
                    );

                }
            );

        }


        /* =====================================================
           FORMATEAR MES
        ===================================================== */

        function formatearMes(
            valor
        ) {

            if (!valor) {

                return "";

            }


            const partes =
                String(valor).split("-");


            if (
                partes.length !== 2
            ) {

                return valor;

            }


            const anio =
                Number(
                    partes[0]
                );


            const mes =
                Number(
                    partes[1]
                );


            if (
                !anio ||
                !mes
            ) {

                return valor;

            }


            const fecha =
                new Date(
                    anio,
                    mes - 1,
                    1
                );


            const idiomaActual =
                typeof window.obtenerIdiomaLifeSync ===
                "function"
                    ? window.obtenerIdiomaLifeSync()
                    : "es";


            return fecha.toLocaleDateString(
                idiomaActual === "en"
                    ? "en-US"
                    : "es-SV",
                {
                    month:
                        "long",

                    year:
                        "numeric"
                }
            );

        }


        /* =====================================================
           MODAL
        ===================================================== */

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


        if (abrirHistorial) {

            abrirHistorial.addEventListener(
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


        if (cerrarHistorial) {

            cerrarHistorial.addEventListener(
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


        /* =====================================================
           ERROR
        ===================================================== */

        function mostrarError(
            mensaje
        ) {

            if (!listaCategorias) {

                return;

            }


            listaCategorias.innerHTML =
                "";


            const error =
                document.createElement(
                    "p"
                );


            error.textContent =
                mensaje ||
                texto(
                    "errorCargarRachas"
                );


            listaCategorias.appendChild(
                error
            );

        }


        /* =====================================================
           CAMBIO DE IDIOMA
        ===================================================== */

        window.addEventListener(
            "lifesyncIdiomaCambiado",
            () => {

                cargarRachas();

            }
        );


        /* =====================================================
           INICIAR
        ===================================================== */

        cargarRachas();

    }
);