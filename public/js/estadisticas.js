document.addEventListener("DOMContentLoaded", () => {

    const progresoGeneral = document.getElementById("progresoGeneral");
    const diasRacha = document.getElementById("diasRacha");
    const habitosCompletados = document.getElementById("habitosCompletados");

    const periodo = document.getElementById("periodo");

    const graficaGeneral = document.getElementById("graficaGeneral");

    const listaCategorias = document.getElementById("listaCategorias");
    const listaHabitos = document.getElementById("listaHabitos");

    const mensajeEstadisticas =
        document.getElementById("mensajeEstadisticas");


    function LS(texto) {

        if (
            typeof window !== "undefined" &&
            typeof window.traducirLifeSync === "function"
        ) {
            return window.traducirLifeSync(texto);
        }

        return texto;
    }


    function escaparHTML(texto) {

        const elemento = document.createElement("div");

        elemento.textContent = texto ?? "";

        return elemento.innerHTML;
    }


    function limitarPorcentaje(valor) {

        const numero = Number(valor) || 0;

        return Math.max(
            0,
            Math.min(100, numero)
        );
    }


    function mostrarMensaje(texto = "", tipo = "") {

        if (!mensajeEstadisticas) {
            return;
        }

        mensajeEstadisticas.textContent = texto;

        mensajeEstadisticas.className = "mensaje";

        if (tipo) {
            mensajeEstadisticas.classList.add(tipo);
        }
    }


    function mostrarResumen(resumen = {}) {

        if (progresoGeneral) {
            progresoGeneral.textContent =
                `${Math.round(
                    limitarPorcentaje(
                        resumen.progreso_general
                    )
                )}%`;
        }


        if (diasRacha) {
            diasRacha.textContent =
                Number(resumen.dias_racha) || 0;
        }


        if (habitosCompletados) {
            habitosCompletados.textContent =
                Number(resumen.habitos_completados) || 0;
        }
    }


    function mostrarGrafica(datos) {

        if (!graficaGeneral) {
            return;
        }

        graficaGeneral.innerHTML = "";


        if (
            !Array.isArray(datos) ||
            datos.length === 0
        ) {

            const mensaje =
                document.createElement("p");

            mensaje.className = "sin-datos";

            mensaje.textContent =
                LS("graficaSinDatos");

            graficaGeneral.appendChild(mensaje);

            return;
        }


        const contenedor =
            document.createElement("div");

        contenedor.className =
            "grafica-barras";


        datos.forEach((dato) => {

            const porcentaje =
                limitarPorcentaje(dato.porcentaje);


            const columna =
                document.createElement("div");

            columna.className =
                "barra-columna";


            columna.innerHTML = `

                <span class="barra-valor">
                    ${Math.round(porcentaje)}%
                </span>

                <div class="barra">

                    <div
                        class="barra-relleno"
                        style="height: ${porcentaje}%;"
                    ></div>

                </div>

                <span class="barra-etiqueta">
                    ${escaparHTML(dato.etiqueta)}
                </span>

            `;


            contenedor.appendChild(columna);

        });


        graficaGeneral.appendChild(contenedor);
    }


    function crearTarjetaEstadistica(elemento) {

        const porcentaje =
            limitarPorcentaje(elemento.porcentaje);


        const tarjeta =
            document.createElement("article");

        tarjeta.className =
            "tarjeta-estadistica";


        const informacion =
            document.createElement("div");

        informacion.className =
            "estadistica-info";


        const titulo =
            document.createElement("h3");

        titulo.textContent =
            elemento.nombre ?? "";


        const detalle =
            document.createElement("p");

        detalle.textContent =
            elemento.detalle ||
            LS("sinInformacion");


        informacion.appendChild(titulo);
        informacion.appendChild(detalle);


        const progreso =
            document.createElement("div");

        progreso.className =
            "estadistica-progreso";


        const porcentajeTexto =
            document.createElement("span");

        porcentajeTexto.textContent =
            `${Math.round(porcentaje)}%`;


        const barra =
            document.createElement("div");

        barra.className =
            "barra-progreso";


        const barraRelleno =
            document.createElement("div");

        barraRelleno.className =
            "barra-progreso-relleno";

        barraRelleno.style.width =
            `${porcentaje}%`;


        barra.appendChild(barraRelleno);

        progreso.appendChild(porcentajeTexto);
        progreso.appendChild(barra);


        tarjeta.appendChild(informacion);
        tarjeta.appendChild(progreso);


        return tarjeta;
    }


    function mostrarCategorias(categorias) {

        if (!listaCategorias) {
            return;
        }

        listaCategorias.innerHTML = "";


        if (
            !Array.isArray(categorias) ||
            categorias.length === 0
        ) {

            const mensaje =
                document.createElement("p");

            mensaje.className =
                "sin-datos";

            mensaje.textContent =
                LS("sinCategorias");

            listaCategorias.appendChild(mensaje);

            return;
        }


        categorias.forEach((categoria) => {

            listaCategorias.appendChild(
                crearTarjetaEstadistica(categoria)
            );

        });

    }


    function mostrarHabitos(habitos) {

        if (!listaHabitos) {
            return;
        }

        listaHabitos.innerHTML = "";


        if (
            !Array.isArray(habitos) ||
            habitos.length === 0
        ) {

            const mensaje =
                document.createElement("p");

            mensaje.className =
                "sin-datos";

            mensaje.textContent =
                LS("sinHabitosPersonalizados");

            listaHabitos.appendChild(mensaje);

            return;
        }


        habitos.forEach((habito) => {

            listaHabitos.appendChild(
                crearTarjetaEstadistica(habito)
            );

        });

    }


    async function cargarEstadisticas() {

        if (!periodo) {
            return;
        }

        const periodoSeleccionado =
            periodo.value || "semana";


        try {

            mostrarMensaje("");


            const respuesta =
                await fetch(
                    `../auth/estadisticas.php?periodo=${encodeURIComponent(
                        periodoSeleccionado
                    )}`,
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store",
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );


            const textoRespuesta =
                await respuesta.text();


            let datos;


            try {

                datos =
                    JSON.parse(
                        textoRespuesta
                    );

            } catch (error) {

                console.error(
                    "Respuesta recibida del servidor:",
                    textoRespuesta
                );

                throw new Error(
                    LS(LS("servidorRespuestaInvalida"))
                );

            }


            if (!respuesta.ok) {

                throw new Error(
                    datos.mensaje ||
                    LS(LS("noEstadisticas"))
                );

            }


            if (!datos.exito) {

                throw new Error(
                    datos.mensaje ||
                    LS(LS("noEstadisticas"))
                );

            }


            mostrarResumen(
                datos.resumen
            );


            mostrarGrafica(
                datos.grafica
            );


            mostrarCategorias(
                datos.categorias
            );


            mostrarHabitos(
                datos.habitos
            );


        } catch (error) {

            console.error(
                "Error al cargar estadísticas:",
                error
            );


            mostrarMensaje(
                error.message ||
                LS(LS("noEstadisticas")),
                "error"
            );

        }

    }


    if (periodo) {
        periodo.addEventListener(
            "change",
            cargarEstadisticas
        );
    }


    cargarEstadisticas();

    window.addEventListener("lifesyncIdiomaCambiado", cargarEstadisticas);

});
