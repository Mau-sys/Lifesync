const btnOptions = document.getElementById('btn-options-hidratacion');
const kebabMenu = document.getElementById('kebab-menu-hidratacion');
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

let vasosTomados = 0;
let vasosTotales = 8;
let capacidadVaso = 250;

const ringElement = document.getElementById('ring-hidratacion');
const contadorElement = document.getElementById('contador-vasos');
const metaElement = document.getElementById('meta-vasos');
const btnAddVaso = document.getElementById('btn-add-vaso');
const contenedorVasos = document.getElementById('contenedor-vasos-iconos');

const btnGuardar = document.getElementById('btn-guardar-config');
const btnReiniciar = document.getElementById('btn-reiniciar-meta');
const inputVasos = document.getElementById('input-vasos');
const inputCapacidad = document.getElementById('input-capacidad');
const previewMetaTotal = document.getElementById('preview-meta-total');

function obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
}

function verificarReinicioDiario() {
    const hoy = obtenerFechaHoy();
    const ultimaFecha = localStorage.getItem('ls_hidratacion_fecha');

    if (ultimaFecha !== hoy) {
        vasosTomados = 0;
        localStorage.setItem('ls_hidratacion_fecha', hoy);
        guardarDatos();
    }
}

function cargarDatos() {
    const configuracionGuardada = localStorage.getItem('ls_hidratacion_config');
    if (configuracionGuardada) {
        const config = JSON.parse(configuracionGuardada);
        vasosTotales = config.vasosTotales || 8;
        capacidadVaso = config.capacidadVaso || 250;
    }

    verificarReinicioDiario();

    const vasosGuardados = localStorage.getItem('ls_hidratacion_vasos');
    if (vasosGuardados !== null) {
        vasosTomados = parseInt(vasosGuardados) || 0;
    }

    if (inputVasos) inputVasos.value = vasosTotales;
    if (inputCapacidad) inputCapacidad.value = capacidadVaso;
    actualizarPreviewModal();
}

function guardarDatos() {
    localStorage.setItem('ls_hidratacion_vasos', vasosTomados);
    localStorage.setItem('ls_hidratacion_config', JSON.stringify({
        vasosTotales,
        capacidadVaso
    }));
}

function renderizarVasos() {
    if (!contenedorVasos) return;
    contenedorVasos.innerHTML = '';

    for (let i = 0; i < vasosTotales; i++) {
        const vasoIcono = document.createElement('i');
        vasoIcono.className = 'fa-solid fa-glass-water';

        if (i < vasosTomados) {
            vasoIcono.classList.add('text-cyan');
        } else {
            vasoIcono.classList.add('text-muted-glass');
        }

        contenedorVasos.appendChild(vasoIcono);
    }
}

function actualizarInterfaz() {
    verificarReinicioDiario();

    if (contadorElement) {
        contadorElement.textContent = `${vasosTomados}/${vasosTotales}`;
    }

    if (metaElement) {
        const litrosTotales = ((vasosTotales * capacidadVaso) / 1000).toFixed(1);
        metaElement.textContent = `${vasosTotales} vasos al día (${litrosTotales}L - ${capacidadVaso}ml/vaso)`;
    }

    if (ringElement) {
        const porcentaje = Math.min((vasosTomados / vasosTotales) * 100, 100);
        ringElement.style.background = `conic-gradient(var(--ls-cyan) ${porcentaje}%, rgba(6, 182, 212, 0.15) ${porcentaje}%)`;
    }

    if (btnAddVaso) {
        if (vasosTomados >= vasosTotales) {
            btnAddVaso.textContent = '¡Meta alcanzada!';
            btnAddVaso.classList.add('opacity-75');
        } else {
            btnAddVaso.textContent = '+1 vaso';
            btnAddVaso.classList.remove('opacity-75');
        }
    }

    renderizarVasos();
}

function actualizarPreviewModal() {
    if (!inputVasos || !inputCapacidad || !previewMetaTotal) return;
    const v = parseInt(inputVasos.value) || 0;
    const c = parseInt(inputCapacidad.value) || 0;
    const totalLitros = ((v * c) / 1000).toFixed(1);
    previewMetaTotal.textContent = `${totalLitros} Litros / día`;
}

if (inputVasos) inputVasos.addEventListener('input', actualizarPreviewModal);
if (inputCapacidad) inputCapacidad.addEventListener('input', actualizarPreviewModal);

if (btnAddVaso) {
    btnAddVaso.addEventListener('click', () => {
        verificarReinicioDiario();
        vasosTomados++;
        guardarDatos();
        actualizarInterfaz();
    });
}

if (btnReiniciar) {
    btnReiniciar.addEventListener('click', () => {
        if (confirm('¿Quieres reiniciar la cuenta a 0?')) {
            vasosTomados = 0;
            guardarDatos();
            actualizarInterfaz();

            const modalElement = document.getElementById('modalEditarHidratacion');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            if (kebabMenu) kebabMenu.classList.remove('show');
        }
    });
}

if (btnGuardar) {
    btnGuardar.addEventListener('click', () => {
        const nuevosVasos = parseInt(inputVasos.value);
        const nuevaCapacidad = parseInt(inputCapacidad.value);

        if (isNaN(nuevosVasos) || nuevosVasos < 1 || nuevosVasos > 30) {
            alert('Por favor ingresa una cantidad de vasos válida (1 a 30).');
            return;
        }

        if (isNaN(nuevaCapacidad) || nuevaCapacidad < 100 || nuevaCapacidad > 1000) {
            alert('Por favor ingresa una capacidad de vaso válida (100 a 1000 ml).');
            return;
        }

        vasosTotales = nuevosVasos;
        capacidadVaso = nuevaCapacidad;

        guardarDatos();
        actualizarInterfaz();

        const modalElement = document.getElementById('modalEditarHidratacion');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
        if (kebabMenu) kebabMenu.classList.remove('show');
    });
}

cargarDatos();
actualizarInterfaz();