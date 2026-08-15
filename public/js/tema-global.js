(function () {

    "use strict";


    const CLAVE_TEMA = "lifesync_tema";


    function obtenerTemaGuardado() {

        const tema =
            localStorage.getItem(CLAVE_TEMA);

        if (tema === "claro") {
            return "claro";
        }

        return "oscuro";
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

                logo.src = logoClaro;

            }


            if (
                tema === "oscuro" &&
                logoOscuro
            ) {

                logo.src = logoOscuro;

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


            actualizarLogos(temaValido);

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


    window.aplicarTemaGlobal =
        aplicarTema;


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
                temaInicial
            );

        }
    );


})();