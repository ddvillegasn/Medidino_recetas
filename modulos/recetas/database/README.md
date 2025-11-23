# 🦕 MediDino - Base de Datos SQLite

Base de datos SQLite para el sistema de gestión de recetas médicas MediDino.

## 📋 Estructura de la Base de Datos

La base de datos contiene las siguientes tablas:

### Tablas Principales

1. **PACIENTE** - Información de pacientes
2. **MEDICO** - Información de médicos
3. **USUARIO** - Usuarios del sistema
4. **MEDICAMENTO** - Catálogo de medicamentos
5. **RECETA** - Recetas médicas emitidas
6. **DETALLE_RECETA** - Detalles de medicamentos por receta
7. **INVENTARIO** - Control de inventario de medicamentos

### Tablas de Auditoría y Control

8. **REPORTE** - Reportes generados
9. **HISTORIAL_CAMBIO_RECETA** - Registro de cambios en recetas
10. **AUDITORIA** - Registro de acciones del sistema
11. **NOTIFICACION_RECETA** - Notificaciones a pacientes

## 🚀 Instalación

### Opción 1: Usando Python

1. Asegúrate de tener Python instalado (viene con SQLite3)
2. Ejecuta el script de inicialización:

```powershell
cd database
python init_db.py
```

Este script:
- ✅ Crea la base de datos `medidino.db`
- ✅ Ejecuta todas las tablas, índices, triggers y vistas
- ✅ Carga datos de ejemplo
- ✅ Verifica la integridad

### Opción 2: Usando SQLite directamente

Si tienes SQLite3 instalado:

```powershell
cd database
sqlite3 medidino.db < schema.sql
```

### Opción 3: Manual

1. Descarga SQLite desde https://sqlite.org/download.html
2. Ejecuta:

```powershell
sqlite3 medidino.db
.read schema.sql
.quit
```

## 📊 Datos de Ejemplo

La base de datos incluye datos iniciales:

- **5 Pacientes** de prueba
- **1 Médico** (Dr. Roberto Sánchez)
- **1 Usuario** administrador
- **5 Medicamentos** comunes
- **Inventario** inicial

### Credenciales por defecto

- **Usuario**: admin@medidino.com
- **Contraseña**: ⚠️ Cambiar el hash en producción

## 🔍 Consultas Útiles

### Ver todas las recetas con información completa

```sql
SELECT * FROM vista_recetas_completas;
```

### Ver inventario con alertas

```sql
SELECT * FROM vista_inventario_alertas;
```

### Buscar un paciente

```sql
SELECT * FROM PACIENTE WHERE identificacion = '1234567';
```

### Ver recetas de un paciente

```sql
SELECT 
    r.numero_receta,
    r.fecha_emision,
    r.estado,
    m.nombre AS medico
FROM RECETA r
JOIN MEDICO m ON r.id_medico = m.id_medico
WHERE r.id_paciente = (
    SELECT id_paciente FROM PACIENTE WHERE identificacion = '1234567'
);
```

### Ver detalle completo de una receta

```sql
SELECT * FROM vista_detalle_recetas 
WHERE numero_receta = 'RX-2025-00001';
```

## 🔧 Mantenimiento

### Verificar integridad

```sql
PRAGMA integrity_check;
```

### Ver tamaño de la base de datos

```sql
SELECT page_count * page_size as size 
FROM pragma_page_count(), pragma_page_size();
```

### Hacer respaldo

```powershell
# Copiar el archivo
cp medidino.db medidino_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db

# O usando SQLite
sqlite3 medidino.db ".backup medidino_backup.db"
```

### Vacuuming (optimizar espacio)

```sql
VACUUM;
```

## 📁 Archivos

```
database/
├── schema.sql          # Script de creación de la BD
├── init_db.py         # Script Python de inicialización
├── queries.sql        # Consultas de ejemplo
├── README.md          # Esta documentación
└── medidino.db        # Base de datos (se genera)
```

## 🔗 Relaciones

```
PACIENTE ─┬─→ RECETA ─┬─→ DETALLE_RECETA ←─ MEDICAMENTO
          └─→ NOTIFICACION_RECETA           │
                                            └─→ INVENTARIO
MEDICO ───→ RECETA

USUARIO ─┬─→ REPORTE
         ├─→ AUDITORIA
         └─→ HISTORIAL_CAMBIO_RECETA ←─ RECETA
```

## ⚡ Triggers Automáticos

1. **update_receta_timestamp** - Actualiza `fecha_modificacion` al modificar una receta
2. **audit_receta_update** - Registra en auditoría cada modificación de receta
3. **update_inventario_on_dispensa** - Registra cuando se dispensa una receta

## 👁️ Vistas Disponibles

1. **vista_recetas_completas** - Recetas con información de paciente y médico
2. **vista_inventario_alertas** - Medicamentos con stock bajo o próximos a vencer
3. **vista_detalle_recetas** - Detalle completo de recetas con medicamentos

## 🔒 Seguridad

- ✅ Foreign keys activadas (`PRAGMA foreign_keys = ON`)
- ✅ Constraints de CHECK para validar datos
- ✅ Índices para optimizar consultas
- ✅ Triggers para auditoría automática
- ⚠️ Cambiar password por defecto en producción

## 📝 Notas

- La base de datos usa **AUTOINCREMENT** para IDs
- Los campos de fecha usan **DATETIME** o **DATE**
- Las eliminaciones en cascada están configuradas donde corresponde
- Los timestamps se generan automáticamente

## 🆘 Solución de Problemas

### Error: "foreign key constraint failed"

Asegúrate de que las foreign keys estén activadas:

```sql
PRAGMA foreign_keys = ON;
```

### Error: "table already exists"

La tabla ya existe. Usa `DROP TABLE IF EXISTS` o elimina la base de datos y vuelve a crearla.

### No puedo eliminar un registro

Verifica las relaciones de foreign key. Puede que existan registros relacionados que deban eliminarse primero.

## 📞 Soporte

Para más información sobre SQLite:
- Documentación: https://sqlite.org/docs.html
- Tutorial: https://www.sqlitetutorial.net/

---

**Creado para MediDino** 🦕 | Gestión de Recetas Médicas
