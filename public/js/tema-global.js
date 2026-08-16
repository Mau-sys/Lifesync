(function () {

    "use strict";

    const CLAVE_TEMA = "lifesync_tema";
    const CLAVE_CONFIGURACION = "lifeSyncConfiguracion";


    function obtenerTemaGuardado() {

        let temaConfigurado = null;

        try {

            const configuracion =
                JSON.parse(
                    localStorage.getItem(
                        CLAVE_CONFIGURACION
                    )
                );

            if (
                configuracion &&
                typeof configuracion.modoOscuro === "boolean"
            ) {

                temaConfigurado =
                    configuracion.modoOscuro
                        ? "oscuro"
                        : "claro";

            }

        } catch (error) {

            temaConfigurado = null;

        }


        if (temaConfigurado) {

            return temaConfigurado;

        }


        const tema =
            localStorage.getItem(
                CLAVE_TEMA
            );

        return tema === "claro"
            ? "claro"
            : "oscuro";
    }


    function actualizarLogos(tema) {

        const logos =
            document.querySelectorAll(
                "img[data-logo-lifesync]"
            );

        logos.forEach(function (logo) {

            const logoClaro =
                logo.dataset.logoClaro;

            const logoOscuro =
                logo.dataset.logoOscuro;

            if (
                tema === "claro" &&
                logoClaro
            ) {

                logo.src =
                    logoClaro;

            }

            if (
                tema === "oscuro" &&
                logoOscuro
            ) {

                logo.src =
                    logoOscuro;

            }

        });

    }


    function aplicarTema(tema) {

        const temaValido =
            tema === "claro"
                ? "claro"
                : "oscuro";


        document.documentElement.setAttribute(
            "data-tema",
            temaValido
        );


        document.documentElement.classList.toggle(
            "tema-claro",
            temaValido === "claro"
        );


        document.documentElement.classList.toggle(
            "tema-oscuro",
            temaValido === "oscuro"
        );


        if (document.body) {

            document.body.setAttribute(
                "data-tema",
                temaValido
            );


            document.body.classList.toggle(
                "tema-claro",
                temaValido === "claro"
            );


            document.body.classList.toggle(
                "tema-oscuro",
                temaValido === "oscuro"
            );


            actualizarLogos(
                temaValido
            );

        }


        localStorage.setItem(
            CLAVE_TEMA,
            temaValido
        );


        window.dispatchEvent(
            new CustomEvent(
                "lifesyncTemaCambiado",
                {
                    detail: {
                        tema: temaValido
                    }
                }
            )
        );

    }


    function sincronizarConfiguracionTema(
        tema
    ) {

        let configuracion = {};

        try {

            configuracion =
                JSON.parse(
                    localStorage.getItem(
                        CLAVE_CONFIGURACION
                    )
                ) || {};

        } catch (error) {

            configuracion = {};

        }


        configuracion.modoOscuro =
            tema === "oscuro";


        localStorage.setItem(
            CLAVE_CONFIGURACION,
            JSON.stringify(configuracion)
        );

    }


    window.aplicarTemaGlobal =
        function (tema) {

            aplicarTema(
                tema
            );

            sincronizarConfiguracionTema(
                tema
            );

        };


    window.obtenerTemaGlobal =
        obtenerTemaGuardado;


    const temaInicial =
        obtenerTemaGuardado();


    document.documentElement.setAttribute(
        "data-tema",
        temaInicial
    );


    document.documentElement.classList.toggle(
        "tema-claro",
        temaInicial === "claro"
    );


    document.documentElement.classList.toggle(
        "tema-oscuro",
        temaInicial === "oscuro"
    );


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            aplicarTema(
                obtenerTemaGuardado()
            );

        }
    );


})();