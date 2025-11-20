# 🔧 Guía Técnica - Integración Avanzada

## 📋 Contenidos

1. **Arquitectura Actual**
2. **API Response Esperado**
3. **Opciones Avanzadas** (Proxy, Caché, Autenticación)
4. **Debugging**

---

## 🏗️ Arquitectura Actual

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Cliente)                  │
│         JavaScript (HTML5, Fetch API)                   │
└────┬──────────────────────────────────────────────�──────┘
     │                                              │
     │ fetch('http://localhost:5000/...')         │ fetch('http://localhost/...')
     │                                              │
┌────▼──────────────────┐              ┌──────────▼───────┐
│    FLASK (Python)     │              │   XAMPP (PHP)    │
│    :5000              │              │   :80/:8080       │
│                       │              │                  │
│  app.py               │              │  backend/        │
│  ├── /               │              │  ├── medicos.php │
│  ├── /nueva-receta   │              │  ├── config.php  │
│  ├── /historial      │              │  └── ...         │
│  └── /api/...        │              │                  │
│                       │              │                  │
│ Conecta a:            │              │ Conecta a:       │
│ MySQL (Recetas)      │              │ MySQL (Médicos)  │
└────────┬──────────────┘              └──────────┬───────┘
         │                                        │
         │                                        │
    ┌────▼────────────────────────────────────────▼──┐
    │         MySQL 3306 (localhost)                 │
    ├─────────────────────────────────────────────────┤
    │ DB: recetas                │ DB: medidino_medicos│
    │  ├── pacientes             │  ├── medicos         │
    │  ├── recetas               │  ├── especialidades  │
    │  ├── detalles_receta       │  ├── horarios_lab... │
    │  └── ...                   │  └── ...             │
    └─────────────────────────────────────────────────┘
```

### Flujo de Datos al Crear una Receta

```
1. Usuario busca paciente
   └─► JavaScript → GET /api/pacientes (Flask)
       └─► Flask → SELECT FROM pacientes (MySQL Recetas)

2. Página se carga con medicamentos disponibles
   └─► JavaScript → GET /api/medicamentos (Flask)
       └─► Flask → SELECT FROM medicamentos (MySQL Recetas)

3. 🆕 Se cargan médicos disponibles (NUEVA INTEGRACIÓN)
   └─► JavaScript → GET /backend/medicos.php (XAMPP)
       └─► PHP → SELECT FROM medicos (MySQL Médicos)

4. Usuario selecciona médico y llena formulario
   └─► JavaScript → POST /api/recetas (Flask)
       ├─► id_paciente: 1 (de Flask/MySQL Recetas)
       ├─► id_medico: 2 (de XAMPP/MySQL Médicos)
       └─► Flask → INSERT INTO recetas (MySQL Recetas)
```

---

## 📨 API Response Esperado

### Endpoint: `GET /backend/medicos.php`

**Llamada:**
```javascript
fetch('http://localhost/Medidino_recetas/backend/medicos.php', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Médicos obtenidos correctamente",
  "data": [
    {
      "id_medico": 1,
      "nombre": "Roberto",
      "apellido": "Sánchez",
      "email": "roberto.sanchez@saludyvida.com",
      "telefono": "601-123-4567",
      "cedula": "12345678",
      "numero_licencia": "RM-12345",
      "id_especialidad": 1,
      "nombre_especialidad": "Medicina General",
      "experiencia_anos": 15,
      "estado_registro": "activo",
      "fecha_registro": "2025-01-15 10:30:00"
    },
    {
      "id_medico": 2,
      "nombre": "María",
      "apellido": "López",
      "email": "maria.lopez@saludyvida.com",
      "telefono": "602-234-5678",
      "cedula": "87654321",
      "numero_licencia": "RM-67890",
      "id_especialidad": 2,
      "nombre_especialidad": "Cardiología",
      "experiencia_anos": 10,
      "estado_registro": "activo",
      "fecha_registro": "2025-01-20 14:15:00"
    }
  ]
}
```

**Estructura esperada en JS:**
```javascript
const respuesta = await fetch(url).then(r => r.json());

// Acceso a datos:
respuesta.success         // true/false
respuesta.message         // Descripción
respuesta.data            // Array de médicos

