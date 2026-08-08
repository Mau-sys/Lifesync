let estadoApp = {
    sesionesCompletadas: 0,
    metaSesiones: 5,
    duracionPorSesion: 45
};

const btnOptions = document.getElementById('btn-options-academico');
const kebabMenu = document.getElementById('kebab-menu-academico');
const btnEditarMeta = document.getElementById('btn-editar-meta');
const btnRegresar = document.getElementById('btn-regresar');
const btnAddSesion = document.getElementById('btn-add-sesion');

const contadorSesiones = document.getElementById('contador-sesiones');
const metaSesionesTexto = document.getElementById('meta-sesiones');
const tiempoAcumuladoTexto = document.getElementById('tiempo-acumulado');
const ringSesiones = document.getElementById('ring-sesiones');

const modalElement = document.getElementById('modalConfiguracion');
const modalConfiguracion = new bootstrap.Modal(modalElement);
const inputNumSesiones = document.getElementById('input-num-sesiones');
const inputDuracionSesion = document.getElementById('input-duracion-sesion');
const previewMetaTotal = document.getElementById('preview-meta-total');
const btnGuardarMeta = document.getElementById('btn-guardar-meta');
const btnReiniciarMeta = document.getElementById('btn-reiniciar-meta');

function obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
}

function verificarReinicioDiario() {
    const hoy = obtenerFechaHoy();
    const ultimaFecha = localStorage.getItem('ls_academico_fecha');

    if (ultimaFecha !== hoy) {
        estadoApp.sesionesCompletadas = 0;
        localStorage.setItem('ls_academico_fecha', hoy);
        guardarDatosStorage();
    }
}

function cargarDatosStorage() {
    const configGuardada = localStorage.getItem('ls_academico_config');
    if (configGuardada) {
        const config = JSON.parse(configGuardada);
        estadoApp.metaSesiones = config.metaSesiones || 5;
        estadoApp.duracionPorSesion = config.duracionPorSesion || 45;
    }

    verificarReinicioDiario();

    const progresoGuardado = localStorage.getItem('ls_academico_sesiones');
    if (progresoGuardado !== null) {
        estadoApp.sesionesCompletadas = parseInt(progresoGuardado) || 0;
    }
}

function guardarDatosStorage() {
    localStorage.setItem('ls_academico_sesiones', estadoApp.sesionesCompletadas);
    localStorage.setItem('ls_academico_config', JSON.stringify({
        metaSesiones: estadoApp.metaSesiones,
        duracionPorSesion: estadoApp.duracionPorSesion
    }));
}

function formatearMinutosAHoras(minutosTotales) {
    if (minutosTotales < 60) return `${minutosTotales} min`;
    const horas = Math.floor(minutosTotales / 60);
    const minsRestantes = minutosTotales % 60;
    return minsRestantes > 0 ? `${horas}h ${minsRestantes}m` : `${horas}h`;
}

function actualizarInterfaz() {
    verificarReinicioDiario();

    const tiempoActualMin = estadoApp.sesionesCompletadas * estadoApp.duracionPorSesion;
    const tiempoMetaTotalMin = estadoApp.metaSesiones * estadoApp.duracionPorSesion;
    const porcentaje = Math.min(Math.round((estadoApp.sesionesCompletadas / estadoApp.metaSesiones) * 100), 100);

    contadorSesiones.textContent = `${estadoApp.sesionesCompletadas}/${estadoApp.metaSesiones}`;
    metaSesionesTexto.textContent = `${estadoApp.metaSesiones} sesiones (${estadoApp.duracionPorSesion} min/sesión)`;
    
    tiempoAcumuladoTexto.textContent = `${formatearMinutosAHoras(tiempoActualMin)} / ${formatearMinutosAHoras(tiempoMetaTotalMin)}`;

    ringSesiones.style.background = `conic-gradient(var(--ls-pink) ${porcentaje}%, rgba(236, 72, 153, 0.15) ${porcentaje}%)`;

    if (estadoApp.sesionesCompletadas >= estadoApp.metaSesiones) {
        btnAddSesion.textContent = '¡Meta diaria completada!';
        btnAddSesion.disabled = true;
    } else {
        btnAddSesion.textContent = '+1 sesión de estudio';
        btnAddSesion.disabled = false;
    }
}

function actualizarPreviewModal() {
    const s = parseInt(inputNumSesiones.value) || 0;
    const d = parseInt(inputDuracionSesion.value) || 0;
    const totalMin = s * d;
    previewMetaTotal.textContent = `${totalMin} min (${formatearMinutosAHoras(totalMin)})`;
}

btnOptions.addEventListener('click', (e) => {
    e.stopPropagation();
    kebabMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (kebabMenu && !kebabMenu.contains(e.target)) {
        kebabMenu.classList.remove('show');
    }
});

if (btnRegresar) {
    btnRegresar.addEventListener('click', () => {
        const paginaAnterior = document.referrer;
        if (paginaAnterior && paginaAnterior.includes(window.location.host)) {
            window.history.back();
        } else {
            window.location.href = 'inicio.html';
        }
    });
}

btnEditarMeta.addEventListener('click', (e) => {
    e.preventDefault();
    kebabMenu.classList.remove('show');
    
    inputNumSesiones.value = estadoApp.metaSesiones;
    inputDuracionSesion.value = estadoApp.duracionPorSesion;
    actualizarPreviewModal();
    
    modalConfiguracion.show();
});

inputNumSesiones.addEventListener('input', actualizarPreviewModal);
inputDuracionSesion.addEventListener('input', actualizarPreviewModal);

btnReiniciarMeta.addEventListener('click', () => {
    if (confirm('¿Quieres reiniciar las sesiones de hoy a 0?')) {
        estadoApp.sesionesCompletadas = 0;
        guardarDatosStorage();
        actualizarInterfaz();
        modalConfiguracion.hide();
    }
});

btnGuardarMeta.addEventListener('click', () => {
    const nuevasSesiones = parseInt(inputNumSesiones.value);
    const nuevaDuracion = parseInt(inputDuracionSesion.value);

    if (isNaN(nuevasSesiones) || nuevasSesiones < 1 || nuevasSesiones > 50) {
        alert('Ingresa un número de sesiones válido (1 a 50).');
        return;
    }

    if (isNaN(nuevaDuracion) || nuevaDuracion < 5 || nuevaDuracion > 240) {
        alert('Ingresa una duración válida por sesión (5 a 240 minutos).');
        return;
    }

    estadoApp.metaSesiones = nuevasSesiones;
    estadoApp.duracionPorSesion = nuevaDuracion;

    if (estadoApp.sesionesCompletadas > estadoApp.metaSesiones) {
        estadoApp.sesionesCompletadas = estadoApp.metaSesiones;
    }

    guardarDatosStorage();
    actualizarInterfaz();
    modalConfiguracion.hide();
});

btnAddSesion.addEventListener('click', () => {
    verificarReinicioDiario();
    if (estadoApp.sesionesCompletadas < estadoApp.metaSesiones) {
        estadoApp.sesionesCompletadas++;
        guardarDatosStorage();
        actualizarInterfaz();
    }
});

cargarDatosStorage();
actualizarInterfaz();