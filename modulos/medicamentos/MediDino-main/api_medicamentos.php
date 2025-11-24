<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de conexión
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'farmacia.sql';  // Cambiado para coincidir con la BD creada en phpMyAdmin

// Conectar a la base de datos
$conexion = new mysqli($host, $user, $password, $database);

if ($conexion->connect_error) {
    die(json_encode(['error' => 'Conexión fallida: ' . $conexion->connect_error]));
}

$conexion->set_charset("utf8");

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'obtener':
        obtenerMedicamentos();
        break;
    case 'guardar':
        guardarMedicamento();
        break;
    case 'actualizar':
        actualizarMedicamento();
        break;
    case 'dispensar':
        dispensarMedicamento();
        break;
    case 'movimiento':
        registrarMovimiento();
        break;
    case 'eliminar':
        eliminarMedicamento();
        break;
    case 'obtenerDispensaciones':
        obtenerDispensaciones();
        break;
    case 'eliminarDispensacion':
        eliminarDispensacion();
        break;
    case 'guardarSolicitud':
        guardarSolicitud();
        break;
    case 'obtenerSolicitudes':
        obtenerSolicitudes();
        break;
    case 'actualizarSolicitud':
        actualizarSolicitud();
        break;
    case 'guardarRecordatorio':
        guardarRecordatorio();
        break;
    case 'obtenerRecordatorios':
        obtenerRecordatorios();
        break;
    case 'actualizarRecordatorio':
        actualizarRecordatorio();
        break;
    case 'eliminarRecordatorio':
        eliminarRecordatorio();
        break;
    case 'guardarUsuario':
        guardarUsuario();
        break;
    case 'obtenerUsuarios':
        obtenerUsuarios();
        break;
    case 'actualizarUsuario':
        actualizarUsuario();
        break;
    case 'eliminarUsuario':
        eliminarUsuario();
        break;
    case 'reporteStock':
        reporteStock();
        break;
    case 'reporteMovimientos':
        reporteMovimientos();
        break;
    case 'reporteBajoStock':
        reporteBajoStock();
        break;
    case 'reporteDispensaciones':
        reporteDispensaciones();
        break;
    case 'reporteAlertas':
        reporteAlertas();
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
}

function obtenerMedicamentos() {
    global $conexion;
    
    // Verificar si la columna precio existe
    $checkColumn = $conexion->query("SHOW COLUMNS FROM medicamento LIKE 'precio'");
    $hasPrecio = $checkColumn && $checkColumn->num_rows > 0;
    
    if ($hasPrecio) {
        $sql = "SELECT 
                id_medicamento as id,
                nombre,
                categoria,
                descripcion,
                dosis_recomendada,
                efectos_secundarios,
                contraindicaciones,
                tipo,
                estado,
                fecha_vencimiento as vencimiento,
                precio,
                stock,
                minimo_stock as stockMinimo,
                creado_en,
                actualizado_en
                FROM medicamento 
                ORDER BY id_medicamento DESC";
    } else {
        $sql = "SELECT 
                id_medicamento as id,
                nombre,
                categoria,
                descripcion,
                dosis_recomendada,
                efectos_secundarios,
                contraindicaciones,
                tipo,
                estado,
                fecha_vencimiento as vencimiento,
                NULL as precio,
                stock,
                minimo_stock as stockMinimo,
                creado_en,
                actualizado_en
                FROM medicamento 
                ORDER BY id_medicamento DESC";
    }
    
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        echo json_encode(['success' => false, 'error' => 'Error en la consulta', 'medicamentos' => []]);
        return;
    }
    
    $medicamentos = [];
    
    while ($fila = $resultado->fetch_assoc()) {
        $medicamentos[] = $fila;
    }
    
    echo json_encode(['success' => true, 'medicamentos' => $medicamentos, 'total' => count($medicamentos)]);
}

