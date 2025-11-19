// ============================================
// HISTORIAL DE RECETAS - MÓDULO LIMPIO
// ============================================

console.log('✅ Módulo de Historial cargado');

// Usar variables globales de main.js si existen
const medicoActivoHistorial = window.medicoActivo || {
    id: 1,
    nombre: 'Dr. Roberto Sánchez',
    especialidad: 'Medicina General'
};

const pacientesDBHistorial = window.pacientesDB || {
    '1234567': { id: 1, nombre: 'Ana María Pérez González', identificacion: '1234567', edad: 45, genero: 'Femenino', telefono: '301-234-5678', correo: 'ana.perez@email.com', direccion: 'Calle 123 #45-67, Bogotá' },
    '2345678': { id: 2, nombre: 'Juan Carlos García López', identificacion: '2345678', edad: 12, genero: 'Masculino', telefono: '302-345-6789', correo: 'juanc.garcia@email.com', direccion: 'Carrera 45 #12-34, Medellín' },
    '3456789': { id: 3, nombre: 'María Sofía Rodríguez Martínez', identificacion: '3456789', edad: 58, genero: 'Femenino', telefono: '303-456-7890', correo: 'maria.rodriguez@email.com', direccion: 'Avenida 67 #23-45, Cali' }
};

// Base de datos de recetas por paciente
const recetasDB = {
    1: [
        {
            id_receta: 123,
            numero_receta: 'RX-2025-00123',
            fecha_emision: '2025-10-20T10:30:00',
            observaciones: 'Paciente con infección respiratoria aguda. Controlar síntomas y volver en 7 días.',
            estado: 'Completado',
            id_paciente: 1,
            medico_nombre: 'Dr. Roberto Sánchez',
            medico_especialidad: 'Medicina General',
            medicamentos: [
                { id_medicamento: 1, nombre: 'Amoxicilina 500mg', dosis: '500mg', frecuencia: 'Cada 8 horas', duracion: '7 días' },
                { id_medicamento: 2, nombre: 'Ibuprofeno 400mg', dosis: '400mg', frecuencia: 'Cada 12 horas', duracion: '5 días' }
            ]
        },
        {
            id_receta: 98,
            numero_receta: 'RX-2025-00098',
            fecha_emision: '2025-10-15T08:00:00',
            observaciones: 'Control de presión arterial. Mantener dieta baja en sodio.',
            estado: 'Enviado',
            id_paciente: 1,
            medico_nombre: 'Dr. Fernando Morales',
            medico_especialidad: 'Cardiología',
            medicamentos: [
                { id_medicamento: 5, nombre: 'Losartán 50mg', dosis: '50mg', frecuencia: 'Una vez al día', duracion: '30 días' }
            ]
        },
        {
            id_receta: 75,
            numero_receta: 'RX-2025-00075',
            fecha_emision: '2025-10-10T14:20:00',
            observaciones: 'Alergia estacional. Evitar exposición a alérgenos.',
            estado: 'Cancelado',
            id_paciente: 1,
            medico_nombre: 'Dra. Patricia Ruiz',
            medico_especialidad: 'Dermatología',
            medicamentos: [
                { id_medicamento: 3, nombre: 'Loratadina 10mg', dosis: '10mg', frecuencia: 'Cada 24 horas', duracion: '15 días' }
            ]
        }
    ],
    2: [
        {
            id_receta: 124,
            numero_receta: 'RX-2025-00124',
            fecha_emision: '2025-10-22T14:15:00',
            observaciones: 'Fiebre leve. Administrar después de las comidas.',
            estado: 'Pendiente',
            id_paciente: 2,
            medico_nombre: 'Dra. Carmen Jiménez',
            medico_especialidad: 'Pediatría',
            medicamentos: [
                { id_medicamento: 4, nombre: 'Paracetamol 500mg', dosis: '500mg', frecuencia: 'Cada 6 horas', duracion: '3 días' }
            ]
        }
    ],
    3: [
        {
            id_receta: 125,
            numero_receta: 'RX-2025-00125',
            fecha_emision: '2025-10-25T09:00:00',
            observaciones: 'Continuar con controles mensuales. Evitar comidas pesadas.',
            estado: 'Enviado',
            id_paciente: 3,
            medico_nombre: 'Dr. Fernando Morales',
            medico_especialidad: 'Cardiología',
            medicamentos: [
                { id_medicamento: 3, nombre: 'Loratadina 10mg', dosis: '10mg', frecuencia: 'Una vez al día', duracion: '10 días' },
                { id_medicamento: 6, nombre: 'Omeprazol 20mg', dosis: '20mg', frecuencia: 'En ayunas', duracion: '30 días' }
            ]
        }
    ]
};

