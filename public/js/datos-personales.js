document.addEventListener("DOMContentLoaded", () => {

    cargarDatosPersonales();

    const formulario =
        document.getElementById("formDatosPersonales");

    const nuevaFoto =
        document.getElementById("nuevaFoto");

    const fotoPerfil =
        document.getElementById("fotoPerfil");

    const btnCancelar =
        document.getElementById("btnCancelar");


    if (nuevaFoto && fotoPerfil) {

        nuevaFoto.addEventListener("change", () => {

            const archivo = nuevaFoto.files[0];

            if (!archivo) {
                return;
            }

            if (!archivo.type.startsWith("image/")) {
                alert("Selecciona una imagen válida.");
                nuevaFoto.value = "";
                return;
            }

            const lector = new FileReader();

            lector.onload = (evento) => {
                fotoPerfil.src = evento.target.result;
            };

            lector.readAsDataURL(archivo);
        });
    }


    if (formulario) {

        formulario.addEventListener("submit", async (evento) => {

            evento.preventDefault();

            const botonGuardar =
                document.getElementById("btnGuardar");

            botonGuardar.disabled = true;
            botonGuardar.textContent = "Guardando...";


            try {

                const datos = new FormData();

                datos.append(
                    "usuario",
                    document.getElementById("usuario").value.trim()
                );

                datos.append(
                    "nombreCompleto",
                    document.getElementById("nombreCompleto").value.trim()
                );

                datos.append(
                    "correo",
                    document.getElementById("correo").value.trim()
                );

                datos.append(
                    "fechaNacimiento",
                    document.getElementById("fechaNacimiento").value
                );

                datos.append(
                    "genero",
                    document.getElementById("genero").value
                );

                datos.append(
                    "contrasenaActual",
                    document.getElementById("contrasenaActual").value
                );

                datos.append(
                    "nuevaContrasena",
                    document.getElementById("nuevaContrasena").value
                );

                datos.append(
                    "confirmarContrasena",
                    document.getElementById("confirmarContrasena").value
                );


                if (
                    nuevaFoto &&
                    nuevaFoto.files &&
                    nuevaFoto.files.length > 0
                ) {

                    datos.append(
                        "nuevaFoto",
                        nuevaFoto.files[0]
                    );

                }


                const respuesta = await fetch(
                    "../auth/actualizar-datos-personales.php",
                    {
                        method: "POST",
                        body: datos,
                        credentials: "include"
                    }
                );


                const resultado =
                    await respuesta.json();


                if (!respuesta.ok || !resultado.exito) {

                    alert(
                        resultado.mensaje ||
                        "No se pudieron guardar los cambios."
                    );

                    return;
                }


                alert("Cambios guardados correctamente.");

                window.location.href = "perfil.html";


            } catch (error) {

                console.error(
                    "Error al guardar los datos:",
                    error
                );

                alert(
                    "Ocurrió un error al guardar los cambios."
                );


            } finally {

                botonGuardar.disabled = false;
                botonGuardar.textContent = "Guardar cambios";

            }

        });

    }


    if (btnCancelar) {

        btnCancelar.addEventListener("click", () => {

            window.location.href = "perfil.html";

        });

    }

});


async function cargarDatosPersonales() {

    try {

        const respuesta = await fetch(
            "../auth/perfil.php",
            {
                method: "GET",
                credentials: "include"
            }
        );


        const datos =
            await respuesta.json();


        if (!respuesta.ok || !datos.exito) {

            console.error(
                datos.mensaje ||
                "No se pudieron cargar los datos."
            );

            return;
        }


        const usuario =
            datos.usuario;


        document.getElementById("usuario").value =
            usuario.nombre_usuario || "";


        document.getElementById("nombreCompleto").value =
            usuario.nombre_completo || "";


        document.getElementById("correo").value =
            usuario.correo || "";


        document.getElementById("fechaNacimiento").value =
            usuario.fecha_nacimiento || "";


        document.getElementById("genero").value =
            usuario.genero || "";


        const fotoPerfil =
            document.getElementById("fotoPerfil");


        if (fotoPerfil && usuario.foto_perfil) {

            fotoPerfil.src =
                usuario.foto_perfil;

        }


        if (fotoPerfil) {

            fotoPerfil.onerror = () => {

                fotoPerfil.src = "img/Perfil.png";

            };

        }


    } catch (error) {

        console.error(
            "Error al cargar los datos personales:",
            error
        );

    }

}