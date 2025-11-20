<?php
/**
 * API para gestión de Médicos
 * GET: Obtener médicos
 * POST: Crear nuevo médico
 * PUT: Actualizar médico
 * DELETE: Eliminar médico
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$partes = explode('/', trim($uri, '/'));

// Obtener el ID si existe
$id_medico = null;
if (count($partes) > 2 && is_numeric($partes[count($partes) - 1])) {
    $id_medico = (int)$partes[count($partes) - 1];
}

switch ($metodo) {
    case 'GET':
        obtener_medicos($conexion, $id_medico);
        break;
    case 'POST':
        crear_medico($conexion);
        break;
    case 'PUT':
        actualizar_medico($conexion, $id_medico);
        break;
    case 'DELETE':
        eliminar_medico($conexion, $id_medico);
        break;
    case 'OPTIONS':
        http_response_code(200);
        break;
    default:
        http_response_code(405);
        echo respuesta(false, 'Método no permitido');
        break;
}

/**
 * Obtener todos los médicos o uno específico
 */
function obtener_medicos($conexion, $id_medico = null) {
    try {
        if ($id_medico) {
            // Obtener un médico específico
            $sql = "SELECT m.*, e.nombre_especialidad 
                    FROM medicos m
                    LEFT JOIN especialidades e ON m.id_especialidad = e.id_especialidad
                    WHERE m.id_medico = ?";
            
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param('i', $id_medico);
        } else {
            // Obtener todos los médicos activos
            $sql = "SELECT m.*, e.nombre_especialidad 
                    FROM medicos m
                    LEFT JOIN especialidades e ON m.id_especialidad = e.id_especialidad
                    WHERE m.estado_registro = 'activo'
                    ORDER BY m.nombre ASC";
            
            $stmt = $conexion->prepare($sql);
        }
        
        $stmt->execute();
        $resultado = $stmt->get_result();
        $medicos = [];
        
        while ($fila = $resultado->fetch_assoc()) {
            $medicos[] = $fila;
        }
        
        $stmt->close();
        
        http_response_code(200);
        echo respuesta(true, 'Médicos obtenidos correctamente', $medicos);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo respuesta(false, 'Error al obtener médicos: ' . $e->getMessage());
    }
}

/**
 * Crear nuevo médico
 */