// Convertir a array plano
let recetasArray = [];
for (const pacienteId in recetasDB) {
    recetasDB[pacienteId].forEach(receta => {
        const paciente = Object.values(pacientesDBHistorial).find(p => p.id == receta.id_paciente) || { nombre: 'Paciente Desconocido', identificacion: 'N/A', telefono: 'N/A' };
        recetasArray.push({
            id: receta.id_receta,
            numero: receta.numero_receta,
            fecha: receta.fecha_emision.split('T')[0],
            paciente: paciente,
            medico: { nombre: receta.medico_nombre, especialidad: receta.medico_especialidad },
            medicamentos: receta.medicamentos,
            observaciones: receta.observaciones,
            estado: receta.estado
        });
    });
}

console.log('📊 Total recetas:', recetasArray.length);

// Variables de paginación y filtros
let recetasFiltradas = [...recetasArray];
let paginaActual = 1;
const recetasPorPagina = 10;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando historial...');
    inicializarEventos();
    // Intentar cargar recetas desde la API; si falla, usar datos locales mock
    fetch('/api/recetas')
        .then(res => res.json())
        .then(data => {
            // Mapear la respuesta API al formato local esperado
            recetasArray = (data || []).map(r => ({
                id: r.id_receta || r.id || null,
                numero: r.numero_receta || r.numero || '',
                fecha: (r.fecha_emision || r.fecha || '').split ? (r.fecha_emision || r.fecha || '').split('T')[0] : (r.fecha_emision || r.fecha || ''),
                paciente: { nombre: r.paciente_nombre || r.paciente?.nombre || r.paciente_identificacion || 'Paciente' },
                medico: { nombre: r.medico_nombre || r.medico?.nombre || '', especialidad: r.medico_especialidad || '' },
                medicamentos: (r.detalles || r.medicamentos || []).map(d => ({ nombre: d.medicamento_nombre || d.nombre || '' , dosis: d.dosis, frecuencia: d.frecuencia, duracion: d.duracion })),
                observaciones: r.observaciones || '',
                estado: r.estado || 'Pendiente'
            }));

            console.log('✅ Recetas cargadas desde API:', recetasArray.length);
            recetasFiltradas = [...recetasArray];
            paginaActual = 1;
            cargarRecetas();
            actualizarEstadisticas();
        })
        .catch(err => {
            console.warn('⚠️ No se pudieron cargar recetas desde la API, usando datos locales:', err);
            // mantener los datos locales ya inicializados
            recetasFiltradas = [...recetasArray];
            cargarRecetas();
            actualizarEstadisticas();
        });
});

// ============================================
// EVENTOS
// ============================================
function inicializarEventos() {
    const filtroBusqueda = document.getElementById('filtroBusqueda');
    const filtroEstado = document.getElementById('filtroEstado');
    const filtroFechaInicio = document.getElementById('filtroFechaInicio');
    const filtroFechaFin = document.getElementById('filtroFechaFin');
    const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
    const btnExportar = document.getElementById('btnExportar');

    if (filtroBusqueda) filtroBusqueda.addEventListener('input', aplicarFiltros);
    if (filtroEstado) filtroEstado.addEventListener('change', aplicarFiltros);
    if (filtroFechaInicio) filtroFechaInicio.addEventListener('change', aplicarFiltros);
    if (filtroFechaFin) filtroFechaFin.addEventListener('change', aplicarFiltros);
    if (btnLimpiarFiltros) btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    if (btnExportar) btnExportar.addEventListener('click', () => alert('Exportar Excel - Función en desarrollo'));

    console.log('✅ Eventos configurados');
}

