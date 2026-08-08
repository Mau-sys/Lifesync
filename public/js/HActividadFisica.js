document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_CONFIG = {
        tipoMeta: 'semanal',
        metaSesiones: 5,
        metaMinutos: 150,
        diasSeleccionados: [0, 2, 4]
    };

    const LIMITES_FRECUENCIA = {
        diaria: 10,
        semanal: 14,
        mensual: 30,
        personalizado: 50
    };

    let configFisica = JSON.parse(localStorage.getItem('lifesync_config_fisica')) || DEFAULT_CONFIG;
    let registrosFisica = JSON.parse(localStorage.getItem('lifesync_registros_fisica')) || { sesiones: [], minutosTotales: 0 };

    const btnOptions = document.getElementById('btn-options-academico');
    const kebabMenu = document.getElementById('kebab-menu-academico');
    const btnRegresar = document.getElementById('btn-regresar');
    const btnAddSesion = document.getElementById('btn-add-sesion-fisica');
    const btnGuardarSesion = document.getElementById('btn-guardar-sesion');
    const btnGuardarMeta = document.getElementById('btn-guardar-meta');
    const btnReiniciarModal = document.getElementById('btn-reiniciar-habito-modal');

    const contadorSesiones = document.getElementById('contador-sesiones-fisica');
    const labelProgresoUnidad = document.getElementById('label-progreso-unidad');
    const labelTipoMeta = document.getElementById('label-tipo-meta');
    const metaFisica = document.getElementById('meta-fisica');
    const ringFisica = document.getElementById('ring-sesiones-fisica');
    const tiempoAcumulado = document.getElementById('tiempo-acumulado-fisica');

    const selectTipoMeta = document.getElementById('select-tipo-meta');
    const contenedorDiasSemana = document.getElementById('contenedor-dias-semana');
    const labelMetaCantidad = document.getElementById('label-meta-cantidad');
    const inputMetaCantidad = document.getElementById('input-meta-cantidad');
    const helpLimiteSesiones = document.getElementById('help-limite-sesiones');
    const btnsDias = document.querySelectorAll('.btn-dia-pill');

    const modalSesionBootstrap = new bootstrap.Modal(document.getElementById('modalRegistrarSesion'));
    const modalMetaBootstrap = new bootstrap.Modal(document.getElementById('modalEditarMetaFisica'));

    let diasTemporal = [...(configFisica.diasSeleccionados || [])];

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
        btnRegresar.addEventListener('click', (e) => {
            e.preventDefault();
            const paginaAnterior = document.referrer;
            if (paginaAnterior && paginaAnterior.includes(window.location.host)) {
                window.history.back();
            } else {
                window.location.href = 'inicio.html';
            }
        });
    }

    function formatearTiempo(minutosTotales) {
        if (minutosTotales >= 60) {
            const horas = Math.floor(minutosTotales / 60);
            const minsRestantes = minutosTotales % 60;
            if (minsRestantes === 0) {
                return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
            }
            return `${horas} ${horas === 1 ? 'hora' : 'horas'} y ${minsRestantes} min`;
        }
        return `${minutosTotales} min`;
    }

    function renderizarProgreso() {
        const numSesiones = registrosFisica.sesiones.length;
        const totalMinutos = registrosFisica.minutosTotales || 0;

        let objetivoSesiones = configFisica.metaSesiones;
        let textoLabel = 'Meta semanal';
        let textoMetaDetail = '';

        const textoTiempoObjetivo = formatearTiempo(configFisica.metaMinutos);

        if (configFisica.tipoMeta === 'diaria') {
            textoLabel = 'Meta diaria';
            textoMetaDetail = `${objetivoSesiones} ${objetivoSesiones === 1 ? 'sesión' : 'sesiones'} (${textoTiempoObjetivo})`;
        } else if (configFisica.tipoMeta === 'semanal') {
            textoLabel = 'Meta semanal';
            textoMetaDetail = `${objetivoSesiones} ${objetivoSesiones === 1 ? 'sesión' : 'sesiones'} (${textoTiempoObjetivo})`;
        } else if (configFisica.tipoMeta === 'mensual') {
            textoLabel = 'Meta mensual';
            textoMetaDetail = `${objetivoSesiones} ${objetivoSesiones === 1 ? 'sesión' : 'sesiones'} (${textoTiempoObjetivo})`;
        } else if (configFisica.tipoMeta === 'personalizado') {
            const numDias = (configFisica.diasSeleccionados || []).length;
            textoLabel = `Meta de ${numDias} ${numDias === 1 ? 'día' : 'días'}`;
            textoMetaDetail = `${objetivoSesiones} ${objetivoSesiones === 1 ? 'sesión' : 'sesiones'} (${textoTiempoObjetivo})`;
        }

        labelTipoMeta.textContent = textoLabel;
        metaFisica.textContent = textoMetaDetail;
        contadorSesiones.textContent = `${numSesiones}/${objetivoSesiones}`;
        labelProgresoUnidad.textContent = numSesiones === 1 ? 'sesión' : 'sesiones';

        tiempoAcumulado.textContent = `${totalMinutos} min / ${configFisica.metaMinutos} min`;

        const porcentajeSesiones = objetivoSesiones > 0 ? Math.min((numSesiones / objetivoSesiones) * 100, 100) : 0;
        ringFisica.style.background = `conic-gradient(var(--ls-amber) ${porcentajeSesiones}%, rgba(255, 159, 28, 0.15) ${porcentajeSesiones}%)`;

        if (objetivoSesiones > 0 && numSesiones >= objetivoSesiones && totalMinutos >= configFisica.metaMinutos) {
            btnAddSesion.textContent = '¡Meta completada!';
        } else {
            btnAddSesion.textContent = '+ Registrar sesión';
        }
    }

    function reiniciarProgreso() {
        if (confirm('¿Estás seguro de que deseas reiniciar tu progreso actual? Los minutos y sesiones volverán a cero.')) {
            registrosFisica = { sesiones: [], minutosTotales: 0 };
            localStorage.setItem('lifesync_registros_fisica', JSON.stringify(registrosFisica));
            renderizarProgreso();
            modalMetaBootstrap.hide();
        }
    }

    btnReiniciarModal.addEventListener('click', () => {
        reiniciarProgreso();
    });

    btnAddSesion.addEventListener('click', () => {
        modalSesionBootstrap.show();
    });

    btnGuardarSesion.addEventListener('click', () => {
        const actividad = document.getElementById('select-tipo-actividad').value;
        const duracion = parseInt(document.getElementById('input-duracion-minutos').value, 10);

        if (!duracion || duracion <= 0 || duracion > 360) {
            alert('Por favor ingresa un tiempo válido de sesión (entre 1 y 360 minutos).');
            return;
        }

        registrosFisica.sesiones.push({
            actividad,
            duracion,
            fecha: new Date().toISOString()
        });

        registrosFisica.minutosTotales = (registrosFisica.minutosTotales || 0) + duracion;

        localStorage.setItem('lifesync_registros_fisica', JSON.stringify(registrosFisica));
        modalSesionBootstrap.hide();
        renderizarProgreso();
    });

    function actualizarInterfazModalMeta() {
        const valor = selectTipoMeta.value;
        
        if (valor === 'personalizado') {
            contenedorDiasSemana.classList.remove('d-none');
            labelMetaCantidad.childNodes[0].nodeValue = 'Sesiones ';
        } else {
            contenedorDiasSemana.classList.add('d-none');
            labelMetaCantidad.childNodes[0].nodeValue = 'Sesiones ';
        }

        const maxPermitido = LIMITES_FRECUENCIA[valor] || 30;
        inputMetaCantidad.max = maxPermitido;
        helpLimiteSesiones.textContent = `(Máx. ${maxPermitido})`;

        if (parseInt(inputMetaCantidad.value, 10) > maxPermitido) {
            inputMetaCantidad.value = maxPermitido;
        }
    }

    selectTipoMeta.addEventListener('change', actualizarInterfazModalMeta);

    btnsDias.forEach(btn => {
        btn.addEventListener('click', () => {
            const diaNum = parseInt(btn.getAttribute('data-dia'), 10);
            if (diasTemporal.includes(diaNum)) {
                diasTemporal = diasTemporal.filter(d => d !== diaNum);
                btn.classList.remove('selected');
            } else {
                diasTemporal.push(diaNum);
                btn.classList.add('selected');
            }
        });
    });

    document.getElementById('btn-editar-meta').addEventListener('click', () => {
        if (kebabMenu) kebabMenu.classList.remove('show');
        
        selectTipoMeta.value = configFisica.tipoMeta;
        inputMetaCantidad.value = configFisica.metaSesiones;
        document.getElementById('input-meta-minutos').value = configFisica.metaMinutos;
        
        diasTemporal = [...(configFisica.diasSeleccionados || [])];
        btnsDias.forEach(btn => {
            const diaNum = parseInt(btn.getAttribute('data-dia'), 10);
            if (diasTemporal.includes(diaNum)) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });

        actualizarInterfazModalMeta();
    });

    btnGuardarMeta.addEventListener('click', () => {
        const tipoMeta = selectTipoMeta.value;
        const metaMinutos = parseInt(document.getElementById('input-meta-minutos').value, 10);
        const metaSesiones = parseInt(inputMetaCantidad.value, 10);

        if (!metaMinutos || metaMinutos <= 0 || metaMinutos > 3000) {
            alert('Por favor establece una meta de tiempo válida (entre 10 y 3000 minutos).');
            return;
        }

        const maxPermitido = LIMITES_FRECUENCIA[tipoMeta] || 30;
        if (!metaSesiones || metaSesiones < 1 || metaSesiones > maxPermitido) {
            alert(`El número de sesiones debe estar entre 1 y ${maxPermitido}.`);
            return;
        }

        if (tipoMeta === 'personalizado' && diasTemporal.length === 0) {
            alert('Por favor selecciona al menos un día de la semana.');
            return;
        }

        configFisica = {
            tipoMeta,
            metaSesiones,
            metaMinutos,
            diasSeleccionados: diasTemporal
        };

        localStorage.setItem('lifesync_config_fisica', JSON.stringify(configFisica));
        modalMetaBootstrap.hide();
        renderizarProgreso();
    });

    renderizarProgreso();
});