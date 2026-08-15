(function () {

    const CLAVE_TEMA = "lifesync_tema";

    function obtenerTemaGuardado() {

        const tema = localStorage.getItem(CLAVE_TEMA);

        if (tema === "claro") {
            return "claro";
        }

        return "oscuro";
    }


    function actualizarLogos(tema) {

        const logos = document.querySelectorAll(
            "img[data-logo-lifesync]"
        );

        logos.forEach(function (logo) {

            const logoClaro = logo.dataset.logoClaro;
            const logoOscuro = logo.dataset.logoOscuro;

            if (tema === "claro" && logoClaro) {

                logo.src = logoClaro;

            } else if (tema === "oscuro" && logoOscuro) {

                logo.src = logoOscuro;

            }

        });
    }


    function aplicarTema(tema, guardar = true) {

        const temaValido =
            tema === "claro"
                ? "claro"
                : "oscuro";


        document.documentElement.setAttribute(
            "data-tema",
            temaValido
        );


        document.documentElement.classList.remove(
            "tema-claro",
            "tema-oscuro"
        );


        document.documentElement.classList.add(
            "tema-" + temaValido
        );


        if (document.body) {

            document.body.setAttribute(
                "data-tema",
                temaValido
            );


            document.body.classList.remove(
                "tema-claro",
                "tema-oscuro"
            );


            document.body.classList.add(
                "tema-" + temaValido
            );


            actualizarLogos(temaValido);
        }


        if (guardar) {

            localStorage.setItem(
                CLAVE_TEMA,
                temaValido
            );
        }
    }


    function alternarTema() {

        const temaActual =
            document.documentElement.getAttribute(
                "data-tema"
            );


        const nuevoTema =
            temaActual === "oscuro"
                ? "claro"
                : "oscuro";


        aplicarTema(nuevoTema);
    }


    window.aplicarTemaGlobal = aplicarTema;

    window.alternarTemaGlobal = alternarTema;


    const temaInicial =
        obtenerTemaGuardado();


    /*
     * IMPORTANTE:
     * Se aplica inmediatamente al <html>,
     * antes de que cargue toda la página.
     */
    aplicarTema(
        temaInicial,
        false
    );


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            aplicarTema(
                obtenerTemaGuardado(),
                false
            );

        }
    );


})();