function guardarMedicamento() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    $nombre = $conexion->real_escape_string($data['nombre'] ?? '');
    $descripcion = $conexion->real_escape_string($data['descripcion'] ?? '');
    $dosis_recomendada = $conexion->real_escape_string($data['dosis_recomendada'] ?? '');
    $efectos_secundarios = $conexion->real_escape_string($data['efectos_secundarios'] ?? '');
    $contraindicaciones = $conexion->real_escape_string($data['contraindicaciones'] ?? '');
    $categoria = $conexion->real_escape_string($data['categoria'] ?? '');
    $tipo = $conexion->real_escape_string($data['tipo'] ?? '');
    $estado = $conexion->real_escape_string($data['estado'] ?? 'activo');
    $fecha_vencimiento = $conexion->real_escape_string($data['fecha_vencimiento'] ?? '');
    $precio = floatval($data['precio'] ?? 0);
    $stock = intval($data['stock'] ?? 0);
    $minimo_stock = intval($data['minimo_stock'] ?? 5);
    
    // Verificar si la columna precio existe
    $checkColumn = $conexion->query("SHOW COLUMNS FROM medicamento LIKE 'precio'");
    $hasPrecio = $checkColumn && $checkColumn->num_rows > 0;
    
    if ($hasPrecio) {
        $sql = "INSERT INTO medicamento 
                (nombre, descripcion, dosis_recomendada, efectos_secundarios, 
                 contraindicaciones, categoria, tipo, estado, fecha_vencimiento, 
                 precio, stock, minimo_stock, creado_en, actualizado_en) 
                VALUES 
                ('$nombre', '$descripcion', '$dosis_recomendada', '$efectos_secundarios', 
                 '$contraindicaciones', '$categoria', '$tipo', '$estado', '$fecha_vencimiento', 
                 $precio, $stock, $minimo_stock, NOW(), NOW())";
    } else {
        $sql = "INSERT INTO medicamento 
                (nombre, descripcion, dosis_recomendada, efectos_secundarios, 
                 contraindicaciones, categoria, tipo, estado, fecha_vencimiento, 
                 stock, minimo_stock, creado_en, actualizado_en) 
                VALUES 
                ('$nombre', '$descripcion', '$dosis_recomendada', '$efectos_secundarios', 
                 '$contraindicaciones', '$categoria', '$tipo', '$estado', '$fecha_vencimiento', 
                 $stock, $minimo_stock, NOW(), NOW())";
    }
    
    if ($conexion->query($sql) === TRUE) {
        $id = $conexion->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Medicamento guardado exitosamente',
            'id' => $id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Error al guardar: ' . $conexion->error
        ]);
    }
}

function actualizarMedicamento() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    
    if ($id <= 0) {
        echo json_encode(['error' => 'ID inválido']);
        return;
    }
    
    // Construir la consulta dinámicamente según qué campos se envían
    $updates = [];
    
    if (isset($data['stock'])) {
        $stock = intval($data['stock']);
        $updates[] = "stock = $stock";
    }
    if (isset($data['precio'])) {
        $precio = floatval($data['precio']);
        $updates[] = "precio = $precio";
    }
    if (isset($data['estado'])) {
        $estado = $conexion->real_escape_string($data['estado']);
        $updates[] = "estado = '$estado'";
    }
    if (isset($data['vencimiento'])) {
        $vencimiento = $conexion->real_escape_string($data['vencimiento']);
        $updates[] = "fecha_vencimiento = '$vencimiento'";
    }
    
    if (empty($updates)) {
        echo json_encode(['error' => 'No hay campos para actualizar']);
        return;
    }
    
    $updates[] = "actualizado_en = NOW()";
    $updateStr = implode(", ", $updates);
    
    $sql = "UPDATE medicamento 
            SET $updateStr
            WHERE id_medicamento = $id";
    
    if ($conexion->query($sql) === TRUE) {
        echo json_encode([
            'success' => true,
            'message' => 'Medicamento actualizado'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $conexion->error
        ]);
    }
}

function dispensarMedicamento() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    $cantidad = intval($data['cantidad'] ?? 0);
    $paciente = $conexion->real_escape_string($data['paciente'] ?? '');
    $cedula = $conexion->real_escape_string($data['cedula'] ?? '');
    $medico = $conexion->real_escape_string($data['medico'] ?? '');
    $receta = $conexion->real_escape_string($data['receta'] ?? '');
    $indicaciones = $conexion->real_escape_string($data['indicaciones'] ?? '');
    
    if ($id <= 0 || $cantidad <= 0) {
        echo json_encode(['error' => 'Datos inválidos']);
        return;
    }
    
    // Verificar stock disponible
    $sql = "SELECT stock, nombre FROM medicamento WHERE id_medicamento = $id";
    $resultado = $conexion->query($sql);
    $medicamento = $resultado->fetch_assoc();
    
    if (!$medicamento || $medicamento['stock'] < $cantidad) {
        echo json_encode([
            'success' => false,
            'error' => 'Stock insuficiente'
        ]);
        return;
    }
    
    // Descontar del stock
    $nuevo_stock = $medicamento['stock'] - $cantidad;
    $sql = "UPDATE medicamento 
            SET stock = $nuevo_stock, actualizado_en = NOW()
            WHERE id_medicamento = $id";
    
    if ($conexion->query($sql) === TRUE) {
        // Guardar registro de dispensación
        $sql_dispensacion = "INSERT INTO dispensaciones 
                            (id_medicamento, nombre_medicamento, cantidad, paciente, cedula, medico, numero_receta, indicaciones, fecha)
                            VALUES
                            ($id, '{$medicamento['nombre']}', $cantidad, '$paciente', '$cedula', '$medico', '$receta', '$indicaciones', NOW())";
        
        $conexion->query($sql_dispensacion);
        
        echo json_encode([
            'success' => true,
            'message' => 'Dispensación registrada',
            'nuevo_stock' => $nuevo_stock
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $conexion->error
        ]);
    }
}

