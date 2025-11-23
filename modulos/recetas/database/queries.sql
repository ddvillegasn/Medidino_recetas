-- =====================================================
-- CONSULTAS DE EJEMPLO PARA MEDIDINO
-- Queries comunes para gestión de recetas médicas
-- =====================================================

-- =====================================================
-- CONSULTAS DE PACIENTES
-- =====================================================

-- 1. Buscar paciente por identificación
SELECT * FROM PACIENTE 
WHERE identificacion = '1234567';

-- 2. Listar todos los pacientes activos
SELECT 
    identificacion,
    nombre,
    edad,
    genero,
    telefono,
    correo
FROM PACIENTE
ORDER BY nombre;

-- 3. Buscar pacientes por nombre (parcial)
SELECT * FROM PACIENTE 
WHERE nombre LIKE '%María%'
ORDER BY nombre;

-- 4. Contar pacientes por género
SELECT 
    genero,
    COUNT(*) as total
FROM PACIENTE
GROUP BY genero;

-- =====================================================
-- CONSULTAS DE RECETAS
-- =====================================================

-- 5. Listar recetas activas
SELECT 
    r.numero_receta,
    r.fecha_emision,
    p.nombre AS paciente,
    m.nombre AS medico,
    r.observaciones
FROM RECETA r
JOIN PACIENTE p ON r.id_paciente = p.id_paciente
JOIN MEDICO m ON r.id_medico = m.id_medico
WHERE r.estado = 'Activa'
ORDER BY r.fecha_emision DESC;

-- 6. Historial de recetas de un paciente
SELECT 
    r.numero_receta,
    r.fecha_emision,
    r.estado,
    m.nombre AS medico,
    m.especialidad,
    r.observaciones
FROM RECETA r
JOIN MEDICO m ON r.id_medico = m.id_medico
WHERE r.id_paciente = (
    SELECT id_paciente FROM PACIENTE WHERE identificacion = '1234567'
)
ORDER BY r.fecha_emision DESC;

-- 7. Recetas emitidas hoy
SELECT 
    r.numero_receta,
    p.nombre AS paciente,
    m.nombre AS medico,
    r.estado
FROM RECETA r
JOIN PACIENTE p ON r.id_paciente = p.id_paciente
JOIN MEDICO m ON r.id_medico = m.id_medico
WHERE DATE(r.fecha_emision) = DATE('now')
ORDER BY r.fecha_emision DESC;

-- 8. Detalle completo de una receta específica
SELECT 
    r.numero_receta,
    r.fecha_emision,
    r.estado,
    p.nombre AS paciente,
    p.identificacion,
    m.nombre AS medico,
    m.especialidad,
    med.nombre AS medicamento,
    dr.dosis,
    dr.frecuencia,
    dr.duracion,
    dr.indicaciones,
    r.observaciones
FROM RECETA r
JOIN PACIENTE p ON r.id_paciente = p.id_paciente
JOIN MEDICO m ON r.id_medico = m.id_medico
LEFT JOIN DETALLE_RECETA dr ON r.id_receta = dr.id_receta
LEFT JOIN MEDICAMENTO med ON dr.id_medicamento = med.id_medicamento
WHERE r.numero_receta = 'RX-2025-00001';

-- 9. Recetas por estado
SELECT 
    estado,
    COUNT(*) as total,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM RECETA) as porcentaje
FROM RECETA
GROUP BY estado
ORDER BY total DESC;

-- 10. Recetas del mes actual
SELECT 
    r.numero_receta,
    r.fecha_emision,
    p.nombre AS paciente,
    m.nombre AS medico
FROM RECETA r
JOIN PACIENTE p ON r.id_paciente = p.id_paciente
JOIN MEDICO m ON r.id_medico = m.id_medico
WHERE strftime('%Y-%m', r.fecha_emision) = strftime('%Y-%m', 'now')
ORDER BY r.fecha_emision DESC;

-- =====================================================
-- CONSULTAS DE MEDICAMENTOS E INVENTARIO
-- =====================================================

-- 11. Medicamentos más recetados
SELECT 
    med.nombre,
    med.concentracion,
    COUNT(dr.id_detalle) as veces_recetado
FROM MEDICAMENTO med
LEFT JOIN DETALLE_RECETA dr ON med.id_medicamento = dr.id_medicamento
GROUP BY med.id_medicamento
ORDER BY veces_recetado DESC
LIMIT 10;

-- 12. Inventario con stock bajo
SELECT 
    m.nombre AS medicamento,
    m.concentracion,
    i.cantidad_actual,
    i.cantidad_minima,
    i.ubicacion,
    (i.cantidad_actual - i.cantidad_minima) AS diferencia
