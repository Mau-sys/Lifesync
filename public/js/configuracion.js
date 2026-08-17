"use strict";

/* =========================================================
   CONFIGURACIÓN — LifeSync
   ========================================================= */

const ENDPOINT = "auth/configuracion.php";


/* =========================================================
   ELEMENTOS
   ========================================================= */

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


/* =========================================================
   TRADUCCIÓN
   ========================================================= */

function texto(clave) {

    if (
        typeof window.traducirLifeSync ===
        "function"
    ) {
        return window.traducirLifeSync(clave);
    }

    return clave;
}


/* =========================================================
   MENSAJES
   ========================================================= */

function mostrarMensaje(valor) {

    if (mensaje) {
        mensaje.textContent = valor;
    }

}


function mostrarMensajeContrasena(valor) {

    if (mensajeContrasena) {
        mensajeContrasena.textContent = valor;
    }

}


function mostrarMensajeSesiones(valor) {

    if (mensajeSesiones) {
        mensajeSesiones.textContent = valor;
    }

}


/* =========================================================
   BOTÓN GUARDAR
   ========================================================= */

function cambiarEstadoGuardado(cargando) {

    if (!btnGuardar) {
        return;
    }

    btnGuardar.disabled = cargando;

    btnGuardar.textContent =
        cargando
            ? texto("guardando")
            : texto("comun.guardarCambios");
}


/* =========================================================
   TEMA
   ========================================================= */

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

    aplicarTema(
        modoOscuro.checked
            ? "oscuro"
            : "claro"
    );
}


/* =========================================================
   SINCRONIZACIÓN
   ========================================================= */

function actualizarEstadoSincronizacion(activa) {

    if (textoEstadoSincronizacion) {

        textoEstadoSincronizacion.textContent =
            activa
                ? texto(
                    "configuracion.informacionSincronizada"
                )
                : texto(
                    "configuracion.sincronizacionDesactivada"
                );

    }


    if (estadoSincronizacion) {

        estadoSincronizacion.textContent =
            activa
                ? texto(
                    "configuracion.sincronizada"
                )
                : texto(
                    "configuracion.noSincronizada"
                );

        estadoSincronizacion.classList.toggle(
            "estado-activo",
            activa
        );

    }
}


/* =========================================================
   CARGAR CONFIGURACIÓN
   ========================================================= */

async function cargarConfiguracion() {

    try {

        const respuesta =
            await fetch(
                `${ENDPOINT}?accion=obtener`,
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


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito ||
            !datos.configuracion
        ) {

            mostrarMensaje(
                datos.mensaje ||
                texto(
                    "configuracion.errorCargar"
                )
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


        if (
            typeof window.cambiarIdiomaLifeSync ===
            "function"
        ) {

            window.cambiarIdiomaLifeSync(
                configuracion.idioma === "en"
                    ? "en"
                    : "es"
            );

        }


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
            texto(
                "configuracion.errorCargar"
            )
        );

    }

}


/* =========================================================
   GUARDAR CONFIGURACIÓN
   ========================================================= */

async function guardarConfiguracion(event) {

    event.preventDefault();

    mostrarMensaje("");

    cambiarEstadoGuardado(true);


    const idiomaSeleccionado =
        idioma
            ? idioma.value
            : "es";


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
        idiomaSeleccionado
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
                texto(
                    "configuracion.errorGuardar"
                )
            );

            return;
        }


        aplicarTema(
            modoOscuro &&
            modoOscuro.checked
                ? "oscuro"
                : "claro"
        );


        if (
            typeof window.cambiarIdiomaLifeSync ===
            "function"
        ) {

            window.cambiarIdiomaLifeSync(
                idiomaSeleccionado
            );

        }


        actualizarEstadoSincronizacion(
            sincronizacion
                ? sincronizacion.checked
                : false
        );


        mostrarMensaje(
            texto(
                "configuracion.guardadaCorrectamente"
            )
        );


    } catch (error) {

        console.error(
            "Error al guardar la configuración:",
            error
        );


        mostrarMensaje(
            texto(
                "configuracion.errorGuardar"
            )
        );


    } finally {

        cambiarEstadoGuardado(false);

    }

}


