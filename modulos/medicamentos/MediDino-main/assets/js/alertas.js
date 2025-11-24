// ========================================
// SISTEMA DE ALERTAS DE INVENTARIO
// ========================================

// Variables globales
let configuracionAlertas = {
    umbralCritico: 0,
    umbralBajo: 10,
    umbralMinimo: 20,
    alertaTemprana: 60,
    alertaUrgente: 30,
    emailNotificaciones: true,
    alertasSonido: true,
    reporteDiario: false
};

let medicamentosInventario = [
    {
        id: 1,
        nombre: 'Acetaminofén 500mg',
        stock: 250,
        stockMinimo: 50,
        fechaVencimiento: '2025-02-15',
        ultimaVenta: '2025-01-14T10:30'
    },
    {
        id: 2,
        nombre: 'Ibuprofeno 400mg',
        stock: 8,
        stockMinimo: 20,
        fechaVencimiento: '2025-06-20',
        ultimaVenta: '2025-01-15T14:20'
    },
    {
        id: 3,
        nombre: 'Omeprazol 20mg',
        stock: 0,
        stockMinimo: 15,
        fechaVencimiento: '2025-08-10',
        ultimaVenta: '2025-01-13T16:45'
    },
    {
        id: 4,
        nombre: 'Loratadina 10mg',
        stock: 180,
        stockMinimo: 25,
        fechaVencimiento: '2025-02-28',
        ultimaVenta: '2025-01-15T09:15'
    },
    {
        id: 5,
        nombre: 'Amoxicilina 500mg',
        stock: 0,
        stockMinimo: 30,
        fechaVencimiento: '2025-05-15',
        ultimaVenta: '2025-01-14T11:20'
    },
    {
        id: 8,
        nombre: 'Metformina 850mg',
        stock: 0,
        stockMinimo: 40,
        fechaVencimiento: '2025-07-30',
        ultimaVenta: '2025-01-15T17:30'
    },
    {
        id: 9,
        nombre: 'Diclofenaco 50mg',
        stock: 5,
        stockMinimo: 15,
        fechaVencimiento: '2025-04-12',
        ultimaVenta: '2025-01-15T12:10'
    },
    {
        id: 10,
        nombre: 'Captopril 25mg',
        stock: 7,
        stockMinimo: 20,
        fechaVencimiento: '2025-03-08',
        ultimaVenta: '2025-01-14T15:45'
    },
    {
        id: 11,
        nombre: 'Losartán 50mg',
        stock: 3,
        stockMinimo: 25,
        fechaVencimiento: '2025-09-22',
        ultimaVenta: '2025-01-15T08:30'
    }
];

// Inicialización del sistema
document.addEventListener('DOMContentLoaded', function() {
    initializarSistema();
    setupEventListeners();
    actualizarDashboard();
});

function initializarSistema() {
    // Configurar sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (sidebarToggle && sidebar && overlay) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // Cargar configuración guardada
    cargarConfiguracion();
    
    console.log('🔔 Sistema de alertas de inventario inicializado');
}

function setupEventListeners() {
    // Event listeners para configuración
    const configuracionInputs = [
        'umbralCritico', 'umbralBajo', 'umbralMinimo',
        'alertaTemprana', 'alertaUrgente'
    ];

    configuracionInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', validarConfiguracion);
        }
    });

    // Event listeners para toggles
    const toggles = ['emailNotificaciones', 'alertasSonido', 'reporteDiario'];
    toggles.forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', actualizarConfiguracion);
        }
    });
}

function actualizarDashboard() {
    const alertas = generarAlertas();
    actualizarEstadisticas(alertas);
    renderizarListaAlertas(alertas);
    actualizarVisibilidadSecciones(alertas);
}

