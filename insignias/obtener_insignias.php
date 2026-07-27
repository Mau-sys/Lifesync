<?php
// Configurar encabezado para respuesta JSON
header('Content-Type: application/json; charset=utf-8');

// Requerir el archivo de conexión existente
require_once '../config/conexion.php';

try {
    // Consulta para obtener las insignias
    $sql = "SELECT id_insignia, nombre, descripcion, imagen FROM insignias";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    
    // Obtener los resultados como array asociativo
    $insignias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retornar respuesta exitosa
    echo json_encode([
        'status' => 'success',
        'data' => $insignias
    ]);

} catch (PDOException $e) {
    // Manejo de errores
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al obtener insignias: ' . $e->getMessage()
    ]);
}
?>