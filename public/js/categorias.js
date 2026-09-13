(function () {
    "use strict";

    const LS = texto =>
        typeof window.traducirLifeSync === "function"
            ? window.traducirLifeSync(texto)
            : texto;

    const ICONOS = {
        "Hidratación": "img/Hidrat.png",
        "Alimentación": "img/Alimen.png",
        "Salud Mental": "img/S-Mental.png",
        "Actividad Física": "img/A-Fisica.png",
        "Académico": "img/R-Academ.png",
        "Hábito Personalizado": "img/H-Perzona.png"
    };

    const RUTAS = {
        "Hidratación": "Hhidratacion.html",
        "Alimentación": "HAlimentacion.html",
        "Salud Mental": "HSaludMental.html",
        "Actividad Física": "HActividadFisica.html",
        "Académico": "HRegistroAcademico.html",
        "Hábito Personalizado": "HHabitoPersonalizado.html"
    };

    document.addEventListener("DOMContentLoaded", () => {
        const lista = document.getElementById("listaCategorias");
        const mensaje = document.getElementById("mensajeCategorias");

        function traducirCategoria(nombre) {
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

        function mostrarMensaje(texto) {
            if (mensaje) mensaje.textContent = texto || "";
        }

        function crearTarjeta(categoria) {
            const nombre = categoria.nombre;
            const habitos = Array.isArray(categoria.habitos) ? categoria.habitos : [];
            const activo = habitos.length > 0;

            const articulo = document.createElement("article");
            articulo.className = "categoria";

            if (!activo) {
                articulo.classList.add("desactivada");
            }

            if (categoria.progreso >= 100) {
                articulo.classList.add("completada");
            }

            const superior = document.createElement("div");
            superior.className = "categoria-superior";

            const contenedorIcono = document.createElement("div");
            contenedorIcono.className = "categoria-icono";

            const imagen = document.createElement("img");
            imagen.src = ICONOS[nombre] || "img/H-Perzona.png";
            imagen.alt = LS("categorias.iconoCategoria");
            contenedorIcono.appendChild(imagen);

            const info = document.createElement("div");
            info.className = "categoria-info";

            const titulo = document.createElement("h2");
            titulo.textContent = traducirCategoria(nombre);

            const descripcion = document.createElement("p");
            if (activo) {
                if (habitos.length === 1) {
                    descripcion.textContent =
                        habitos[0].descripcion ||
                        `${habitos[0].objetivo} ${habitos[0].unidad}`;
                } else {
                    descripcion.textContent =
                        `${habitos.length} ${LS("habitosCompletados").toLowerCase()}`;
                }
            } else {
                descripcion.textContent = LS("categorias.objetivoEjemplo");
            }

            const estado = document.createElement("span");
            estado.className = "estado-categoria";
            estado.textContent = activo
                ? LS("categorias.estadoHabito")
                : LS("sinInformacionDisponible");

            info.append(titulo, descripcion, estado);
            superior.append(contenedorIcono, info);

            const progreso = document.createElement("div");
            progreso.className = "categoria-progreso";

            const progresoInfo = document.createElement("div");
            progresoInfo.className = "progreso-info";

            const textoProgreso = document.createElement("span");
            textoProgreso.textContent = LS("categorias.progresoDiario");

            const porcentaje = document.createElement("span");
            porcentaje.className = "porcentaje";
            porcentaje.textContent = `${Math.round(Number(categoria.progreso) || 0)}%`;

            progresoInfo.append(textoProgreso, porcentaje);

            const barraProgreso = document.createElement("div");
            barraProgreso.className = "barra-progreso";

            const barra = document.createElement("div");
            barra.className = `barra ${claseColor(nombre)}`;
            barra.style.width = `${Math.min(100, Math.max(0, Number(categoria.progreso) || 0))}%`;

            barraProgreso.appendChild(barra);
            progreso.append(progresoInfo, barraProgreso);

            const inferior = document.createElement("div");
            inferior.className = "categoria-inferior";

            const resumen = document.createElement("div");
            resumen.className = "resumen";

            const registro = document.createElement("span");
            registro.textContent = LS("categorias.registro");

            const datos = document.createElement("span");
            if (activo) {
                datos.textContent = `${categoria.completados_hoy}/${categoria.total_habitos} ${LS("habitosCompletados")}`;
            } else {
                datos.textContent = LS("noTienesHabitosPendientes");
            }

            resumen.append(registro, datos);

            const boton = document.createElement("a");
            boton.className = "btn-categoria";

            let destino = "preferencias.html";
            if (activo) {
                if (nombre === "Hábito Personalizado") {
                    destino = habitos.length === 1
                        ? `${RUTAS[nombre]}?id_habito_usuario=${habitos[0].id_habito_usuario}`
                        : "Personalizados.html";
                } else {
                    destino = `${RUTAS[nombre]}?id_habito_usuario=${habitos[0].id_habito_usuario}`;
                }
            }

            boton.href = destino;
            boton.textContent = LS("categorias.abrirCategoria");

            inferior.append(resumen, boton);
            articulo.append(superior, progreso, inferior);

            return articulo;
        }

        function claseColor(nombre) {
            const clases = {
                "Hidratación": "hidratacion",
                "Alimentación": "alimentacion",
                "Salud Mental": "salud-mental",
                "Actividad Física": "actividad-fisica",
                "Académico": "registro-academico",
                "Hábito Personalizado": "personalizada"
            };

            return clases[nombre] || "hidratacion";
        }

        async function cargarCategorias() {
            if (!lista) return;

            try {
                lista.innerHTML = "";
                mostrarMensaje("");

                const respuesta = await fetch("../auth/categorias.php", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                    headers: { "Accept": "application/json" }
                });

                const datos = await respuesta.json();

                if (!respuesta.ok || !datos.exito) {
                    throw new Error(datos.mensaje || LS("noSePudieronCargarHabitos"));
                }

                const categorias = Array.isArray(datos.categorias)
                    ? datos.categorias
                    : [];

                if (categorias.length === 0) {
                    mostrarMensaje(LS("sinDatosCategorias"));
                    return;
                }

                categorias.forEach(categoria => {
                    lista.appendChild(crearTarjeta(categoria));
                });
            } catch (error) {
                console.error("Error al cargar categorías:", error);
                mostrarMensaje(error.message || LS("noSePudieronCargarHabitos"));
            }
        }

        cargarCategorias();
        window.addEventListener("lifesyncIdiomaCambiado", cargarCategorias);
    });
})();