respuesta.data[0].id_medico              // 1
respuesta.data[0].nombre                 // "Roberto"
respuesta.data[0].apellido               // "Sánchez"
respuesta.data[0].nombre_especialidad    // "Medicina General"
```

---

## 🚀 Opciones Avanzadas

### Opción 1: Proxy en Flask (Recomendado para Producción)

**Ventajas:**
- Manejo centralizado de URLs
- Autenticación entre módulos
- Caché de respuestas
- Control de CORS centralizado

**Desventajas:**
- Requiere código adicional en Flask

**Implementación:**

#### Paso 1: Crear `app_proxy.py` (en Medidino_recetas/)

```python
from flask import Flask, jsonify
import requests

app = Flask(__name__)

XAMPP_API_URL = 'http://localhost/Medidino_recetas/backend/medicos.php'

@app.route('/api/proxy/medicos', methods=['GET'])
def proxy_medicos():
    """
    Endpoint proxy en Flask que delega a PHP
    y maneja CORS automáticamente
    """
    try:
        # Llamar a PHP
        response = requests.get(XAMPP_API_URL, timeout=5)
        
        # Si PHP responde exitosamente, pasar al cliente
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Error en API PHP: {response.status_code}'
            }), response.status_code
            
    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'message': 'Timeout: API de Médicos no responde'
        }), 504
        
    except requests.exceptions.ConnectionError:
        return jsonify({
            'success': False,
            'message': 'Error de conexión: No se puede alcanzar API de Médicos'
        }), 503
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error inesperado: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

#### Paso 2: Modificar `js/config.js`

```javascript
// Usar proxy en Flask en lugar de acceso directo
const MEDICOS_CONFIG = {
    apiUrl: (function() {
        const isDevelopment = window.location.hostname === 'localhost';
        
        if (isDevelopment) {
            // Usar proxy Flask (requiere requests library: pip install requests)
            return 'http://localhost:5000/api/proxy/medicos';
        } else {
            // En producción, tu servidor tiene el proxy
            return 'https://tusitio.com/api/proxy/medicos';
        }
    })(),
    timeout: 5000
};
```

**Llamada en JS:**
```javascript
// La llamada sigue siendo la misma:
const resp = await fetch(MEDICOS_CONFIG.apiUrl);
const medicos = await resp.json();
// Pero ahora va a través de Flask, no directo a PHP
```

---

### Opción 2: Caché Local (Para Mejorar Performance)

**Ventajas:**
- No requiere nuevas llamadas a XAMPP cada vez
- Mejor performance
- Funciona offline

**Desventajas:**
- Datos pueden quedar desactualizados
- Requiere invalidación de caché

**Implementación:**

```javascript
// En js/nueva-receta.js, modificar cargarMedicosDesdePHP():

const CACHE_KEY = 'medicos_list_cache';
const CACHE_DURACION = 1000 * 60 * 5;  // 5 minutos

async function cargarMedicosDesdePHP() {
    const select = document.getElementById('selectMedico');
    if (!select) return;

    // 1. Verificar si hay caché válido
    const cacheData = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(CACHE_KEY + '_time');
    
    if (cacheData && cacheTime) {
        const ahora = Date.now();
        const cacheValido = (ahora - parseInt(cacheTime)) < CACHE_DURACION;
        
        if (cacheValido) {
            console.log('✅ Usando caché de médicos');
            const medicos = JSON.parse(cacheData);
            llenarSelectMedicos(select, medicos);
            return;
        }
    }

    // 2. Si no hay caché válido, hacer fetch
    select.innerHTML = '<option value="">Cargando médicos...</option>';

    try {
        const resp = await fetch(PHP_MEDICOS_API);
        const json = await resp.json();
        const medicos = json.data || [];

        // 3. Guardar en caché
        localStorage.setItem(CACHE_KEY, JSON.stringify(medicos));
        localStorage.setItem(CACHE_KEY + '_time', Date.now().toString());

        llenarSelectMedicos(select, medicos);
        console.log(`✅ Cargados ${medicos.length} médicos (nuevos)`);

    } catch (err) {
        console.error('Error:', err);
        select.innerHTML = '<option value="">Error al cargar</option>';
    }
}

function llenarSelectMedicos(select, medicos) {
    select.innerHTML = '<option value="">-- Seleccione un médico --</option>';
    
    medicos.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id_medico;
        const nombre = `${m.nombre} ${m.apellido}`;
        const especialidad = m.nombre_especialidad ? ` (${m.nombre_especialidad})` : '';
        opt.textContent = nombre + especialidad;
        select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
        medicoSeleccionadoExternamente = e.target.value ? parseInt(e.target.value) : null;
    });
}

// Limpiar caché cada 5 minutos:
setInterval(() => {
    const cacheTime = localStorage.getItem(CACHE_KEY + '_time');
    if (cacheTime) {
        const ahora = Date.now();
        if ((ahora - parseInt(cacheTime)) > CACHE_DURACION) {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_KEY + '_time');
            console.log('🗑️ Caché de médicos expirado');
        }
    }
}, 60000);  // Verificar cada minuto
```

