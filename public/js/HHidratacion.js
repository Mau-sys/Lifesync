document.addEventListener("DOMContentLoaded", () => {

    const btnOptions =
        document.getElementById("btn-options-hidratacion");

    const kebabMenu =
        document.getElementById("kebab-menu-hidratacion");

    const btnRegresar =
        document.getElementById("btn-regresar");


    /*
     * MENÚ DE OPCIONES
     */
    if (btnOptions && kebabMenu) {

        btnOptions.addEventListener("click", (e) => {

            e.stopPropagation();

            kebabMenu.classList.toggle("show");

        });


        document.addEventListener("click", (e) => {

            if (
                !kebabMenu.contains(e.target) &&
                e.target !== btnOptions
            ) {

                kebabMenu.classList.remove("show");

            }

        });

    }


    /*
     * BOTÓN REGRESAR
     */
    if (btnRegresar) {

        btnRegresar.addEventListener("click", (e) => {

            e.preventDefault();

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

        });

    }


    /*
     * VARIABLES
     */
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


    /*
     * FECHA LOCAL
     *
     * No usamos toISOString()
     * porque puede cambiar el día
     * dependiendo de la zona horaria.
     */
    function obtenerFechaHoy() {

        const fecha =
            new Date();

        const anio =
            fecha.getFullYear();

        const mes =
            String(
                fecha.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                fecha.getDate()
            ).padStart(2, "0");


        return `${anio}-${mes}-${dia}`;

    }


    /*
     * REINICIO DIARIO
     */
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

            vasosTomados = 0;

            localStorage.setItem(
                "ls_hidratacion_fecha",
                hoy
            );


            localStorage.setItem(
                "ls_hidratacion_vasos",
                "0"
            );

        }

    }


    /*
     * CARGAR DATOS
     */
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
                    Number(
                        config.vasosTotales
                    ) || 8;


                capacidadVaso =
                    Number(
                        config.capacidadVaso
                    ) || 250;

            } catch (error) {

                console.error(
                    "Error al leer la configuración de hidratación:",
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
                    vasosGuardados,
                    10
                ) || 0;

        }


        /*
         * Evita que un valor guardado
         * sea mayor que la nueva meta.
         */
        vasosTomados =
            Math.min(
                vasosTomados,
                vasosTotales
            );


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


    /*
     * GUARDAR DATOS
     */
    function guardarDatos() {

        localStorage.setItem(
            "ls_hidratacion_vasos",
            String(vasosTomados)
        );


        localStorage.setItem(
            "ls_hidratacion_fecha",
            obtenerFechaHoy()
        );


        localStorage.setItem(
            "ls_hidratacion_config",
            JSON.stringify({

                vasosTotales:
                    vasosTotales,

                capacidadVaso:
                    capacidadVaso

            })
        );

    }


    /*
     * ICONOS DE VASOS
     */
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
                document.createElement("i");


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


    /*
     * ACTUALIZAR INTERFAZ
     */
    function actualizarInterfaz() {

        verificarReinicioDiario();


        if (contadorElement) {

            contadorElement.textContent =
                `${vasosTomados}/${vasosTotales}`;

        }


        if (metaElement) {

            const litrosTotales =
                (
                    vasosTotales *
                    capacidadVaso
                ) / 1000;


            metaElement.textContent =
                `${vasosTotales} vasos al día (${litrosTotales.toFixed(1)}L - ${capacidadVaso}ml/vaso)`;

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
                    var(--ls-cyan) ${porcentaje}%,
                    rgba(6, 182, 212, 0.15) ${porcentaje}%
                )`;

        }


        if (btnAddVaso) {

            if (
                vasosTomados >=
                vasosTotales
            ) {

                btnAddVaso.textContent =
                    "¡Meta alcanzada!";

                btnAddVaso.disabled =
                    true;

                btnAddVaso.classList.add(
                    "opacity-75"
                );

            } else {

                btnAddVaso.textContent =
                    "+1 vaso";

                btnAddVaso.disabled =
                    false;

                btnAddVaso.classList.remove(
                    "opacity-75"
                );

            }

        }


        renderizarVasos();

    }


    /*
     * PREVISUALIZACIÓN DEL MODAL
     */
    function actualizarPreviewModal() {

        if (
            !inputVasos ||
            !inputCapacidad ||
            !previewMetaTotal
        ) {

            return;

        }


        const vasos =
            parseInt(
                inputVasos.value,
                10
            ) || 0;


        const capacidad =
            parseInt(
                inputCapacidad.value,
                10
            ) || 0;


        const totalLitros =
            (
                vasos *
                capacidad
            ) / 1000;


        previewMetaTotal.textContent =
            `${totalLitros.toFixed(1)} Litros / día`;

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


    /*
     * AGREGAR VASO
     */
    if (btnAddVaso) {

        btnAddVaso.addEventListener(
            "click",
            () => {

                verificarReinicioDiario();


                if (
                    vasosTomados >=
                    vasosTotales
                ) {

                    actualizarInterfaz();

                    return;

                }


                vasosTomados++;


                guardarDatos();

                actualizarInterfaz();

            }
        );

    }


    /*
     * REINICIAR
     */
    if (btnReiniciar) {

        btnReiniciar.addEventListener(
            "click",
            () => {

                const confirmar =
                    confirm(
                        "¿Quieres reiniciar la cuenta a 0?"
                    );


                if (!confirmar) {
                    return;
                }


                vasosTomados = 0;

                guardarDatos();

                actualizarInterfaz();


                const modalElement =
                    document.getElementById(
                        "modalEditarHidratacion"
                    );


                if (
                    modalElement &&
                    typeof bootstrap !==
                        "undefined"
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
     * GUARDAR CONFIGURACIÓN
     */
    if (btnGuardar) {

        btnGuardar.addEventListener(
            "click",
            () => {

                if (
                    !inputVasos ||
                    !inputCapacidad
                ) {

                    return;

                }


                const nuevosVasos =
                    parseInt(
                        inputVasos.value,
                        10
                    );


                const nuevaCapacidad =
                    parseInt(
                        inputCapacidad.value,
                        10
                    );


                if (
                    Number.isNaN(
                        nuevosVasos
                    ) ||
                    nuevosVasos < 1 ||
                    nuevosVasos > 30
                ) {

                    alert(
                        "Por favor ingresa una cantidad de vasos válida (1 a 30)."
                    );

                    return;

                }


                if (
                    Number.isNaN(
                        nuevaCapacidad
                    ) ||
                    nuevaCapacidad < 100 ||
                    nuevaCapacidad > 1000
                ) {

                    alert(
                        "Por favor ingresa una capacidad de vaso válida (100 a 1000 ml)."
                    );

                    return;

                }


                vasosTotales =
                    nuevosVasos;


                capacidadVaso =
                    nuevaCapacidad;


                /*
                 * Si la nueva meta es menor
                 * que lo tomado, ajustamos.
                 */
                vasosTomados =
                    Math.min(
                        vasosTomados,
                        vasosTotales
                    );


                guardarDatos();

                actualizarInterfaz();


                const modalElement =
                    document.getElementById(
                        "modalEditarHidratacion"
                    );


                if (
                    modalElement &&
                    typeof bootstrap !==
                        "undefined"
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


    cargarDatos();

    actualizarInterfaz();

});