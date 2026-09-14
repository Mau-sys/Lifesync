document.addEventListener('DOMContentLoaded', () => {
    const endpoint = '../auth/recordatorios.php';
    const modal = document.getElementById('modalRecordatorio');
    const formulario = document.getElementById('recordatorioForm');
    const lista = document.getElementById('listaRecordatorios');
    const sinRecordatorios = document.getElementById('sinRecordatorios');
    const campoFecha = document.getElementById('campoFecha');
    const fecha = document.getElementById('fechaRecordatorio');
    const repeticion = document.getElementById('repeticion');
    const titulo = document.getElementById('titulo');
    const t = clave => typeof window.traducirLifeSync === 'function' ? window.traducirLifeSync(clave) : clave;

    function abrir() {
        modal?.classList.remove('oculto');
        modal?.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => titulo?.focus(), 50);
    }

    function cerrar() {
        modal?.classList.add('oculto');
        modal?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        formulario?.reset();
        actualizarFecha();
    }

    function actualizarFecha() {
        const mostrar = repeticion?.value === 'una_vez';
        if (campoFecha) campoFecha.hidden = !mostrar;
        if (fecha) {
            fecha.required = mostrar;
            if (!mostrar) fecha.value = '';
        }
    }

    async function cargar() {
        try {
            const respuesta = await fetch(`${endpoint}?accion=listar`, { credentials: 'same-origin', cache: 'no-store' });
            const datos = await respuesta.json();
            if (!respuesta.ok || !datos.exito) throw new Error(datos.mensaje || 'No se pudieron cargar los recordatorios.');
            lista.innerHTML = '';
            const elementos = datos.recordatorios || [];
            if (sinRecordatorios) sinRecordatorios.style.display = elementos.length ? 'none' : 'block';
            elementos.forEach(recordatorio => lista.appendChild(crearTarjeta(recordatorio)));
        } catch (error) {
            console.error(error);
        }
    }

    function crearTarjeta(r) {
        const articulo = document.createElement('article');
        articulo.className = 'tarjeta-recordatorio';
        const contenido = document.createElement('div');
        contenido.className = 'informacion-recordatorio';
        const h3 = document.createElement('h3');
        h3.textContent = r.titulo;
        const detalle = document.createElement('p');
        detalle.className = 'detalles-recordatorio';
        const repeticiones = {
            diario: t('todosLosDias'),
            lunes_viernes: t('lunesViernes'),
            una_vez: t('soloUnaVez'),
            personalizado: t('personalizado')
        };
        let texto = `${r.categoria || t('sinCategoria')} • ${repeticiones[r.repeticion] || r.repeticion}`;
        if (r.repeticion === 'una_vez' && r.fecha_recordatorio) texto += ` • ${r.fecha_recordatorio}`;
        detalle.textContent = texto;
        contenido.append(h3, detalle);
        if (r.mensaje) {
            const p = document.createElement('p');
            p.textContent = r.mensaje;
            contenido.appendChild(p);
        }
        const acciones = document.createElement('div');
        acciones.className = 'acciones-recordatorio';
        const hora = document.createElement('strong');
        hora.className = 'hora-recordatorio';
        hora.textContent = String(r.hora || '').slice(0, 5);
        const eliminar = document.createElement('button');
        eliminar.type = 'button';
        eliminar.className = 'btn-eliminar-recordatorio';
        eliminar.textContent = '🗑';
        eliminar.title = t('eliminarRecordatorio');
        eliminar.addEventListener('click', () => eliminarRecordatorio(r.id_recordatorio));
        acciones.append(hora, eliminar);
        articulo.append(contenido, acciones);
        return articulo;
    }

    async function eliminarRecordatorio(id) {
        if (!confirm(t('eliminarRecordatorioPregunta'))) return;
        try {
            const respuesta = await fetch(endpoint, { method: 'POST', credentials: 'same-origin', headers: {'Content-Type':'application/json'}, body: JSON.stringify({accion:'eliminar', id_recordatorio:id}) });
            const datos = await respuesta.json();
            if (!respuesta.ok || !datos.exito) throw new Error(datos.mensaje || 'No se pudo eliminar el recordatorio.');
            cargar();
        } catch (error) {
            alert(error.message);
        }
    }

    document.getElementById('btnNuevoRecordatorio')?.addEventListener('click', abrir);
    document.getElementById('cerrarModal')?.addEventListener('click', cerrar);
    document.getElementById('cancelarRecordatorio')?.addEventListener('click', cerrar);
    repeticion?.addEventListener('change', actualizarFecha);
    modal?.addEventListener('click', e => { if (e.target === modal) cerrar(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal?.classList.contains('oculto')) cerrar(); });

    formulario?.addEventListener('submit', async e => {
        e.preventDefault();
        const datos = {
            accion:'crear',
            titulo:document.getElementById('titulo')?.value.trim() || '',
            id_categoria:document.getElementById('categoria')?.value || '',
            hora:document.getElementById('hora')?.value || '',
            repeticion:repeticion?.value || '',
            fecha_recordatorio:fecha?.value || '',
            mensaje:document.getElementById('mensaje')?.value.trim() || ''
        };
        if (!datos.titulo || !datos.hora || !datos.repeticion) return;
        if (datos.repeticion === 'una_vez' && !datos.fecha_recordatorio) return alert(t('seleccionaFecha'));
        try {
            const respuesta = await fetch(endpoint, { method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body:JSON.stringify(datos) });
            const resultado = await respuesta.json();
            if (!respuesta.ok || !resultado.exito) throw new Error(resultado.mensaje || 'No se pudo guardar el recordatorio.');
            cerrar();
            cargar();
        } catch (error) {
            alert(error.message);
        }
    });

    window.addEventListener('lifesyncIdiomaCambiado', cargar);
    actualizarFecha();
    cargar();
});
