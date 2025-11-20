# 📚 Integración Módulo de Recetas ↔ Módulo de Médicos

## 🎯 Objetivo

Permitir que el **módulo de Recetas (Flask + MySQL)** se comunique con el **módulo de Médicos (PHP + XAMPP)** sin migrar ninguno de los dos sistemas. El usuario puede:

1. **Buscar un paciente** y ver su historial de recetas
2. **Crear una nueva receta** para ese paciente
3. **Seleccionar un médico** de la lista disponible en la base de datos del módulo de Médicos
4. **Guardar la receta** con el médico seleccionado

---

## 📁 Estructura de Archivos

### Módulo de Médicos (PHP/XAMPP)
```
modulos/medicos/
├── backend/
│   ├── config.php           ← Configuración DB (medidino_medicos)
│   ├── medicos.php          ← API GET/POST/PUT/DELETE para médicos
│   ├── especialidades.php
│   ├── horarios.php
│   └── ...
├── js/
│   ├── main.js
│   ├── registro-medico.js
│   └── ...
└── ...
```

### Módulo de Recetas (Flask/MySQL)
```
Medidino_recetas/
├── app.py                   ← Aplicación Flask
├── database/
│   ├── db.py               ← Conexión a MySQL (recetas)
│   ├── schema.sql
│   └── init_db.py
├── templates/
│   ├── nueva-receta.html   ← ✨ MODIFICADO: Ahora incluye select de médicos
│   ├── historial.html
│   └── index.html
├── js/
│   ├── config.js           ← ✨ NUEVO: Configuración centralizada de URLs
│   ├── nueva-receta.js     ← ✨ MODIFICADO: Carga médicos desde PHP
│   └── main.js
├── css/
│   └── ...
└── ...
```

---

## 🔌 ¿Cómo Funciona la Integración?

### Flujo de Comunicación

```
┌─────────────────────────────────────────────────────────────┐
│  NAVEGADOR (Cliente JavaScript)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
  ┌──────────────┐      ┌──────────────────────┐
  │  Flask       │      │  XAMPP (Médicos)     │
  │  :5000       │      │  /backend/medicos.php│
  │  (Recetas)   │      │  :80 (o puerto conf) │
  │              │      │                      │
  │ GET /        │      │ GET /medicos.php     │
  │ POST /api... │◄─────┤ Devuelve JSON:      │
  │              │      │ { success: true,    │
  │              │      │   data: [ {...} ]   │
  │              │      │ }                    │
  └──────────────┘      └──────────────────────┘
        │
        └──► MySQL (Recetas)
             localhost:3306
             BD: recetas
```

### Secuencia al Cargar la Página de Nueva Receta

1. **DOMContentLoaded en `nueva-receta.js`**
   - Se llama `cargarMedicosDesdePHP()`
   
2. **`cargarMedicosDesdePHP()` hace una petición GET**
   ```javascript
   fetch('http://localhost/Medidino_recetas/backend/medicos.php')
   ```

3. **Backend PHP (`medicos.php`) responde con:**
   ```json
   {
     "success": true,
     "message": "Médicos obtenidos correctamente",
     "data": [
       {
         "id_medico": 1,
         "nombre": "Roberto",
         "apellido": "Sánchez",
         "nombre_especialidad": "Medicina General"
       },
       {
         "id_medico": 2,
         "nombre": "María",
         "apellido": "López",
         "nombre_especialidad": "Cardiología"
       }
     ]
   }
   ```

4. **JavaScript rellena el `<select id="selectMedico">` con las opciones**

5. **Al generar la receta, se usa `id_medico` del médico seleccionado**
   - O si no elige, usa el médico logueado (`medicoActivo.id`)

---

## ⚙️ Instalación y Configuración

### Paso 1: Verificar que ambos módulos están corriendo

#### Para Módulo de Médicos (PHP/XAMPP)

1. **Abrir XAMPP Control Panel**
2. **Iniciar Apache y MySQL**
3. **Acceder a:** `http://localhost/phpmyadmin`
   - Base de datos: `medidino_medicos`
   - Tabla: `medicos` (con registros)

4. **Verificar que el API funciona:**
   ```bash
   # En el navegador, abrir:
   http://localhost/Medidino_recetas/backend/medicos.php
   ```
   Debe devolver JSON con la lista de médicos.

#### Para Módulo de Recetas (Flask/MySQL)

1. **Abrir terminal en `Medidino_recetas/`**
2. **Activar entorno virtual (si lo tienes):**
   ```bash
   venv\Scripts\activate  # Windows
   # o
   source venv/bin/activate  # Linux/Mac
   ```

3. **Instalar dependencias (si no están):**
   ```bash
   pip install flask flask-cors
   ```

4. **Ejecutar Flask:**
   ```bash
   python app.py
   ```
   Debe mostrar:
   ```
   * Running on http://127.0.0.1:5000
   ```

5. **Acceder a:** `http://localhost:5000/nueva-receta`

---

### Paso 2: Configurar la URL del API de Médicos

El archivo `js/config.js` detecta automáticamente si estás en desarrollo o producción y ajusta las URLs.

#### ⚡ Opción A: Desarrollo Local (por defecto)

Si XAMPP está en `http://localhost:80`, **no necesitas cambiar nada**. La configuración automática ya usa:
```javascript
'http://localhost/Medidino_recetas/backend/medicos.php'
```

#### 🔧 Opción B: XAMPP en puerto distinto

Si tu XAMPP está en un puerto diferente (ej: `8080`):

