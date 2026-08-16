/* =========================================================
   IDIOMA GLOBAL — textos dinámicos
   ========================================================= */
function LS(texto) {
    if (typeof window !== "undefined" &&
        typeof window.traducirLifeSync === "function") {
        return window.traducirLifeSync(texto);
    }
    return texto;
}

const ENDPOINT = "auth/configuracion.php";


const modoOscuro =
    document.getElementById("modoOscuro");

const idioma =
    document.getElementById("idioma");

const notificaciones =
    document.getElementById("notificaciones");

const sonidos =
    document.getElementById("sonidos");

const correo =
    document.getElementById("correo");

const sincronizacion =
    document.getElementById("sincronizacion");


const formulario =
    document.getElementById("configuracionForm");

const btnGuardar =
    document.getElementById("btnGuardarConfiguracion");

const mensaje =
    document.getElementById("mensajeConfiguracion");


const btnCambiarContrasena =
    document.getElementById("btnCambiarContrasena");

const modalContrasena =
    document.getElementById("modalContrasena");

const btnCancelarContrasena =
    document.getElementById("btnCancelarContrasena");

const btnGuardarContrasena =
    document.getElementById("btnGuardarContrasena");

const contrasenaActual =
    document.getElementById("actual");

const contrasenaNueva =
    document.getElementById("nueva");

const contrasenaConfirmar =
    document.getElementById("confirmar");

const mensajeContrasena =
    document.getElementById("mensajeContrasena");


const btnSesiones =
    document.getElementById("btnSesiones");

const modalSesiones =
    document.getElementById("modalSesiones");

const btnCerrarModalSesiones =
    document.getElementById("btnCerrarModalSesiones");

const listaSesiones =
    document.getElementById("listaSesiones");

const mensajeSesiones =
    document.getElementById("mensajeSesiones");


const textoEstadoSincronizacion =
    document.getElementById(
        "textoEstadoSincronizacion"
    );

const estadoSincronizacion =
    document.getElementById(
        "estadoSincronizacion"
    );


function mostrarMensaje(texto) {

    if (!mensaje) {
        return;
    }

    mensaje.textContent = texto;
}


function mostrarMensajeContrasena(texto) {

    if (!mensajeContrasena) {
        return;
    }

    mensajeContrasena.textContent = texto;
}


function mostrarMensajeSesiones(texto) {

    if (!mensajeSesiones) {
        return;
    }

    mensajeSesiones.textContent = texto;
}


function cambiarEstadoGuardado(cargando) {

    if (!btnGuardar) {
        return;
    }

    btnGuardar.disabled = cargando;

    btnGuardar.textContent =
        cargando
            ? LS("Guardando...")
            : "Guardar cambios";
}


function aplicarTema(tema) {

    const temaValido =
        tema === "claro"
            ? "claro"
            : "oscuro";


    if (
        typeof window.aplicarTemaGlobal ===
        "function"
    ) {

        window.aplicarTemaGlobal(
            temaValido
        );

        return;
    }


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
    }


    localStorage.setItem(
        "lifesync_tema",
        temaValido
    );
}


function actualizarTemaDesdeCheckbox() {

    if (!modoOscuro) {
        return;
    }


    const tema =
        modoOscuro.checked
            ? "oscuro"
            : "claro";


    aplicarTema(tema);
}


function actualizarEstadoSincronizacion(activa) {

    if (textoEstadoSincronizacion) {

        textoEstadoSincronizacion.textContent =
            activa
                ? "Tu información se encuentra respaldada correctamente."
                : "La sincronización automática está desactivada.";
    }


    if (estadoSincronizacion) {

        estadoSincronizacion.textContent =
            activa
                ? "● Sincronizada"
                : "● Desactivada";


        estadoSincronizacion.classList.toggle(
            "estado-activo",
            activa
        );
    }
}


