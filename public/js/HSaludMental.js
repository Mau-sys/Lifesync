function LS(clave) {
    return typeof window !== "undefined" && typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(clave) : clave;
}

const btnOptions = document.getElementById('btn-options-saludmental');
const kebabMenu = document.getElementById('kebab-menu-saludmental');
const btnRegresar = document.getElementById('btn-regresar');

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

let pausasCompletadas = 0;
let pausasTotales = 2;
let duracionPausa = 15;
let frecuenciaMeta = 'diaria';
let diasSeleccionados = [1, 2, 3, 4, 5];
let historialPausas = [];

const ringElement = document.getElementById('ring-saludmental');
const contadorElement = document.getElementById('contador-saludmental');
const metaElement = document.getElementById('meta-saludmental');
const btnAddPausa = document.getElementById('btn-add-pausa');
const listaPausas = document.getElementById('lista-pausas');

const btnGuardar = document.getElementById('btn-guardar-config');
const btnReiniciar = document.getElementById('btn-reiniciar-meta');
const inputPausas = document.getElementById('input-pausas');
const inputDuracion = document.getElementById('input-duracion');
const selectFrecuencia = document.getElementById('select-frecuencia');
const contenedorDias = document.getElementById('contenedor-dias-semana');
const labelPausas = document.getElementById('label-pausas');
const botonesDias = document.querySelectorAll('.btn-dia');

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
            guardarDatos();
        }
    } else {
        const ultimaFecha = localStorage.getItem('ls_saludmental_fecha');

        if (ultimaFecha !== hoy) {
            pausasCompletadas = 0;
            historialPausas = [];
            localStorage.setItem('ls_saludmental_fecha', hoy);
            guardarDatos();
        }
    }
}

function cargarDatos() {
    const configuracionGuardada = localStorage.getItem('ls_saludmental_config');
    if (configuracionGuardada) {
        const config = JSON.parse(configuracionGuardada);
        pausasTotales = config.pausasTotales || 2;
        duracionPausa = config.duracionPausa || 15;
        frecuenciaMeta = config.frecuenciaMeta || 'diaria';
        diasSeleccionados = config.diasSeleccionados || [1, 2, 3, 4, 5];
    }

    verificarReinicioPeriodo();

    const pausasGuardadas = localStorage.getItem('ls_saludmental_pausas');
    if (pausasGuardadas) {
        pausasCompletadas = parseInt(pausasGuardadas) || 0;
    }

    const historialGuardado = localStorage.getItem('ls_saludmental_historial');
    if (historialGuardado) {
        historialPausas = JSON.parse(historialGuardado) || [];
    }

    if (inputPausas) inputPausas.value = pausasTotales;
    if (inputDuracion) inputDuracion.value = duracionPausa;
    if (selectFrecuencia) selectFrecuencia.value = frecuenciaMeta;

    actualizarVisibilidadDias();
}

function guardarDatos() {
    localStorage.setItem('ls_saludmental_pausas', pausasCompletadas);
    localStorage.setItem('ls_saludmental_historial', JSON.stringify(historialPausas));
    localStorage.setItem('ls_saludmental_config', JSON.stringify({
        pausasTotales,
        duracionPausa,
        frecuenciaMeta,
        diasSeleccionados
    }));
}

function renderizarListaPausas() {
    if (!listaPausas) return;
    listaPausas.innerHTML = '';

    if (historialPausas.length === 0) {
        listaPausas.innerHTML = '<span class="text-subtle small d-block text-center py-2">${LS("sinPausasRegistradas")}</span>';
        return;
    }

    historialPausas.forEach(registro => {
        const item = document.createElement('div');
        item.className = 'd-flex justify-content-between align-items-center py-1';
        item.innerHTML = `
            <span class="text-white fw-medium subtexto-fluido">${registro}</span>
            <i class="fa-solid fa-circle-check text-purple fs-5"></i>
        `;
        listaPausas.appendChild(item);
    });
}

function esDiaActivo() {
    if (frecuenciaMeta !== 'personalizada') return true;
    const diaHoy = new Date().getDay();
    return diasSeleccionados.includes(diaHoy);
}

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

function actualizarVisibilidadDias() {
    if (!selectFrecuencia) return;

    if (selectFrecuencia.value === 'personalizada') {
        contenedorDias.classList.remove('d-none');
        labelPausas.textContent = LS("pausasPorDiaActivo");
    } else {
        contenedorDias.classList.add('d-none');
        labelPausas.textContent = selectFrecuencia.value === 'semanal' 
            ? LS("pausasSemanales") 
            : LS("pausasDiarias");
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

if (btnAddPausa) {
    btnAddPausa.addEventListener('click', () => {
        verificarReinicioPeriodo();

        if (pausasCompletadas < pausasTotales && esDiaActivo()) {
            pausasCompletadas++;
            const ahora = new Date();
            const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const textoRegistro = frecuenciaMeta === 'semanal' 
                ? `${ahora.toLocaleDateString([], { weekday: 'short' })} - ${horaFormateada}`
                : horaFormateada;

            historialPausas.push(textoRegistro);
            guardarDatos();
            actualizarInterfaz();
        }
    });
}

if (btnReiniciar) {
    btnReiniciar.addEventListener('click', () => {
        const confirmar = confirm(LS("confirmarReinicioSalud"));
        if (confirmar) {
            pausasCompletadas = 0;
            historialPausas = [];
            guardarDatos();
            actualizarInterfaz();

            const modalElement = document.getElementById('modalEditarSaludMental');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
            if (kebabMenu) {
                kebabMenu.classList.remove('show');
            }
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

        guardarDatos();
        actualizarInterfaz();

        const modalElement = document.getElementById('modalEditarSaludMental');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
        if (kebabMenu) {
            kebabMenu.classList.remove('show');
        }
    });
}

cargarDatos();
actualizarInterfaz();

    window.addEventListener("lifesyncIdiomaCambiado", actualizarInterfaz);