function registrarMovimiento() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    $tipo = $conexion->real_escape_string($data['tipo'] ?? '');
    $cantidad = intval($data['cantidad'] ?? 0);
    
    if ($id <= 0 || $cantidad <= 0) {
        echo json_encode(['error' => 'Datos inválidos']);
        return;
    }
    
    // Obtener stock actual
    $sql = "SELECT stock FROM medicamento WHERE id_medicamento = $id";
    $resultado = $conexion->query($sql);
    $medicamento = $resultado->fetch_assoc();
    
    if (!$medicamento) {
        echo json_encode(['error' => 'Medicamento no encontrado']);
        return;
    }
    
    $nuevo_stock = $medicamento['stock'];
    
    if ($tipo === 'entrada') {
        $nuevo_stock += $cantidad;
    } elseif ($tipo === 'salida') {
        if ($medicamento['stock'] < $cantidad) {
            echo json_encode([
                'success' => false,
                'error' => 'Stock insuficiente'
            ]);
            return;
        }
        $nuevo_stock -= $cantidad;
    } else {
        echo json_encode(['error' => 'Tipo de movimiento inválido']);
        return;
    }
    
    $sql = "UPDATE medicamento 
            SET stock = $nuevo_stock, actualizado_en = NOW()
            WHERE id_medicamento = $id";
    
    if ($conexion->query($sql) === TRUE) {
        echo json_encode([
            'success' => true,
            'message' => 'Movimiento registrado',
            'nuevo_stock' => $nuevo_stock
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $conexion->error
        ]);
    }
}

function eliminarMedicamento() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    
    if ($id <= 0) {
        echo json_encode(['error' => 'ID inválido', 'success' => false]);
        return;
    }
    
    // Verificar que el medicamento existe
    $sql = "SELECT id_medicamento, nombre FROM medicamento WHERE id_medicamento = $id";
    $resultado = $conexion->query($sql);
    
    if ($resultado->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Medicamento no encontrado'
        ]);
        return;
    }
    
    try {
        // Desactivar restricciones de clave foránea temporalmente
        $conexion->query("SET FOREIGN_KEY_CHECKS=0");
        
        // Eliminar registros relacionados en otras tablas
        
        // 1. Eliminar de movimiento_inventario si existe
        $conexion->query("DELETE FROM movimiento_inventario WHERE id_medicamento = $id");
        
        // 2. Eliminar de dispensaciones si existe
        $conexion->query("DELETE FROM dispensaciones WHERE id_medicamento = $id");
        
        // 3. Eliminar de alerta si existe
        $conexion->query("DELETE FROM alerta WHERE id_medicamento = $id");
        
        // Finalmente eliminar el medicamento
        $sql = "DELETE FROM medicamento WHERE id_medicamento = $id";
        
        if ($conexion->query($sql) === TRUE) {
            // Reactivar restricciones de clave foránea
            $conexion->query("SET FOREIGN_KEY_CHECKS=1");
            
            echo json_encode([
                'success' => true,
                'message' => 'Medicamento eliminado correctamente'
            ]);
        } else {
            // Reactivar restricciones de clave foránea
            $conexion->query("SET FOREIGN_KEY_CHECKS=1");
            
            echo json_encode([
                'success' => false,
                'error' => 'Error al eliminar: ' . $conexion->error
            ]);
        }
    } catch (Exception $e) {
        // Reactivar restricciones de clave foránea en caso de error
        $conexion->query("SET FOREIGN_KEY_CHECKS=1");
        
        echo json_encode([
            'success' => false,
            'error' => 'Error: ' . $e->getMessage()
        ]);
    }
}

function obtenerDispensaciones() {
    global $conexion;
    
    // Intentar obtener de la tabla dispensaciones si existe
    $checkTable = $conexion->query("SHOW TABLES LIKE 'dispensaciones'");
    
    if ($checkTable && $checkTable->num_rows > 0) {
        $sql = "SELECT 
                id_dispensacion as id,
                id_medicamento,
                nombre_medicamento,
                cantidad,
                paciente,
                cedula,
                medico,
                numero_receta,
                indicaciones,
                fecha
                FROM dispensaciones 
                ORDER BY fecha DESC 
                LIMIT 100";
    } else {
        // Si no existe la tabla, devolver array vacío
        echo json_encode([]);
        return;
    }
    
    $resultado = $conexion->query($sql);
    $dispensaciones = [];
    
    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {
            $dispensaciones[] = $fila;
        }
    }
    
    echo json_encode($dispensaciones);
}