---

### Opción 3: Autenticación entre Módulos

**Ventajas:**
- Seguridad: Solo aplicaciones autorizadas pueden acceder
- Control de acceso

**Implementación en PHP:**

```php
// backend/config.php - Modificar función obtener_medicos:

function obtener_medicos($conexion, $id_medico = null) {
    // Verificar token API (opcional, para seguridad)
    $token = isset($_GET['token']) ? $_GET['token'] : null;
    
    // En producción, validar el token aquí
    // if (!validar_token($token)) {
    //     http_response_code(401);
    //     echo respuesta(false, 'No autorizado');
    //     return;
    // }
    
    // ... resto del código
}
```

**Llamada desde JS con Token:**

```javascript
const PHP_API_TOKEN = 'tu-token-secreto-aqui';

const url = new URL(PHP_MEDICOS_API);
url.searchParams.append('token', PHP_API_TOKEN);

const resp = await fetch(url.toString());
```

---

## 🐛 Debugging

### Herramientas de Navegador

#### 1. Consola (F12 → Console)

```javascript
// Ver configuración:
console.log('API URL:', MEDICOS_CONFIG.apiUrl);

// Probar fetch manualmente:
fetch('http://localhost/Medidino_recetas/backend/medicos.php')
    .then(r => r.json())
    .then(d => console.table(d.data));
```

#### 2. Network (F12 → Network)

1. Abre Developer Tools
2. Ir a pestaña "Network"
3. Recargar la página
4. Buscar la petición a `medicos.php`
5. Verificar:
   - Status: 200
   - Response: JSON válido
   - Headers: Content-Type: application/json

#### 3. Storage (F12 → Storage)

```javascript
// Ver caché guardado:
const cache = localStorage.getItem('medicos_list_cache');
console.table(JSON.parse(cache));

// Limpiar caché:
localStorage.removeItem('medicos_list_cache');
localStorage.removeItem('medicos_list_cache_time');
```

---

### Comandos de Prueba desde Terminal

#### Probar API PHP con cURL

```bash
# Windows PowerShell:
Invoke-WebRequest -Uri "http://localhost/Medidino_recetas/backend/medicos.php" -Method GET

# Linux/Mac:
curl -X GET "http://localhost/Medidino_recetas/backend/medicos.php" -H "Content-Type: application/json"
```

#### Probar API Flask

```bash
# Crear médico (test):
curl -X POST "http://localhost:5000/api/pacientes" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","identificacion":"9999999"}'

# Listar recetas:
curl -X GET "http://localhost:5000/api/recetas"
```

---

### Logs Útiles

#### En Flask (terminal)

```
[2025-11-20 10:30:45] GET /api/pacientes 200
[2025-11-20 10:31:02] GET /nueva-receta 200
[2025-11-20 10:31:15] POST /api/recetas 201
```

#### En PHP (error_log)

```
[2025-11-20 10:30:45] Médicos obtenidos correctamente: 5 registros
[2025-11-20 10:31:02] Paciente no encontrado: 9999999
```

#### En Consola JS

```
✅ Cargados 5 médicos desde PHP
✅ Configuración de Medidino cargada
📍 API Médicos: http://localhost/Medidino_recetas/backend/medicos.php
```

---

## 📊 Monitoreo

### Verificar Salud de APIs

```javascript
// healthcheck.js
async function verificarSalud() {
    const resultados = {};

    // Verificar Flask
    try {
        const resp = await fetch('http://localhost:5000/', { timeout: 2000 });
        resultados.flask = resp.ok ? '✅ OK' : '❌ Error';
    } catch (e) {
        resultados.flask = '❌ No responde';
    }

    // Verificar PHP
    try {
        const resp = await fetch('http://localhost/Medidino_recetas/backend/medicos.php', { timeout: 2000 });
        resultados.php = resp.ok ? '✅ OK' : '❌ Error';
    } catch (e) {
        resultados.php = '❌ No responde';
    }

    console.table(resultados);
    return resultados;
}

// Usar:
await verificarSalud();
```

---

## 📚 Referencias

- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [PHP cURL for API calls](https://www.php.net/manual/en/book.curl.php)
- [Flask Blueprints](https://flask.palletsprojects.com/en/2.3.x/blueprints/)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**¡Integración lista para usar!** 🎉
