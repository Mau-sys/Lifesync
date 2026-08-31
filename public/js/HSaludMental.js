document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. ESTADO Y VARIABLES GLOBALES
    // ==========================================
    let currentHabitoId = null;
    let pausasCompletadas = 0;
    let pausasTotales = 2;
    let duracionPausa = 15;
    let frecuenciaMeta = 'diaria';
    let diasSeleccionados = [1, 2, 3, 4, 5];
    let historialPausas = [];

    // Elementos de la interfaz principal
    const ringElement = document.getElementById('ring-saludmental');
    const contadorElement = document.getElementById('contador-saludmental');
    const metaElement = document.getElementById('meta-saludmental');
    const btnAddPausa = document.getElementById('btn-add-pausa');
    const listaPausas = document.getElementById('lista-pausas');

    // Elementos del menú Kebab y Navegación
    const btnOptions = document.getElementById('btn-options-saludmental');
    const kebabMenu = document.getElementById('kebab-menu-saludmental');
    const btnRegresar = document.getElementById('btn-regresar');

    // Elementos del Modal de Configuración
    const btnGuardar = document.getElementById('btn-guardar-config');
    const btnReiniciar = document.getElementById('btn-reiniciar-meta');
    const inputPausas = document.getElementById('input-pausas');
    const inputDuracion = document.getElementById('input-duracion');
    const selectFrecuencia = document.getElementById('select-frecuencia');
    const contenedorDias = document.getElementById('contenedor-dias-semana');
    const labelPausas = document.getElementById('label-pausas');
    const botonesDias = document.querySelectorAll('.btn-dia');

    // Helper de internacionalización
    function LS(clave) {
        return typeof window !== "undefined" && typeof window.traducirLifeSync === "function"
            ? window.traducirLifeSync(clave)
            : clave;
    }

    // ==========================================
    // 2. PERSISTENCIA DE DATOS (API / LOCAL STORAGE)
    // ==========================================
    async function cargarDatos() {
        try {
            const response = await fetch("../salud_mental/read.php");
            if (!response.ok) throw new Error("Error en la respuesta del servidor");

            const res = await response.json();

            if (res.success && res.data) {
                const { id_habito, objetivo, duracion_minutos, total_pausas, registros, frecuencia, dias_activos } = res.data;
                
                currentHabitoId = id_habito;
                pausasTotales = objetivo || 2;
                duracionPausa = duracion_minutos || 15;
                pausasCompletadas = total_pausas || 0;
                historialPausas = registros || [];
                
                if (frecuencia) frecuenciaMeta = frecuencia;
                if (dias_activos) diasSeleccionados = dias_activos;
            } else {
                cargarDatosLocal();
            }
        } catch (error) {
            console.warn("Servidor no disponible, cargando datos desde localStorage:", error);
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
            frecuenciaMeta = config.frecuenciaMeta || 'diaria';
            diasSeleccionados = config.diasSeleccionados || [1, 2, 3, 4, 5];
        }

        verificarReinicioPeriodo();

        const pausasGuardadas = localStorage.getItem('ls_saludmental_pausas');
        if (pausasGuardadas) pausasCompletadas = parseInt(pausasGuardadas) || 0;

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
            diasSeleccionados
        }));
    }

    async function agregarPausa() {
        verificarReinicioPeriodo();

        if (pausasCompletadas >= pausasTotales || !esDiaActivo()) return;

        let guardadoExitoso = false;

        if (currentHabitoId !== null) {
            try {
                const response = await fetch("../salud_mental/create.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_habito: currentHabitoId })
                });

                if (response.ok) {
                    const res = await response.json();
                    if (res.success) {
                        guardadoExitoso = true;
                        await cargarDatos();
                    }
                }
            } catch (error) {
                console.warn("Servidor inaccesible, registrando pausa de forma local:", error);
            }
        }

        if (!guardadoExitoso) {
            pausasCompletadas++;
            const ahora = new Date();
            const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const textoRegistro = frecuenciaMeta === 'semanal'
                ? `${ahora.toLocaleDateString([], { weekday: 'short' })} - ${horaFormateada}`
                : horaFormateada;

            historialPausas.push(textoRegistro);
            guardarDatosLocal();
            actualizarInterfaz();
        }
    }

    async function sincronizarConfiguracionBackend() {
        if (currentHabitoId === null) return;

        try {
            await fetch("../salud_mental/update.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_habito: currentHabitoId,
                    objetivo: pausasTotales,
                    duracion_minutos: duracionPausa,
                    frecuencia: frecuenciaMeta,
                    dias_activos: diasSeleccionados
                })
            });
        } catch (error) {
            console.warn("No se pudo actualizar la configuración en la BD:", error);
        }
    }

    // ==========================================
    // 3. REGLAS DE NEGOCIO Y CONTROL DE TIEMPO
    // ==========================================
    function obtenerSemanaActual() {
        const ahora = new Date();
        const inicioAño = new Date(ahora.getFullYear(), 0, 1);
        const dias = Math.floor((ahora - inicioAño) / (24 * 60 * 60 * 1000));
        return Math.ceil((dias + inicioAño.getDay() + 1) / 7);
    }

    function obtenerFechaHoy() {
        return new Date().toISOString().split('T')[0];
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
        return diasSeleccionados.includes(diaHoy);
    }

    // ==========================================
    // 4. INTERFAZ DE USUARIO (UI)
    // ==========================================
    function actualizarInterfaz() {
        verificarReinicioPeriodo();

        if (contadorElement) {
            contadorElement.textContent = `${pausasCompletadas}/${pausasTotales}`;
        }

        if (metaElement) {
            const textoPausas = pausasTotales === 1 ? LS("unaPausa") : `${pausasTotales} ${LS("pausas")}`;
            metaElement.textContent = `${textoPausas} (${duracionPausa} min/pausa)`;
        }

        if (ringElement) {
            const porcentaje = Math.min((pausasCompletadas / pausasTotales) * 100, 100);
            ringElement.style.background = `conic-gradient(var(--ls-purple) ${porcentaje}%, rgba(168, 85, 247, 0.15) ${porcentaje}%)`;
        }

        if (btnAddPausa) {
            const diaHabilitado = esDiaActivo();

            if (!diaHabilitado) {
                btnAddPausa.textContent = LS("diaDescanso");
                btnAddPausa.disabled = true;
                btnAddPausa.classList.add('opacity-75');
            } else if (pausasCompletadas >= pausasTotales) {
                btnAddPausa.textContent = LS("metaCompletada");
                btnAddPausa.disabled = true;
                btnAddPausa.classList.add('opacity-75');
            } else {
                btnAddPausa.textContent = "+1 " + LS("unaPausa").replace("1 ", "").trim();
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
                    ${LS("sinPausasRegistradas")}
                </div>`;
            return;
        }

        const registrosInvertidos = [...historialPausas].reverse();

        registrosInvertidos.forEach((reg, idx) => {
            const item = document.createElement('div');
            item.className = 'd-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-25';
            
            const numPausa = historialPausas.length - idx;
            const horaTexto = typeof reg === 'object' ? reg.hora : reg;

            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fa-solid fa-circle-check text-purple me-2"></i>
                    <span class="text-white fw-medium subtexto-fluido">Pausa #${numPausa}</span>
                </div>
                <span class="text-subtle small">${horaTexto}</span>
            `;
            listaPausas.appendChild(item);
        });
    }

    function sincronizarCamposFormulario() {
        if (inputPausas) inputPausas.value = pausasTotales;
        if (inputDuracion) inputDuracion.value = duracionPausa;
        if (selectFrecuencia) selectFrecuencia.value = frecuenciaMeta;
        actualizarVisibilidadDias();
    }

    function actualizarVisibilidadDias() {
        if (!selectFrecuencia) return;

        if (selectFrecuencia.value === 'personalizada') {
            if (contenedorDias) contenedorDias.classList.remove('d-none');
            if (labelPausas) labelPausas.textContent = LS("pausasPorDiaActivo");
        } else {
            if (contenedorDias) contenedorDias.classList.add('d-none');
            if (labelPausas) {
                labelPausas.textContent = selectFrecuencia.value === 'semanal' 
                    ? LS("pausasSemanales") 
                    : LS("pausasDiarias");
            }
        }

        botonesDias.forEach(btn => {
            const valDia = parseInt(btn.dataset.dia);
            if (diasSeleccionados.includes(valDia)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function cerrarModalYMenu() {
        const modalElement = document.getElementById('modalEditarSaludMental');
        if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        }
        if (kebabMenu) kebabMenu.classList.remove('show');
    }

    // ==========================================
    // 5. EVENT LISTENERS
    // ==========================================
    if (btnAddPausa) {
        btnAddPausa.addEventListener('click', agregarPausa);
    }

    if (btnOptions && kebabMenu) {
        btnOptions.addEventListener('click', (e) => {
            e.stopPropagation();
            kebabMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!kebabMenu.contains(e.target)) {
                kebabMenu.classList.remove('show');
            }
        });
    }

    if (btnRegresar) {
        btnRegresar.addEventListener('click', () => {
            const paginaAnterior = document.referrer;
            const mismoDominio = paginaAnterior && paginaAnterior.includes(window.location.host);

            if (mismoDominio) {
                window.history.back();
            } else {
                window.location.href = 'inicio.html';
            }
        });
    }

    if (selectFrecuencia) {
        selectFrecuencia.addEventListener('change', actualizarVisibilidadDias);
    }

    botonesDias.forEach(btn => {
        btn.addEventListener('click', () => {
            const valDia = parseInt(btn.dataset.dia);
            if (diasSeleccionados.includes(valDia)) {
                if (diasSeleccionados.length > 1) {
                    diasSeleccionados = diasSeleccionados.filter(d => d !== valDia);
                    btn.classList.remove('active');
                } else {
                    alert(LS("mantenerDiaSeleccionado"));
                }
            } else {
                diasSeleccionados.push(valDia);
                btn.classList.add('active');
            }
        });
    });

    if (btnReiniciar) {
        btnReiniciar.addEventListener('click', () => {
            if (confirm(LS("confirmarReinicioSalud"))) {
                pausasCompletadas = 0;
                historialPausas = [];
                guardarDatosLocal();
                sincronizarConfiguracionBackend();
                actualizarInterfaz();
                cerrarModalYMenu();
            }
        });
    }

    if (btnGuardar) {
        btnGuardar.addEventListener('click', () => {
            const nuevasPausas = parseInt(inputPausas.value);
            const nuevaDuracion = parseInt(inputDuracion.value);
            const nuevaFrecuencia = selectFrecuencia.value;

            if (isNaN(nuevasPausas) || nuevasPausas < 1 || nuevasPausas > 50) {
                alert(LS("cantidadPausasValida"));
                return;
            }

            if (isNaN(nuevaDuracion) || nuevaDuracion < 1 || nuevaDuracion > 240) {
                alert(LS("duracionPausaValida"));
                return;
            }

            if (nuevaFrecuencia === 'personalizada' && diasSeleccionados.length === 0) {
                alert(LS("diaMetaPersonalizada"));
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
            cerrarModalYMenu();
        });
    }

    window.addEventListener("lifesyncIdiomaCambiado", actualizarInterfaz);

    // Inicialización del script
    cargarDatos();
});