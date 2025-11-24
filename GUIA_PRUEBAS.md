# 🎯 Guía de Prueba - Funcionalidades de Recetas Médicas

## ✅ Implementación Completada

Se han agregado las siguientes funcionalidades al módulo de recetas médicas:

### 📋 Funcionalidades Disponibles

1. **👁️ VER** - Visualizar detalles completos de una receta
2. **✏️ EDITAR** - Actualizar información de una receta existente
3. **🗑️ ELIMINAR** - Eliminar una receta del sistema

---

## 🧪 Cómo Probar las Funcionalidades

### Paso 1: Asegurarse de que el servidor esté corriendo

Abrir terminal y ejecutar:
```bash
python app.py
```

El servidor debe estar corriendo en: `http://127.0.0.1:5000`

---

### Paso 2: Acceder al Módulo de Recetas

Abrir en el navegador:
```
http://127.0.0.1:5000/nueva-receta
```

---

### Paso 3: Buscar un Paciente

1. En el campo "Buscar por Cédula/Identificación", ingresar un número de identificación
2. Hacer clic en el botón "Buscar" o presionar Enter
3. Se mostrará la información del paciente y su historial de recetas

---

### Paso 4: Probar las Funcionalidades

#### 👁️ VER DETALLES
- Ubicar una receta en el historial
- Hacer clic en el botón **"Ver"** (azul)
- Se abrirá un modal mostrando:
  - Información general
  - Datos del médico
  - Medicamentos prescritos con dosis, frecuencia y duración
  - Observaciones
  - Historial de cambios (si existe)

#### ✏️ EDITAR RECETA
- Ubicar una receta en el historial
- Hacer clic en el botón **"Editar"** (amarillo)
- El formulario se cargará con los datos de la receta
- Modificar los campos necesarios:
  - Observaciones
  - Estado (Activa, Dispensada, Cancelada, Vencida)
  - Medicamentos (agregar, modificar o eliminar)
- Hacer clic en "Guardar Receta"

#### 🗑️ ELIMINAR RECETA
- Ubicar una receta en el historial
- Hacer clic en el botón **"Eliminar"** (rojo)
- Aparecerá un mensaje de confirmación
- Confirmar la eliminación
- La receta se eliminará y el historial se actualizará automáticamente

---

## 🔧 Página de Prueba de Endpoints

Para probar directamente los endpoints sin interfaz:

```
http://127.0.0.1:5000/test-endpoints
```

Esta página permite:
- Listar todas las recetas
- Obtener una receta por ID
- Actualizar una receta (PUT)
- Eliminar una receta (DELETE)

---

## 📊 Endpoints Implementados

### GET `/api/recetas`
Lista todas las recetas o filtra por identificación de paciente

### GET `/api/recetas/<id>`
Obtiene los detalles de una receta específica

### PUT `/api/recetas/<id>`
Actualiza una receta existente
```json
{
  "observaciones": "Nuevas observaciones",
  "estado": "Activa",
  "detalles": [...]
}
```

### DELETE `/api/recetas/<id>`
Elimina una receta y todos sus detalles asociados

---

## ⚠️ Notas Importantes

1. **Base de Datos**: Los cambios se guardan en la base de datos SQLite (`medidino.db`)
2. **Transacciones**: Las operaciones de actualización y eliminación usan transacciones para mantener la integridad
3. **Confirmación**: La eliminación requiere confirmación del usuario
4. **Notificaciones**: Se muestran mensajes visuales de éxito o error
5. **Recarga automática**: Después de eliminar, el historial se recarga automáticamente

---

## 🎨 Estilos de Botones

Los botones en el historial tienen colores distintivos:

- 🔵 **VER** (azul) - `#E3F2FD` → `#1976D2` (hover)
- 🟡 **EDITAR** (amarillo) - `#FFF9E6` → `#F9A825` (hover)
- 🔴 **ELIMINAR** (rojo) - `#FFEBEE` → `#D32F2F` (hover)

---

## 🐛 Solución de Problemas

### El botón de eliminar no aparece
- Verificar que `nueva-receta.js` está cargado correctamente
- Revisar la consola del navegador (F12) en busca de errores
- Limpiar caché del navegador (Ctrl + Shift + R)

### Error al eliminar
- Verificar que el servidor Flask esté corriendo
- Revisar la consola del servidor para ver errores
- Verificar que la receta existe en la base de datos

### Los cambios no se reflejan
- Hacer hard refresh (Ctrl + Shift + R)
- Verificar que no hay errores en la consola
- Reiniciar el servidor Flask

---

## ✅ Checklist de Verificación

- [ ] Servidor Flask corriendo en puerto 5000
- [ ] Base de datos MySQL disponible (farmacia, medidino_medicos)
- [ ] Página carga sin errores en consola
- [ ] Botón "Ver" funciona y muestra modal
- [ ] Botón "Editar" carga el formulario correctamente
- [ ] Botón "Eliminar" pide confirmación y elimina la receta
- [ ] Historial se actualiza después de eliminar
- [ ] Notificaciones aparecen correctamente

---

## 📝 Archivos Modificados

1. `app.py` - Nuevos endpoints PUT y DELETE
2. `database/db.py` - Funciones actualizar_receta_con_detalles y eliminar_receta
3. `js/nueva-receta.js` - Función eliminarReceta y botón en historial
4. `css/nueva-receta.css` - Estilos para botón eliminar
5. `test_endpoints.html` - Página de prueba de endpoints (nuevo)

---

Última actualización: 23 de noviembre de 2025
