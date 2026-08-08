document.addEventListener("DOMContentLoaded", () => {

    cargarInsignias();

});


async function cargarInsignias() {

    const contenedor =
        document.getElementById("contenedorInsignias");


    if (!contenedor) {
        return;
    }


    try {

        const respuesta = await fetch(
            "../insignias/obtener_insignias.php",
            {
                method: "GET",
                credentials: "include"
            }
        );


        const datos = await respuesta.json();


        if (!respuesta.ok || !datos.exito) {

            contenedor.innerHTML = "";

            return;

        }


        contenedor.innerHTML = "";


        if (
            !datos.insignias ||
            datos.insignias.length === 0
        ) {

            contenedor.innerHTML =
                '<span class="sin-insignias">Sin insignias aún</span>';

            return;

        }


        datos.insignias.forEach((insignia) => {

            const img =
                document.createElement("img");


            img.src = insignia.icono;

            img.alt = insignia.nombre;

            img.title =
                `${insignia.nombre}: ${insignia.descripcion}`;

            img.classList.add("insignia-item");


            contenedor.appendChild(img);

        });


    } catch (error) {

        console.error(
            "Error al cargar las insignias:",
            error
        );

        contenedor.innerHTML = "";

    }

}