-- MediDino Database Schema
-- SQLite Database Creation Script
-- Created: 2025-11-10

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- =====================================================
-- TABLA: PACIENTE
-- Descripción: Almacena información de los pacientes
-- =====================================================
CREATE TABLE IF NOT EXISTS PACIENTE (
    id_paciente INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    identificacion TEXT UNIQUE NOT NULL,
    edad INTEGER,
    genero TEXT CHECK(genero IN ('Masculino', 'Femenino', 'Otro')),
    direccion TEXT,
    telefono TEXT,
    correo TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: MEDICO
-- Descripción: Almacena información de los médicos
-- =====================================================
CREATE TABLE IF NOT EXISTS MEDICO (
    id_medico INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    identificacion TEXT UNIQUE NOT NULL,
    especialidad TEXT NOT NULL,
    correo TEXT UNIQUE,
    telefono TEXT,
    registro_profesional TEXT,
    activo BOOLEAN DEFAULT 1,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: USUARIO
-- Descripción: Almacena usuarios del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS USUARIO (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    rol TEXT CHECK(rol IN ('Administrador', 'Medico', 'Farmaceutico', 'Recepcionista')) NOT NULL,
    password_hash TEXT NOT NULL,
    activo BOOLEAN DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME
);

-- =====================================================
-- TABLA: MEDICAMENTO
-- Descripción: Catálogo de medicamentos
-- =====================================================
CREATE TABLE IF NOT EXISTS MEDICAMENTO (
    id_medicamento INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    principio_activo TEXT,
    presentacion TEXT,
    concentracion TEXT,
    laboratorio TEXT,
    activo BOOLEAN DEFAULT 1,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: RECETA
-- Descripción: Recetas médicas emitidas
-- =====================================================
CREATE TABLE IF NOT EXISTS RECETA (
    id_receta INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    observaciones TEXT,
    estado TEXT CHECK(estado IN ('Activa', 'Dispensada', 'Cancelada', 'Vencida')) DEFAULT 'Activa',
    id_paciente INTEGER NOT NULL,
    id_medico INTEGER NOT NULL,
    numero_receta TEXT UNIQUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME,
    FOREIGN KEY (id_paciente) REFERENCES PACIENTE(id_paciente) ON DELETE RESTRICT,
    FOREIGN KEY (id_medico) REFERENCES MEDICO(id_medico) ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: DETALLE_RECETA
-- Descripción: Detalles de medicamentos por receta
-- =====================================================
CREATE TABLE IF NOT EXISTS DETALLE_RECETA (
    id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
    id_receta INTEGER NOT NULL,
    id_medicamento INTEGER NOT NULL,
    dosis TEXT NOT NULL,
    frecuencia TEXT NOT NULL,
    duracion TEXT NOT NULL,
    cantidad INTEGER,
    indicaciones TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_receta) REFERENCES RECETA(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_medicamento) REFERENCES MEDICAMENTO(id_medicamento) ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: INVENTARIO
-- Descripción: Control de inventario de medicamentos
-- =====================================================
CREATE TABLE IF NOT EXISTS INVENTARIO (
    id_inventario INTEGER PRIMARY KEY AUTOINCREMENT,
    id_medicamento INTEGER NOT NULL,
    cantidad_actual INTEGER NOT NULL DEFAULT 0,
    cantidad_minima INTEGER DEFAULT 10,
    fecha_vencimiento DATE,
    ubicacion TEXT,
    lote TEXT,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_medicamento) REFERENCES MEDICAMENTO(id_medicamento) ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: REPORTE
-- Descripción: Reportes generados en el sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS REPORTE (
    id_reporte INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo TEXT CHECK(tipo IN ('Recetas', 'Inventario', 'Pacientes', 'Auditoria', 'Estadistico')) NOT NULL,
    formato TEXT CHECK(formato IN ('PDF', 'Excel', 'CSV')) DEFAULT 'PDF',
    id_usuario INTEGER NOT NULL,
    nombre_archivo TEXT,
    parametros TEXT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: HISTORIAL_CAMBIO_RECETA
-- Descripción: Registro de cambios en recetas
-- =====================================================
CREATE TABLE IF NOT EXISTS HISTORIAL_CAMBIO_RECETA (
    id_cambio INTEGER PRIMARY KEY AUTOINCREMENT,
    id_receta INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    campo_modificado TEXT NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    motivo TEXT,
    FOREIGN KEY (id_receta) REFERENCES RECETA(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: AUDITORIA
-- Descripción: Registro de acciones del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS AUDITORIA (
    id_auditoria INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    accion TEXT NOT NULL,
    fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
    detalle TEXT,
    tabla_afectada TEXT,
    id_registro_afectado INTEGER,
    ip_address TEXT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: NOTIFICACION_RECETA
-- Descripción: Notificaciones enviadas a pacientes
-- =====================================================
CREATE TABLE IF NOT EXISTS NOTIFICACION_RECETA (
    id_notificacion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_paciente INTEGER NOT NULL,
    id_receta INTEGER NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    canal TEXT CHECK(canal IN ('Email', 'SMS', 'WhatsApp', 'Sistema')) NOT NULL,
    estado TEXT CHECK(estado IN ('Pendiente', 'Enviada', 'Fallida', 'Leida')) DEFAULT 'Pendiente',
    mensaje TEXT,
    fecha_lectura DATETIME,
    FOREIGN KEY (id_paciente) REFERENCES PACIENTE(id_paciente) ON DELETE CASCADE,
    FOREIGN KEY (id_receta) REFERENCES RECETA(id_receta) ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para PACIENTE
CREATE INDEX IF NOT EXISTS idx_paciente_identificacion ON PACIENTE(identificacion);
CREATE INDEX IF NOT EXISTS idx_paciente_nombre ON PACIENTE(nombre);

-- Índices para MEDICO
CREATE INDEX IF NOT EXISTS idx_medico_identificacion ON MEDICO(identificacion);
CREATE INDEX IF NOT EXISTS idx_medico_especialidad ON MEDICO(especialidad);

-- Índices para USUARIO
CREATE INDEX IF NOT EXISTS idx_usuario_correo ON USUARIO(correo);
CREATE INDEX IF NOT EXISTS idx_usuario_rol ON USUARIO(rol);

-- Índices para RECETA
CREATE INDEX IF NOT EXISTS idx_receta_paciente ON RECETA(id_paciente);
CREATE INDEX IF NOT EXISTS idx_receta_medico ON RECETA(id_medico);
CREATE INDEX IF NOT EXISTS idx_receta_fecha ON RECETA(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_receta_estado ON RECETA(estado);
CREATE INDEX IF NOT EXISTS idx_receta_numero ON RECETA(numero_receta);

-- Índices para DETALLE_RECETA
CREATE INDEX IF NOT EXISTS idx_detalle_receta ON DETALLE_RECETA(id_receta);
CREATE INDEX IF NOT EXISTS idx_detalle_medicamento ON DETALLE_RECETA(id_medicamento);

-- Índices para INVENTARIO
CREATE INDEX IF NOT EXISTS idx_inventario_medicamento ON INVENTARIO(id_medicamento);
CREATE INDEX IF NOT EXISTS idx_inventario_vencimiento ON INVENTARIO(fecha_vencimiento);

-- Índices para AUDITORIA
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON AUDITORIA(id_usuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON AUDITORIA(fecha_accion);

-- Índices para NOTIFICACION_RECETA
CREATE INDEX IF NOT EXISTS idx_notificacion_paciente ON NOTIFICACION_RECETA(id_paciente);
CREATE INDEX IF NOT EXISTS idx_notificacion_receta ON NOTIFICACION_RECETA(id_receta);
CREATE INDEX IF NOT EXISTS idx_notificacion_estado ON NOTIFICACION_RECETA(estado);

-- =====================================================
-- DATOS INICIALES (SEED DATA)
-- =====================================================

-- Usuario administrador por defecto
INSERT OR IGNORE INTO USUARIO (id_usuario, nombre, correo, rol, password_hash, activo)
VALUES (1, 'Administrador', 'admin@medidino.com', 'Administrador', 'hash_temporal_cambiar', 1);

-- Médico de ejemplo
INSERT OR IGNORE INTO MEDICO (id_medico, nombre, identificacion, especialidad, correo, registro_profesional, activo)
VALUES (1, 'Dr. Roberto Sánchez', 'RM-12345', 'Medicina General', 'dr.sanchez@medidino.com', 'RM-12345', 1);

-- Pacientes de prueba (los mismos que tienes en tu código JavaScript)
INSERT OR IGNORE INTO PACIENTE (identificacion, nombre, edad, genero, telefono, correo, direccion)
VALUES 
    ('1234567', 'Juan Pérez García', 45, 'Masculino', '555-0101', 'juan.perez@email.com', 'Calle 123 #45-67'),
    ('2345678', 'María González López', 32, 'Femenino', '555-0202', 'maria.gonzalez@email.com', 'Carrera 89 #12-34'),
    ('3456789', 'Carlos Rodríguez', 58, 'Masculino', '555-0303', 'carlos.rodriguez@email.com', 'Avenida 45 #23-56'),
    ('4567890', 'Ana María Torres', 28, 'Femenino', '555-0404', 'ana.torres@email.com', 'Calle 67 #89-12'),
    ('5678901', 'Luis Fernando Castro', 41, 'Masculino', '555-0505', 'luis.castro@email.com', 'Carrera 34 #56-78');

-- Medicamentos de ejemplo
INSERT OR IGNORE INTO MEDICAMENTO (nombre, descripcion, principio_activo, presentacion, concentracion)
VALUES 
    ('Ibuprofeno', 'Antiinflamatorio y analgésico', 'Ibuprofeno', 'Tabletas', '400mg'),
    ('Paracetamol', 'Analgésico y antipirético', 'Paracetamol', 'Tabletas', '500mg'),
    ('Amoxicilina', 'Antibiótico', 'Amoxicilina', 'Cápsulas', '500mg'),
    ('Omeprazol', 'Inhibidor de bomba de protones', 'Omeprazol', 'Cápsulas', '20mg'),
    ('Losartán', 'Antihipertensivo', 'Losartán Potásico', 'Tabletas', '50mg');

-- Inventario inicial
INSERT OR IGNORE INTO INVENTARIO (id_medicamento, cantidad_actual, cantidad_minima, ubicacion, lote)
VALUES 
    (1, 100, 20, 'Estante A1', 'L2025001'),
    (2, 150, 30, 'Estante A2', 'L2025002'),
    (3, 80, 15, 'Estante B1', 'L2025003'),
    (4, 60, 10, 'Estante B2', 'L2025004'),
    (5, 90, 20, 'Estante C1', 'L2025005');

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para actualizar fecha_modificacion en RECETA
CREATE TRIGGER IF NOT EXISTS update_receta_timestamp
AFTER UPDATE ON RECETA
FOR EACH ROW
BEGIN
    UPDATE RECETA SET fecha_modificacion = CURRENT_TIMESTAMP
    WHERE id_receta = NEW.id_receta;
END;

-- Trigger para registrar cambios en auditoria cuando se modifica una receta
CREATE TRIGGER IF NOT EXISTS audit_receta_update
AFTER UPDATE ON RECETA
FOR EACH ROW
BEGIN
    INSERT INTO AUDITORIA (id_usuario, accion, detalle, tabla_afectada, id_registro_afectado)
    VALUES (1, 'UPDATE', 'Receta modificada: ' || NEW.numero_receta, 'RECETA', NEW.id_receta);
END;

-- Trigger para actualizar inventario al dispensar receta
CREATE TRIGGER IF NOT EXISTS update_inventario_on_dispensa
AFTER UPDATE OF estado ON RECETA
FOR EACH ROW
WHEN NEW.estado = 'Dispensada' AND OLD.estado != 'Dispensada'
BEGIN
    INSERT INTO AUDITORIA (id_usuario, accion, detalle, tabla_afectada, id_registro_afectado)
    VALUES (1, 'DISPENSAR', 'Receta dispensada: ' || NEW.numero_receta, 'RECETA', NEW.id_receta);
END;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Recetas con información completa
CREATE VIEW IF NOT EXISTS vista_recetas_completas AS
SELECT 
    r.id_receta,
    r.numero_receta,
    r.fecha_emision,
    r.estado,
    r.observaciones,
    p.nombre AS paciente_nombre,
    p.identificacion AS paciente_identificacion,
    m.nombre AS medico_nombre,
    m.especialidad AS medico_especialidad
FROM RECETA r
JOIN PACIENTE p ON r.id_paciente = p.id_paciente
JOIN MEDICO m ON r.id_medico = m.id_medico;

-- Vista: Inventario con alertas de stock bajo
CREATE VIEW IF NOT EXISTS vista_inventario_alertas AS
SELECT 
    i.id_inventario,
    med.nombre AS medicamento,
    i.cantidad_actual,
    i.cantidad_minima,
    i.fecha_vencimiento,
    i.ubicacion,
    i.lote,
    CASE 
        WHEN i.cantidad_actual <= i.cantidad_minima THEN 'STOCK BAJO'
        WHEN i.fecha_vencimiento <= DATE('now', '+30 days') THEN 'PROXIMO A VENCER'
        ELSE 'NORMAL'
    END AS alerta
FROM INVENTARIO i
JOIN MEDICAMENTO med ON i.id_medicamento = med.id_medicamento
WHERE i.cantidad_actual <= i.cantidad_minima 
   OR i.fecha_vencimiento <= DATE('now', '+30 days');

-- Vista: Detalle completo de recetas con medicamentos
CREATE VIEW IF NOT EXISTS vista_detalle_recetas AS
SELECT 
    r.numero_receta,
    r.fecha_emision,
    p.nombre AS paciente,
    m.nombre AS medico,
    med.nombre AS medicamento,
    dr.dosis,
    dr.frecuencia,
    dr.duracion,
    dr.indicaciones
FROM RECETA r
JOIN PACIENTE p ON r.id_paciente = p.id_paciente
JOIN MEDICO m ON r.id_medico = m.id_medico
JOIN DETALLE_RECETA dr ON r.id_receta = dr.id_receta
JOIN MEDICAMENTO med ON dr.id_medicamento = med.id_medicamento;

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

-- Verificar integridad
PRAGMA integrity_check;

-- Confirmar que foreign keys están activas
PRAGMA foreign_keys;
