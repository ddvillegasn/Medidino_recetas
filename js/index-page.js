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
                console.log('API /api/pacientes status:', response.status);
                if (response.ok) return response.json();
                // Try to log body for debugging (text)
                return response.text().then(text => {
                    console.warn('API response body on error:', text);
                    if (response.status === 404) throw new Error('Paciente no encontrado');
                    throw new Error('Error al consultar paciente (status ' + response.status + ')');
                });
            })
        .then(paciente => {
            console.log('✅ Paciente encontrado (API):', paciente);

            const pacienteBox = document.getElementById('pacienteEncontradoBox');
            if (pacienteBox) {
                pacienteBox.style.display = 'block';
                document.getElementById('pacienteNombreMostrar').textContent = paciente.nombre;
                document.getElementById('pacienteCedulaMostrar').textContent = paciente.identificacion;
                document.getElementById('pacienteTelefonoMostrar').textContent = paciente.telefono;
                    // API returns id_paciente; accept both keys if present
                    document.getElementById('pacienteIdHidden').value = paciente.id_paciente || paciente.id || '';
            }

            // Pre-llenar los campos del formulario (proteger contra elementos ausentes)
            (function setIfExists(id, val) { const el = document.getElementById(id); if (el) el.value = val; else console.debug('Elemento no encontrado para set:', id); })('nombrePaciente', paciente.nombre || '');
            (function setIfExists(id, val) { const el = document.getElementById(id); if (el) el.value = val; else console.debug('Elemento no encontrado para set:', id); })('identificacionPaciente', paciente.identificacion || '');
            (function setIfExists(id, val) { const el = document.getElementById(id); if (el) el.value = val; else console.debug('Elemento no encontrado para set:', id); })('fechaNacimiento', paciente.fecha_nacimiento || '');
            (function setIfExists(id, val) { const el = document.getElementById(id); if (el) el.value = val; else console.debug('Elemento no encontrado para set:', id); })('telefonoPaciente', paciente.telefono || '');

            // Mostrar solo la acción en el índice: botón que lleva a la gestión completa.
            const contenedor = document.getElementById('contenidoFormularioReceta');
            if (contenedor) {
                contenedor.style.display = 'block';
                const btn = document.getElementById('btnIrGestionReceta');
                if (btn) {
                    btn.style.display = 'inline-flex';
                    btn.onclick = function () {
                        try {
                            sessionStorage.setItem('pacienteSeleccionado', JSON.stringify(paciente));
                        } catch (e) {
                            console.error('No se pudo guardar paciente en sessionStorage', e);
                        }
                        window.location.href = '/nueva-receta';
                    };
                    setTimeout(() => btn.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
                }
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

    // Si venimos desde 'Gestión' con un paciente seleccionado en sessionStorage, cargarlo
    try {
        const pacienteSelRaw = sessionStorage.getItem('pacienteSeleccionado');
        if (pacienteSelRaw) {
            const pacienteSel = JSON.parse(pacienteSelRaw);
            console.log('⚙️ Cargando paciente desde sessionStorage:', pacienteSel);

            // Prellenar los campos visibles en el formulario (si existen)
            (function setIfExists(id, val) { const el = document.getElementById(id); if (el) el.value = val; else console.debug('Elemento no encontrado al precargar:', id); })('buscarPacienteCedula', pacienteSel.identificacion || '');
            (function setIfExists(id, val) { const el = document.getElementById(id); if (el) el.value = val; else console.debug('Elemento no encontrado al precargar:', id); })('nombrePaciente', pacienteSel.nombre || '');
            (function setIfExists(id, val) { const el = document.getElementById(id); if (el) el.value = val; else console.debug('Elemento no encontrado al precargar:', id); })('identificacionPaciente', pacienteSel.identificacion || '');
            (function setIfExists(id, val) { const el = document.getElementById(id); if (el) el.value = val; else console.debug('Elemento no encontrado al precargar:', id); })('fechaNacimiento', pacienteSel.fecha_nacimiento || '');
            (function setIfExists(id, val) { const el = document.getElementById(id); if (el) el.value = val; else console.debug('Elemento no encontrado al precargar:', id); })('telefonoPaciente', pacienteSel.telefono || '');

            // Marcar paciente como encontrado en la UI
            const pacienteBox = document.getElementById('pacienteEncontradoBox');
            if (pacienteBox) {
                pacienteBox.style.display = 'block';
                document.getElementById('pacienteNombreMostrar').textContent = pacienteSel.nombre || '';
                document.getElementById('pacienteCedulaMostrar').textContent = pacienteSel.identificacion || '';
                document.getElementById('pacienteTelefonoMostrar').textContent = pacienteSel.telefono || '';
                console.debug('Paciente cargado desde sessionStorage (id keys):', pacienteSel.id_paciente, pacienteSel.id);
                document.getElementById('pacienteIdHidden').value = pacienteSel.id_paciente || pacienteSel.id || '';
            }

            // Mostrar solo la acción en el índice (botón a gestión completa)
            const contenedor = document.getElementById('contenidoFormularioReceta');
            if (contenedor) {
                contenedor.style.display = 'block';
                const btn = document.getElementById('btnIrGestionReceta');
                if (btn) {
                    btn.style.display = 'inline-flex';
                    btn.onclick = function () {
                        try { sessionStorage.setItem('pacienteSeleccionado', JSON.stringify(pacienteSel)); } catch (e) { console.error(e); }
                        window.location.href = '/nueva-receta';
                    };
                }
            }

            // Limpiar la sessionStorage para evitar recargas indeseadas
            sessionStorage.removeItem('pacienteSeleccionado');
        }
    } catch (err) {
        console.warn('No se pudo cargar paciente desde sessionStorage:', err);
    }
});

// Cargar médicos desde el módulo PHP y popular el select del índice
async function cargarMedicosHomeIndex() {
    const select = document.getElementById('selectMedicoHomeIndex');
    if (!select) return;
    select.innerHTML = '<option value="">Cargando médicos...</option>';
    try {
        const resp = await fetch('http://localhost/Medidino_recetas/backend/medicos.php');
        const j = await resp.json();
        const medicos = (j && j.data) ? j.data : [];
        if (!Array.isArray(medicos) || medicos.length === 0) {
            select.innerHTML = '<option value="">No se encontraron médicos</option>';
            return;
        }
        select.innerHTML = '<option value="">-- Seleccione un médico --</option>';
        medicos.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id_medico || m.id || '';
            opt.textContent = [m.nombre, m.apellido].filter(Boolean).join(' ') + (m.nombre_especialidad ? (' — ' + m.nombre_especialidad) : '');
            select.appendChild(opt);
        });

        // Si hay selección previa en localStorage, aplicarla
        const sel = localStorage.getItem('medicoSeleccionado');
        if (sel) select.value = sel;

        // Botón para confirmar selección
        const btn = document.getElementById('btnSeleccionMedicoIndex');
        if (btn) {
            btn.onclick = function() {
                const val = select.value;
                if (!val) { alert('Seleccione un médico antes de continuar'); return; }
                localStorage.setItem('medicoSeleccionado', val);
                alert('Médico seleccionado. Ahora puede ir a Gestión de Receta.');
            };
        }
    } catch (e) {
        select.innerHTML = '<option value="">Error al cargar médicos</option>';
        console.error('Error cargando médicos home index', e);
    }
}

