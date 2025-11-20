/**
 * ============================================
 * CONFIGURACIÓN CENTRALIZADA - MEDIDINO
 * ============================================
 * 
 * Este archivo contiene las URLs de los APIs 
 * y configuraciones para diferentes módulos
 * de la aplicación Medidino.
 * 
 * Modificar estas URLs según el entorno:
 * - DESARROLLO: localhost
 * - PRODUCCIÓN: URL del servidor remoto
 */

// ============================================
// 1. CONFIGURACIÓN DEL MÓDULO DE MÉDICOS (PHP/XAMPP)
// ============================================
// El módulo de Médicos está en PHP con XAMPP.
// Desde la aplicación Flask de Recetas, nos comunicamos 
// vía HTTP para obtener la lista de médicos disponibles.

const MEDICOS_CONFIG = {
    // URL base del servidor XAMPP
    // CAMBIAR según donde esté desplegado el módulo de médicos
    apiUrl: (function() {
        const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
            // En desarrollo: asumir XAMPP corriendo en localhost:80 (puerto por defecto)
            // O si está en otro puerto, ajustar aquí
            return 'http://localhost/Medidino_recetas/backend/medicos.php';
            // Alternativas:
            // return 'http://localhost:8080/Medidino_recetas/backend/medicos.php'; // Si XAMPP está en puerto 8080
            // return 'http://127.0.0.1/Medidino_recetas/backend/medicos.php';
        } else {
            // En producción: URL del servidor remoto
            // Ejemplo: return 'https://tusitio.com/Medidino_recetas/backend/medicos.php';
            return 'http://localhost/Medidino_recetas/backend/medicos.php'; // Ajustar para producción
        }
    })(),

    // Timeout de solicitud en milisegundos
    timeout: 5000
};

// ============================================
// 2. CONFIGURACIÓN DEL MÓDULO DE RECETAS (Flask/MySQL)
// ============================================
// El módulo de Recetas está en Flask con MySQL.
// La aplicación consume sus propios endpoints API.

const RECETAS_CONFIG = {
    // URL base del servidor Flask
    apiUrl: (function() {
        const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
            // En desarrollo: Flask corre en localhost:5000
            return 'http://localhost:5000/api';
            // Alternativa si Flask está en otro puerto:
            // return 'http://127.0.0.1:3000/api';
        } else {
            // En producción: URL del servidor remoto
            return 'https://tusitio.com/api';
        }
    })(),

    endpoints: {
        crearReceta: '/recetas',           // POST
        listarRecetas: '/recetas',         // GET
        obtenerReceta: '/recetas/:id',     // GET
        crearPaciente: '/pacientes',       // POST
        buscarPaciente: '/pacientes/:id',  // GET
        medicamentos: '/medicamentos'      // GET
    },

    timeout: 5000
};

// ============================================
// 3. FUNCIÓN AUXILIAR: Petición con Timeout
// ============================================
async function fetchConTimeout(url, opciones = {}, tiempoLimite = 5000) {
    const { timeout = tiempoLimite, ...opcionesRest } = opciones;
    
    const promesaTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout en la solicitud')), timeout)
    );
    
    try {
        const respuesta = await Promise.race([
            fetch(url, opcionesRest),
            promesaTimeout
        ]);
        return respuesta;
    } catch (error) {
        throw error;
    }
}

// ============================================
// 4. EXPORTAR CONFIGURACIÓN
// ============================================
// Si se usa en módulo (requiere transpilador):
// export { MEDICOS_CONFIG, RECETAS_CONFIG, fetchConTimeout };

// Para navegador (global):
window.MEDICOS_CONFIG = MEDICOS_CONFIG;
window.RECETAS_CONFIG = RECETAS_CONFIG;
window.fetchConTimeout = fetchConTimeout;

console.log('✅ Configuración de Medidino cargada');
console.log('📍 API Médicos:', MEDICOS_CONFIG.apiUrl);
console.log('📍 API Recetas:', RECETAS_CONFIG.apiUrl);
