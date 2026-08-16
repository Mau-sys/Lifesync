document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarPerfil();

        configurarCerrarSesion();

    }
);


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
                    method:
                        "GET",

                    credentials:
                        "include"
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
                "No se pudo cargar el perfil."
            );

            return;

        }


        const usuario =
            datos.usuario;


        nombreUsuario.textContent =
            usuario.nombre_usuario;


        if (usuario.foto_perfil) {

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
                                "include"
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
                        "No se pudo cerrar la sesión."
                    );

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
                    "No se pudo cerrar la sesión. Inténtalo nuevamente."
                );

            }

        }
    );

}