function eliminarDispensacion() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    
    if ($id <= 0) {
        echo json_encode(['error' => 'ID inválido', 'success' => false]);
        return;
    }
    
    // Verificar que la dispensación existe
    $sql = "SELECT id_dispensacion FROM dispensaciones WHERE id_dispensacion = $id";
    $resultado = $conexion->query($sql);
    
    if ($resultado->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Dispensación no encontrada'
        ]);
        return;
    }
    
    // Eliminar la dispensación
    $sqlDelete = "DELETE FROM dispensaciones WHERE id_dispensacion = $id";
    
    if ($conexion->query($sqlDelete)) {
        echo json_encode([
            'success' => true,
            'message' => 'Dispensación eliminada correctamente'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Error al eliminar: ' . $conexion->error
        ]);
    }
}

function guardarSolicitud() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    $medicamento = $conexion->real_escape_string($data['medicamento'] ?? '');
    $cantidad = intval($data['cantidad'] ?? 0);
    $prioridad = $conexion->real_escape_string($data['prioridad'] ?? 'media');
    $area = $conexion->real_escape_string($data['area'] ?? '');
    $justificacion = $conexion->real_escape_string($data['justificacion'] ?? '');
    
    if (!$medicamento || $cantidad <= 0) {
        echo json_encode(['error' => 'Datos incompletos']);
        return;
    }
    
    // Verificar si la tabla existe
    $checkTable = $conexion->query("SHOW TABLES LIKE 'solicitud'");
    
    if (!$checkTable || $checkTable->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Tabla de solicitudes no encontrada'
        ]);
        return;
    }
    
    // Verificar estructura de la tabla
    $columnas = $conexion->query("SHOW COLUMNS FROM solicitud");
    $columnasList = [];
    while ($col = $columnas->fetch_assoc()) {
        $columnasList[] = $col['Field'];
    }
    
    // Crear detalles JSON con toda la información
    $detalles = json_encode([
        'medicamento' => $medicamento,
        'cantidad' => $cantidad,
        'prioridad' => $prioridad,
        'area' => $area,
        'justificacion' => $justificacion
    ]);
    
    $detalles = $conexion->real_escape_string($detalles);
    
    // Insertar en la tabla existente
    $sql = "INSERT INTO solicitud (fecha_solicitud, estado, detalles)
            VALUES (NOW(), 'pendiente', '$detalles')";
    
    if ($conexion->query($sql) === TRUE) {
        $id = $conexion->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Solicitud guardada correctamente',
            'id' => $id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Error al guardar: ' . $conexion->error
        ]);
    }
}

function obtenerSolicitudes() {
    global $conexion;
    
    // Verificar si la tabla existe
    $checkTable = $conexion->query("SHOW TABLES LIKE 'solicitud'");
    
    if (!$checkTable || $checkTable->num_rows === 0) {
        // Tabla no existe, devolver error descriptivo
        echo json_encode([
            'error' => 'Tabla solicitud no encontrada',
            'available' => false
        ]);
        return;
    }
    
    $sql = "SELECT 
            id_solicitud as id,
            fecha_solicitud,
            estado,
            detalles
            FROM solicitud 
            WHERE TRIM(LOWER(estado)) != 'eliminada'
            ORDER BY fecha_solicitud DESC 
            LIMIT 100";
    
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        echo json_encode([
            'error' => 'Error en la consulta: ' . $conexion->error
        ]);
        return;
    }
    
    $solicitudes = [];
    
    while ($fila = $resultado->fetch_assoc()) {
        // Decodificar JSON si existe
        if ($fila['detalles']) {
            $detalles = json_decode($fila['detalles'], true);
            if (is_array($detalles)) {
                $fila = array_merge($fila, $detalles);
            }
        }
        $solicitudes[] = $fila;
    }
    
    echo json_encode($solicitudes);
}

function actualizarSolicitud() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    $estado = strtolower(trim($conexion->real_escape_string($data['estado'] ?? 'pendiente')));
    
    if ($id <= 0) {
        echo json_encode(['error' => 'ID inválido']);
        return;
    }
    
    // Log para debugging
    error_log("DEBUG: Actualizando solicitud ID=$id con estado=$estado");
    
    $sql = "UPDATE solicitud 
            SET estado = '$estado'
            WHERE id_solicitud = $id";
    
    error_log("DEBUG: Ejecutando SQL: $sql");
    
    if ($conexion->query($sql) === TRUE) {
        // Verificar que la actualización se guardó
        $checkSql = "SELECT estado FROM solicitud WHERE id_solicitud = $id LIMIT 1";
        $checkResult = $conexion->query($checkSql);
        $checkRow = $checkResult->fetch_assoc();
        error_log("DEBUG: Estado guardado en BD: " . ($checkRow['estado'] ?? 'NULL'));
        
        echo json_encode([
            'success' => true,
            'message' => 'Solicitud actualizada',
            'estado_guardado' => $checkRow['estado'] ?? 'NULL'
        ]);
    } else {
        error_log("DEBUG: Error en UPDATE: " . $conexion->error);
        echo json_encode([
            'success' => false,
            'error' => $conexion->error
        ]);
    }
}

