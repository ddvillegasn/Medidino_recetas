// ========================================
// SISTEMA DE GESTIÓN DE MEDICAMENTOS
// ========================================

let medicamentos = [];
// Detectar la ruta base correctamente
// Modificado para XAMPP con estructura: /Medidino_recetas/modulos/medicamentos/MediDino-main/
const baseURL = window.location.pathname.includes('/Medidino_recetas/') 
    ? '/Medidino_recetas/modulos/medicamentos/MediDino-main/' 
    : '/MediDino-main/';

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ Aplicación cargada');
    console.log('✓ Base URL:', baseURL);
    cargarMedicamentos();
    inicializarNavegacion();
    inicializarFormularios();
    actualizarDashboard();
});

// ========================================
// CARGA DE MEDICAMENTOS DESDE BD
// ========================================

function cargarMedicamentos() {
    fetch(baseURL + 'api_medicamentos.php?action=obtener')
        .then(response => response.json())
        .then(data => {
            console.log('Medicamentos cargados:', data);
            
            // Manejar ambos formatos de respuesta (nuevo con success y antiguo simple)
            if (data.success && data.medicamentos) {
                medicamentos = data.medicamentos;
            } else if (Array.isArray(data)) {
                medicamentos = data;
            } else {
                medicamentos = [];
            }
            
            console.log('Total medicamentos procesados:', medicamentos.length);
            actualizarDashboard();
            actualizarTablaInventario();
            actualizarAlertasMedicamentos();
            llenarDropdownsMedicamentos();
        })
        .catch(error => {
            console.error('Error cargando medicamentos:', error);
            mostrarNotificacion('Error al cargar medicamentos', 'error');
        });
}

// ========================================
// NAVEGACIÓN
// ========================================

function inicializarNavegacion() {
    document.querySelectorAll('.nav-item[data-form]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-form');
            mostrarSeccion(sectionId);
            
            // Si es solicitudes, cargar el historial
            if (sectionId === 'solicitudes') {
                setTimeout(() => {
                    actualizarListaSolicitudes();
                }, 100);
            }
        });
    });
    mostrarSeccion('dashboard');
}

function mostrarSeccion(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-form="${sectionId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

// ========================================
// DASHBOARD
// ========================================

function actualizarDashboard() {
    console.log('🔄 Actualizando dashboard...');
    
    // Calcular estadísticas con los datos actuales
    const totalMedicamentos = medicamentos.length;
    const agotados = medicamentos.filter(m => parseInt(m.stock) === 0).length;
    const stockBajo = medicamentos.filter(m => parseInt(m.stock) > 0 && parseInt(m.stock) <= parseInt(m.stockMinimo || 10)).length;
    const disponibles = totalMedicamentos - agotados - stockBajo;

    // Actualizar elementos del DOM
    const el1 = document.getElementById('totalMedicamentos');
    const el2 = document.getElementById('medicamentosDisponibles');
    const el3 = document.getElementById('medicamentosStockBajo');
    const el4 = document.getElementById('medicamentosAgotados');
    
    if (el1) el1.textContent = totalMedicamentos;
    if (el2) el2.textContent = disponibles;
    if (el3) el3.textContent = stockBajo;
    if (el4) el4.textContent = agotados;
    
    console.log('✓ Dashboard actualizado');
}

function actualizarDashboardDesdeBoton() {
    console.log('🔄 Recargando datos del dashboard...');
    
    // Recargar medicamentos desde la BD
    fetch(baseURL + 'api_medicamentos.php?action=obtener')
        .then(response => response.json())
        .then(data => {
            // Procesar los datos igual que cargarMedicamentos()
            if (data.success && data.medicamentos) {
                medicamentos = data.medicamentos;
            } else if (Array.isArray(data)) {
                medicamentos = data;
            } else {
                medicamentos = [];
            }
            
            console.log('✓ Datos recargados desde BD:', medicamentos.length);
            
            // Actualizar dashboard
            actualizarDashboard();
            actualizarTablaInventario();
            actualizarAlertasMedicamentos();
            llenarDropdownsMedicamentos();
        })
        .catch(error => {
            console.error('Error al recargar datos:', error);
            mostrarNotificacion('Error al actualizar', 'error');
        });
}

// ========================================
// FORMULARIOS
// ========================================

function inicializarFormularios() {
    const registroForm = document.getElementById('registroMedicamentoForm');
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registrarMedicamento();
        });
    }

    const dispensacionForm = document.getElementById('dispensacionForm');
    if (dispensacionForm) {
        dispensacionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarDispensacion();
        });
    }

    const movimientosForm = document.getElementById('movimientosForm');
    if (movimientosForm) {
        movimientosForm.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarMovimiento();
        });
    }

    const solicitudesForm = document.getElementById('solicitudesForm');
    if (solicitudesForm) {
        solicitudesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarSolicitud();
        });
    }

    const recordatoriosForm = document.getElementById('recordatoriosForm');
    if (recordatoriosForm) {
        recordatoriosForm.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarRecordatorio();
        });
    }

    // Event listener para búsqueda en tiempo real
    const searchInput = document.getElementById('searchMedicamento');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filtrarMedicamentos();
        });
    }

    // Event listeners para filtros de categoría y estado
    const filterCategoria = document.getElementById('filterCategoria');
    if (filterCategoria) {
        filterCategoria.addEventListener('change', function() {
            filtrarMedicamentos();
        });
    }

    const filterStock = document.getElementById('filterStock');
    if (filterStock) {
        filterStock.addEventListener('change', function() {
            filtrarMedicamentos();
        });
    }
}

// ========================================
// REGISTRO DE MEDICAMENTOS
// ========================================

function registrarMedicamento() {
    const form = document.getElementById('registroMedicamentoForm');
    if (!form) return;
    
    const formData = new FormData(form);
    
    const medicamentoData = {
        nombre: formData.get('nombreMedicamento') || '',
        categoria: formData.get('categoria') || '',
        descripcion: formData.get('principioActivo') || '',
        dosis_recomendada: formData.get('concentracion') || '',
        efectos_secundarios: formData.get('efectosSecundarios') || '',
        contraindicaciones: formData.get('contraindicaciones') || '',
        tipo: formData.get('formaFarmaceutica') || '',
        fecha_vencimiento: formData.get('fechaVencimiento') || '',
        precio: parseFloat(formData.get('precio')) || 0,
        stock: parseInt(formData.get('cantidad')) || 0,
        minimo_stock: parseInt(formData.get('stockMinimo')) || 10,
        estado: formData.get('estado') || 'activo'
    };

    console.log('Enviando medicamento:', medicamentoData);

    fetch(baseURL + 'api_medicamentos.php?action=guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicamentoData)
    })
    .then(response => {
        console.log('Respuesta:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Datos recibidos:', data);
        if (data.success) {
            mostrarNotificacion('✓ Medicamento registrado correctamente', 'success');
            form.reset();
            setTimeout(() => cargarMedicamentos(), 500);
        } else {
            mostrarNotificacion('✗ Error: ' + (data.error || 'Error desconocido'), 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('✗ Error al guardar medicamento', 'error');
    });
}

// ========================================
// DISPENSACIÓN
// ========================================

function procesarDispensacion() {
    const form = document.getElementById('dispensacionForm');
    const formData = new FormData(form);
    
    const medicamentoId = formData.get('medicamentoDispensacion');
    const cantidad = parseInt(formData.get('cantidadDispensacion'));
    
    if (!medicamentoId || cantidad <= 0) {
        mostrarNotificacion('⚠ Selecciona medicamento y cantidad válida', 'warning');
        return;
    }
    
    const dispensacionData = {
        id: medicamentoId,
        cantidad: cantidad,
        paciente: formData.get('pacienteDispensacion') || '',
        cedula: formData.get('cedulaPaciente') || '',
        medico: formData.get('medico') || '',
        receta: formData.get('numeroReceta') || '',
        indicaciones: formData.get('indicaciones') || ''
    };

    fetch(baseURL + 'api_medicamentos.php?action=dispensar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispensacionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(`✓ Dispensación: ${cantidad} unidades`, 'success');
            form.reset();
            cargarMedicamentos();
        } else {
            mostrarNotificacion('✗ Error: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('✗ Error al procesar dispensación', 'error');
    });
}

// ========================================
// MOVIMIENTOS
// ========================================

function procesarMovimiento() {
    const form = document.getElementById('movimientosForm');
    const formData = new FormData(form);
    
    const medicamentoId = formData.get('medicamentoMovimiento');
    const tipo = formData.get('tipoMovimiento');
    const cantidad = parseInt(formData.get('cantidadMovimiento'));
    
    if (!medicamentoId || !tipo || cantidad <= 0) {
        mostrarNotificacion('⚠ Completa todos los campos correctamente', 'warning');
        return;
    }
    
    const movimientoData = {
        id: medicamentoId,
        tipo: tipo,
        cantidad: cantidad
    };

    fetch(baseURL + 'api_medicamentos.php?action=movimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movimientoData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(`✓ Movimiento: ${tipo} de ${cantidad}`, 'success');
            form.reset();
            cargarMedicamentos();
        } else {
            mostrarNotificacion('✗ Error: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('✗ Error al registrar movimiento', 'error');
    });
}

// ========================================
// SOLICITUDES DE REABASTECIMIENTO
// ========================================

function procesarSolicitud() {
    const form = document.getElementById('solicitudesForm');
    const formData = new FormData(form);
    
    const medicamento = formData.get('medicamentoSolicitud');
    const cantidad = parseInt(formData.get('cantidadSolicitud'));
    const prioridad = formData.get('prioridadSolicitud');
    const area = formData.get('areaSolicitud');
    const justificacion = formData.get('justificacionSolicitud');
    
    // Validaciones
    if (!medicamento || cantidad <= 0) {
        mostrarNotificacion('⚠ Completa medicamento y cantidad correctamente', 'warning');
        return;
    }
    
    if (!prioridad) {
        mostrarNotificacion('⚠ Selecciona una prioridad', 'warning');
        return;
    }
    
    if (!area) {
        mostrarNotificacion('⚠ Especifica el área solicitante', 'warning');
        return;
    }
    
    if (justificacion.length < 20) {
        mostrarNotificacion('⚠ La justificación debe tener mínimo 20 caracteres', 'warning');
        return;
    }
    
    const solicitudData = {
        medicamento: medicamento,
        cantidad: cantidad,
        prioridad: prioridad,
        area: area,
        justificacion: justificacion
    };

    // Enviar al servidor
    fetch(baseURL + 'api_medicamentos.php?action=guardarSolicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solicitudData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(`✓ Solicitud de ${medicamento} enviada correctamente`, 'success');
            form.reset();
            actualizarListaSolicitudes();
        } else {
            mostrarNotificacion('✗ Error: ' + (data.error || 'Error desconocido'), 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('✗ Error al procesar solicitud', 'error');
    });
}

// ========================================
// TABLA DE INVENTARIO
// ========================================

function actualizarTablaInventario() {
    actualizarTablaInventarioConDatos(medicamentos);
}

function agregarEventListenersBotones() {
    document.querySelectorAll('.medicamentos-table .btn-ver-detalles').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const medId = this.closest('tr').getAttribute('data-med-id');
            verDetalles(medId);
        });
    });
    
    document.querySelectorAll('.medicamentos-table .btn-editar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const medId = this.closest('tr').getAttribute('data-med-id');
            abrirEditar(medId);
        });
    });

    document.querySelectorAll('.medicamentos-table .btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const medId = this.closest('tr').getAttribute('data-med-id');
            abrirConfirmacionEliminar(medId);
        });
    });
}

