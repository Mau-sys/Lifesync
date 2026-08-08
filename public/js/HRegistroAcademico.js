let estadoApp = {
    sesionesCompletadas: 0,
    metaSesiones: 5,
    duracionPorSesion: 45,
    frecuencia: 'diario',
    diasActivos: [1, 2, 3, 4, 5]
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
const selectFrecuencia = document.getElementById('select-frecuencia');
const contenedorDiasSemana = document.getElementById('contenedor-dias-semana');
const labelNumSesiones = document.getElementById('label-num-sesiones');
const previewMetaTotal = document.getElementById('preview-meta-total');
const btnGuardarMeta = document.getElementById('btn-guardar-meta');
const btnReiniciarMeta = document.getElementById('btn-reiniciar-meta');

let diasSeleccionadosTemp = [];

function obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
}

function esNuevoPeriodo() {
    const hoy = new Date();
    const hoyFechaStr = hoy.toISOString().split('T')[0];
    const ultimaFechaStr = localStorage.getItem('ls_academico_fecha');

    if (!ultimaFechaStr) return true;
    if (ultimaFechaStr === hoyFechaStr) return false;

    const ultimaFecha = new Date(ultimaFechaStr + 'T00:00:00');

    if (estadoApp.frecuencia === 'diario') {
        return true;
    } else if (estadoApp.frecuencia === 'mensual') {
        return hoy.getMonth() !== ultimaFecha.getMonth() || hoy.getFullYear() !== ultimaFecha.getFullYear();
    } else if (estadoApp.frecuencia === 'personalizada') {
        const diaSemanaHoy = hoy.getDay();
        if (estadoApp.diasActivos.includes(diaSemanaHoy)) {
            return true;
        }
    }
    return false;
}

function verificarReinicioPeriodo() {
    const hoyStr = obtenerFechaHoy();
    if (esNuevoPeriodo()) {
        estadoApp.sesionesCompletadas = 0;
        localStorage.setItem('ls_academico_fecha', hoyStr);
        guardarDatosStorage();
    }
}

function cargarDatosStorage() {
    const configGuardada = localStorage.getItem('ls_academico_config');
    if (configGuardada) {
        const config = JSON.parse(configGuardada);
        estadoApp.metaSesiones = config.metaSesiones || 5;
        estadoApp.duracionPorSesion = config.duracionPorSesion || 45;
        estadoApp.frecuencia = config.frecuencia || 'diario';
        estadoApp.diasActivos = config.diasActivos || [1, 2, 3, 4, 5];
    }

    verificarReinicioPeriodo();

    const progresoGuardado = localStorage.getItem('ls_academico_sesiones');
    if (progresoGuardado !== null) {
        estadoApp.sesionesCompletadas = parseInt(progresoGuardado) || 0;
    }
}

function guardarDatosStorage() {
    localStorage.setItem('ls_academico_sesiones', estadoApp.sesionesCompletadas);
    localStorage.setItem('ls_academico_config', JSON.stringify({
        metaSesiones: estadoApp.metaSesiones,
        duracionPorSesion: estadoApp.duracionPorSesion,
        frecuencia: estadoApp.frecuencia,
        diasActivos: estadoApp.diasActivos
    }));
}

function formatearMinutosAHoras(minutosTotales) {
    if (minutosTotales < 60) return `${minutosTotales} min`;
    const horas = Math.floor(minutosTotales / 60);
    const minsRestantes = minutosTotales % 60;
    return minsRestantes > 0 ? `${horas}h ${minsRestantes}m` : `${horas}h`;
}

function obtenerEtiquetaFrecuencia() {
    if (estadoApp.frecuencia === 'diario') return 'Meta diaria';
    if (estadoApp.frecuencia === 'mensual') return 'Meta mensual';
    return 'Meta del periodo';
}

