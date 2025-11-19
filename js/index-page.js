// Script extraído de index.html - búsqueda de paciente y manejo de formulario
console.log('🔍 Verificando elementos del sidebar...');
console.log('menuToggle:', document.getElementById('menuToggle'));
console.log('sidebar:', document.getElementById('sidebar'));
console.log('closeSidebar:', document.getElementById('closeSidebar'));
console.log('overlay:', document.getElementById('overlay'));

// NOTE: Replaced client-side mock with API calls to /api/pacientes

// Función para buscar y cargar paciente
function buscarYCargarPaciente() {
    const cedula = document.getElementById('buscarPacienteCedula').value.trim();
    
    if (!cedula) {
        alert('⚠️ Por favor ingrese un número de cédula');
        return;
    }
    console.log('🔍 Buscando paciente (API) con cédula:', cedula);

    fetch(`/api/pacientes/${encodeURIComponent(cedula)}`)
        .then(response => {
            if (response.ok) return response.json();
            if (response.status === 404) throw new Error('Paciente no encontrado');
            throw new Error('Error al consultar paciente');
        })
        .then(paciente => {
            console.log('✅ Paciente encontrado (API):', paciente);

            const pacienteBox = document.getElementById('pacienteEncontradoBox');
            if (pacienteBox) {
                pacienteBox.style.display = 'block';
                document.getElementById('pacienteNombreMostrar').textContent = paciente.nombre;
                document.getElementById('pacienteCedulaMostrar').textContent = paciente.identificacion;
                document.getElementById('pacienteTelefonoMostrar').textContent = paciente.telefono;
                document.getElementById('pacienteIdHidden').value = paciente.id_paciente || '';
            }

            // Pre-llenar los campos del formulario
            document.getElementById('nombrePaciente').value = paciente.nombre || '';
            document.getElementById('identificacionPaciente').value = paciente.identificacion || '';
            document.getElementById('fechaNacimiento').value = paciente.fecha_nacimiento || '';
            document.getElementById('telefonoPaciente').value = paciente.telefono || '';

            // Mostrar formulario
            const contenedor = document.getElementById('contenidoFormularioReceta');
            if (contenedor) {
                contenedor.style.display = 'block';
                const fechaInput = document.getElementById('fechaEmision');
                if (fechaInput) fechaInput.value = new Date().toISOString().split('T')[0];

                setTimeout(() => contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }

            alert('✅ Paciente encontrado: ' + (paciente.nombre || '') + '\n\nDatos cargados. Complete la receta.');
        })
        .catch(err => {
            console.log('❌ Error buscando paciente:', err);
            alert('❌ ' + err.message + '\n\nLa cédula ' + cedula + ' no está registrada.\n\nRegistre al paciente en el módulo de Gestión de Pacientes.');
            document.getElementById('pacienteEncontradoBox').style.display = 'none';
            document.getElementById('contenidoFormularioReceta').style.display = 'none';
        });
}

// Función para limpiar
function limpiarPaciente() {
    document.getElementById('buscarPacienteCedula').value = '';
    document.getElementById('pacienteEncontradoBox').style.display = 'none';
    const contenedor = document.getElementById('contenidoFormularioReceta');
    if (contenedor) {
        contenedor.style.display = 'none';
    }
}

// Permitir buscar con Enter
document.addEventListener('DOMContentLoaded', function() {
    const campoCedula = document.getElementById('buscarPacienteCedula');
    if (campoCedula) {
        campoCedula.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarYCargarPaciente();
            }
        });
    }

    // Manejar envío del formulario de nueva receta
    const formReceta = document.getElementById('nuevaRecetaForm');
    if (formReceta) {
        formReceta.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarReceta();
        });
    }
});

// Función para guardar la receta
function guardarReceta() {
    // Validar que haya un paciente
    const pacienteId = document.getElementById('pacienteIdHidden')?.value;
    const nombrePaciente = document.getElementById('nombrePaciente').value.trim();
    
    if (!pacienteId && !nombrePaciente) {
        alert('⚠️ Debe buscar o registrar un paciente primero');
        return;
    }

    // Obtener datos del formulario
    const fechaEmision = document.getElementById('fechaEmision').value;
    const diagnostico = document.getElementById('diagnostico').value.trim();
    const medicamento = document.getElementById('medicamentoNombre').value.trim();
    const dosis = document.getElementById('dosis').value.trim();
    const duracion = document.getElementById('duracion').value.trim();
    const observaciones = document.getElementById('observaciones').value.trim();

    // Validaciones básicas
    if (!fechaEmision || !diagnostico || !medicamento || !dosis || !duracion) {
        alert('⚠️ Por favor complete todos los campos obligatorios');
        return;
    }

    // Preparar payload para la API
    const identificacionPaciente = document.getElementById('identificacionPaciente').value || null;

    const payload = {
        identificacion: identificacionPaciente,
        id_medico: 1, // en demo usamos médico por defecto
        fecha_emision: fechaEmision,
        observaciones: observaciones,
        detalles: [
            {
                medicamento_nombre: medicamento,
                dosis: dosis,
                duracion: duracion,
                frecuencia: 'Según indicación',
                indicaciones: observaciones
            }
        ]
    };

    console.log('📋 Enviando receta al backend:', payload);

    fetch('/api/recetas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        const data = await res.json().catch(() => ({}));
        if (res.status === 201) {
            alert('✅ Receta guardada exitosamente!\n\n' +
                  'Número de Receta: ' + data.numero_receta + '\n' +
                  'Paciente: ' + nombrePaciente + '\n' +
                  'Medicamento: ' + medicamento + '\n\n' +
                  'La receta ha sido registrada en la base de datos.');

            const respuesta = confirm('¿Desea crear otra receta?\n\nPresione OK para crear otra receta\nPresione Cancelar para ver el historial');
            if (respuesta) {
                limpiarFormularioReceta();
            } else {
                window.location.href = '/historial';
            }
        } else {
            console.error('Error guardando receta', data);
            alert('❌ Error al guardar la receta: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(err => {
        console.error('Fetch error:', err);
        alert('❌ Error de red al guardar la receta');
    });
}

// Función para limpiar el formulario
function limpiarFormularioReceta() {
    document.getElementById('buscarPacienteCedula').value = '';
    document.getElementById('pacienteEncontradoBox').style.display = 'none';
    document.getElementById('contenidoFormularioReceta').style.display = 'none';
    const form = document.getElementById('nuevaRecetaForm');
    if (form) form.reset();
}
