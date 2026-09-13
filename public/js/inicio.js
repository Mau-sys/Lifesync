(function () {
    "use strict";

    const LS = texto =>
        typeof window.traducirLifeSync === "function"
            ? window.traducirLifeSync(texto)
            : texto;

    const RUTAS = {
        "Hidratación": "Hhidratacion.html",
        "Alimentación": "HAlimentacion.html",
        "Salud Mental": "HSaludMental.html",
        "Actividad Física": "HActividadFisica.html",
        "Académico": "HRegistroAcademico.html",
        "Hábito Personalizado": "HHabitoPersonalizado.html"
    };

    const ICONOS = {
        "Hidratación": "img/Hidrat.png",
        "Alimentación": "img/Alimen.png",
        "Salud Mental": "img/S-Mental.png",
        "Actividad Física": "img/A-Fisica.png",
        "Académico": "img/R-Academ.png",
        "Hábito Personalizado": "img/H-Perzona.png"
    };

    document.addEventListener("DOMContentLoaded", () => {
        const btnNotificaciones = document.getElementById("btnNotificaciones");
        const panelNotificaciones = document.getElementById("panelNotificaciones");
        const overlayNotificaciones = document.getElementById("overlayNotificaciones");
        const cerrarPanel = document.getElementById("cerrarPanel");
        const listaNotificaciones = document.getElementById("listaNotificaciones");
        const contadorNotificaciones = document.getElementById("contadorNotificaciones");
        const nombreUsuario = document.getElementById("nombreUsuario");
        const fechaActual = document.getElementById("fechaActual");
        const fotoPerfil = document.getElementById("fotoPerfil");
        const contenedorCategorias = document.getElementById("contenedorCategorias");

        function abrirNotificaciones() {
            if (!panelNotificaciones) return;

            panelNotificaciones.classList.remove("oculto");
            overlayNotificaciones?.classList.remove("oculto");
            panelNotificaciones.setAttribute("aria-hidden", "false");
            btnNotificaciones?.setAttribute("aria-expanded", "true");
            document.body.classList.add("panel-notificaciones-abierto");
            cargarDatosInicio();
        }

        function cerrarNotificaciones() {
            if (!panelNotificaciones) return;

            panelNotificaciones.classList.add("oculto");
            overlayNotificaciones?.classList.add("oculto");
            panelNotificaciones.setAttribute("aria-hidden", "true");
            btnNotificaciones?.setAttribute("aria-expanded", "false");
            document.body.classList.remove("panel-notificaciones-abierto");
        }

        btnNotificaciones?.addEventListener("click", () => {
            if (panelNotificaciones?.classList.contains("oculto")) {
                abrirNotificaciones();
            } else {
                cerrarNotificaciones();
            }
        });

        cerrarPanel?.addEventListener("click", cerrarNotificaciones);
        overlayNotificaciones?.addEventListener("click", cerrarNotificaciones);

        document.addEventListener("keydown", evento => {
            if (
                evento.key === "Escape" &&
                panelNotificaciones &&
                !panelNotificaciones.classList.contains("oculto")
            ) {
                cerrarNotificaciones();
            }
        });

        async function cargarDatosInicio() {
            try {
                const respuesta = await fetch("../auth/inicio.php", {
                    method: "GET",
                    cache: "no-store",
                    credentials: "include",
                    headers: { "Accept": "application/json" }
                });

                const resultado = await respuesta.json();

                if (!respuesta.ok || !resultado.exito) {
                    throw new Error(resultado.mensaje || LS("noSePudieronCargarHabitos"));
                }

                actualizarUsuario(resultado.usuario);
                actualizarContador(resultado.notificaciones_no_leidas);
                mostrarNotificaciones(resultado.notificaciones);
                actualizarRacha(resultado.racha);
                actualizarProgreso(resultado.progreso);
                actualizarCategorias(resultado.habitos_hoy);
            } catch (error) {
                console.error("Error al cargar Inicio:", error);
                mostrarErrorInicio(error.message);
            }
        }

        function actualizarUsuario(usuario) {
            if (!usuario) return;

            if (nombreUsuario) {
                nombreUsuario.textContent = usuario.nombre || LS("usuario");
            }

            if (fotoPerfil && usuario.foto) {
                fotoPerfil.src = usuario.foto;
            }
        }

        function actualizarContador(cantidad) {
            if (!contadorNotificaciones) return;

            const numero = Math.max(0, Number(cantidad) || 0);
            contadorNotificaciones.textContent = numero > 99 ? "99+" : numero;
            contadorNotificaciones.classList.toggle("activo", numero > 0);
            btnNotificaciones?.classList.toggle("tiene-notificaciones", numero > 0);
        }

        function mostrarNotificaciones(notificaciones) {
            if (!listaNotificaciones) return;

            listaNotificaciones.innerHTML = "";

            if (!Array.isArray(notificaciones) || notificaciones.length === 0) {
                mostrarSinNotificaciones();
                return;
            }

            notificaciones.forEach(notificacion => {
                listaNotificaciones.appendChild(crearNotificacion(notificacion));
            });
        }

        function crearNotificacion(notificacion) {
            const articulo = document.createElement("article");
            articulo.className = "notificacion-item";

            const leida = notificacion.leida === true || Number(notificacion.leida) === 1;
            if (!leida) articulo.classList.add("notificacion-no-leida");

            const contenido = document.createElement("div");
            contenido.className = "notificacion-contenido";

            const encabezado = document.createElement("div");
            encabezado.className = "notificacion-titulo";

            const titulo = document.createElement("h3");
            titulo.textContent = notificacion.titulo || LS("notificacion");
            encabezado.appendChild(titulo);

            if (!leida) {
                const punto = document.createElement("span");
                punto.className = "punto-notificacion";
                punto.setAttribute("aria-label", LS("noLeida"));
                encabezado.appendChild(punto);
            }

            const mensaje = document.createElement("p");
            mensaje.textContent = notificacion.mensaje || "";

            const fecha = document.createElement("time");
            fecha.textContent = notificacion.fecha_formateada || "";

            contenido.append(encabezado, mensaje, fecha);
            articulo.appendChild(contenido);

            return articulo;
        }

        function mostrarSinNotificaciones() {
            if (!listaNotificaciones) return;

            const contenedor = document.createElement("div");
            contenedor.className = "sin-notificaciones";

            const imagen = document.createElement("img");
            imagen.src = "img/Campana.png";
            imagen.alt = LS("sinNotificaciones");

            const titulo = document.createElement("h3");
            titulo.textContent = LS("todoAlDia");

            const texto = document.createElement("p");
            texto.textContent = LS("descripcionSinNotificaciones");

            contenedor.append(imagen, titulo, texto);
            listaNotificaciones.appendChild(contenedor);
        }

        function mostrarErrorNotificaciones(mensaje) {
            if (!listaNotificaciones) return;

            listaNotificaciones.innerHTML = "";

            const contenedor = document.createElement("div");
            contenedor.className = "sin-notificaciones";

            const titulo = document.createElement("h3");
            titulo.textContent = LS("errorNotificaciones");

            const texto = document.createElement("p");
            texto.textContent = mensaje || LS("intentaNuevamente");

            contenedor.append(titulo, texto);
            listaNotificaciones.appendChild(contenedor);
        }

        async function marcarNotificacionesLeidas() {
            try {
                const respuesta = await fetch("../auth/notificaciones-leer.php", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                });

                if (!respuesta.ok) return;

                const resultado = await respuesta.json();
                if (!resultado.exito) return;

                actualizarContador(0);
            } catch (error) {
                console.error("Error al marcar notificaciones:", error);
            }
        }

        function mostrarFechaActual() {
            if (!fechaActual) return;

            const idioma =
                window.LifeSyncIdioma &&
                typeof window.LifeSyncIdioma.obtener === "function" &&
                window.LifeSyncIdioma.obtener() === "en"
                    ? "en-US"
                    : "es-ES";

            fechaActual.textContent = new Date().toLocaleDateString(idioma, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }

        function actualizarRacha(racha) {
            const elemento = document.getElementById("diasRacha");
            if (elemento) elemento.textContent = Number(racha) || 0;
        }

        function actualizarProgreso(progreso) {
            const porcentaje = document.getElementById("porcentajeGeneral");
            const barra = document.getElementById("barraProgreso");
            const valor = Math.max(0, Math.min(100, Number(progreso?.porcentaje) || 0));

            if (porcentaje) porcentaje.textContent = `${Math.round(valor)}%`;
            if (barra) barra.style.width = `${valor}%`;
        }

        function nombreCategoria(nombre) {
            const claves = {
                "Hidratación": "categorias.hidratacion",
                "Alimentación": "categorias.alimentacion",
                "Salud Mental": "categorias.saludMental",
                "Actividad Física": "categorias.actividadFisica",
                "Académico": "categorias.registroAcademico",
                "Hábito Personalizado": "categoriaPersonalizada"
            };

            return LS(claves[nombre] || nombre);
        }

        function actualizarCategorias(habitos) {
            if (!contenedorCategorias) return;

            contenedorCategorias.innerHTML = "";

            if (!Array.isArray(habitos) || habitos.length === 0) {
                const mensaje = document.createElement("p");
                mensaje.className = "categoria-vacia";
                mensaje.textContent = LS("noHabitosPendientes");
                contenedorCategorias.appendChild(mensaje);
                return;
            }

            const grupos = {};

            habitos.forEach(habito => {
                const nombre = habito.categoria || "Hábito Personalizado";

                if (!grupos[nombre]) {
                    grupos[nombre] = {
                        nombre,
                        total: 0,
                        completados: 0,
                        pendientes: 0,
                        ids: []
                    };
                }

                grupos[nombre].total++;
                grupos[nombre].ids.push(Number(habito.id_habito_usuario));

                if (habito.completado) {
                    grupos[nombre].completados++;
                } else {
                    grupos[nombre].pendientes++;
                }
            });

            Object.values(grupos).forEach(grupo => {
                const articulo = document.createElement("article");
                articulo.className = "categoria";

                const info = document.createElement("div");
                info.className = "categoria-info";

                const imagen = document.createElement("img");
                imagen.src = ICONOS[grupo.nombre] || "img/H-Perzona.png";
                imagen.alt = nombreCategoria(grupo.nombre);

                const texto = document.createElement("div");

                const titulo = document.createElement("h3");
                titulo.className = "nombre-categoria";
                titulo.textContent = nombreCategoria(grupo.nombre);

                const detalle = document.createElement("p");
                detalle.className = "detalle-categoria";
                detalle.textContent = `${grupo.completados}/${grupo.total} ${LS("habitosCompletados")}`;

                texto.append(titulo, detalle);
                info.append(imagen, texto);

                const circulo = document.createElement("div");
                circulo.className = "circulo";
                const porcentaje = grupo.total > 0
                    ? Math.round((grupo.completados / grupo.total) * 100)
                    : 0;
                circulo.textContent = `${porcentaje}%`;

                articulo.append(info, circulo);

                articulo.tabIndex = 0;
                articulo.setAttribute("role", "link");

                const ruta = RUTAS[grupo.nombre];
                if (ruta) {
                    const id = grupo.ids.length === 1 ? grupo.ids[0] : null;
                    const destino =
                        grupo.nombre === "Hábito Personalizado" && id
                            ? `${ruta}?id_habito_usuario=${id}`
                            : id
                                ? `${ruta}?id_habito_usuario=${id}`
                                : grupo.nombre === "Hábito Personalizado"
                                    ? "Personalizados.html"
                                    : ruta;

                    articulo.addEventListener("click", () => {
                        window.location.href = destino;
                    });

                    articulo.addEventListener("keydown", evento => {
                        if (evento.key === "Enter" || evento.key === " ") {
                            evento.preventDefault();
                            window.location.href = destino;
                        }
                    });
                }

                contenedorCategorias.appendChild(articulo);
            });
        }

        function mostrarErrorInicio(mensaje) {
            if (contenedorCategorias) {
                contenedorCategorias.innerHTML = "";
                const elemento = document.createElement("p");
                elemento.className = "categoria-vacia";
                elemento.textContent = mensaje || LS("noSePudieronCargarHabitos");
                contenedorCategorias.appendChild(elemento);
            }

            mostrarErrorNotificaciones(mensaje);
        }

        mostrarFechaActual();
        cargarDatosInicio();

        setInterval(cargarDatosInicio, 30000);

        window.addEventListener("lifesyncIdiomaCambiado", () => {
            mostrarFechaActual();
            cargarDatosInicio();
        });

        if (panelNotificaciones) {
            panelNotificaciones.addEventListener("transitionend", () => {
                if (!panelNotificaciones.classList.contains("oculto")) {
                    marcarNotificacionesLeidas();
                }
            });
        }
    });
})();
