<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost"; // Cambia esto si es necesario
$username = "root"; // Usuario de la base de datos
$password = ""; // Contraseña de la base de datos
$database = "laravel"; // Nombre de la base de datos

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

if (isset($_GET['grado'])) {
    $grado = $conn->real_escape_string($_GET['grado']);
    
    $sql = "SELECT nombre FROM area WHERE grado = '$grado'";
    $result = $conn->query($sql);
    
    $materias = [];
    while ($row = $result->fetch_assoc()) {
        $materias[] = $row['nombre'];
    }
    
    echo json_encode(["materias" => $materias]);
} else {
    echo json_encode(["error" => "Grado no especificado"]);
}

$conn->close();
