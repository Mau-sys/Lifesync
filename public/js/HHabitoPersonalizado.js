(function () {
    "use strict";

    const LS = texto => typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(texto) : texto;
    const API = "../auth/";
    const params = new URLSearchParams(location.search);
    const $ = id => document.getElementById(id);

    let id = Number(params.get("id_habito_usuario")) || 0;
    let objetivo = 1;
    let progreso = 0;
    let frecuencia = "diaria";
    let guardando = false;

    const menu = $("kebab-menu-personalizado");
    const ring = $("ring-veces-personalizado");
    const contador = $("contador-veces-personalizado");
    const descripcion = $("habito-descripcion");
    const frecuenciaTexto = $("habito-frecuencia");
    const btn = $("btn-add-registro");

    $("btn-options-personalizado")?.addEventListener("click", e => {
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

    function textoFrecuencia(valor) {
        const mapa = {
            diaria: LS("diaria"),
            semanal: LS("semanal"),
            mensual: LS("mensual"),
            personalizada: LS("personalizada")
        };
        return mapa[valor] || valor || LS("diaria");
    }

    async function cargar() {
        if (!id) throw new Error(LS("No se indicó el hábito personalizado."));
        const r = await fetch(`${API}obtener-habito.php?id_habito_usuario=${id}`, { credentials: "include", cache: "no-store" });
        const d = await r.json();
        if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudieron cargar los datos."));

        const h = d.habito;
        id = Number(h.id_habito_usuario);
        objetivo = Number(h.objetivo) || 1;
        progreso = Number(h.progreso_hoy) || 0;
        frecuencia = h.frecuencia || "diaria";
        if (descripcion) descripcion.textContent = h.descripcion || h.nombre_habito || LS("Mi hábito");
        if (frecuenciaTexto) frecuenciaTexto.textContent = textoFrecuencia(frecuencia);
    }

    function render() {
        if (!contador || !ring || !btn) return;
        contador.textContent = `${progreso}/${objetivo}`;
        const porcentaje = objetivo ? Math.min(100, progreso / objetivo * 100) : 0;
        ring.style.background = `conic-gradient(var(--ls-orange) ${porcentaje}%, rgba(249,115,22,.15) ${porcentaje}%)`;
        btn.disabled = progreso >= objetivo || guardando;
        btn.innerHTML = `<span>${progreso >= objetivo ? LS("metaCompletada") : LS("agregarRegistro")}</span>`;
        if (frecuenciaTexto) frecuenciaTexto.textContent = textoFrecuencia(frecuencia);
    }

    btn?.addEventListener("click", async () => {
        if (btn.disabled || !id) return;
        guardando = true;
        render();
        try {
            const r = await fetch(`${API}registrar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_habito_usuario: id, valor: 1, observaciones: "hábito personalizado" })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudo registrar."));
            progreso = Number(d.registro.progreso_hoy) || progreso + 1;
        } catch (e) {
            alert(e.message);
        } finally {
            guardando = false;
            render();
        }
    });

    $("btn-eliminar-habito")?.addEventListener("click", async e => {
        e.preventDefault();
        if (!id || !confirm(LS("¿Quieres eliminar este hábito?"))) return;
        try {
            const r = await fetch(`${API}eliminar-personalizado.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_habito_usuario: id })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudo eliminar el hábito."));
            location.href = "inicio.html";
        } catch (e) {
            alert(e.message);
        }
    });

    $("btn-editar-meta")?.addEventListener("click", e => {
        e.preventDefault();
        menu?.classList.remove("show");
        alert(LS("La edición de este hábito se realiza desde la configuración del hábito personalizado."));
    });

    window.addEventListener("lifesyncIdiomaCambiado", render);
    cargar().then(render).catch(e => alert(e.message));
})();
