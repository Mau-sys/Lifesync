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
        "Registro Académico": "img/R-Academ.png",
        "Académico": "img/R-Academ.png",
        "Hábito Personalizado": "img/H-Perzona.png"
    };

    const RUTAS = {
        "Hidratación": "Hhidratacion.html",
        "Alimentación": "HAlimentacion.html",
        "Salud Mental": "HSaludMental.html",
        "Actividad Física": "HActividadFisica.html",
        "Registro Académico": "HRegistroAcademico.html",
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
                "Registro Académico": "categorias.registroAcademico",
                "Académico": "categorias.registroAcademico",
                "Hábito Personalizado": "categoriaPersonalizada"
            };

            return LS(claves[nombre] || nombre);
        }

        function mostrarMensaje(texto) {
            if (mensaje) mensaje.textContent = texto || "";
        }

        function claseColor(nombre) {
            const clases = {
                "Hidratación": "hidratacion",
                "Alimentación": "alimentacion",
                "Salud Mental": "salud-mental",
                "Actividad Física": "actividad-fisica",
                "Registro Académico": "registro-academico",
                "Académico": "registro-academico",
                "Hábito Personalizado": "personalizada"
            };

            return clases[nombre] || "hidratacion";
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
                descripcion.textContent = habitos[0]?.nombre_habito || habitos[0]?.descripcion_base || "";
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
                destino = `${RUTAS[nombre]}?id_habito_usuario=${habitos[0].id_habito_usuario}`;
            }

            boton.href = destino;
            boton.textContent = LS("categorias.abrirCategoria");

            inferior.append(resumen, boton);
            articulo.append(superior, progreso, inferior);

            return articulo;
        }

        function crearTarjetaPersonalizada(habito) {
            const idHU = habito.id_habito_usuario;
            const objetivo = Number(habito.objetivo) || 1;
            const progresoVal = Number(habito.progreso_hoy) || Number(habito.progreso) || 0;
            const porcentajeCalculado = objetivo > 0 ? Math.min(100, Math.round((progresoVal / objetivo) * 100)) : 0;
            const completado = porcentajeCalculado >= 100;

            const articulo = document.createElement("article");
            articulo.className = "categoria";
            if (completado) {
                articulo.classList.add("completada");
            }

            const superior = document.createElement("div");
            superior.className = "categoria-superior";

            const contenedorIcono = document.createElement("div");
            contenedorIcono.className = "categoria-icono";

            const imagen = document.createElement("img");
            imagen.src = habito.imagen_url || habito.icono || "img/H-Perzona.png";
            imagen.alt = LS("categorias.iconoCategoria");
            contenedorIcono.appendChild(imagen);

            const info = document.createElement("div");
            info.className = "categoria-info";

            const titulo = document.createElement("h2");
            titulo.textContent = habito.nombre_habito || "Hábito Personalizado";

            const descripcion = document.createElement("p");
            descripcion.textContent = habito.descripcion || habito.nombre_habito || "";

            const estado = document.createElement("span");
            estado.className = "estado-categoria";
            estado.textContent = LS("categorias.estadoHabito");

            info.append(titulo, descripcion, estado);
            superior.append(contenedorIcono, info);

            const progreso = document.createElement("div");
            progreso.className = "categoria-progreso";

            const progresoInfo = document.createElement("div");
            progresoInfo.className = "progreso-info";

            const textoProgreso = document.createElement("span");
            textoProgreso.textContent = LS("categorias.progresoDiario");

            const porcentajeSpan = document.createElement("span");
            porcentajeSpan.className = "porcentaje";
            porcentajeSpan.textContent = `${porcentajeCalculado}%`;

            progresoInfo.append(textoProgreso, porcentajeSpan);

            const barraProgreso = document.createElement("div");
            barraProgreso.className = "barra-progreso";

            const barra = document.createElement("div");
            barra.className = "barra personalizada";
            barra.style.width = `${porcentajeCalculado}%`;

            barraProgreso.appendChild(barra);
            progreso.append(progresoInfo, barraProgreso);

            const inferior = document.createElement("div");
            inferior.className = "categoria-inferior";

            const resumen = document.createElement("div");
            resumen.className = "resumen";

            const registro = document.createElement("span");
            registro.textContent = LS("categorias.registro");

            const datos = document.createElement("span");
            datos.textContent = `${progresoVal}/${objetivo} ${habito.unidad || 'registros'}`;

            resumen.append(registro, datos);

            const boton = document.createElement("a");
            boton.className = "btn-categoria";
            boton.href = `HHabitoPersonalizado.html?id_habito_usuario=${idHU}`;
            boton.textContent = LS("categorias.abrirCategoria");

            inferior.append(resumen, boton);
            articulo.append(superior, progreso, inferior);

            return articulo;
        }

        function renderizarListaCategorias(categorias) {
            lista.innerHTML = "";

            const predeterminadas = categorias.filter(cat =>
                cat.nombre.trim().toLowerCase() !== "hábito personalizado"
            );
            const personalizada = categorias.find(cat =>
                cat.nombre.trim().toLowerCase() === "hábito personalizado"
            );

            predeterminadas.forEach(categoria => {
                lista.appendChild(crearTarjeta(categoria));
            });

            if (personalizada) {
                const hr = document.createElement("hr");
                hr.className = "divisor-seccion";
                lista.appendChild(hr);

                const habitos = Array.isArray(personalizada.habitos) ? personalizada.habitos : [];

                habitos.forEach(habito => {
                    lista.appendChild(crearTarjetaPersonalizada(habito));
                });

                const contenedorBtn = document.createElement("div");
                contenedorBtn.className = "contenedor-crear-personalizado";

                const btnCrear = document.createElement("a");
                btnCrear.href = "Personalizados.html";
                btnCrear.className = "btn-crear-habito";
                btnCrear.textContent = "+ Crear hábito";

                contenedorBtn.appendChild(btnCrear);
                lista.appendChild(contenedorBtn);
            }
        }

        async function cargarCategorias() {
            if (!lista) return;

            try {
                lista.innerHTML = "";
                mostrarMensaje("");

                // Ruta relativa directa saliendo de /public/ hacia /auth/
                const respuesta = await fetch("../auth/categorias.php", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                    headers: { "Accept": "application/json" }
                });

                if (!respuesta.ok) {
                    throw new Error(`Error ${respuesta.status}: No se encontró el recurso`);
                }

                const datos = await respuesta.json();

                if (!datos.exito) {
                    throw new Error(datos.mensaje || LS("noSePudieronCargarHabitos"));
                }

                const categorias = Array.isArray(datos.categorias)
                    ? datos.categorias
                    : [];

                if (categorias.length === 0) {
                    mostrarMensaje(LS("sinDatosCategorias"));
                    return;
                }

                renderizarListaCategorias(categorias);
            } catch (error) {
                console.error("Error al cargar categorías:", error);
                mostrarMensaje(error.message || LS("noSePudieronCargarHabitos"));
            }
        }

        cargarCategorias();
        window.addEventListener("lifesyncIdiomaCambiado", cargarCategorias);
    });
})();