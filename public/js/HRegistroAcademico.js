(function () {
    "use strict";

    const LS = t =>
        typeof window.traducirLifeSync === "function"
            ? window.traducirLifeSync(t)
            : t;

    const API = "../auth/";
    const CATEGORIA = "Académico";

    // Configuración de límites
    const MIN_DURACION_MINUTOS = 5;
    const MAX_DURACION_MINUTOS = 180; // Máximo 3 horas por sesión
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

    const menu = $("kebab-menu-academico");
    const ring = $("ring-academico");
    const contador = $("contador-academico");
    const meta = $("meta-academico");
    const labelFrecuencia = $("label-meta-frecuencia");
    const metaHorasTotales = $("meta-horas-totales");
    const lista = $("lista-registros");
    const btn = $("btn-add-registro");

    const btnOptions = $("btn-options-academico");
    const btnRegresar = $("btn-regresar");
    const btnEditarMeta = $("btn-editar-meta");
    const btnGuardarConfig = $("btn-guardar-config");
    const btnReiniciarMeta = $("btn-reiniciar-meta");

    // Elementos del Modal
    const inputRegistros = $("input-registros");
    const inputDuracion = $("input-duracion-sesion");
    const selectFrecuencia = $("select-frecuencia");
    const contenedorDias = $("contenedor-dias-semana");
    const botonesDias = document.querySelectorAll(".btn-dia-semana");

    const modalEditar = $("modalEditarAcademico");

    btnOptions?.addEventListener("click", e => {
        e.stopPropagation();
        menu?.classList.toggle("show");
    });

    document.addEventListener("click", e => {
        if (menu && !menu.contains(e.target)) {
            menu.classList.remove("show");
        }
    });

    btnRegresar?.addEventListener("click", e => {
        e.preventDefault();

        if (history.length > 1) {
            history.back();
        } else {
            location.href = "inicio.html";
        }
    });

    // Control de visibilidad para los días personalizados
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

    // Convierte el total de minutos en horas y minutos legibles
    function formatearHorasTotales(minutosTotales) {
        const horas = Math.floor(minutosTotales / 60);
        const mins = minutosTotales % 60;

        if (horas === 0) {
            return `${mins} min`;
        } else if (mins === 0) {
            return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
        } else {
            return `${horas}h ${mins}m`;
        }
    }

    async function cargar() {
        const query = id
            ? `?id_habito_usuario=${id}`
            : `?categoria=${encodeURIComponent(CATEGORIA)}`;

        const respuesta = await fetch(
            `${API}obtener-habito.php${query}`,
            {
                credentials: "include",
                cache: "no-store"
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito || !datos.habito) {
            throw new Error(
                datos.mensaje || LS("No se pudieron cargar los datos.")
            );
        }

        id = Number(datos.habito.id_habito_usuario);

        objetivo = Number(datos.habito.objetivo) || 3;
        progreso = Number(datos.habito.progreso_hoy) || 0;
        duracionSesion = Number(datos.habito.duracion_minutos) || 45;
        
        // Ajustar la duración al rango permitido si viene fuera de límites desde BD
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

        // 1. Etiqueta según la frecuencia
        if (labelFrecuencia) {
            switch (frecuenciaHabito) {
                case "semanal":
                    labelFrecuencia.textContent = LS("Meta semanal") || "Meta semanal";
                    break;
                case "mensual":
                    labelFrecuencia.textContent = LS("Meta mensual") || "Meta mensual";
                    break;
                case "personalizada":
                    labelFrecuencia.textContent = LS("Meta programada") || "Meta programada";
                    break;
                case "diaria":
                default:
                    labelFrecuencia.textContent = LS("Meta diaria") || "Meta diaria";
                    break;
            }
        }

        meta.textContent =
            `${objetivo} ${objetivo === 1
                ? LS("registroAcademico")
                : LS("registrosAcademicos")} (${duracionSesion} min/sesión)`;

        // 2. Cálculo total de horas acumuladas entre todas las sesiones
        if (metaHorasTotales) {
            const minutosTotales = objetivo * duracionSesion;
            metaHorasTotales.textContent = `Total: ${formatearHorasTotales(minutosTotales)} de estudio`;
        }

        // Anillo de progreso
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
            badgeResumen.textContent = `${progreso} de ${objetivo} completadas`;
        }

        lista.innerHTML = "";

        for (let i = 0; i < objetivo; i++) {
            const esCompletada = i < progreso;
            const tarjetaSesion = document.createElement("div");

            tarjetaSesion.className = `sesion-item ${esCompletada ? "completada" : "pendiente"}`;

            tarjetaSesion.innerHTML = `
                <i class="fa-solid ${esCompletada ? "fa-circle-check" : "fa-circle-dot"} sesion-icon"></i>
                <span class="sesion-numero">Sesión ${i + 1}</span>
            `;

            lista.appendChild(tarjetaSesion);
        }

        // 3. Validación de día activo cuando la frecuencia es personalizada
        const diaHoy = new Date().getDay(); // 0 = Domingo, 1 = Lunes...
        const esDiaPermitido = frecuenciaHabito !== "personalizada" || diasHabito.includes(diaHoy);

        if (!esDiaPermitido) {
            btn.disabled = true;
            btn.innerHTML = `<span>${LS("No programado para hoy")}</span>`;
        } else {
            btn.disabled = progreso >= objetivo;
            btn.innerHTML =
                `<span>${
                    progreso >= objetivo
                        ? LS("metaCompletada")
                        : LS("agregarRegistro")
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

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exito) {
                throw new Error(
                    datos.mensaje || LS("No se pudo registrar.")
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
            alert(LS(`Ingresa una cantidad válida de sesiones (1 - ${MAX_REGISTROS}).`));
            return;
        }

        // Validación estricta con el máximo de minutos por sesión
        if (
            !Number.isInteger(nuevaDuracion) ||
            nuevaDuracion < MIN_DURACION_MINUTOS ||
            nuevaDuracion > MAX_DURACION_MINUTOS
        ) {
            alert(LS(`La duración por sesión debe estar entre ${MIN_DURACION_MINUTOS} y ${MAX_DURACION_MINUTOS} minutos.`));
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
                alert(LS("seleccionaAlMenosUnDia"));
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

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exito) {
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
                LS("¿Quieres reiniciar la cuenta a 0?")
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

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exito) {
                throw new Error(
                    datos.mensaje ||
                    LS("No se pudo reiniciar.")
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