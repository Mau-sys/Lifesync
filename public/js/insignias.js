document.addEventListener('DOMContentLoaded', () => {
    cargarInsignias();
});

/**
 * Función para solicitar y renderizar las insignias en el perfil
 */
async function cargarInsignias() {
    const contenedor = document.getElementById('contenedorInsignias');

    if (!contenedor) {
        console.error('El contenedor de insignias no existe en el DOM.');
        return;
    }

    try {
        // Ajusta la ruta del PHP según donde esté guardado (ej. 'php/obtener_insignias.php')
        const response = await fetch('obtener_insignias.php');
        
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.statusText}`);
        }

        const res = await response.json();

        if (res.status === 'success' && res.data.length > 0) {
            contenedor.innerHTML = ''; // Limpiar el contenedor

            res.data.forEach(insignia => {
                // Crear elemento de imagen para la insignia
                const img = document.createElement('img');
                img.src = insignia.imagen; // Ruta guardada en la BD (ej: "img/insignias/oro.png")
                img.alt = insignia.nombre;
                img.title = `${insignia.nombre}: ${insignia.descripcion}`; // Muestra texto al pasar el cursor
                img.classList.add('insignia-item');

                contenedor.appendChild(img);
            });
        } else if (res.data.length === 0) {
            contenedor.innerHTML = '<span class="sin-insignias">Sin insignias aún</span>';
        }

    } catch (error) {
        console.error('Error al cargar las insignias:', error);
    }
}