// DOM Elements for doctor registration
const doctorRegistrationForm = document.getElementById('doctorRegistrationForm');

// Obtener ID del médico desde la URL (si está editando)
const urlParams = new URLSearchParams(window.location.search);
const medicoId = urlParams.get('id');

// Log para debug
if (medicoId) {
    console.log('Modo edición - ID del médico obtenido de la URL:', medicoId);
} else {
    console.log('Modo creación - Nuevo médico');
}

// Cargar especialidades al iniciar
async function loadEspecialidades() {
    try {
        if (typeof llenarEspecialidades === 'undefined') {
            console.error('API Client no está cargado');
            return;
        }
        
        await llenarEspecialidades('especialidad');
    } catch (error) {
        console.error('Error al cargar especialidades:', error);
    }
}

// Cargar datos del médico si está editando
async function loadMedicoData() {
    if (!medicoId) {
        // Si no hay ID, es un nuevo médico
        return;
    }
    
    try {
        if (typeof obtenerMedicoPorId === 'undefined') {
            console.error('API Client no está cargado');
            return;
        }
        
        console.log('Cargando datos del médico con ID:', medicoId);
        const medico = await obtenerMedicoPorId(medicoId);
        
        // El backend devuelve un array, tomar el primer elemento
        let m = null;
        if (Array.isArray(medico) && medico.length > 0) {
            m = medico[0];
        } else if (medico && typeof medico === 'object') {
            // Si es un objeto directamente
            m = medico;
        }
        
        if (!m) {
            console.error('No se encontraron datos del médico');
            if (typeof mostrarError === 'function') {
                mostrarError('No se encontraron datos del médico con ID: ' + medicoId);
            }
            return;
        }
        
        console.log('Datos del médico cargados:', m);
        
        // Llenar formulario con datos del médico
        if (document.getElementById('nombre')) document.getElementById('nombre').value = m.nombre || '';
        if (document.getElementById('apellido')) document.getElementById('apellido').value = m.apellido || '';
        if (document.getElementById('cedula')) document.getElementById('cedula').value = m.cedula || '';
        if (document.getElementById('email')) document.getElementById('email').value = m.email || '';
        if (document.getElementById('telefono')) document.getElementById('telefono').value = m.telefono || '';
        if (document.getElementById('fecha_nacimiento')) {
            // Formatear fecha si es necesario
            const fechaNac = m.fecha_nacimiento ? m.fecha_nacimiento.split(' ')[0] : '';
            document.getElementById('fecha_nacimiento').value = fechaNac;
        }
        if (document.getElementById('genero')) document.getElementById('genero').value = m.genero || '';
        if (document.getElementById('direccion')) document.getElementById('direccion').value = m.direccion || '';
        if (document.getElementById('ciudad')) document.getElementById('ciudad').value = m.ciudad || '';
        if (document.getElementById('estado')) document.getElementById('estado').value = m.estado || '';
        if (document.getElementById('numero_licencia')) document.getElementById('numero_licencia').value = m.numero_licencia || '';
        if (document.getElementById('expedicion_licencia')) {
            const fechaExp = m.expedicion_licencia ? m.expedicion_licencia.split(' ')[0] : '';
            document.getElementById('expedicion_licencia').value = fechaExp;
        }
        if (document.getElementById('vencimiento_licencia')) {
            const fechaVen = m.vencimiento_licencia ? m.vencimiento_licencia.split(' ')[0] : '';
            document.getElementById('vencimiento_licencia').value = fechaVen;
        }
        if (document.getElementById('especialidad')) document.getElementById('especialidad').value = m.id_especialidad || '';
        if (document.getElementById('experiencia_anos')) document.getElementById('experiencia_anos').value = m.experiencia_anos || '';
        
        // Cambiar título del formulario y botón
        const formTitles = document.querySelectorAll('.form-section h2');
        if (formTitles.length > 0) {
            formTitles[0].textContent = 'Editar Información Personal';
        }
        
        const submitButton = doctorRegistrationForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-save"></i> Actualizar Médico';
        }
        
        console.log('Formulario llenado correctamente');
    } catch (error) {
        console.error('Error al cargar datos del médico:', error);
        if (typeof mostrarError === 'function') {
            mostrarError('Error al cargar los datos del médico: ' + error.message);
        } else {
            alert('Error al cargar los datos del médico: ' + error.message);
        }
    }
}

/**
 * Obtener horarios del formulario
 */
function obtenerHorariosFormulario() {
    const horarios = [];
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    
    days.forEach(day => {
        const checkbox = document.querySelector(`input[name="dias[]"][value="${day}"]`);
        
        if (checkbox && checkbox.checked) {
            const horaInicio = document.querySelector(`input[name="${day}_inicio"]`);
            const horaFin = document.querySelector(`input[name="${day}_fin"]`);
            
            if (horaInicio && horaFin && horaInicio.value && horaFin.value) {
                horarios.push({
                    dia_semana: day,
                    hora_inicio: horaInicio.value,
                    hora_fin: horaFin.value,
                    tipo_turno: 'completo'
                });
            }
        }
    });
    
    return horarios;
}