// ========================================
// ALERTAS
// ========================================

function actualizarAlertasMedicamentos() {
    const alertas = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const manana = new Date(hoy.getTime() + 1 * 24 * 60 * 60 * 1000);
    const en3Dias = new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    medicamentos.forEach(med => {
        const fechaVencimiento = med.vencimiento || med.fecha_vencimiento;
        
        // Solo mostrar medicamentos que vencen
        const stock = parseInt(med.stock) || 0;
        const stockMinimo = parseInt(med.stockMinimo) || 10;
        
        // Alerta de stock
        if (stock === 0) {
            alertas.push({
                tipo: 'critical',
                titulo: 'Stock Agotado',
                desc: `${med.nombre} - Sin existencias`,
                accion: 'Reabastecer'
            });
        } else if (stock <= stockMinimo) {
            alertas.push({
                tipo: 'warning',
                titulo: 'Stock Bajo',
                desc: `${med.nombre} - Solo ${stock} unidades`,
                accion: 'Solicitar'
            });
        }
        
        // Alerta de vencimiento
        if (fechaVencimiento && fechaVencimiento !== '--' && fechaVencimiento !== '0000-00-00') {
            const vencDate = new Date(fechaVencimiento);
            vencDate.setHours(0, 0, 0, 0);
            
            if (vencDate < hoy) {
                alertas.push({
                    tipo: 'critical',
                    titulo: 'Medicamento Vencido',
                    desc: `${med.nombre} - Vencido desde ${fechaVencimiento}`,
                    accion: 'Descartar'
                });
            } else if (vencDate.getTime() === hoy.getTime()) {
                // Informativas: medicamentos que se vencen HOY
                alertas.push({
                    tipo: 'info',
                    titulo: 'Se vence Hoy',
                    desc: `${med.nombre} - Vence ${fechaVencimiento}`,
                    accion: 'Revisar'
                });
            } else if (vencDate <= en3Dias) {
                // Advertencias: se vencen en los próximos 1-3 días
                alertas.push({
                    tipo: 'warning',
                    titulo: 'Próximo a Vencer',
                    desc: `${med.nombre} - Vence ${fechaVencimiento}`,
                    accion: 'Revisar'
                });
            }
        }
    });
    
    console.log('Total alertas:', alertas.length);
    mostrarAlertasEnSeccion(alertas);
}

function mostrarAlertasEnSeccion(alertas) {
    const noAlertsState = document.getElementById('noAlertsState');
    const alertsActive = document.getElementById('alertsActive');
    const alertsList = document.getElementById('alertsList');
    const alertasBadge = document.getElementById('alertasBadge');
    
    // Actualizar el badge en el sidebar
    if (alertasBadge) {
        alertasBadge.textContent = alertas.length;
        if (alertas.length > 0) {
            alertasBadge.style.display = 'block';
        } else {
            alertasBadge.style.display = 'none';
        }
    }
    
    if (alertas.length === 0) {
        if (noAlertsState) noAlertsState.style.display = 'block';
        if (alertsActive) alertsActive.style.display = 'none';
    } else {
        if (noAlertsState) noAlertsState.style.display = 'none';
        if (alertsActive) alertsActive.style.display = 'block';
        
        const criticas = alertas.filter(a => a.tipo === 'critical').length;
        const advertencias = alertas.filter(a => a.tipo === 'warning').length;
        const informativas = alertas.filter(a => a.tipo === 'info').length;
        
        const el1 = document.getElementById('alertasCriticas');
        const el2 = document.getElementById('alertasAdvertencias');
        const el3 = document.getElementById('alertasInfo');
        
        if (el1) el1.textContent = criticas;
        if (el2) el2.textContent = advertencias;
        if (el3) el3.textContent = informativas;
        
        if (alertsList) {
            alertsList.innerHTML = alertas.map(alerta => `
                <div class="alert-item ${alerta.tipo}">
                    <h4>${alerta.titulo}</h4>
                    <p>${alerta.desc}</p>
                    <button>${alerta.accion}</button>
                </div>
            `).join('');
        }
    }
}

