# MediDino - Módulo de Recetas Médicas 💊

Sistema de gestión de recetas médicas para el proyecto MediDino.

## 📋 Descripción

Módulo completo para la gestión de recetas médicas que incluye:
- ✅ Creación rápida de recetas
- 🔍 Búsqueda y gestión avanzada de recetas
- 📊 Historial completo de recetas
- 👤 Búsqueda de pacientes
- 💊 Gestión de medicamentos y detalles

## 🚀 Características

### Nueva Receta (index.html)
- Búsqueda de paciente por cédula
- Formulario de creación rápida
- Validación de datos
- Generación automática de número de receta
- Botón de guardado con confirmación

### Gestión Completa (nueva-receta.html)
- Búsqueda avanzada de recetas
- Edición de recetas existentes
- Visualización de historial del paciente
- Redirección a módulo de registro de pacientes

### Historial (historial.html)
- Visualización completa del historial de recetas
- Filtros y búsqueda
- Información detallada de cada receta

## 📁 Estructura del Proyecto

```
Medidino_recetas/
├── index.html              # Nueva Receta (creación rápida)
├── nueva-receta.html       # Gestión Completa
├── historial.html          # Historial de Recetas
├── css/
│   ├── styles.css          # Estilos para index.html
│   ├── nueva-receta.css    # Estilos para gestión
│   └── historial.css       # Estilos para historial
├── js/
│   ├── main.js             # Funciones compartidas y sidebar
│   ├── nueva-receta.js     # Lógica de gestión
│   └── historial.js        # Lógica de historial
├── database/
│   ├── schema.sql          # Esquema de base de datos SQLite
│   ├── init_db.py          # Script de inicialización
│   ├── README.md           # Documentación de BD
│   └── queries.sql         # Consultas de ejemplo
└── README.md
```

## 🗄️ Base de Datos

El módulo utiliza SQLite con el siguiente esquema:

### Tablas Principales
- **PACIENTE**: Información de pacientes
- **MEDICO**: Información de médicos
- **USUARIO**: Sistema de usuarios
- **RECETA**: Recetas médicas
- **DETALLE_RECETA**: Detalles de medicamentos por receta
- **MEDICAMENTO**: Catálogo de medicamentos
- **INVENTARIO**: Control de stock
- **REPORTE**: Reportes del sistema
- **HISTORIAL_CAMBIO_RECETA**: Auditoría de cambios
- **AUDITORIA**: Log de acciones
- **NOTIFICACION_RECETA**: Alertas y notificaciones

### Configuración de la Base de Datos

1. **Inicializar la base de datos:**
   ```bash
   python database/init_db.py
   ```

2. **O crear manualmente:**
   ```bash
   sqlite3 database/medidino.db < database/schema.sql
   ```

Ver `database/README.md` para más detalles.

## 💻 Uso

### Inicio Rápido

1. Abre `index.html` en tu navegador para crear recetas rápidamente
2. Usa `nueva-receta.html` para gestión avanzada
3. Consulta `historial.html` para ver el historial completo

### Flujo de Trabajo

1. **Buscar Paciente**: Ingresa la cédula del paciente
2. **Completar Formulario**: Llena los datos de la receta
3. **Agregar Medicamentos**: Añade medicamentos con dosis y frecuencia
4. **Guardar**: Confirma y guarda la receta

### Navegación

El sidebar permite navegar entre:
- 📝 Nueva Receta
- 📋 Gestión Completa
- 📊 Historial

## 🔧 Funcionalidades Técnicas

### Validaciones
- Verificación de paciente registrado
- Validación de campos obligatorios
- Formato de fechas
- Control de medicamentos

### Seguridad
- Validación de datos de entrada
- Control de acceso por usuario
- Auditoría de cambios
- Historial de modificaciones

### Integración
- Redirección a módulo de registro de pacientes
- Sistema de notificaciones
- Gestión de inventario

## 🛠️ Tecnologías

- HTML5
- CSS3
- JavaScript (Vanilla)
- SQLite
- Python (para scripts de BD)

## 📝 Notas Importantes

- Los pacientes deben estar registrados previamente
- Si un paciente no existe, el sistema redirige al módulo de registro
- Las recetas generan números automáticos únicos
- Todos los cambios se auditan en la base de datos

## 🔄 Actualizaciones Recientes

- ✅ Formulario oculto hasta búsqueda de paciente
- ✅ Botón "Guardar Receta" implementado
- ✅ Redirección a módulo de registro
- ✅ Sidebar funcional en todas las páginas
- ✅ Variables JavaScript corregidas para evitar conflictos
- ✅ Esquema completo de base de datos SQLite

## 📄 Licencia

Proyecto MediDino - Sistema de Gestión Médica

## 👥 Contribución

Este módulo es parte del proyecto MediDino. Para contribuir, sigue las guías de desarrollo del proyecto principal.

---

**Versión**: 1.0.0  
**Última actualización**: 2024