async function cargarConfiguracion() {

    try {

        const respuesta =
            await fetch(
                `${ENDPOINT}?accion=obtener`,
                {
                    method: "GET",

                    credentials: "same-origin",

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
            !datos.exito ||
            !datos.configuracion
        ) {

            mostrarMensaje(
                datos.mensaje ||
                "No se pudo cargar la configuración."
            );

            return;
        }


        const configuracion =
            datos.configuracion;


        if (modoOscuro) {

            modoOscuro.checked =
                configuracion.tema ===
                "oscuro";
        }


        if (idioma) {

            idioma.value =
                configuracion.idioma ===
                "en"
                    ? "en"
                    : "es";
        }


        if (notificaciones) {

            notificaciones.checked =
                Number(
                    configuracion
                        .notificaciones_activas
                ) === 1;
        }


        if (sonidos) {

            sonidos.checked =
                Number(
                    configuracion
                        .sonidos_activados
                ) === 1;
        }


        if (correo) {

            const recordatorios =
                Number(
                    configuracion
                        .correo_recordatorios
                ) === 1;

            const logros =
                Number(
                    configuracion
                        .correo_logros
                ) === 1;


            correo.checked =
                recordatorios &&
                logros;
        }


        if (sincronizacion) {

            sincronizacion.checked =
                Number(
                    configuracion
                        .sincronizacion_automatica
                ) === 1;
        }


        aplicarTema(
            configuracion.tema ===
            "claro"
                ? "claro"
                : "oscuro"
        );


        actualizarEstadoSincronizacion(
            sincronizacion
                ? sincronizacion.checked
                : false
        );


    } catch (error) {

        console.error(
            "Error al cargar la configuración:",
            error
        );


        mostrarMensaje(
            "No se pudo cargar la configuración."
        );
    }
}


async function guardarConfiguracion(event) {

    event.preventDefault();


    mostrarMensaje("");


    cambiarEstadoGuardado(true);


    const datos =
        new URLSearchParams();


    datos.append(
        "accion",
        "guardar"
    );


    datos.append(
        "tema",
        modoOscuro &&
        modoOscuro.checked
            ? "oscuro"
            : "claro"
    );


    datos.append(
        "idioma",
        idioma
            ? idioma.value
            : "es"
    );


    datos.append(
        "notificaciones",
        notificaciones &&
        notificaciones.checked
            ? "1"
            : "0"
    );


    datos.append(
        "sonidos",
        sonidos &&
        sonidos.checked
            ? "1"
            : "0"
    );


    const correoActivo =
        correo &&
        correo.checked
            ? "1"
            : "0";


    datos.append(
        "correo_recordatorios",
        correoActivo
    );


    datos.append(
        "correo_logros",
        correoActivo
    );


    datos.append(
        "sincronizacion",
        sincronizacion &&
        sincronizacion.checked
            ? "1"
            : "0"
    );


    try {

        const respuesta =
            await fetch(
                ENDPOINT,
                {
                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded; charset=UTF-8",

                        "Accept":
                            "application/json"
                    },

                    body:
                        datos.toString()
                }
            );


        const resultado =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !resultado.exito
        ) {

            mostrarMensaje(
                resultado.mensaje ||
                "No se pudieron guardar los cambios."
            );

            return;
        }


        const tema =
            modoOscuro &&
            modoOscuro.checked
                ? "oscuro"
                : "claro";


        aplicarTema(tema);


        actualizarEstadoSincronizacion(
            sincronizacion
                ? sincronizacion.checked
                : false
        );


        mostrarMensaje(
            resultado.mensaje ||
            "Configuración guardada correctamente."
        );


    } catch (error) {

        console.error(
            "Error al guardar la configuración:",
            error
        );


        mostrarMensaje(
            "No se pudieron guardar los cambios."
        );


    } finally {

        cambiarEstadoGuardado(false);
    }
}


function abrirModalContrasena() {

    if (!modalContrasena) {
        return;
    }


    modalContrasena.classList.add(
        "activo"
    );


    mostrarMensajeContrasena("");


    if (contrasenaActual) {
        contrasenaActual.value = "";
    }


    if (contrasenaNueva) {
        contrasenaNueva.value = "";
    }


    if (contrasenaConfirmar) {
        contrasenaConfirmar.value = "";
    }


    if (contrasenaActual) {

        setTimeout(
            function () {

                contrasenaActual.focus();

            },
            50
        );
    }
}