// ========================================
// UTILIDADES
// ========================================

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    
    notificacion.style.cssText = `
        position: fixed;
        top: 350px;
        right: 20px;
        border-radius: 6px;
        padding: 0.9rem 1.2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        min-width: 280px;
        max-width: 400px;
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        if (notificacion.parentElement) {
            notificacion.remove();
        }
    }, 5000);
}

function limpiarFiltros() {
    const search = document.getElementById('searchMedicamento');
    if (search) search.value = '';
    
    const filterCategoria = document.getElementById('filterCategoria');
    if (filterCategoria) filterCategoria.value = '';
    
    const filterStock = document.getElementById('filterStock');
    if (filterStock) filterStock.value = '';
    
    actualizarTablaInventario();
}

// ========================================
// BÚSQUEDA Y FILTRADO DE MEDICAMENTOS
// ========================================

function llenarDropdownsMedicamentos() {
    const dropdownDispensacion = document.getElementById('medicamentoDispensacion');
    const dropdownMovimiento = document.getElementById('medicamentoMovimiento');
    
    if (dropdownDispensacion) {
        dropdownDispensacion.innerHTML = '<option value="">Seleccionar medicamento...</option>' +
            medicamentos.map(med => 
                `<option value="${med.id}">${med.nombre} (Stock: ${med.stock})</option>`
            ).join('');
    }
    
    if (dropdownMovimiento) {
        dropdownMovimiento.innerHTML = '<option value="">Seleccionar medicamento...</option>' +
            medicamentos.map(med => 
                `<option value="${med.id}">${med.nombre} (Stock: ${med.stock})</option>`
            ).join('');
    }
    
    console.log('✓ Dropdowns de medicamentos actualizados');
    
    // Cargar historial de dispensaciones
    actualizarHistorialDispensaciones();
}

function filtrarMedicamentos() {
    const searchValue = document.getElementById('searchMedicamento')?.value.toLowerCase() || '';
    const categoriaValue = document.getElementById('filterCategoria')?.value || '';
    const stockValue = document.getElementById('filterStock')?.value || '';

    // Filtrar medicamentos según los criterios
    const medicamentosFiltrados = medicamentos.filter(med => {
        // Filtro de búsqueda por texto
        const coincideTexto = !searchValue || 
            med.nombre.toLowerCase().includes(searchValue) ||
            (med.descripcion && med.descripcion.toLowerCase().includes(searchValue)) ||
            (med.tipo && med.tipo.toLowerCase().includes(searchValue));

        // Filtro por categoría
        const coincideCategoria = !categoriaValue || med.categoria === categoriaValue;

        // Filtro por estado de stock
        const stock = parseInt(med.stock) || 0;
        const stockMinimo = parseInt(med.stockMinimo) || 10;
        let coincideStock = true;
        
        if (stockValue === 'disponible') {
            coincideStock = stock > 0 && stock > stockMinimo;
        } else if (stockValue === 'bajo') {
            coincideStock = stock > 0 && stock <= stockMinimo;
        } else if (stockValue === 'agotado') {
            coincideStock = stock === 0;
        }

        return coincideTexto && coincideCategoria && coincideStock;
    });

    // Mostrar medicamentos filtrados
    actualizarTablaInventarioConDatos(medicamentosFiltrados);
}

function actualizarTablaInventarioConDatos(medicamentosAMostrar) {
    const tbody = document.querySelector('.medicamentos-table tbody');
    if (!tbody) return;

    if (medicamentosAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: #999;">
                    <i class="fas fa-search" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                    No se encontraron medicamentos con los criterios de búsqueda
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = medicamentosAMostrar.map(med => {
        const stock = parseInt(med.stock) || 0;
        const estado = stock === 0 ? 'agotado' : stock <= parseInt(med.stockMinimo || 10) ? 'bajo' : 'disponible';
        const iconoStock = estado === 'disponible' ? '✓' : estado === 'bajo' ? '⚠' : '✗';
        const precio = med.precio || '--';
        const vencimiento = med.vencimiento || '--';
        
        return `
        <tr data-med-id="${med.id}">
            <td>
                <div class="medicamento-info">
                    <strong>${med.nombre}</strong>
                    <small>${med.descripcion} • ${med.tipo}</small>
                </div>
            </td>
            <td>
                <span class="stock-indicator ${estado}">
                    ${iconoStock} ${stock} unidades
                </span>
            </td>
            <td>${precio}</td>
            <td>${vencimiento}</td>
            <td>
                <span class="badge badge-${estado}">
                    ${estado.toUpperCase()}
                </span>
            </td>
            <td style="white-space: nowrap;">
                <button class="btn-action btn-ver-detalles" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-editar" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-eliminar" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `;
    }).join('');
    
    // Agregar event listeners
    agregarEventListenersBotones();
}

function exportarInventario() {
    const csv = 'Medicamento,Stock,Estado\n' + medicamentos.map(m => 
        `"${m.nombre}",${m.stock},"${m.estado}"`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    mostrarNotificacion('✓ Inventario exportado', 'success');
}

function refrescarAlertas() {
    console.log('Botón Actualizar clickeado');
    console.log('baseURL:', baseURL);
    
    try {
        cargarMedicamentos();
        console.log('cargarMedicamentos() llamado');
    } catch(e) {
        console.error('Error en refrescarAlertas:', e);
    }
}

// ========================================
// MODALES: VER DETALLES Y EDITAR
// ========================================

function verDetalles(id) {
    const med = medicamentos.find(m => String(m.id) === String(id));
    if (!med) {
        mostrarNotificacion('✗ Medicamento no encontrado', 'error');
        return;
    }

    document.getElementById('detalleNombre').textContent = med.nombre || '--';
    document.getElementById('detalleCategoria').textContent = med.categoria || '--';
    document.getElementById('detalleDescripcion').textContent = med.descripcion || '--';
    document.getElementById('detalleDosis').textContent = med.dosis_recomendada || '--';
    document.getElementById('detalleTipo').textContent = med.tipo || '--';
    document.getElementById('detalleEfectos').textContent = med.efectos_secundarios || '--';
    document.getElementById('detalleContraindicaciones').textContent = med.contraindicaciones || '--';
    document.getElementById('detalleStock').textContent = med.stock || '0';
    document.getElementById('detalleStockMinimo').textContent = med.stockMinimo || '10';
    document.getElementById('detallePrecio').textContent = med.precio ? `$${parseFloat(med.precio).toFixed(2)}` : '--';
    document.getElementById('detalleVencimiento').textContent = med.vencimiento || '--';
    document.getElementById('detalleEstado').textContent = (med.estado && med.estado.trim()) ? med.estado.toUpperCase() : 'INACTIVO';

    abrirModal('modalDetalles');
}

function abrirEditar(id) {
    console.log('✓✓✓ abrirEditar LLAMADO con id:', id);
    const med = medicamentos.find(m => String(m.id) === String(id));
    if (!med) {
        console.error('✗✗✗ Medicamento no encontrado para id:', id);
        mostrarNotificacion('✗ Medicamento no encontrado', 'error');
        return;
    }

    console.log('✓✓✓ Med encontrado para editar:', med.nombre);
    document.getElementById('editarMedicamentoId').value = med.id;
    document.getElementById('editarNombre').value = med.nombre;
    document.getElementById('editarStock').value = med.stock || 0;
    document.getElementById('editarStockMinimo').value = med.stockMinimo || 10;
    document.getElementById('editarPrecio').value = med.precio || 0;
    document.getElementById('editarVencimiento').value = med.vencimiento || '';
    document.getElementById('editarEstado').value = med.estado && med.estado.trim() ? med.estado : 'activo';

    console.log('✓✓✓ Abriendo modal de edición...');
    abrirModal('modalEditar');
}

function guardarEdicion() {
    const id = document.getElementById('editarMedicamentoId')?.value;
    const stockValue = document.getElementById('editarStock')?.value;
    const minimoValue = document.getElementById('editarStockMinimo')?.value;
    const precioValue = document.getElementById('editarPrecio')?.value;
    const vencimiento = document.getElementById('editarVencimiento')?.value || '';
    const estado = document.getElementById('editarEstado')?.value || 'activo';

    console.log('🔄 Valores del formulario:', { 
        id, stockValue, minimoValue, precioValue, vencimiento, estado 
    });

    // Validaciones
    if (!id || parseInt(id) <= 0) {
        mostrarNotificacion('✗ Error: ID no válido', 'error');
        return;
    }
    
    // Stock: puede ser 0 o más
    let stock = 0;
    if (stockValue !== undefined && stockValue !== '') {
        stock = parseInt(stockValue);
        if (isNaN(stock) || stock < 0) {
            mostrarNotificacion('✗ El stock debe ser un número válido (≥ 0)', 'error');
            return;
        }
    }
    
    // Stock Mínimo: puede ser 1 o más (requerido para alertas)
    let minimo_stock = 1;
    if (minimoValue !== undefined && minimoValue !== '') {
        minimo_stock = parseInt(minimoValue);
        if (isNaN(minimo_stock) || minimo_stock < 1) {
            mostrarNotificacion('✗ El stock mínimo debe ser al menos 1', 'error');
            return;
        }
    }
    
    // Precio: puede ser 0 o más
    let precio = 0;
    if (precioValue !== undefined && precioValue !== '') {
        precio = parseFloat(precioValue);
        if (isNaN(precio) || precio < 0) {
            mostrarNotificacion('✗ El precio debe ser un número válido (≥ 0)', 'error');
            return;
        }
    }

    const updateData = {
        id: parseInt(id),
        stock: stock,
        precio: precio,
        estado: estado,
        vencimiento: vencimiento
    };

    console.log('✓ Datos validados y listos para enviar:', updateData);

    fetch(baseURL + 'api_medicamentos.php?action=actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        console.log('📥 Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('📥 Respuesta del servidor:', data);
        if (data.success) {
            mostrarNotificacion('✓ Medicamento actualizado correctamente', 'success');
            cerrarModal('modalEditar');
            cargarMedicamentos();
            
            setTimeout(() => {
                mostrarNotificacion('✓ Datos recargados', 'info');
            }, 1500);
        } else {
            console.error('❌ Error en respuesta:', data);
            mostrarNotificacion('✗ Error: ' + (data.error || data.message || 'Error desconocido'), 'error');
        }
    })
    .catch(error => {
        console.error('❌ Error en fetch:', error);
        mostrarNotificacion('✗ Error al actualizar medicamento: ' + error.message, 'error');
    });
}

function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('modal-open');
    }
    if (overlay) {
        overlay.style.display = 'block';
    }
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('modal-open');
    }
}

function cerrarTodosLosModales() {
    const modales = document.querySelectorAll('.modal');
    const overlay = document.getElementById('modalOverlay');
    modales.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('modal-open');
    });
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ========================================
// ELIMINACIÓN DE MEDICAMENTOS
// ========================================

function abrirConfirmacionEliminar(id) {
    const med = medicamentos.find(m => String(m.id) === String(id));
    if (!med) {
        mostrarNotificacion('✗ Medicamento no encontrado', 'error');
        return;
    }

    document.getElementById('textoConfirmacionEliminar').textContent = 
        `¿Está seguro de que desea eliminar "${med.nombre}"? Esta acción no se puede deshacer.`;
    
    // Guardar el ID del medicamento a eliminar en un atributo global
    window.medicamentoIdParaEliminar = id;
    
    abrirModal('modalConfirmarEliminar');
}

function confirmarEliminar() {
    const id = window.medicamentoIdParaEliminar;
    
    if (!id) {
        mostrarNotificacion('✗ Error: ID de medicamento no válido', 'error');
        return;
    }

    console.log('🗑️ Eliminando medicamento con ID:', id);

    const eliminacionData = {
        id: id
    };

    fetch(baseURL + 'api_medicamentos.php?action=eliminar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eliminacionData)
    })
    .then(response => {
        console.log('📥 Response status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('📥 Respuesta del servidor (raw):', text);
        try {
            const data = JSON.parse(text);
            console.log('📥 Respuesta parseada:', data);
            
            if (data.success) {
                mostrarNotificacion('✓ Medicamento eliminado correctamente', 'success');
                cerrarModal('modalConfirmarEliminar');
                cargarMedicamentos();
            } else {
                const mensajeError = data.error || 'Error desconocido al eliminar';
                console.error('❌ Error en respuesta:', mensajeError);
                mostrarNotificacion('✗ Error: ' + mensajeError, 'error');
            }
        } catch (parseError) {
            console.error('❌ Error parsing JSON:', parseError);
            console.error('❌ Respuesta no es JSON válido:', text);
            mostrarNotificacion('✗ Error al procesar respuesta del servidor', 'error');
        }
    })
    .catch(error => {
        console.error('❌ Error en fetch:', error);
        mostrarNotificacion('✗ Error al eliminar medicamento: ' + error.message, 'error');
    });
}

// ========================================
// HISTORIAL DE DISPENSACIONES
// ========================================

function actualizarHistorialDispensaciones() {
    fetch(baseURL + 'api_medicamentos.php?action=obtenerDispensaciones')
        .then(response => response.json())
        .then(data => {
            console.log('Dispensaciones cargadas:', data);
            mostrarHistorialDispensaciones(data || []);
        })
        .catch(error => {
            console.error('Error cargando dispensaciones:', error);
            const tbody = document.querySelector('#dispensacionesTable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">Error al cargar dispensaciones</td></tr>';
            }
        });
}

function mostrarHistorialDispensaciones(dispensaciones) {
    const tbody = document.querySelector('#dispensacionesTable tbody');
    if (!tbody) return;
    
    if (dispensaciones.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 30px; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                    No hay dispensaciones registradas
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = dispensaciones.map(disp => {
        const fecha = new Date(disp.fecha).toLocaleString('es-ES');
        return `
        <tr>
            <td>${disp.paciente || '--'}</td>
            <td>${disp.cedula || '--'}</td>
            <td>
                <strong>${disp.nombre_medicamento || '--'}</strong>
            </td>
            <td>
                <span class="badge" style="background-color: #3B82F6; color: white; padding: 4px 8px; border-radius: 4px;">
                    ${disp.cantidad}
                </span>
            </td>
            <td>${disp.medico || '--'}</td>
            <td>${disp.numero_receta || '--'}</td>
            <td>${fecha}</td>
            <td style="white-space: nowrap;">
                <button class="btn-action btn-ver-detalles" data-id="${disp.id_dispensacion || disp.id}" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-editar" data-id="${disp.id_dispensacion || disp.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-eliminar" data-id="${disp.id_dispensacion || disp.id}" data-tipo="dispensacion" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
    }).join('');
    
    // Agregar event listeners a los botones
    document.querySelectorAll('#dispensacionesTable .btn-action').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            const tipo = this.getAttribute('data-tipo');
            
            if (this.classList.contains('btn-ver-detalles')) {
                verDetallesDispensacion(id);
            } else if (this.classList.contains('btn-editar')) {
                editarDispensacion(id);
            } else if (this.classList.contains('btn-eliminar')) {
                eliminarDispensacion(id);
            }
        });
    });
}

