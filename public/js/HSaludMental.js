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

let pausasCompletadas = 1;
let pausasTotales = 2;
let duracionPausa = 15;

const ringElement = document.getElementById('ring-saludmental');
const contadorElement = document.getElementById('contador-saludmental');
const metaElement = document.getElementById('meta-saludmental');
const btnAddPausa = document.getElementById('btn-add-pausa');
const listaPausas = document.getElementById('lista-pausas');

const btnGuardar = document.getElementById('btn-guardar-config');
const inputPausas = document.getElementById('input-pausas');
const inputDuracion = document.getElementById('input-duracion');

function actualizarInterfaz() {
    if (contadorElement) {
        contadorElement.textContent = `${pausasCompletadas}/${pausasTotales}`;
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
}

if (btnAddPausa) {
    btnAddPausa.addEventListener('click', () => {
        if (pausasCompletadas < pausasTotales) {
            pausasCompletadas++;

            if (listaPausas) {
                const ahora = new Date();
                const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const item = document.createElement('div');
                item.className = 'd-flex justify-content-between align-items-center py-1';
                item.innerHTML = `
                    <span class="text-white fw-medium subtexto-fluido">${horaFormateada}</span>
                    <i class="fa-solid fa-circle-check text-purple fs-5"></i>
                `;
                listaPausas.appendChild(item);
            }

            actualizarInterfaz();
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

        if (metaElement) {
            metaElement.textContent = `${pausasTotales} pausas conscientes (${duracionPausa} min/pausa)`;
        }

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

actualizarInterfaz();