function cerrarModalContrasena() {

    if (!modalContrasena) {
        return;
    }


    modalContrasena.classList.remove(
        "activo"
    );


    mostrarMensajeContrasena("");
}


async function cambiarContrasena() {

    mostrarMensajeContrasena("");


    const actual =
        contrasenaActual
            ? contrasenaActual.value
            : "";


    const nueva =
        contrasenaNueva
            ? contrasenaNueva.value
            : "";


    const confirmar =
        contrasenaConfirmar
            ? contrasenaConfirmar.value
            : "";


    if (
        !actual ||
        !nueva ||
        !confirmar
    ) {

        mostrarMensajeContrasena(
            LS("Completa todos los campos.")
        );

        return;
    }


    if (nueva.length < 8) {

        mostrarMensajeContrasena(
            LS("La nueva contraseña debe tener al menos 8 caracteres.")
        );

        return;
    }


    if (nueva !== confirmar) {

        mostrarMensajeContrasena(
            LS("Las nuevas contraseñas no coinciden.")
        );

        return;
    }


    if (btnGuardarContrasena) {

        btnGuardarContrasena.disabled =
            true;

        btnGuardarContrasena.textContent =
            LS("Guardando...");
    }


    const datos =
        new URLSearchParams();


    datos.append(
        "accion",
        "cambiar_contrasena"
    );


    datos.append(
        "actual",
        actual
    );


    datos.append(
        "nueva",
        nueva
    );


    try {

        const respuesta =
            await fetch(
                ENDPOINT,
                {
                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded; charset=UTF-8",

                        "Accept":
                            "application/json"
                    },

                    body:
                        datos.toString()
                }
            );


        const resultado =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !resultado.exito
        ) {

            mostrarMensajeContrasena(
                resultado.mensaje ||
                LS("No se pudo cambiar la contraseña.")
            );

            return;
        }


        mostrarMensajeContrasena(
            resultado.mensaje ||
            LS("Contraseña actualizada correctamente.")
        );


        if (contrasenaActual) {
            contrasenaActual.value = "";
        }


        if (contrasenaNueva) {
            contrasenaNueva.value = "";
        }


        if (contrasenaConfirmar) {
            contrasenaConfirmar.value = "";
        }


    } catch (error) {

        console.error(
            "Error al cambiar la contraseña:",
            error
        );


        mostrarMensajeContrasena(
            LS("No se pudo cambiar la contraseña.")
        );


    } finally {

        if (btnGuardarContrasena) {

            btnGuardarContrasena.disabled =
                false;

            btnGuardarContrasena.textContent =
                LS("Guardar");
        }
    }
}