// ============================================
// CARGAR RECETAS
// ============================================
function cargarRecetas() {
    const tbody = document.getElementById('tablaBody');
    if (!tbody) return console.error('❌ No se encontró tablaBody');

    if (recetasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 3rem; color: #6C757D;">
                <i class="fas fa-inbox" style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i>
                <h4 style="margin: 0.5rem 0;">No hay recetas</h4>
                <p style="margin: 0;">No se encontraron recetas con los filtros aplicados</p>
            </td></tr>
        `;
        return;
    }

    const inicio = (paginaActual - 1) * recetasPorPagina;
    const fin = inicio + recetasPorPagina;
    const recetasPagina = recetasFiltradas.slice(inicio, fin);

    tbody.innerHTML = '';

    recetasPagina.forEach(receta => {
        const medicamentosHTML = receta.medicamentos.slice(0, 2).map(m => 
            `<div style="font-size: 0.85rem; color: #2C3E50;"><i class="fas fa-pills"></i> ${m.nombre}</div>`
        ).join('') + (receta.medicamentos.length > 2 ? `<small style="color: #6C757D;">+${receta.medicamentos.length - 2} más</small>` : '');

        const estadoClase = {
            'Pendiente': 'badge-warning',
            'Completado': 'badge-success',
            'Enviado': 'badge-info',
            'Cancelado': 'badge-danger'
        }[receta.estado] || 'badge-secondary';

        tbody.innerHTML += `
            <tr>
                <td><strong>${receta.numero}</strong></td>
                <td>${formatearFecha(receta.fecha)}</td>
                <td>${receta.paciente.nombre}</td>
                <td>${receta.medico.nombre}<br><small style="color: #6C757D;">${receta.medico.especialidad}</small></td>
                <td>${medicamentosHTML}</td>
                <td><span class="badge-estado ${estadoClase}">${receta.estado}</span></td>
                <td>
                    <button class="btn-accion btn-ver" onclick="viewRecetaApi(${receta.id || receta.id_receta})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    generarPaginacion();
    console.log(`✅ ${recetasPagina.length} recetas mostradas`);
}

// ============================================
// ESTADÍSTICAS
// ============================================
function actualizarEstadisticas() {
    document.getElementById('totalRecetas').textContent = recetasArray.length;
    document.getElementById('totalPendientes').textContent = recetasArray.filter(r => r.estado === 'Pendiente').length;
    document.getElementById('totalCompletadas').textContent = recetasArray.filter(r => r.estado === 'Completado').length;
    document.getElementById('totalEnviadas').textContent = recetasArray.filter(r => r.estado === 'Enviado').length;
}

// ============================================
// FILTROS
// ============================================
function aplicarFiltros() {
    const busqueda = document.getElementById('filtroBusqueda')?.value.toLowerCase() || '';
    const estado = document.getElementById('filtroEstado')?.value || '';
    const fechaInicio = document.getElementById('filtroFechaInicio')?.value || '';
    const fechaFin = document.getElementById('filtroFechaFin')?.value || '';

    recetasFiltradas = recetasArray.filter(receta => {
        const coincideBusqueda = receta.numero.toLowerCase().includes(busqueda) ||
                                receta.paciente.nombre.toLowerCase().includes(busqueda) ||
                                receta.medico.nombre.toLowerCase().includes(busqueda);
        const coincideEstado = !estado || receta.estado === estado;
        const coincideFechaInicio = !fechaInicio || receta.fecha >= fechaInicio;
        const coincideFechaFin = !fechaFin || receta.fecha <= fechaFin;

        return coincideBusqueda && coincideEstado && coincideFechaInicio && coincideFechaFin;
    });

    paginaActual = 1;
    cargarRecetas();
}

function limpiarFiltros() {
    document.getElementById('filtroBusqueda').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroFechaInicio').value = '';
    document.getElementById('filtroFechaFin').value = '';
    recetasFiltradas = [...recetasArray];
    paginaActual = 1;
    cargarRecetas();
}

// ============================================
// PAGINACIÓN
// ============================================
function generarPaginacion() {
    const paginacion = document.getElementById('paginacion');
    const totalPaginas = Math.ceil(recetasFiltradas.length / recetasPorPagina);

    if (totalPaginas <= 1) {
        paginacion.innerHTML = '';
        return;
    }

    let html = `
        <button onclick="cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Anterior
        </button>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
            html += `<button onclick="cambiarPagina(${i})" class="${i === paginaActual ? 'active' : ''}">${i}</button>`;
        } else if (i === paginaActual - 2 || i === paginaActual + 2) {
            html += `<button disabled>...</button>`;
        }
    }

    html += `
        <button onclick="cambiarPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''}>
            Siguiente <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginacion.innerHTML = html;
}

function cambiarPagina(pagina) {
    const totalPaginas = Math.ceil(recetasFiltradas.length / recetasPorPagina);
    if (pagina < 1 || pagina > totalPaginas) return;
    paginaActual = pagina;
    cargarRecetas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// UTILIDADES
// ============================================
function formatearFecha(fecha) {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ==========================
// Detalle de receta (modal)
// ==========================
function viewRecetaApi(id) {
    if (!id) return alert('ID de receta inválido');
    fetch(`/api/recetas/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener receta');
            return res.json();
        })
        .then(receta => {
            renderRecetaModal(receta);
        })
        .catch(err => {
            console.error('Error obteniendo receta desde API:', err);
            alert('No se pudo cargar el detalle de la receta. Revisa la consola.');
        });
}

function renderRecetaModal(receta) {
    // Generar HTML de medicamentos
    const medicamentosHTML = (receta.detalles || receta.medicamentos || []).map((d, i) => `
        <div class="detalle-medicamento-modal">
            <h5>${i + 1}. ${d.medicamento_nombre || d.nombre || ''}</h5>
            <div class="detalle-med-grid">
                <div><strong>Dosis:</strong> ${d.dosis || ''}</div>
                <div><strong>Frecuencia:</strong> ${d.frecuencia || ''}</div>
                <div><strong>Duración:</strong> ${d.duracion || ''}</div>
            </div>
        </div>
    `).join('');

    const modal = document.createElement('div');
    modal.id = 'modalDetalleReceta';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content-detalle">
            <div class="modal-header-detalle">
                <h3>Receta ${receta.numero_receta || receta.numero || ''}</h3>
                <button type="button" class="btn-close-modal" id="closeModalDetalle">×</button>
            </div>
            <div class="modal-body-detalle">
                <div class="detalle-section">
                    <strong>Fecha de emisión:</strong> ${receta.fecha_emision || receta.fecha || ''}
                </div>
                <div class="detalle-section">
                    <strong>Paciente:</strong> ${receta.paciente_nombre || receta.paciente?.nombre || ''}
                </div>
                <div class="detalle-section">
                    <strong>Médico:</strong> ${receta.medico_nombre || receta.medico?.nombre || ''}
                </div>
                <div class="detalle-section">
                    <h4>Medicamentos</h4>
                    ${medicamentosHTML || '<div class="info-placeholder">No hay medicamentos registrados en esta receta.</div>'}
                </div>
                ${receta.observaciones ? `<div class="detalle-section"><h4>Observaciones</h4><p>${receta.observaciones}</p></div>` : ''}

                <!-- Área de vista previa dinámica (oculta por defecto) -->
                <div id="modalPreviewArea" style="display:none; margin-top:1rem;">
                </div>
            </div>
            <div class="modal-footer-detalle">
                <button type="button" class="btn-secondary" id="btnModalVisualizar">Visualizar</button>
                <button type="button" class="btn-primary" id="btnModalEditar">Editar</button>
                <button type="button" class="btn-secondary" id="closeModalDetalleFooter">Cancelar</button>
            </div>
        </div>
    `;

    // Remover modal existente
    const existing = document.getElementById('modalDetalleReceta');
    if (existing) existing.remove();

    document.body.appendChild(modal);
    // Mostrar modal con animación y bloquear scroll del body
    setTimeout(() => {
        modal.classList.add('active');
        // evitar scroll detrás del modal
        document.body.style.overflow = 'hidden';
    }, 10);

    // Cerrar modal y restaurar scroll
    const closeAndRestore = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { if (modal && modal.parentNode) modal.parentNode.removeChild(modal); }, 300);
    };

    document.getElementById('closeModalDetalle')?.addEventListener('click', closeAndRestore);
    document.getElementById('closeModalDetalleFooter')?.addEventListener('click', closeAndRestore);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAndRestore(); });

    // Botón Visualizar: muestra una vista formateada dentro del modal
    const btnVis = document.getElementById('btnModalVisualizar');
    const previewArea = document.getElementById('modalPreviewArea');
    btnVis?.addEventListener('click', () => {
        if (!previewArea) return;
        if (previewArea.style.display === 'none') {
            previewArea.style.display = 'block';
            previewArea.innerHTML = buildPreviewHtml(receta);
            btnVis.textContent = 'Ocultar vista';
        } else {
            previewArea.style.display = 'none';
            btnVis.textContent = 'Visualizar';
        }
    });

    // Botón Editar: preparar edición y redirigir a gestión
    const btnEditar = document.getElementById('btnModalEditar');
    btnEditar?.addEventListener('click', () => {
        try {
            // Preparar objeto compatible con la página de edición
            const recetaEditar = {
                receta: receta,
                paciente: {
                    id: receta.id_paciente || null,
                    nombre: receta.paciente_nombre || (receta.paciente && receta.paciente.nombre) || '',
                    identificacion: receta.paciente_identificacion || (receta.paciente && receta.paciente.identificacion) || ''
                },
                modo: 'editar'
            };
            sessionStorage.setItem('recetaEditar', JSON.stringify(recetaEditar));
        } catch (e) {
            console.error('Error preparando edición:', e);
        }
        // Redirigir a gestión completa
        window.location.href = '/nueva-receta';
    });
}

