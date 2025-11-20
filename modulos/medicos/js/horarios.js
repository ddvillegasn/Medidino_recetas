// horarios.js (versión corregida y con logs)

const calendarGrid = document.querySelector('.calendar-grid');
const timeSlots = document.querySelector('.time-slots');
const currentWeekEl = document.getElementById('currentWeek');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');
const modal = document.getElementById('scheduleModal');
const scheduleForm = document.getElementById('scheduleForm');

let currentDate = new Date();
let currentWeekStart = getWeekStart(currentDate);

// Inicialización
async function init() {
    createTimeSlots();
    createDayColumns();
    updateCalendarHeader();
    await loadDoctors();
    loadServices();
    attachEventListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const medicoId = urlParams.get('id_medico');
    const doctorSelect = document.getElementById('doctorSelect');

    if (medicoId && doctorSelect) {
        doctorSelect.value = medicoId;
        setTimeout(() => {
            loadSchedules(medicoId);
        }, 200);
    } else if (doctorSelect && doctorSelect.value) {
        setTimeout(() => {
            loadSchedules(doctorSelect.value);
        }, 200);
    }
}

// Crear slots de tiempo
function createTimeSlots() {
    timeSlots.innerHTML = '';
    for (let hour = 0; hour < 24; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
        timeSlots.appendChild(timeSlot);
    }
}

// START WEEK ON MONDAY
function getWeekStart(date) {
    const start = new Date(date);
    const day = start.getDay(); 
    start.setDate(start.getDate() - day); 
    start.setHours(0, 0, 0, 0);
    return start;
}

// Crear columnas de días (LUNES -> DOMINGO)
function createDayColumns() {
    // limpiar grid salvo header y time-column (dependiendo de tu estructura)
    // Aquí asumimos que calendarGrid contiene la columna de horas + day columns
    // Removemos todas las columnas de días previas
    document.querySelectorAll('.day-column').forEach(c => c.remove());

    const daysOfWeek = [
        'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
    ];
    
    daysOfWeek.forEach((dayName, index) => {
        const column = document.createElement('div');
        column.className = 'day-column';

        const header = document.createElement('div');
        header.className = 'day-header';

        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + index);

        header.innerHTML = `
            <div class="day-name">${dayName}</div>
            <div class="day-date">${date.getDate()}/${date.getMonth() + 1}</div>
        `;

        column.appendChild(header);

        // Crear slots para cada hora
        for (let hour = 0; hour < 24; hour++) {
            const slot = document.createElement('div');
            slot.className = 'schedule-slot';

            // usar fecha local en formato YYYY-MM-DD para dataset sin conversion UTC
            slot.dataset.date = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
            slot.dataset.hour = hour;
            column.appendChild(slot);
        }

        // asegurarse de relative positioning para eventos
        column.style.position = 'relative';
        calendarGrid.appendChild(column);
    });
}

// Actualizar encabezado del calendario
function updateCalendarHeader() {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);

    const startStr = formatDate(currentWeekStart);
    const endStr = formatDate(endDate);

    currentWeekEl.textContent = `Semana del ${startStr} - ${endStr}`;
}

// Cargar médicos desde la API
async function loadDoctors() {
    try {
        if (typeof obtenerMedicos === 'undefined') {
            console.error('API Client no está cargado');
            return;
        }

        const doctors = await obtenerMedicos();

        const selects = document.querySelectorAll('select[name="doctor"], #doctorSelect');
        selects.forEach(select => {
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }

            doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id_medico;
                const nombreCompleto = `${doctor.nombre || ''} ${doctor.apellido || ''}`.trim();
                option.textContent = nombreCompleto || `Médico ${doctor.id_medico}`;
                select.appendChild(option);
            });
        });

        const urlParams = new URLSearchParams(window.location.search);
        const medicoId = urlParams.get('id_medico');
        if (medicoId) {
            selects.forEach(select => {
                select.value = medicoId;
            });
        }
    } catch (error) {
        console.error('Error al cargar médicos:', error);
    }
}

// Cargar servicios (simulado)
function loadServices() {
    const services = [
        { id: 1, name: 'Consulta General' },
        { id: 2, name: 'Pediatría' },
    ];

    const selects = document.querySelectorAll('select[name="service"]');
    selects.forEach(select => {
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            select.appendChild(option);
        });
    });
}

