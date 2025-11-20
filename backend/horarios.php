<?php
/**
 * API para Horarios Laborales
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$partes = explode('/', trim($uri, '/'));

// Obtener parámetros
$id_medico = $_GET['id_medico'] ?? null;
$id_horario = $_GET['id'] ?? null;
$todos = $_GET['todos'] ?? null;

if ($metodo === 'GET') {
    if ($todos) {
        obtener_todos_horarios($conexion);
    } else {
        obtener_horarios($conexion, $id_medico);
    }
} elseif ($metodo === 'POST') {
    crear_horario($conexion);
} elseif ($metodo === 'DELETE') {
    eliminar_horario($conexion, $id_horario);
} elseif ($metodo === 'OPTIONS') {
    http_response_code(200);
}

function obtener_todos_horarios($conexion) {
    try {
        $sql = "SELECT * FROM horarios_laborales 
                WHERE activo = 1
                ORDER BY id_medico, FIELD(dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')";
        
        $resultado = $conexion->query($sql);
        
        $horarios = [];
        while ($fila = $resultado->fetch_assoc()) {
            $fila['dia_semana'] = normalizar_dia($fila['dia_semana']);
            $horarios[] = $fila;
        }
        
        http_response_code(200);
        echo respuesta(true, 'Horarios obtenidos', $horarios);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo respuesta(false, 'Error: ' . $e->getMessage());
    }
}

function obtener_horarios($conexion, $id_medico) {
    try {
        if (!$id_medico) {
            http_response_code(400);
            echo respuesta(false, 'ID de médico requerido');
            return;
        }
        
        $sql = "SELECT * FROM horarios_laborales 
                WHERE id_medico = ? AND activo = 1
                ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')";
        
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('i', $id_medico);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        $horarios = [];
        while ($fila = $resultado->fetch_assoc()) {
            $fila['dia_semana'] = normalizar_dia($fila['dia_semana']);
            $horarios[] = $fila;
        }
        
        $stmt->close();
        http_response_code(200);
        echo respuesta(true, 'Horarios obtenidos', $horarios);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo respuesta(false, 'Error: ' . $e->getMessage());
    }
}

function crear_horario($conexion) {
    try {
        $datos = json_decode(file_get_contents("php://input"), true);
        
        if (!$datos) {
            http_response_code(400);
            echo respuesta(false, 'Faltan datos requeridos');
            return;
        }
        
        $id_medico = (int)$datos['id_medico'];
        $dia_semana = normalizar_dia(validar_entrada($datos['dia_semana']));
        $hora_inicio = validar_entrada($datos['hora_inicio']);
        $hora_fin = validar_entrada($datos['hora_fin']);
        $tipo_turno = validar_entrada($datos['tipo_turno'] ?? 'completo');
        
        $sql = "INSERT INTO horarios_laborales (id_medico, dia_semana, hora_inicio, hora_fin, tipo_turno, activo, fecha_creacion)
                VALUES (?, ?, ?, ?, ?, 1, NOW())";
        
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('issss', $id_medico, $dia_semana, $hora_inicio, $hora_fin, $tipo_turno);
        
        if ($stmt->execute()) {
            $id_insertado = $conexion->insert_id;
            $stmt->close();
            http_response_code(201);
            echo respuesta(true, 'Horario registrado', ['id' => $id_insertado]);
        } else {
            throw new Exception($stmt->error);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo respuesta(false, 'Error: ' . $e->getMessage());
    }
}

function eliminar_horario($conexion, $id_horario) {
    try {
        if (!$id_horario) {
            http_response_code(400);
            echo respuesta(false, 'ID de horario requerido');
            return;
        }
        
        $sql = "DELETE FROM horarios_laborales WHERE id_horario = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('i', $id_horario);
        
        if ($stmt->execute()) {
            $stmt->close();
            http_response_code(200);
            echo respuesta(true, 'Horario eliminado');
        } else {
            throw new Exception($stmt->error);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo respuesta(false, 'Error: ' . $e->getMessage());
    }
}

function normalizar_dia($dia) {
    $dia = strtolower(trim($dia));
    // Reemplazar variaciones sin tilde
    $map = [
        'miercoles' => 'miércoles',
        'sabado' => 'sábado',
        'lunes' => 'lunes',
        'martes' => 'martes',
        'jueves' => 'jueves',
        'viernes' => 'viernes',
        'domingo' => 'domingo'
    ];
    return $map[$dia] ?? $dia;
}
?>