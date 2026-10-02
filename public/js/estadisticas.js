document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const progresoGeneral = document.getElementById("progresoGeneral");
    const diasRacha = document.getElementById("diasRacha");
    const habitosCompletados = document.getElementById("habitosCompletados");
    const selectorPeriodo = document.getElementById("periodo");
    const graficaGeneral = document.getElementById("graficaGeneral");
    const listaCategorias = document.getElementById("listaCategorias");
    const listaHabitos = document.getElementById("listaHabitos");
    const mensajeEstadisticas = document.getElementById("mensajeEstadisticas");

    const CONFIG_CATEGORIAS = {
        "Hidratación": { icono: "img/Hidrat.png", clase: "cat-hidratacion" },
        "Alimentación": { icono: "img/Alimen.png", clase: "cat-alimentacion" },
        "Salud Mental": { icono: "img/S-Mental.png", clase: "cat-salud-mental" },
        "Actividad Física": { icono: "img/A-Fisica.png", clase: "cat-actividad-fisica" },
        "Registro Académico": { icono: "img/R-Academ.png", clase: "cat-academico" },
        "Académico": { icono: "img/R-Academ.png", clase: "cat-academico" },
        "Hábito Personalizado": { icono: "img/H-Perzona.png", clase: "cat-personalizado" }
    };

    const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    function traducir(clave, predeterminado) {
        if (typeof window.traducirLifeSync === "function") {
            const res = window.traducirLifeSync(clave);
            if (res && res !== clave) return res;
        }
        return predeterminado;
    }

    async function cargarEstadisticas() {
        const periodo = selectorPeriodo ? selectorPeriodo.value : "semana";
        const apiRuta = window.location.pathname.includes("/public/") 
            ? `../auth/estadisticas.php?periodo=${periodo}` 
            : `auth/estadisticas.php?periodo=${periodo}`;

        mostrarMensaje("");

        try {
            const respuesta = await fetch(apiRuta, {
                method: "GET",
                cache: "no-store",
                credentials: "include",
                headers: { "Accept": "application/json" }
            });

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exito) {
                throw new Error(datos.mensaje || "Error al cargar las estadísticas.");
            }

            renderizarResumen(datos.resumen);

            // Si es vista anual, agrupamos los datos en intervalos (Trimestres)
            const datosProcesados = esPeriodoAnual(periodo) 
                ? agruparEnIntervalosAnuales(datos.grafica) 
                : datos.grafica;

            renderizarGraficaLinea(datosProcesados, periodo);
            renderizarCategorias(datos.categorias);
            renderizarHabitosPersonalizados(datos.habitos);

        } catch (error) {
            console.error("Error en estadísticas:", error);
            mostrarMensaje(error.message || "No se pudieron obtener las estadísticas de la base de datos.");
        }
    }

    function esPeriodoAnual(periodo) {
        return periodo === "anio" || periodo === "ano" || periodo === "year" || periodo === "anual";
    }

    // Función para agrupar los 12 meses o días del año en 4 Trimestres (Intervalos)
    function agruparEnIntervalosAnuales(puntos) {
        if (!Array.isArray(puntos) || puntos.length === 0) return [];

        const intervalos = [
            { nombre: "T1 (Ene - Mar)", meses: [1, 2, 3], completados: 0, esperados: 0, sumaPct: 0, conteo: 0 },
            { nombre: "T2 (Abr - Jun)", meses: [4, 5, 6], completados: 0, esperados: 0, sumaPct: 0, conteo: 0 },
            { nombre: "T3 (Jul - Sep)", meses: [7, 8, 9], completados: 0, esperados: 0, sumaPct: 0, conteo: 0 },
            { nombre: "T4 (Oct - Dic)", meses: [10, 11, 12], completados: 0, esperados: 0, sumaPct: 0, conteo: 0 }
        ];

        puntos.forEach(pt => {
            const partes = pt.fecha.split("-");
            let mesNum = 0;

            if (partes.length === 3) mesNum = parseInt(partes[1], 10);
            else if (partes.length === 2) mesNum = parseInt(partes[1] || partes[0], 10);
            else mesNum = parseInt(pt.fecha, 10);

            const bloque = intervalos.find(i => i.meses.includes(mesNum));
            if (bloque) {
                bloque.completados += Number(pt.completados) || 0;
                bloque.esperados += Number(pt.esperados) || 0;
                bloque.sumaPct += Number(pt.porcentaje) || 0;
                bloque.conteo += 1;
            }
        });

        return intervalos.map(b => ({
            fecha: b.nombre,
            porcentaje: b.conteo > 0 ? (b.sumaPct / b.conteo) : 0,
            completados: b.completados,
            esperados: b.esperados,
            esIntervalo: true
        }));
    }

    function renderizarResumen(resumen) {
        if (!resumen) return;
        if (progresoGeneral) progresoGeneral.textContent = `${Math.round(resumen.progreso_general || 0)}%`;
        if (diasRacha) diasRacha.textContent = `${Number(resumen.dias_racha) || 0}`;
        if (habitosCompletados) habitosCompletados.textContent = `${Number(resumen.habitos_completados) || 0}`;
    }

    function formatearEtiqueta(fechaStr, periodo, esIntervalo) {
        if (esIntervalo) return fechaStr;
        if (!fechaStr) return "";
        
        const partes = fechaStr.split("-");

        if (esPeriodoAnual(periodo) || partes.length === 2) {
            const mesNum = parseInt(partes[1] || partes[0], 10);
            return (mesNum >= 1 && mesNum <= 12) ? MESES[mesNum - 1] : fechaStr;
        }

        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}`;
        }

        return fechaStr;
    }

    function renderizarGraficaLinea(puntosGrafica, periodo) {
        if (!graficaGeneral) return;
        graficaGeneral.innerHTML = "";

        if (!Array.isArray(puntosGrafica) || puntosGrafica.length === 0) {
            graficaGeneral.innerHTML = `<p class="sin-datos">${traducir("sinDatos", "No hay datos registrados para este período.")}</p>`;
            return;
        }

        const anchoSvg = 800;
        const altoSvg = 220;
        const margen = { top: 35, right: 40, bottom: 40, left: 40 };

        const anchoEfectivo = anchoSvg - margen.left - margen.right;
        const altoEfectivo = altoSvg - margen.top - margen.bottom;

        const totalPuntos = puntosGrafica.length;
        const pasoX = totalPuntos > 1 ? anchoEfectivo / (totalPuntos - 1) : anchoEfectivo / 2;

        let coordenadas = [];

        puntosGrafica.forEach((item, idx) => {
            const pct = Math.min(100, Math.max(0, Number(item.porcentaje) || 0));
            const x = margen.left + (totalPuntos > 1 ? idx * pasoX : anchoEfectivo / 2);
            const y = margen.top + (altoEfectivo - (pct / 100) * altoEfectivo);
            coordenadas.push({ x, y, pct, item });
        });

        const dLina = coordenadas.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(" ");
        const dArea = `${dLina} L ${coordenadas[coordenadas.length - 1].x} ${altoSvg - margen.bottom} L ${coordenadas[0].x} ${altoSvg - margen.bottom} Z`;

        let svgHtml = `
            <div class="contenedor-grafica-svg">
                <svg viewBox="0 0 ${anchoSvg} ${altoSvg}" preserveAspectRatio="none" class="svg-grafica">
                    <defs>
                        <linearGradient id="gradienteArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="var(--color-morado)" stop-opacity="0.35"/>
                            <stop offset="100%" stop-color="var(--color-morado)" stop-opacity="0.0"/>
                        </linearGradient>
                    </defs>

                    <!-- Guías de fondo -->
                    <line x1="${margen.left}" y1="${margen.top}" x2="${anchoSvg - margen.right}" y2="${margen.top}" class="linea-guia"/>
                    <line x1="${margen.left}" y1="${margen.top + altoEfectivo/2}" x2="${anchoSvg - margen.right}" y2="${margen.top + altoEfectivo/2}" class="linea-guia"/>
                    <line x1="${margen.left}" y1="${altoSvg - margen.bottom}" x2="${anchoSvg - margen.right}" y2="${altoSvg - margen.bottom}" class="linea-guia"/>

                    <!-- Área rellena -->
                    <path d="${dArea}" fill="url(#gradienteArea)" />

                    <!-- Línea de la gráfica -->
                    <path d="${dLina}" fill="none" stroke="var(--color-morado)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />

                    <!-- Puntos e información flotante -->
                    ${coordenadas.map(pt => {
                        const etq = formatearEtiqueta(pt.item.fecha, periodo, pt.item.esIntervalo);
                        return `
                            <g class="punto-grupo">
                                <circle cx="${pt.x}" cy="${pt.y}" r="6" class="punto-grafica" />
                                <circle cx="${pt.x}" cy="${pt.y}" r="16" class="punto-hover-target">
                                    <title>${etq}:${Math.round(pt.pct)}% promedio (${pt.item.completados}/${pt.item.esperados} hábitos)</title>
                                </circle>
                                <text x="${pt.x}" y="${pt.y - 12}" class="texto-valor-svg">${Math.round(pt.pct)}%</text>
                                <text x="${pt.x}" y="${altoSvg - 12}" class="texto-etiqueta-svg">${etq}</text>
                            </g>
                        `;
                    }).join("")}
                </svg>
            </div>
        `;

        graficaGeneral.innerHTML = svgHtml;
    }

    function renderizarCategorias(categorias) {
        if (!listaCategorias) return;
        listaCategorias.innerHTML = "";

        if (!Array.isArray(categorias) || categorias.length === 0) {
            listaCategorias.innerHTML = `<p class="sin-datos">${traducir("sinCategorias", "No hay categorías registradas.")}</p>`;
            return;
        }

        categorias.forEach(cat => {
            const config = CONFIG_CATEGORIAS[cat.nombre_categoria] || CONFIG_CATEGORIAS["Hábito Personalizado"];
            const articulo = document.createElement("article");
            articulo.className = `tarjeta-estadistica ${config.clase}`;

            const porcentajeCalculado = Math.round(Number(cat.porcentaje) || 0);
            const completados = Number(cat.completados_hoy) || 0;
            const total = Number(cat.total_habitos) || 0;

            articulo.innerHTML = `
                <div class="categoria-cabecera">
                    <div class="icono-contenedor">
                        <img src="${config.icono}" alt="${cat.nombre_categoria}">
                    </div>
                    <div class="estadistica-info">
                        <h3>${cat.nombre_categoria}</h3>
                        <p>${completados} de ${total} hábitos completados hoy</p>
                    </div>
                </div>
                <div class="estadistica-progreso">
                    <div class="barra-progreso">
                        <div class="barra-progreso-relleno" style="width: ${porcentajeCalculado}%;"></div>
                    </div>
                    <span class="porcentaje-badge">${porcentajeCalculado}%</span>
                </div>
            `;

            listaCategorias.appendChild(articulo);
        });
    }

    function renderizarHabitosPersonalizados(habitos) {
        if (!listaHabitos) return;
        listaHabitos.innerHTML = "";

        if (!Array.isArray(habitos) || habitos.length === 0) {
            listaHabitos.innerHTML = `<p class="sin-datos">${traducir("sinHabitosPersonalizados", "No hay hábitos personalizados activos.")}</p>`;
            return;
        }

        habitos.forEach(habito => {
            const config = CONFIG_CATEGORIAS["Hábito Personalizado"];
            const articulo = document.createElement("article");
            articulo.className = `tarjeta-estadistica ${config.clase}`;

            const pct = Math.round(Number(habito.porcentaje) || 0);

            articulo.innerHTML = `
                <div class="categoria-cabecera">
                    <div class="icono-contenedor">
                        <img src="${config.icono}" alt="Personalizado">
                    </div>
                    <div class="estadistica-info">
                        <h3>${habito.nombre}</h3>
                        <p>${habito.detalle || "Hábito personalizado"}</p>
                    </div>
                </div>
                <div class="estadistica-progreso">
                    <div class="barra-progreso">
                        <div class="barra-progreso-relleno" style="width: ${pct}%;"></div>
                    </div>
                    <span class="porcentaje-badge">${pct}%</span>
                </div>
            `;

            listaHabitos.appendChild(articulo);
        });
    }

    function mostrarMensaje(mensaje) {
        if (!mensajeEstadisticas) return;
        mensajeEstadisticas.textContent = mensaje;
    }

    selectorPeriodo?.addEventListener("change", cargarEstadisticas);
    window.addEventListener("lifesyncIdiomaCambiado", cargarEstadisticas);

    cargarEstadisticas();
});