function attachEventListeners() {
    prevWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        refreshCalendar();
    });

    nextWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        refreshCalendar();
    });

    document.getElementById("addSchedule").addEventListener("click", () => {
        cargarEspecialidades();
        openModal();
    });
    

    document.querySelector('.close-modal').addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSchedule();
        });
    }

    const doctorSelect = document.getElementById('doctorSelect');
    if (doctorSelect) {
        doctorSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                loadSchedules(e.target.value);
            }
        });
    }

    const modalActions = document.querySelectorAll('[data-action]');
    modalActions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]').dataset.action;
            if (action === 'save') {
                saveSchedule();
            } else if (action === 'cancel') {
                closeModal();
            }
        });
    });
}

function formatDate(date) {
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
}

function refreshCalendar() {
    // limpiar events
    document.querySelectorAll('.schedule-events-container').forEach(container => container.remove());
    // remover columnas
    document.querySelectorAll('.day-column').forEach(col => col.remove());
    // recrear columnas y header
    createDayColumns();
    updateCalendarHeader();

    const doctorSelect = document.getElementById('doctorSelect');
    if (doctorSelect && doctorSelect.value) {
        setTimeout(() => {
            loadSchedules(doctorSelect.value);
        }, 100);
    }
}

function openModal(scheduleData = null) {
    if (scheduleData) {
        populateForm(scheduleData);
    } else {
        scheduleForm.reset();
    }
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    scheduleForm.reset();
}

function getLocalDayName(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);

    // Crear fecha en LOCAL (no UTC)
    const d = new Date(year, month - 1, day);

    const daysOfWeek = [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado'
    ];

    return daysOfWeek[d.getDay()];
}

async function saveSchedule() {
    console.log("--- saveSchedule() ---");

    const form = document.querySelector("#scheduleForm");
    const formData = new FormData(form);

    const doctor = formData.get("doctor");
    const service = formData.get("service");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const startTime = formData.get("startTime");
    const endTime = formData.get("endTime");
    const type = formData.get("scheduleType");
    const notes = formData.get("notes");

    if (!doctor || !startDate || !endDate) {
        alert("Por favor llena todos los campos obligatorios.");
        return;
    }

    // Convertir fechas de inicio y fin a objetos local-safe
    const startParts = startDate.split("-").map(Number);
    const endParts = endDate.split("-").map(Number);

    const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);

    // Construir lista de días entre inicio y fin
    const days = [];
    const d = new Date(start);

    while (d <= end) {
        // Convertir fecha local a cadena YYYY-MM-DD sin UTC
        const dateString = d.toLocaleDateString("en-CA");

        // Obtener día de semana de manera segura
        const dayName = getLocalDayName(dateString);

        days.push({
            date: dateString,
            dia_semana: dayName,
            hora_inicio: startTime,
            hora_fin: endTime
        });

        d.setDate(d.getDate() + 1);
    }

    console.log("Días que se enviarán al backend:", days);

    // Enviar cada día al backend
    for (const entry of days) {
        await apiClient.crearHorario({
            id_medico: doctor,
            dia_semana: entry.dia_semana,
            hora_inicio: entry.hora_inicio,
            hora_fin: entry.hora_fin
        });
    }

    console.log("Horarios guardados correctamente.");
    closeModal();
    loadSchedules();
}