function guardarRecordatorio() {
    global $conexion;
    
    // Verificar que la tabla exista
    $checkTable = $conexion->query("SHOW TABLES LIKE 'recordatorio'");
    if (!$checkTable || $checkTable->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Tabla recordatorio no existe. Ejecuta setup-recordatorios.php primero'
        ]);
        return;
    }
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    $titulo = isset($data['titulo']) ? $conexion->real_escape_string($data['titulo']) : '';
    $tipo = isset($data['tipo']) ? $conexion->real_escape_string($data['tipo']) : '';
    $fecha_prevista = isset($data['fecha_prevista']) ? $conexion->real_escape_string($data['fecha_prevista']) : '';
    $frecuencia = isset($data['frecuencia']) ? $conexion->real_escape_string($data['frecuencia']) : 'unica';
    $descripcion = isset($data['descripcion']) ? $conexion->real_escape_string($data['descripcion']) : '';
    
    // Validaciones
    if (empty($titulo)) {
        echo json_encode(['error' => 'Título es requerido', 'success' => false]);
        return;
    }
    if (empty($tipo)) {
        echo json_encode(['error' => 'Tipo es requerido', 'success' => false]);
        return;
    }
    if (empty($fecha_prevista)) {
        echo json_encode(['error' => 'Fecha y hora son requeridas', 'success' => false]);
        return;
    }
    if (empty($descripcion)) {
        echo json_encode(['error' => 'Descripción es requerida', 'success' => false]);
        return;
    }
    
    // Calcular próxima ejecución (inicialmente es la misma fecha)
    $proxima_ejecucion = $fecha_prevista;
    
    $sql = "INSERT INTO recordatorio 
            (titulo, tipo, fecha_prevista, frecuencia, descripcion, proxima_ejecucion, estado) 
            VALUES 
            ('$titulo', '$tipo', '$fecha_prevista', '$frecuencia', '$descripcion', '$proxima_ejecucion', 'activo')";
    
    if ($conexion->query($sql) === TRUE) {
        echo json_encode([
            'success' => true,
            'message' => '✓ Recordatorio programado correctamente',
            'id' => $conexion->insert_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Error BD: ' . $conexion->error,
            'debug' => $sql
        ]);
    }
}

function obtenerRecordatorios() {
    global $conexion;
    
    $filtro = isset($_GET['filtro']) ? $_GET['filtro'] : 'activos';
    
    // Por defecto mostrar solo activos (no mostrar cancelados)
    if ($filtro == 'activos') {
        $condicion = "WHERE estado = 'activo'";
    } elseif ($filtro == 'proximos') {
        $condicion = "WHERE estado = 'activo' AND proxima_ejecucion >= NOW()";
    } elseif ($filtro == 'todos') {
        // 'todos' también excluye cancelados para no mostrar papelera
        $condicion = "WHERE estado IN ('activo', 'completado')";
    } else {
        // Por defecto, mostrar solo activos
        $condicion = "WHERE estado = 'activo'";
    }
    
    $sql = "SELECT 
            id_recordatorio as id,
            titulo,
            tipo,
            DATE_FORMAT(fecha_prevista, '%Y-%m-%d %H:%i') as fecha_prevista,
            DATE_FORMAT(proxima_ejecucion, '%Y-%m-%d %H:%i') as proxima_ejecucion,
            frecuencia,
            descripcion,
            estado,
            creado_en,
            actualizado_en
            FROM recordatorio 
            $condicion
            ORDER BY proxima_ejecucion ASC";
    
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        echo json_encode([
            'error' => 'Error en la consulta: ' . $conexion->error
        ]);
        return;
    }
    
    $recordatorios = [];
    
    while ($fila = $resultado->fetch_assoc()) {
        $recordatorios[] = $fila;
    }
    
    echo json_encode($recordatorios);
}