function renderizarListaAlertas(alertas) {
    const alertasContainer = document.getElementById('activeAlertsList');
    const noAlertsState = document.getElementById('noAlertsState');
    const alertCounter = document.getElementById('alertCounter');
    const alertCount = document.getElementById('alertCount');
    
    if (!alertasContainer || !noAlertsState || !alertCount) return;

    // Calcular total de alertas
    const totalAlertas = alertas.agotados.length + alertas.stockBajo.length + alertas.proximosVencer.length;
    
    // Actualizar contador
    alertCount.textContent = totalAlertas;
    
    if (totalAlertas === 0) {
        // Mostrar estado "Todo en Orden"
        noAlertsState.style.display = 'block';
        alertasContainer.style.display = 'none';
        alertCounter.style.display = 'none';
    } else {
        // Mostrar lista de alertas
        noAlertsState.style.display = 'none';
        alertasContainer.style.display = 'block';
        alertCounter.style.display = 'block';
        
        // Generar HTML de alertas
        let alertasHTML = '';
        
        // Alertas críticas (agotados)
        alertas.agotados.forEach(med => {
            const ultimaVenta = new Date(med.ultimaVenta).toLocaleDateString('es-ES');
            alertasHTML += `
                <div class="alert-item-dynamic critical">
                    <div class="alert-icon-dynamic">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <div class="alert-content-dynamic">
                        <div class="alert-title-dynamic">Medicamento Agotado: ${med.nombre}</div>
                        <div class="alert-description-dynamic">Stock: 0 unidades • Última venta: ${ultimaVenta}</div>
                    </div>
                    <div class="alert-actions-dynamic">
                        <button class="btn-alert-action btn-alert-primary" onclick="reabastecer(${med.id})">
                            <i class="fas fa-plus"></i> Reabastecer
                        </button>
                        <button class="btn-alert-action btn-alert-secondary" onclick="verDetalles(${med.id})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                    </div>
                </div>
            `;
        });
        
        // Alertas de stock bajo
        alertas.stockBajo.forEach(med => {
            alertasHTML += `
                <div class="alert-item-dynamic warning">
                    <div class="alert-icon-dynamic">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-content-dynamic">
                        <div class="alert-title-dynamic">Stock Bajo: ${med.nombre}</div>
                        <div class="alert-description-dynamic">Stock actual: ${med.stock} unidades • Mínimo requerido: ${med.stockMinimo}</div>
                    </div>
                    <div class="alert-actions-dynamic">
                        <button class="btn-alert-action btn-alert-primary" onclick="reabastecer(${med.id})">
                            <i class="fas fa-shopping-cart"></i> Comprar
                        </button>
                        <button class="btn-alert-action btn-alert-secondary" onclick="verDetalles(${med.id})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                    </div>
                </div>
            `;
        });
        
        // Alertas de vencimiento
        alertas.proximosVencer.forEach(med => {
            const hoy = new Date();
            const fechaVenc = new Date(med.fechaVencimiento);
            const diasParaVencer = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
            const fechaFormateada = fechaVenc.toLocaleDateString('es-ES');
            
            alertasHTML += `
                <div class="alert-item-dynamic info">
                    <div class="alert-icon-dynamic">
                        <i class="fas fa-calendar-times"></i>
                    </div>
                    <div class="alert-content-dynamic">
                        <div class="alert-title-dynamic">Próximo a Vencer: ${med.nombre}</div>
                        <div class="alert-description-dynamic">Vence en ${diasParaVencer} días (${fechaFormateada}) • Stock: ${med.stock} unidades</div>
                    </div>
                    <div class="alert-actions-dynamic">
                        <button class="btn-alert-action btn-alert-primary" onclick="gestionarVencimiento(${med.id})">
                            <i class="fas fa-calendar-check"></i> Gestionar
                        </button>
                        <button class="btn-alert-action btn-alert-secondary" onclick="verDetalles(${med.id})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                    </div>
                </div>
            `;
        });
        
        alertasContainer.innerHTML = alertasHTML;
    }
}

function actualizarVisibilidadSecciones(alertas) {
    const criticalAlertsExpanded = document.getElementById('criticalAlertsExpanded');
    const totalAlertas = alertas.agotados.length + alertas.stockBajo.length + alertas.proximosVencer.length;
    
    if (criticalAlertsExpanded) {
        // Solo mostrar secciones expandidas si hay alertas
        criticalAlertsExpanded.style.display = totalAlertas > 0 ? 'block' : 'none';
    }
}