function verDetallesDispensacion(id) {
    const dispensacion = Array.from(document.querySelectorAll('#dispensacionesTable tbody tr')).find(row => {
        return row.querySelector('[data-id]')?.getAttribute('data-id') === id;
    });
    
    if (dispensacion) {
        const celdas = dispensacion.querySelectorAll('td');
        const detalles = {
            paciente: celdas[0].textContent,
            cedula: celdas[1].textContent,
            medicamento: celdas[2].textContent,
            cantidad: celdas[3].textContent,
            medico: celdas[4].textContent,
            receta: celdas[5].textContent,
            fecha: celdas[6].textContent
        };
        
        alert(`Detalles de Dispensación:\n\nPaciente: ${detalles.paciente}\nCédula: ${detalles.cedula}\nMedicamento: ${detalles.medicamento}\nCantidad: ${detalles.cantidad}\nMédico: ${detalles.medico}\nN° Receta: ${detalles.receta}\nFecha: ${detalles.fecha}`);
    }
}

function editarDispensacion(id) {
    mostrarNotificacion('⚠ Funcionalidad en desarrollo', 'info');
}

function eliminarDispensacion(id) {
    if (confirm('¿Deseas eliminar esta dispensación?')) {
        fetch(baseURL + 'api_medicamentos.php?action=eliminarDispensacion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('✓ Dispensación eliminada', 'success');
                actualizarHistorialDispensaciones();
            } else {
                mostrarNotificacion('⚠ ' + (data.error || 'Error al eliminar'), 'warning');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacion('✗ Error al eliminar dispensación', 'error');
        });
    }
}

function exportarDispensaciones() {
    fetch(baseURL + 'api_medicamentos.php?action=obtenerDispensaciones')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                mostrarNotificacion('⚠ No hay dispensaciones para exportar', 'warning');
                return;
            }
            
            const csv = 'Paciente,Cédula,Medicamento,Cantidad,Médico,N° Receta,Fecha\n' + 
                data.map(d => 
                    `"${d.paciente || ''}","${d.cedula || ''}","${d.nombre_medicamento || ''}",${d.cantidad},"${d.medico || ''}","${d.numero_receta || ''}","${d.fecha || ''}"`
                ).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dispensaciones_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            mostrarNotificacion('✓ Dispensaciones exportadas', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacion('✗ Error al exportar', 'error');
        });
}

// ========================================
// HISTORIAL DE SOLICITUDES
// ========================================

function actualizarListaSolicitudes() {
    console.log('📥 Actualizando solicitudes...');
    fetch(baseURL + 'api_medicamentos.php?action=obtenerSolicitudes')
        .then(response => {
            console.log('Respuesta status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('✓ Respuesta completa:', data);
            
            // Si hay error
            if (data.error) {
                console.error('Error en API:', data.error);
                const tbody = document.querySelector('#solicitudesTable tbody');
                if (tbody) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: red;">⚠ ${data.error}</td></tr>`;
                }
                return;
            }
            
            // Si es un array, mostrar solicitudes
            if (Array.isArray(data)) {
                console.log('Solicitudes encontradas:', data.length);
                mostrarListaSolicitudes(data);
            } else {
                console.error('Respuesta no es un array:', data);
            }
        })
        .catch(error => {
            console.error('✗ Error cargando solicitudes:', error);
            const tbody = document.querySelector('#solicitudesTable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">Error al cargar solicitudes</td></tr>';
            }
        });
}

function mostrarListaSolicitudes(solicitudes) {
    // Esta función se ejecuta cuando se cargan las solicitudes
    console.log('📋 Solicitudes recibidas del servidor:', solicitudes);
    
    // Filtrar solicitudes eliminadas (por estado o por campo eliminada)
    const solicitudesActivas = solicitudes.filter(s => s.estado !== 'eliminada' && s.eliminada !== true && s.eliminada !== 1);
    
    console.log('Total de solicitudes recibidas:', solicitudes.length);
    console.log('Solicitudes activas (sin eliminadas):', solicitudesActivas.length);
    console.log('Solicitudes eliminadas filtradas:', solicitudes.length - solicitudesActivas.length);
    
    const pendientes = solicitudesActivas.filter(s => s.estado === 'pendiente').length;
    console.log('Solicitudes pendientes:', pendientes);
    
    // Mostrar en la tabla
    mostrarTablaSolicitudes(solicitudesActivas);
}