// Genera HTML simple y responsivo para la vista previa de una receta
function buildPreviewHtml(receta) {
    const fecha = receta.fecha_emision ? (receta.fecha_emision.split ? receta.fecha_emision.split('T')[0] : receta.fecha_emision) : (receta.fecha || '');
    const paciente = receta.paciente_nombre || (receta.paciente && receta.paciente.nombre) || 'Paciente';
    const medico = receta.medico_nombre || (receta.medico && receta.medico.nombre) || '';
    const detalles = receta.detalles || receta.medicamentos || [];

    const medicamentosList = detalles.map((d, i) => `
        <div style="padding:0.5rem 0; border-bottom:1px solid #EEF2F5;">
            <strong>${i + 1}. ${d.medicamento_nombre || d.nombre || ''}</strong>
            <div style="font-size:0.95rem; color:#495057; margin-top:0.25rem;">
                ${d.dosis ? `<div>Dosis: ${d.dosis}</div>` : ''}
                ${d.frecuencia ? `<div>Frecuencia: ${d.frecuencia}</div>` : ''}
                ${d.duracion ? `<div>Duración: ${d.duracion}</div>` : ''}
            </div>
        </div>
    `).join('') || '<div class="info-placeholder">No hay medicamentos para mostrar.</div>';

    return `
        <div class="preview-content" style="padding:1rem;">
            <h4 style="margin:0 0 0.5rem 0;">Receta ${receta.numero_receta || receta.numero || ''}</h4>
            <div style="color:#6C757D; font-size:0.95rem; margin-bottom:0.75rem;">Emitida: ${fecha} • Médico: ${medico}</div>
            <div style="margin-bottom:1rem;"><strong>Paciente:</strong> ${paciente}</div>
            <div style="margin-bottom:0.5rem;"><h5 style="margin:0 0 0.5rem 0; color:#1E88A8;">Medicamentos</h5>${medicamentosList}</div>
            ${receta.observaciones ? `<div style="margin-top:1rem;"><h5 style="margin:0 0 0.5rem 0; color:#1E88A8;">Observaciones</h5><div style="color:#495057;">${receta.observaciones}</div></div>` : ''}
        </div>
    `;
}
