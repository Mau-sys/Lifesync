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


    function escaparHTML(valor) {
        const elemento = document.createElement("div");

        elemento.textContent = valor ?? "";

        return elemento.innerHTML;
    }


    function limitarPorcentaje(valor) {
        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return 0;
        }

        return Math.max(0, Math.min(100, numero));
    }


    function mostrarMensaje(texto = "") {
        mensajeEstadisticas.textContent = texto;
    }


    function mostrarCargando() {
        mostrarMensaje("Cargando estadísticas...");

        progresoGeneral.textContent = "…";
        diasRacha.textContent = "…";
        habitosCompletados.textContent = "…";

        graficaGeneral.innerHTML =
            '<p class="sin-datos">Cargando progreso...</p>';

        listaCategorias.innerHTML =
            '<p class="sin-datos">Cargando categorías...</p>';

        listaHabitos.innerHTML =
            '<p class="sin-datos">Cargando hábitos...</p>';
    }


    function mostrarSinDatos(contenedor, texto) {
        contenedor.innerHTML = `
            <p class="sin-datos">
                ${escaparHTML(texto)}
            </p>
        `;
    }


    function pintarResumen(datos) {
        progresoGeneral.textContent =
            `${Math.round(limitarPorcentaje(datos.progreso_general))}%`;

        diasRacha.textContent =
            Number(datos.dias_racha) || 0;

        habitosCompletados.textContent =
            Number(datos.habitos_completados) || 0;
    }


    function pintarGrafica(datos) {
        graficaGeneral.innerHTML = "";

        if (
            !Array.isArray(datos.grafica) ||
            datos.grafica.length === 0
        ) {
            mostrarSinDatos(
                graficaGeneral,
                "No hay datos suficientes para mostrar la gráfica."
            );

            return;
        }


        const contenedor =
            document.createElement("div");

        contenedor.className =
            "grafica-barras";


        datos.grafica.forEach((dia) => {
            const porcentaje =
                limitarPorcentaje(dia.porcentaje);

            const columna =
                document.createElement("div");

            columna.className =
                "barra-columna";


            const valor =
                document.createElement("span");

            valor.className =
                "barra-valor";

            valor.textContent =
                `${Math.round(porcentaje)}%`;


            const barra =
                document.createElement("div");

            barra.className =
                "barra";


            const relleno =
                document.createElement("div");

            relleno.className =
                "barra-relleno";

            relleno.style.height =
                `${porcentaje}%`;

            relleno.setAttribute(
                "title",
                `${Math.round(porcentaje)}%`
            );


            const etiqueta =
                document.createElement("span");

            etiqueta.className =
                "barra-etiqueta";

            etiqueta.textContent =
                dia.etiqueta || "";


            barra.appendChild(relleno);

            columna.appendChild(valor);
            columna.appendChild(barra);
            columna.appendChild(etiqueta);

            contenedor.appendChild(columna);
        });


        graficaGeneral.appendChild(contenedor);
    }


    function pintarCategorias(categorias) {
        listaCategorias.innerHTML = "";


        if (
            !Array.isArray(categorias) ||
            categorias.length === 0
        ) {
            mostrarSinDatos(
                listaCategorias,
                "Todavía no hay estadísticas de categorías."
            );

            return;
        }


        categorias.forEach((categoria) => {
            const porcentaje =
                limitarPorcentaje(categoria.porcentaje);

            const tarjeta =
                document.createElement("article");

            tarjeta.className =
                "tarjeta-estadistica";


            tarjeta.innerHTML = `
                <div class="estadistica-info">

                    <h3>
                        ${escaparHTML(categoria.nombre)}
                    </h3>

                    <p>
                        ${Number(categoria.completados) || 0}
                        completados
                    </p>

                </div>

                <div class="estadistica-progreso">

                    <span>
                        ${Math.round(porcentaje)}%
                    </span>

                    <div class="barra-progreso">

                        <div
                            class="barra-progreso-relleno"
                            style="width: ${porcentaje}%">
                        </div>

                    </div>

                </div>
            `;


            listaCategorias.appendChild(tarjeta);
        });
    }


    function pintarHabitos(habitos) {
        listaHabitos.innerHTML = "";


        if (
            !Array.isArray(habitos) ||
            habitos.length === 0
        ) {
            mostrarSinDatos(
                listaHabitos,
                "Todavía no tienes hábitos personalizados."
            );

            return;
        }


        habitos.forEach((habito) => {
            const porcentaje =
                limitarPorcentaje(habito.porcentaje);

            const tarjeta =
                document.createElement("article");

            tarjeta.className =
                "tarjeta-estadistica";


            tarjeta.innerHTML = `
                <div class="estadistica-info">

                    <h3>
                        ${escaparHTML(habito.nombre)}
                    </h3>

                    <p>
                        ${Number(habito.completados) || 0}
                        completados
                    </p>

                </div>

                <div class="estadistica-progreso">

                    <span>
                        ${Math.round(porcentaje)}%
                    </span>

                    <div class="barra-progreso">

                        <div
                            class="barra-progreso-relleno"
                            style="width: ${porcentaje}%">
                        </div>

                    </div>

                </div>
            `;


            listaHabitos.appendChild(tarjeta);
        });
    }


    function pintarEstadisticas(datos) {
        pintarResumen(datos);
        pintarGrafica(datos);
        pintarCategorias(datos.categorias);
        pintarHabitos(datos.habitos_personalizados);

        mostrarMensaje("");
    }


    async function cargarEstadisticas() {
        const periodoSeleccionado =
            periodo.value || "semana";


        mostrarCargando();


        try {
            const respuesta =
                await fetch(
                    `../php/estadisticas.php?periodo=${encodeURIComponent(
                        periodoSeleccionado
                    )}`,
                    {
                        method: "GET",
                        credentials: "same-origin",
                        headers: {
                            "Accept": "application/json"
                        },
                        cache: "no-store"
                    }
                );


            const texto =
                await respuesta.text();


            let datos;


            try {
                datos = JSON.parse(texto);
            } catch (error) {
                throw new Error(
                    "El servidor no devolvió una respuesta válida."
                );
            }


            if (!respuesta.ok || !datos.exito) {
                throw new Error(
                    datos.mensaje ||
                    "No se pudieron cargar las estadísticas."
                );
            }


            pintarEstadisticas(datos);


        } catch (error) {
            console.error(
                "Error al cargar estadísticas:",
                error
            );


            progresoGeneral.textContent = "0%";
            diasRacha.textContent = "0";
            habitosCompletados.textContent = "0";


            mostrarSinDatos(
                graficaGeneral,
                "No se pudieron cargar los datos."
            );


            mostrarSinDatos(
                listaCategorias,
                "No se pudieron cargar las categorías."
            );


            mostrarSinDatos(
                listaHabitos,
                "No se pudieron cargar los hábitos personalizados."
            );


            mostrarMensaje(
                error.message ||
                "Ocurrió un error al cargar las estadísticas."
            );
        }
    }


    periodo.addEventListener(
        "change",
        cargarEstadisticas
    );


    cargarEstadisticas();
});