FROM INVENTARIO i
JOIN MEDICAMENTO m ON i.id_medicamento = m.id_medicamento
WHERE i.cantidad_actual <= i.cantidad_minima
ORDER BY diferencia ASC;

-- 13. Medicamentos próximos a vencer (30 días)
SELECT 
    m.nombre AS medicamento,
    i.cantidad_actual,
    i.fecha_vencimiento,
    i.lote,
    i.ubicacion,
    JULIANDAY(i.fecha_vencimiento) - JULIANDAY('now') AS dias_restantes
FROM INVENTARIO i
JOIN MEDICAMENTO m ON i.id_medicamento = m.id_medicamento
WHERE i.fecha_vencimiento <= DATE('now', '+30 days')
ORDER BY i.fecha_vencimiento ASC;

-- 14. Inventario completo con alertas
SELECT * FROM vista_inventario_alertas
ORDER BY 
    CASE alerta
        WHEN 'STOCK BAJO' THEN 1
        WHEN 'PROXIMO A VENCER' THEN 2
        ELSE 3
    END;

-- =====================================================
-- CONSULTAS DE MÉDICOS
-- =====================================================

-- 15. Recetas por médico (estadísticas)
SELECT 
    m.nombre AS medico,
    m.especialidad,
    COUNT(r.id_receta) AS total_recetas,
    COUNT(CASE WHEN r.estado = 'Activa' THEN 1 END) AS activas,
    COUNT(CASE WHEN r.estado = 'Dispensada' THEN 1 END) AS dispensadas
FROM MEDICO m
LEFT JOIN RECETA r ON m.id_medico = r.id_medico
GROUP BY m.id_medico
ORDER BY total_recetas DESC;

-- 16. Actividad de un médico específico
SELECT 
    DATE(r.fecha_emision) AS fecha,
    COUNT(*) AS recetas_emitidas
FROM RECETA r
WHERE r.id_medico = 1
GROUP BY DATE(r.fecha_emision)
ORDER BY fecha DESC
LIMIT 30;

-- =====================================================
-- CONSULTAS DE AUDITORÍA
-- =====================================================

-- 17. Últimas acciones en el sistema
SELECT 
    a.fecha_accion,
    u.nombre AS usuario,
    a.accion,
    a.detalle,
    a.tabla_afectada
FROM AUDITORIA a
JOIN USUARIO u ON a.id_usuario = u.id_usuario
ORDER BY a.fecha_accion DESC
LIMIT 50;

-- 18. Historial de cambios de una receta
SELECT 
    h.fecha_cambio,
    u.nombre AS usuario,
    h.campo_modificado,
    h.valor_anterior,
    h.valor_nuevo,
    h.motivo
FROM HISTORIAL_CAMBIO_RECETA h
JOIN USUARIO u ON h.id_usuario = u.id_usuario
JOIN RECETA r ON h.id_receta = r.id_receta
WHERE r.numero_receta = 'RX-2025-00001'
ORDER BY h.fecha_cambio DESC;

-- 19. Acciones por usuario
SELECT 
    u.nombre AS usuario,
    u.rol,
    COUNT(a.id_auditoria) AS acciones
FROM USUARIO u
LEFT JOIN AUDITORIA a ON u.id_usuario = a.id_usuario
GROUP BY u.id_usuario
ORDER BY acciones DESC;

-- =====================================================
-- CONSULTAS DE NOTIFICACIONES
-- =====================================================

-- 20. Notificaciones pendientes
SELECT 
    n.fecha_envio,
    p.nombre AS paciente,
    p.telefono,
    p.correo,
    r.numero_receta,
    n.canal,
    n.estado
FROM NOTIFICACION_RECETA n
JOIN PACIENTE p ON n.id_paciente = p.id_paciente
JOIN RECETA r ON n.id_receta = r.id_receta
WHERE n.estado = 'Pendiente'
ORDER BY n.fecha_envio ASC;

-- 21. Estadísticas de notificaciones
SELECT 
    canal,
    estado,
    COUNT(*) AS total
FROM NOTIFICACION_RECETA
GROUP BY canal, estado
ORDER BY canal, total DESC;

-- =====================================================
-- CONSULTAS AVANZADAS
-- =====================================================

-- 22. Pacientes sin recetas recientes (más de 6 meses)
SELECT 
    p.nombre,
    p.identificacion,
    p.telefono,
    MAX(r.fecha_emision) AS ultima_receta
FROM PACIENTE p
LEFT JOIN RECETA r ON p.id_paciente = r.id_paciente
GROUP BY p.id_paciente
HAVING ultima_receta IS NULL 
    OR ultima_receta < DATE('now', '-6 months')
