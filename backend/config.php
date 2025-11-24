<?php
/**
 * Configuración de conexión a la Base de Datos MySQL (XAMPP)
 */

// Configuración de conexión
$db_host = 'localhost';      // Host XAMPP
$db_usuario = 'root';        // Usuario por defecto en XAMPP
$db_password = '';           // Sin contraseña por defecto en XAMPP
$db_nombre = 'medidino_medicos';  // Nombre de la base de datos
$db_port = 3307;             // Puerto personalizado

// Crear conexión con puerto correcto
$conexion = new mysqli($db_host, $db_usuario, $db_password, $db_nombre, $db_port);

// Verificar conexión
if ($conexion->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . $conexion->connect_error
    ]));
}

// Establecer charset a UTF-8
$conexion->set_charset("utf8mb4");

// Función para responder en JSON
function respuesta($success, $message, $data = null) {
    return json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
}

// Función para validar datos
function validar_entrada($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}
?>
