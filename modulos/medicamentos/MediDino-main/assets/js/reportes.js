// ==================== FUNCIONES DE UTILIDAD ====================

const BASE_URL = '/Medidino_recetas/modulos/medicamentos/MediDino-main/';

function cambiarTab(tabName) {
    console.log('🔄 Cambiando a tab:', tabName);
    
    // Ocultar todos los reportes
    document.querySelectorAll('.reporte-contenido').forEach(el => {
        el.classList.remove('activo');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('activo');
    });
    
    // Activar el reporte seleccionado
    const reporteId = `reporte-${tabName}`;
    const reporte = document.getElementById(reporteId);
    if (reporte) {
        reporte.classList.add('activo');
    }
    
    // Activar el botón
    event.target.closest('.tab-btn').classList.add('activo');
    
    // Cargar datos automáticamente
    switch(tabName) {
        case 'stock':
            cargarReporteStock();
            break;
        case 'movimientos':
            cargarReporteMovimientos();
            break;
        case 'bajo-stock':
            cargarReporteBajoStock();
            break;
        case 'dispensaciones':
            cargarReporteDispensaciones();
            break;
        case 'alertas':
            cargarReporteAlertas();
            break;
    }
}

function mostrarCarga(elementoId) {
    document.getElementById(elementoId).innerHTML = `
        <div class="estado-carga">
            <i class="fas fa-spinner fa-spin"></i> Cargando...
        </div>
    `;
}

function mostrarError(elementoId, mensaje) {
    document.getElementById(elementoId).innerHTML = `
        <div class="sin-resultados">
            <i class="fas fa-exclamation-circle"></i>
            <p>${mensaje}</p>
        </div>
    `;
}

function mostrarSinResultados(elementoId) {
    document.getElementById(elementoId).innerHTML = `
        <div class="sin-resultados">
            <i class="fas fa-search"></i>
            <p>No hay resultados que mostrar</p>
        </div>
    `;
}

// ==================== REPORTE: STOCK DISPONIBLE ====================

function cargarReporteStock() {
    console.log('📦 Cargando reporte de stock...');
    
    const medicamento = document.getElementById('stock-medicamento').value;
    const estado = document.getElementById('stock-estado').value;
    
    let url = `${BASE_URL}api_medicamentos.php?action=reporteStock`;
    if (medicamento) url += `&medicamento=${encodeURIComponent(medicamento)}`;
    if (estado) url += `&estado=${encodeURIComponent(estado)}`;
    
    mostrarCarga('tabla-stock-carga');
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.datos.length > 0) {
                mostrarTablaStock(data.datos);
                generarEstadisticasStock(data.datos);
            } else if (data.success && data.datos.length === 0) {
                mostrarSinResultados('tabla-stock');
                document.getElementById('estadisticas-stock').innerHTML = '';
            } else {
                mostrarError('tabla-stock', data.error || 'Error al cargar datos');
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            mostrarError('tabla-stock', 'Error de conexión');
        });
}

function mostrarTablaStock(datos) {
    let html = `
        <div class="tabla-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Medicamento</th>
                        <th>Categoría</th>
                        <th>Stock Actual</th>
                        <th>Stock Mínimo</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>Vencimiento</th>
                        <th>Actualizado</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    datos.forEach(med => {
        const badgeEstado = med.estado === 'activo' ? 'badge-activo' : 
                           med.estado === 'inactivo' ? 'badge-inactivo' : 'badge-retirado';
        const fechaVencimiento = med.fecha_vencimiento ? new Date(med.fecha_vencimiento).toLocaleDateString('es-ES') : 'N/A';
        const fechaActualizado = new Date(med.actualizado_en).toLocaleDateString('es-ES');
        
        html += `
            <tr>
                <td><strong>${med.nombre}</strong></td>
                <td>${med.categoria || 'N/A'}</td>
                <td>${med.stock}</td>
                <td>${med.minimo_stock}</td>
                <td>$${parseFloat(med.precio).toFixed(2)}</td>
                <td><span class="badge ${badgeEstado}">${med.estado}</span></td>
                <td>${fechaVencimiento}</td>
                <td>${fechaActualizado}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    document.getElementById('tabla-stock').innerHTML = html;
    document.getElementById('tabla-stock-carga').style.display = 'none';
}

