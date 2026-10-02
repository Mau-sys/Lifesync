(function (global) {
    "use strict";

    const LS = texto => typeof window.traducirLifeSync === "function" ? window.traducirLifeSync(texto) : texto;
    const API = "../auth/";

    const HabitoUniversal = {
        /**
         * Inicializa la interfaz universal de un hábito.
         * @param {Object} config
         */
        init(config = {}) {
            const {
                idHabito,
                btnRegresarId = "btn-regresar",
                btnOptionsId,
                menuId,
                btnDeshabilitarId = "btn-deshabilitar-habito",
                urlRedireccion = "inicio.html"
            } = config;

            
            const btnRegresar = document.getElementById(btnRegresarId);
            if (btnRegresar) {
                btnRegresar.addEventListener("click", e => {
                    e.preventDefault();
                    history.length > 1 ? history.back() : (location.href = urlRedireccion);
                });
            }

            
            if (btnOptionsId && menuId) {
                const btnMenu = document.getElementById(btnOptionsId);
                const menuContainer = document.getElementById(menuId);

                if (btnMenu && menuContainer) {
                    btnMenu.addEventListener("click", e => {
                        e.stopPropagation();
                        menuContainer.classList.toggle("show");
                    });

                    document.addEventListener("click", e => {
                        if (!menuContainer.contains(e.target) && e.target !== btnMenu) {
                            menuContainer.classList.remove("show");
                        }
                    });
                }
            }

            
            const btnDeshabilitar = document.getElementById(btnDeshabilitarId);
            if (btnDeshabilitar) {
                btnDeshabilitar.addEventListener("click", async e => {
                    e.preventDefault();

                    const idActual = idHabito || Number(new URLSearchParams(location.search).get("id_habito_usuario")) || 0;

                    if (!idActual) {
                        alert(LS("No se pudo identificar el hábito actual. Verifica la URL o los datos."));
                        return;
                    }

                    const mensajeConfirmacion = LS("¿Estás seguro de que deseas deshabilitar este hábito? Podrás volver a activarlo en tus preferencias.");
                    if (!confirm(mensajeConfirmacion)) {
                        return;
                    }

                    try {
                        const r = await fetch(`${API}preferencias.php`, {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                accion: "deshabilitar",
                                id_habito_usuario: idActual
                            })
                        });

                        if (!r.ok) {
                            throw new Error(`${LS("Error en el servidor")} (HTTP ${r.status})`);
                        }

                        const d = await r.json();
                        
                        if (!d.exito) {
                            
                            const msgError = d.mensaje || LS("No se pudo deshabilitar el hábito. Inténtalo de nuevo.");
                            throw new Error(msgError);
                        }

                        alert(d.mensaje || LS("El hábito ha sido deshabilitado correctamente."));
                        location.href = urlRedireccion;

                    } catch (err) {
                        
                        const mensajeFinal = (err && err.message) 
                            ? err.message 
                            : LS("Ocurrió un error inesperado al intentar deshabilitar el hábito.");
                            
                        alert(mensajeFinal);
                    }
                });
            }
        }
    };

    global.HabitoUniversal = HabitoUniversal;
})(window);