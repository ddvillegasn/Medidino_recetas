<?php
/**
 * API para Especialidades
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    obtener_especialidades($conexion);
} elseif ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
}

function obtener_especialidades($conexion) {
    try {
        $sql = "SELECT id_especialidad, nombre_especialidad FROM especialidades ORDER BY nombre_especialidad";
        $resultado = $conexion->query($sql);
        
        $especialidades = [];
        while ($fila = $resultado->fetch_assoc()) {
            $especialidades[] = $fila;
        }
        
        http_response_code(200);
        echo respuesta(true, 'Especialidades obtenidas', $especialidades);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo respuesta(false, 'Error: ' . $e->getMessage());
    }
}
?>