function actualizarRecordatorio() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    $titulo = $conexion->real_escape_string($data['titulo'] ?? '');
    $tipo = $conexion->real_escape_string($data['tipo'] ?? '');
    $fecha_prevista = $conexion->real_escape_string($data['fecha_prevista'] ?? '');
    $frecuencia = $conexion->real_escape_string($data['frecuencia'] ?? 'unica');
    $descripcion = $conexion->real_escape_string($data['descripcion'] ?? '');
    $estado = $conexion->real_escape_string($data['estado'] ?? 'activo');
    
    if ($id <= 0) {
        echo json_encode(['error' => 'ID inválido']);
        return;
    }
    
    // Si cambia a completado, actualizar próxima ejecución según frecuencia
    $proxima_actualizacion = "";
    if ($estado == 'completado' && $data['frecuencia'] != 'unica') {
        // Calcular siguiente fecha según frecuencia
        $proxima_actualizacion = ", proxima_ejecucion = DATE_ADD('$fecha_prevista', INTERVAL 1 " . 
            match($frecuencia) {
                'diaria' => 'DAY',
                'semanal' => 'WEEK',
                'mensual' => 'MONTH',
                default => 'DAY'
            } . ")";
    }
    
    $sql = "UPDATE recordatorio 
            SET titulo = '$titulo',
                tipo = '$tipo',
                fecha_prevista = '$fecha_prevista',
                frecuencia = '$frecuencia',
                descripcion = '$descripcion',
                estado = '$estado'
                $proxima_actualizacion
            WHERE id_recordatorio = $id";
    
    if ($conexion->query($sql) === TRUE) {
        echo json_encode([
            'success' => true,
            'message' => 'Recordatorio actualizado'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $conexion->error
        ]);
    }
}

function eliminarRecordatorio() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    
    if ($id <= 0) {
        echo json_encode(['error' => 'ID inválido']);
        return;
    }
    
    // Cambiar a cancelado en lugar de eliminar (auditoría)
    $sql = "UPDATE recordatorio SET estado = 'cancelado' WHERE id_recordatorio = $id";
    
    if ($conexion->query($sql) === TRUE) {
        echo json_encode([
            'success' => true,
            'message' => 'Recordatorio eliminado'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $conexion->error
        ]);
    }
}

// ============================================
// FUNCIONES PARA GESTIÓN DE USUARIOS
// ============================================

function guardarUsuario() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validaciones
    if (!isset($data['nombre']) || empty($data['nombre'])) {
        echo json_encode(['error' => 'El nombre es requerido']);
        return;
    }
    
    if (!isset($data['email']) || empty($data['email'])) {
        echo json_encode(['error' => 'El email es requerido']);
        return;
    }
    
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['error' => 'El email no es válido']);
        return;
    }
    
    if (!isset($data['rol']) || empty($data['rol'])) {
        echo json_encode(['error' => 'El rol es requerido']);
        return;
    }
    
    // Verificar si el email ya existe
    $emailEscape = $conexion->real_escape_string($data['email']);
    $checkSql = "SELECT id_usuario FROM usuario WHERE email = '$emailEscape'";
    $result = $conexion->query($checkSql);
    
    if ($result && $result->num_rows > 0) {
        echo json_encode(['error' => 'El email ya está registrado']);
        return;
    }
    
    // Preparar datos
    $nombre = $conexion->real_escape_string($data['nombre']);
    $email = $emailEscape;
    $rol = $conexion->real_escape_string($data['rol']);
    
    $sql = "INSERT INTO usuario 
            (nombre, email, rol, creado_en) 
            VALUES 
            ('$nombre', '$email', '$rol', NOW())";
    
    if ($conexion->query($sql) === TRUE) {
        $id_usuario = $conexion->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado correctamente',
            'id_usuario' => $id_usuario
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Error al registrar usuario: ' . $conexion->error
        ]);
    }
}

function obtenerUsuarios() {
    global $conexion;
    
    $sql = "SELECT 
            id_usuario,
            nombre,
            email,
            rol,
            creado_en
            FROM usuario
            ORDER BY creado_en DESC";
    
    $result = $conexion->query($sql);
    
    if ($result) {
        $usuarios = array();
        while ($row = $result->fetch_assoc()) {
            $usuarios[] = $row;
        }
        echo json_encode($usuarios);
    } else {
        echo json_encode(['error' => $conexion->error]);
    }
}

