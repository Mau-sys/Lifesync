(function () {
    "use strict";

    const LS = texto => typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(texto) : texto;
    
    
    const API = window.location.pathname.includes("/public/") ? "../auth/" : "auth/";
    const params = new URLSearchParams(location.search);
    const $ = id => document.getElementById(id);

    
    let idHabitoUsuario = Number(params.get("id_habito_usuario")) || Number(params.get("id")) || 0;
    let categoriaParam = params.get("categoria") || "";

    let habitoActual = null;
    let guardando = false;

    const menu = $("kebab-menu-personalizado");
    const ring = $("ring-veces-personalizado");
    const contador = $("contador-veces-personalizado");
    const tituloHabito = $("titulo-habito");
    const descripcion = $("habito-descripcion");
    const frecuenciaTexto = $("habito-frecuencia");
    const btnAdd = $("btn-add-registro");
    const msgBloqueado = $("mensaje-dia-bloqueado");

    let modalEditar = null;
    if ($("modalEditarHabito") && typeof bootstrap !== "undefined") {
        modalEditar = new bootstrap.Modal($("modalEditarHabito"));
    }

    
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

    
    function esDiaHabilitado() {
        if (!habitoActual) return true;

        const frecuencia = (habitoActual.frecuencia || "").toLowerCase();
        const diasActivos = Array.isArray(habitoActual.dias_activos) ? habitoActual.dias_activos : [];

        if (frecuencia === "dias específicos" || frecuencia === "personalizada") {
            if (diasActivos.length === 0) return true;

            let diaJS = new Date().getDay(); 
            let diaMySQL = diaJS === 0 ? 7 : diaJS; 
            return diasActivos.includes(diaMySQL);
        }

        return true;
    }

    function formatearTextoFrecuencia() {
        if (!habitoActual) return "Diario";
        const frecuencia = (habitoActual.frecuencia || "").toLowerCase();
        const diasActivos = Array.isArray(habitoActual.dias_activos) ? habitoActual.dias_activos : [];

        if (frecuencia === "dias específicos" || frecuencia === "personalizada") {
            const nombresDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
            const diasTexto = diasActivos.map(d => nombresDias[d - 1]).filter(Boolean).join(", ");
            return `Personalizado (${diasTexto || "Sin días"})`;
        }

        const mapa = { diaria: "Diario", semanal: "Semanal", mensual: "Mensual" };
        return mapa[frecuencia] || habitoActual.frecuencia || "Diario";
    }

    async function cargarHabito() {
        let url = `${API}Obtener_habito.php?`;
        if (idHabitoUsuario > 0) {
            url += `id_habito_usuario=${idHabitoUsuario}`;
        } else if (categoriaParam) {
            url += `categoria=${encodeURIComponent(categoriaParam)}`;
        } else {
            url += `categoria=Hábito Personalizado`;
        }

        const r = await fetch(url, { credentials: "include", cache: "no-store" });
        
        if (!r.ok) {
            throw new Error(`Error en el servidor (${r.status}): No se encontró el archivo en ${url}`);
        }

        const d = await r.json();

        if (!d.exito) {
            throw new Error(d.mensaje || LS("No se pudieron cargar los datos del hábito."));
        }

        habitoActual = d.habito;
        idHabitoUsuario = Number(habitoActual.id_habito_usuario);

        habitoActual.dias_activos = Array.isArray(d.habito.dias_activos) ? d.habito.dias_activos : [];

        if (tituloHabito) tituloHabito.textContent = habitoActual.nombre_habito || "Hábito Personalizado";
        if (descripcion) descripcion.textContent = habitoActual.descripcion || habitoActual.nombre_habito;
    }

    function render() {
        if (!habitoActual || !contador || !ring || !btnAdd) return;

        const objetivo = Number(habitoActual.objetivo) || 1;
        const progreso = Number(habitoActual.progreso_hoy) || 0;
        const habilitadoHoy = esDiaHabilitado();

        contador.textContent = `${progreso}/${objetivo}`;

        const porcentaje = objetivo > 0 ? Math.min(100, (progreso / objetivo) * 100) : 0;
        ring.style.background = `conic-gradient(var(--ls-orange) ${porcentaje}%, rgba(249,115,22,.15) ${porcentaje}%)`;

        if (!habilitadoHoy) {
            btnAdd.disabled = true;
            btnAdd.innerHTML = `<span>Día no programado</span>`;
            if (msgBloqueado) msgBloqueado.classList.remove("d-none");
        } else {
            if (msgBloqueado) msgBloqueado.classList.add("d-none");
            btnAdd.disabled = progreso >= objetivo || guardando;
            btnAdd.innerHTML = `<span>${progreso >= objetivo ? "Meta Completada" : "+1 registro"}</span>`;
        }

        if (frecuenciaTexto) frecuenciaTexto.textContent = formatearTextoFrecuencia();
    }

    // Botón para agregar progreso (+1)
    btnAdd?.addEventListener("click", async () => {
        if (btnAdd.disabled || !idHabitoUsuario || !esDiaHabilitado()) return;

        guardando = true;
        render();

        try {
            const r = await fetch(`${API}registrar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_habito_usuario: idHabitoUsuario,
                    valor: 1,
                    observaciones: "registro personalizado"
                })
            });

            if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);

            const d = await r.json();
            if (!d.exito) throw new Error(d.mensaje || LS("No se pudo registrar."));

            await cargarHabito();
        } catch (e) {
            alert(e.message);
        } finally {
            guardando = false;
            render();
        }
    });

    // Abrir Modal de Edición
    $("btn-editar-meta")?.addEventListener("click", e => {
        e.preventDefault();
        menu?.classList.remove("show");

        if (!habitoActual) return;

        if ($("editNombre")) $("editNombre").value = habitoActual.nombre_habito || "";
        if ($("editDescripcion")) $("editDescripcion").value = habitoActual.descripcion || "";
        if ($("editObjetivo")) $("editObjetivo").value = habitoActual.objetivo || 1;

        const freq = (habitoActual.frecuencia || "").toLowerCase();
        const esEspecial = freq === "dias específicos" || freq === "personalizada";
        if ($("editFrecuencia")) $("editFrecuencia").value = esEspecial ? "dias específicos" : freq;

        const contenedorDias = $("contenedorDiasSemana");
        if (contenedorDias) {
            if (esEspecial) {
                contenedorDias.classList.remove("d-none");
            } else {
                contenedorDias.classList.add("d-none");
            }
        }

        const diasActivos = Array.isArray(habitoActual.dias_activos) ? habitoActual.dias_activos : [];
        document.querySelectorAll('input[name="diasSemana"]').forEach(cb => {
            cb.checked = diasActivos.includes(Number(cb.value));
        });

        modalEditar?.show();
    });

    // Selector de frecuencia en Modal
    $("editFrecuencia")?.addEventListener("change", e => {
        const contenedor = $("contenedorDiasSemana");
        if (contenedor) {
            if (e.target.value === "dias específicos") {
                contenedor.classList.remove("d-none");
            } else {
                contenedor.classList.add("d-none");
            }
        }
    });

    // Formulario de Edición
    $("formEditarHabito")?.addEventListener("submit", async e => {
        e.preventDefault();

        const nuevaFrecuencia = $("editFrecuencia").value;
        const diasSeleccionados = [];

        if (nuevaFrecuencia === "dias específicos") {
            document.querySelectorAll('input[name="diasSemana"]:checked').forEach(cb => {
                diasSeleccionados.push(Number(cb.value));
            });

            if (diasSeleccionados.length === 0) {
                alert("Por favor selecciona al menos un día de la semana.");
                return;
            }
        }

        try {
            const res = await fetch(`${API}editar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_habito_usuario: idHabitoUsuario,
                    nombre_habito: $("editNombre").value.trim(),
                    descripcion: $("editDescripcion").value.trim(),
                    objetivo: Number($("editObjetivo").value),
                    frecuencia: nuevaFrecuencia,
                    dias_semana: diasSeleccionados
                })
            });

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

            const data = await res.json();
            if (!data.exito) throw new Error(data.mensaje || "Error al actualizar.");

            modalEditar?.hide();
            await cargarHabito();
            render();
        } catch (err) {
            alert(err.message);
        }
    });

    // Eliminar
    $("btn-eliminar-habito")?.addEventListener("click", async e => {
        e.preventDefault();
        if (!idHabitoUsuario || !confirm(LS("¿Quieres eliminar este hábito?"))) return;

        try {
            const r = await fetch(`${API}eliminar-personalizado.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_habito_usuario: idHabitoUsuario })
            });

            if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);

            const d = await r.json();
            if (!d.exito) throw new Error(d.mensaje || LS("No se pudo eliminar el hábito."));

            location.href = "Personalizados.html";
        } catch (e) {
            alert(e.message);
        }
    });

    window.addEventListener("lifesyncIdiomaCambiado", render);

    // Inicializar
    cargarHabito()
        .then(render)
        .catch(e => {
            console.error(e);
            alert(e.message);
        });
})();