function mostrarTablaSolicitudes(solicitudes) {
    const tbody = document.querySelector('#solicitudesTable tbody');
    if (!tbody) return;
    
    if (solicitudes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                    No hay solicitudes registradas
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    solicitudes.forEach(sol => {
        const fecha = new Date(sol.fecha_solicitud).toLocaleString('es-ES');
        
        // Colores de estado
        const estadoColor = sol.estado === 'pendiente' ? '#FFC107' : 
                           sol.estado === 'aprobada' ? '#28A745' : '#DC3545';
        const estadoTexto = sol.estado === 'pendiente' ? 'Pendiente' : 
                           sol.estado === 'aprobada' ? 'Aprobada' : 'Rechazada';
        
        // Colores de prioridad
        const prioridadColor = sol.prioridad === 'urgente' ? '#DC3545' : 
                              sol.prioridad === 'alta' ? '#FFC107' : 
                              sol.prioridad === 'media' ? '#17A2B8' : '#6C757D';
        const prioridadTexto = (sol.prioridad || 'media').charAt(0).toUpperCase() + 
                              (sol.prioridad || 'media').slice(1);
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>${sol.medicamento || '--'}</strong></td>
            <td><span style="background-color: #e9ecef; color: #333; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${sol.cantidad || '--'}</span></td>
            <td>
                <span style="background-color: ${prioridadColor}; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                    ${prioridadTexto}
                </span>
            </td>
            <td>${sol.area || '--'}</td>
            <td>
                <span style="background-color: ${estadoColor}; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                    ${estadoTexto}
                </span>
            </td>
            <td><small>${fecha}</small></td>
            <td style="white-space: nowrap;">
                <button class="btn-action btn-aprobar" data-id="${sol.id}" data-medicamento="${sol.medicamento}" data-cantidad="${sol.cantidad}" title="Aceptar solicitud">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-action btn-rechazar" data-id="${sol.id}" title="Rechazar solicitud">
                    <i class="fas fa-times"></i>
                </button>
                <button class="btn-action btn-eliminar" data-id="${sol.id}" data-tipo="solicitud" title="Eliminar solicitud">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
    
    // Añadir event listeners a botones de aprobar
    document.querySelectorAll('.btn-action.btn-aprobar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            const medicamento = this.getAttribute('data-medicamento');
            const cantidad = this.getAttribute('data-cantidad');
            aprobarSolicitud(id, medicamento, cantidad);
        });
    });
    
    // Añadir event listeners a botones de rechazar
    document.querySelectorAll('.btn-action.btn-rechazar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            rechazarSolicitud(id);
        });
    });
    
    // Añadir event listeners a botones de eliminar solicitud
    document.querySelectorAll('.btn-action.btn-eliminar[data-tipo="solicitud"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            eliminarSolicitud(id);
        });
    });
}

function aprobarSolicitud(id, medicamento, cantidad) {
    console.log(`✓ Aprobando solicitud ${id}: ${medicamento} x${cantidad}`);
    
    // Cambiar estado a aprobada en la BD
    const solicitudData = {
        id: id,
        estado: 'aprobada'
    };
    
    fetch(baseURL + 'api_medicamentos.php?action=actualizarSolicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solicitudData)
    })
    .then(response => {
        console.log('Respuesta status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Datos recibidos:', data);
        if (data.success) {
            mostrarNotificacion(`✓ Solicitud aprobada: ${medicamento} x${cantidad}`, 'success');
            actualizarListaSolicitudes();
        } else {
            mostrarNotificacion('✗ Error: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('✗ Error al aprobar solicitud', 'error');
    });
}

function rechazarSolicitud(id) {
    if (confirm('¿Deseas rechazar esta solicitud?')) {
        const solicitudData = {
            id: id,
            estado: 'rechazada'
        };
        
        fetch(baseURL + 'api_medicamentos.php?action=actualizarSolicitud', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(solicitudData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('✓ Solicitud rechazada', 'info');
                actualizarListaSolicitudes();
            } else {
                mostrarNotificacion('✗ Error: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacion('✗ Error al rechazar solicitud', 'error');
        });
    }
}

function eliminarSolicitud(id) {
    console.log('🗑️ Eliminando solicitud:', id);
    
    if (confirm('¿Deseas eliminar esta solicitud?')) {
        const solicitudData = {
            id: id,
            eliminada: true,
            estado: 'eliminada'
        };
        
        fetch(baseURL + 'api_medicamentos.php?action=actualizarSolicitud', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(solicitudData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta de eliminación:', data);
            if (data.success) {
                mostrarNotificacion('✓ Solicitud eliminada', 'success');
                // Remover la fila de la tabla inmediatamente
                const fila = document.querySelector(`[data-id="${id}"]`).closest('tr');
                if (fila) {
                    fila.remove();
                }
                // Actualizar lista
                setTimeout(() => {
                    actualizarListaSolicitudes();
                }, 500);
            } else {
                mostrarNotificacion('✗ Error: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacion('✗ Error al eliminar solicitud', 'error');
        });
    }
}

function mostrarTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Actualizar estilo de botones
    document.querySelectorAll('.btn-tab').forEach(btn => {
        btn.style.borderBottom = 'none';
    });
    
    const tabBtn = event?.target?.closest('.btn-tab');
    if (tabBtn) {
        tabBtn.style.borderBottom = '2px solid #17a2b8';
    }
    
    // Mostrar el tab seleccionado
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.style.display = 'block';
    }
    
    // Si es el historial, actualizar
    if (tabName === 'historial-solicitudes') {
        console.log('Cargando historial de solicitudes...');
        actualizarListaSolicitudes();
    }
}

function mostrarTabDispensacion(tabName) {
    // Ocultar todos los tabs de dispensación
    document.querySelectorAll('#dispensacion-section .tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Actualizar estilo de botones
    document.querySelectorAll('#dispensacion-section .btn-tab').forEach(btn => {
        btn.style.borderBottom = 'none';
    });
    
    const tabBtn = event?.target?.closest('.btn-tab');
    if (tabBtn) {
        tabBtn.style.borderBottom = '2px solid #17a2b8';
    }
    
    // Mostrar el tab seleccionado
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.style.display = 'block';
    }
    
    // Si es el historial, actualizar
    if (tabName === 'historial-dispensaciones') {
        console.log('Cargando historial de dispensaciones...');
        actualizarHistorialDispensaciones();
    }
}

// ========================================
// RECORDATORIOS
// ========================================

function procesarRecordatorio() {
    const titulo = document.getElementById('tituloRecordatorio')?.value.trim();
    const tipo = document.getElementById('tipoRecordatorio')?.value;
    const fechaStr = document.getElementById('fechaRecordatorio')?.value;
    const frecuencia = document.getElementById('frecuenciaRecordatorio')?.value;
    const descripcion = document.getElementById('descripcionRecordatorio')?.value.trim();
    
    console.log('📝 Procesando recordatorio:', { titulo, tipo, fechaStr, frecuencia, descripcion });
    
    // Validaciones
    if (!titulo || titulo.length < 3) {
        mostrarNotificacion('✗ El título debe tener al menos 3 caracteres', 'error');
        return;
    }
    
    if (!tipo) {
        mostrarNotificacion('✗ Selecciona un tipo de recordatorio', 'error');
        return;
    }
    
    if (!fechaStr) {
        mostrarNotificacion('✗ Selecciona una fecha y hora', 'error');
        return;
    }
    
    if (!descripcion || descripcion.length < 5) {
        mostrarNotificacion('✗ La descripción debe tener al menos 5 caracteres', 'error');
        return;
    }
    
    // Convertir fecha de input a formato MySQL
    // Input viene como "2025-12-01T09:00"
    // Queremos "2025-12-01 09:00:00"
    let fecha_prevista = fechaStr.replace('T', ' ');
    if (!fecha_prevista.includes(':')) {
        fecha_prevista = fecha_prevista + ':00:00';
    } else if (fecha_prevista.split(':').length === 2) {
        fecha_prevista = fecha_prevista + ':00';
    }
    
    const recordatorioData = {
        titulo: titulo,
        tipo: tipo,
        fecha_prevista: fecha_prevista,
        frecuencia: frecuencia,
        descripcion: descripcion
    };
    
    console.log('📤 Enviando datos:', recordatorioData);
    console.log('📤 URL:', baseURL + 'api_medicamentos.php?action=guardarRecordatorio');
    
    fetch(baseURL + 'api_medicamentos.php?action=guardarRecordatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordatorioData)
    })
    .then(response => {
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers);
        return response.text();
    })
    .then(text => {
        console.log('📥 Response text:', text);
        try {
            const data = JSON.parse(text);
            console.log('📥 Respuesta parseada:', data);
            
            if (data.success) {
                mostrarNotificacion('✓ Recordatorio programado exitosamente', 'success');
                
                // Limpiar formulario
                document.getElementById('recordatoriosForm').reset();
                
                // Actualizar lista
                setTimeout(() => {
                    actualizarListaRecordatorios();
                }, 500);
                
                // Mostrar historial automáticamente
                setTimeout(() => {
                    mostrarTabRecordatorios('historial-recordatorios');
                }, 1000);
            } else {
                mostrarNotificacion('✗ Error: ' + (data.error || 'Error desconocido'), 'error');
                console.error('❌ Error en respuesta:', data);
            }
        } catch (parseError) {
            console.error('❌ Error parsing JSON:', parseError);
            mostrarNotificacion('✗ Error al procesar respuesta del servidor', 'error');
        }
    })
    .catch(error => {
        console.error('❌ Error en fetch:', error);
        mostrarNotificacion('✗ Error al programar recordatorio: ' + error.message, 'error');
    });
}

