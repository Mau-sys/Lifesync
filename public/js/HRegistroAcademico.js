let estadoApp = {
    sesionesCompletadas: 2,
    metaSesiones: 5,
    duracionPorSesion: 48
};

const btnOptions = document.getElementById('btn-options-academico');
const kebabMenu = document.getElementById('kebab-menu-academico');
const btnEditarMeta = document.getElementById('btn-editar-meta');
const btnAddSesion = document.getElementById('btn-add-sesion');

const contadorSesiones = document.getElementById('contador-sesiones');
const metaSesionesTexto = document.getElementById('meta-sesiones');
const tiempoAcumuladoTexto = document.getElementById('tiempo-acumulado');
const ringSesiones = document.getElementById('ring-sesiones');

const modalElement = document.getElementById('modalConfiguracion');
const modalConfiguracion = new bootstrap.Modal(modalElement);
const inputNumSesiones = document.getElementById('input-num-sesiones');
const inputDuracionSesion = document.getElementById('input-duracion-sesion');
const btnGuardarMeta = document.getElementById('btn-guardar-meta');
const btnReiniciarMeta = document.getElementById('btn-reiniciar-meta');

btnOptions.addEventListener('click', (e) => {
    e.stopPropagation();
    kebabMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (!kebabMenu.contains(e.target)) {
        kebabMenu.classList.remove('show');
    }
});

btnEditarMeta.addEventListener('click', (e) => {
    e.preventDefault();
    kebabMenu.classList.remove('show');
    
    inputNumSesiones.value = estadoApp.metaSesiones;
    inputDuracionSesion.value = estadoApp.duracionPorSesion;
    
    modalConfiguracion.show();
});

btnReiniciarMeta.addEventListener('click', () => {
    estadoApp.sesionesCompletadas = 0;
    actualizarInterfaz();
    modalConfiguracion.hide();
});

btnGuardarMeta.addEventListener('click', () => {
    const nuevasSesiones = parseInt(inputNumSesiones.value);
    const nuevaDuracion = parseInt(inputDuracionSesion.value);

    if (nuevasSesiones > 0 && nuevaDuracion > 0) {
        estadoApp.metaSesiones = nuevasSesiones;
        estadoApp.duracionPorSesion = nuevaDuracion;
        
        if (estadoApp.sesionesCompletadas > estadoApp.metaSesiones) {
            estadoApp.sesionesCompletadas = estadoApp.metaSesiones;
        }

        actualizarInterfaz();
        modalConfiguracion.hide();
    }
});

btnAddSesion.addEventListener('click', () => {
    if (estadoApp.sesionesCompletadas < estadoApp.metaSesiones) {
        estadoApp.sesionesCompletadas++;
        actualizarInterfaz();
    }
});

function actualizarInterfaz() {
    const tiempoActual = estadoApp.sesionesCompletadas * estadoApp.duracionPorSesion;
    const tiempoMetaTotal = estadoApp.metaSesiones * estadoApp.duracionPorSesion;
    const porcentaje = Math.round((estadoApp.sesionesCompletadas / estadoApp.metaSesiones) * 100);

    contadorSesiones.textContent = `${estadoApp.sesionesCompletadas}/${estadoApp.metaSesiones}`;
    metaSesionesTexto.textContent = `${estadoApp.metaSesiones} sesiones de estudio`;
    tiempoAcumuladoTexto.textContent = `${tiempoActual} min / ${tiempoMetaTotal} min`;

    ringSesiones.style.background = `conic-gradient(var(--ls-pink) ${porcentaje}%, rgba(236, 72, 153, 0.15) ${porcentaje}%)`;
}