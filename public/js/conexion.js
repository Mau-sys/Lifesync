
document.addEventListener("load", async (e) => {
    e.preventDefault();

    try {
            const response = await fetch('../config/conexion.php', {
                method: 'GET'
            });
 
            const result = await response.json();

            alert(result);
 
            
        } catch (error) {
            alert('Ocurrió un error de conexión');
        }


}
)
