<?php
// Configurar encabezado para respuesta JSON
header('Content-Type: application/json; charset=utf-8');

// Requerir el archivo de conexión
require_once '../config/conexion.php';

try {
    // 1. Instanciar la clase Database
    $database = new Database();
    
    // 2. Obtener la conexión PDO
    $conexion = $database->getConnection();

    // Validar si la conexión se realizó correctamente
    if (!$conexion) {
        throw new Exception("No se pudo establecer la conexión a la base de datos.");
    }

    // 3. Preparar y ejecutar la consulta
    $sql = "SELECT id_insignia, nombre, descripcion, imagen FROM insignias";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();

    // 4. Obtener todos los resultados
    $insignias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Retornar los datos en formato JSON
    echo json_encode([
        'status' => 'success',
        'data' => $insignias
    ]);

} catch (Exception $e) {
    // Retornar error si algo falla
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>