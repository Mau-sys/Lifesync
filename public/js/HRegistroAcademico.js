(function () {
    "use strict";

    const LS = t =>
        typeof window.traducirLifeSync === "function"
            ? window.traducirLifeSync(t)
            : t;

    const API = "../auth/";
    const CATEGORIA = "Académico";

    let id = Number(
        new URLSearchParams(location.search).get("id_habito_usuario")
    ) || 0;

    let objetivo = 3;
    let progreso = 0;

    const $ = id => document.getElementById(id);

    const menu = $("kebab-menu-academico");
    const ring = $("ring-academico");
    const contador = $("contador-academico");
    const meta = $("meta-academico");
    const lista = $("lista-registros");
    const btn = $("btn-add-registro");

    const btnOptions = $("btn-options-academico");
    const btnRegresar = $("btn-regresar");
    const btnEditarMeta = $("btn-editar-meta");
    const btnGuardarConfig = $("btn-guardar-config");
    const btnReiniciarMeta = $("btn-reiniciar-meta");
    const inputRegistros = $("input-registros");

    const modalEditar = $("modalEditarAcademico");

    btnOptions?.addEventListener("click", e => {
        e.stopPropagation();
        menu?.classList.toggle("show");
    });

    document.addEventListener("click", e => {
        if (menu && !menu.contains(e.target)) {
            menu.classList.remove("show");
        }
    });

    btnRegresar?.addEventListener("click", e => {
        e.preventDefault();

        if (history.length > 1) {
            history.back();
        } else {
            location.href = "inicio.html";
        }
    });

    async function cargar() {
        const query = id
            ? `?id_habito_usuario=${id}`
            : `?categoria=${encodeURIComponent(CATEGORIA)}`;

        const respuesta = await fetch(
            `${API}obtener-habito.php${query}`,
            {
                credentials: "include",
                cache: "no-store"
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito || !datos.habito) {
            throw new Error(
                datos.mensaje || LS("No se pudieron cargar los datos.")
            );
        }

        id = Number(datos.habito.id_habito_usuario);

        objetivo = Number(datos.habito.objetivo) || 3;
        progreso = Number(datos.habito.progreso_hoy) || 0;

        if (progreso > objetivo) {
            progreso = objetivo;
        }
    }

    function render() {
        if (!contador || !meta || !ring || !lista || !btn) {
            return;
        }

        contador.textContent = `${progreso}/${objetivo}`;

        meta.textContent =
            `${objetivo} ${objetivo === 1
                ? LS("registroAcademico")
                : LS("registrosAcademicos")}`;

        const porcentaje = objetivo > 0
            ? Math.min(100, (progreso / objetivo) * 100)
            : 0;

        ring.style.background =
            `conic-gradient(
                var(--ls-pink) ${porcentaje}%,
                rgba(236, 72, 153, 0.15) ${porcentaje}%
            )`;

        lista
            .querySelectorAll(".registro-progreso")
            .forEach(elemento => elemento.remove());

        for (let i = 0; i < objetivo; i++) {
            const elemento = document.createElement("span");

            elemento.className =
                `registro-progreso badge rounded-pill m-1 ${
                    i < progreso ? "bg-pink" : "bg-secondary"
                }`;

            elemento.textContent = i + 1;

            lista.appendChild(elemento);
        }

        btn.disabled = progreso >= objetivo;

        btn.innerHTML =
            `<span>${
                progreso >= objetivo
                    ? LS("metaCompletada")
                    : LS("agregarRegistro")
            }</span>`;
    }

    async function registrar() {
        if (!id || btn?.disabled) {
            return;
        }

        try {
            const respuesta = await fetch(
                `${API}registrar-habito.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_habito_usuario: id,
                        valor: 1,
                        observaciones: "registro académico"
                    })
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exito) {
                throw new Error(
                    datos.mensaje || LS("No se pudo registrar.")
                );
            }

            if (datos.registro) {
                progreso = Number(datos.registro.progreso_hoy) || progreso + 1;
            } else {
                progreso++;
            }

            progreso = Math.min(progreso, objetivo);

            render();

        } catch (error) {
            alert(error.message);
        }
    }

    btn?.addEventListener("click", registrar);

    btnEditarMeta?.addEventListener("click", e => {
        e.preventDefault();

        menu?.classList.remove("show");

        if (inputRegistros) {
            inputRegistros.value = objetivo;
        }

        if (modalEditar && typeof bootstrap !== "undefined") {
            bootstrap.Modal
                .getOrCreateInstance(modalEditar)
                .show();
        }
    });

    btnGuardarConfig?.addEventListener("click", async () => {
        const nuevaMeta = Number(inputRegistros?.value);

        if (
            !Number.isInteger(nuevaMeta) ||
            nuevaMeta < 1 ||
            nuevaMeta > 20
        ) {
            alert(LS("numeroRegistrosValido"));
            return;
        }

        if (!id) {
            alert(LS("sinInformacionDisponible"));
            return;
        }

        try {
            const respuesta = await fetch(
                `${API}actualizar-habito.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_habito_usuario: id,
                        objetivo: nuevaMeta,
                        unidad: "registros",
                        frecuencia: "diaria"
                    })
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exito) {
                throw new Error(
                    datos.mensaje ||
                    LS("No se pudieron guardar los cambios.")
                );
            }

            objetivo = nuevaMeta;

            if (progreso > objetivo) {
                progreso = objetivo;
            }

            render();

            if (modalEditar && typeof bootstrap !== "undefined") {
                bootstrap.Modal
                    .getOrCreateInstance(modalEditar)
                    .hide();
            }

        } catch (error) {
            alert(error.message);
        }
    });

    btnReiniciarMeta?.addEventListener("click", async () => {
        if (
            !confirm(
                LS("¿Quieres reiniciar la cuenta a 0?")
            )
        ) {
            return;
        }

        if (!id) {
            return;
        }

        try {
            const respuesta = await fetch(
                `${API}eliminar-registros-hoy.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_habito_usuario: id
                    })
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exito) {
                throw new Error(
                    datos.mensaje ||
                    LS("No se pudo reiniciar.")
                );
            }

            progreso = 0;

            render();

        } catch (error) {
            alert(error.message);
        }
    });

    window.addEventListener(
        "lifesyncIdiomaCambiado",
        render
    );

    cargar()
        .then(render)
        .catch(error => {
            console.error("LifeSync Académico:", error);
            alert(error.message);
        });
})();