ORDER BY ultima_receta DESC;

-- 23. Reporte de actividad mensual
SELECT 
    strftime('%Y-%m', r.fecha_emision) AS mes,
    COUNT(DISTINCT r.id_receta) AS total_recetas,
    COUNT(DISTINCT r.id_paciente) AS pacientes_atendidos,
    COUNT(DISTINCT r.id_medico) AS medicos_activos
FROM RECETA r
GROUP BY strftime('%Y-%m', r.fecha_emision)
ORDER BY mes DESC
LIMIT 12;

-- 24. Medicamentos nunca recetados
SELECT 
    m.nombre,
    m.descripcion,
    m.concentracion
FROM MEDICAMENTO m
LEFT JOIN DETALLE_RECETA dr ON m.id_medicamento = dr.id_medicamento
WHERE dr.id_detalle IS NULL
    AND m.activo = 1
ORDER BY m.nombre;

-- 25. Valor del inventario (si tuvieras precios)
-- Nota: Para esta query necesitarías agregar un campo 'precio_unitario' a INVENTARIO
SELECT 
    m.nombre,
    i.cantidad_actual,
    i.ubicacion
    -- , i.precio_unitario * i.cantidad_actual AS valor_total
FROM INVENTARIO i
JOIN MEDICAMENTO m ON i.id_medicamento = m.id_medicamento
ORDER BY i.cantidad_actual DESC;

-- =====================================================
-- CONSULTAS PARA REPORTES
-- =====================================================

-- 26. Dashboard principal (resumen general)
SELECT 
    (SELECT COUNT(*) FROM PACIENTE) AS total_pacientes,
    (SELECT COUNT(*) FROM RECETA WHERE estado = 'Activa') AS recetas_activas,
    (SELECT COUNT(*) FROM INVENTARIO WHERE cantidad_actual <= cantidad_minima) AS stock_bajo,
    (SELECT COUNT(*) FROM NOTIFICACION_RECETA WHERE estado = 'Pendiente') AS notificaciones_pendientes;

-- 27. Recetas agrupadas por mes y estado
SELECT 
    strftime('%Y-%m', fecha_emision) AS mes,
    estado,
    COUNT(*) AS cantidad
FROM RECETA
WHERE fecha_emision >= DATE('now', '-12 months')
GROUP BY strftime('%Y-%m', fecha_emision), estado
ORDER BY mes DESC, estado;

-- 28. Top 5 medicamentos por especialidad médica
SELECT 
    m.especialidad,
    med.nombre AS medicamento,
    COUNT(dr.id_detalle) AS veces_recetado
FROM RECETA r
JOIN MEDICO m ON r.id_medico = m.id_medico
JOIN DETALLE_RECETA dr ON r.id_receta = dr.id_receta
JOIN MEDICAMENTO med ON dr.id_medicamento = med.id_medicamento
GROUP BY m.especialidad, med.id_medicamento
ORDER BY m.especialidad, veces_recetado DESC
LIMIT 25;

-- =====================================================
-- CONSULTAS DE MANTENIMIENTO
-- =====================================================

-- 29. Verificar integridad referencial
SELECT 
    'Recetas huérfanas (sin paciente)' AS problema,
    COUNT(*) AS cantidad
FROM RECETA r
LEFT JOIN PACIENTE p ON r.id_paciente = p.id_paciente
WHERE p.id_paciente IS NULL
UNION ALL
SELECT 
    'Recetas huérfanas (sin médico)' AS problema,
    COUNT(*) AS cantidad
FROM RECETA r
LEFT JOIN MEDICO m ON r.id_medico = m.id_medico
WHERE m.id_medico IS NULL
UNION ALL
SELECT 
    'Detalles huérfanos (sin receta)' AS problema,
    COUNT(*) AS cantidad
FROM DETALLE_RECETA dr
LEFT JOIN RECETA r ON dr.id_receta = r.id_receta
WHERE r.id_receta IS NULL;

-- 30. Estadísticas de la base de datos
SELECT 
    'Tablas' AS tipo,
    COUNT(*) AS cantidad
FROM sqlite_master 
WHERE type = 'table'
UNION ALL
SELECT 
    'Vistas' AS tipo,
    COUNT(*) AS cantidad
FROM sqlite_master 
WHERE type = 'view'
UNION ALL
SELECT 
    'Índices' AS tipo,
    COUNT(*) AS cantidad
FROM sqlite_master 
WHERE type = 'index'
UNION ALL
SELECT 
    'Triggers' AS tipo,
    COUNT(*) AS cantidad
FROM sqlite_master 
WHERE type = 'trigger';