function actualizarInterfaz() {
    verificarReinicioPeriodo();

    const tiempoActualMin = estadoApp.sesionesCompletadas * estadoApp.duracionPorSesion;
    const tiempoMetaTotalMin = estadoApp.metaSesiones * estadoApp.duracionPorSesion;
    const porcentaje = Math.min(Math.round((estadoApp.sesionesCompletadas / estadoApp.metaSesiones) * 100), 100);

    const labelMeta = document.querySelector('.label-fluido');
    if (labelMeta) labelMeta.textContent = obtenerEtiquetaFrecuencia();

    contadorSesiones.textContent = `${estadoApp.sesionesCompletadas}/${estadoApp.metaSesiones}`;
    metaSesionesTexto.textContent = `${estadoApp.metaSesiones} sesiones (${estadoApp.duracionPorSesion} min/sesión)`;
    tiempoAcumuladoTexto.textContent = `${formatearMinutosAHoras(tiempoActualMin)} / ${formatearMinutosAHoras(tiempoMetaTotalMin)}`;

    ringSesiones.style.background = `conic-gradient(var(--ls-pink) ${porcentaje}%, rgba(236, 72, 153, 0.15) ${porcentaje}%)`;

    const hoyDiaSemana = new Date().getDay();
    const esDiaInactivo = estadoApp.frecuencia === 'personalizada' && !estadoApp.diasActivos.includes(hoyDiaSemana);

    if (estadoApp.sesionesCompletadas >= estadoApp.metaSesiones) {
        btnAddSesion.textContent = '¡Meta completada!';
        btnAddSesion.disabled = true;
    } else if (esDiaInactivo) {
        btnAddSesion.textContent = 'Día de descanso (Meta inactiva hoy)';
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

function renderizarBotonesDias() {
    const botones = document.querySelectorAll('.btn-dia-semana');
    botones.forEach(btn => {
        const dia = parseInt(btn.getAttribute('data-dia'));
        if (diasSeleccionadosTemp.includes(dia)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
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
    selectFrecuencia.value = estadoApp.frecuencia;
    diasSeleccionadosTemp = [...estadoApp.diasActivos];
    
    gestionarCambioFrecuencia();
    actualizarPreviewModal();
    
    modalConfiguracion.show();
});

function gestionarCambioFrecuencia() {
    const frec = selectFrecuencia.value;
    if (frec === 'personalizada') {
        contenedorDiasSemana.classList.remove('d-none');
        labelNumSesiones.textContent = 'Cantidad de sesiones por periodo (Máx. 100)';
        renderizarBotonesDias();
    } else if (frec === 'mensual') {
        contenedorDiasSemana.classList.add('d-none');
        labelNumSesiones.textContent = 'Cantidad de sesiones al mes (Máx. 100)';
    } else {
        contenedorDiasSemana.classList.add('d-none');
        labelNumSesiones.textContent = 'Cantidad de sesiones diarias (Máx. 50)';
    }
}

selectFrecuencia.addEventListener('change', gestionarCambioFrecuencia);

document.querySelectorAll('.btn-dia-semana').forEach(btn => {
    btn.addEventListener('click', () => {
        const dia = parseInt(btn.getAttribute('data-dia'));
        if (diasSeleccionadosTemp.includes(dia)) {
            if (diasSeleccionadosTemp.length > 1) {
                diasSeleccionadosTemp = diasSeleccionadosTemp.filter(d => d !== dia);
            } else {
                alert('Debes seleccionar al menos un día activo.');
            }
        } else {
            diasSeleccionadosTemp.push(dia);
        }
        renderizarBotonesDias();
    });
});

inputNumSesiones.addEventListener('input', actualizarPreviewModal);
inputDuracionSesion.addEventListener('input', actualizarPreviewModal);

btnReiniciarMeta.addEventListener('click', () => {
    if (confirm('¿Quieres reiniciar las sesiones de este periodo a 0?')) {
        estadoApp.sesionesCompletadas = 0;
        guardarDatosStorage();
        actualizarInterfaz();
        modalConfiguracion.hide();
    }
});

btnGuardarMeta.addEventListener('click', () => {
    const nuevasSesiones = parseInt(inputNumSesiones.value);
    const nuevaDuracion = parseInt(inputDuracionSesion.value);
    const nuevaFrecuencia = selectFrecuencia.value;

    if (isNaN(nuevasSesiones) || nuevasSesiones < 1 || nuevasSesiones > 100) {
        alert('Ingresa un número de sesiones válido (1 a 100).');
        return;
    }

    if (isNaN(nuevaDuracion) || nuevaDuracion < 5 || nuevaDuracion > 240) {
        alert('Ingresa una duración válida por sesión (5 a 240 minutos).');
        return;
    }

    if (nuevaFrecuencia === 'personalizada' && diasSeleccionadosTemp.length === 0) {
        alert('Selecciona al menos un día de la semana para la meta personalizada.');
        return;
    }

    estadoApp.metaSesiones = nuevasSesiones;
    estadoApp.duracionPorSesion = nuevaDuracion;
    estadoApp.frecuencia = nuevaFrecuencia;
    estadoApp.diasActivos = [...diasSeleccionadosTemp];

    if (estadoApp.sesionesCompletadas > estadoApp.metaSesiones) {
        estadoApp.sesionesCompletadas = estadoApp.metaSesiones;
    }

    guardarDatosStorage();
    actualizarInterfaz();
    modalConfiguracion.hide();
});

btnAddSesion.addEventListener('click', () => {
    verificarReinicioPeriodo();
    if (estadoApp.sesionesCompletadas < estadoApp.metaSesiones) {
        estadoApp.sesionesCompletadas++;
        guardarDatosStorage();
        actualizarInterfaz();
    }
});

cargarDatosStorage();
actualizarInterfaz();