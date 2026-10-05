document.addEventListener("DOMContentLoaded", () => {
    const API = "/lifesync/auth/";
    const params = new URLSearchParams(window.location.search);
    let currentHabitoId = Number(params.get("id_habito_usuario")) || null;

    let pausasCompletadas = 0;
    let pausasTotales = 2;
    let duracionPausa = 15;
    let frecuenciaMeta = 'diaria';
    let diasSeleccionados = [1, 2, 3, 4, 5];
    let historialPausas = [];

    const ringElement = document.getElementById('ring-saludmental');
    const contadorElement = document.getElementById('contador-saludmental');
    const metaElement = document.getElementById('meta-saludmental');
    const labelMetaTipo = document.getElementById('label-meta-tipo');
    const btnAddPausa = document.getElementById('btn-add-pausa');
    const listaPausas = document.getElementById('lista-pausas');

    const btnRegresar = document.getElementById('btn-regresar');

    const btnGuardar = document.getElementById('btn-guardar-config');
    const inputPausas = document.getElementById('input-pausas');
    const inputDuracion = document.getElementById('input-duracion');
    const selectFrecuencia = document.getElementById('select-frecuencia');
    const contenedorDias = document.getElementById('contenedor-dias-semana');
    const labelPausas = document.getElementById('label-pausas');
    const botonesDias = document.querySelectorAll('.btn-dia');

    function LS(clave) {
        return typeof window !== "undefined" && typeof window.traducirLifeSync === "function"
            ? window.traducirLifeSync(clave)
            : clave;
    }

    function normalizarFrecuencia(frec) {
        if (!frec) return 'diaria';
        const f = String(frec).toLowerCase().trim();
        if (['diaria', 'daily', 'diario'].includes(f)) return 'diaria';
        if (['semanal', 'weekly'].includes(f)) return 'semanal';
        if (['personalizada', 'custom', 'personalizado'].includes(f)) return 'personalizada';
        return 'diaria';
    }

    async function cargarDatos() {
        if (!currentHabitoId) {
            cargarDatosLocal();
            sincronizarCamposFormulario();
            actualizarInterfaz();
            return;
        }

        try {
            const response = await fetch(`${API}Obtener_habito.php?id_habito_usuario=${currentHabitoId}`, {
                credentials: "include",
                cache: "no-store"
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const res = await response.json();

            if (res.exito && res.habito) {
                const h = res.habito;
                currentHabitoId = Number(h.id_habito_usuario);
                pausasTotales = Number(h.objetivo) || 2;
                duracionPausa = Number(h.duracion_minutos) || 15;
                pausasCompletadas = Number(h.progreso_hoy ?? h.total_pausas) || 0;
                
                if (Array.isArray(h.registros)) {
                    historialPausas = h.registros.map(r => typeof r === 'object' ? (r.hora || r.fecha_registro) : r);
                } else {
                    historialPausas = [];
                }
                
                if (h.frecuencia) frecuenciaMeta = normalizarFrecuencia(h.frecuencia);
                if (h.dias_activos || h.dias) {
                    const d = h.dias_activos || h.dias;
                    diasSeleccionados = Array.isArray(d) ? d.map(Number) : String(d).split(",").map(Number);
                }
                guardarDatosLocal();
            } else {
                cargarDatosLocal();
            }
        } catch (error) {
            console.warn("Cargando desde localStorage por error de red:", error);
            cargarDatosLocal();
        }

        sincronizarCamposFormulario();
        actualizarInterfaz();
    }

    function cargarDatosLocal() {
        const configGuardada = localStorage.getItem('ls_saludmental_config');
        if (configGuardada) {
            const config = JSON.parse(configGuardada);
            pausasTotales = config.pausasTotales || 2;
            duracionPausa = config.duracionPausa || 15;
            frecuenciaMeta = normalizarFrecuencia(config.frecuenciaMeta);
            if (config.diasSeleccionados) {
                diasSeleccionados = config.diasSeleccionados.map(Number);
            }
        }

        verificarReinicioPeriodo();

        const pausasGuardadas = localStorage.getItem('ls_saludmental_pausas');
        if (pausasGuardadas !== null) pausasCompletadas = parseInt(pausasGuardadas) || 0;

        const historialGuardado = localStorage.getItem('ls_saludmental_historial');
        if (historialGuardado) historialPausas = JSON.parse(historialGuardado) || [];
    }

    function guardarDatosLocal() {
        localStorage.setItem('ls_saludmental_pausas', pausasCompletadas);
        localStorage.setItem('ls_saludmental_historial', JSON.stringify(historialPausas));
        localStorage.setItem('ls_saludmental_config', JSON.stringify({
            pausasTotales,
            duracionPausa,
            frecuenciaMeta,
            diasSeleccionados: diasSeleccionados.map(Number)
        }));
    }

    async function agregarPausa() {
        verificarReinicioPeriodo();

        if (pausasCompletadas >= pausasTotales || !esDiaActivo()) return;

        const ahora = new Date();
        const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const textoRegistro = frecuenciaMeta === 'semanal'
            ? `${ahora.toLocaleDateString([], { weekday: 'short' })} - ${horaFormateada}`
            : horaFormateada;

        let guardadoExitoso = false;

        if (currentHabitoId !== null) {
            try {
                const response = await fetch(`${API}registrar-habito.php`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_habito_usuario: currentHabitoId,
                        valor: 1,
                        observaciones: "Pausa mental"
                    })
                });

                if (response.ok) {
                    const res = await response.json();
                    if (res.exito) {
                        guardadoExitoso = true;
                        pausasCompletadas++;
                        historialPausas.push(textoRegistro);
                        guardarDatosLocal();
                        actualizarInterfaz();
                    }
                }
            } catch (error) {
                console.warn("Servidor inaccesible, registrando localmente:", error);
            }
        }

        if (!guardadoExitoso) {
            pausasCompletadas++;
            historialPausas.push(textoRegistro);
            guardarDatosLocal();
            actualizarInterfaz();
        }
    }

    async function sincronizarConfiguracionBackend() {
        if (currentHabitoId === null) return;

        try {
            await fetch(`${API}actualizar-habito.php`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_habito_usuario: currentHabitoId,
                    objetivo: pausasTotales,
                    duracion_minutos: duracionPausa,
                    frecuencia: frecuenciaMeta,
                    dias: diasSeleccionados.map(Number),
                    dias_activos: diasSeleccionados.map(Number)
                })
            });
        } catch (error) {
            console.warn("No se pudo sincronizar con backend:", error);
        }
    }

    function obtenerSemanaActual() {
        const ahora = new Date();
        const inicioAño = new Date(ahora.getFullYear(), 0, 1);
        const dias = Math.floor((ahora - inicioAño) / (24 * 60 * 60 * 1000));
        return Math.ceil((dias + inicioAño.getDay() + 1) / 7);
    }

    function obtenerFechaHoy() {
        const ahora = new Date();
        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    }

    function verificarReinicioPeriodo() {
        const hoy = obtenerFechaHoy();

        if (frecuenciaMeta === 'semanal') {
            const semanaActual = `${new Date().getFullYear()}-W${obtenerSemanaActual()}`;
            const ultimaSemana = localStorage.getItem('ls_saludmental_semana');

            if (ultimaSemana !== semanaActual) {
                pausasCompletadas = 0;
                historialPausas = [];
                localStorage.setItem('ls_saludmental_semana', semanaActual);
                guardarDatosLocal();
            }
        } else {
            const ultimaFecha = localStorage.getItem('ls_saludmental_fecha');

            if (ultimaFecha !== hoy) {
                pausasCompletadas = 0;
                historialPausas = [];
                localStorage.setItem('ls_saludmental_fecha', hoy);
                guardarDatosLocal();
            }
        }
    }

    function esDiaActivo() {
        if (frecuenciaMeta !== 'personalizada') return true;
        const diaHoy = new Date().getDay();
        return diasSeleccionados.map(Number).includes(diaHoy);
    }

    function actualizarInterfaz() {
        verificarReinicioPeriodo();

        if (contadorElement) {
            contadorElement.textContent = `${pausasCompletadas}/${pausasTotales}`;
        }

        if (labelMetaTipo) {
            if (frecuenciaMeta === 'semanal') {
                labelMetaTipo.textContent = LS("saludMental.metaSemanal");
            } else if (frecuenciaMeta === 'personalizada') {
                labelMetaTipo.textContent = LS("saludMental.metaPersonalizada");
            } else {
                labelMetaTipo.textContent = LS("saludMental.metaDiariaLabel");
            }
        }

        if (metaElement) {
            const plantillaPausas = pausasTotales === 1 
                ? LS("saludMental.unaPausa") 
                : LS("saludMental.variasPausas").replace("{total}", pausasTotales);
            
            const plantillaFormato = LS("saludMental.formatoMeta");
            metaElement.textContent = plantillaFormato
                .replace("{pausas}", plantillaPausas)
                .replace("{duracion}", duracionPausa);
        }

        if (ringElement) {
            const porcentaje = pausasTotales > 0 ? Math.min((pausasCompletadas / pausasTotales) * 100, 100) : 0;
            ringElement.style.background = `conic-gradient(var(--ls-purple) ${porcentaje}%, var(--ls-purple-soft) ${porcentaje}%)`;
        }

        if (btnAddPausa) {
            const diaHabilitado = esDiaActivo();

            if (!diaHabilitado) {
                btnAddPausa.textContent = LS("saludMental.diaDescanso");
                btnAddPausa.disabled = true;
                btnAddPausa.classList.add('opacity-75');
            } else if (pausasCompletadas >= pausasTotales) {
                btnAddPausa.textContent = LS("saludMental.metaCompletada");
                btnAddPausa.disabled = true;
                btnAddPausa.classList.add('opacity-75');
            } else {
                btnAddPausa.textContent = LS("saludMental.sumarPausa");
                btnAddPausa.disabled = false;
                btnAddPausa.classList.remove('opacity-75');
            }
        }

        renderizarListaPausas();
    }

    function renderizarListaPausas() {
        if (!listaPausas) return;
        listaPausas.innerHTML = '';

        if (!historialPausas || historialPausas.length === 0) {
            listaPausas.innerHTML = `
                <div class="text-subtle text-center py-2 small">
                    ${LS("saludMental.sinPausasRegistradas")}
                </div>`;
            return;
        }

        const registrosInvertidos = [...historialPausas].reverse();

        registrosInvertidos.forEach((reg, idx) => {
            const item = document.createElement('div');
            item.className = 'd-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-25';
            
            const numPausa = historialPausas.length - idx;
            let horaTexto = reg;

            if (typeof reg === 'object' && reg !== null) {
                horaTexto = reg.hora || reg.fecha_registro || JSON.stringify(reg);
            }

            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fa-solid fa-circle-check text-purple me-2"></i>
                    <span class="fw-medium subtexto-fluido">Pausa #${numPausa}</span>
                </div>
                <span class="text-subtle small">${horaTexto}</span>
            `;
            listaPausas.appendChild(item);
        });
    }

    function sincronizarCamposFormulario() {
        if (inputPausas) inputPausas.value = pausasTotales;
        if (inputDuracion) inputDuracion.value = duracionPausa;
        if (selectFrecuencia) selectFrecuencia.value = normalizarFrecuencia(frecuenciaMeta);
        actualizarVisibilidadDias();
    }

    function actualizarVisibilidadDias() {
        if (!selectFrecuencia) return;

        const valFrec = normalizarFrecuencia(selectFrecuencia.value);

        if (valFrec === 'personalizada') {
            if (contenedorDias) contenedorDias.classList.remove('d-none');
            if (labelPausas) labelPausas.textContent = LS("saludMental.pausasPorDiaActivo");
        } else {
            if (contenedorDias) contenedorDias.classList.add('d-none');
            if (labelPausas) {
                labelPausas.textContent = valFrec === 'semanal' 
                    ? LS("saludMental.pausasSemanales")
                    : LS("saludMental.pausasDiarias");
            }
        }

        botonesDias.forEach(btn => {
            const valDia = parseInt(btn.dataset.dia);
            if (diasSeleccionados.map(Number).includes(valDia)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function cerrarModal() {
        const modalElement = document.getElementById('modalEditarSaludMental');
        if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        }
    }

    if (btnAddPausa) {
        btnAddPausa.addEventListener('click', agregarPausa);
    }

    if (btnRegresar) {
        btnRegresar.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const origenSesion = sessionStorage.getItem("origen_navegacion");
            sessionStorage.removeItem("origen_navegacion");

            const paginaAnterior = document.referrer ? document.referrer.toLowerCase() : "";

            if (origenSesion && !origenSesion.toLowerCase().includes("saludmental")) {
                window.location.href = origenSesion;
            } else if (paginaAnterior.includes("categorias.html")) {
                window.location.href = "Categorias.html";
            } else if (paginaAnterior.includes("rachas.html")) {
                window.location.href = "Rachas.html";
            } else {
                window.location.href = "inicio.html";
            }
        }, true);
    }

    if (selectFrecuencia) {
        selectFrecuencia.addEventListener('change', actualizarVisibilidadDias);
    }

    botonesDias.forEach(btn => {
        btn.addEventListener('click', () => {
            const valDia = parseInt(btn.dataset.dia);
            const numDias = diasSeleccionados.map(Number);

            if (numDias.includes(valDia)) {
                if (numDias.length > 1) {
                    diasSeleccionados = numDias.filter(d => d !== valDia);
                    btn.classList.remove('active');
                } else {
                    alert(LS("saludMental.mantenerDiaSeleccionado"));
                }
            } else {
                diasSeleccionados.push(valDia);
                btn.classList.add('active');
            }
        });
    });

    if (btnGuardar) {
        btnGuardar.addEventListener('click', () => {
            const nuevasPausas = parseInt(inputPausas.value);
            const nuevaDuracion = parseInt(inputDuracion.value);
            const nuevaFrecuencia = normalizarFrecuencia(selectFrecuencia.value);

            if (isNaN(nuevasPausas) || nuevasPausas < 1 || nuevasPausas > 50) {
                alert(LS("saludMental.cantidadPausasValida"));
                return;
            }

            if (isNaN(nuevaDuracion) || nuevaDuracion < 1 || nuevaDuracion > 240) {
                alert(LS("saludMental.duracionPausaValida"));
                return;
            }

            if (nuevaFrecuencia === 'personalizada' && diasSeleccionados.length === 0) {
                alert(LS("saludMental.diaMetaPersonalizada"));
                return;
            }

            if (frecuenciaMeta !== nuevaFrecuencia) {
                pausasCompletadas = 0;
                historialPausas = [];
            }

            frecuenciaMeta = nuevaFrecuencia;
            pausasTotales = nuevasPausas;
            duracionPausa = nuevaDuracion;

            guardarDatosLocal();
            sincronizarConfiguracionBackend();
            actualizarInterfaz();
            cerrarModal();
        });
    }

    window.addEventListener("lifesyncIdiomaCambiado", actualizarInterfaz);

    cargarDatos();
});

if (typeof HabitoUniversal !== "undefined" && HabitoUniversal.init) {
    HabitoUniversal.init({
        btnOptionsId: "btn-options-saludmental",
        menuId: "kebab-menu-saludmental",
        btnDeshabilitarId: "btn-deshabilitar-habito",
        urlRedireccion: "inicio.html"
    });
}