function generarEstadisticasStock(datos) {
    const totalMedicamentos = datos.length;
    const medicamentosActivos = datos.filter(d => d.estado === 'activo').length;
    const valorTotal = datos.reduce((sum, d) => sum + (parseFloat(d.precio) * d.stock), 0);
    
    let html = `
        <div class="card-stat success">
            <h3>Total Medicamentos</h3>
            <div class="valor">${totalMedicamentos}</div>
        </div>
        <div class="card-stat">
            <h3>Medicamentos Activos</h3>
            <div class="valor">${medicamentosActivos}</div>
        </div>
        <div class="card-stat">
            <h3>Valor Total Stock</h3>
            <div class="valor">$${valorTotal.toFixed(2)}</div>
        </div>
    `;
    
    document.getElementById('estadisticas-stock').innerHTML = html;
}

function limpiarFiltrosStock() {
    document.getElementById('stock-medicamento').value = '';
    document.getElementById('stock-estado').value = '';
    cargarReporteStock();
}

// ==================== REPORTE: MOVIMIENTOS ====================

function cargarReporteMovimientos() {
    console.log('📊 Cargando reporte de movimientos...');
    
    const fechaInicio = document.getElementById('mov-fecha-inicio').value;
    const fechaFin = document.getElementById('mov-fecha-fin').value;
    const tipo = document.getElementById('mov-tipo').value;
    const medicamento = document.getElementById('mov-medicamento').value;
    
    let url = `${BASE_URL}api_medicamentos.php?action=reporteMovimientos`;
    if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
    if (fechaFin) url += `&fecha_fin=${fechaFin}`;
    if (tipo) url += `&tipo=${encodeURIComponent(tipo)}`;
    if (medicamento) url += `&medicamento=${encodeURIComponent(medicamento)}`;
    
    mostrarCarga('tabla-movimientos-carga');
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.datos.length > 0) {
                mostrarTablaMovimientos(data.datos);
                generarEstadisticasMovimientos(data.datos);
            } else if (data.success && data.datos.length === 0) {
                mostrarSinResultados('tabla-movimientos');
                document.getElementById('estadisticas-movimientos').innerHTML = '';
            } else {
                mostrarError('tabla-movimientos', data.error || 'Error al cargar datos');
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            mostrarError('tabla-movimientos', 'Error de conexión');
        });
}

function mostrarTablaMovimientos(datos) {
    let html = `
        <div class="tabla-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Fecha/Hora</th>
                        <th>Tipo</th>
                        <th>Medicamento</th>
                        <th>Cantidad</th>
                        <th>Usuario</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    datos.forEach(mov => {
        const badgeTipo = mov.tipo === 'entrada' ? 'badge-entrada' : 
                         mov.tipo === 'salida' ? 'badge-salida' : 'badge-ajuste';
        const fechaHora = new Date(mov.fecha_hora).toLocaleString('es-ES');
        
        html += `
            <tr>
                <td>${fechaHora}</td>
                <td><span class="badge ${badgeTipo}">${mov.tipo}</span></td>
                <td><strong>${mov.medicamento_nombre || 'N/A'}</strong></td>
                <td>${mov.cantidad}</td>
                <td>${mov.usuario_nombre || 'Sistema'}</td>
                <td>${mov.descripcion || 'N/A'}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    document.getElementById('tabla-movimientos').innerHTML = html;
    document.getElementById('tabla-movimientos-carga').style.display = 'none';
}

function generarEstadisticasMovimientos(datos) {
    const totalMovimientos = datos.length;
    const entradas = datos.filter(d => d.tipo === 'entrada').reduce((sum, d) => sum + parseInt(d.cantidad), 0);
    const salidas = datos.filter(d => d.tipo === 'salida').reduce((sum, d) => sum + parseInt(d.cantidad), 0);
    const ajustes = datos.filter(d => d.tipo === 'ajuste').length;
    
    let html = `
        <div class="card-stat success">
            <h3>Total Movimientos</h3>
            <div class="valor">${totalMovimientos}</div>
        </div>
        <div class="card-stat">
            <h3>Total Entradas</h3>
            <div class="valor">${entradas}</div>
        </div>
        <div class="card-stat danger">
            <h3>Total Salidas</h3>
            <div class="valor">${salidas}</div>
        </div>
        <div class="card-stat warning">
            <h3>Ajustes Realizados</h3>
            <div class="valor">${ajustes}</div>
        </div>
    `;
    
    document.getElementById('estadisticas-movimientos').innerHTML = html;
}

function limpiarFiltrosMovimientos() {
    document.getElementById('mov-fecha-inicio').value = '';
    document.getElementById('mov-fecha-fin').value = '';
    document.getElementById('mov-tipo').value = '';
    document.getElementById('mov-medicamento').value = '';
    cargarReporteMovimientos();
}

// ==================== REPORTE: BAJO STOCK ====================

