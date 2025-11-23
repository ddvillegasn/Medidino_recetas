/**
 * API Client - Conexión Frontend con Backend PHP
 * Funciones para conectar los formularios con la API
 */

// IMPORTANTE: Ajusta esta ruta según tu configuración local
// Si tu proyecto está en la raíz de htdocs, usa: http://localhost/backend
// Si está en una subcarpeta, usa: http://localhost/nombre-carpeta/backend
const API_URL = 'http://localhost/Medidino_recetas/backend';

// ==================== CONFIGURACIÓN ====================

const apiConfig = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// ==================== UTILIDADES ====================

/**
 * Mostrar mensajes de éxito
 */
function mostrarExito(mensaje) {
    alert('✓ ' + mensaje);
}

/**
 * Mostrar mensajes de error
 */
function mostrarError(mensaje) {
    alert('✗ Error: ' + mensaje);
}

/**
 * Mostrar mensaje de carga
 */
function mostrarCargando(elemento) {
    if (elemento) {
        elemento.innerHTML = '<p style="text-align: center; color: #1E88A8;">⏳ Cargando...</p>';
    }
}

/**
 * Mostrar mensaje sin datos
 */
function mostrarSinDatos(elemento) {
    if (elemento) {
        elemento.innerHTML = '<p style="text-align: center; color: #666;">No hay datos disponibles</p>';
    }
}

/**
 * Validar email
 */
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ==================== MÉDICOS ====================

/**
 * Obtener todos los médicos
 */
