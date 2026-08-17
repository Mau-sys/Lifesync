document.addEventListener("DOMContentLoaded", () => {

    cargarDatosPersonales();

    const formulario = document.getElementById("formDatosPersonales");
    const nuevaFoto = document.getElementById("nuevaFoto");
    const fotoPerfil = document.getElementById("fotoPerfil");
    const btnCancelar = document.getElementById("btnCancelar");

    const texto = (clave) =>
        typeof window.traducirLifeSync === "function"
            ? window.traducirLifeSync(clave)
            : clave;

    if (nuevaFoto && fotoPerfil) {
        nuevaFoto.addEventListener("change", () => {
            const archivo = nuevaFoto.files[0];
            if (!archivo) return;

            if (!archivo.type.startsWith("image/")) {
                alert(texto("imagenValida"));
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

            const botonGuardar = document.getElementById("btnGuardar");
            if (!botonGuardar) return;

            botonGuardar.disabled = true;
            botonGuardar.textContent = texto("guardando");

            try {
                const datos = new FormData();
                datos.append("usuario", document.getElementById("usuario").value.trim());
                datos.append("nombreCompleto", document.getElementById("nombreCompleto").value.trim());
                datos.append("correo", document.getElementById("correo").value.trim());
                datos.append("fechaNacimiento", document.getElementById("fechaNacimiento").value);
                datos.append("genero", document.getElementById("genero").value);
                datos.append("contrasenaActual", document.getElementById("contrasenaActual").value);
                datos.append("nuevaContrasena", document.getElementById("nuevaContrasena").value);
                datos.append("confirmarContrasena", document.getElementById("confirmarContrasena").value);

                if (nuevaFoto?.files?.length > 0) {
                    datos.append("nuevaFoto", nuevaFoto.files[0]);
                }

                const respuesta = await fetch(
                    "../auth/actualizar-datos-personales.php",
                    {
                        method: "POST",
                        body: datos,
                        credentials: "include"
                    }
                );

                const resultado = await respuesta.json();

                if (!respuesta.ok || !resultado.exito) {
                    alert(resultado.mensaje || texto("noGuardarDatosPersonales"));
                    return;
                }

                alert(texto("cambiosGuardados"));
                window.location.href = "perfil.html";

            } catch (error) {
                console.error("Error al guardar los datos:", error);
                alert(texto("errorGuardarDatosPersonales"));
            } finally {
                botonGuardar.disabled = false;
                botonGuardar.textContent = texto("guardarCambios");
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
    const texto = (clave) =>
        typeof window.traducirLifeSync === "function"
            ? window.traducirLifeSync(clave)
            : clave;

    try {
        const respuesta = await fetch("../auth/perfil.php", {
            method: "GET",
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito) {
            console.error(datos.mensaje || texto("noCargarDatosPersonales"));
            return;
        }

        const usuario = datos.usuario;

        document.getElementById("usuario").value = usuario.nombre_usuario || "";
        document.getElementById("nombreCompleto").value = usuario.nombre_completo || "";
        document.getElementById("correo").value = usuario.correo || "";
        document.getElementById("fechaNacimiento").value = usuario.fecha_nacimiento || "";
        document.getElementById("genero").value = usuario.genero || "";

        const fotoPerfil = document.getElementById("fotoPerfil");
        if (fotoPerfil && usuario.foto_perfil) {
            fotoPerfil.src = usuario.foto_perfil;
        }

        if (fotoPerfil) {
            fotoPerfil.onerror = () => {
                fotoPerfil.src = "img/Perfil.png";
            };
        }

    } catch (error) {
        console.error("Error al cargar los datos personales:", error);
    }
}
