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

        mensajeEstadisticas.textContent = texto;

        mensajeEstadisticas.className = "mensaje";

        if (tipo) {
            mensajeEstadisticas.classList.add(tipo);
        }
    }


    function mostrarResumen(resumen = {}) {

        progresoGeneral.textContent =
            `${Math.round(
                limitarPorcentaje(
                    resumen.progreso_general
                )
            )}%`;


        diasRacha.textContent =
            Number(resumen.dias_racha) || 0;


        habitosCompletados.textContent =
            Number(resumen.habitos_completados) || 0;
    }


    function mostrarGrafica(datos) {

        graficaGeneral.innerHTML = "";


        if (
            !Array.isArray(datos) ||
            datos.length === 0
        ) {

            graficaGeneral.innerHTML = `
                <p class="sin-datos">
                    No hay datos suficientes para mostrar la gráfica.
                </p>
            `;

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
                        style="height: ${porcentaje}%;">
                    </div>

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


        tarjeta.innerHTML = `

            <div class="estadistica-info">

                <h3>
                    ${escaparHTML(
                        elemento.nombre
                    )}
                </h3>

                <p>
                    ${escaparHTML(
                        elemento.detalle ||
                        "Sin información disponible."
                    )}
                </p>

            </div>


            <div class="estadistica-progreso">

                <span>
                    ${Math.round(porcentaje)}%
                </span>

                <div class="barra-progreso">

                    <div
                        class="barra-progreso-relleno"
                        style="width: ${porcentaje}%;">
                    </div>

                </div>

            </div>

        `;


        return tarjeta;
    }


    function mostrarCategorias(categorias) {

        listaCategorias.innerHTML = "";


        if (
            !Array.isArray(categorias) ||
            categorias.length === 0
        ) {

            listaCategorias.innerHTML = `
                <p class="sin-datos">
                    Todavía no hay datos de categorías.
                </p>
            `;

            return;
        }


        categorias.forEach((categoria) => {

            listaCategorias.appendChild(
                crearTarjetaEstadistica(categoria)
            );

        });

    }


    function mostrarHabitos(habitos) {

        listaHabitos.innerHTML = "";


        if (
            !Array.isArray(habitos) ||
            habitos.length === 0
        ) {

            listaHabitos.innerHTML = `
                <p class="sin-datos">
                    Todavía no tienes hábitos personalizados.
                </p>
            `;

            return;
        }


        habitos.forEach((habito) => {

            listaHabitos.appendChild(
                crearTarjetaEstadistica(habito)
            );

        });

    }


    async function cargarEstadisticas() {

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
                    "El servidor no devolvió una respuesta válida."
                );

            }


            if (!respuesta.ok) {

                throw new Error(
                    datos.mensaje ||
                    "No se pudieron cargar las estadísticas."
                );

            }


            if (!datos.exito) {

                throw new Error(
                    datos.mensaje ||
                    "No se pudieron cargar las estadísticas."
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
                "No se pudieron cargar las estadísticas.",
                "error"
            );

        }

    }


    periodo.addEventListener(
        "change",
        cargarEstadisticas
    );


    cargarEstadisticas();

});