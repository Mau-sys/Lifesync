(function () {
    "use strict";

    const LS = texto => typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(texto) : texto;
    const API = "../auth/";
    const CATEGORIA = "Salud Mental";
    const $ = id => document.getElementById(id);
    const params = new URLSearchParams(location.search);

    let id = Number(params.get("id_habito_usuario")) || 0;
    let objetivo = 2;
    let duracion = 15;
    let frecuencia = "diaria";
    let dias = [1, 2, 3, 4, 5];
    let progreso = 0;

    const ring = $("ring-saludmental");
    const contador = $("contador-saludmental");
    const meta = $("meta-saludmental");
    const lista = $("lista-pausas");
    const btn = $("btn-add-pausa");
    const menu = $("kebab-menu-saludmental");

    $("btn-options-saludmental")?.addEventListener("click", e => {
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

    async function cargar() {
        const q = id ? `?id_habito_usuario=${id}` : `?categoria=${encodeURIComponent(CATEGORIA)}`;
        const r = await fetch(`${API}obtener-habito.php${q}`, { credentials: "include", cache: "no-store" });
        const d = await r.json();
        if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudieron cargar los datos."));

        const h = d.habito;
        id = Number(h.id_habito_usuario);
        objetivo = Number(h.objetivo) || 2;
        duracion = Number(h.duracion_minutos) || 15;
        frecuencia = h.frecuencia || "diaria";
        progreso = Number(h.progreso_hoy) || 0;

        if (Array.isArray(h.dias_activos) && h.dias_activos.length) {
            dias = h.dias_activos.map(Number).filter(n => n >= 1 && n <= 7).map(n => n - 1);
        }
    }

    function activoHoy() {
        if (frecuencia !== "personalizada") return true;
        return dias.includes(new Date().getDay());
    }

    function render() {
        if (!contador || !meta || !ring || !btn) return;
        contador.textContent = `${progreso}/${objetivo}`;
        meta.textContent = `${objetivo} ${LS("pausasAlDia")} (${duracion} ${LS("min")})`;

        const porcentaje = objetivo ? Math.min(100, progreso / objetivo * 100) : 0;
        ring.style.background = `conic-gradient(var(--ls-purple) ${porcentaje}%, rgba(139,92,246,.15) ${porcentaje}%)`;

        if (lista) {
            lista.innerHTML = "";
            for (let i = 0; i < objetivo; i++) {
                const item = document.createElement("span");
                item.className = `badge rounded-pill ${i < progreso ? "bg-purple" : "bg-secondary"} m-1`;
                item.textContent = `${LS("pausa")} ${i + 1}`;
                lista.appendChild(item);
            }
        }

        const descanso = !activoHoy();
        btn.disabled = progreso >= objetivo || descanso;
        btn.innerHTML = `<span>${progreso >= objetivo ? LS("metaCompletada") : descanso ? LS("diaDescansoMeta") : LS("registrarPausa")}</span>`;
    }

    btn?.addEventListener("click", async () => {
        if (btn.disabled || !id) return;
        try {
            const r = await fetch(`${API}registrar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_habito_usuario: id, valor: 1, observaciones: `pausa ${duracion} min` })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudo registrar la pausa."));
            progreso = Number(d.registro.progreso_hoy) || progreso + 1;
            render();
        } catch (e) {
            alert(e.message);
        }
    });

    $("select-frecuencia")?.addEventListener("change", e => {
        frecuencia = e.target.value;
        $("contenedor-dias-semana")?.classList.toggle("d-none", frecuencia !== "personalizada");
    });

    $("btn-editar-meta")?.addEventListener("click", e => {
        e.preventDefault();
        menu?.classList.remove("show");
        if ($("input-pausas")) $("input-pausas").value = objetivo;
        if ($("input-duracion")) $("input-duracion").value = duracion;
        if ($("select-frecuencia")) $("select-frecuencia").value = frecuencia;
        $("contenedor-dias-semana")?.classList.toggle("d-none", frecuencia !== "personalizada");
        document.querySelectorAll(".btn-dia").forEach(b => b.classList.toggle("active", dias.includes(Number(b.dataset.dia))));
    });

    document.querySelectorAll(".btn-dia").forEach(b => b.addEventListener("click", () => {
        const dia = Number(b.dataset.dia);
        if (dias.includes(dia)) dias = dias.filter(x => x !== dia);
        else dias.push(dia);
        b.classList.toggle("active", dias.includes(dia));
    }));

    $("btn-guardar-config")?.addEventListener("click", async () => {
        const n = Number($("input-pausas")?.value);
        const m = Number($("input-duracion")?.value);
        const f = $("select-frecuencia")?.value || "diaria";

        if (!Number.isInteger(n) || n < 1 || n > 20) return alert(LS("numeroPausasValido"));
        if (!Number.isInteger(m) || m < 1 || m > 240) return alert(LS("duracionPausaValida"));
        if (f === "personalizada" && !dias.length) return alert(LS("seleccionarDiaActivo"));

        try {
            const r = await fetch(`${API}actualizar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_habito_usuario: id,
                    objetivo: n,
                    unidad: "pausas",
                    duracion_minutos: m,
                    frecuencia: f,
                    dias: f === "personalizada" ? dias.map(x => x + 1) : []
                })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudieron guardar los cambios."));

            objetivo = n;
            duracion = m;
            frecuencia = f;
            progreso = Math.min(progreso, objetivo);
            render();
            bootstrap.Modal.getInstance($("modalEditarSaludMental"))?.hide();
        } catch (e) {
            alert(e.message);
        }
    });

    $("btn-reiniciar-meta")?.addEventListener("click", async () => {
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
            progreso = 0;
            render();
            bootstrap.Modal.getInstance($("modalEditarSaludMental"))?.hide();
        } catch (e) {
            alert(e.message);
        }
    });

    window.addEventListener("lifesyncIdiomaCambiado", render);
    cargar().then(render).catch(e => alert(e.message));
})();
