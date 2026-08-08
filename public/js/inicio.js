document.addEventListener("DOMContentLoaded", () => {

    const nombreUsuario = document.getElementById("nombreUsuario");
    const fotoPerfil = document.getElementById("fotoPerfil");
    const fechaActual = document.getElementById("fechaActual");

    const diasRacha = document.getElementById("diasRacha");

    const porcentajeGeneral =
        document.getElementById("porcentajeGeneral");

    const barraProgreso =
        document.getElementById("barraProgreso");

    const contenedorCategorias =
        document.getElementById("contenedorCategorias");

    const btnNotificaciones =
        document.getElementById("btnNotificaciones");

    const cerrarPanel =
        document.getElementById("cerrarPanel");

    const overlayNotificaciones =
        document.getElementById("overlayNotificaciones");

    const panelNotificaciones =
        document.getElementById("panelNotificaciones");

    const listaNotificaciones =
        document.getElementById("listaNotificaciones");

    const contadorNotificaciones =
        document.getElementById("contadorNotificaciones");


    function mostrarFecha() {

        const fecha = new Date();

        fechaActual.textContent =
            fecha.toLocaleDateString("es-SV", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });

    }


    function actualizarProgreso(porcentaje) {

        const valor = Math.max(
            0,
            Math.min(100, Number(porcentaje) || 0)
        );

        porcentajeGeneral.textContent =
            `${Math.round(valor)}%`;

        barraProgreso.style.width =
            `${valor}%`;

    }


    function obtenerIconoCategoria(categoria) {

        const iconos = {

            "Hidratación": "img/Hidrat.png",

            "Alimentación": "img/Alimen.png",

            "Salud Mental": "img/S-Mental.png",

            "Actividad Física": "img/A-Fisica.png",

            "Registro Académico": "img/R-Academ.png",

            "Hábito Personalizado": "img/H-Perzona.png"

        };

        return iconos[categoria] ||
            "img/H-Perzona.png";

    }


    function crearTarjetaHabito(habito) {

        const article =
            document.createElement("article");

        article.className = "categoria";

        const porcentaje =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(habito.porcentaje) || 0
                )
            );

        const detalle =
            habito.detalle ||
            `${habito.progreso || 0} de ${habito.objetivo || 0} ${habito.unidad_medida || ""}`;

        article.innerHTML = `

            <div class="categoria-info">

                <img
                    src="${obtenerIconoCategoria(
                        habito.categoria
                    )}"
                    alt="${habito.categoria}">

                <div>

                    <h3 class="nombre-categoria">
                        ${escapeHtml(habito.nombre_habito)}
                    </h3>

                    <p class="detalle-categoria">
                        ${escapeHtml(detalle)}
                    </p>

                </div>

            </div>

            <div class="circulo">
                ${Math.round(porcentaje)}%
            </div>

        `;

        return article;

    }


    function escapeHtml(texto) {

        const div =
            document.createElement("div");

        div.textContent =
            texto ?? "";

        return div.innerHTML;

    }


    function mostrarHabitos(habitos) {

        contenedorCategorias.innerHTML = "";

        if (!Array.isArray(habitos) ||
            habitos.length === 0) {

            contenedorCategorias.innerHTML = `

                <article class="categoria categoria-vacia">

                    <div class="categoria-info">

                        <img
                            src="img/Racha.png"
                            alt="Hábitos">

                        <div>

                            <h3 class="nombre-categoria">
                                ¡Todo completado!
                            </h3>

                            <p class="detalle-categoria">
                                Has completado todos tus hábitos de hoy.
                            </p>

                        </div>

                    </div>

                    <div class="circulo">
                        ✓
                    </div>

                </article>

            `;

            return;
        }


        habitos.forEach((habito) => {

            contenedorCategorias.appendChild(
                crearTarjetaHabito(habito)
            );

        });

    }


    function crearNotificacion(notificacion) {

        const elemento =
            document.createElement("article");

        elemento.className =
            "notificacion-item";

        if (!notificacion.leida) {

            elemento.classList.add(
                "notificacion-no-leida"
            );

        }

        elemento.dataset.id =
            notificacion.id_notificacion;


        elemento.innerHTML = `

            <div class="notificacion-contenido">

                <div class="notificacion-titulo">

                    <h3>
                        ${escapeHtml(
                            notificacion.titulo
                        )}
                    </h3>

                    ${
                        !notificacion.leida
                        ? '<span class="punto-notificacion"></span>'
                        : ''
                    }

                </div>

                <p>
                    ${escapeHtml(
                        notificacion.mensaje
                    )}
                </p>

                <time>
                    ${escapeHtml(
                        notificacion.fecha_formateada ||
                        ""
                    )}
                </time>

            </div>

        `;

        return elemento;

    }


    function mostrarNotificaciones(notificaciones) {

        listaNotificaciones.innerHTML = "";

        if (!Array.isArray(notificaciones) ||
            notificaciones.length === 0) {

            listaNotificaciones.innerHTML = `

                <div class="sin-notificaciones">

                    <img
                        src="img/Campana.png"
                        alt="Sin notificaciones">

                    <h3>
                        Todo está al día
                    </h3>

                    <p>
                        Aquí aparecerán tus recordatorios,
                        logros, rachas, hábitos completados
                        y avisos de LifeSync.
                    </p>

                </div>

            `;

            contadorNotificaciones.textContent = "0";

            return;

        }


        notificaciones.forEach((notificacion) => {

            listaNotificaciones.appendChild(
                crearNotificacion(notificacion)
            );

        });

    }


    function actualizarContador(cantidad) {

        const valor =
            Number(cantidad) || 0;

        contadorNotificaciones.textContent =
            valor > 99 ? "99+" : valor;

        contadorNotificaciones.style.display =
            valor > 0 ? "flex" : "none";

    }


    function abrirNotificaciones() {

        panelNotificaciones.classList.remove(
            "oculto"
        );

        overlayNotificaciones.classList.remove(
            "oculto"
        );

        panelNotificaciones.setAttribute(
            "aria-hidden",
            "false"
        );

        btnNotificaciones.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add(
            "panel-notificaciones-abierto"
        );

        marcarNotificacionesLeidas();

    }


    function cerrarNotificaciones() {

        panelNotificaciones.classList.add(
            "oculto"
        );

        overlayNotificaciones.classList.add(
            "oculto"
        );

        panelNotificaciones.setAttribute(
            "aria-hidden",
            "true"
        );

        btnNotificaciones.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "panel-notificaciones-abierto"
        );

    }


    async function marcarNotificacionesLeidas() {

        try {

            const respuesta =
                await fetch(
                    "../auth/notificaciones-leer.php",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

            if (respuesta.ok) {

                actualizarContador(0);

            }

        } catch (error) {

            console.error(
                "No se pudieron marcar las notificaciones:",
                error
            );

        }

    }


    async function cargarInicio() {

        try {

            const respuesta =
                await fetch(
                    "../auth/inicio.php",
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );


            const datos =
                await respuesta.json();


            if (
                respuesta.status === 401 ||
                !datos.exito
            ) {

                window.location.href =
                    "Inicio-sesion.html";

                return;

            }


            nombreUsuario.textContent =
                datos.usuario.nombre;


            if (datos.usuario.foto) {

                fotoPerfil.src =
                    datos.usuario.foto;

            }


            actualizarProgreso(
                datos.progreso.porcentaje
            );


            diasRacha.textContent =
                datos.racha;


            mostrarHabitos(
                datos.habitos_pendientes
            );


            mostrarNotificaciones(
                datos.notificaciones
            );


            actualizarContador(
                datos.notificaciones_no_leidas
            );


        } catch (error) {

            console.error(
                "Error al cargar Inicio:",
                error
            );

            contenedorCategorias.innerHTML = `

                <article class="categoria categoria-vacia">

                    <div class="categoria-info">

                        <div>

                            <h3 class="nombre-categoria">
                                No se pudo cargar la información
                            </h3>

                            <p class="detalle-categoria">
                                Comprueba tu conexión e inténtalo nuevamente.
                            </p>

                        </div>

                    </div>

                </article>

            `;

        }

    }


    btnNotificaciones.addEventListener(
        "click",
        abrirNotificaciones
    );


    cerrarPanel.addEventListener(
        "click",
        cerrarNotificaciones
    );


    overlayNotificaciones.addEventListener(
        "click",
        cerrarNotificaciones
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                !panelNotificaciones.classList.contains(
                    "oculto"
                )
            ) {

                cerrarNotificaciones();

            }

        }
    );


    mostrarFecha();

    cargarInicio();

});