function crear_medico($conexion) {
    try {
        // Obtener datos del formulario
        $datos = json_decode(file_get_contents("php://input"), true);
        
        // Si no es JSON, obtener del POST
        if (!$datos) {
            $datos = $_POST;
        }
        
        // Validar campos requeridos
        $campos_requeridos = ['nombre', 'apellido', 'email', 'numero_licencia'];
        foreach ($campos_requeridos as $campo) {
            if (empty($datos[$campo])) {
                http_response_code(400);
                echo respuesta(false, "El campo '$campo' es requerido");
                return;
            }
        }
        
        // Validar email único
        $email = validar_entrada($datos['email']);
        $sql_check = "SELECT id_medico FROM medicos WHERE email = ?";
        $stmt_check = $conexion->prepare($sql_check);
        $stmt_check->bind_param('s', $email);
        $stmt_check->execute();
        
        if ($stmt_check->get_result()->num_rows > 0) {
            $stmt_check->close();
            http_response_code(400);
            echo respuesta(false, 'El email ya está registrado');
            return;
        }
        $stmt_check->close();
        
        // Preparar datos
        $nombre = validar_entrada($datos['nombre']);
        $apellido = validar_entrada($datos['apellido']);
        $telefono = validar_entrada($datos['telefono'] ?? '');
        $cedula = validar_entrada($datos['cedula'] ?? '');
        $fecha_nacimiento = $datos['fecha_nacimiento'] ?? null;
        $genero = validar_entrada($datos['genero'] ?? '');
        $direccion = validar_entrada($datos['direccion'] ?? '');
        $ciudad = validar_entrada($datos['ciudad'] ?? '');
        $estado = validar_entrada($datos['estado'] ?? '');
        $numero_licencia = validar_entrada($datos['numero_licencia']);
        $expedicion_licencia = $datos['expedicion_licencia'] ?? null;
        $vencimiento_licencia = $datos['vencimiento_licencia'] ?? null;
        $id_especialidad = (int)($datos['id_especialidad'] ?? 0);
        $experiencia_anos = (int)($datos['experiencia_anos'] ?? 0);
        
        // Iniciar transacción
        $conexion->begin_transaction();
        
        // Insertar médico
        $sql = "INSERT INTO medicos 
                (nombre, apellido, email, telefono, cedula, fecha_nacimiento, genero,
                 direccion, ciudad, estado, numero_licencia, expedicion_licencia,
                 vencimiento_licencia, id_especialidad, experiencia_anos, estado_registro, fecha_registro)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', NOW())";
        
        $stmt = $conexion->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Error en la preparación: " . $conexion->error);
        }
        
        $stmt->bind_param(
            'ssssssssssssiii',
            $nombre, $apellido, $email, $telefono, $cedula,
            $fecha_nacimiento, $genero, $direccion, $ciudad, $estado,
            $numero_licencia, $expedicion_licencia, $vencimiento_licencia,
            $id_especialidad, $experiencia_anos
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar: " . $stmt->error);
        }
        
        $id_medico_insertado = $conexion->insert_id;
        $stmt->close();
        
        // Guardar horarios si existen
        $horarios_guardados = 0;
        if (isset($datos['horarios']) && is_array($datos['horarios']) && count($datos['horarios']) > 0) {
            $horarios_guardados = guardar_horarios($conexion, $id_medico_insertado, $datos['horarios']);
        }
        
        // Confirmar transacción
        $conexion->commit();
        
        http_response_code(201);
        echo respuesta(true, 'Médico registrado exitosamente' . 
            ($horarios_guardados > 0 ? " con $horarios_guardados horario(s)" : ''), 
            [
                'id' => $id_medico_insertado,
                'horarios_guardados' => $horarios_guardados
            ]
        );
        
    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $conexion->rollback();
        http_response_code(500);
        echo respuesta(false, 'Error al registrar médico: ' . $e->getMessage());
    }
}

/**
 * Guardar horarios laborales del médico
 */
function guardar_horarios($conexion, $id_medico, $horarios) {
    $contador = 0;
    
    foreach ($horarios as $horario) {
        // Validar que tenga los datos necesarios
        if (empty($horario['dia_semana']) || empty($horario['hora_inicio']) || empty($horario['hora_fin'])) {
            continue;
        }
        
        $dia_semana = normalizar_dia(validar_entrada($horario['dia_semana']));
        $hora_inicio = validar_entrada($horario['hora_inicio']);
        $hora_fin = validar_entrada($horario['hora_fin']);
        $tipo_turno = validar_entrada($horario['tipo_turno'] ?? 'completo');
        
        $sql = "INSERT INTO horarios_laborales 
                (id_medico, dia_semana, hora_inicio, hora_fin, tipo_turno, activo, fecha_creacion)
                VALUES (?, ?, ?, ?, ?, 1, NOW())";
        
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('issss', $id_medico, $dia_semana, $hora_inicio, $hora_fin, $tipo_turno);
        
        if ($stmt->execute()) {
            $contador++;
        }
        
        $stmt->close();
    }
    
    return $contador;
}

/**
 * Normalizar nombre del día de la semana
 */
function normalizar_dia($dia) {
    $dia = strtolower(trim($dia));
    // Mapeo de días sin tilde a días con tilde
    $map = [
        'lunes' => 'lunes',
        'martes' => 'martes',
        'miercoles' => 'miércoles',
        'miÃ©rcoles' => 'miércoles',
        'jueves' => 'jueves',
        'viernes' => 'viernes',
        'sabado' => 'sábado',
        'sÃ¡bado' => 'sábado',
        'domingo' => 'domingo'
    ];
    return $map[$dia] ?? $dia;
}

/**
 * Actualizar médico
 */
