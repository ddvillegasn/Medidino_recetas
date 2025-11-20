# 🚀 Guía de Prueba Rápida - Integración Médicos

## ✅ Checklist de Verificación (5 minutos)

### 1️⃣ XAMPP Corriendo

```bash
# Windows - Abre XAMPP Control Panel
# Verifica:
- Apache: Verde/Running
- MySQL: Verde/Running
```

Accede a: **`http://localhost/phpmyadmin`**
- BD: `medidino_medicos`
- Tabla: `medicos` → Debe tener al menos 1 registro

---

### 2️⃣ Flask Corriendo

```bash
# Terminal en c:\Users\57322\Desktop\MediDinooo\Medidino_recetas

# Activar entorno (si existe)
venv\Scripts\activate

# Iniciar Flask
python app.py
```

Verás:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

---

### 3️⃣ Probar el API de Médicos Directamente

**En el navegador, abre:**
```
http://localhost/Medidino_recetas/backend/medicos.php
```

**Deberías ver JSON como:**
```json
{
  "success": true,
  "message": "Médicos obtenidos correctamente",
  "data": [
    {
      "id_medico": 1,
      "nombre": "Roberto",
      "apellido": "Sánchez",
      "email": "roberto@example.com",
      "numero_licencia": "RM-12345",
      "id_especialidad": 1,
      "nombre_especialidad": "Medicina General",
      "estado_registro": "activo",
      "fecha_registro": "2025-01-15 10:30:00"
    }
  ]
}
```

✅ Si ves esto → API PHP funciona correctamente

---

### 4️⃣ Probar la Integración en Flask

1. **Abre el navegador:** `http://localhost:5000/nueva-receta`

2. **Abre Consola** (F12 → Consola)

3. **Busca estos logs:**
   ```
   ✅ Cargados 5 médicos desde PHP
   ✅ Configuración de Medidino cargada
   📍 API Médicos: http://localhost/Medidino_recetas/backend/medicos.php
   ✅ Módulo de Gestión de Receta Médica cargado
   ```

4. **Verifica el select de médicos:**
   - Desplázate a la sección "Información del Paciente"
   - Busca un paciente (ej: cédula `1234567`)
   - Debajo de los datos del paciente, aparece el select:
     > **"Médico que Emite la Receta"** 
   - El select debe mostrar los médicos de XAMPP

✅ Si ves la lista de médicos → **¡Integración lista!**

---

## 🔍 Troubleshooting Rápido

### ❓ "No se encontraron médicos"

```sql
-- En phpMyAdmin, ejecuta:
SELECT * FROM medicos WHERE estado_registro = 'activo';

-- Si está vacío, inserta un test:
INSERT INTO medicos (nombre, apellido, email, numero_licencia, id_especialidad, estado_registro)
VALUES ('Test', 'Doctor', 'test@medical.com', 'TEST-001', 1, 'activo');
```

### ❓ "Error al cargar médicos" en consola

**Abre Consola (F12) y busca el error exacto.**

Opciones comunes:

**Opción A:** CORS Bloqueado
```
Access to fetch at 'http://localhost/...' from origin 'http://localhost:5000' 
has been blocked by CORS policy
```
→ Reinicia XAMPP, el header CORS ya está en `backend/config.php`

**Opción B:** URL Incorrecta
```
Failed to fetch
```
→ Verifica que `http://localhost/Medidino_recetas/backend/medicos.php` existe

**Opción C:** XAMPP No Responde
```
Timeout en la solicitud
```
→ Reinicia Apache en XAMPP Control Panel

---

## 🎬 Demo Completa (sin datos reales)

Si no quieres datos de la BD real, puedes ver el comportamiento en consola:

```javascript
// En Consola (F12), pega:

// Simular 3 médicos
const medicosMock = [
  { id_medico: 1, nombre: 'Roberto', apellido: 'Sánchez', nombre_especialidad: 'Medicina General' },
  { id_medico: 2, nombre: 'María', apellido: 'López', nombre_especialidad: 'Cardiología' },
  { id_medico: 3, nombre: 'Carlos', apellido: 'Gómez', nombre_especialidad: 'Neurología' }
];

// Mostrar en consola
console.table(medicosMock);

// Contar
console.log(`Total: ${medicosMock.length} médicos`);
```

Output:
```
┌─────────┬────────────┬───────────┬──────────────────────┐
│ (index) │ id_medico  │ nombre    │ nombre_especialidad  │
├─────────┼────────────┼───────────┼──────────────────────┤
│    0    │      1     │ Roberto   │ Medicina General     │
│    1    │      2     │ María     │ Cardiología          │
│    2    │      3     │ Carlos    │ Neurología           │
└─────────┴────────────┴───────────┴──────────────────────┘
```

---

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────┐
│  USUARIO ABRE: http://localhost:5000/nueva-receta      │
└──────────────────────────┬────────────────────────────┘
                           │
                ┌──────────▼───────────┐
                │ DOMContentLoaded     │
                │  en nueva-receta.js  │
                └──────────┬───────────┘
                           │
              ┌────────────▼──────────────┐
              │ cargarMedicosDesdePHP()   │
              └────────────┬──────────────┘
                           │
              ┌────────────▼──────────────────────────────┐
              │ fetch('http://localhost/Medidino_recetas  │
              │        /backend/medicos.php')             │
              └────────────┬──────────────────────────────┘
                           │
                ┌──────────▼──────────────┐
                │ API PHP responde       │
                │ { success: true,       │
                │   data: [médicos] }    │
                └──────────┬──────────────┘
                           │
              ┌────────────▼──────────────────────┐
              │ Llenar <select id="selectMedico"> │
              │ Con opciones de médicos           │
              └────────────┬──────────────────────┘
                           │
                    ✅ LISTO PARA USAR
```

---

## 💾 Datos de Prueba

### Pacientes de Prueba (Flask/MySQL)

Cédulas válidas en el módulo de Recetas:
- `1234567` → Ana María Pérez
- `2345678` → Juan Carlos García
- `3456789` → María Sofía Rodríguez

### Médicos de Prueba (PHP/XAMPP)

Deben estar en `medidino_medicos.medicos`:
```sql
SELECT id_medico, nombre, apellido, nombre_especialidad 
FROM medicos 
WHERE estado_registro = 'activo' 
LIMIT 5;
```

---

## ⏱️ Tiempo Estimado de Setup

| Tarea | Tiempo |
|-------|--------|
| Verificar XAMPP | 2 min |
| Verificar Flask | 1 min |
| Probar API PHP directo | 1 min |
| Verificar integración en web | 1 min |
| **TOTAL** | **~5 min** |

---

## ✨ ¿Qué Esperar?

### Antes (sin integración)
```
Formulario de Nueva Receta
└── Campo: Médico (hardcodeado: Dr. Roberto Sánchez)
```

### Ahora (con integración)
```
Formulario de Nueva Receta
└── Campo: Médico (Select con lista de XAMPP)
    ├── Dr. Roberto Sánchez - Medicina General
    ├── Dra. María López - Cardiología
    ├── Dr. Carlos Gómez - Neurología
    └── ... (todos los médicos activos de la BD)
```

---

¡**Listo para pruebas!** 🎉

Ante cualquier duda, revisa `INTEGRACION_MEDICOS.md`
