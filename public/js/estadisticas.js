document.addEventListener("DOMContentLoaded", () => {

    const periodo = document.getElementById("periodo");

    const progresoGeneral =
        document.getElementById("progresoGeneral");

    const diasRacha =
        document.getElementById("diasRacha");

    const habitosCompletados =
        document.getElementById("habitosCompletados");

    const graficaGeneral =
        document.getElementById("graficaGeneral");

    const listaCategorias =
        document.getElementById("listaCategorias");

    const listaHabitos =
        document.getElementById("listaHabitos");

    const mensaje =
        document.getElementById("mensajeEstadisticas");


    function mostrarMensaje(texto) {

        mensaje.textContent = texto;

    }


    function limpiarMensaje() {

        mensaje.textContent = "";

    }


    function limitarPorcentaje(valor) {

        const numero = Number(valor) || 0;

        return Math.max(
            0,
            Math.min(100, numero)
        );

    }


    function escaparHTML(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function mostrarResumen(datos) {

        progresoGeneral.textContent =
            `${limitarPorcentaje(datos.progreso_general)}%`;

        diasRacha.textContent =
            Number(datos.dias_racha) || 0;

        habitosCompletados.textContent =
            Number(datos.habitos_completados) || 0;

    }


    function mostrarGrafica(datos) {

        graficaGeneral.innerHTML = "";

        const registros =
            Array.isArray(datos.grafica)
                ? datos.grafica
                : [];


        if (registros.length === 0) {

            graficaGeneral.innerHTML =
                `<p class="sin-datos">
                    No hay datos suficientes para mostrar la gráfica.
                </p>`;

            return;

        }


        const contenedor =
            document.createElement("div");

        contenedor.className =
            "grafica-barras";


        registros.forEach((registro) => {

            const columna =
                document.createElement("div");

            columna.className =
                "barra-columna";


            const porcentaje =
                limitarPorcentaje(
                    registro.porcentaje
                );


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


            const etiqueta =
                document.createElement("span");

            etiqueta.className =
                "barra-etiqueta";

            etiqueta.textContent =
                registro.etiqueta;


            barra.appendChild(relleno);

            columna.appendChild(valor);

            columna.appendChild(barra);

            columna.appendChild(etiqueta);

            contenedor.appendChild(columna);

        });


        graficaGeneral.appendChild(contenedor);

    }


    function mostrarCategorias(datos) {

        listaCategorias.innerHTML = "";

        const categorias =
            Array.isArray(datos.categorias)
                ? datos.categorias
                : [];


        if (categorias.length === 0) {

            listaCategorias.innerHTML =
                `<p class="sin-datos">
                    Todavía no hay datos de categorías.
                </p>`;

            return;

        }


        categorias.forEach((categoria) => {

            const porcentaje =
                limitarPorcentaje(
                    categoria.porcentaje
                );


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
                        hábitos completados
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


    function mostrarHabitos(datos) {

        listaHabitos.innerHTML = "";

        const habitos =
            Array.isArray(datos.habitos_personalizados)
                ? datos.habitos_personalizados
                : [];


        if (habitos.length === 0) {

            listaHabitos.innerHTML =
                `<p class="sin-datos">
                    No tienes hábitos personalizados registrados.
                </p>`;

            return;

        }


        habitos.forEach((habito) => {

            const porcentaje =
                limitarPorcentaje(
                    habito.porcentaje
                );


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


    async function cargarEstadisticas() {

        limpiarMensaje();


        const periodoSeleccionado =
            periodo.value;


        try {

            const respuesta =
                await fetch(
                    `../auth/estadisticas.php?periodo=${encodeURIComponent(periodoSeleccionado)}`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );


            const texto =
                await respuesta.text();


            let datos;


            try {

                datos = JSON.parse(texto);

            } catch (error) {

                console.error(
                    "Respuesta no válida:",
                    texto
                );

                mostrarMensaje(
                    "El servidor devolvió una respuesta inesperada."
                );

                return;

            }


            if (!respuesta.ok || !datos.exito) {

                console.error(
                    "Error de estadísticas:",
                    datos
                );

                mostrarMensaje(
                    datos.mensaje ||
                    "No se pudieron cargar las estadísticas."
                );

                return;

            }


            mostrarResumen(datos);

            mostrarGrafica(datos);

            mostrarCategorias(datos);

            mostrarHabitos(datos);


        } catch (error) {

            console.error(
                "Error al cargar estadísticas:",
                error
            );

            mostrarMensaje(
                "No se pudieron cargar las estadísticas."
            );

        }

    }


    periodo.addEventListener(
        "change",
        cargarEstadisticas
    );


    cargarEstadisticas();

});