// Form submission handler
if (doctorRegistrationForm) {
    doctorRegistrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Recopilar datos del formulario
            const datosMedico = {
                nombre: document.getElementById('nombre').value.trim(),
                apellido: document.getElementById('apellido').value.trim(),
                cedula: document.getElementById('cedula').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                fecha_nacimiento: document.getElementById('fecha_nacimiento').value || null,
                genero: document.getElementById('genero').value,
                direccion: document.getElementById('direccion').value.trim() || '',
                ciudad: document.getElementById('ciudad').value.trim() || '',
                estado: document.getElementById('estado').value.trim() || '',
                numero_licencia: document.getElementById('numero_licencia').value.trim(),
                expedicion_licencia: document.getElementById('expedicion_licencia').value || null,
                vencimiento_licencia: document.getElementById('vencimiento_licencia').value || null,
                id_especialidad: parseInt(document.getElementById('especialidad').value) || 0,
                experiencia_anos: parseInt(document.getElementById('experiencia_anos').value) || 0
            };

            // Obtener horarios del formulario
            const horarios = obtenerHorariosFormulario();
            
            // Agregar horarios solo si hay alguno seleccionado
            if (horarios.length > 0) {
                datosMedico.horarios = horarios;
                console.log('Horarios a guardar:', horarios);
            } else {
                console.log('No se seleccionaron horarios');
            }

            let success = false;
            
            if (medicoId) {
                // Actualizar médico existente - el ID ya está en la URL, no se pide al usuario
                console.log('Actualizando médico con ID:', medicoId);
                if (typeof actualizarMedico === 'undefined') {
                    alert('Error: API Client no está cargado');
                    return;
                }
                // El ID ya está implícito en la URL, se pasa a la función
                success = await actualizarMedico(medicoId, datosMedico);
            } else {
                // Crear nuevo médico
                console.log('Creando nuevo médico con datos:', datosMedico);
                if (typeof crearMedico === 'undefined') {
                    alert('Error: API Client no está cargado');
                    return;
                }
                success = await crearMedico(datosMedico);
            }

            if (success) {
                // Redirigir a la lista de médicos
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }

        } catch (error) {
            console.error('Error al registrar médico:', error);
            if (typeof mostrarError === 'function') {
                mostrarError('Error al registrar el médico. Por favor intente nuevamente.');
            } else {
                alert('Error al registrar el médico. Por favor intente nuevamente.');
            }
        }
    });
}

// File upload preview (if needed)
const fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        console.log(`Selected files for ${e.target.name}:`, files.map(f => f.name));
    });
});

// Dynamic schedule fields
const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const scheduleGrid = document.querySelector('.schedule-grid');

// Create schedule fields for each day
days.forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'schedule-day';
    
    // Capitalizar y normalizar nombre del día para mostrar
    let displayDay = day.charAt(0).toUpperCase() + day.slice(1);
    if (day === 'miercoles') displayDay = 'Miércoles';
    if (day === 'sabado') displayDay = 'Sábado';
    
    dayDiv.innerHTML = `
        <label>
            <input type="checkbox" name="dias[]" value="${day}"> ${displayDay}
        </label>
        <div class="schedule-hours">
            <input type="time" name="${day}_inicio" disabled>
            <span>a</span>
            <input type="time" name="${day}_fin" disabled>
        </div>
    `;

    // Enable/disable time inputs based on checkbox
    const checkbox = dayDiv.querySelector('input[type="checkbox"]');
    const timeInputs = dayDiv.querySelectorAll('input[type="time"]');
    
    checkbox.addEventListener('change', () => {
        timeInputs.forEach(input => {
            input.disabled = !checkbox.checked;
            if (!checkbox.checked) {
                input.value = '';
            }
        });
    });

    scheduleGrid.appendChild(dayDiv);
});

// Form validation
function validateForm() {
    let isValid = true;
    const requiredFields = doctorRegistrationForm.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });

    // Validar email
    const email = document.getElementById('email').value;
    if (email && typeof validarEmail === 'function' && !validarEmail(email)) {
        isValid = false;
        document.getElementById('email').classList.add('error');
        if (typeof mostrarError === 'function') {
            mostrarError('El email no es válido');
        } else {
            alert('El email no es válido');
        }
    }

    // Validar horarios (al menos verificar que si hay checkbox marcado tenga horas)
    const checkboxes = document.querySelectorAll('input[name="dias[]"]:checked');
    checkboxes.forEach(checkbox => {
        const day = checkbox.value;
        const horaInicio = document.querySelector(`input[name="${day}_inicio"]`);
        const horaFin = document.querySelector(`input[name="${day}_fin"]`);
        
        if (!horaInicio.value || !horaFin.value) {
            isValid = false;
            horaInicio.classList.add('error');
            horaFin.classList.add('error');
        }
    });

    if (!isValid) {
        if (typeof mostrarError === 'function') {
            mostrarError('Por favor complete todos los campos requeridos correctamente');
        } else {
            alert('Por favor complete todos los campos requeridos correctamente');
        }
    }

    return isValid;
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await loadEspecialidades();
    await loadMedicoData();
});