function cargarReporteBajoStock() {
    console.log('⚠️ Cargando reporte de bajo stock...');
    
    mostrarCarga('tabla-bajo-stock-carga');
    
    fetch(`${BASE_URL}api_medicamentos.php?action=reporteBajoStock`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.datos.length > 0) {
                mostrarTablaBajoStock(data.datos);
                generarEstadisticasBajoStock(data.datos);
            } else if (data.success && data.datos.length === 0) {
                document.getElementById('tabla-bajo-stock').innerHTML = `
                    <div class="sin-resultados" style="padding: 40px; text-align: center; color: #28a745;">
                        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 10px;"></i>
                        <p><strong>¡Excelente!</strong></p>
                        <p>Todos los medicamentos tienen stock suficiente</p>
                    </div>
                `;
                document.getElementById('tabla-bajo-stock-carga').style.display = 'none';
                document.getElementById('estadisticas-bajo-stock').innerHTML = '';
            } else {
                mostrarError('tabla-bajo-stock', data.error || 'Error al cargar datos');
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            mostrarError('tabla-bajo-stock', 'Error de conexión');
        });
}

function mostrarTablaBajoStock(datos) {
    let html = `
        <div class="tabla-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Medicamento</th>
                        <th>Categoría</th>
                        <th>Stock Actual</th>
                        <th>Stock Mínimo</th>
                        <th>Déficit</th>
                        <th>Precio Unitario</th>
                        <th>Costo Déficit</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    datos.forEach(med => {
        const costDeficit = med.deficit * parseFloat(med.precio);
        
        html += `
            <tr>
                <td><strong>${med.nombre}</strong></td>
                <td>${med.categoria || 'N/A'}</td>
                <td><span class="badge badge-bajo-stock">${med.stock}</span></td>
                <td>${med.minimo_stock}</td>
                <td><span class="badge badge-bajo-stock">${med.deficit}</span></td>
                <td>$${parseFloat(med.precio).toFixed(2)}</td>
                <td>$${costDeficit.toFixed(2)}</td>
                <td><span class="badge badge-bajo-stock">${med.estado}</span></td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    document.getElementById('tabla-bajo-stock').innerHTML = html;
    document.getElementById('tabla-bajo-stock-carga').style.display = 'none';
}

function generarEstadisticasBajoStock(datos) {
    const totalMedicamentos = datos.length;
    const deficitTotal = datos.reduce((sum, d) => sum + parseInt(d.deficit), 0);
    const costoDeficit = datos.reduce((sum, d) => sum + (d.deficit * parseFloat(d.precio)), 0);
    
    let html = `
        <div class="card-stat danger">
            <h3>Medicamentos en Alerta</h3>
            <div class="valor">${totalMedicamentos}</div>
        </div>
        <div class="card-stat danger">
            <h3>Unidades Faltantes</h3>
            <div class="valor">${deficitTotal}</div>
        </div>
        <div class="card-stat danger">
            <h3>Costo del Déficit</h3>
            <div class="valor">$${costoDeficit.toFixed(2)}</div>
        </div>
    `;
    
    document.getElementById('estadisticas-bajo-stock').innerHTML = html;
}

function limpiarReporteBajoStock() {
    cargarReporteBajoStock();
}

// ==================== REPORTE: DISPENSACIONES ====================

function cargarReporteDispensaciones() {
    console.log('💊 Cargando reporte de dispensaciones...');
    
    const fechaInicio = document.getElementById('disp-fecha-inicio').value;
    const fechaFin = document.getElementById('disp-fecha-fin').value;
    const medicamento = document.getElementById('disp-medicamento').value;
    
    let url = `${BASE_URL}api_medicamentos.php?action=reporteDispensaciones`;
    if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
    if (fechaFin) url += `&fecha_fin=${fechaFin}`;
    if (medicamento) url += `&medicamento=${encodeURIComponent(medicamento)}`;
    
    mostrarCarga('tabla-dispensaciones-carga');
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.datos.length > 0) {
                mostrarTablaDispensaciones(data.datos);
                generarEstadisticasDispensaciones(data.datos);
            } else if (data.success && data.datos.length === 0) {
                mostrarSinResultados('tabla-dispensaciones');
                document.getElementById('estadisticas-dispensaciones').innerHTML = '';
            } else {
                mostrarError('tabla-dispensaciones', data.error || 'Error al cargar datos');
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            mostrarError('tabla-dispensaciones', 'Error de conexión');
        });
}

