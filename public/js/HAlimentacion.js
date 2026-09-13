(function () {
    "use strict";

    const LS = texto => typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(texto) : texto;
    const API = "../auth/";
    const CATEGORIA = "Alimentación";
    const STORAGE = "lifesync_config_alimentacion";
    const params = new URLSearchParams(location.search);
    const $ = id => document.getElementById(id);

    let id = Number(params.get("id_habito_usuario")) || 0;
    let completadas = 0;
    let guardando = false;
    let config;

    const DEFAULT_CONFIG = [
        { id: "desayuno", icono: "fa-cloud-sun", activo: true, inicio: "07:00", fin: "09:00" },
        { id: "merienda_m", icono: "fa-cookie-bite", activo: false, inicio: "10:30", fin: "11:00" },
        { id: "almuerzo", icono: "fa-sun", activo: true, inicio: "12:30", fin: "14:30" },
        { id: "merienda_t", icono: "fa-mug-hot", activo: false, inicio: "16:30", fin: "17:00" },
        { id: "cena", icono: "fa-moon", activo: true, inicio: "19:00", fin: "21:00" }
    ];

    try {
        config = JSON.parse(localStorage.getItem(STORAGE) || "null") || DEFAULT_CONFIG;
    } catch (_) {
        config = DEFAULT_CONFIG;
    }

    const nombres = {
        desayuno: "desayuno",
        merienda_m: "meriendaManana",
        almuerzo: "almuerzo",
        merienda_t: "meriendaTarde",
        cena: "cena"
    };

    const btnOptions = $("btn-options-alimentacion");
    const kebab = $("kebab-menu-alimentacion");
    const lista = $("lista-comidas");
    const btnAdd = $("btn-add-comida");
    const contador = $("contador-comidas");
    const meta = $("meta-comidas");
    const ring = $("ring-comidas");
    const modal = $("modalEditarMeta");

    btnOptions?.addEventListener("click", e => {
        e.stopPropagation();
        kebab?.classList.toggle("show");
    });

    document.addEventListener("click", e => {
        if (kebab && !kebab.contains(e.target)) kebab.classList.remove("show");
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
        id = Number(d.habito.id_habito_usuario);
        completadas = Math.max(0, Number(d.habito.progreso_hoy) || 0);
    }

    function hora(valor) {
        if (!valor) return "";
        const [h, m] = valor.split(":").map(Number);
        return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
    }

    function activas() {
        return config.filter(c => c.activo);
    }

    function render() {
        if (!lista || !contador || !meta || !ring || !btnAdd) return;
        const comidas = activas();
        const total = comidas.length;
        const hechas = Math.min(completadas, total);

        contador.textContent = `${hechas}/${total}`;
        meta.textContent = `${total} ${LS("tiemposAlDia")}`;
        const porcentaje = total ? Math.min(100, hechas / total * 100) : 0;
        ring.style.background = `conic-gradient(var(--ls-emerald) ${porcentaje}%, rgba(44,212,120,.15) ${porcentaje}%)`;

        lista.innerHTML = "";
        comidas.forEach((comida, index) => {
            const hecho = index < hechas;
            const card = document.createElement("div");
            card.className = `text-center comida-card p-2 rounded-3 ${hecho ? "comida-completada" : ""}`;
            card.style.cssText = "cursor:pointer;min-width:75px";
            card.innerHTML = `<i class="fa-solid ${comida.icono} ${hecho ? "text-emerald" : "text-subtle"} fs-4 mb-1"></i><span class="d-block ${hecho ? "text-white" : "text-subtle"} fw-medium subtexto-fluido">${LS(nombres[comida.id])}</span><span class="d-block text-subtle small hora-rango-texto">${hora(comida.inicio)} - ${hora(comida.fin)}</span>`;
            card.addEventListener("click", () => toggleComida(comida, hecho));
            lista.appendChild(card);
        });

        const completa = total > 0 && hechas >= total;
        btnAdd.disabled = completa || guardando;
        btnAdd.innerHTML = `<span>${completa ? LS("comidasCompletadas") : LS("sumarComida")}</span>`;
    }

    async function toggleComida(comida, hecho) {
        if (guardando || !id) return;
        guardando = true;
        render();
        try {
            if (hecho) {
                const r = await fetch(`${API}eliminar-registro.php`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_habito_usuario: id, observaciones: comida.id })
                });
                const d = await r.json();
                if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudo quitar la comida."));
                completadas = Math.max(0, completadas - 1);
            } else {
                await registrar(comida.id);
            }
        } catch (e) {
            alert(e.message);
        } finally {
            guardando = false;
            render();
        }
    }

    async function registrar(idComida = "comida") {
        const total = activas().length;
        if (completadas >= total || !id) return;

        const r = await fetch(`${API}registrar-habito.php`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_habito_usuario: id, valor: 1, observaciones: idComida })
        });
        const d = await r.json();
        if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudo registrar la comida."));
        completadas = Number(d.registro.progreso_hoy) || completadas + 1;
    }

    btnAdd?.addEventListener("click", async () => {
        if (guardando || btnAdd.disabled) return;
        const siguiente = activas()[completadas];
        if (!siguiente) return;
        guardando = true;
        render();
        try {
            await registrar(siguiente.id);
        } catch (e) {
            alert(e.message);
        } finally {
            guardando = false;
            render();
        }
    });

    function cargarFormulario() {
        ["desayuno", "merienda_m", "almuerzo", "merienda_t", "cena"].forEach(idComida => {
            const c = config.find(x => x.id === idComida);
            if (!c) return;
            $("time-" + idComida.replace("_", "-") + "-inicio") && ($("time-" + idComida.replace("_", "-") + "-inicio").value = c.inicio);
            $("time-" + idComida.replace("_", "-") + "-fin") && ($("time-" + idComida.replace("_", "-") + "-fin").value = c.fin);
        });
        if ($("switch-merienda-m")) $("switch-merienda-m").checked = !!config.find(c => c.id === "merienda_m")?.activo;
        if ($("switch-merienda-t")) $("switch-merienda-t").checked = !!config.find(c => c.id === "merienda_t")?.activo;
        actualizarSwitches();
    }

    function actualizarSwitches() {
        [["merienda-m", "merienda_m"], ["merienda-t", "merienda_t"]].forEach(([ui, db]) => {
            const sw = $("switch-" + ui);
            $("time-" + ui + "-inicio")?.toggleAttribute("disabled", !sw?.checked);
            $("time-" + ui + "-fin")?.toggleAttribute("disabled", !sw?.checked);
            const c = config.find(x => x.id === db);
            if (c) c.activo = !!sw?.checked;
        });
    }

    $("switch-merienda-m")?.addEventListener("change", actualizarSwitches);
    $("switch-merienda-t")?.addEventListener("change", actualizarSwitches);
    $("btn-editar-meta")?.addEventListener("click", e => {
        e.preventDefault();
        kebab?.classList.remove("show");
        cargarFormulario();
    });

    $("btn-guardar-configuracion")?.addEventListener("click", async () => {
        const get = name => $(name)?.value || "";
        config = [
            { id: "desayuno", icono: "fa-cloud-sun", activo: true, inicio: get("time-desayuno-inicio"), fin: get("time-desayuno-fin") },
            { id: "merienda_m", icono: "fa-cookie-bite", activo: !!$("switch-merienda-m")?.checked, inicio: get("time-merienda-m-inicio"), fin: get("time-merienda-m-fin") },
            { id: "almuerzo", icono: "fa-sun", activo: true, inicio: get("time-almuerzo-inicio"), fin: get("time-almuerzo-fin") },
            { id: "merienda_t", icono: "fa-mug-hot", activo: !!$("switch-merienda-t")?.checked, inicio: get("time-merienda-t-inicio"), fin: get("time-merienda-t-fin") },
            { id: "cena", icono: "fa-moon", activo: true, inicio: get("time-cena-inicio"), fin: get("time-cena-fin") }
        ];

        const comidas = activas();
        if (!comidas.length) return alert(LS("especificaHoras"));
        if (comidas.some(c => !c.inicio || !c.fin)) return alert(LS("especificaHoras"));

        try {
            const r = await fetch(`${API}actualizar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_habito_usuario: id, objetivo: comidas.length, unidad: "comidas" })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudieron guardar los cambios."));
            localStorage.setItem(STORAGE, JSON.stringify(config));
            completadas = Math.min(completadas, comidas.length);
            render();
            bootstrap.Modal.getInstance(modal)?.hide();
        } catch (e) {
            alert(e.message);
        }
    });

    window.addEventListener("lifesyncIdiomaCambiado", render);
    cargar().then(render).catch(e => alert(e.message));
})();
