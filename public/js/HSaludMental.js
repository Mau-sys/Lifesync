const btnOptions = document.getElementById('btn-options-saludmental');
const kebabMenu = document.getElementById('kebab-menu-saludmental');

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

let pausasCompletadas = 0;
let pausasTotales = 2;
let duracionPausa = 15;
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

function obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
}

function verificarNuevoDia() {
    const hoy = obtenerFechaHoy();
    const ultimaFecha = localStorage.getItem('ls_saludmental_fecha');

    if (ultimaFecha !== hoy) {
        pausasCompletadas = 0;
        historialPausas = [];
        localStorage.setItem('ls_saludmental_fecha', hoy);
        guardarDatos();
    }
}

function cargarDatos() {
    verificarNuevoDia();

    const configuracionGuardada = localStorage.getItem('ls_saludmental_config');
    if (configuracionGuardada) {
        const config = JSON.parse(configuracionGuardada);
        pausasTotales = config.pausasTotales || 2;
        duracionPausa = config.duracionPausa || 15;
    }

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
}

function guardarDatos() {
    localStorage.setItem('ls_saludmental_pausas', pausasCompletadas);
    localStorage.setItem('ls_saludmental_historial', JSON.stringify(historialPausas));
    localStorage.setItem('ls_saludmental_config', JSON.stringify({
        pausasTotales,
        duracionPausa
    }));
}

function renderizarListaPausas() {
    if (!listaPausas) return;
    listaPausas.innerHTML = '';

    historialPausas.forEach(hora => {
        const item = document.createElement('div');
        item.className = 'd-flex justify-content-between align-items-center py-1';
        item.innerHTML = `
            <span class="text-white fw-medium subtexto-fluido">${hora}</span>
            <i class="fa-solid fa-circle-check text-purple fs-5"></i>
        `;
        listaPausas.appendChild(item);
    });
}

function actualizarInterfaz() {
    verificarNuevoDia();

    if (contadorElement) {
        contadorElement.textContent = `${pausasCompletadas}/${pausasTotales}`;
    }

    if (metaElement) {
        metaElement.textContent = `${pausasTotales} pausas conscientes (${duracionPausa} min/pausa)`;
    }

    if (ringElement) {
        const porcentaje = Math.min((pausasCompletadas / pausasTotales) * 100, 100);
        ringElement.style.background = `conic-gradient(var(--ls-purple) ${porcentaje}%, rgba(168, 85, 247, 0.15) ${porcentaje}%)`;
    }

    if (btnAddPausa) {
        if (pausasCompletadas >= pausasTotales) {
            btnAddPausa.textContent = '¡Meta completada!';
            btnAddPausa.disabled = true;
            btnAddPausa.classList.add('opacity-75');
        } else {
            btnAddPausa.textContent = '+1 pausa';
            btnAddPausa.disabled = false;
            btnAddPausa.classList.remove('opacity-75');
        }
    }

    renderizarListaPausas();
}

if (btnAddPausa) {
    btnAddPausa.addEventListener('click', () => {
        verificarNuevoDia();

        if (pausasCompletadas < pausasTotales) {
            pausasCompletadas++;
            const ahora = new Date();
            const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            historialPausas.push(horaFormateada);
            guardarDatos();
            actualizarInterfaz();
        }
    });
}

if (btnReiniciar) {
    btnReiniciar.addEventListener('click', () => {
        const confirmar = confirm('¿Estás seguro de que deseas reiniciar el progreso de hoy a 0?');
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

        if (isNaN(nuevasPausas) || nuevasPausas < 1 || nuevasPausas > 50) {
            alert('Por favor ingresa una cantidad de pausas válida (entre 1 y 50).');
            return;
        }

        if (isNaN(nuevaDuracion) || nuevaDuracion < 1 || nuevaDuracion > 240) {
            alert('Por favor ingresa una duración válida (máximo 4 horas / 240 minutos).');
            return;
        }

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