async function obtenerMedicos() {
    try {
        const respuesta = await fetch(`${API_URL}/medicos.php`, {
            method: 'GET',
            headers: apiConfig.headers
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            return datos.data;
        } else {
            mostrarError(datos.message);
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al conectar con el servidor: ' + error.message);
        return [];
    }
}

/**
 * Obtener un médico por ID
 */
async function obtenerMedicoPorId(id) {
    try {
        const respuesta = await fetch(`${API_URL}/medicos.php?id=${id}`, {
            method: 'GET',
            headers: apiConfig.headers
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            return datos.data;
        } else {
            mostrarError(datos.message);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al obtener médico: ' + error.message);
        return null;
    }
}

/**
 * Crear nuevo médico
 */
async function crearMedico(datosFormulario) {
    try {
        const respuesta = await fetch(`${API_URL}/medicos.php`, {
            method: 'POST',
            headers: apiConfig.headers,
            body: JSON.stringify(datosFormulario)
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            mostrarExito(datos.message);
            return true;
        } else {
            mostrarError(datos.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al registrar médico: ' + error.message);
        return false;
    }
}

/**
 * Actualizar médico
 */
async function actualizarMedico(id, datosFormulario) {
    try {
        const datosConId = { ...datosFormulario, id_medico: id };
        
        const respuesta = await fetch(`${API_URL}/medicos.php`, {
            method: 'PUT',
            headers: apiConfig.headers,
            body: JSON.stringify(datosConId)
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            mostrarExito(datos.message);
            return true;
        } else {
            mostrarError(datos.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar médico: ' + error.message);
        return false;
    }
}

/**
 * Eliminar (desactivar) médico
 */
async function eliminarMedico(id) {
    try {
        const respuesta = await fetch(`${API_URL}/medicos.php?id=${id}`, {
            method: 'DELETE',
            headers: apiConfig.headers
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            mostrarExito(datos.message);
            return true;
        } else {
            mostrarError(datos.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar médico: ' + error.message);
        return false;
    }
}

// ==================== ESPECIALIDADES ====================

/**
 * Obtener todas las especialidades
 */
async function obtenerEspecialidades() {
    try {
        console.log('Obteniendo especialidades desde:', `${API_URL}/especialidades.php`);
        
        const respuesta = await fetch(`${API_URL}/especialidades.php`, {
            method: 'GET',
            headers: apiConfig.headers
        });
        
        console.log('Respuesta status:', respuesta.status);
        
        if (!respuesta.ok) {
            throw new Error(`HTTP error! status: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        console.log('Datos recibidos:', datos);
        
        if (datos.success) {
            return datos.data;
        } else {
            console.error('Error en respuesta:', datos.message);
            return [];
        }
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        mostrarError('Error al cargar especialidades: ' + error.message);
        return [];
    }
}

/**
 * Llenar dropdown de especialidades
 */
async function llenarEspecialidades(selectId) {
    try {
        console.log('Intentando llenar especialidades en select:', selectId);
        
        const select = document.getElementById(selectId);
        
        if (!select) {
            console.error('Select no encontrado:', selectId);
            return;
        }
        
        console.log('Select encontrado, cargando especialidades...');
        
        // Mostrar mensaje de carga
        select.innerHTML = '<option value="">Cargando especialidades...</option>';
        select.disabled = true;
        
        const especialidades = await obtenerEspecialidades();
        
        console.log('Especialidades obtenidas:', especialidades);
        
        // Limpiar select
        select.innerHTML = '<option value="">-- Seleccione especialidad --</option>';
        
        if (especialidades && especialidades.length > 0) {
            especialidades.forEach(esp => {
                const option = document.createElement('option');
                option.value = esp.id_especialidad;
                option.textContent = esp.nombre_especialidad;
                select.appendChild(option);
            });
            console.log('Especialidades cargadas exitosamente:', especialidades.length);
        } else {
            console.warn('No se encontraron especialidades');
            select.innerHTML = '<option value="">No hay especialidades disponibles</option>';
        }
        
        select.disabled = false;
        
    } catch (error) {
        console.error('Error al llenar especialidades:', error);
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Error al cargar especialidades</option>';
            select.disabled = false;
        }
        mostrarError('Error al cargar especialidades: ' + error.message);
    }
}

// ==================== HORARIOS ====================

/**
 * Obtener horarios de un médico
 */
async function obtenerHorarios(idMedico) {
    try {
        const respuesta = await fetch(`${API_URL}/horarios.php?id_medico=${idMedico}`, {
            method: 'GET',
            headers: apiConfig.headers
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            return datos.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

/**
 * Obtener todos los horarios de todos los médicos
 */
async function obtenerTodosLosHorarios() {
    try {
        const respuesta = await fetch(`${API_URL}/horarios.php?todos=1`, {
            method: 'GET',
            headers: apiConfig.headers
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            return datos.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

/**
 * Crear horario
 */
async function crearHorario(datosHorario) {
    try {
        const respuesta = await fetch(`${API_URL}/horarios.php`, {
            method: 'POST',
            headers: apiConfig.headers,
            body: JSON.stringify(datosHorario)
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            mostrarExito(datos.message);
            return true;
        } else {
            mostrarError(datos.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al registrar horario: ' + error.message);
        return false;
    }
}

// ==================== REPORTES ====================

/**
 * Obtener estadísticas generales
 */
async function obtenerEstadisticasGenerales() {
    try {
        const respuesta = await fetch(`${API_URL}/reportes.php?tipo=general`, {
            method: 'GET',
            headers: apiConfig.headers
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            return datos.data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

/**
 * Obtener estadísticas de un médico
 */
async function obtenerEstadisticasMedico(idMedico) {
    try {
        const respuesta = await fetch(`${API_URL}/reportes.php?tipo=medico&id_medico=${idMedico}`, {
            method: 'GET',
            headers: apiConfig.headers
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            return datos.data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ==================== UTILIDADES PARA FORMULARIOS ====================

/**
 * Obtener datos del formulario
 */
function obtenerDatosFormulario(formularioId) {
    const formulario = document.getElementById(formularioId);
    
    if (!formulario) {
        console.error('Formulario no encontrado');
        return null;
    }
    
    const datos = new FormData(formulario);
    const objeto = {};
    
    datos.forEach((valor, clave) => {
        objeto[clave] = valor;
    });
    
    return objeto;
}

/**
 * Limpiar formulario
 */
function limpiarFormulario(formularioId) {
    const formulario = document.getElementById(formularioId);
    if (formulario) {
        formulario.reset();
    }
}

/**
 * Obtener parámetro de URL
 */
function obtenerParametroUrl(nombre) {
    const url = new URLSearchParams(window.location.search);
    return url.get(nombre);
}

// Exportar para uso global
window.apiClient = {
    // Médicos
    obtenerMedicos,
    obtenerMedicoPorId,
    crearMedico,
    actualizarMedico,
    eliminarMedico,
    
    // Especialidades
    obtenerEspecialidades,
    llenarEspecialidades,
    
    // Horarios
    obtenerHorarios,
    crearHorario,
    
    // Reportes
    obtenerEstadisticasGenerales,
    obtenerEstadisticasMedico,
    
    // Utilidades
    obtenerDatosFormulario,
    limpiarFormulario,
    obtenerParametroUrl,
    mostrarExito,
    mostrarError,
    mostrarCargando,
    mostrarSinDatos,
    validarEmail
};

console.log('API Client cargado correctamente');