// Cargar horarios de un médico
async function loadSchedules(medicoId) {
    try {
        if (typeof obtenerHorarios === 'undefined') {
            console.error('API Client no está cargado');
            return;
        }

        console.log('--- loadSchedules called ---');
        console.log('Medico ID:', medicoId);
        console.log('currentWeekStart (local):', currentWeekStart.toLocaleString());

        const horarios = await obtenerHorarios(medicoId);
        console.log('Horarios raw obtenidos:', horarios);

        // limpiar slots
        document.querySelectorAll('.schedule-slot').forEach(slot => {
            slot.classList.remove('has-schedule');
            slot.innerHTML = '';
            slot.style.position = 'relative';
        });
        document.querySelectorAll('.schedule-events-container').forEach(container => container.remove());

        if (!horarios || horarios.length === 0) {
            console.log('No hay horarios para mostrar');
            return;
        }

        // Map para días (Lunes=0 ... Domingo=6)
        const daysOfWeekMap = {
            'domingo': 0,
            'lunes': 1,
            'martes': 2,
            'miércoles': 3,
            'jueves': 4,
            'viernes': 5,
            'sábado': 6
        };
        

        const dayColumns = document.querySelectorAll('.day-column');

        // Log de columnas con fecha y nombre
        dayColumns.forEach((col, idx) => {
            const headerName = col.querySelector('.day-name')?.textContent || `col-${idx}`;
            const headerDate = col.querySelector('.day-date')?.textContent || '';
            console.log(`Col index ${idx} -> ${headerName} (${headerDate})`);
        });

        horarios.forEach((horario, index) => {
            // Normalizar dia_semana recibido (asegurar minúsculas y sin espacios)
            let diaSemanaRaw = (horario.dia_semana || '').toString().trim();
            let diaSemanaNorm = diaSemanaRaw.toLowerCase();

            // sustituir variantes sin tilde si vienen así
            if (diaSemanaNorm === 'miercoles') diaSemanaNorm = 'miércoles';
            if (diaSemanaNorm === 'sabado') diaSemanaNorm = 'sábado';

            const dayIndex = daysOfWeekMap[diaSemanaNorm];

            console.log(`Procesando horario id=${horario.id_horario || index} -> dia_raw="${diaSemanaRaw}", dia_norm="${diaSemanaNorm}", dayIndex=${dayIndex}`);

            if (dayIndex === undefined || dayIndex < 0 || dayIndex >= dayColumns.length) {
                console.warn('Día de la semana no válido o fuera de rango:', diaSemanaNorm);
                return;
            }

            const dayColumn = dayColumns[dayIndex];
            if (!dayColumn) {
                console.warn('Columna de día no encontrada para índice:', dayIndex);
                return;
            }

            // Parsear horas
            const horaInicioParts = horario.hora_inicio ? horario.hora_inicio.split(':') : ['0', '0'];
            const horaFinParts = horario.hora_fin ? horario.hora_fin.split(':') : ['0', '0'];

            const horaInicio = parseInt(horaInicioParts[0]) || 0;
            const minutoInicio = parseInt(horaInicioParts[1]) || 0;
            const horaFin = parseInt(horaFinParts[0]) || 0;
            const minutoFin = parseInt(horaFinParts[1]) || 0;

            const slotHeight = 60;
            const topPosition = (horaInicio * slotHeight) + (minutoInicio / 60 * slotHeight);
            const duration = (horaFin - horaInicio) + (minutoFin - minutoInicio) / 60;
            const blockHeight = Math.max(30, duration * slotHeight); // mínimo 30px por visibilidad

            const scheduleBlock = document.createElement('div');
            scheduleBlock.className = 'schedule-event';
            scheduleBlock.style.position = 'absolute';
            scheduleBlock.style.left = '4px';
            scheduleBlock.style.right = '4px';
            scheduleBlock.style.top = `${topPosition}px`;
            scheduleBlock.style.height = `${blockHeight}px`;
            scheduleBlock.title = `${horario.hora_inicio} - ${horario.hora_fin}`;
            scheduleBlock.dataset.horarioId = horario.id_horario || index;

            scheduleBlock.innerHTML = `
                <div style="padding: 4px; font-size: 0.75rem; font-weight: 600;">
                    ${horario.hora_inicio} - ${horario.hora_fin}
                </div>
            `;

            let eventsContainer = dayColumn.querySelector('.schedule-events-container');
            if (!eventsContainer) {
                eventsContainer = document.createElement('div');
                eventsContainer.className = 'schedule-events-container';
                eventsContainer.style.position = 'absolute';
                eventsContainer.style.top = '0';
                eventsContainer.style.left = '0';
                eventsContainer.style.right = '0';
                eventsContainer.style.height = `${24 * slotHeight}px`;
                eventsContainer.style.pointerEvents = 'none';
                dayColumn.appendChild(eventsContainer);
            }

            eventsContainer.appendChild(scheduleBlock);

            for (let h = horaInicio; h < horaFin; h++) {
                const slot = dayColumn.querySelector(`[data-hour="${h}"]`);
                if (slot) {
                    slot.classList.add('has-schedule');
                }
            }
            if (horaFin < 24 && minutoFin > 0) {
                const slot = dayColumn.querySelector(`[data-hour="${horaFin}"]`);
                if (slot) slot.classList.add('has-schedule');
            }
        });

        console.log('Horarios renderizados correctamente');
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        if (typeof mostrarError === 'function') {
            mostrarError('Error al cargar los horarios: ' + error.message);
        }
    }
}

async function cargarEspecialidades() {
    try {
        const especialidades = await apiClient.obtenerEspecialidades();
        const select = document.querySelector('#scheduleForm select[name="service"]');

        // Limpiar
        select.innerHTML = '<option value="">Seleccionar Servicio...</option>';

        // Llenar select
        especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.id_especialidad;
            option.textContent = esp.nombre_especialidad;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando especialidades:", error);
    }
}

document.addEventListener('DOMContentLoaded', init);