function actualizarUsuario() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    error_log('DEBUG actualizarUsuario RECIBIDO: ' . json_encode($data));
    
    if (!isset($data['id_usuario']) || $data['id_usuario'] <= 0) {
        error_log('ERROR: ID inválido');
        echo json_encode(['error' => 'ID de usuario inválido']);
        return;
    }
    
    $id_usuario = (int)$data['id_usuario'];
    $nombre = isset($data['nombre']) ? $conexion->real_escape_string($data['nombre']) : null;
    $email = isset($data['email']) ? $conexion->real_escape_string($data['email']) : null;
    $rol = isset($data['rol']) ? $conexion->real_escape_string($data['rol']) : null;
    
    error_log('DEBUG valores: nombre=' . $nombre . ', email=' . $email . ', rol=' . $rol);
    
    // Verificar que el email no exista en otro usuario si se está actualizando
    if ($email) {
        $checkSql = "SELECT id_usuario FROM usuario WHERE email = '$email' AND id_usuario != $id_usuario";
        $result = $conexion->query($checkSql);
        if ($result && $result->num_rows > 0) {
            error_log('ERROR: Email ya en uso');
            echo json_encode(['error' => 'El email ya está en uso']);
            return;
        }
    }
    
    // Construir el UPDATE
    $updates = array();
    if ($nombre) $updates[] = "nombre = '$nombre'";
    if ($email) $updates[] = "email = '$email'";
    if ($rol !== null) $updates[] = "rol = '$rol'";  // Permitir rol vacío
    
    if (empty($updates)) {
        error_log('ERROR: No hay datos para actualizar');
        echo json_encode(['error' => 'No hay datos para actualizar']);
        return;
    }
    
    $updateStr = implode(', ', $updates);
    $sql = "UPDATE usuario SET $updateStr WHERE id_usuario = $id_usuario";
    
    error_log('DEBUG SQL: ' . $sql);
    
    if ($conexion->query($sql) === TRUE) {
        error_log('SUCCESS: Usuario actualizado');
        echo json_encode([
            'success' => true,
            'message' => 'Usuario actualizado correctamente'
        ]);
    } else {
        error_log('ERROR SQL: ' . $conexion->error);
        echo json_encode([
            'success' => false,
            'error' => 'Error al actualizar usuario: ' . $conexion->error
        ]);
    }
}

function eliminarUsuario() {
    global $conexion;
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['id_usuario']) || $data['id_usuario'] <= 0) {
        echo json_encode(['error' => 'ID de usuario inválido']);
        return;
    }
    
    $id_usuario = (int)$data['id_usuario'];
    
    // Eliminar usuario
    $sql = "DELETE FROM usuario WHERE id_usuario = $id_usuario";
    
    if ($conexion->query($sql) === TRUE) {
        echo json_encode([
            'success' => true,
            'message' => 'Usuario eliminado correctamente'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Error al eliminar usuario: ' . $conexion->error
        ]);
    }
}

// ==================== FUNCIONES DE REPORTES ====================

function reporteStock() {
    global $conexion;
    
    $filtro_medicamento = $_GET['medicamento'] ?? '';
    $filtro_estado = $_GET['estado'] ?? '';
    
    $sql = "SELECT 
                id_medicamento,
                nombre,
                categoria,
                stock,
                minimo_stock,
                precio,
                estado,
                fecha_vencimiento,
                actualizado_en
            FROM medicamento
            WHERE 1=1";
    
    if ($filtro_medicamento) {
        $filtro_medicamento = $conexion->real_escape_string($filtro_medicamento);
        $sql .= " AND nombre LIKE '%$filtro_medicamento%'";
    }
    
    if ($filtro_estado) {
        $filtro_estado = $conexion->real_escape_string($filtro_estado);
        $sql .= " AND estado = '$filtro_estado'";
    }
    
    $sql .= " ORDER BY nombre ASC";
    
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        echo json_encode(['error' => 'Error en query: ' . $conexion->error]);
        return;
    }
    
    $medicamentos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $medicamentos[] = $fila;
    }
    
    echo json_encode([
        'success' => true,
        'total' => count($medicamentos),
        'datos' => $medicamentos
    ]);
}

function reporteMovimientos() {
    global $conexion;
    
    $fecha_inicio = $_GET['fecha_inicio'] ?? '';
    $fecha_fin = $_GET['fecha_fin'] ?? '';
    $tipo_movimiento = $_GET['tipo'] ?? '';
    $id_medicamento = $_GET['medicamento'] ?? '';
    
    $sql = "SELECT 
                m.id_movimiento,
                m.tipo,
                m.fecha_hora,
                m.cantidad,
                m.descripcion,
                med.nombre as medicamento_nombre,
                med.id_medicamento,
                u.nombre as usuario_nombre
            FROM movimiento_inventario m
            LEFT JOIN medicamento med ON m.id_medicamento = med.id_medicamento
            LEFT JOIN usuario u ON m.id_usuario = u.id_usuario
            WHERE 1=1";
    
    if ($fecha_inicio) {
        $fecha_inicio = $conexion->real_escape_string($fecha_inicio);
        $sql .= " AND DATE(m.fecha_hora) >= '$fecha_inicio'";
    }
    
    if ($fecha_fin) {
        $fecha_fin = $conexion->real_escape_string($fecha_fin);
        $sql .= " AND DATE(m.fecha_hora) <= '$fecha_fin'";
    }
    
    if ($tipo_movimiento) {
        $tipo_movimiento = $conexion->real_escape_string($tipo_movimiento);
        $sql .= " AND m.tipo = '$tipo_movimiento'";
    }
    
    if ($id_medicamento) {
        $id_medicamento = (int)$id_medicamento;
        $sql .= " AND m.id_medicamento = $id_medicamento";
    }
    
    $sql .= " ORDER BY m.fecha_hora DESC";
    
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        echo json_encode(['error' => 'Error en query: ' . $conexion->error]);
        return;
    }
    
    $movimientos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $movimientos[] = $fila;
    }
    
    echo json_encode([
        'success' => true,
        'total' => count($movimientos),
        'datos' => $movimientos
    ]);
}