/* =========================================================
   CONTRASEÑA
   ========================================================= */

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
            () => {
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
            texto(
                "camposIncompletos"
            )
        );

        return;
    }


    if (nueva.length < 8) {

        mostrarMensajeContrasena(
            texto(
                "contrasenaCorta"
            )
        );

        return;
    }


    if (nueva !== confirmar) {

        mostrarMensajeContrasena(
            texto(
                "contrasenasNoCoinciden"
            )
        );

        return;
    }


    if (btnGuardarContrasena) {

        btnGuardarContrasena.disabled =
            true;

        btnGuardarContrasena.textContent =
            texto("guardando");

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
                texto(
                    "configuracion.errorCambiarContrasena"
                )
            );

            return;
        }


        mostrarMensajeContrasena(
            texto(
                "configuracion.contrasenaActualizada"
            )
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
            texto(
                "configuracion.errorCambiarContrasena"
            )
        );


    } finally {

        if (btnGuardarContrasena) {

            btnGuardarContrasena.disabled =
                false;

            btnGuardarContrasena.textContent =
                texto("comun.guardar");

        }

    }

}


/* =========================================================
   SESIONES
   ========================================================= */

async function cargarSesiones() {

    mostrarMensajeSesiones("");


    if (!listaSesiones) {
        return;
    }


    listaSesiones.textContent =
        texto(
            "configuracion.cargandoSesiones"
        );


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

            listaSesiones.innerHTML = "";

            mostrarMensajeSesiones(
                resultado.mensaje ||
                texto(
                    "configuracion.errorSesiones"
                )
            );

            return;
        }


        const sesiones =
            Array.isArray(
                resultado.sesiones
            )
                ? resultado.sesiones
                : [];


        listaSesiones.innerHTML = "";


        if (sesiones.length === 0) {

            listaSesiones.textContent =
                texto(
                    "configuracion.sinSesiones"
                );

            return;
        }


        sesiones.forEach(
            (sesion) => {

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
                    texto(
                        "configuracion.dispositivoDesconocido"
                    );


                const fechaInicio =
                    document.createElement(
                        "p"
                    );

                fechaInicio.textContent =
                    `${texto(
                        "configuracion.inicioSesion"
                    )}: ${
                        sesion.fecha_inicio ||
                        texto(
                            "sinInformacion"
                        )
                    }`;


                const ultimoAcceso =
                    document.createElement(
                        "p"
                    );

                ultimoAcceso.textContent =
                    `${texto(
                        "configuracion.ultimoAcceso"
                    )}: ${
                        sesion.ultimo_acceso ||
                        texto(
                            "sinInformacion"
                        )
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
                    texto(
                        "configuracion.cerrarSesion"
                    );


                boton.addEventListener(
                    "click",
                    () => {

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


        listaSesiones.innerHTML = "";

        mostrarMensajeSesiones(
            texto(
                "configuracion.errorSesiones"
            )
        );

    }

}


/* =========================================================
   CERRAR SESIÓN INDIVIDUAL
   ========================================================= */

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
                texto(
                    "configuracion.errorCerrarSesion"
                )
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
            texto(
                "configuracion.errorCerrarSesion"
            )
        );

    }

}


/* =========================================================
   EVENTOS
   ========================================================= */

if (formulario) {

    formulario.addEventListener(
        "submit",
        guardarConfiguracion
    );

}


if (modoOscuro) {

    modoOscuro.addEventListener(
        "change",
        actualizarTemaDesdeCheckbox
    );

}


if (sincronizacion) {

    sincronizacion.addEventListener(
        "change",
        () => {

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
        () => {

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
        () => {

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
    (event) => {

        if (event.key !== "Escape") {
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


/* =========================================================
   CAMBIO DE IDIOMA
   ========================================================= */

window.addEventListener(
    "lifesyncIdiomaCambiado",
    () => {

        cambiarEstadoGuardado(
            false
        );


        actualizarEstadoSincronizacion(
            sincronizacion
                ? sincronizacion.checked
                : false
        );


        if (
            listaSesiones &&
            modalSesiones &&
            modalSesiones.classList.contains(
                "activo"
            )
        ) {

            cargarSesiones();

        }

    }
);


/* =========================================================
   INICIAR
   ========================================================= */

cargarConfiguracion();