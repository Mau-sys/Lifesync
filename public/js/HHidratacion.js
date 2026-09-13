(function () {
    "use strict";

    const LS = texto => typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(texto) : texto;
    const API = "../auth/";
    const CATEGORIA = "Hidratación";
    const params = new URLSearchParams(location.search);
    const $ = id => document.getElementById(id);

    let id = Number(params.get("id_habito_usuario")) || 0;
    let vasosTomados = 0;
    let vasosTotales = 8;
    let capacidadVaso = Number(localStorage.getItem("lifesync_hidratacion_capacidad")) || 250;
    let cargando = false;

    const btnOptions = $("btn-options-hidratacion");
    const kebabMenu = $("kebab-menu-hidratacion");
    const ring = $("ring-hidratacion");
    const contador = $("contador-vasos");
    const meta = $("meta-vasos");
    const btnAdd = $("btn-add-vaso");
    const contenedor = $("contenedor-vasos-iconos");
    const inputVasos = $("input-vasos");
    const inputCapacidad = $("input-capacidad");
    const preview = $("preview-meta-total");

    btnOptions?.addEventListener("click", e => {
        e.stopPropagation();
        kebabMenu?.classList.toggle("show");
    });

    document.addEventListener("click", e => {
        if (kebabMenu && !kebabMenu.contains(e.target)) kebabMenu.classList.remove("show");
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
        vasosTotales = Number(d.habito.objetivo) || 8;
        vasosTomados = Number(d.habito.progreso_hoy) || 0;
    }

    function actualizarPreview() {
        if (!preview) return;
        const vasos = Number(inputVasos?.value) || 0;
        const capacidad = Number(inputCapacidad?.value) || 0;
        preview.textContent = `${((vasos * capacidad) / 1000).toFixed(1)} ${LS("Litros / día")}`;
    }

    function render() {
        if (!contador || !meta || !ring || !btnAdd || !contenedor) return;
        contador.textContent = `${vasosTomados}/${vasosTotales}`;
        const litros = ((vasosTotales * capacidadVaso) / 1000).toFixed(1);
        meta.textContent = `${vasosTotales} ${LS("vasos al día")} (${litros}L - ${capacidadVaso}ml/${LS("vaso")})`;

        const porcentaje = vasosTotales ? Math.min(100, vasosTomados / vasosTotales * 100) : 0;
        ring.style.background = `conic-gradient(var(--ls-cyan) ${porcentaje}%, rgba(6,182,212,.15) ${porcentaje}%)`;
        btnAdd.disabled = vasosTomados >= vasosTotales || cargando;
        btnAdd.innerHTML = `<span>${vasosTomados >= vasosTotales ? LS("¡Meta alcanzada!") : LS("+1 vaso")}</span>`;

        contenedor.innerHTML = "";
        for (let i = 0; i < vasosTotales; i++) {
            const icono = document.createElement("i");
            icono.className = `fa-solid fa-glass-water ${i < vasosTomados ? "text-cyan" : "text-muted-glass"}`;
            contenedor.appendChild(icono);
        }

        if (inputVasos) inputVasos.value = vasosTotales;
        if (inputCapacidad) inputCapacidad.value = capacidadVaso;
        actualizarPreview();
    }

    async function registrar() {
        if (cargando || !id || vasosTomados >= vasosTotales) return;
        cargando = true;
        render();
        try {
            const r = await fetch(`${API}registrar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_habito_usuario: id, valor: 1, observaciones: "vaso" })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudo registrar el vaso."));
            vasosTomados = Number(d.registro.progreso_hoy) || vasosTomados + 1;
        } catch (e) {
            alert(e.message);
        } finally {
            cargando = false;
            render();
        }
    }

    async function guardarConfiguracion() {
        const vasos = Number(inputVasos?.value);
        const capacidad = Number(inputCapacidad?.value);
        if (!Number.isInteger(vasos) || vasos < 1 || vasos > 30) return alert(LS("Por favor ingresa una cantidad de vasos válida (1 a 30)."));
        if (!Number.isInteger(capacidad) || capacidad < 100 || capacidad > 1000) return alert(LS("Por favor ingresa una capacidad de vaso válida (100 a 1000 ml)."));

        try {
            const r = await fetch(`${API}actualizar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_habito_usuario: id, objetivo: vasos, unidad: "vasos" })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudieron guardar los cambios."));
            vasosTotales = vasos;
            capacidadVaso = capacidad;
            vasosTomados = Math.min(vasosTomados, vasosTotales);
            localStorage.setItem("lifesync_hidratacion_capacidad", String(capacidadVaso));
            render();
            bootstrap.Modal.getInstance($("modalEditarHidratacion"))?.hide();
            kebabMenu?.classList.remove("show");
        } catch (e) {
            alert(e.message);
        }
    }

    async function reiniciar() {
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
            vasosTomados = 0;
            render();
            bootstrap.Modal.getInstance($("modalEditarHidratacion"))?.hide();
        } catch (e) {
            alert(e.message);
        }
    }

    $("btn-editar-meta")?.addEventListener("click", e => {
        e.preventDefault();
        kebabMenu?.classList.remove("show");
        render();
    });
    inputVasos?.addEventListener("input", actualizarPreview);
    inputCapacidad?.addEventListener("input", actualizarPreview);
    btnAdd?.addEventListener("click", registrar);
    $("btn-guardar-config")?.addEventListener("click", guardarConfiguracion);
    $("btn-reiniciar-meta")?.addEventListener("click", reiniciar);
    window.addEventListener("lifesyncIdiomaCambiado", render);

    cargar().then(render).catch(e => alert(e.message));
})();
