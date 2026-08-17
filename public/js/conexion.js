document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../config/conexion.php", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        const result = await response.json();
        console.log("Resultado de conexión:", result);

    } catch (error) {
        console.error("Ocurrió un error de conexión:", error);
    }
});
