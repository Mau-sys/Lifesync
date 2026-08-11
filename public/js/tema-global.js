(function () {

    const temaGuardado = localStorage.getItem("lifesync_tema");

    const tema =
        temaGuardado === "claro"
            ? "claro"
            : "oscuro";

    document.documentElement.setAttribute(
        "data-tema",
        tema
    );

    document.documentElement.classList.toggle(
        "tema-claro",
        tema === "claro"
    );

    document.documentElement.classList.toggle(
        "tema-oscuro",
        tema === "oscuro"
    );

    document.addEventListener("DOMContentLoaded", () => {

        document.body.setAttribute(
            "data-tema",
            tema
        );

        document.body.classList.toggle(
            "tema-claro",
            tema === "claro"
        );

        document.body.classList.toggle(
            "tema-oscuro",
            tema === "oscuro"
        );

        actualizarLogos(tema);

    });


    function actualizarLogos(modo) {

        const logos = document.querySelectorAll(
            'img[data-logo-lifesync]'
        );

        logos.forEach((logo) => {

            const logoClaro =
                logo.dataset.logoClaro;

            const logoOscuro =
                logo.dataset.logoOscuro;

            if (modo === "claro" && logoClaro) {

                logo.src = logoClaro;

            } else if (modo === "oscuro" && logoOscuro) {

                logo.src = logoOscuro;

            }

        });

    }

})();