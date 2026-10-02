document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarPerfil();

        configurarCerrarSesion();

    }
);


/* =========================================================
   TRADUCCIÓN
   ========================================================= */

function texto(clave) {

    if (
        typeof window.traducirLifeSync ===
        "function"
    ) {

        return window.traducirLifeSync(
            clave
        );

    }

    return clave;
}


/* =========================================================
   CARGAR PERFIL
   ========================================================= */

async function cargarPerfil() {

    const nombreUsuario =
        document.getElementById(
            "nombreUsuario"
        );

    const fotoPerfil =
        document.getElementById(
            "fotoPerfil"
        );


    if (
        !nombreUsuario ||
        !fotoPerfil
    ) {

        return;
    }


    try {

        const respuesta =
            await fetch(
                "../auth/perfil.php",
                {
                    method: "GET",

                    credentials:
                        "include",

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

            console.error(
                datos.mensaje ||
                texto(
                    "noCargarPerfil"
                )
            );

            return;
        }


        const usuario =
            datos.usuario;


        nombreUsuario.textContent =
            usuario.nombre_usuario ||
            texto("usuario");


        if (
            usuario.foto_perfil
        ) {

            fotoPerfil.src =
                usuario.foto_perfil;

        }


        fotoPerfil.onerror =
            () => {

                fotoPerfil.onerror =
                    null;

                fotoPerfil.src =
                    "img/Perfil.png";

            };


    } catch (error) {

        console.error(
            "Error al cargar el perfil:",
            error
        );

    }

}


/* =========================================================
   CERRAR SESIÓN
   ========================================================= */

function configurarCerrarSesion() {

    const botonCerrarSesion =
        document.getElementById(
            "btnCerrarSesion"
        );


    if (!botonCerrarSesion) {

        return;
    }


    botonCerrarSesion.addEventListener(
        "click",
        async () => {

            const confirmar =
                confirm(
                    texto(
                        "cerrarSesionConfirmacion"
                    )
                );


            if (!confirmar) {

                return;
            }


            botonCerrarSesion.disabled =
                true;


            botonCerrarSesion.textContent =
                texto(
                    "cerrandoSesion"
                );


            try {

                const respuesta =
                    await fetch(
                        "../auth/cerrar-sesion.php",
                        {
                            method:
                                "POST",

                            credentials:
                                "include",

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
                        texto(
                            "noCerrarSesion"
                        )
                    );

                }


                // =========================================================
                // LIMPIAR ALMACENAMIENTO Y RESTABLECER A DEFAULTS (EN & OSCURO)
                // =========================================================
                
                // 1. Eliminar preferencias guardadas
                localStorage.removeItem("lifesync_tema");
                localStorage.removeItem("lifesync_idioma");
                localStorage.removeItem("lifeSyncConfiguracion");

                // 2. Restablecer tema global a Oscuro usando la función nativa del sistema
                if (typeof window.aplicarTemaGlobal === "function") {
                    window.aplicarTemaGlobal("oscuro");
                }

                // 3. Restablecer idioma global a Inglés ('en')
                if (typeof window.cambiarIdiomaLifeSync === "function") {
                    window.cambiarIdiomaLifeSync("en");
                } else if (typeof window.aplicarIdioma === "function") {
                    window.aplicarIdioma("en");
                }


                window.location.href =
                    "Inicio-sesion.html";


            } catch (error) {

                console.error(
                    "Error al cerrar sesión:",
                    error
                );


                botonCerrarSesion.disabled =
                    false;


                botonCerrarSesion.textContent =
                    texto(
                        "cerrarSesion"
                    );


                alert(
                    texto(
                        "noSePudoCerrarSesion"
                    )
                );

            }

        }
    );

}


/* =========================================================
   ACTUALIZAR BOTÓN SI CAMBIA EL IDIOMA
   ========================================================= */

window.addEventListener(
    "lifesyncIdiomaCambiado",
    () => {

        const botonCerrarSesion =
            document.getElementById(
                "btnCerrarSesion"
            );


        if (
            botonCerrarSesion &&
            !botonCerrarSesion.disabled
        ) {

            botonCerrarSesion.textContent =
                texto(
                    "cerrarSesion"
                );

        }

    }
);  