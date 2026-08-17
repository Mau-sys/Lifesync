document.addEventListener(
    "DOMContentLoaded",
    () => {

        const listaCategorias =
            document.getElementById(
                "listaCategorias"
            );

        const mensajeCategorias =
            document.getElementById(
                "mensajeCategorias"
            );


        /*
        =====================================================
        CONFIGURACIÓN DE CATEGORÍAS
        =====================================================
        */

        const configuracion = {

            "Hidratación": {
                icono: "img/Hidrat.png",
                enlace: "Hhidratacion.html",
                clase: "hidratacion"
            },

            "Alimentación": {
                icono: "img/Alimentacion.png",
                enlace: "Halimentacion.html",
                clase: "alimentacion"
            },

            "Salud Mental": {
                icono: "img/SaludMental.png",
                enlace: "HsaludMental.html",
                clase: "salud-mental"
            },

            "Actividad Física": {
                icono: "img/ActividadFisica.png",
                enlace: "HactividadFisica.html",
                clase: "actividad-fisica"
            },

            "Registro Académico": {
                icono: "img/Academico.png",
                enlace: "HregistroAcademico.html",
                clase: "academico"
            },

            "Hábito Personalizado": {
                icono: "img/H-Perzona.png",
                enlace: "Personalizados.html",
                clase: "personalizado"
            }

        };


        /*
        =====================================================
        TRADUCCIÓN
        =====================================================
        */

        function traducir(
            clave,
            textoPredeterminado
        ) {

            if (
                typeof window
                    .traducirLifeSync ===
                "function"
            ) {

                const resultado =
                    window.traducirLifeSync(
                        clave
                    );


                if (
                    resultado &&
                    resultado !== clave
                ) {

                    return resultado;

                }

            }


            return textoPredeterminado;

        }


        /*
        =====================================================
        ESCAPAR HTML
        =====================================================
        */

        function escaparHTML(
            texto
        ) {

            const elemento =
                document.createElement(
                    "div"
                );

            elemento.textContent =
                texto ?? "";

            return elemento.innerHTML;

        }


        /*
        =====================================================
        CREAR TARJETA
        =====================================================
        */

        function crearTarjeta(
            categoria
        ) {

            const nombre =
                categoria.nombre_categoria;


            const config =
                configuracion[nombre];


            if (!config) {

                return null;

            }


            const articulo =
                document.createElement(
                    "article"
                );


            articulo.className =
                "categoria";


            articulo.dataset.color =
                config.clase;


            /*
            ---------------------------------------------
            PARTE SUPERIOR
            ---------------------------------------------
            */

            const superior =
                document.createElement(
                    "div"
                );


            superior.className =
                "categoria-superior";


            const contenedorIcono =
                document.createElement(
                    "div"
                );


            contenedorIcono.className =
                "categoria-icono";


            const imagen =
                document.createElement(
                    "img"
                );


            imagen.src =
                config.icono;


            imagen.alt =
                nombre;


            contenedorIcono.appendChild(
                imagen
            );


            const informacion =
                document.createElement(
                    "div"
                );


            informacion.className =
                "categoria-info";


            const titulo =
                document.createElement(
                    "h2"
                );


            titulo.textContent =
                nombre;


            const descripcion =
                document.createElement(
                    "p"
                );


            descripcion.textContent =
                categoria.descripcion ||
                "Administra tus hábitos de esta categoría.";


            const estado =
                document.createElement(
                    "span"
                );


            estado.className =
                "estado-categoria";


            if (
                categoria.seleccionada
            ) {

                estado.textContent =
                    "Categoría activa";

            } else {

                estado.textContent =
                    "Disponible";

            }


            informacion.appendChild(
                titulo
            );

            informacion.appendChild(
                descripcion
            );

            informacion.appendChild(
                estado
            );


            superior.appendChild(
                contenedorIcono
            );

            superior.appendChild(
                informacion
            );


            /*
            ---------------------------------------------
            PROGRESO
            ---------------------------------------------
            */

            const progreso =
                document.createElement(
                    "div"
                );


            progreso.className =
                "categoria-progreso";


            const progresoInfo =
                document.createElement(
                    "div"
                );


            progresoInfo.className =
                "progreso-info";


            const textoProgreso =
                document.createElement(
                    "span"
                );


            textoProgreso.textContent =
                "Progreso diario";


            const porcentaje =
                document.createElement(
                    "span"
                );


            porcentaje.className =
                "porcentaje";


            porcentaje.textContent =
                Math.round(
                    Number(
                        categoria.porcentaje
                    ) || 0
                ) + "%";


            progresoInfo.appendChild(
                textoProgreso
            );

            progresoInfo.appendChild(
                porcentaje
            );


            const barraProgreso =
                document.createElement(
                    "div"
                );


            barraProgreso.className =
                "barra-progreso";


            const barra =
                document.createElement(
                    "div"
                );


            barra.className =
                "barra " +
                config.clase;


            barra.style.width =
                (
                    Number(
                        categoria.porcentaje
                    ) || 0
                ) + "%";


            barraProgreso.appendChild(
                barra
            );


            progreso.appendChild(
                progresoInfo
            );

            progreso.appendChild(
                barraProgreso
            );


            /*
            ---------------------------------------------
            PARTE INFERIOR
            ---------------------------------------------
            */

            const inferior =
                document.createElement(
                    "div"
                );


            inferior.className =
                "categoria-inferior";


            const resumen =
                document.createElement(
                    "div"
                );


            resumen.className =
                "resumen";


            const registro =
                document.createElement(
                    "span"
                );


            registro.textContent =
                "Registro";


            const datos =
                document.createElement(
                    "span"
                );


            const total =
                Number(
                    categoria.total_habitos
                ) || 0;


            const completados =
                Number(
                    categoria.completados_hoy
                ) || 0;


            if (total > 0) {

                datos.textContent =
                    `${completados}/${total} hábitos completados hoy`;

            } else {

                datos.textContent =
                    "Todavía no tienes hábitos en esta categoría.";

            }


            resumen.appendChild(
                registro
            );

            resumen.appendChild(
                datos
            );


            const boton =
                document.createElement(
                    "a"
                );


            boton.href =
                config.enlace;


            boton.className =
                "btn-categoria";


            boton.textContent =
                "Abrir categoría";


            inferior.appendChild(
                resumen
            );

            inferior.appendChild(
                boton
            );


            /*
            ---------------------------------------------
            ARMAR TARJETA
            ---------------------------------------------
            */

            articulo.appendChild(
                superior
            );

            articulo.appendChild(
                progreso
            );

            articulo.appendChild(
                inferior
            );


            return articulo;

        }


        /*
        =====================================================
        CARGAR CATEGORÍAS
        =====================================================
        */

        async function cargarCategorias() {

            try {

                listaCategorias.innerHTML =
                    "";


                if (
                    mensajeCategorias
                ) {

                    mensajeCategorias.textContent =
                        "";

                }


                const respuesta =
                    await fetch(
                        "auth/categorias.php",
                        {
                            method: "GET",

                            credentials:
                                "same-origin",

                            cache:
                                "no-store",

                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                const datos =
                    await respuesta.json();


                if (
                    !respuesta.ok ||
                    !datos.exito
                ) {

                    throw new Error(
                        datos.mensaje ||
                        "No se pudieron cargar las categorías."
                    );

                }


                const categorias =
                    datos.categorias || [];


                if (
                    categorias.length === 0
                ) {

                    mostrarMensaje(
                        "No hay categorías disponibles."
                    );

                    return;

                }


                categorias.forEach(
                    (categoria) => {

                        const tarjeta =
                            crearTarjeta(
                                categoria
                            );


                        if (tarjeta) {

                            listaCategorias.appendChild(
                                tarjeta
                            );

                        }

                    }
                );


            } catch (error) {

                console.error(
                    "Error al cargar categorías:",
                    error
                );


                mostrarMensaje(
                    error.message ||
                    "No se pudieron cargar las categorías."
                );

            }

        }


        function mostrarMensaje(
            mensaje
        ) {

            if (
                !mensajeCategorias
            ) {

                return;

            }


            mensajeCategorias.textContent =
                mensaje;

        }


        cargarCategorias();


        /*
        Si cambia el idioma,
        volvemos a cargar la información.
        */

        window.addEventListener(
            "lifesyncIdiomaCambiado",
            cargarCategorias
        );

    }
);