function gestionarVencimiento(medicamentoId) {
    const medicamento = medicamentosInventario.find(med => med.id === medicamentoId);
    if (medicamento) {
        const hoy = new Date();
        const fechaVenc = new Date(medicamento.fechaVencimiento);
        const diasParaVencer = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
        
        const opciones = [
            'Promoción especial para agotar stock',
            'Transferir a otra sucursal',
            'Contactar proveedor para devolución',
            'Marcar para descuento por vencimiento próximo'
        ];
        
        let mensaje = `Gestión de vencimiento para ${medicamento.nombre}\n`;
        mensaje += `Vence en ${diasParaVencer} días\n`;
        mensaje += `Stock actual: ${medicamento.stock} unidades\n\n`;
        mensaje += 'Seleccione una opción:\n';
        opciones.forEach((opcion, index) => {
            mensaje += `${index + 1}. ${opcion}\n`;
        });
        
        const seleccion = prompt(mensaje + '\nIngrese el número de opción (1-4):');
        
        if (seleccion && seleccion >= 1 && seleccion <= 4) {
            const opcionSeleccionada = opciones[seleccion - 1];
            mostrarNotificacion('success', `Acción programada: ${opcionSeleccionada}`);
        }
    }
}

function actualizarDashboard() {
    const alertas = generarAlertas();
    actualizarEstadisticas(alertas);
    // Las alertas ya están renderizadas estáticamente en el HTML
    // En una implementación real, aquí se actualizarían dinámicamente
}

function generarAlertas() {
    const hoy = new Date();
    
    const agotados = medicamentosInventario.filter(med => 
        med.stock <= configuracionAlertas.umbralCritico
    );

    const stockBajo = medicamentosInventario.filter(med => 
        med.stock > configuracionAlertas.umbralCritico && 
        med.stock <= configuracionAlertas.umbralBajo
    );

    const proximosVencer = medicamentosInventario.filter(med => {
        const fechaVenc = new Date(med.fechaVencimiento);
        const diasParaVencer = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
        return diasParaVencer <= configuracionAlertas.alertaTemprana && diasParaVencer > 0;
    });

    return {
        agotados,
        stockBajo,
        proximosVencer
    };
}

function actualizarEstadisticas(alertas) {
    // Actualizar números en las tarjetas de estadísticas
    const statCards = document.querySelectorAll('.stat-number');
    if (statCards.length >= 3) {
        statCards[0].textContent = alertas.agotados.length;
        statCards[1].textContent = alertas.stockBajo.length;
        statCards[2].textContent = alertas.proximosVencer.length;
    }

    // Actualizar contadores en las alertas
    const alertCounts = document.querySelectorAll('.alert-count');
    if (alertCounts.length >= 3) {
        alertCounts[0].textContent = alertas.agotados.length;
        alertCounts[1].textContent = alertas.stockBajo.length;
        alertCounts[2].textContent = alertas.proximosVencer.length;
    }
}

// Funciones de interacción
function actualizarAlertas() {
    mostrarNotificacion('info', 'Actualizando alertas de inventario...');
    
    // Simular actualización
    setTimeout(() => {
        actualizarDashboard();
        mostrarNotificacion('success', 'Alertas actualizadas correctamente');
    }, 1500);
}

function simularSinAlertas() {
    // Función para demostrar el estado "Todo en Orden"
    // Temporalmente modificar el inventario para que no haya alertas
    const inventarioOriginal = [...medicamentosInventario];
    
    // Ajustar stock para que no haya alertas
    medicamentosInventario.forEach(med => {
        med.stock = Math.max(med.stockMinimo + 20, 50); // Stock suficiente
        // Ajustar fechas de vencimiento para que sean futuras
        const fechaFutura = new Date();
        fechaFutura.setMonth(fechaFutura.getMonth() + 6);
        med.fechaVencimiento = fechaFutura.toISOString().split('T')[0];
    });
    
    actualizarDashboard();
    mostrarNotificacion('info', 'Simulando estado "Todo en Orden" (sin alertas)');
    
    // Restaurar después de 10 segundos
    setTimeout(() => {
        medicamentosInventario.splice(0, medicamentosInventario.length, ...inventarioOriginal);
        actualizarDashboard();
        mostrarNotificacion('info', 'Estado de alertas restaurado');
    }, 10000);
}

