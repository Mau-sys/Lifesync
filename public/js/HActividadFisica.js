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
    let metaMinutosTotal = 150;
    let dias = [0, 2, 4]; // Representa Lunes, Miércoles, Viernes (0-6)
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

    // Obtiene el día de hoy en formato 1 (Lunes) a 7 (Domingo)
    function getDiaSemanaHoy() {
        const diaJs = new Date().getDay(); // 0: Domingo, 1: Lunes...
        return diaJs === 0 ? 7 : diaJs;
    }

    // Verifica si el hábito está programado para registrar el día de hoy
    function esDiaActivoHoy() {
        if (tipoMeta === "diaria" || tipoMeta === "semanal") {
            return true;
        }
        if (tipoMeta === "personalizado" || tipoMeta === "dias específicos") {
            const diaHoy1a7 = getDiaSemanaHoy(); // 1-7
            const dias1a7 = dias.map(d => d + 1); // Convierte 0-6 en 1-7
            return dias1a7.includes(diaHoy1a7);
        }
        return true;
    }

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
        return valor === "personalizada" || valor === "dias específicos" ? "personalizado" : (valor || "semanal");
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
        metaMinutosTotal = Number(d.habito.duracion_minutos) || 150;
        tipoMeta = normalizarFrecuencia(d.habito.frecuencia);
        
        minutos = Number(d.habito.suma_hoy ?? d.habito.valor_registrado) || 0;
        sesiones = Number(d.habito.total_sesiones ?? d.habito.registros_hoy) || 0;
        
        aplicarDiasServidor(d.habito.dias_activos || d.habito.dias);
    }

    function render() {
        if (!contador || !meta || !ring || !btn || !tiempo) return;

        contador.textContent = `${sesiones}/${metaSesiones}`;
        meta.textContent = `${metaSesiones} ${metaSesiones === 1 ? LS("sesion") : LS("sesiones")} (${LS("Meta total:")} ${formatMin(metaMinutosTotal)})`;
        tiempo.textContent = `${formatMin(minutos)} / ${formatMin(metaMinutosTotal)}`;

        const porcentaje = metaSesiones ? Math.min(100, (sesiones / metaSesiones) * 100) : 0;
        ring.style.background = `conic-gradient(var(--ls-amber) ${porcentaje}%, rgba(255,159,28,.15) ${porcentaje}%)`;

        const completada = sesiones >= metaSesiones;
        const activoHoy = esDiaActivoHoy();

        // Deshabilitar botón si la meta está completada, si está cargando o si NO es un día activo
        btn.disabled = completada || cargando || !activoHoy;

        if (!activoHoy) {
            btn.classList.add("btn-dia-inactivo");
            btn.innerHTML = `<span><i class="fa-solid fa-calendar-xmark me-2"></i>${LS("Día no activo")}</span>`;
        } else if (completada) {
            btn.classList.remove("btn-dia-inactivo");
            btn.innerHTML = `<span>${LS("metaCompletada")}</span>`;
        } else {
            btn.classList.remove("btn-dia-inactivo");
            btn.innerHTML = `<span>+ ${LS("registrarSesion")}</span>`;
        }

        const label = $("label-tipo-meta");
        if (label) {
            label.textContent = tipoMeta === "diaria" 
                ? LS("metaDiaria") 
                : tipoMeta === "personalizado" 
                    ? LS("metaDeDias").replace("{n}", dias.length).replace("{unidad}", dias.length === 1 ? LS("dia") : LS("dias")) 
                    : LS("metaSemanal");
        }
    }

    $("btn-add-sesion-fisica")?.addEventListener("click", () => {
        if (!esDiaActivoHoy()) {
            alert(LS("Hoy no es un día programado para realizar este hábito."));
            return;
        }
        modalSesion?.show();
    });

    $("btn-guardar-sesion")?.addEventListener("click", async () => {
        if (cargando || !id) return;
        if (!esDiaActivoHoy()) {
            alert(LS("Hoy no es un día programado para realizar este hábito."));
            return;
        }

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
                    valor_registrado: duracion,
                    valor: duracion,
                    observaciones: $("select-tipo-actividad")?.value || "Actividad"
                })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudo registrar la sesión."));

            if (d.registro) {
                minutos = Number(d.registro.suma_hoy);
                sesiones = Number(d.registro.total_sesiones ?? d.registro.registros_hoy);
            } else {
                sesiones += 1;
                minutos += duracion;
            }

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

        const selectMeta = $("select-tipo-meta");
        if (selectMeta) {
            selectMeta.value = tipoMeta;
        }

        if ($("input-meta-cantidad")) $("input-meta-cantidad").value = metaSesiones;
        if ($("input-meta-minutos")) $("input-meta-minutos").value = metaMinutosTotal;

        document.querySelectorAll(".btn-dia-pill").forEach(b => {
            const diaNum = Number(b.dataset.dia);
            b.classList.toggle("active", dias.includes(diaNum));
        });

        const contenedorDias = $("contenedor-dias-semana");
        if (contenedorDias) {
            contenedorDias.classList.toggle("d-none", tipoMeta !== "personalizado");
        }

        modalMeta?.show();
    });

    $("select-tipo-meta")?.addEventListener("change", e => {
        tipoMeta = e.target.value;
        const contenedorDias = $("contenedor-dias-semana");
        if (contenedorDias) {
            contenedorDias.classList.toggle("d-none", tipoMeta !== "personalizado");
        }
    });

    document.querySelectorAll(".btn-dia-pill").forEach(b => {
        b.addEventListener("click", e => {
            e.preventDefault();
            const dia = Number(b.dataset.dia);
            
            if (dias.includes(dia)) {
                dias = dias.filter(x => x !== dia);
            } else {
                dias.push(dia);
            }
            b.classList.toggle("active", dias.includes(dia));
        });
    });

    $("btn-guardar-meta")?.addEventListener("click", async () => {
        const n = Number($("input-meta-cantidad")?.value);
        const m = Number($("input-meta-minutos")?.value);

        if (tipoMeta === "personalizado") {
            dias = Array.from(document.querySelectorAll(".btn-dia-pill.active"))
                        .map(b => Number(b.dataset.dia));
        }

        if (!Number.isInteger(n) || n < 1 || n > 50) return alert(LS("numeroSesionesValido"));
        if (!Number.isInteger(m) || m < 10 || m > 10000) return alert(LS("duracionSesionValida"));
        if (tipoMeta === "personalizado" && dias.length === 0) return alert(LS("seleccionarDiaSemana"));

        const dias1a7 = dias.map(x => x + 1);

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
                    dias: tipoMeta === "personalizado" ? dias1a7 : [],
                    dias_activos: tipoMeta === "personalizado" ? dias1a7 : []
                })
            });
            const d = await r.json();
            if (!r.ok || !d.exito) throw new Error(d.mensaje || LS("No se pudieron guardar los cambios."));

            metaSesiones = n;
            metaMinutosTotal = m;
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