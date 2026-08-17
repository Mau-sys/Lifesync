/* =========================================================
   HIDRATACIÓN — LifeSync
   ========================================================= */

(function () {

    "use strict";


    function LS(texto) {

        if (
            typeof window !== "undefined" &&
            typeof window.traducirLifeSync === "function"
        ) {
            return window.traducirLifeSync(texto);
        }

        return texto;
    }


    const btnOptions =
        document.getElementById(
            "btn-options-hidratacion"
        );

    const kebabMenu =
        document.getElementById(
            "kebab-menu-hidratacion"
        );

    const btnRegresar =
        document.getElementById(
            "btn-regresar"
        );


    if (
        btnOptions &&
        kebabMenu
    ) {

        btnOptions.addEventListener(
            "click",
            (e) => {

                e.stopPropagation();

                kebabMenu.classList.toggle(
                    "show"
                );

            }
        );


        document.addEventListener(
            "click",
            (e) => {

                if (
                    !kebabMenu.contains(
                        e.target
                    )
                ) {

                    kebabMenu.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    if (btnRegresar) {

        btnRegresar.addEventListener(
            "click",
            () => {

                const paginaAnterior =
                    document.referrer;

                const mismoDominio =
                    paginaAnterior &&
                    paginaAnterior.includes(
                        window.location.host
                    );


                if (mismoDominio) {

                    window.history.back();

                } else {

                    window.location.href =
                        "inicio.html";

                }

            }
        );

    }


    let vasosTomados = 0;

    let vasosTotales = 8;

    let capacidadVaso = 250;


    const ringElement =
        document.getElementById(
            "ring-hidratacion"
        );

    const contadorElement =
        document.getElementById(
            "contador-vasos"
        );

    const metaElement =
        document.getElementById(
            "meta-vasos"
        );

    const btnAddVaso =
        document.getElementById(
            "btn-add-vaso"
        );

    const contenedorVasos =
        document.getElementById(
            "contenedor-vasos-iconos"
        );


    const btnGuardar =
        document.getElementById(
            "btn-guardar-config"
        );

    const btnReiniciar =
        document.getElementById(
            "btn-reiniciar-meta"
        );

    const inputVasos =
        document.getElementById(
            "input-vasos"
        );

    const inputCapacidad =
        document.getElementById(
            "input-capacidad"
        );

    const previewMetaTotal =
        document.getElementById(
            "preview-meta-total"
        );


    function obtenerFechaHoy() {

        const fecha =
            new Date();

        const anio =
            fecha.getFullYear();

        const mes =
            String(
                fecha.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const dia =
            String(
                fecha.getDate()
            ).padStart(
                2,
                "0"
            );

        return `${anio}-${mes}-${dia}`;

    }


    function verificarReinicioDiario() {

        const hoy =
            obtenerFechaHoy();

        const ultimaFecha =
            localStorage.getItem(
                "ls_hidratacion_fecha"
            );


        if (
            ultimaFecha !== hoy
        ) {

            vasosTomados =
                0;


            localStorage.setItem(
                "ls_hidratacion_fecha",
                hoy
            );


            guardarDatos();

        }

    }


    function cargarDatos() {

        const configuracionGuardada =
            localStorage.getItem(
                "ls_hidratacion_config"
            );


        if (configuracionGuardada) {

            try {

                const config =
                    JSON.parse(
                        configuracionGuardada
                    );


                vasosTotales =
                    config.vasosTotales ||
                    8;


                capacidadVaso =
                    config.capacidadVaso ||
                    250;

            } catch (error) {

                console.error(
                    "Error al cargar la configuración de hidratación:",
                    error
                );

            }

        }


        verificarReinicioDiario();


        const vasosGuardados =
            localStorage.getItem(
                "ls_hidratacion_vasos"
            );


        if (
            vasosGuardados !== null
        ) {

            vasosTomados =
                parseInt(
                    vasosGuardados
                ) || 0;

        }


        if (inputVasos) {

            inputVasos.value =
                vasosTotales;

        }


        if (inputCapacidad) {

            inputCapacidad.value =
                capacidadVaso;

        }


        actualizarPreviewModal();

    }


    function guardarDatos() {

        localStorage.setItem(
            "ls_hidratacion_vasos",
            vasosTomados
        );


        localStorage.setItem(
            "ls_hidratacion_config",

            JSON.stringify({
                vasosTotales,
                capacidadVaso
            })
        );

    }


    function renderizarVasos() {

        if (!contenedorVasos) {
            return;
        }


        contenedorVasos.innerHTML =
            "";


        for (
            let i = 0;
            i < vasosTotales;
            i++
        ) {

            const vasoIcono =
                document.createElement(
                    "i"
                );


            vasoIcono.className =
                "fa-solid fa-glass-water";


            if (
                i < vasosTomados
            ) {

                vasoIcono.classList.add(
                    "text-cyan"
                );

            } else {

                vasoIcono.classList.add(
                    "text-muted-glass"
                );

            }


            contenedorVasos.appendChild(
                vasoIcono
            );

        }

    }


    function actualizarInterfaz() {

        verificarReinicioDiario();


        if (contadorElement) {

            contadorElement.textContent =
                `${vasosTomados}/${vasosTotales}`;

        }


        if (metaElement) {

            const litrosTotales =
                (
                    (
                        vasosTotales *
                        capacidadVaso
                    ) /
                    1000
                ).toFixed(1);


            metaElement.textContent =
                `${vasosTotales} ${
                    LS("vasosAlDia")
                } (${litrosTotales}L - ${
                    capacidadVaso
                }ml/${
                    LS("vaso")
                })`;

        }


        if (ringElement) {

            const porcentaje =
                vasosTotales > 0
                    ? Math.min(
                        (
                            vasosTomados /
                            vasosTotales
                        ) * 100,
                        100
                    )
                    : 0;


            ringElement.style.background =
                `conic-gradient(
                    var(--ls-cyan)
                    ${porcentaje}%,
                    rgba(6, 182, 212, 0.15)
                    ${porcentaje}%
                )`;

        }


        if (btnAddVaso) {

            if (
                vasosTomados >=
                vasosTotales
            ) {

                btnAddVaso.textContent =
                    LS(
                        LS("metaAlcanzada")
                    );


                btnAddVaso.classList.add(
                    "opacity-75"
                );

            } else {

                btnAddVaso.textContent =
                    LS("sumarVaso");


                btnAddVaso.classList.remove(
                    "opacity-75"
                );

            }

        }


        renderizarVasos();

    }


    function actualizarPreviewModal() {

        if (
            !inputVasos ||
            !inputCapacidad ||
            !previewMetaTotal
        ) {

            return;

        }


        const v =
            parseInt(
                inputVasos.value
            ) || 0;


        const c =
            parseInt(
                inputCapacidad.value
            ) || 0;


        const totalLitros =
            (
                (v * c) /
                1000
            ).toFixed(1);


        previewMetaTotal.textContent =
            `${totalLitros} ${
                LS("litrosDia")
            }`;

    }


    if (inputVasos) {

        inputVasos.addEventListener(
            "input",
            actualizarPreviewModal
        );

    }


    if (inputCapacidad) {

        inputCapacidad.addEventListener(
            "input",
            actualizarPreviewModal
        );

    }


    if (btnAddVaso) {

        btnAddVaso.addEventListener(
            "click",
            () => {

                verificarReinicioDiario();


                if (
                    vasosTomados <
                    vasosTotales
                ) {

                    vasosTomados++;

                }


                guardarDatos();

                actualizarInterfaz();

            }
        );

    }


    if (btnReiniciar) {

        btnReiniciar.addEventListener(
            "click",
            () => {

                if (
                    confirm(
                        LS(
                            LS("confirmarReinicioHidratacion")
                        )
                    )
                ) {

                    vasosTomados =
                        0;


                    guardarDatos();

                    actualizarInterfaz();


                    const modalElement =
                        document.getElementById(
                            "modalEditarHidratacion"
                        );


                    if (
                        typeof bootstrap !==
                        "undefined" &&
                        modalElement
                    ) {

                        const modalInstance =
                            bootstrap.Modal.getInstance(
                                modalElement
                            );


                        if (modalInstance) {

                            modalInstance.hide();

                        }

                    }


                    if (kebabMenu) {

                        kebabMenu.classList.remove(
                            "show"
                        );

                    }

                }

            }
        );

    }


    if (btnGuardar) {

        btnGuardar.addEventListener(
            "click",
            () => {

                const nuevosVasos =
                    parseInt(
                        inputVasos.value
                    );


                const nuevaCapacidad =
                    parseInt(
                        inputCapacidad.value
                    );


                if (
                    isNaN(nuevosVasos) ||
                    nuevosVasos < 1 ||
                    nuevosVasos > 30
                ) {

                    alert(
                        LS(
                            "Por favor ingresa una cantidad de vasos válida (1 a 30)."
                        )
                    );

                    return;

                }


                if (
                    isNaN(nuevaCapacidad) ||
                    nuevaCapacidad < 100 ||
                    nuevaCapacidad > 1000
                ) {

                    alert(
                        LS(
                            LS("capacidadVasoValida")
                        )
                    );

                    return;

                }


                vasosTotales =
                    nuevosVasos;


                capacidadVaso =
                    nuevaCapacidad;


                /*
                 * Si se reduce la meta,
                 * evitamos que el contador quede
                 * por encima de ella.
                 */
                if (
                    vasosTomados >
                    vasosTotales
                ) {

                    vasosTomados =
                        vasosTotales;

                }


                guardarDatos();

                actualizarInterfaz();


                const modalElement =
                    document.getElementById(
                        "modalEditarHidratacion"
                    );


                if (
                    typeof bootstrap !==
                    "undefined" &&
                    modalElement
                ) {

                    const modalInstance =
                        bootstrap.Modal.getInstance(
                            modalElement
                        );


                    if (modalInstance) {

                        modalInstance.hide();

                    }

                }


                if (kebabMenu) {

                    kebabMenu.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    /*
     * Cuando cambia el idioma,
     * actualizamos todos los textos dinámicos.
     */
    window.addEventListener(
        "lifesyncIdiomaCambiado",
        () => {

            actualizarPreviewModal();

            actualizarInterfaz();

        }
    );


    cargarDatos();

    actualizarInterfaz();


    window.addEventListener("lifesyncIdiomaCambiado", actualizarInterfaz);

})();