1. **Abre `js/config.js`**
2. **Busca la línea:**
   ```javascript
   return 'http://localhost/Medidino_recetas/backend/medicos.php';
   ```
3. **Cambia a:**
   ```javascript
   return 'http://localhost:8080/Medidino_recetas/backend/medicos.php';
   ```

#### 🌍 Opción C: Servidor Remoto (Producción)

1. **Abre `js/config.js`**
2. **En la parte de `else` (producción), cambia:**
   ```javascript
   // Antes:
   return 'http://localhost/Medidino_recetas/backend/medicos.php';
   
   // Después (ejemplo):
   return 'https://tusitio.com/api/medicos.php';
   // o
   return 'https://192.168.1.100:8443/backend/medicos.php';
   ```

---

### Paso 3: Verificar que la integración funciona

1. **Abre el navegador en:** `http://localhost:5000/nueva-receta`
2. **Abre la Consola del Navegador** (F12 → Consola)
3. **Busca los mensajes de log:**
   ```
   ✅ Cargados 5 médicos desde PHP
   ✅ Configuración de Medidino cargada
   📍 API Médicos: http://localhost/Medidino_recetas/backend/medicos.php
   ```
4. **Verifica el select de médicos:**
   - Debería mostrar la lista de médicos de la BD de `medidino_medicos`
   - Si ves "Error al cargar médicos" → revisar consola para ver qué falló

---

## 🛠️ Solución de Problemas

### ❌ Problema: "No se encontraron médicos"

**Causa:** No hay médicos en la tabla `medicos` de `medidino_medicos`

**Solución:**
1. **Abre phpMyAdmin:** `http://localhost/phpmyadmin`
2. **Ve a BD `medidino_medicos` → tabla `medicos`**
3. **Inserta un registro de prueba:**
   ```sql
   INSERT INTO medicos (nombre, apellido, email, numero_licencia, id_especialidad, estado_registro)
   VALUES ('Test', 'Doctor', 'test@example.com', 'LIC-001', 1, 'activo');
   ```

### ❌ Problema: "Error al cargar médicos"

**Causa:** Problema de CORS o la URL es incorrecta

**Solución:**
1. **Abre Consola del Navegador** (F12)
2. **Revisa el error exacto**
3. **Si es CORS:** Ya está habilitado en `backend/config.php` (header CORS)
4. **Si es URL incorrecta:** Verifica que `http://localhost/Medidino_recetas/backend/medicos.php` sea accesible

### ❌ Problema: "Timeout en la solicitud"

**Causa:** XAMPP no responde o está muy lento

**Solución:**
1. **Reinicia XAMPP**
2. **Verifica que Apache está corriendo** (color verde en XAMPP Control Panel)
3. **Intenta acceder directamente:** `http://localhost/Medidino_recetas/backend/medicos.php`

---

## 📋 Archivos Modificados/Creados

| Archivo | Cambio | Descripción |
|---------|--------|-------------|
| `js/config.js` | ✨ **NUEVO** | Configuración centralizada de URLs de APIs |
| `templates/nueva-receta.html` | ✨ **MODIFICADO** | Agregado `<select id="selectMedico">` |
| `js/nueva-receta.js` | ✨ **MODIFICADO** | Agregada función `cargarMedicosDesdePHP()` |

---

## 🔄 Uso de la Integración

### Para el Usuario (en la web)

1. **Ir a:** `/nueva-receta`
2. **Buscar paciente** por cédula
3. **En la sección de datos del paciente**, aparece un nuevo campo:
   > **Médico que Emite la Receta**
4. **Abrir el dropdown** (automáticamente cargado con médicos de XAMPP)
5. **Seleccionar un médico**
6. **Agregar medicamentos**
7. **Clickear "Generar Receta"**

### Para el Desarrollador (en el código)

**Si necesitas cambiar la URL de XAMPP:**

Edita `js/config.js`:
```javascript
const MEDICOS_CONFIG = {
    apiUrl: 'https://tu-servidor.com/Medidino_recetas/backend/medicos.php',
    timeout: 5000
};
```

**Si necesitas agregar más campos del médico al formulario:**

Edita `js/nueva-receta.js`, función `cargarMedicosDesdePHP()`:
```javascript
// Puedes acceder a más datos: m.cedula, m.genero, m.direccion, etc.
const especialidad = m.nombre_especialidad || '';
const telefono = m.telefono || '';
opt.textContent = `${nombreCompleto} (${especialidad}) - ${telefono}`;
```

---

## 🚀 Próximos Pasos (Opcional)

1. **Crear un proxy Flask** si hay problemas de CORS en producción
2. **Agregar autenticación** entre los módulos (OAuth2 o JWT)
3. **Sincronizar datos** de médicos a la BD de Recetas (caché)
4. **Crear un endpoint Flask** que delegue a PHP (abstracción)

---

## 📞 Soporte

Si encuentras errores:

1. **Revisa la Consola del Navegador** (F12)
2. **Comprueba que XAMPP está corriendo**
3. **Verifica la URL en `js/config.js`**
4. **Asegúrate que hay médicos en la BD `medidino_medicos`**

---

## 📝 Resumen

- ✅ **Módulo de Médicos** (PHP): Sigue funcionando en XAMPP
- ✅ **Módulo de Recetas** (Flask): Sigue funcionando en Flask
- ✅ **Comunicación**: JavaScript en el navegador obtiene médicos del API PHP
- ✅ **Flexibilidad**: URL configurable en `js/config.js`
- ✅ **Sin migración**: Ambos sistemas mantienen sus tecnologías originales

**¡Listo para usar!** 🎉
