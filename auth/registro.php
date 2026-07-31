<?php

header("Content-Type: application/json");

require_once "../config/conexion.php";

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$nombre = trim($data["nombre"] ?? "");
$correo = trim($data["correo"] ?? "");
$password = trim($data["password"] ?? "");

if (
    empty($nombre) ||
    empty($correo) ||
    empty($password)
) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

try {

    // Verificar correo existente
    $sql = "SELECT id_usuario
            FROM usuario
            WHERE correo = :correo";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(":correo", $correo);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {

        echo json_encode([
            "success" => false,
            "message" => "El correo ya está registrado"
        ]);
        exit;
    }

    // Hash seguro
    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $sql = "INSERT INTO usuario
            (
                nombre_usuario,
                correo,
                password_hash
            )
            VALUES
            (
                :nombre,
                :correo,
                :password_hash
            )";

    $stmt = $conn->prepare($sql);

    $stmt->bindParam(":nombre", $nombre);
    $stmt->bindParam(":correo", $correo);
    $stmt->bindParam(":password_hash", $passwordHash);

    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Usuario registrado correctamente"
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}