// Ejecutar carga de médicos en el home
document.addEventListener('DOMContentLoaded', cargarMedicosHomeIndex);

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

    // Obtener médico seleccionado en el home (select) o en localStorage
    const selectMedHome = document.getElementById('selectMedicoHomeIndex');
    const selectedMedico = (selectMedHome && selectMedHome.value) ? parseInt(selectMedHome.value) : (localStorage.getItem('medicoSeleccionado') ? parseInt(localStorage.getItem('medicoSeleccionado')) : null);

    const payload = {
        identificacion: identificacionPaciente,
        id_medico: selectedMedico,
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
            // Si el usuario marcó enviar notificación, crear notificación en backend
            try {
                const enviar = document.getElementById('enviarNotificacion')?.checked;
                if (enviar) {
                    const notiPayload = {
                        identificacion: identificacionPaciente,
                        id_receta: data.id_receta,
                        canal: 'SMS',
                        mensaje: `Su receta ${data.numero_receta} ha sido registrada. Revise el historial o contacte a la clínica.`
                    };

                    fetch('/api/notificaciones', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(notiPayload)
                    }).then(nres => nres.json()).then(nData => {
                        console.log('Notificación creada:', nData);
                    }).catch(nerr => {
                        console.error('Error creando notificación:', nerr);
                    });
                }
            } catch (e) {
                console.error('Error al intentar crear notificación:', e);
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
