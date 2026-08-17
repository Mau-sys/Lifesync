(function () {
    "use strict";

    let audioContext = null;

    function sonidosActivados() {
        const configuracion = localStorage.getItem("lifeSyncConfiguracion");
        if (!configuracion) return true;
        try {
            const datos = JSON.parse(configuracion);
            return datos.sonidos !== false;
        } catch (error) {
            console.error("No se pudo leer la configuración de sonido:", error);
            return true;
        }
    }

    function obtenerContextoAudio() {
        if (!audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                console.warn("Este navegador no admite Web Audio API.");
                return null;
            }
            audioContext = new AudioContext();
        }
        return audioContext;
    }

    function reproducirSonidoNotificacion() {
        if (!sonidosActivados()) return;
        try {
            const contexto = obtenerContextoAudio();
            if (!contexto) return;
            if (contexto.state === "suspended") contexto.resume();
            const oscilador = contexto.createOscillator();
            const ganancia = contexto.createGain();
            oscilador.type = "sine";
            oscilador.frequency.setValueAtTime(880, contexto.currentTime);
            oscilador.frequency.setValueAtTime(1174, contexto.currentTime + 0.10);
            ganancia.gain.setValueAtTime(0.0001, contexto.currentTime);
            ganancia.gain.exponentialRampToValueAtTime(0.15, contexto.currentTime + 0.02);
            ganancia.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + 0.35);
            oscilador.connect(ganancia);
            ganancia.connect(contexto.destination);
            oscilador.start();
            oscilador.stop(contexto.currentTime + 0.35);
        } catch (error) {
            console.error("No se pudo reproducir el sonido:", error);
        }
    }

    window.reproducirSonidoNotificacion = reproducirSonidoNotificacion;
})();