function mostrarTablaDispensaciones(datos) {
    let html = `
        <div class="tabla-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Medicamento</th>
                        <th>Cantidad</th>
                        <th>Paciente</th>
                        <th>Cédula</th>
                        <th>Médico</th>
                        <th>Receta</th>
                        <th>Usuario Farmacéutico</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    datos.forEach(disp => {
        const fecha = new Date(disp.fecha).toLocaleDateString('es-ES');
        
        html += `
            <tr>
                <td>${fecha}</td>
                <td><strong>${disp.medicamento_nombre || 'N/A'}</strong></td>
                <td>${disp.cantidad}</td>
                <td>${disp.paciente || 'N/A'}</td>
                <td>${disp.cedula || 'N/A'}</td>
                <td>${disp.medico || 'N/A'}</td>
                <td>${disp.numero_receta || 'N/A'}</td>
                <td>${disp.usuario_nombre || 'N/A'}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    document.getElementById('tabla-dispensaciones').innerHTML = html;
    document.getElementById('tabla-dispensaciones-carga').style.display = 'none';
}

function generarEstadisticasDispensaciones(datos) {
    const totalDispensaciones = datos.length;
    const totalUnidades = datos.reduce((sum, d) => sum + parseInt(d.cantidad), 0);
    
    let html = `
        <div class="card-stat">
            <h3>Total Dispensaciones</h3>
            <div class="valor">${totalDispensaciones}</div>
        </div>
        <div class="card-stat success">
            <h3>Total Unidades</h3>
            <div class="valor">${totalUnidades}</div>
        </div>
    `;
    
    document.getElementById('estadisticas-dispensaciones').innerHTML = html;
}

function limpiarFiltrosDispensaciones() {
    document.getElementById('disp-fecha-inicio').value = '';
    document.getElementById('disp-fecha-fin').value = '';
    document.getElementById('disp-medicamento').value = '';
    cargarReporteDispensaciones();
}

// ==================== REPORTE: ALERTAS ====================

function cargarReporteAlertas() {
    console.log('🔔 Cargando reporte de alertas...');
    
    const tipo = document.getElementById('alert-tipo').value;
    const visto = document.getElementById('alert-visto').value;
    const fecha = document.getElementById('alert-fecha').value;
    
    let url = `${BASE_URL}api_medicamentos.php?action=reporteAlertas`;
    if (tipo) url += `&tipo=${encodeURIComponent(tipo)}`;
    if (visto !== '') url += `&visto=${visto}`;
    if (fecha) url += `&fecha_inicio=${fecha}`;
    
    mostrarCarga('tabla-alertas-carga');
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.datos.length > 0) {
                mostrarTablaAlertas(data.datos);
                generarEstadisticasAlertas(data.datos);
            } else if (data.success && data.datos.length === 0) {
                mostrarSinResultados('tabla-alertas');
                document.getElementById('estadisticas-alertas').innerHTML = '';
            } else {
                mostrarError('tabla-alertas', data.error || 'Error al cargar datos');
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            mostrarError('tabla-alertas', 'Error de conexión');
        });
}

function mostrarTablaAlertas(datos) {
    let html = `
        <div class="tabla-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Fecha Generada</th>
                        <th>Tipo Alerta</th>
                        <th>Medicamento</th>
                        <th>Mensaje</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    datos.forEach(alerta => {
        const fecha = new Date(alerta.fecha_generada).toLocaleString('es-ES');
        const badgeVisto = alerta.visto ? 'badge-activo' : 'badge-bajo-stock';
        const textoVisto = alerta.visto ? 'Visto' : 'Pendiente';
        
        html += `
            <tr>
                <td>${fecha}</td>
                <td>${alerta.tipo || 'N/A'}</td>
                <td>${alerta.medicamento_nombre || 'N/A'}</td>
                <td>${alerta.mensaje || 'Sin mensaje'}</td>
                <td><span class="badge ${badgeVisto}">${textoVisto}</span></td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    document.getElementById('tabla-alertas').innerHTML = html;
    document.getElementById('tabla-alertas-carga').style.display = 'none';
}

function generarEstadisticasAlertas(datos) {
    const totalAlertas = datos.length;
    const alertasNoVistas = datos.filter(d => !d.visto).length;
    
    let html = `
        <div class="card-stat danger">
            <h3>Total Alertas</h3>
            <div class="valor">${totalAlertas}</div>
        </div>
        <div class="card-stat warning">
            <h3>Pendientes de Revisar</h3>
            <div class="valor">${alertasNoVistas}</div>
        </div>
    `;
    
    document.getElementById('estadisticas-alertas').innerHTML = html;
}

function limpiarFiltrosAlertas() {
    document.getElementById('alert-tipo').value = '';
    document.getElementById('alert-visto').value = '';
    document.getElementById('alert-fecha').value = '';
    cargarReporteAlertas();
}

