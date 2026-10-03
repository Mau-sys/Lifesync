(function () {
    "use strict";

    const LS = t =>
        typeof window.traducirLifeSync === "function"
            ? window.traducirLifeSync(t)
            : t;

    const API = "../auth/";
    const CATEGORIA = "Académico";

    const MIN_DURACION_MINUTOS = 5;
    const MAX_DURACION_MINUTOS = 180;
    const MAX_REGISTROS = 20;

    let id = Number(
        new URLSearchParams(location.search).get("id_habito_usuario")
    ) || 0;

    let objetivo = 3;
    let progreso = 0;
    let duracionSesion = 45;
    let frecuenciaHabito = "diaria";
    let diasHabito = [1, 2, 3, 4, 5];

    const $ = id => document.getElementById(id);

    const ring = $("ring-academico");
    const contador = $("contador-academico");
    const meta = $("meta-academico");
    const labelFrecuencia = $("label-meta-frecuencia");
    const metaHorasTotales = $("meta-horas-totales");
    const lista = $("lista-registros");
    const btn = $("btn-add-registro");

    const btnRegresar = $("btn-regresar");
    const btnEditarMeta = $("btn-editar-meta");
    const btnGuardarConfig = $("btn-guardar-config");
    const btnReiniciarMeta = $("btn-reiniciar-meta");

    const inputRegistros = $("input-registros");
    const inputDuracion = $("input-duracion-sesion");
    const selectFrecuencia = $("select-frecuencia");
    const contenedorDias = $("contenedor-dias-semana");
    const botonesDias = document.querySelectorAll(".btn-dia-semana");

    const modalEditar = $("modalEditarAcademico");

    btnRegresar?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const origenSesion = sessionStorage.getItem("origen_navegacion");
        sessionStorage.removeItem("origen_navegacion");

        const paginaAnterior = document.referrer ? document.referrer.toLowerCase() : "";

        if (origenSesion && !origenSesion.toLowerCase().includes("registroacademico")) {
            window.location.href = origenSesion;
        } else if (paginaAnterior.includes("categorias.html")) {
            window.location.href = "Categorias.html";
        } else if (paginaAnterior.includes("rachas.html")) {
            window.location.href = "Rachas.html";
        } else {
            window.location.href = "inicio.html";
        }
    }, true);

    selectFrecuencia?.addEventListener("change", e => {
        if (e.target.value === "personalizada") {
            contenedorDias?.classList.remove("d-none");
        } else {
            contenedorDias?.classList.add("d-none");
        }
    });

    botonesDias.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("active");
        });
    });

    function formatearHorasTotales(minutosTotales) {
        const horas = Math.floor(minutosTotales / 60);
        const mins = minutosTotales % 60;

        const txtMin = LS("actividadFisica.min");
        const txtHora = horas === 1 ? LS("actividadFisica.hora") : LS("actividadFisica.horas");

        if (horas === 0) {
            return `${mins} ${txtMin}`;
        } else if (mins === 0) {
            return `${horas} ${txtHora}`;
        } else {
            return `${horas}h ${mins}m`;
        }
    }

    async function cargar() {
        if (!id) {
            throw new Error(LS("No se especificó un ID de hábito válido."));
        }

        const respuesta = await fetch(
            `${API}Obtener_habito.php?id_habito_usuario=${id}`,
            {
                credentials: "include",
                cache: "no-store"
            }
        );

        if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);

        const datos = await respuesta.json();

        if (!datos.exito || !datos.habito) {
            throw new Error(
                datos.mensaje || LS("No se pudieron cargar los datos.")
            );
        }

        id = Number(datos.habito.id_habito_usuario);

        objetivo = Number(datos.habito.objetivo) || 3;
        progreso = Number(datos.habito.progreso_hoy) || 0;
        duracionSesion = Number(datos.habito.duracion_minutos) || 45;
        
        duracionSesion = Math.min(Math.max(duracionSesion, MIN_DURACION_MINUTOS), MAX_DURACION_MINUTOS);

        frecuenciaHabito = datos.habito.frecuencia || "diaria";

        if (datos.habito.dias) {
            diasHabito = Array.isArray(datos.habito.dias)
                ? datos.habito.dias.map(Number)
                : String(datos.habito.dias).split(",").map(Number);
        }

        if (progreso > objetivo) {
            progreso = objetivo;
        }
    }

    function render() {
        if (!contador || !meta || !ring || !lista || !btn) {
            return;
        }

        contador.textContent = `${progreso}/${objetivo}`;

        if (labelFrecuencia) {
            switch (frecuenciaHabito) {
                case "semanal":
                    labelFrecuencia.textContent = LS("registroAcademico.metaSemanal");
                    break;
                case "mensual":
                    labelFrecuencia.textContent = LS("registroAcademico.metaMensual");
                    break;
                case "personalizada":
                    labelFrecuencia.textContent = LS("registroAcademico.metaProgramada");
                    break;
                case "diaria":
                default:
                    labelFrecuencia.textContent = LS("registroAcademico.metaDiariaLabel");
                    break;
            }
        }

        const txtReg = objetivo === 1 
            ? LS("registroAcademico.unRegistro") 
            : LS("registroAcademico.variosRegistros").replace("{total}", objetivo);

        meta.textContent = LS("registroAcademico.formatoFormaMeta")
            .replace("{meta}", txtReg)
            .replace("{duracion}", duracionSesion);

        if (metaHorasTotales) {
            const minutosTotales = objetivo * duracionSesion;
            const tiempoTxt = formatearHorasTotales(minutosTotales);
            metaHorasTotales.textContent = LS("registroAcademico.totalEstudio").replace("{tiempo}", tiempoTxt);
        }

        const porcentaje = objetivo > 0
            ? Math.min(100, (progreso / objetivo) * 100)
            : 0;

        ring.style.background =
            `conic-gradient(
                var(--ls-pink) ${porcentaje}%,
                rgba(236, 72, 153, 0.15) ${porcentaje}%
            )`;

        const badgeResumen = $("sesiones-resumen-badge");
        if (badgeResumen) {
            badgeResumen.textContent = LS("registroAcademico.completadasResumen")
                .replace("{progreso}", progreso)
                .replace("{objetivo}", objetivo);
        }

        lista.innerHTML = "";

        for (let i = 0; i < objetivo; i++) {
            const esCompletada = i < progreso;
            const tarjetaSesion = document.createElement("div");

            tarjetaSesion.className = `sesion-item ${esCompletada ? "completada" : "pendiente"}`;

            const txtSesion = LS("registroAcademico.sesionNumero").replace("{n}", i + 1);

            tarjetaSesion.innerHTML = `
                <i class="fa-solid ${esCompletada ? "fa-circle-check" : "fa-circle-dot"} sesion-icon"></i>
                <span class="sesion-numero">${txtSesion}</span>
            `;

            lista.appendChild(tarjetaSesion);
        }

        const diaHoy = new Date().getDay();
        const esDiaPermitido = frecuenciaHabito !== "personalizada" || diasHabito.includes(diaHoy);

        if (!esDiaPermitido) {
            btn.disabled = true;
            btn.innerHTML = `<span>${LS("registroAcademico.noProgramadoHoy")}</span>`;
        } else {
            btn.disabled = progreso >= objetivo;
            btn.innerHTML =
                `<span>${
                    progreso >= objetivo
                        ? LS("saludMental.metaCompletada")
                        : LS("registroAcademico.agregarRegistro")
                }</span>`;
        }
    }

    async function registrar() {
        if (!id || btn?.disabled) {
            return;
        }

        try {
            const respuesta = await fetch(
                `${API}registrar-habito.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_habito_usuario: id,
                        valor: 1,
                        observaciones: "registro académico"
                    })
                }
            );

            if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);

            const datos = await respuesta.json();

            if (!datos.exito) {
                throw new Error(
                    datos.mensaje || LS("registroAcademico.noSePudoRegistrar")
                );
            }

            if (datos.registro) {
                progreso = Number(datos.registro.progreso_hoy) || progreso + 1;
            } else {
                progreso++;
            }

            progreso = Math.min(progreso, objetivo);

            render();

        } catch (error) {
            alert(error.message);
        }
    }

    btn?.addEventListener("click", registrar);

    btnEditarMeta?.addEventListener("click", e => {
        e.preventDefault();

        const menu = $("kebab-menu-academico");
        menu?.classList.remove("show");

        if (selectFrecuencia) {
            selectFrecuencia.value = frecuenciaHabito;
            if (frecuenciaHabito === "personalizada") {
                contenedorDias?.classList.remove("d-none");
            } else {
                contenedorDias?.classList.add("d-none");
            }
        }

        if (inputRegistros) {
            inputRegistros.value = objetivo;
        }

        if (inputDuracion) {
            inputDuracion.value = duracionSesion;
            inputDuracion.max = MAX_DURACION_MINUTOS;
            inputDuracion.min = MIN_DURACION_MINUTOS;
        }

        botonesDias.forEach(btn => {
            const diaNum = Number(btn.getAttribute("data-dia"));
            if (diasHabito.includes(diaNum)) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        if (modalEditar && typeof bootstrap !== "undefined") {
            bootstrap.Modal
                .getOrCreateInstance(modalEditar)
                .show();
        }
    });

    btnGuardarConfig?.addEventListener("click", async () => {
        const nuevaMeta = Number(inputRegistros?.value);
        const nuevaDuracion = Number(inputDuracion?.value);
        const nuevaFrecuencia = selectFrecuencia?.value || "diaria";

        if (
            !Number.isInteger(nuevaMeta) ||
            nuevaMeta < 1 ||
            nuevaMeta > MAX_REGISTROS
        ) {
            alert(LS("registroAcademico.cantidadValida").replace("{max}", MAX_REGISTROS));
            return;
        }

        if (
            !Number.isInteger(nuevaDuracion) ||
            nuevaDuracion < MIN_DURACION_MINUTOS ||
            nuevaDuracion > MAX_DURACION_MINUTOS
        ) {
            alert(LS("registroAcademico.duracionValida")
                .replace("{min}", MIN_DURACION_MINUTOS)
                .replace("{max}", MAX_DURACION_MINUTOS));
            return;
        }

        const diasSeleccionados = [];
        if (nuevaFrecuencia === "personalizada") {
            botonesDias.forEach(btn => {
                if (btn.classList.contains("active")) {
                    diasSeleccionados.push(Number(btn.getAttribute("data-dia")));
                }
            });

            if (diasSeleccionados.length === 0) {
                alert(LS("registroAcademico.seleccionaUnDia"));
                return;
            }
        }

        if (!id) {
            alert(LS("sinInformacionDisponible"));
            return;
        }

        try {
            const respuesta = await fetch(
                `${API}actualizar-habito.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_habito_usuario: id,
                        objetivo: nuevaMeta,
                        unidad: "registros",
                        duracion_minutos: nuevaDuracion,
                        frecuencia: nuevaFrecuencia,
                        dias: diasSeleccionados
                    })
                }
            );

            if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);

            const datos = await respuesta.json();

            if (!datos.exito) {
                throw new Error(
                    datos.mensaje ||
                    LS("No se pudieron guardar los cambios.")
                );
            }

            objetivo = nuevaMeta;
            duracionSesion = nuevaDuracion;
            frecuenciaHabito = nuevaFrecuencia;
            diasHabito = diasSeleccionados;

            if (progreso > objetivo) {
                progreso = objetivo;
            }

            render();

            if (modalEditar && typeof bootstrap !== "undefined") {
                bootstrap.Modal
                    .getOrCreateInstance(modalEditar)
                    .hide();
            }

        } catch (error) {
            alert(error.message);
        }
    });

    btnReiniciarMeta?.addEventListener("click", async () => {
        if (
            !confirm(
                LS("registroAcademico.confirmarReiniciar")
            )
        ) {
            return;
        }

        if (!id) {
            return;
        }

        try {
            const respuesta = await fetch(
                `${API}eliminar-registros-hoy.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_habito_usuario: id
                    })
                }
            );

            if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);

            const datos = await respuesta.json();

            if (!datos.exito) {
                throw new Error(
                    datos.mensaje ||
                    LS("registroAcademico.noSePudoReiniciar")
                );
            }

            progreso = 0;

            render();

        } catch (error) {
            alert(error.message);
        }
    });

    window.addEventListener(
        "lifesyncIdiomaCambiado",
        render
    );

    cargar()
        .then(render)
        .catch(error => {
            console.error("LifeSync Académico:", error);
            alert(error.message);
        });
})();

if (typeof HabitoUniversal !== "undefined" && HabitoUniversal.init) {
    HabitoUniversal.init({
        btnOptionsId: "btn-options-academico",
        menuId: "kebab-menu-academico",
        btnDeshabilitarId: "btn-deshabilitar-habito",
        urlRedireccion: "inicio.html"
    });
}