// DOM Elements - se inicializarán cuando el DOM esté listo
let menuToggle;
let closeSidebar;
let sidebar;
let searchDoctor;
let doctorsList;
let prevPage;
let nextPage;
let currentPage;

// Pagination variables
let currentPageNumber = 1;
const itemsPerPage = 6;
let allDoctors = [];
let filteredDoctors = [];
let horariosMap = {}; // Mapa de horarios por médico

/**
 * Normalizar nombre del día
 */
function normalizarDia(dia) {
    const map = {
        'lunes': 'lunes',
        'martes': 'martes',
        'miercoles': 'miércoles',
        'miércoles': 'miércoles',
        'jueves': 'jueves',
        'viernes': 'viernes',
        'sabado': 'sábado',
        'sábado': 'sábado',
        'domingo': 'domingo'
    };
    return map[dia.toLowerCase()] || dia;
}

/**
 * Obtener día de la semana actual en español
 */
function obtenerDiaActual() {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const hoy = new Date();
    return dias[hoy.getDay()];
}

/**
 * Obtener hora actual en formato HH:MM
 */
function obtenerHoraActual() {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
}

/**
 * Verificar si un médico está activo en este momento
 */
function estaActivoAhora(idMedico) {
    const horarios = horariosMap[idMedico];
    
    if (!horarios || horarios.length === 0) {
        return false;
    }
    
    const diaActual = obtenerDiaActual();
    const horaActual = obtenerHoraActual();
    
    // Buscar si hay un horario para el día actual
    const horarioHoy = horarios.find(h => {
        const diaNormalizado = normalizarDia(h.dia_semana);
        return diaNormalizado === diaActual;
    });
    
    if (!horarioHoy) {
        return false;
    }
    
    // Verificar si la hora actual está dentro del rango
    const horaInicio = horarioHoy.hora_inicio;
    const horaFin = horarioHoy.hora_fin;
    
    return horaActual >= horaInicio && horaActual <= horaFin;
}

/**
 * Cargar horarios de todos los médicos
 */
async function cargarHorarios() {
    try {
        if (typeof obtenerTodosLosHorarios === 'undefined') {
            console.error('Función obtenerTodosLosHorarios no disponible');
            return;
        }
        
        const todosHorarios = await obtenerTodosLosHorarios();
        
        // Organizar horarios por médico
        horariosMap = {};
        todosHorarios.forEach(horario => {
            const idMedico = horario.id_medico;
            if (!horariosMap[idMedico]) {
                horariosMap[idMedico] = [];
            }
            horariosMap[idMedico].push(horario);
        });
        
        console.log('Horarios cargados:', horariosMap);
        
    } catch (error) {
        console.error('Error al cargar horarios:', error);
    }
}

// Function to load doctors from API
async function loadDoctors() {
    try {
        // Re-verificar que el elemento existe
        doctorsList = document.getElementById('doctorsList');
        
        if (!doctorsList) {
            console.error('Elemento doctorsList no encontrado en el DOM');
            const altElement = document.querySelector('.doctors-grid');
            if (altElement) {
                console.log('Elemento encontrado con selector alternativo');
                doctorsList = altElement;
            } else {
                console.error('No se pudo encontrar el elemento doctorsList');
                return;
            }
        }
        
        if (typeof obtenerMedicos === 'undefined') {
            console.error('API Client no está cargado');
            if (doctorsList) {
                doctorsList.innerHTML = '<p style="text-align: center; color: #F44336;">Error: API Client no está cargado</p>';
            }
            return;
        }

        if (doctorsList) {
            doctorsList.innerHTML = '<p style="text-align: center; color: #1E88A8;">⏳ Cargando médicos...</p>';
        }
        
        // Cargar médicos y horarios en paralelo
        const [medicosData] = await Promise.all([
            obtenerMedicos(),
            cargarHorarios()
        ]);
        
        allDoctors = medicosData;
        
        if (!allDoctors || allDoctors.length === 0) {
            if (doctorsList) {
                doctorsList.innerHTML = '<p style="text-align: center; color: #666;">No hay médicos registrados</p>';
            }
            return;
        }

        filteredDoctors = allDoctors;
        renderDoctors(filteredDoctors);
        updatePagination();
        
        // Actualizar estados cada minuto
        setInterval(() => {
            console.log('Actualizando estados de médicos...');
            renderDoctors(filteredDoctors);
        }, 60000); // 60000 ms = 1 minuto
        
    } catch (error) {
        console.error('Error al cargar médicos:', error);
        doctorsList = document.getElementById('doctorsList') || document.querySelector('.doctors-grid');
        if (doctorsList) {
            doctorsList.innerHTML = '<p style="text-align: center; color: #F44336;">Error al cargar los médicos. Por favor recarga la página.</p>';
        }
    }
}