function configurarAlertas() {
    // Scroll suave hacia la sección de configuración
    const configSection = document.querySelector('.config-section');
    if (configSection) {
        configSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function reabastecer(medicamentoId) {
    const medicamento = medicamentosInventario.find(med => med.id === medicamentoId);
    if (medicamento) {
        const cantidadSugerida = Math.max(medicamento.stockMinimo * 2, 50);
        const confirmacion = confirm(
            `¿Desea crear una orden de compra para ${medicamento.nombre}?\n` +
            `Cantidad sugerida: ${cantidadSugerida} unidades`
        );
        
        if (confirmacion) {
            // Simular creación de orden
            medicamento.stock += cantidadSugerida;
            mostrarNotificacion('success', `Orden de compra creada para ${medicamento.nombre}`);
            actualizarDashboard();
        }
    }
}

function verDetalles(medicamentoId) {
    const medicamento = medicamentosInventario.find(med => med.id === medicamentoId);
    if (medicamento) {
        const fechaVenc = new Date(medicamento.fechaVencimiento);
        const fechaFormateada = fechaVenc.toLocaleDateString('es-ES');
        
        alert(
            `Detalles de ${medicamento.nombre}\n\n` +
            `Stock actual: ${medicamento.stock} unidades\n` +
            `Stock mínimo: ${medicamento.stockMinimo} unidades\n` +
            `Fecha de vencimiento: ${fechaFormateada}\n` +
            `Última venta: ${new Date(medicamento.ultimaVenta).toLocaleString('es-ES')}`
        );
    }
}

function expandirStockBajo() {
    const alertas = generarAlertas();
    const medicamentosStockBajo = alertas.stockBajo;
    
    let lista = 'Medicamentos con stock bajo:\n\n';
    medicamentosStockBajo.forEach(med => {
        lista += `• ${med.nombre}: ${med.stock} unidades\n`;
    });
    
    alert(lista);
}

function expandirVencimientos() {
    const alertas = generarAlertas();
    const hoy = new Date();
    
    let lista = 'Medicamentos próximos a vencer:\n\n';
    alertas.proximosVencer.forEach(med => {
        const fechaVenc = new Date(med.fechaVencimiento);
        const dias = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
        lista += `• ${med.nombre}: ${dias} días (${fechaVenc.toLocaleDateString('es-ES')})\n`;
    });
    
    alert(lista);
}

// Configuración
function validarConfiguracion() {
    const umbralCritico = parseInt(document.getElementById('umbralCritico').value) || 0;
    const umbralBajo = parseInt(document.getElementById('umbralBajo').value) || 10;
    const umbralMinimo = parseInt(document.getElementById('umbralMinimo').value) || 20;

    // Validar que los umbrales tengan sentido
    if (umbralCritico >= umbralBajo) {
        mostrarNotificacion('warning', 'El umbral crítico debe ser menor que el umbral bajo');
        document.getElementById('umbralCritico').value = Math.max(0, umbralBajo - 1);
    }

    if (umbralBajo >= umbralMinimo) {
        mostrarNotificacion('warning', 'El umbral bajo debe ser menor que el umbral mínimo');
        document.getElementById('umbralBajo').value = Math.max(1, umbralMinimo - 1);
    }

    actualizarConfiguracion();
}

function actualizarConfiguracion() {
    configuracionAlertas = {
        umbralCritico: parseInt(document.getElementById('umbralCritico').value) || 0,
        umbralBajo: parseInt(document.getElementById('umbralBajo').value) || 10,
        umbralMinimo: parseInt(document.getElementById('umbralMinimo').value) || 20,
        alertaTemprana: parseInt(document.getElementById('alertaTemprana').value) || 60,
        alertaUrgente: parseInt(document.getElementById('alertaUrgente').value) || 30,
        emailNotificaciones: document.getElementById('emailNotificaciones').checked,
        alertasSonido: document.getElementById('alertasSonido').checked,
        reporteDiario: document.getElementById('reporteDiario').checked
    };
}

function guardarConfiguracion() {
    actualizarConfiguracion();
    
    // Guardar en localStorage
    localStorage.setItem('configuracionAlertas', JSON.stringify(configuracionAlertas));
    
    mostrarNotificacion('success', 'Configuración guardada exitosamente');
    
    // Actualizar dashboard con nueva configuración
    setTimeout(() => {
        actualizarDashboard();
    }, 500);
}

function restaurarDefecto() {
    const confirmacion = confirm('¿Está seguro de que desea restaurar la configuración predeterminada?');
    
    if (confirmacion) {
        configuracionAlertas = {
            umbralCritico: 0,
            umbralBajo: 10,
            umbralMinimo: 20,
            alertaTemprana: 60,
            alertaUrgente: 30,
            emailNotificaciones: true,
            alertasSonido: true,
            reporteDiario: false
        };
        
        aplicarConfiguracion();
        mostrarNotificacion('info', 'Configuración restaurada a valores predeterminados');
    }
}

function cargarConfiguracion() {
    const configGuardada = localStorage.getItem('configuracionAlertas');
    
    if (configGuardada) {
        try {
            configuracionAlertas = JSON.parse(configGuardada);
            aplicarConfiguracion();
        } catch (error) {
            console.error('Error al cargar configuración:', error);
            mostrarNotificacion('error', 'Error al cargar configuración guardada');
        }
    }
}

function aplicarConfiguracion() {
    // Aplicar valores a los inputs
    document.getElementById('umbralCritico').value = configuracionAlertas.umbralCritico;
    document.getElementById('umbralBajo').value = configuracionAlertas.umbralBajo;
    document.getElementById('umbralMinimo').value = configuracionAlertas.umbralMinimo;
    document.getElementById('alertaTemprana').value = configuracionAlertas.alertaTemprana;
    document.getElementById('alertaUrgente').value = configuracionAlertas.alertaUrgente;
    
    // Aplicar valores a los toggles
    document.getElementById('emailNotificaciones').checked = configuracionAlertas.emailNotificaciones;
    document.getElementById('alertasSonido').checked = configuracionAlertas.alertasSonido;
    document.getElementById('reporteDiario').checked = configuracionAlertas.reporteDiario;
}

// Sistema de notificaciones
function mostrarNotificacion(tipo, mensaje, duracion = 3000) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-content">
            <i class="fas fa-${getIconoNotificacion(tipo)}"></i>
            <span>${mensaje}</span>
            <button class="notificacion-close" onclick="cerrarNotificacion(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Agregar estilos si no existen
    if (!document.querySelector('#notificacion-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notificacion-styles';
        styles.textContent = `
            .notificacion {
                position: fixed;
                top: 90px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideInRight 0.3s ease;
                border-left: 4px solid;
            }
            
            .notificacion.success {
                background: #F0FDF4;
                border-left-color: #10B981;
                color: #065F46;
            }
            
            .notificacion.error {
                background: #FEF2F2;
                border-left-color: #EF4444;
                color: #7F1D1D;
            }
            
            .notificacion.warning {
                background: #FFFBEB;
                border-left-color: #F59E0B;
                color: #92400E;
            }
            
            .notificacion.info {
                background: #EFF6FF;
                border-left-color: #3B82F6;
                color: #1E3A8A;
            }
            
            .notificacion-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
            }
            
            .notificacion-close {
                background: none;
                border: none;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
                margin-left: auto;
            }
            
            .notificacion-close:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Agregar al DOM
    document.body.appendChild(notificacion);

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.remove();
                }
            }, 300);
        }
    }, duracion);
}

function getIconoNotificacion(tipo) {
    switch (tipo) {
        case 'success': return 'check-circle';
        case 'error': return 'times-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'info-circle';
        default: return 'bell';
    }
}

function cerrarNotificacion(boton) {
    const notificacion = boton.closest('.notificacion');
    if (notificacion) {
        notificacion.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.remove();
            }
        }, 300);
    }
}

// Funciones de utilidad
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES');
}

function calcularDiasParaVencer(fechaVencimiento) {
    const hoy = new Date();
    const fechaVenc = new Date(fechaVencimiento);
    return Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
}

// Exportar funciones para uso global
window.actualizarAlertas = actualizarAlertas;
window.simularSinAlertas = simularSinAlertas;
window.configurarAlertas = configurarAlertas;
window.reabastecer = reabastecer;
window.verDetalles = verDetalles;
window.gestionarVencimiento = gestionarVencimiento;
window.expandirStockBajo = expandirStockBajo;
window.expandirVencimientos = expandirVencimientos;
window.guardarConfiguracion = guardarConfiguracion;
window.restaurarDefecto = restaurarDefecto;
window.cerrarNotificacion = cerrarNotificacion;

console.log('🔔 Sistema de alertas de inventario cargado correctamente');