// Elementos del DOM
const timeRange = document.getElementById('timeRange');
const customDateRange = document.getElementById('customDateRange');
const generateReportBtn = document.getElementById('generateReport');
const specialtiesChart = document.getElementById('specialtiesChart');
const trendsChart = document.getElementById('trendsChart');
const productivityTable = document.getElementById('productivityTable');

// Configuración inicial
async function init() {
    setupCharts();
    await loadData();
    attachEventListeners();
}

// Configurar gráficos
function setupCharts() {
    // Gráfico de Especialidades (Pie Chart)
    window.specialtiesChartInstance = new Chart(specialtiesChart, {
        type: 'doughnut',
        data: {
            labels: ['Cardiología', 'Dermatología', 'Pediatría', 'Neurología', 'Ortopedia'],
            datasets: [{
                label: 'Médicos por Especialidad',
                data: [12, 19, 7, 5, 9],
                backgroundColor: [
                    '#1E88A8',
                    '#4FC3DC',
                    '#2E3B4E',
                    '#4CAF50',
                    '#FFC107'
                ]

            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });

    // Gráfico de Tendencias (Line Chart)
    new Chart(trendsChart, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Consultas',
                data: [35, 42, 38, 45, 40, 25, 20],
                borderColor: '#1E88A8',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Cargar datos desde la API
async function loadData() {
    try {
        if (typeof obtenerEstadisticasGenerales === 'undefined') {
            console.error('API Client no está cargado');
            return;
        }
        
        const estadisticas = await obtenerEstadisticasGenerales();
        
        if (estadisticas) {
            // Actualizar KPIs
            updateKPIs(estadisticas);
            
            // Actualizar gráficos
            updateCharts(estadisticas);
            
            // Cargar médicos para la tabla
            await loadProductivityTable();
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// Actualizar KPIs
function updateKPIs(estadisticas) {
    const kpiCards = document.querySelectorAll('.kpi-card');
    if (kpiCards.length >= 3) {
        // Total de médicos
        if (estadisticas.total_medicos !== undefined) {
            kpiCards[0].querySelector('.kpi-value').textContent = estadisticas.total_medicos;
        }
        
        // Turnos hoy
        if (estadisticas.turnos_hoy !== undefined) {
            kpiCards[1].querySelector('.kpi-value').textContent = estadisticas.turnos_hoy;
        }
        
        // Médicos disponibles
        if (estadisticas.medicos_disponibles !== undefined) {
            kpiCards[2].querySelector('.kpi-value').textContent = estadisticas.medicos_disponibles;
        }
    }
}

// Actualizar gráficos
function updateCharts(estadisticas) {
    if (estadisticas.medicos_por_especialidad && estadisticas.medicos_por_especialidad.length > 0) {
        const labels = estadisticas.medicos_por_especialidad.map(e => e.nombre_especialidad);
        const data = estadisticas.medicos_por_especialidad.map(e => e.cantidad);
        
        // Actualizar gráfico de especialidades
        if (window.specialtiesChartInstance) {
            window.specialtiesChartInstance.data.labels = labels;
            window.specialtiesChartInstance.data.datasets[0].data = data;
            window.specialtiesChartInstance.update();
        }
    }
}

// Cargar tabla de productividad
async function loadProductivityTable() {
    try {
        if (typeof obtenerMedicos === 'undefined') {
            return;
        }
        
        const doctors = await obtenerMedicos();
        
        if (!doctors || doctors.length === 0) {
            productivityTable.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay datos disponibles</td></tr>';
            return;
        }
        
        // Obtener estadísticas de cada médico
        const productivityData = [];
        for (const doctor of doctors.slice(0, 10)) { // Limitar a 10 médicos
            try {
                if (typeof obtenerEstadisticasMedico === 'function') {
                    const stats = await obtenerEstadisticasMedico(doctor.id_medico);
                    if (stats) {
                        const nombreCompleto = `${doctor.nombre || ''} ${doctor.apellido || ''}`.trim();
                        productivityData.push({
                            name: nombreCompleto || `Médico ${doctor.id_medico}`,
                            consultations: stats.total_turnos || 0,
                            attendance: stats.tasa_asistencia ? `${stats.tasa_asistencia}%` : '0%',
                            rating: '4.5' // Placeholder, se puede calcular si hay datos de valoración
                        });
                    }
                }
            } catch (error) {
                console.error(`Error al cargar estadísticas del médico ${doctor.id_medico}:`, error);
            }
        }
        
        // Si no hay datos de estadísticas, mostrar al menos los médicos
        if (productivityData.length === 0) {
            productivityData.push(...doctors.slice(0, 5).map(doctor => {
                const nombreCompleto = `${doctor.nombre || ''} ${doctor.apellido || ''}`.trim();
                return {
                    name: nombreCompleto || `Médico ${doctor.id_medico}`,
                    consultations: 0,
                    attendance: 'N/A',
                    rating: 'N/A'
                };
            }));
        }
        
        // Renderizar tabla
        productivityTable.innerHTML = productivityData.map(doctor => `
            <tr>
                <td>${doctor.name}</td>
                <td>${doctor.consultations}</td>
                <td>${doctor.attendance}</td>
                <td>${doctor.rating}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error al cargar tabla de productividad:', error);
        productivityTable.innerHTML = '<tr><td colspan="4" style="text-align: center;">Error al cargar datos</td></tr>';
    }
}

// Event Listeners
function attachEventListeners() {
    // Mostrar/ocultar rango de fechas personalizado
    timeRange.addEventListener('change', () => {
        customDateRange.style.display = 
            timeRange.value === 'custom' ? 'flex' : 'none';
    });

    // Generar reporte
    generateReportBtn.addEventListener('click', generateReport);

    // Botones de exportación
    document.getElementById('downloadPDF').addEventListener('click', downloadPDF);
    document.getElementById('downloadExcel').addEventListener('click', downloadExcel);
    document.getElementById('shareReport').addEventListener('click', shareReport);
}

// Funciones de acción
async function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    console.log('Generando reporte:', {
        type: reportType,
        timeRange: timeRange.value,
        startDate,
        endDate
    });

    // Recargar datos desde la API
    await loadData();
    
    if (typeof mostrarExito === 'function') {
        mostrarExito('Reporte generado correctamente');
    }
}

function downloadPDF() {
    console.log('Descargando PDF...');
    // Implementar lógica de descarga de PDF
    alert('El PDF se descargará en breve...');
}

function downloadExcel() {
    console.log('Exportando a Excel...');
    // Implementar lógica de exportación a Excel
    alert('El archivo Excel se descargará en breve...');
}

function shareReport() {
    console.log('Compartiendo reporte...');
    // Implementar lógica de compartir
    alert('Función de compartir en desarrollo...');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);