function actualizarListaRecordatorios() {
    console.log('🔄 Actualizando lista de recordatorios...');
    
    // Usar filtro 'activos' para no mostrar recordatorios eliminados (cancelados)
    fetch(baseURL + 'api_medicamentos.php?action=obtenerRecordatorios&filtro=activos')
        .then(response => response.json())
        .then(data => {
            console.log('📋 Recordatorios recibidos:', data);
            if (Array.isArray(data)) {
                mostrarRecordatorios(data);
            } else {
                console.error('Error: Respuesta no es un array', data);
                mostrarNotificacion('✗ Error al cargar recordatorios', 'error');
            }
        })
        .catch(error => {
            console.error('Error cargando recordatorios:', error);
            mostrarNotificacion('✗ Error al cargar recordatorios', 'error');
        });
}

function mostrarRecordatorios(recordatorios) {
    const tbody = document.querySelector('#recordatoriosTable tbody');
    
    if (!tbody) {
        console.error('Tabla de recordatorios no encontrada');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!recordatorios || recordatorios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay recordatorios programados</td></tr>';
        return;
    }
    
    recordatorios.forEach(rec => {
        // Iconos por tipo
        const iconosTipo = {
            'vencimiento': '⏰',
            'restock': '📦',
            'revision': '👁️',
            'mantenimiento': '🔧',
            'otro': '📌'
        };
        const icono = iconosTipo[rec.tipo] || '📌';
        
        // Color de estado
        const estadoColor = rec.estado === 'activo' ? '#28a745' : 
                           rec.estado === 'completado' ? '#6c757d' : '#dc3545';
        const estadoTexto = rec.estado === 'activo' ? 'Activo' : 
                           rec.estado === 'completado' ? 'Completado' : 'Cancelado';
        
        // Color de tipo
        const tipoColor = rec.tipo === 'vencimiento' ? '#17a2b8' :
                         rec.tipo === 'restock' ? '#ffc107' :
                         rec.tipo === 'revision' ? '#007bff' :
                         rec.tipo === 'mantenimiento' ? '#e83e8c' : '#6c757d';
        
        // Obtener el ID correcto (puede venir como id_recordatorio o id)
        const recordatorioId = rec.id_recordatorio || rec.id;
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${icono} ${rec.titulo}</td>
            <td><span style="background-color: ${tipoColor}; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">${rec.tipo}</span></td>
            <td><span style="background-color: #e9ecef; color: #333; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${rec.frecuencia}</span></td>
            <td><small>${rec.proxima_ejecucion || rec.fecha_prevista}</small></td>
            <td><span style="background-color: ${estadoColor}; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">${estadoTexto}</span></td>
            <td><small>${rec.descripcion.substring(0, 50)}${rec.descripcion.length > 50 ? '...' : ''}</small></td>
            <td style="white-space: nowrap;">
                <button class="btn-action btn-ver-detalles" data-id="${recordatorioId}" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-editar" data-id="${recordatorioId}" title="Editar recordatorio">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-eliminar" data-id="${recordatorioId}" title="Eliminar recordatorio">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
    
    // Añadir event listeners a los botones
    document.querySelectorAll('.btn-action.btn-ver-detalles').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            verDetallesRecordatorio(id);
        });
    });
    
    document.querySelectorAll('.btn-action.btn-editar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            // Verificar si es recordatorio o medicamento basándose en contexto
            if (this.closest('#recordatoriosTable')) {
                editarRecordatorio(id);
            }
        });
    });
    
    document.querySelectorAll('.btn-action.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            // Verificar si es recordatorio basándose en contexto
            if (this.closest('#recordatoriosTable')) {
                eliminarRecordatorioFn(id);
            }
        });
    });
}

