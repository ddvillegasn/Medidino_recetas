/**
 * API Client Utilities - Funciones Adicionales
 * Extensiones útiles para el cliente API
 */

// ==================== EXTENSIONES DEL API CLIENT ====================

/**
 * Obtener parámetro de URL
 * Ejemplo: obtenerParametroUrl('id') en 'registro.html?id=5' retorna '5'
 */
function obtenerParametroUrl(nombre) {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get(nombre);
}

/**
 * Validar email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validar teléfono
 */
function validarTelefono(telefono) {
    const regex = /^[0-9]{7,15}$/;
    return telefono.match(regex) !== null;
}

/**
 * Validar número de licencia (formato básico)
 */
function validarLicencia(licencia) {
    return licencia.length >= 4 && licencia.length <= 20;
}

/**
 * Formatear fecha a dd/mm/yyyy
 */
function formatearFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

/**
 * Formatear hora a HH:MM
 */
function formatearHora(hora) {
    if (!hora) return '';
    return hora.slice(0, 5);
}

/**
 * Crear tabla HTML desde array de objetos
 */
function crearTablaHTML(datos, columnas) {
    if (!datos || datos.length === 0) return '<p>No hay datos</p>';
    
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    
    // Encabezados
    html += '<thead><tr style="background-color: #1E88A8; color: white;">';
    columnas.forEach(col => {
        html += `<th style="padding: 10px; text-align: left; border: 1px solid #ddd;">${col.label}</th>`;
    });
    html += '</tr></thead>';
    
    // Datos
    html += '<tbody>';
    datos.forEach((fila, index) => {
        html += `<tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};">`;
        columnas.forEach(col => {
            html += `<td style="padding: 10px; border: 1px solid #ddd;">${fila[col.key] || ''}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    
    return html;
}

/**
 * Crear tarjeta (card) HTML
 */
function crearCard(titulo, contenido, acciones = []) {
    let html = `
    <div style="
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        margin: 15px 0;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
        <h3 style="margin-top: 0; color: #1E88A8;">${titulo}</h3>
        <div>${contenido}</div>
    `;
    
    if (acciones.length > 0) {
        html += '<div style="margin-top: 15px;">';
        acciones.forEach(accion => {
            html += `<button onclick="${accion.onclick}" style="
                margin-right: 10px;
                padding: 8px 16px;
                background-color: ${accion.color || '#1E88A8'};
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">${accion.texto}</button>`;
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

/**
 * Mostrar notificación tipo Toast
 */
function mostrarToast(mensaje, tipo = 'exito', duracion = 3000) {
    const colors = {
        'exito': '#4CAF50',
        'error': '#f44336',
        'info': '#2196F3',
        'advertencia': '#ff9800'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${colors[tipo] || colors['info']};
        color: white;
        padding: 16px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        max-width: 300px;
        word-wrap: break-word;
    `;
    toast.textContent = mensaje;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, duracion);
}

/**
 * Mostrar modal de confirmación
 */
function mostrarConfirmacion(titulo, mensaje, onConfirmar, onCancelar) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        max-width: 400px;
    `;
    
    modal.innerHTML = `
        <h2 style="margin-top: 0; color: #1E88A8;">${titulo}</h2>
        <p>${mensaje}</p>
        <div style="margin-top: 20px; text-align: right;">
            <button id="btnCancelar" style="
                margin-right: 10px;
                padding: 8px 16px;
                background-color: #ccc;
                color: black;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Cancelar</button>
            <button id="btnConfirmar" style="
                padding: 8px 16px;
                background-color: #f44336;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Confirmar</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    document.getElementById('btnConfirmar').addEventListener('click', () => {
        overlay.remove();
        if (onConfirmar) onConfirmar();
    });
    
    document.getElementById('btnCancelar').addEventListener('click', () => {
        overlay.remove();
        if (onCancelar) onCancelar();
    });
}

/**
 * Exportar datos a CSV
 */
function exportarCSV(datos, nombreArchivo = 'datos.csv') {
    if (!datos || datos.length === 0) {
        mostrarError('No hay datos para exportar');
        return;
    }
    
    // Obtener encabezados
    const encabezados = Object.keys(datos[0]);
    
    // Crear CSV
    let csv = encabezados.join(',') + '\n';
    datos.forEach(fila => {
        const valores = encabezados.map(col => {
            const valor = fila[col];
            // Escapar comillas
            return `"${valor ? valor.toString().replace(/"/g, '""') : ''}"`;
        });
        csv += valores.join(',') + '\n';
    });
    
    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
}

/**
 * Validar formulario antes de enviar
 */
