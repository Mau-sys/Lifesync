document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_CONFIG = [
        { id: 'desayuno', nombre: 'Desayuno', icono: 'fa-cloud-sun', activo: true, inicio: '07:00', fin: '09:00' },
        { id: 'merienda_m', nombre: 'Merienda M.', icono: 'fa-cookie-bite', activo: false, inicio: '10:30', fin: '11:00' },
        { id: 'almuerzo', nombre: 'Almuerzo', icono: 'fa-sun', activo: true, inicio: '12:30', fin: '14:30' },
        { id: 'merienda_t', nombre: 'Merienda T.', icono: 'fa-mug-hot', activo: false, inicio: '16:30', fin: '17:00' },
        { id: 'cena', nombre: 'Cena', icono: 'fa-moon', activo: true, inicio: '19:00', fin: '21:00' }
    ];

    let configComidas = JSON.parse(localStorage.getItem('lifesync_config_alimentacion')) || DEFAULT_CONFIG;
    let registrosHoy = JSON.parse(localStorage.getItem('lifesync_registros_alimentacion')) || {};

    const btnOptions = document.getElementById('btn-options-academico');
    const kebabMenu = document.getElementById('kebab-menu-academico');
    const btnRegresar = document.getElementById('btn-regresar');
    const listaComidasContainer = document.getElementById('lista-comidas');
    const btnAddComida = document.getElementById('btn-add-comida');
    const contadorComidas = document.getElementById('contador-comidas');
    const metaComidas = document.getElementById('meta-comidas');
    const ringComidas = document.getElementById('ring-comidas');
    const modalElement = document.getElementById('modalEditarMeta');
    const modalBootstrap = new bootstrap.Modal(modalElement);

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

    function formatTime12h(time24) {
        if (!time24) return '';
        const [h, m] = time24.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m < 10 ? '0' : ''}${m} ${period}`;
    }

    function renderizarComidas() {
        listaComidasContainer.innerHTML = '';
        const comidasActivas = configComidas.filter(c => c.activo);
        let completadas = 0;

        comidasActivas.forEach(comida => {
            const estaCompletada = !!registrosHoy[comida.id];
            if (estaCompletada) completadas++;

            const col = document.createElement('div');
            col.className = `text-center comida-card p-2 rounded-3 ${estaCompletada ? 'comida-completada' : ''}`;
            col.style.cursor = 'pointer';
            col.style.minWidth = '75px';

            col.innerHTML = `
                <i class="fa-solid ${comida.icono} ${estaCompletada ? 'text-emerald' : 'text-subtle'} fs-4 mb-1"></i>
                <span class="d-block ${estaCompletada ? 'text-white' : 'text-subtle'} fw-medium subtexto-fluido">${comida.nombre}</span>
                <span class="d-block text-subtle small hora-rango-texto">${formatTime12h(comida.inicio)} - ${formatTime12h(comida.fin)}</span>
            `;

            col.addEventListener('click', () => {
                registrosHoy[comida.id] = !registrosHoy[comida.id];
                guardarEstado();
            });

            listaComidasContainer.appendChild(col);
        });

        const totalMeta = comidasActivas.length;
        contadorComidas.textContent = `${completadas}/${totalMeta}`;
        metaComidas.textContent = `${totalMeta} tiempos al día`;

        const porcentaje = totalMeta > 0 ? (completadas / totalMeta) * 100 : 0;
        ringComidas.style.background = `conic-gradient(var(--ls-emerald) ${porcentaje}%, rgba(44, 212, 120, 0.15) ${porcentaje}%)`;

        if (completadas >= totalMeta) {
            btnAddComida.textContent = '¡Comidas completadas!';
            btnAddComida.classList.add('disabled');
        } else {
            btnAddComida.textContent = '+1 comida';
            btnAddComida.classList.remove('disabled');
        }
    }

    btnAddComida.addEventListener('click', () => {
        const comidasActivas = configComidas.filter(c => c.activo);
        const siguiente = comidasActivas.find(c => !registrosHoy[c.id]);
        if (siguiente) {
            registrosHoy[siguiente.id] = true;
            guardarEstado();
        }
    });

    function guardarEstado() {
        localStorage.setItem('lifesync_registros_alimentacion', JSON.stringify(registrosHoy));
        renderizarComidas();
    }

    const switchMM = document.getElementById('switch-merienda-m');
    const switchMT = document.getElementById('switch-merienda-t');

    switchMM.addEventListener('change', (e) => {
        document.getElementById('time-merienda-m-inicio').disabled = !e.target.checked;
        document.getElementById('time-merienda-m-fin').disabled = !e.target.checked;
    });

    switchMT.addEventListener('change', (e) => {
        document.getElementById('time-merienda-t-inicio').disabled = !e.target.checked;
        document.getElementById('time-merienda-t-fin').disabled = !e.target.checked;
    });

    document.getElementById('btn-editar-meta').addEventListener('click', () => {
        configComidas.forEach(c => {
            if (c.id === 'desayuno') {
                document.getElementById('time-desayuno-inicio').value = c.inicio;
                document.getElementById('time-desayuno-fin').value = c.fin;
            } else if (c.id === 'merienda_m') {
                switchMM.checked = c.activo;
                document.getElementById('time-merienda-m-inicio').disabled = !c.activo;
                document.getElementById('time-merienda-m-fin').disabled = !c.activo;
                document.getElementById('time-merienda-m-inicio').value = c.inicio;
                document.getElementById('time-merienda-m-fin').value = c.fin;
            } else if (c.id === 'almuerzo') {
                document.getElementById('time-almuerzo-inicio').value = c.inicio;
                document.getElementById('time-almuerzo-fin').value = c.fin;
            } else if (c.id === 'merienda_t') {
                switchMT.checked = c.activo;
                document.getElementById('time-merienda-t-inicio').disabled = !c.activo;
                document.getElementById('time-merienda-t-fin').disabled = !c.activo;
                document.getElementById('time-merienda-t-inicio').value = c.inicio;
                document.getElementById('time-merienda-t-fin').value = c.fin;
            } else if (c.id === 'cena') {
                document.getElementById('time-cena-inicio').value = c.inicio;
                document.getElementById('time-cena-fin').value = c.fin;
            }
        });
        document.getElementById('alert-horario-error').classList.add('d-none');
    });

    document.getElementById('btn-guardar-configuracion').addEventListener('click', () => {
        const errorAlert = document.getElementById('alert-horario-error');
        errorAlert.classList.add('d-none');

        const propuesta = [
            {
                id: 'desayuno', nombre: 'Desayuno', icono: 'fa-cloud-sun', activo: true,
                inicio: document.getElementById('time-desayuno-inicio').value,
                fin: document.getElementById('time-desayuno-fin').value
            },
            {
                id: 'merienda_m', nombre: 'Merienda M.', icono: 'fa-cookie-bite', activo: switchMM.checked,
                inicio: document.getElementById('time-merienda-m-inicio').value,
                fin: document.getElementById('time-merienda-m-fin').value
            },
            {
                id: 'almuerzo', nombre: 'Almuerzo', icono: 'fa-sun', activo: true,
                inicio: document.getElementById('time-almuerzo-inicio').value,
                fin: document.getElementById('time-almuerzo-fin').value
            },
            {
                id: 'merienda_t', nombre: 'Merienda T.', icono: 'fa-mug-hot', activo: switchMT.checked,
                inicio: document.getElementById('time-merienda-t-inicio').value,
                fin: document.getElementById('time-merienda-t-fin').value
            },
            {
                id: 'cena', nombre: 'Cena', icono: 'fa-moon', activo: true,
                inicio: document.getElementById('time-cena-inicio').value,
                fin: document.getElementById('time-cena-fin').value
            }
        ];

        const activas = propuesta.filter(c => c.activo);
        for (let i = 0; i < activas.length; i++) {
            const actual = activas[i];

            if (!actual.inicio || !actual.fin) {
                errorAlert.textContent = `Por favor especifica las horas de inicio y fin para ${actual.nombre}.`;
                errorAlert.classList.remove('d-none');
                return;
            }

            if (actual.inicio >= actual.fin) {
                errorAlert.textContent = `En ${actual.nombre}, la hora de inicio (${formatTime12h(actual.inicio)}) debe ser anterior a la hora de fin (${formatTime12h(actual.fin)}).`;
                errorAlert.classList.remove('d-none');
                return;
            }

            if (i > 0) {
                const anterior = activas[i - 1];
                if (actual.inicio < anterior.fin) {
                    errorAlert.textContent = `Incongruencia: El horario de ${actual.nombre} (${formatTime12h(actual.inicio)}) se traslapa o es anterior al fin de ${anterior.nombre} (${formatTime12h(anterior.fin)}).`;
                    errorAlert.classList.remove('d-none');
                    return;
                }
            }
        }

        configComidas = propuesta;
        localStorage.setItem('lifesync_config_alimentacion', JSON.stringify(configComidas));
        modalBootstrap.hide();
        renderizarComidas();
    });

    renderizarComidas();
});