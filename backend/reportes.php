<?php
/**
 * API para Reportes y Estadísticas
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tipo = $_GET['tipo'] ?? 'general';
    $id_medico = $_GET['id_medico'] ?? null;
    
    if ($tipo === 'general') {
        obtener_estadisticas_generales($conexion);
    } elseif ($tipo === 'medico' && $id_medico) {
        obtener_estadisticas_medico($conexion, $id_medico);
    } else {
        http_response_code(400);
        echo respuesta(false, 'Parámetros inválidos');
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
}

function obtener_estadisticas_generales($conexion) {
    try {
        // Total de médicos
        $sql_total = "SELECT COUNT(*) as total FROM medicos WHERE estado_registro = 'activo'";
        $total_medicos = $conexion->query($sql_total)->fetch_assoc()['total'];
        
        // Turnos hoy
        $sql_turnos = "SELECT COUNT(*) as total FROM turnos WHERE DATE(fecha_turno) = CURDATE()";
        $turnos_hoy = $conexion->query($sql_turnos)->fetch_assoc()['total'];
        
        // Médicos por especialidad
        $sql_especialidad = "SELECT e.nombre_especialidad, COUNT(m.id_medico) as cantidad
                             FROM especialidades e
                             LEFT JOIN medicos m ON e.id_especialidad = m.id_especialidad AND m.estado_registro = 'activo'
                             GROUP BY e.id_especialidad
                             ORDER BY cantidad DESC";
        
        $resultado = $conexion->query($sql_especialidad);
        $medicos_por_especialidad = [];
        while ($fila = $resultado->fetch_assoc()) {
            $medicos_por_especialidad[] = $fila;
        }
        
        // Disponibles hoy
        $sql_disponibles = "SELECT COUNT(DISTINCT id_medico) as total 
                            FROM disponibilidad_real 
                            WHERE disponible = 1 AND DATE(fecha_actualizacion) = CURDATE()";
        $disponibles = $conexion->query($sql_disponibles)->fetch_assoc()['total'];
        
        $estadisticas = [
            'total_medicos' => (int)$total_medicos,
            'turnos_hoy' => (int)$turnos_hoy,
            'medicos_disponibles' => (int)$disponibles,
            'medicos_por_especialidad' => $medicos_por_especialidad
        ];
        
        http_response_code(200);
        echo respuesta(true, 'Estadísticas obtenidas', $estadisticas);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo respuesta(false, 'Error: ' . $e->getMessage());
    }
}

function obtener_estadisticas_medico($conexion, $id_medico) {
    try {
        $id_medico = (int)$id_medico;
        
        // Información del médico
        $sql_medico = "SELECT id_medico, nombre, apellido FROM medicos WHERE id_medico = ?";
        $stmt = $conexion->prepare($sql_medico);
        $stmt->bind_param('i', $id_medico);
        $stmt->execute();
        $medico = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        
        if (!$medico) {
            http_response_code(404);
            echo respuesta(false, 'Médico no encontrado');
            return;
        }
        
        // Total de turnos
        $sql_turnos = "SELECT COUNT(*) as total FROM turnos WHERE id_medico = ?";
        $stmt = $conexion->prepare($sql_turnos);
        $stmt->bind_param('i', $id_medico);
        $stmt->execute();
        $total_turnos = $stmt->get_result()->fetch_assoc()['total'];
        $stmt->close();
        
        // Turnos completados
        $sql_completados = "SELECT COUNT(*) as total FROM turnos WHERE id_medico = ? AND estado = 'completado'";
        $stmt = $conexion->prepare($sql_completados);
        $stmt->bind_param('i', $id_medico);
        $stmt->execute();
        $turnos_completados = $stmt->get_result()->fetch_assoc()['total'];
        $stmt->close();
        
        // Tasa de asistencia
        $tasa_asistencia = $total_turnos > 0 ? round(($turnos_completados / $total_turnos) * 100, 2) : 0;
        
        $estadisticas = [
            'id_medico' => $medico['id_medico'],
            'nombre_medico' => $medico['nombre'] . ' ' . $medico['apellido'],
            'total_turnos' => (int)$total_turnos,
            'turnos_completados' => (int)$turnos_completados,
            'tasa_asistencia' => (float)$tasa_asistencia
        ];
        
        http_response_code(200);
        echo respuesta(true, 'Estadísticas obtenidas', $estadisticas);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo respuesta(false, 'Error: ' . $e->getMessage());
    }
}
?>