function actualizar_medico($conexion, $id_medico) {
    try {
        // Obtener datos
        $datos = json_decode(file_get_contents("php://input"), true);
        if (!$datos) {
            $datos = $_POST;
        }

        // Si el ID NO viene en la URL, intenta leerlo del cuerpo (JSON)
        if (!$id_medico && isset($datos['id_medico'])) {
            $id_medico = (int)$datos['id_medico'];
        }

        // Si después de esto sigue sin ID → error
        if (!$id_medico) {
            http_response_code(400);
            echo respuesta(false, 'ID de médico requerido');
            return;
        }
        
        // Preparar datos
        $nombre = validar_entrada($datos['nombre'] ?? '');
        $apellido = validar_entrada($datos['apellido'] ?? '');
        $email = validar_entrada($datos['email'] ?? '');
        $telefono = validar_entrada($datos['telefono'] ?? '');
        $cedula = validar_entrada($datos['cedula'] ?? '');
        $genero = validar_entrada($datos['genero'] ?? '');
        $direccion = validar_entrada($datos['direccion'] ?? '');
        $ciudad = validar_entrada($datos['ciudad'] ?? '');
        $estado = validar_entrada($datos['estado'] ?? '');
        $numero_licencia = validar_entrada($datos['numero_licencia'] ?? '');
        $vencimiento_licencia = $datos['vencimiento_licencia'] ?? null;
        $id_especialidad = (int)($datos['id_especialidad'] ?? 0);
        $experiencia_anos = (int)($datos['experiencia_anos'] ?? 0);
        
        // Iniciar transacción
        $conexion->begin_transaction();
        
        // Actualizar médico
        $sql = "UPDATE medicos SET 
                nombre = ?, apellido = ?, email = ?, telefono = ?, cedula = ?,
                genero = ?, direccion = ?, ciudad = ?, estado = ?,
                numero_licencia = ?, vencimiento_licencia = ?,
                id_especialidad = ?, experiencia_anos = ?, fecha_actualizacion = NOW()
                WHERE id_medico = ?";
        
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param(
            'sssssssssssiii',
            $nombre, $apellido, $email, $telefono, $cedula,
            $genero, $direccion, $ciudad, $estado,
            $numero_licencia, $vencimiento_licencia,
            $id_especialidad, $experiencia_anos, $id_medico
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error al actualizar: " . $stmt->error);
        }
        $stmt->close();
        
        // Si vienen horarios, actualizar
        $horarios_guardados = 0;
        if (isset($datos['horarios']) && is_array($datos['horarios'])) {
            // Eliminar horarios existentes
            $sql_delete = "DELETE FROM horarios_laborales WHERE id_medico = ?";
            $stmt_delete = $conexion->prepare($sql_delete);
            $stmt_delete->bind_param('i', $id_medico);
            $stmt_delete->execute();
            $stmt_delete->close();
            
            // Guardar nuevos horarios
            if (count($datos['horarios']) > 0) {
                $horarios_guardados = guardar_horarios($conexion, $id_medico, $datos['horarios']);
            }
        }
        
        // Confirmar transacción
        $conexion->commit();
        
        http_response_code(200);
        echo respuesta(true, 'Médico actualizado exitosamente' . 
            ($horarios_guardados > 0 ? " con $horarios_guardados horario(s)" : ''));
        
    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $conexion->rollback();
        http_response_code(500);
        echo respuesta(false, 'Error al actualizar médico: ' . $e->getMessage());
    }
}

/**
 * Eliminar (desactivar) médico
 */
function eliminar_medico($conexion, $id_medico) {
    try {
        if (!$id_medico) {
            http_response_code(400);
            echo respuesta(false, 'ID de médico requerido');
            return;
        }
        
        $sql = "UPDATE medicos SET estado_registro = 'inactivo', fecha_actualizacion = NOW()
                WHERE id_medico = ?";
        
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('i', $id_medico);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                $stmt->close();
                http_response_code(200);
                echo respuesta(true, 'Médico desactivado exitosamente');
            } else {
                $stmt->close();
                http_response_code(404);
                echo respuesta(false, 'Médico no encontrado');
            }
        } else {
            throw new Exception("Error al desactivar: " . $stmt->error);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo respuesta(false, 'Error al desactivar médico: ' . $e->getMessage());
    }
}
?>