// Function to render doctors list
function renderDoctors(doctorsToRender) {
    // Re-verificar que el elemento existe
    if (!doctorsList) {
        doctorsList = document.getElementById('doctorsList') || document.querySelector('.doctors-grid');
    }
    
    if (!doctorsList) {
        console.error('No se puede renderizar: elemento doctorsList no encontrado');
        return;
    }
    
    doctorsList.innerHTML = '';
    
    if (!doctorsToRender || doctorsToRender.length === 0) {
        doctorsList.innerHTML = '<p style="text-align: center; color: #666;">No se encontraron médicos</p>';
        return;
    }

    // Calcular el rango de médicos a mostrar
    const startIndex = (currentPageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const doctorsToShow = doctorsToRender.slice(startIndex, endIndex);
    
    const diaActual = obtenerDiaActual();
    const horaActual = obtenerHoraActual();
    
    console.log(`Renderizando médicos - Día: ${diaActual}, Hora: ${horaActual}`);
    
    doctorsToShow.forEach((doctor, index) => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'doctor-card';
        
        const nombreCompleto = `${doctor.nombre || ''} ${doctor.apellido || ''}`.trim();
        const especialidad = doctor.nombre_especialidad || 'Sin especialidad';
        const doctorId = doctor.id_medico;
        
        // Validar que el ID existe
        if (!doctorId) {
            console.error('Médico sin ID:', doctor);
            return;
        }
        
        // Determinar si está activo basándose en el horario
        const estaActivo = estaActivoAhora(doctorId);
        const estadoTexto = estaActivo ? 'Activo ahora' : 'Fuera de horario';
        const estadoClass = estaActivo ? 'active' : 'inactive';
        
        console.log(`Médico ${nombreCompleto} (ID: ${doctorId}) - Estado: ${estadoTexto}`);
        
        const initials = nombreCompleto
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

        // Obtener información de horarios del médico
        const horariosDelMedico = horariosMap[doctorId] || [];
        let infoHorario = '';
        
        if (horariosDelMedico.length > 0) {
            const horarioHoy = horariosDelMedico.find(h => 
                normalizarDia(h.dia_semana) === diaActual
            );
            
            if (horarioHoy) {
                infoHorario = `<div class="doctor-schedule-today">
                    <i class="fas fa-clock"></i> Hoy: ${horarioHoy.hora_inicio} - ${horarioHoy.hora_fin}
                </div>`;
            } else {
                infoHorario = `<div class="doctor-schedule-today" style="color: #999;">
                    <i class="fas fa-clock"></i> No trabaja hoy
                </div>`;
            }
        }

        doctorCard.innerHTML = `
            <div class="doctor-header">
                <div class="doctor-avatar">
                    ${doctor.imagen ? `<img src="${doctor.imagen}" alt="${nombreCompleto}">` : initials}
                </div>
                <div class="doctor-info">
                    <h3>${nombreCompleto}</h3>
                    <div class="doctor-specialty">${especialidad}</div>
                    ${doctor.email ? `<div class="doctor-email" style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">
                        <i class="fas fa-envelope"></i> ${doctor.email}
                    </div>` : ''}
                </div>
            </div>
            <div class="doctor-status">
                <span class="status-indicator status-${estadoClass}"></span>
                <span>${estadoTexto}</span>
            </div>
            ${infoHorario}
            <div class="doctor-actions" style="margin-top: 1rem;">
                <button class="action-btn btn-primary" data-action="schedule" data-doctor-id="${doctorId}" style="grid-column: 1 / -1;">
                    <i class="fas fa-calendar"></i> Ver Horarios
                </button>
            </div>
        `;
        
        doctorsList.appendChild(doctorCard);
    });
}

