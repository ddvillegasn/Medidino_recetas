<?php
/**
 * Script de prueba para verificar la conexión con la base de datos
 * Acceder desde: http://localhost/MediDino/backend/test-connection.php
 */

require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

$resultado = [
    'conexion' => false,
    'base_datos' => false,
    'tablas' => [],
    'errores' => []
];

// 1. Probar conexión
try {
    if ($conexion->connect_error) {
        $resultado['errores'][] = 'Error de conexión: ' . $conexion->connect_error;
    } else {
        $resultado['conexion'] = true;
        $resultado['mensaje_conexion'] = 'Conexión exitosa a MySQL';
    }
} catch (Exception $e) {
    $resultado['errores'][] = 'Excepción en conexión: ' . $e->getMessage();
}

// 2. Probar selección de base de datos
if ($resultado['conexion']) {
    try {
        $resultado['base_datos'] = true;
        $resultado['mensaje_bd'] = 'Base de datos ' . $db_nombre . ' seleccionada correctamente';
    } catch (Exception $e) {
        $resultado['errores'][] = 'Error al seleccionar base de datos: ' . $e->getMessage();
    }
}

// 3. Verificar tablas existentes
if ($resultado['base_datos']) {
    $tablas_requeridas = ['medicos', 'especialidades', 'horarios_laborales'];
    
    foreach ($tablas_requeridas as $tabla) {
        $sql = "SHOW TABLES LIKE '$tabla'";
        $result = $conexion->query($sql);
        
        if ($result && $result->num_rows > 0) {
            // Contar registros
            $sql_count = "SELECT COUNT(*) as total FROM $tabla";
            $count_result = $conexion->query($sql_count);
            $count = $count_result ? $count_result->fetch_assoc()['total'] : 0;
            
            $resultado['tablas'][$tabla] = [
                'existe' => true,
                'registros' => (int)$count
            ];
        } else {
            $resultado['tablas'][$tabla] = [
                'existe' => false,
                'registros' => 0
            ];
        }
    }
}

// 4. Probar consulta de médicos
if ($resultado['base_datos'] && isset($resultado['tablas']['medicos']['existe']) && $resultado['tablas']['medicos']['existe']) {
    try {
        $sql = "SELECT COUNT(*) as total FROM medicos WHERE estado_registro = 'activo'";
        $result = $conexion->query($sql);
        if ($result) {
            $row = $result->fetch_assoc();
            $resultado['medicos_activos'] = (int)$row['total'];
        }
    } catch (Exception $e) {
        $resultado['errores'][] = 'Error al consultar médicos: ' . $e->getMessage();
    }
}

// 5. Probar consulta de especialidades
if ($resultado['base_datos'] && isset($resultado['tablas']['especialidades']['existe']) && $resultado['tablas']['especialidades']['existe']) {
    try {
        $sql = "SELECT COUNT(*) as total FROM especialidades";
        $result = $conexion->query($sql);
        if ($result) {
            $row = $result->fetch_assoc();
            $resultado['total_especialidades'] = (int)$row['total'];
        }
    } catch (Exception $e) {
        $resultado['errores'][] = 'Error al consultar especialidades: ' . $e->getMessage();
    }
}

// 6. Mostrar estructura de la tabla medicos (si existe)
if ($resultado['base_datos'] && isset($resultado['tablas']['medicos']['existe']) && $resultado['tablas']['medicos']['existe']) {
    try {
        $sql = "DESCRIBE medicos";
        $result = $conexion->query($sql);
        $campos = [];
        while ($row = $result->fetch_assoc()) {
            $campos[] = $row;
        }
        $resultado['estructura_medicos'] = $campos;
    } catch (Exception $e) {
        $resultado['errores'][] = 'Error al obtener estructura: ' . $e->getMessage();
    }
}

// 7. Probar inserción (sin guardar)
if ($resultado['base_datos']) {
    $resultado['test_insercion'] = 'La estructura permite inserción (no se insertó nada)';
}

$resultado['timestamp'] = date('Y-m-d H:i:s');
$resultado['servidor'] = $_SERVER['SERVER_NAME'];
$resultado['php_version'] = phpversion();

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

$conexion->close();
?>

