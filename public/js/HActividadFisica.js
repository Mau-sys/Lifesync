function LS(clave) {
    return typeof window !== "undefined" && typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(clave) : clave;
}

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
                return `${horas} ${horas === 1 ? LS("hora") : LS("horas")}`;
            }
            return `${horas} ${horas === 1 ? LS("hora") : LS("horas")} y ${minsRestantes} ${LS("min")}`;
        }
        return `${minutosTotales} ${LS("min")}`;
    }

    function renderizarProgreso() {
        const numSesiones = registrosFisica.sesiones.length;
        const totalMinutos = registrosFisica.minutosTotales || 0;

        let objetivoSesiones = configFisica.metaSesiones;
        let textoLabel = LS("metaSemanal");
        let textoMetaDetail = '';

        const textoTiempoObjetivo = formatearTiempo(configFisica.metaMinutos);

        if (configFisica.tipoMeta === 'diaria') {
            textoLabel = LS("metaDiaria");
            textoMetaDetail = `${objetivoSesiones} ${objetivoSesiones === 1 ? LS("sesion") : LS("sesiones")} (${textoTiempoObjetivo})`;
        } else if (configFisica.tipoMeta === 'semanal') {
            textoLabel = LS("metaSemanal");
            textoMetaDetail = `${objetivoSesiones} ${objetivoSesiones === 1 ? LS("sesion") : LS("sesiones")} (${textoTiempoObjetivo})`;
        } else if (configFisica.tipoMeta === 'mensual') {
            textoLabel = LS("metaMensual");
            textoMetaDetail = `${objetivoSesiones} ${objetivoSesiones === 1 ? LS("sesion") : LS("sesiones")} (${textoTiempoObjetivo})`;
        } else if (configFisica.tipoMeta === 'personalizado') {
            const numDias = (configFisica.diasSeleccionados || []).length;
            textoLabel = LS("metaDeDias").replace("{n}", numDias).replace("{unidad}", numDias === 1 ? LS("dia") : LS("dias"));
            textoMetaDetail = `${objetivoSesiones} ${objetivoSesiones === 1 ? LS("sesion") : LS("sesiones")} (${textoTiempoObjetivo})`;
        }

        labelTipoMeta.textContent = textoLabel;
        metaFisica.textContent = textoMetaDetail;
        contadorSesiones.textContent = `${numSesiones}/${objetivoSesiones}`;
        labelProgresoUnidad.textContent = numSesiones === 1 ? LS("sesion") : LS("sesiones");

        tiempoAcumulado.textContent = `${totalMinutos} ${LS("min")} / ${configFisica.metaMinutos} ${LS("min")}`;

        const porcentajeSesiones = objetivoSesiones > 0 ? Math.min((numSesiones / objetivoSesiones) * 100, 100) : 0;
        ringFisica.style.background = `conic-gradient(var(--ls-amber) ${porcentajeSesiones}%, rgba(255, 159, 28, 0.15) ${porcentajeSesiones}%)`;

        if (objetivoSesiones > 0 && numSesiones >= objetivoSesiones && totalMinutos >= configFisica.metaMinutos) {
            btnAddSesion.textContent = LS("metaCompletada");
        } else {
            btnAddSesion.textContent = LS("registrarSesion");
        }
    }

    function reiniciarProgreso() {
        if (confirm(LS("confirmarReinicioFisica"))) {
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
            alert(LS("tiempoSesionValido"));
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
            labelMetaCantidad.childNodes[0].nodeValue = LS("sesionesLabel") + " ";
        } else {
            contenedorDiasSemana.classList.add('d-none');
            labelMetaCantidad.childNodes[0].nodeValue = LS("sesionesLabel") + " ";
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
            alert(LS("metaTiempoValida"));
            return;
        }

        const maxPermitido = LIMITES_FRECUENCIA[tipoMeta] || 30;
        if (!metaSesiones || metaSesiones < 1 || metaSesiones > maxPermitido) {
            alert(LS("numeroSesionesFisicaValido").replace("{max}", maxPermitido));
            return;
        }

        if (tipoMeta === 'personalizado' && diasTemporal.length === 0) {
            alert(LS("seleccionarDiaSemana"));
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

    window.addEventListener("lifesyncIdiomaCambiado", renderizarProgreso);
});