function reporteBajoStock() {
    global $conexion;
    
    $sql = "SELECT 
                id_medicamento,
                nombre,
                categoria,
                stock,
                minimo_stock,
                (minimo_stock - stock) as deficit,
                precio,
                estado,
                actualizado_en
            FROM medicamento
            WHERE stock > 0 AND stock <= minimo_stock AND estado = 'activo'
            ORDER BY deficit DESC, nombre ASC";
    
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        echo json_encode(['error' => 'Error en query: ' . $conexion->error]);
        return;
    }
    
    $medicamentos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $medicamentos[] = $fila;
    }
    
    echo json_encode([
        'success' => true,
        'total' => count($medicamentos),
        'datos' => $medicamentos
    ]);
}

function reporteDispensaciones() {
    global $conexion;
    
    $fecha_inicio = $_GET['fecha_inicio'] ?? '';
    $fecha_fin = $_GET['fecha_fin'] ?? '';
    $id_medicamento = $_GET['medicamento'] ?? '';
    
    $sql = "SELECT 
                d.id_dispensacion,
                d.fecha,
                d.cantidad,
                med.nombre as medicamento_nombre,
                med.id_medicamento,
                p.paciente,
                p.cedula,
                p.medico,
                p.numero_receta,
                u.nombre as usuario_nombre
            FROM dispensaciones d
            LEFT JOIN medicamento med ON d.id_medicamento = med.id_medicamento
            LEFT JOIN dispensacion disp ON d.id_medicamento = disp.id_medicamento
            LEFT JOIN usuario u ON disp.id_usuario_farmaceutico = u.id_usuario
            WHERE 1=1";
    
    if ($fecha_inicio) {
        $fecha_inicio = $conexion->real_escape_string($fecha_inicio);
        $sql .= " AND DATE(d.fecha) >= '$fecha_inicio'";
    }
    
    if ($fecha_fin) {
        $fecha_fin = $conexion->real_escape_string($fecha_fin);
        $sql .= " AND DATE(d.fecha) <= '$fecha_fin'";
    }
    
    if ($id_medicamento) {
        $id_medicamento = (int)$id_medicamento;
        $sql .= " AND d.id_medicamento = $id_medicamento";
    }
    
    $sql .= " ORDER BY d.fecha DESC";
    
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        echo json_encode(['error' => 'Error en query: ' . $conexion->error]);
        return;
    }
    
    $dispensaciones = [];
    while ($fila = $resultado->fetch_assoc()) {
        $dispensaciones[] = $fila;
    }
    
    echo json_encode([
        'success' => true,
        'total' => count($dispensaciones),
        'datos' => $dispensaciones
    ]);
}

function reporteAlertas() {
    global $conexion;
    
    $tipo_alerta = $_GET['tipo'] ?? '';
    $visto = $_GET['visto'] ?? '';
    $fecha_inicio = $_GET['fecha_inicio'] ?? '';
    
    $sql = "SELECT 
                a.id_alerta,
                a.tipo,
                a.fecha_generada,
                a.mensaje,
                a.visto,
                med.nombre as medicamento_nombre,
                med.id_medicamento
            FROM alerta a
            LEFT JOIN medicamento med ON a.id_medicamento = med.id_medicamento
            WHERE 1=1";
    
    if ($tipo_alerta) {
        $tipo_alerta = $conexion->real_escape_string($tipo_alerta);
        $sql .= " AND a.tipo = '$tipo_alerta'";
    }
    
    if ($visto !== '') {
        $visto = (int)$visto;
        $sql .= " AND a.visto = $visto";
    }
    
    if ($fecha_inicio) {
        $fecha_inicio = $conexion->real_escape_string($fecha_inicio);
        $sql .= " AND DATE(a.fecha_generada) >= '$fecha_inicio'";
    }
    
    $sql .= " ORDER BY a.fecha_generada DESC";
    
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        echo json_encode(['error' => 'Error en query: ' . $conexion->error]);
        return;
    }
    
    $alertas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $alertas[] = $fila;
    }
    
    echo json_encode([
        'success' => true,
        'total' => count($alertas),
        'datos' => $alertas
    ]);
}

$conexion->close();