async function cargarSesiones() {

    mostrarMensajeSesiones("");


    if (!listaSesiones) {
        return;
    }


    listaSesiones.innerHTML =
        LS("Cargando sesiones...");


    try {

        const respuesta =
            await fetch(
                `${ENDPOINT}?accion=sesiones`,
                {
                    method: "GET",

                    credentials:
                        "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const resultado =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !resultado.exito
        ) {

            listaSesiones.innerHTML =
                "";


            mostrarMensajeSesiones(
                resultado.mensaje ||
                LS("No se pudieron cargar las sesiones.")
            );

            return;
        }


        const sesiones =
            Array.isArray(
                resultado.sesiones
            )
                ? resultado.sesiones
                : [];


        listaSesiones.innerHTML =
            "";


        if (sesiones.length === 0) {

            listaSesiones.textContent =
                LS("No hay sesiones activas registradas.");

            return;
        }


        sesiones.forEach(
            function (sesion) {

                const contenedor =
                    document.createElement(
                        "div"
                    );


                contenedor.className =
                    "sesion-item";


                const dispositivo =
                    document.createElement(
                        "p"
                    );


                dispositivo.textContent =
                    sesion.dispositivo ||
                    LS("Dispositivo desconocido");


                const fechaInicio =
                    document.createElement(
                        "p"
                    );


                fechaInicio.textContent =
                    `Inicio: ${
                        sesion.fecha_inicio ||
                        LS("Sin información")
                    }`;


                const ultimoAcceso =
                    document.createElement(
                        "p"
                    );


                ultimoAcceso.textContent =
                    `Último acceso: ${
                        sesion.ultimo_acceso ||
                        LS("Sin información")
                    }`;


                const boton =
                    document.createElement(
                        "button"
                    );


                boton.type =
                    "button";


                boton.className =
                    "btn-secundario";


                boton.textContent =
                    LS("Cerrar sesión");


                boton.addEventListener(
                    "click",
                    function () {

                        cerrarSesion(
                            sesion.id_sesion
                        );
                    }
                );


                contenedor.appendChild(
                    dispositivo
                );


                contenedor.appendChild(
                    fechaInicio
                );


                contenedor.appendChild(
                    ultimoAcceso
                );


                contenedor.appendChild(
                    boton
                );


                listaSesiones.appendChild(
                    contenedor
                );
            }
        );


    } catch (error) {

        console.error(
            "Error al cargar sesiones:",
            error
        );


        listaSesiones.innerHTML =
            "";


        mostrarMensajeSesiones(
            LS("No se pudieron cargar las sesiones.")
        );
    }
}


async function cerrarSesion(idSesion) {

    if (!idSesion) {
        return;
    }


    const datos =
        new URLSearchParams();


    datos.append(
        "accion",
        "cerrar_sesion"
    );


    datos.append(
        "id_sesion",
        idSesion
    );


    try {

        const respuesta =
            await fetch(
                ENDPOINT,
                {
                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded; charset=UTF-8",

                        "Accept":
                            "application/json"
                    },

                    body:
                        datos.toString()
                }
            );


        const resultado =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !resultado.exito
        ) {

            mostrarMensajeSesiones(
                resultado.mensaje ||
                "No se pudo cerrar la sesión."
            );

            return;
        }


        if (
            resultado.sesion_actual
        ) {

            localStorage.removeItem(
                "lifesync_tema"
            );


            window.location.href =
                "inicio-sesion.html";

            return;
        }


        await cargarSesiones();


    } catch (error) {

        console.error(
            "Error al cerrar la sesión:",
            error
        );


        mostrarMensajeSesiones(
            "No se pudo cerrar la sesión."
        );
    }
}


if (formulario) {

    formulario.addEventListener(
        "submit",
        guardarConfiguracion
    );
}


if (modoOscuro) {

    modoOscuro.addEventListener(
        "change",
        function () {

            actualizarTemaDesdeCheckbox();

        }
    );
}


if (sincronizacion) {

    sincronizacion.addEventListener(
        "change",
        function () {

            actualizarEstadoSincronizacion(
                sincronizacion.checked
            );

        }
    );
}


if (btnCambiarContrasena) {

    btnCambiarContrasena.addEventListener(
        "click",
        abrirModalContrasena
    );
}


if (btnCancelarContrasena) {

    btnCancelarContrasena.addEventListener(
        "click",
        cerrarModalContrasena
    );
}


if (btnGuardarContrasena) {

    btnGuardarContrasena.addEventListener(
        "click",
        cambiarContrasena
    );
}


if (btnSesiones) {

    btnSesiones.addEventListener(
        "click",
        function () {

            if (modalSesiones) {

                modalSesiones.classList.add(
                    "activo"
                );
            }


            cargarSesiones();
        }
    );
}


if (btnCerrarModalSesiones) {

    btnCerrarModalSesiones.addEventListener(
        "click",
        function () {

            if (modalSesiones) {

                modalSesiones.classList.remove(
                    "activo"
                );
            }
        }
    );
}


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        if (
            modalContrasena &&
            modalContrasena.classList.contains(
                "activo"
            )
        ) {

            cerrarModalContrasena();
        }


        if (
            modalSesiones &&
            modalSesiones.classList.contains(
                "activo"
            )
        ) {

            modalSesiones.classList.remove(
                "activo"
            );
        }
    }
);


cargarConfiguracion();