// Pagination functions
function updatePagination() {
    if (!currentPage) return;
    
    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    currentPage.textContent = `Página ${currentPageNumber} de ${totalPages || 1}`;
    
    if (prevPage) {
        prevPage.disabled = currentPageNumber === 1;
    }
    
    if (nextPage) {
        nextPage.disabled = currentPageNumber >= totalPages;
    }
}

// View schedule function
function viewSchedule(doctorId) {
    if (!doctorId) {
        console.error('ID de médico no proporcionado');
        return;
    }
    window.location.href = `horarios.html?id_medico=${doctorId}`;
}

// Event delegation for doctor action buttons
document.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    
    if (!doctorsList || !doctorsList.contains(button)) return;
    
    const action = button.getAttribute('data-action');
    const doctorId = button.getAttribute('data-doctor-id');
    
    console.log('Botón clickeado:', {
        action: action,
        doctorId: doctorId
    });
    
    if (!doctorId) {
        console.error('ID de médico no encontrado en el botón');
        return;
    }
    
    if (action === 'edit') {
        console.log('Editando médico con ID:', doctorId);
        e.preventDefault();
        e.stopPropagation();
        editDoctor(doctorId);
    } else if (action === 'schedule') {
        console.log('Viendo horario del médico con ID:', doctorId);
        e.preventDefault();
        e.stopPropagation();
        viewSchedule(doctorId);
    }
});

// Initialize page
function initializePage() {
    // Obtener referencias a los elementos del DOM
    menuToggle = document.getElementById('menuToggle');
    closeSidebar = document.getElementById('closeSidebar');
    sidebar = document.getElementById('sidebar');
    searchDoctor = document.getElementById('searchDoctor');
    doctorsList = document.getElementById('doctorsList');
    prevPage = document.getElementById('prevPage');
    nextPage = document.getElementById('nextPage');
    currentPage = document.getElementById('currentPage');
    
    // Verificar que el elemento principal existe
    if (!doctorsList) {
        console.error('Elemento doctorsList no encontrado en el DOM');
        doctorsList = document.querySelector('.doctors-grid');
        if (!doctorsList) {
            console.error('No se pudo encontrar el elemento para mostrar los médicos');
            return;
        }
    }
    
    // Configurar event listeners del sidebar
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (sidebar) sidebar.classList.add('active');
        });
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            if (sidebar) sidebar.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar && !sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
    
    // Configurar paginación
    if (prevPage) {
        prevPage.addEventListener('click', () => {
            if (currentPageNumber > 1) {
                currentPageNumber--;
                renderDoctors(filteredDoctors);
                updatePagination();
            }
        });
    }
    
    if (nextPage) {
        nextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
            if (currentPageNumber < totalPages) {
                currentPageNumber++;
                renderDoctors(filteredDoctors);
                updatePagination();
            }
        });
    }
    
    // Configurar búsqueda
    if (searchDoctor) {
        searchDoctor.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filteredDoctors = allDoctors.filter(doctor => {
                const nombreCompleto = `${doctor.nombre || ''} ${doctor.apellido || ''}`.toLowerCase();
                const especialidad = (doctor.nombre_especialidad || '').toLowerCase();
                const email = (doctor.email || '').toLowerCase();
                
                return nombreCompleto.includes(searchTerm) ||
                       especialidad.includes(searchTerm) ||
                       email.includes(searchTerm);
            });
            
            currentPageNumber = 1;
            renderDoctors(filteredDoctors);
            updatePagination();
        });
    }
    
    // Cargar médicos
    loadDoctors();
}

// Initialize the page when the DOM is loaded
function startInitialization() {
    setTimeout(() => {
        initializePage();
    }, 50);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInitialization);
} else {
    startInitialization();
}