function verDetallesRecordatorio(id) {
    console.log('👁️ Viendo detalles del recordatorio:', id);
    
    if (!id) {
        mostrarNotificacion('✗ Error: ID no válido', 'error');
        return;
    }
    
    // Buscar el recordatorio
    fetch(baseURL + 'api_medicamentos.php?action=obtenerRecordatorios&filtro=todos')
        .then(response => response.json())
        .then(recordatorios => {
            const recordatorio = recordatorios.find(r => (r.id_recordatorio || r.id) == id);
            
            if (!recordatorio) {
                mostrarNotificacion('✗ No se encontró el recordatorio', 'error');
                return;
            }
            
            // Crear modal de detalles
            const detallesHTML = `
                <div class="modal" id="modalDetallesRecordatorio" style="display: flex;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2><i class="fas fa-clock"></i> Detalles del Recordatorio</h2>
                            <button class="modal-close" onclick="document.getElementById('modalDetallesRecordatorio').remove(); document.getElementById('modalOverlay').style.display = 'none';">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="detalles-grid">
                                <div class="detalle-item">
                                    <label><strong>Título:</strong></label>
                                    <p>${recordatorio.titulo}</p>
                                </div>
                                <div class="detalle-item">
                                    <label><strong>Tipo:</strong></label>
                                    <p><span style="background-color: #17a2b8; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${recordatorio.tipo}</span></p>
                                </div>
                                <div class="detalle-item">
                                    <label><strong>Frecuencia:</strong></label>
                                    <p>${recordatorio.frecuencia}</p>
                                </div>
                                <div class="detalle-item">
                                    <label><strong>Estado:</strong></label>
                                    <p><span style="background-color: ${recordatorio.estado === 'activo' ? '#28a745' : '#6c757d'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${recordatorio.estado}</span></p>
                                </div>
                                <div class="detalle-item full-width">
                                    <label><strong>Descripción:</strong></label>
                                    <p>${recordatorio.descripcion}</p>
                                </div>
                                <div class="detalle-item">
                                    <label><strong>Próxima Ejecución:</strong></label>
                                    <p>${recordatorio.proxima_ejecucion || recordatorio.fecha_prevista || '--'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="document.getElementById('modalDetallesRecordatorio').remove(); document.getElementById('modalOverlay').style.display = 'none';">Cerrar</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Mostrar overlay y modal
            const overlay = document.getElementById('modalOverlay');
            if (overlay) overlay.style.display = 'block';
            
            // Insertar modal
            document.body.insertAdjacentHTML('beforeend', detallesHTML);
        })
        .catch(error => {
            console.error('Error cargando recordatorio:', error);
            mostrarNotificacion('✗ Error al cargar los detalles', 'error');
        });
}

function editarRecordatorio(id) {
    console.log('✎ Editando recordatorio:', id);
    
    if (!id) {
        mostrarNotificacion('✗ Error: ID no válido', 'error');
        return;
    }
    
    // Buscar el recordatorio en la lista
    fetch(baseURL + 'api_medicamentos.php?action=obtenerRecordatorios&filtro=todos')
        .then(response => response.json())
        .then(recordatorios => {
            const recordatorio = recordatorios.find(r => (r.id_recordatorio || r.id) == id);
            
            if (!recordatorio) {
                mostrarNotificacion('✗ No se encontró el recordatorio', 'error');
                return;
            }
            
            console.log('✎ Datos del recordatorio:', recordatorio);
            
            // Llenar el formulario con los datos
            document.getElementById('tituloRecordatorio').value = recordatorio.titulo;
            document.getElementById('tipoRecordatorio').value = recordatorio.tipo;
            document.getElementById('frecuenciaRecordatorio').value = recordatorio.frecuencia;
            document.getElementById('descripcionRecordatorio').value = recordatorio.descripcion;
            
            // Convertir fecha MySQL a input datetime-local
            // Formato MySQL: "2025-11-09 19:14:00"
            // Formato input: "2025-11-09T19:14"
            const fechaObj = new Date(recordatorio.fecha_prevista);
            const fechaISO = fechaObj.toISOString().slice(0, 16);
            document.getElementById('fechaRecordatorio').value = fechaISO;
            
            // Cambiar el botón de envío a "Actualizar"
            const form = document.getElementById('recordatoriosForm');
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar';
            submitBtn.onclick = function(e) {
                e.preventDefault();
                actualizarRecordatorio(id);
            };
            
            // Cambiar el título
            form.onsubmit = function(e) {
                e.preventDefault();
                actualizarRecordatorio(id);
            };
            
            // Mostrar el formulario (tab nueva-recordatorio)
            mostrarTabRecordatorios('nueva-recordatorio');
            
            // Scroll al formulario
            document.getElementById('nueva-recordatorio').scrollIntoView({ behavior: 'smooth' });
            
            mostrarNotificacion('✓ Formulario cargado para editar', 'success');
        })
        .catch(error => {
            console.error('Error cargando recordatorio:', error);
            mostrarNotificacion('✗ Error al cargar el recordatorio', 'error');
        });
}

function eliminarRecordatorioFn(id) {
    console.log('🗑️ Función eliminar llamada con ID:', id, 'Tipo:', typeof id);
    
    // Convertir a número si es string
    const idNumero = parseInt(id, 10);
    
    if (!idNumero || idNumero <= 0) {
        console.error('❌ ID inválido:', id);
        mostrarNotificacion('✗ Error: ID no válido', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de que deseas eliminar este recordatorio?')) {
        console.log('🗑️ Eliminando recordatorio:', idNumero);
        
        const datos = { id: idNumero };
        
        console.log('📤 Enviando:', datos);
        console.log('📤 URL:', baseURL + 'api_medicamentos.php?action=eliminarRecordatorio');
        
        fetch(baseURL + 'api_medicamentos.php?action=eliminarRecordatorio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })
        .then(response => {
            console.log('📥 Response status:', response.status);
            return response.text();
        })
        .then(text => {
            console.log('📥 Response text:', text);
            try {
                const data = JSON.parse(text);
                console.log('📥 Respuesta parseada:', data);
                
                if (data.success) {
                    mostrarNotificacion('✓ Recordatorio eliminado correctamente', 'success');
                    setTimeout(() => {
                        actualizarListaRecordatorios();
                    }, 500);
                } else {
                    mostrarNotificacion('✗ Error: ' + (data.error || 'Error desconocido'), 'error');
                    console.error('❌ Error en respuesta:', data);
                }
            } catch (parseError) {
                console.error('❌ Error parsing JSON:', parseError);
                mostrarNotificacion('✗ Error al procesar respuesta', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Error en fetch:', error);
            mostrarNotificacion('✗ Error al eliminar recordatorio: ' + error.message, 'error');
        });
    } else {
        console.log('⚠️ Usuario canceló la eliminación');
    }
}

function actualizarRecordatorio(id) {
    const titulo = document.getElementById('tituloRecordatorio')?.value.trim();
    const tipo = document.getElementById('tipoRecordatorio')?.value;
    const fechaStr = document.getElementById('fechaRecordatorio')?.value;
    const frecuencia = document.getElementById('frecuenciaRecordatorio')?.value;
    const descripcion = document.getElementById('descripcionRecordatorio')?.value.trim();
    
    console.log('✏️ Actualizando recordatorio:', { id, titulo, tipo, fechaStr, frecuencia, descripcion });
    
    // Validaciones
    if (!titulo || titulo.length < 3) {
        mostrarNotificacion('✗ El título debe tener al menos 3 caracteres', 'error');
        return;
    }
    
    if (!tipo) {
        mostrarNotificacion('✗ Selecciona un tipo de recordatorio', 'error');
        return;
    }
    
    if (!fechaStr) {
        mostrarNotificacion('✗ Selecciona una fecha y hora', 'error');
        return;
    }
    
    if (!descripcion || descripcion.length < 5) {
        mostrarNotificacion('✗ La descripción debe tener al menos 5 caracteres', 'error');
        return;
    }
    
    // Convertir fecha
    let fecha_prevista = fechaStr.replace('T', ' ');
    if (!fecha_prevista.includes(':')) {
        fecha_prevista = fecha_prevista + ':00:00';
    } else if (fecha_prevista.split(':').length === 2) {
        fecha_prevista = fecha_prevista + ':00';
    }
    
    const recordatorioData = {
        id: id,
        titulo: titulo,
        tipo: tipo,
        fecha_prevista: fecha_prevista,
        frecuencia: frecuencia,
        descripcion: descripcion
    };
    
    console.log('📤 Enviando actualización:', recordatorioData);
    
    fetch(baseURL + 'api_medicamentos.php?action=actualizarRecordatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordatorioData)
    })
    .then(response => response.text())
    .then(text => {
        console.log('📥 Response:', text);
        try {
            const data = JSON.parse(text);
            
            if (data.success) {
                mostrarNotificacion('✓ Recordatorio actualizado exitosamente', 'success');
                
                // Limpiar formulario y restaurar estado original
                document.getElementById('recordatoriosForm').reset();
                const submitBtn = document.getElementById('recordatoriosForm').querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-bell"></i> Programar';
                submitBtn.onclick = null;
                document.getElementById('recordatoriosForm').onsubmit = function(e) {
                    e.preventDefault();
                    procesarRecordatorio();
                };
                
                // Actualizar lista y mostrar historial
                setTimeout(() => {
                    actualizarListaRecordatorios();
                    mostrarTabRecordatorios('historial-recordatorios');
                }, 500);
            } else {
                mostrarNotificacion('✗ Error: ' + (data.error || 'Error desconocido'), 'error');
                console.error('Error:', data);
            }
        } catch (parseError) {
            console.error('Error parsing:', parseError);
            mostrarNotificacion('✗ Error al procesar respuesta', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('✗ Error al actualizar recordatorio', 'error');
    });
}

function mostrarTabRecordatorios(tabName) {
    console.log('📋 Abriendo tab:', tabName);
    
    // Ocultar todos los tabs de recordatorios
    document.querySelectorAll('.tab-content-recordatorios').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Actualizar estilo de botones (usar btn-tab genérico)
    const btnTabs = document.querySelectorAll('#recordatorios-section .btn-tab');
    btnTabs.forEach(btn => {
        btn.style.borderBottom = 'none';
        btn.classList.remove('active');
    });
    
    // Obtener el botón clickeado desde el evento
    if (event && event.target) {
        const tabBtn = event.target.closest('.btn-tab');
        if (tabBtn) {
            tabBtn.style.borderBottom = '2px solid #17a2b8';
            tabBtn.classList.add('active');
        }
    }
    
    // Mostrar el tab seleccionado
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.style.display = 'block';
    }
    
    // Si es historial, actualizar datos
    if (tabName === 'historial-recordatorios') {
        console.log('📋 Cargando historial de recordatorios...');
        setTimeout(() => {
            actualizarListaRecordatorios();
        }, 100);
    }
}

// ============================================
// GESTIÓN DE USUARIOS
// ============================================

// Inicializar el formulario de usuarios
document.addEventListener('DOMContentLoaded', function() {
    const usuariosForm = document.getElementById('usuariosForm');
    if (usuariosForm) {
        usuariosForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registrarUsuario();
        });
        console.log('✓ Formulario de usuarios inicializado');
    }
});

function registrarUsuario() {
    console.log('👤 Registrando usuario...');
    
    // Obtener valores del formulario
    const nombre = document.getElementById('nombreUsuario')?.value;
    const email = document.getElementById('emailUsuario')?.value;
    const rol = document.getElementById('rolUsuario')?.value;
    
    // Validaciones
    if (!nombre || nombre.length < 3) {
        mostrarNotificacion('✗ El nombre debe tener al menos 3 caracteres', 'error');
        console.error('❌ Nombre inválido:', nombre);
        return;
    }
    
    if (!email || !email.includes('@')) {
        mostrarNotificacion('✗ El email no es válido', 'error');
        console.error('❌ Email inválido:', email);
        return;
    }
    
    if (!rol) {
        mostrarNotificacion('✗ Debe seleccionar un rol', 'error');
        console.error('❌ Rol no seleccionado');
        return;
    }
    
    // Preparar datos
    const datosUsuario = {
        nombre: nombre,
        email: email,
        rol: rol
    };
    
    console.log('📤 Enviando datos:', datosUsuario);
    
    // Enviar al servidor
    fetch(baseURL + 'api_medicamentos.php?action=guardarUsuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
    })
    .then(response => {
        console.log('📥 Response status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('📥 Response text:', text);
        const data = JSON.parse(text);
        
        if (data.success) {
            console.log('✓ Usuario registrado correctamente');
            mostrarNotificacion('✓ Usuario registrado correctamente', 'success');
            
            // Limpiar formulario
            document.getElementById('usuariosForm').reset();
            
            // Recargar lista de usuarios si existe
            setTimeout(() => {
                cargarUsuarios();
            }, 500);
        } else {
            console.error('❌ Error:', data.error);
            mostrarNotificacion('✗ Error: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('❌ Error en la solicitud:', error);
        mostrarNotificacion('✗ Error en la solicitud: ' + error.message, 'error');
    });
}

function cargarUsuarios() {
    console.log('👥 Cargando lista de usuarios...');
    
    fetch(baseURL + 'api_medicamentos.php?action=obtenerUsuarios')
        .then(response => response.json())
        .then(data => {
            console.log('📥 Usuarios recibidos:', data);
            if (Array.isArray(data)) {
                mostrarTablaUsuarios(data);
            } else if (data.error) {
                console.error('❌ Error:', data.error);
                mostrarNotificacion('Error al cargar usuarios: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Error cargando usuarios:', error);
            mostrarNotificacion('Error al cargar usuarios', 'error');
        });
}

function mostrarTablaUsuarios(usuarios) {
    console.log('📊 Mostrando tabla de usuarios:', usuarios);
    
    // Crear tabla HTML
    let html = `
    <div class="table-responsive">
        <table class="medicamentos-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Registrado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (usuarios.length === 0) {
        html += `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">
                    <i class="fas fa-inbox"></i> No hay usuarios registrados
                </td>
            </tr>
        `;
    } else {
        usuarios.forEach(usuario => {
            console.log('👤 Usuario:', usuario.nombre, '- Rol:', usuario.rol, '- Tipo:', typeof usuario.rol);
            
            const rolBadge = usuario.rol ? `<span class="badge badge-info">${usuario.rol}</span>` : '<span class="badge badge-secondary">Sin rol</span>';
            
            html += `
            <tr>
                <td><strong>${usuario.nombre}</strong></td>
                <td>${usuario.email}</td>
                <td>${rolBadge}</td>
                <td>${new Date(usuario.creado_en).toLocaleDateString('es-ES')}</td>
                <td style="white-space: nowrap;">
                    <button class="btn-action btn-ver-detalles" data-id="${usuario.id_usuario}" data-action="view">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-editar" data-id="${usuario.id_usuario}" data-action="edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-eliminar" data-id="${usuario.id_usuario}" data-action="delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        });
    }
    
    html += `
            </tbody>
        </table>
    </div>
    `;
    
    // Insertar en la página
    const container = document.getElementById('tabla-usuarios');
    if (container) {
        container.innerHTML = html;
        console.log('✓ Tabla de usuarios actualizada');
    }
}

// Event delegation para botones de usuarios
document.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    
    const container = document.getElementById('tabla-usuarios');
    if (!container || !container.contains(button)) return;
    
    const id = button.getAttribute('data-id');
    const action = button.getAttribute('data-action');
    
    if (action === 'view') {
        verDetallesUsuario(id);
    } else if (action === 'edit') {
        editarUsuario(id);
    } else if (action === 'delete') {
        eliminarUsuarioFn(id);
    }
}, true);

function verDetallesUsuario(id) {
    console.log('👁️ Viendo detalles del usuario:', id);
    
    if (!id) {
        mostrarNotificacion('✗ Error: ID no válido', 'error');
        return;
    }
    
    // Obtener datos del usuario desde la tabla
    const fila = document.querySelector(`[data-id="${id}"]`).closest('tr');
    if (!fila) {
        mostrarNotificacion('✗ Error: No se encontró el usuario', 'error');
        return;
    }
    
    const nombre = fila.cells[0].textContent.trim();
    const email = fila.cells[1].textContent.trim();
    const rol = fila.cells[2].textContent.trim();
    const fechaRegistro = fila.cells[3].textContent.trim();
    
    // Crear modal de detalles
    const detallesHTML = `
        <div class="modal" id="modalDetallesUsuario" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-user"></i> Detalles del Usuario</h2>
                    <button class="modal-close" onclick="document.getElementById('modalDetallesUsuario').remove(); document.getElementById('modalOverlay').style.display = 'none';">×</button>
                </div>
                <div class="modal-body">
                    <div class="detalles-grid">
                        <div class="detalle-item">
                            <label><strong>Nombre:</strong></label>
                            <p>${nombre}</p>
                        </div>
                        <div class="detalle-item">
                            <label><strong>Email:</strong></label>
                            <p>${email}</p>
                        </div>
                        <div class="detalle-item">
                            <label><strong>Rol:</strong></label>
                            <p><span style="background-color: #17a2b8; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${rol}</span></p>
                        </div>
                        <div class="detalle-item">
                            <label><strong>Registrado:</strong></label>
                            <p>${fechaRegistro}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('modalDetallesUsuario').remove(); document.getElementById('modalOverlay').style.display = 'none';">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    // Mostrar overlay y modal
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.style.display = 'block';
    
    // Insertar modal
    document.body.insertAdjacentHTML('beforeend', detallesHTML);
}

function editarUsuario(id) {
    console.log('✎ Editando usuario con ID:', id);
    
    // Obtener datos del usuario desde la tabla
    const fila = document.querySelector(`[data-id="${id}"]`).closest('tr');
    const nombre = fila.cells[0].textContent.trim();
    const email = fila.cells[1].textContent.trim();
    const rolCell = fila.cells[2].textContent.trim();
    
    console.log('📊 Datos extraídos - Nombre:', nombre, 'Email:', email, 'Rol (raw):', rolCell);
    
    // Mapear rol de display a valor (según ENUM de BD actualizado)
    const rolMap = {
        'FARMACEUTICO': 'farmaceutico',
        'AUXILIAR DE FARMACIA': 'auxiliar',
        'AUXILIAR': 'auxiliar',
        'ADMINISTRADOR': 'administrador',
        'MEDICO': 'medico',
        'ADMIN': 'admin',
        'CLIENTE': 'cliente',
        'OTRO': 'otro',
        '': '' // Si está vacío, mantener vacío
    };
    
    // Convertir a mayúsculas para el mapeo
    const rolUpper = rolCell.toUpperCase();
    const rol = rolMap[rolUpper] || '';
    
    console.log('🔄 Rol mapeado:', rol);
    
    // Crear modal de edición
    const modalHTML = `
        <div class="modal" id="modalEditarUsuario" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Editar Usuario</h2>
                    <button class="modal-close" onclick="document.getElementById('modalEditarUsuario').remove();">×</button>
                </div>
                <div class="modal-body">
                    <form id="formularioEditar">
                        <div class="form-group">
                            <label>Nombre</label>
                            <input type="text" id="editNombre" value="${nombre}" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="editEmail" value="${email}" required>
                        </div>
                        <div class="form-group">
                            <label>Rol</label>
                            <select id="editRol" required>
                                <option value="farmaceutico" ${rol === 'farmaceutico' ? 'selected' : ''}>Farmacéutico</option>
                                <option value="auxiliar" ${rol === 'auxiliar' ? 'selected' : ''}>Auxiliar de Farmacia</option>
                                <option value="administrador" ${rol === 'administrador' ? 'selected' : ''}>Administrador</option>
                                <option value="medico" ${rol === 'medico' ? 'selected' : ''}>Médico</option>
                                <option value="admin" ${rol === 'admin' ? 'selected' : ''}>Admin</option>
                                <option value="cliente" ${rol === 'cliente' ? 'selected' : ''}>Cliente</option>
                                <option value="otro" ${rol === 'otro' ? 'selected' : ''}>Otro</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('modalEditarUsuario').remove();">Cancelar</button>
                    <button class="btn-primary" onclick="guardarEdicionUsuario(${id})">Guardar Cambios</button>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const modalAnterior = document.getElementById('modalEditarUsuario');
    if (modalAnterior) modalAnterior.remove();
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function guardarEdicionUsuario(id) {
    console.log('💾 Guardando edición para usuario:', id);
    
    // Convertir id a número
    id = parseInt(id, 10);
    
    const nombre = document.getElementById('editNombre')?.value;
    const email = document.getElementById('editEmail')?.value;
    const rol = document.getElementById('editRol')?.value;
    
    if (!nombre || !email || !rol) {
        mostrarNotificacion('✗ Todos los campos son requeridos', 'error');
        return;
    }
    
    const datosActualizados = {
        id_usuario: id,
        nombre: nombre,
        email: email,
        rol: rol
    };
    
    console.log('📤 Enviando cambios:', datosActualizados);
    
    fetch(baseURL + 'api_medicamentos.php?action=actualizarUsuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
    })
    .then(response => response.text())
    .then(text => {
        console.log('📥 Response:', text);
        const data = JSON.parse(text);
        
        if (data.success) {
            console.log('✓ Usuario actualizado');
            mostrarNotificacion('✓ Usuario actualizado correctamente', 'success');
            document.getElementById('modalEditarUsuario')?.remove();
            cargarUsuarios();
        } else {
            console.error('❌ Error:', data.error);
            mostrarNotificacion('Error: ' + (data.error || 'Error desconocido'), 'error');
        }
    })
    .catch(error => {
        console.error('❌ Error:', error);
        mostrarNotificacion('Error al actualizar usuario: ' + error.message, 'error');
    });
}

function eliminarUsuarioFn(id) {
    console.log('🗑️ Eliminando usuario con ID:', id);
    
    // Obtener nombre del usuario desde la tabla
    const fila = document.querySelector(`button[data-id="${id}"]`).closest('tr');
    const nombre = fila.cells[0].textContent.trim();
    
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombre}"?`)) {
        fetch(baseURL + 'api_medicamentos.php?action=eliminarUsuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_usuario: id })
        })
        .then(response => response.text())
        .then(text => {
            console.log('📥 Response:', text);
            const data = JSON.parse(text);
            
            if (data.success) {
                console.log('✓ Usuario eliminado');
                mostrarNotificacion('✓ Usuario eliminado correctamente', 'success');
                cargarUsuarios();
            } else {
                console.error('❌ Error:', data.error);
                mostrarNotificacion('Error: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error al eliminar usuario', 'error');
        });
    }
}

console.log('✓ Sistema de medicamentos cargado');

