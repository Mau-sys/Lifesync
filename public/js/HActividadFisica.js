(function () {
    "use strict";

    const LS = texto => typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(texto) : texto;
    const API = "../auth/";
    const CATEGORIA = "Actividad Física";
    const params = new URLSearchParams(location.search);
    const $ = id => document.getElementById(id);

    let id = Number(params.get("id_habito_usuario")) || 0;
    let tipoMeta = "semanal";
    let metaSesiones = 5;
    let metaMinutos = 150;
    let dias = [0, 2, 4];
    let sesiones = 0;
    let minutos = 0;
    let cargando = false;

    const menu = $("kebab-menu-actividad-fisica");
    const ring = $("ring-sesiones-fisica");
    const contador = $("contador-sesiones-fisica");
    const meta = $("meta-fisica");
    const tiempo = $("tiempo-acumulado-fisica");
    const btn = $("btn-add-sesion-fisica");
    const modalSesion = typeof bootstrap !== "undefined" && $("modalRegistrarSesion") ? new bootstrap.Modal($("modalRegistrarSesion")) : null;
    const modalMeta = typeof bootstrap !== "undefined" && $("modalEditarMetaFisica") ? new bootstrap.Modal($("modalEditarMetaFisica")) : null;

    $("btn-options-actividad-fisica")?.addEventListener("click", e => {
        e.stopPropagation();
        menu?.classList.toggle("show");
    });

    document.addEventListener("click", e => {
        if (menu && !menu.contains(e.target)) menu.classList.remove("show");
    });

    $("btn-regresar")?.addEventListener("click", e => {
        e.preventDefault();
        history.length > 1 ? history.back() : location.href = "inicio.html";
    });

    function normalizarFrecuencia(valor) {
        return valor === "personalizada" ? "personalizado" : (valor || "semanal");
    }

    function frecuenciaBD(valor) {
        return valor === "personalizado" ? "personalizada" : valor;
    }

    function formatMin(valor) {
        const n = Number(valor) || 0;
        if (n < 60) return `${n} ${LS("min")}`;
        const h = Math.floor(n / 60);
        const m = n % 60;
        if (!m) return `${h} ${h === 1 ? LS("hora") : LS("horas")}`;
        return `${h} ${h === 1 ? LS("hora") : LS("horas")} ${LS("y")} ${m} ${LS("min")}`;
    }

    function aplicarDiasServidor(diasServidor) {
        if (Array.isArray(diasServidor) && diasServidor.length) {
            dias = diasServidor.map(Number).filter(n => n >= 1 && n <= 7).map(n => n - 1);
        }
    }

    async function cargar() {
        const q = id ? `?id_habito_usuario=${id}` : `?categoria=${encodeURIComponent(CATEGORIA)}`;
        const r = await fetch(`${API}obtener-habito.php${q}`, { credentials: "include", cache: "no-store" });
        const d = await r.json();
        if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudieron cargar los datos."));

        id = Number(d.habito.id_habito_usuario);
        metaSesiones = Number(d.habito.objetivo) || 5;
        metaMinutos = Number(d.habito.duracion_minutos) || 150;
        tipoMeta = normalizarFrecuencia(d.habito.frecuencia);
        sesiones = Number(d.habito.progreso_hoy) || 0;
        minutos = Number(d.habito.suma_hoy) || 0;
        aplicarDiasServidor(d.habito.dias_activos);
    }

    function render() {
        if (!contador || !meta || !ring || !btn || !tiempo) return;

        contador.textContent = `${sesiones}/${metaSesiones}`;
        meta.textContent = `${metaSesiones} ${metaSesiones === 1 ? LS("sesion") : LS("sesiones")} (${formatMin(metaMinutos)})`;
        tiempo.textContent = `${formatMin(minutos)} / ${formatMin(metaMinutos)}`;

        const porcentaje = metaSesiones ? Math.min(100, sesiones / metaSesiones * 100) : 0;
        ring.style.background = `conic-gradient(var(--ls-amber) ${porcentaje}%, rgba(255,159,28,.15) ${porcentaje}%)`;

        const completada = sesiones >= metaSesiones;
        btn.disabled = completada || cargando;
        btn.innerHTML = `<span>${completada ? LS("metaCompletada") : LS("registrarSesion")}</span>`;

        const label = $("label-tipo-meta");
        if (label) {
            label.textContent = tipoMeta === "diaria" ? LS("metaDiaria") : tipoMeta === "mensual" ? LS("metaMensual") : tipoMeta === "personalizado" ? LS("metaDeDias").replace("{n}", dias.length).replace("{unidad}", dias.length === 1 ? LS("dia") : LS("dias")) : LS("metaSemanal");
        }
    }

    $("btn-add-sesion-fisica")?.addEventListener("click", () => modalSesion?.show());

    $("btn-guardar-sesion")?.addEventListener("click", async () => {
        if (cargando || !id) return;
        const duracion = Number($("input-duracion-minutos")?.value);
        if (!Number.isInteger(duracion) || duracion < 1 || duracion > 360) {
            alert(LS("tiempoSesionValido"));
            return;
        }

        cargando = true;
        render();
        try {
            const r = await fetch(`${API}registrar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_habito_usuario: id,
                    valor: duracion,
                    observaciones: $("select-tipo-actividad")?.value || "Actividad"
                })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudo registrar la sesión."));

            sesiones = Number(d.registro.progreso_hoy) || sesiones + 1;
            minutos = Number(d.registro.suma_hoy) || minutos + duracion;
            render();
            modalSesion?.hide();
            $("form-registrar-sesion")?.reset();
        } catch (e) {
            alert(e.message);
        } finally {
            cargando = false;
            render();
        }
    });

    $("btn-editar-meta")?.addEventListener("click", e => {
        e.preventDefault();
        menu?.classList.remove("show");
        if ($("select-tipo-meta")) $("select-tipo-meta").value = tipoMeta;
        if ($("input-meta-cantidad")) $("input-meta-cantidad").value = metaSesiones;
        if ($("input-meta-minutos")) $("input-meta-minutos").value = metaMinutos;
        document.querySelectorAll(".btn-dia-pill").forEach(b => b.classList.toggle("active", dias.includes(Number(b.dataset.dia))));
        $("contenedor-dias-semana")?.classList.toggle("d-none", tipoMeta !== "personalizado");
        modalMeta?.show();
    });

    $("select-tipo-meta")?.addEventListener("change", e => {
        tipoMeta = e.target.value;
        $("contenedor-dias-semana")?.classList.toggle("d-none", tipoMeta !== "personalizado");
    });

    document.querySelectorAll(".btn-dia-pill").forEach(b => b.addEventListener("click", () => {
        const dia = Number(b.dataset.dia);
        if (dias.includes(dia)) dias = dias.filter(x => x !== dia);
        else dias.push(dia);
        b.classList.toggle("active", dias.includes(dia));
    }));

    $("btn-guardar-meta")?.addEventListener("click", async () => {
        const n = Number($("input-meta-cantidad")?.value);
        const m = Number($("input-meta-minutos")?.value);
        if (!Number.isInteger(n) || n < 1 || n > 50) return alert(LS("numeroSesionesValido"));
        if (!Number.isInteger(m) || m < 10 || m > 3000) return alert(LS("duracionSesionValida"));
        if (tipoMeta === "personalizado" && dias.length === 0) return alert(LS("seleccionarDiaSemana"));

        try {
            const r = await fetch(`${API}actualizar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_habito_usuario: id,
                    objetivo: n,
                    unidad: "sesiones",
                    frecuencia: frecuenciaBD(tipoMeta),
                    duracion_minutos: m,
                    dias: tipoMeta === "personalizado" ? dias.map(x => x + 1) : []
                })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudieron guardar los cambios."));

            metaSesiones = n;
            metaMinutos = m;
            sesiones = Math.min(sesiones, n);
            minutos = Math.min(minutos, m);
            render();
            modalMeta?.hide();
            menu?.classList.remove("show");
        } catch (e) {
            alert(e.message);
        }
    });

    $("btn-reiniciar-habito-modal")?.addEventListener("click", async () => {
        if (!confirm(LS("¿Quieres reiniciar la cuenta a 0?"))) return;
        try {
            const r = await fetch(`${API}eliminar-registros-hoy.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_habito_usuario: id })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudo reiniciar."));
            sesiones = 0;
            minutos = 0;
            render();
            modalMeta?.hide();
        } catch (e) {
            alert(e.message);
        }
    });

    window.addEventListener("lifesyncIdiomaCambiado", render);
    cargar().then(render).catch(e => alert(e.message));
})();