// ==================== EXPORTAR A CSV ====================

function exportarReporte(tipoReporte) {
    console.log('📥 Exportando reporte:', tipoReporte);
    
    let datos = [];
    let nombreArchivo = '';
    let columnas = [];
    
    switch(tipoReporte) {
        case 'stock':
            datos = obtenerDatosStock();
            nombreArchivo = 'reporte-stock.csv';
            columnas = ['Medicamento', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Precio', 'Estado', 'Vencimiento', 'Actualizado'];
            break;
        case 'movimientos':
            datos = obtenerDatosMovimientos();
            nombreArchivo = 'reporte-movimientos.csv';
            columnas = ['Fecha/Hora', 'Tipo', 'Medicamento', 'Cantidad', 'Usuario', 'Descripción'];
            break;
        case 'bajo-stock':
            datos = obtenerDatosBajoStock();
            nombreArchivo = 'reporte-bajo-stock.csv';
            columnas = ['Medicamento', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Déficit', 'Precio', 'Costo Déficit', 'Estado'];
            break;
        case 'dispensaciones':
            datos = obtenerDatosDispensaciones();
            nombreArchivo = 'reporte-dispensaciones.csv';
            columnas = ['Fecha', 'Medicamento', 'Cantidad', 'Paciente', 'Cédula', 'Médico', 'Receta', 'Usuario'];
            break;
        case 'alertas':
            datos = obtenerDatosAlertas();
            nombreArchivo = 'reporte-alertas.csv';
            columnas = ['Fecha', 'Tipo', 'Medicamento', 'Mensaje', 'Estado'];
            break;
    }
    
    if (datos.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    generarCSV(nombreArchivo, columnas, datos);
}

function obtenerDatosStock() {
    const tabla = document.querySelector('#tabla-stock table tbody');
    if (!tabla) return [];
    
    let datos = [];
    tabla.querySelectorAll('tr').forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        datos.push([
            celdas[0].textContent,
            celdas[1].textContent,
            celdas[2].textContent,
            celdas[3].textContent,
            celdas[4].textContent,
            celdas[5].textContent,
            celdas[6].textContent,
            celdas[7].textContent
        ]);
    });
    return datos;
}

function obtenerDatosMovimientos() {
    const tabla = document.querySelector('#tabla-movimientos table tbody');
    if (!tabla) return [];
    
    let datos = [];
    tabla.querySelectorAll('tr').forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        datos.push([
            celdas[0].textContent,
            celdas[1].textContent,
            celdas[2].textContent,
            celdas[3].textContent,
            celdas[4].textContent,
            celdas[5].textContent
        ]);
    });
    return datos;
}

function obtenerDatosBajoStock() {
    const tabla = document.querySelector('#tabla-bajo-stock table tbody');
    if (!tabla) return [];
    
    let datos = [];
    tabla.querySelectorAll('tr').forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        datos.push([
            celdas[0].textContent,
            celdas[1].textContent,
            celdas[2].textContent,
            celdas[3].textContent,
            celdas[4].textContent,
            celdas[5].textContent,
            celdas[6].textContent,
            celdas[7].textContent
        ]);
    });
    return datos;
}

function obtenerDatosDispensaciones() {
    const tabla = document.querySelector('#tabla-dispensaciones table tbody');
    if (!tabla) return [];
    
    let datos = [];
    tabla.querySelectorAll('tr').forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        datos.push([
            celdas[0].textContent,
            celdas[1].textContent,
            celdas[2].textContent,
            celdas[3].textContent,
            celdas[4].textContent,
            celdas[5].textContent,
            celdas[6].textContent,
            celdas[7].textContent
        ]);
    });
    return datos;
}

function obtenerDatosAlertas() {
    const tabla = document.querySelector('#tabla-alertas table tbody');
    if (!tabla) return [];
    
    let datos = [];
    tabla.querySelectorAll('tr').forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        datos.push([
            celdas[0].textContent,
            celdas[1].textContent,
            celdas[2].textContent,
            celdas[3].textContent,
            celdas[4].textContent
        ]);
    });
    return datos;
}

function generarCSV(nombreArchivo, columnas, datos) {
    let csv = columnas.join(',') + '\n';
    datos.forEach(fila => {
        csv += fila.map(celda => `"${celda.replace(/"/g, '""')}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const enlace = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    enlace.setAttribute('href', url);
    enlace.setAttribute('download', nombreArchivo);
    enlace.style.visibility = 'hidden';
    
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    
    console.log('✅ Archivo exportado:', nombreArchivo);
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Módulo de Reportes cargado');
    cargarReporteStock();
});