function validarFormulario(formId, reglas) {
    const form = document.getElementById(formId);
    const errores = [];
    
    Object.keys(reglas).forEach(campo => {
        const input = form.querySelector(`[name="${campo}"]`);
        if (!input) return;
        
        const valor = input.value.trim();
        const reglasDelCampo = reglas[campo];
        
        // Validar requerido
        if (reglasDelCampo.requerido && !valor) {
            errores.push(`${reglasDelCampo.label} es requerido`);
        }
        
        // Validar tipo email
        if (reglasDelCampo.tipo === 'email' && valor && !validarEmail(valor)) {
            errores.push(`${reglasDelCampo.label} no es válido`);
        }
        
        // Validar longitud mínima
        if (reglasDelCampo.minimo && valor.length < reglasDelCampo.minimo) {
            errores.push(`${reglasDelCampo.label} debe tener al menos ${reglasDelCampo.minimo} caracteres`);
        }
        
        // Validar longitud máxima
        if (reglasDelCampo.maximo && valor.length > reglasDelCampo.maximo) {
            errores.push(`${reglasDelCampo.label} no puede exceder ${reglasDelCampo.maximo} caracteres`);
        }
        
        // Validar patrón regex
        if (reglasDelCampo.patron && valor && !reglasDelCampo.patron.test(valor)) {
            errores.push(reglasDelCampo.mensaje || `${reglasDelCampo.label} no es válido`);
        }
    });
    
    if (errores.length > 0) {
        mostrarError(errores.join('\n'));
        return false;
    }
    
    return true;
}

/**
 * Agregar filtro a tabla
 */
function crearFiltroTabla(inputId, tableId) {
    const input = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    
    if (!input || !table) return;
    
    input.addEventListener('keyup', function() {
        const filtro = this.value.toLowerCase();
        const filas = table.querySelectorAll('tbody tr');
        
        filas.forEach(fila => {
            const texto = fila.textContent.toLowerCase();
            fila.style.display = texto.includes(filtro) ? '' : 'none';
        });
    });
}

/**
 * Paginación simple
 */
function paginar(datos, porPagina = 10) {
    const paginas = [];
    for (let i = 0; i < datos.length; i += porPagina) {
        paginas.push(datos.slice(i, i + porPagina));
    }
    return paginas;
}

/**
 * Mostrar página de tabla
 */
function mostrarPaginacion(contenedorId, datos, porPagina = 10) {
    const paginas = paginar(datos, porPagina);
    let paginaActual = 1;
    
    const contenedor = document.getElementById(contenedorId);
    const tablasDiv = document.createElement('div');
    const controles = document.createElement('div');
    
    function mostrarPagina(num) {
        const datos = paginas[num - 1] || [];
        tablasDiv.innerHTML = crearTablaHTML(datos, [
            // Ajusta según tus columnas
        ]);
        
        controles.innerHTML = `
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="mostrarPagina(${Math.max(1, num - 1)})">← Anterior</button>
                <span style="margin: 0 10px;">Página ${num} de ${paginas.length}</span>
                <button onclick="mostrarPagina(${Math.min(paginas.length, num + 1)})">Siguiente →</button>
            </div>
        `;
    }
    
    window.mostrarPagina = mostrarPagina;
    contenedor.appendChild(tablasDiv);
    contenedor.appendChild(controles);
    
    mostrarPagina(1);
}

/**
 * Cargar imagen de perfil
 */
function cargarImagenPerfil(inputId, contenedorId) {
    const input = document.getElementById(inputId);
    const contenedor = document.getElementById(contenedorId);
    
    if (!input) return;
    
    input.addEventListener('change', function(e) {
        const archivo = e.target.files[0];
        if (archivo) {
            const lector = new FileReader();
            lector.onload = function(evento) {
                contenedor.innerHTML = `<img src="${evento.target.result}" style="max-width: 200px; border-radius: 8px;">`;
            };
            lector.readAsDataURL(archivo);
        }
    });
}

/**
 * Agregar spinner de carga global
 */
function mostrarSpinner(visible = true) {
    let spinner = document.getElementById('spinner-global');
    
    if (visible && !spinner) {
        spinner = document.createElement('div');
        spinner.id = 'spinner-global';
        spinner.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10001;
        `;
        spinner.innerHTML = `
            <div style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #1E88A8;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            "></div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(spinner);
    } else if (!visible && spinner) {
        spinner.remove();
    }
}

/**
 * Debounce para evitar múltiples llamadas rápidas
 */
function debounce(func, espera) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), espera);
    };
}

/**
 * Throttle para limitar llamadas frecuentes
 */
function throttle(func, limite) {
    let ultima = 0;
    return function(...args) {
        const ahora = Date.now();
        if (ahora - ultima >= limite) {
            func.apply(this, args);
            ultima = ahora;
        }
    };
}

// Extender apiClient con estas utilidades
if (window.apiClient) {
    window.apiClient.obtenerParametroUrl = obtenerParametroUrl;
    window.apiClient.validarEmail = validarEmail;
    window.apiClient.validarTelefono = validarTelefono;
    window.apiClient.validarLicencia = validarLicencia;
    window.apiClient.formatearFecha = formatearFecha;
    window.apiClient.formatearHora = formatearHora;
    window.apiClient.crearTablaHTML = crearTablaHTML;
    window.apiClient.crearCard = crearCard;
    window.apiClient.mostrarToast = mostrarToast;
    window.apiClient.mostrarConfirmacion = mostrarConfirmacion;
    window.apiClient.exportarCSV = exportarCSV;
    window.apiClient.validarFormulario = validarFormulario;
    window.apiClient.crearFiltroTabla = crearFiltroTabla;
    window.apiClient.paginar = paginar;
    window.apiClient.cargarImagenPerfil = cargarImagenPerfil;
    window.apiClient.mostrarSpinner = mostrarSpinner;
    window.apiClient.debounce = debounce;
    window.apiClient.throttle = throttle;
}
