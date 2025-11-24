// ============================================
// GESTIÓN DE RECETA MÉDICA - FUNCIONALIDAD
// ============================================

console.log('✅ Archivo nueva-receta.js cargado correctamente');

// Contador de medicamentos
let medicamentoCount = 1;

// URL del endpoint PHP que devuelve médicos en formato JSON.
// Se obtiene de la configuración centralizada en js/config.js
// Si no está disponible, usar URL por defecto
const PHP_MEDICOS_API = (window.MEDICOS_CONFIG && window.MEDICOS_CONFIG.apiUrl) 
    || 'http://localhost/Medidino_recetas/backend/medicos.php';

// Médico seleccionado desde la lista remota (si el usuario elige uno)
let medicoSeleccionadoExternamente = null;

// ============================================
// Eliminada simulación de médico activo. El médico se selecciona en el formulario.

// ============================================
// DATOS DE EJEMPLO (Simula base de datos)
// ============================================
// Base de datos indexada por identificación para búsqueda rápida
const pacientesDB = {
    "1234567": {
        id: 1,
        nombre: "Ana María Pérez González",
        identificacion: "1234567",
        edad: 35,
        genero: "Femenino",
        telefono: "301-234-5678",
        correo: "ana.perez@email.com",
        direccion: "Calle 45 #12-34, Bogotá"
    },
    "2345678": {
        id: 2,
        nombre: "Juan Carlos García López",
        identificacion: "2345678",
        edad: 42,
        genero: "Masculino",
        telefono: "302-345-6789",
        correo: "juan.garcia@email.com",
        direccion: "Carrera 15 #23-45, Bogotá"
    },
    "3456789": {
        id: 3,
        nombre: "María Sofía Rodríguez Martínez",
        identificacion: "3456789",
        edad: 28,
        genero: "Femenino",
        telefono: "303-456-7890",
        correo: "sofia.rodriguez@email.com",
        direccion: "Avenida 68 #34-56, Bogotá"
    },
    "4567890": {
        id: 4,
        nombre: "Carlos Alberto Ramírez Torres",
        identificacion: "4567890",
        edad: 55,
        genero: "Masculino",
        telefono: "304-567-8901",
        correo: "carlos.ramirez@email.com",
        direccion: "Transversal 22 #45-67, Bogotá"
    },
    "5678901": {
        id: 5,
        nombre: "Laura Patricia Gómez Vargas",
        identificacion: "5678901",
        edad: 31,
        genero: "Femenino",
        telefono: "305-678-9012",
        correo: "laura.gomez@email.com",
        direccion: "Diagonal 30 #56-78, Bogotá"
    }
};

// Base de datos de recetas por paciente
const recetasDB = {
    1: [ // Recetas de Ana María (id_paciente: 1)
        {
            id_receta: 123,
            numero_receta: "RX-2025-00123",
            fecha_emision: "2025-10-25",
            observaciones: "Tomar después de las comidas. Control en 7 días.",
            estado: "Completado",
            id_paciente: 1,
            id_medico: 1,
            medico_nombre: "Dr. Roberto Sánchez",
            medico_especialidad: "Medicina General",
            medicamentos: [
                {
                    id_detalle: 301,
                    id_medicamento: 1,
                    nombre: "Amoxicilina 500mg",
                    dosis: "500 mg",
                    frecuencia: "Cada 8 horas",
                    duracion: "7 días"
                },
                {
                    id_detalle: 302,
                    id_medicamento: 2,
                    nombre: "Ibuprofeno 400mg",
                    dosis: "400 mg",
                    frecuencia: "Cada 12 horas",
                    duracion: "5 días"
                }
            ],
            historial_cambios: [
                {
                    id_cambio: 1,
                    id_receta: 123,
                    id_usuario: 1,
                    usuario_nombre: "Dr. Roberto Sánchez",
                    fecha_cambio: "2025-10-25 08:30:00",
                    campo_modificado: "CREACION",
                    valor_anterior: null,
                    valor_nuevo: "Receta creada",
                    motivo: "Nueva receta emitida"
                },
                {
                    id_cambio: 2,
                    id_receta: 123,
                    id_usuario: 1,
                    usuario_nombre: "Dr. Roberto Sánchez",
                    fecha_cambio: "2025-10-25 09:15:00",
                    campo_modificado: "dosis",
                    valor_anterior: "Amoxicilina 250mg",
                    valor_nuevo: "Amoxicilina 500mg",
                    motivo: "Ajuste de dosis por peso del paciente"
                },
                {
                    id_cambio: 3,
                    id_receta: 123,
                    id_usuario: 1,
                    usuario_nombre: "Dr. Roberto Sánchez",
                    fecha_cambio: "2025-10-27 14:20:00",
                    campo_modificado: "estado",
                    valor_anterior: "Pendiente",
                    valor_nuevo: "Completado",
                    motivo: "Paciente completó el tratamiento"
                }
            ]
        },
        {
            id_receta: 98,
            numero_receta: "RX-2025-00098",
            fecha_emision: "2025-10-20",
            observaciones: "Control de presión arterial mensual.",
            estado: "Pendiente",
            id_paciente: 1,
            id_medico: 2,
            medico_nombre: "Dra. María López",
            medico_especialidad: "Cardiología",
            medicamentos: [
                {
                    id_detalle: 250,
                    id_medicamento: 7,
                    nombre: "Losartán 50mg",
                    dosis: "50 mg",
                    frecuencia: "Una vez al día",
                    duracion: "30 días"
                }
            ],
            historial_cambios: [
                {
                    id_cambio: 4,
                    id_receta: 98,
                    id_usuario: 2,
                    usuario_nombre: "Dra. María López",
                    fecha_cambio: "2025-10-20 10:45:00",
                    campo_modificado: "CREACION",
                    valor_anterior: null,
                    valor_nuevo: "Receta creada",
                    motivo: "Tratamiento para hipertensión arterial"
                },
                {
                    id_cambio: 5,
                    id_receta: 98,
                    id_usuario: 2,
                    usuario_nombre: "Dra. María López",
                    fecha_cambio: "2025-10-22 16:30:00",
                    campo_modificado: "observaciones",
                    valor_anterior: "Control mensual",
                    valor_nuevo: "Control de presión arterial mensual.",
                    motivo: "Aclaración de indicaciones"
                }
            ]
        },
        {
            id_receta: 75,
            numero_receta: "RX-2025-00075",
            fecha_emision: "2025-10-15",
            observaciones: "Paciente alérgica a aspirina. Suspendido por efectos secundarios.",
            estado: "Cancelado",
            id_paciente: 1,
            id_medico: 3,
            medico_nombre: "Dr. Carlos Ramírez",
            medico_especialidad: "Medicina Interna",
            medicamentos: [
                {
                    id_detalle: 195,
                    id_medicamento: 3,
                    nombre: "Paracetamol 500mg",
                    dosis: "500 mg",
                    frecuencia: "Cada 6 horas",
                    duracion: "3 días"
                }
            ],
            historial_cambios: [
                {
                    id_cambio: 6,
                    id_receta: 75,
                    id_usuario: 3,
                    usuario_nombre: "Dr. Carlos Ramírez",
                    fecha_cambio: "2025-10-15 11:00:00",
                    campo_modificado: "CREACION",
                    valor_anterior: null,
                    valor_nuevo: "Receta creada",
                    motivo: "Tratamiento para dolor y fiebre"
                },
                {
                    id_cambio: 7,
                    id_receta: 75,
                    id_usuario: 3,
                    usuario_nombre: "Dr. Carlos Ramírez",
                    fecha_cambio: "2025-10-16 09:20:00",
                    campo_modificado: "observaciones",
                    valor_anterior: "Tratamiento sintomático",
                    valor_nuevo: "Paciente alérgica a aspirina. Suspendido por efectos secundarios.",
                    motivo: "Paciente reportó reacción alérgica"
                },
                {
                    id_cambio: 8,
                    id_receta: 75,
                    id_usuario: 3,
                    usuario_nombre: "Dr. Carlos Ramírez",
                    fecha_cambio: "2025-10-16 09:25:00",
                    campo_modificado: "estado",
                    valor_anterior: "Pendiente",
                    valor_nuevo: "Cancelado",
                    motivo: "Suspensión por efectos adversos"
                }
            ]
        }
    ],
    2: [ // Recetas de Juan Carlos (id_paciente: 2)
        {
            id_receta: 110,
            numero_receta: "RX-2025-00110",
            fecha_emision: "2025-10-22",
            observaciones: "Tratamiento para diabetes tipo 2. Dieta baja en azúcares.",
            estado: "Pendiente",
            id_paciente: 2,
            id_medico: 1,
            medico_nombre: "Dr. Roberto Sánchez",
            medico_especialidad: "Medicina General",
            medicamentos: [
                {
                    id_detalle: 280,
                    id_medicamento: 7,
                    nombre: "Metformina 850mg",
                    dosis: "850 mg",
                    frecuencia: "Dos veces al día",
                    duracion: "30 días"
                }
            ],
            historial_cambios: [
                {
                    id_cambio: 9,
                    id_receta: 110,
                    id_usuario: 1,
                    usuario_nombre: "Dr. Roberto Sánchez",
                    fecha_cambio: "2025-10-22 15:30:00",
                    campo_modificado: "CREACION",
                    valor_anterior: null,
                    valor_nuevo: "Receta creada",
                    motivo: "Inicio de tratamiento para diabetes tipo 2"
                }
            ]
        }
    ]
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Módulo de Gestión de Receta Médica cargado');
    cargarMedicamentosDisponibles();
    cargarMedicosDesdePHP().then(() => {
        const idMedico = localStorage.getItem('medicoSeleccionado');
        const select = document.getElementById('selectMedico');
        if (idMedico && select) {
            select.value = idMedico;
            medicoSeleccionadoExternamente = parseInt(idMedico);
        }
        
        // 🔥 NUEVO: Cargar receta desde historial si existe
        verificarYCargarRecetaDesdeHistorial();
    });
    inicializarEventos();
    actualizarFechaModal();
});

// ==========================
// CARGAR MÉDICOS DESDE PHP
// ==========================
async function cargarMedicosDesdePHP() {
    const select = document.getElementById('selectMedico');
    if (!select) return;

    select.innerHTML = '<option value="">Cargando médicos...</option>';

    try {
        const resp = await fetch(PHP_MEDICOS_API, { method: 'GET' });
        if (!resp.ok) throw new Error('Respuesta no OK: ' + resp.status);
        const json = await resp.json();

        // La API PHP devuelve: { success: true, message: '', data: [ ... ] }
        const medicos = (json && json.data) ? json.data : (Array.isArray(json) ? json : []);

        if (!Array.isArray(medicos) || medicos.length === 0) {
            select.innerHTML = '<option value="">No se encontraron médicos</option>';
            return;
        }

        // Construir opciones
        select.innerHTML = '<option value="">-- Seleccione un médico --</option>';
        medicos.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id_medico || m.id || '';
            const nombreCompleto = [m.nombre, m.apellido].filter(Boolean).join(' ');
            const especialidad = m.nombre_especialidad ? ` — ${m.nombre_especialidad}` : '';
            opt.textContent = `${nombreCompleto}${especialidad}`;
            // Guardar detalles en dataset por si se necesitan
            opt.dataset.nombre = nombreCompleto;
            opt.dataset.especialidad = m.nombre_especialidad || '';
            select.appendChild(opt);
        });

        // Recuperar médico seleccionado del localStorage y preseleccionarlo
        const medicoGuardado = localStorage.getItem('medicoSeleccionado');
        if (medicoGuardado) {
            select.value = medicoGuardado;
            medicoSeleccionadoExternamente = parseInt(medicoGuardado);
            // Deshabilitar el select para que no se pueda cambiar
            select.disabled = true;
            console.log(`✅ Médico preseleccionado desde localStorage: ${medicoGuardado}`);
        }

        // Si el usuario intenta cambiar la selección (solo aplica si no está deshabilitado), actualizar variable y guardar en localStorage
        if (!select.disabled) {
            select.addEventListener('change', (e) => {
                const val = e.target.value;
                medicoSeleccionadoExternamente = val ? parseInt(val) : null;
                if (val) {
                    localStorage.setItem('medicoSeleccionado', val);
                }
            });
        }

        console.log(`✅ Cargados ${medicos.length} médicos desde PHP`);
    } catch (err) {
        console.error('❌ Error cargando médicos desde PHP:', err);
        select.innerHTML = '<option value="">Error al cargar médicos</option>';
    }
}

// ============================================
// CARGAR INFORMACIÓN DEL MÉDICO ACTIVO
// ============================================
function cargarInfoMedicoActivo() {
    // En producción, esta info vendría de la sesión del usuario logueado
    // const medicoActivo = obtenerSesionActual();
    
    const nombreElem = document.getElementById('medicoNombre');
    const especialidadElem = document.getElementById('medicoEspecialidad');
    const registroElem = document.getElementById('medicoRegistro');
    
    if (nombreElem) {
        nombreElem.textContent = medicoActivo.nombre;
    }
    
    if (especialidadElem) {
        especialidadElem.innerHTML = 
            `<i class="fas fa-stethoscope"></i> ${medicoActivo.especialidad}`;
    }
    
    if (registroElem) {
        registroElem.innerHTML = 
            `<i class="fas fa-id-card"></i> Registro Médico: ${medicoActivo.registro}`;
    }
    
    console.log('✅ Médico activo cargado:', medicoActivo);
}

// ============================================
// CARGAR MEDICAMENTOS DISPONIBLES (API GRUPO 1)
// ============================================
async function cargarMedicamentosDisponibles() {
    const selectMedicamento = document.getElementById('medicamento_0');
    
    // Si el elemento no existe, salir silenciosamente
    if (!selectMedicamento) {
        console.log('⚠️ Campo medicamento_0 no encontrado, omitiendo carga de medicamentos');
        return;
    }
    
    try {
        // Mostrar indicador de carga
        selectMedicamento.innerHTML = '<option value="">Cargando medicamentos...</option>';
        
        console.log('🔄 Consultando API de medicamentos...');
        
        // Consultar API de Flask que ahora lee de MySQL (farmacia)
        const response = await fetch('/api/medicamentos?disponibles=1');
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const medicamentos = await response.json();
        
        console.log(`📦 Recibidos ${medicamentos.length} medicamentos de la API`);
        
        // Limpiar select
        selectMedicamento.innerHTML = '<option value="">Seleccione un medicamento...</option>';
        
        // Llenar select con medicamentos disponibles
        let medicamentosDisponibles = 0;
        medicamentos.forEach(med => {
            if (med.stock > 0) {  // Solo mostrar con stock disponible
                const option = document.createElement('option');
                option.value = med.id;
                const presentacion = med.categoria || med.presentacion || '';
                const unidad = med.tipo || 'unidades';
                option.textContent = `${med.nombre} ${presentacion} - Disponible: ${med.stock} ${unidad}`;
                option.dataset.nombre = `${med.nombre} ${presentacion}`;
                selectMedicamento.appendChild(option);
                medicamentosDisponibles++;
            }
        });
        
        console.log(`✅ ${medicamentosDisponibles} medicamentos con stock disponible cargados`);
        
        if (medicamentosDisponibles === 0) {
            selectMedicamento.innerHTML = '<option value="">No hay medicamentos disponibles</option>';
            console.warn('⚠️ No hay medicamentos con stock > 0');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar medicamentos:', error);
        selectMedicamento.innerHTML = '<option value="">Error al cargar medicamentos</option>';
        
        // Mostrar error más detallado en consola
        console.error('Detalles del error:', {
            message: error.message,
            stack: error.stack
        });
        
        if (window.mostrarNotificacion) {
            mostrarNotificacion('Error al cargar medicamentos del inventario. Verifica que el servidor Flask esté corriendo.', 'error');
        }
    }
}

// Simulación de API del Grupo 1 (Gestión de Medicamentos)
async function simularAPIGrupo1Medicamentos() {
    // En producción esto será: await fetch('/api/medicamentos/disponibles')
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    nombre: "Amoxicilina",
                    presentacion: "500mg",
                    stock: 150,
                    unidad: "tabletas",
                    categoria: "Antibiótico",
                    lote: "LOT-2025-001",
                    fecha_vencimiento: "2026-12-31"
                },
                {
                    id: 2,
                    nombre: "Ibuprofeno",
                    presentacion: "400mg",
                    stock: 200,
                    unidad: "tabletas",
                    categoria: "Analgésico",
                    lote: "LOT-2025-002",
                    fecha_vencimiento: "2026-10-15"
                },
                {
                    id: 3,
                    nombre: "Paracetamol",
                    presentacion: "500mg",
                    stock: 300,
                    unidad: "tabletas",
                    categoria: "Analgésico",
                    lote: "LOT-2025-003",
                    fecha_vencimiento: "2027-03-20"
                },
                {
                    id: 4,
                    nombre: "Loratadina",
                    presentacion: "10mg",
                    stock: 100,
                    unidad: "tabletas",
                    categoria: "Antihistamínico",
                    lote: "LOT-2025-004",
                    fecha_vencimiento: "2026-08-10"
                },
                {
                    id: 5,
                    nombre: "Omeprazol",
                    presentacion: "20mg",
                    stock: 180,
                    unidad: "cápsulas",
                    categoria: "Antiácido",
                    lote: "LOT-2025-005",
                    fecha_vencimiento: "2026-11-25"
                },
                {
                    id: 6,
                    nombre: "Losartán",
                    presentacion: "50mg",
                    stock: 0,  // Sin stock - no se mostrará
                    unidad: "tabletas",
                    categoria: "Antihipertensivo",
                    lote: "LOT-2025-006",
                    fecha_vencimiento: "2026-09-05"
                },
                {
                    id: 7,
                    nombre: "Metformina",
                    presentacion: "850mg",
                    stock: 250,
                    unidad: "tabletas",
                    categoria: "Antidiabético",
                    lote: "LOT-2025-007",
                    fecha_vencimiento: "2027-01-18"
                }
            ]);
        }, 500); // Simula latencia de red
    });
}

// ============================================
// EVENTOS
// ============================================
function inicializarEventos() {
    // Permitir búsqueda con Enter
    const campoId = document.getElementById('buscarPacienteId');
    if (campoId) {
        campoId.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarPacienteYRecetas();
            }
        });
    }
    
    // Agregar medicamento
    const btnAgregar = document.getElementById('btnAgregarMedicamento');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', agregarMedicamento);
    }
    
    // Botones de formulario
    const btnLimpiar = document.getElementById('btnLimpiar');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFormulario);
    }
    
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarFormulario);
    }
    
    const formReceta = document.getElementById('formNuevaReceta');
    if (formReceta) {
        formReceta.addEventListener('submit', generarReceta);
    }
    
    // Actualizar vista previa en tiempo real
    const inputs = document.querySelectorAll('#formNuevaReceta input, #formNuevaReceta select, #formNuevaReceta textarea');
    if (inputs.length > 0) {
        inputs.forEach(input => {
            input.addEventListener('change', actualizarVistaPrevia);
            input.addEventListener('input', actualizarVistaPrevia);
        });
    }
    
    console.log('✅ Eventos inicializados correctamente');
}

// ============================================
// BUSCAR PACIENTE Y SUS RECETAS (NUEVA FUNCIÓN)
// ============================================
window.buscarPacienteYRecetas = async function() {
    console.log('🚀 Función buscarPacienteYRecetas() ejecutada');
    
    const campoId = document.getElementById('buscarPacienteId');
    console.log('📌 Campo buscarPacienteId:', campoId);
    
    const identificacion = campoId ? campoId.value.trim() : '';
    console.log('🔍 Valor de identificación:', identificacion);
    
    if (!identificacion) {
        mostrarNotificacion('Por favor ingrese un número de identificación', 'error');
        return;
    }
    
    console.log('🔍 Buscando paciente con cédula:', identificacion);
    
    // 1. Buscar paciente desde la API
    try {
        const response = await fetch(`/api/pacientes/buscar/${identificacion}`);
        if (!response.ok) {
            throw new Error('Paciente no encontrado');
        }
        const paciente = await response.json();
        
        console.log('✅ Paciente encontrado:', paciente);
        
        // 2. Mostrar información del paciente
        mostrarInfoPaciente(paciente);
        
        // 3. Buscar recetas del paciente desde la API
        const recetasResponse = await fetch(`/api/recetas?identificacion=${identificacion}`);
        if (!recetasResponse.ok) throw new Error('Error al cargar recetas');
        const recetas = await recetasResponse.json();
        
        console.log('📋 Recetas encontradas desde API:', recetas.length);
        
        // 4. Mostrar historial de recetas
        mostrarHistorialRecetas(recetas);
        
        // 5. Notificar éxito
        mostrarNotificacion(`Paciente encontrado: ${paciente.nombre}`, 'success');
        
    } catch (error) {
        console.error('❌ Error buscando paciente:', error);
        mostrarNotificacion('Paciente no encontrado. Verifique el número de identificación', 'error');
        ocultarInfoPaciente();
    }
}

// ============================================
// MOSTRAR INFORMACIÓN DEL PACIENTE
// ============================================
function mostrarInfoPaciente(paciente) {
    const container = document.getElementById('pacienteRecetasContainer');
    
    // Llenar datos del paciente en la sección de información
    document.getElementById('pacienteNombreInfo').textContent = paciente.nombre;
    document.getElementById('pacienteIdInfo').textContent = paciente.identificacion;
    document.getElementById('pacienteEdadInfo').textContent = paciente.edad ? `${paciente.edad} años` : 'No especificado';
    document.getElementById('pacienteGeneroInfo').textContent = paciente.genero || 'No especificado';
    document.getElementById('pacienteTelefonoInfo').textContent = paciente.telefono || 'No registrado';
    document.getElementById('pacienteEmailInfo').textContent = paciente.correo || 'No registrado';
    
    // Llenar campos del formulario
    document.getElementById('pacienteIdHidden').value = paciente.id_paciente || paciente.id || '';
    document.getElementById('pacienteNombre').value = paciente.nombre || '';
    document.getElementById('pacienteIdentificacion').value = paciente.identificacion || '';
    
    // Guardar ID del paciente para uso posterior
    window.pacienteSeleccionado = paciente;
    
    // Mostrar container
    container.style.display = 'block';
    
    // Scroll suave
    setTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// ============================================
// OCULTAR INFORMACIÓN DEL PACIENTE
// ============================================
function ocultarInfoPaciente() {
    document.getElementById('pacienteRecetasContainer').style.display = 'none';
    document.getElementById('recetasTimeline').innerHTML = '';
    window.pacienteSeleccionado = null;
}

// ============================================
// MOSTRAR HISTORIAL DE RECETAS
// ============================================
function mostrarHistorialRecetas(recetas) {
    const timeline = document.getElementById('recetasTimeline');
    
    if (recetas.length === 0) {
        timeline.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-prescription"></i>
                <p>Este paciente no tiene recetas previas</p>
                <small>Puede crear una nueva receta usando el botón de arriba</small>
            </div>
        `;
        return;
    }
    
    // Ordenar recetas por fecha (más reciente primero)
    recetas.sort((a, b) => new Date(b.fecha_emision) - new Date(a.fecha_emision));
    
    let html = `<h4 style="margin-bottom: 1.5rem; color: #1E88A8;">
        <i class="fas fa-history"></i> Historial de Recetas (${recetas.length})
    </h4>`;
    
    recetas.forEach(receta => {
        const estadoClass = {
            'Completado': 'success',
            'Activa': 'success',
            'Pendiente': 'warning',
            'Dispensada': 'info',
            'Cancelada': 'danger',
            'Vencida': 'secondary'
        }[receta.estado] || 'secondary';
        
        const estadoIcon = {
            'Completado': 'fa-check-circle',
            'Activa': 'fa-check-circle',
            'Pendiente': 'fa-clock',
            'Dispensada': 'fa-check-double',
            'Cancelada': 'fa-times-circle',
            'Vencida': 'fa-exclamation-triangle'
        }[receta.estado] || 'fa-question-circle';
        
        // Mapear medicamentos desde detalles de la API
        const medicamentos = (receta.detalles || receta.medicamentos || []).map(d => ({
            nombre: d.medicamento_nombre || d.nombre || 'Medicamento',
            dosis: d.dosis || '',
            frecuencia: d.frecuencia || '',
            duracion: d.duracion || ''
        }));
        
        const medicamentosHTML = medicamentos.map(med => `
            <div class="medicamento-item-timeline">
                <i class="fas fa-pills"></i>
                <strong>${med.nombre}</strong> - ${med.dosis} - ${med.frecuencia} (${med.duracion})
            </div>
        `).join('');
        
        html += `
            <div class="receta-timeline-card">
                <div class="receta-timeline-header">
                    <div class="receta-timeline-fecha">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formatearFecha(receta.fecha_emision)}</span>
                    </div>
                    <div class="receta-timeline-numero">
                        ${receta.numero_receta}
                    </div>
                    <div class="receta-timeline-estado badge-${estadoClass}">
                        <i class="fas ${estadoIcon}"></i>
                        ${receta.estado}
                    </div>
                </div>
                
                <div class="receta-timeline-medico">
                    <i class="fas fa-user-md"></i>
                    <strong>${receta.medico_nombre || 'Médico'}</strong>${receta.medico_especialidad ? ' - ' + receta.medico_especialidad : ''}
                </div>
                
                <div class="receta-timeline-medicamentos">
                    <h5><i class="fas fa-prescription-bottle"></i> Medicamentos:</h5>
                    ${medicamentosHTML}
                </div>
                
                ${receta.observaciones ? `
                    <div class="receta-timeline-observaciones">
                        <i class="fas fa-notes-medical"></i>
                        <em>${receta.observaciones}</em>
                    </div>
                ` : ''}
                
                <div class="receta-timeline-acciones">
                    <button type="button" class="btn-timeline-accion btn-ver" onclick="verDetalleReceta(${receta.id_receta})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button type="button" class="btn-timeline-accion btn-editar" onclick="editarReceta(${receta.id_receta})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button type="button" class="btn-timeline-accion btn-eliminar" onclick="eliminarReceta(${receta.id_receta}, '${receta.numero_receta}')">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    timeline.innerHTML = html;
}

// ============================================
// FORMATEAR FECHA
// ============================================
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr + 'T00:00:00'); // Evitar problemas de zona horaria
    const opciones = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'America/Bogota'
    };
    return fecha.toLocaleDateString('es-CO', opciones);
}

// ============================================
// FORMATEAR FECHA Y HORA
// ============================================
function formatearFechaHora(fechaHoraStr) {
    const fecha = new Date(fechaHoraStr.replace(' ', 'T'));
    const opciones = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Bogota'
    };
    return fecha.toLocaleDateString('es-CO', opciones);
}

// ============================================
// VER DETALLE DE RECETA
// ============================================
window.verDetalleReceta = function(id_receta) {
    // Buscar la receta en los datos
    let recetaEncontrada = null;
    for (const id_paciente in recetasDB) {
        const receta = recetasDB[id_paciente].find(r => r.id_receta === id_receta);
        if (receta) {
            recetaEncontrada = receta;
            break;
        }
    }
    
    if (!recetaEncontrada) {
        mostrarNotificacion('No se pudo cargar el detalle de la receta', 'error');
        return;
    }
    
    // Crear modal con el detalle
    const medicamentosHTML = recetaEncontrada.medicamentos.map((med, index) => `
        <div class="detalle-medicamento-modal">
            <h5>${index + 1}. ${med.nombre}</h5>
            <div class="detalle-med-grid">
                <div><strong>Dosis:</strong> ${med.dosis}</div>
                <div><strong>Frecuencia:</strong> ${med.frecuencia}</div>
                <div><strong>Duración:</strong> ${med.duracion}</div>
            </div>
        </div>
    `).join('');
    
    // Crear HTML del historial de cambios
    let historialHTML = '';
    if (recetaEncontrada.historial_cambios && recetaEncontrada.historial_cambios.length > 0) {
        historialHTML = `
            <div class="detalle-section historial-section">
                <h4><i class="fas fa-history"></i> Historial de Cambios (${recetaEncontrada.historial_cambios.length})</h4>
                <div class="historial-timeline">
                    ${recetaEncontrada.historial_cambios.map((cambio, index) => `
                        <div class="historial-item">
                            <div class="historial-marker">
                                <div class="historial-dot"></div>
                                ${index < recetaEncontrada.historial_cambios.length - 1 ? '<div class="historial-line"></div>' : ''}
                            </div>
                            <div class="historial-content">
                                <div class="historial-header">
                                    <span class="historial-fecha">
                                        <i class="fas fa-clock"></i> ${formatearFechaHora(cambio.fecha_cambio)}
                                    </span>
                                    <span class="historial-usuario">
                                        <i class="fas fa-user-md"></i> ${cambio.usuario_nombre}
                                    </span>
                                </div>
                                <div class="historial-cambio">
                                    <span class="historial-campo">
                                        <i class="fas fa-tag"></i> ${cambio.campo_modificado}
                                    </span>
                                    ${cambio.valor_anterior ? `
                                        <div class="historial-valores">
                                            <span class="valor-anterior">
                                                <i class="fas fa-arrow-left"></i> ${cambio.valor_anterior}
                                            </span>
                                            <i class="fas fa-arrow-right cambio-arrow"></i>
                                            <span class="valor-nuevo">
                                                <i class="fas fa-arrow-right"></i> ${cambio.valor_nuevo}
                                            </span>
                                        </div>
                                    ` : `
                                        <div class="historial-valores">
                                            <span class="valor-nuevo-solo">
                                                ${cambio.valor_nuevo}
                                            </span>
                                        </div>
                                    `}
                                </div>
                                ${cambio.motivo ? `
                                    <div class="historial-motivo">
                                        <i class="fas fa-comment-dots"></i> <em>${cambio.motivo}</em>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    const modalHTML = `
        <div class="modal-overlay" id="modalDetalleReceta" onclick="cerrarModalDetalle(event)">
            <div class="modal-content-detalle" onclick="event.stopPropagation()">
                <div class="modal-header-detalle">
                    <h3><i class="fas fa-file-prescription"></i> Detalle de Receta ${recetaEncontrada.numero_receta}</h3>
                    <button type="button" class="btn-close-modal" onclick="cerrarModalDetalle()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body-detalle">
                    <div class="detalle-section">
                        <h4><i class="fas fa-calendar-alt"></i> Información General</h4>
                        <div class="detalle-grid">
                            <div><strong>Fecha de Emisión:</strong> ${formatearFecha(recetaEncontrada.fecha_emision)}</div>
                            <div><strong>Estado:</strong> <span class="badge-${recetaEncontrada.estado.toLowerCase()}">${recetaEncontrada.estado}</span></div>
                        </div>
                    </div>
                    
                    <div class="detalle-section">
                        <h4><i class="fas fa-user-md"></i> Médico</h4>
                        <div class="detalle-grid">
                            <div><strong>Nombre:</strong> ${recetaEncontrada.medico_nombre}</div>
                            <div><strong>Especialidad:</strong> ${recetaEncontrada.medico_especialidad}</div>
                        </div>
                    </div>
                    
                    <div class="detalle-section">
                        <h4><i class="fas fa-pills"></i> Medicamentos Prescritos</h4>
                        ${medicamentosHTML}
                    </div>
                    
                    ${recetaEncontrada.observaciones ? `
                        <div class="detalle-section">
                            <h4><i class="fas fa-notes-medical"></i> Observaciones</h4>
                            <p>${recetaEncontrada.observaciones}</p>
                        </div>
                    ` : ''}
                    
                    ${historialHTML}
                </div>
                
                <div class="modal-footer-detalle">
                    <button type="button" class="btn-secondary" onclick="cerrarModalDetalle()">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                    <button type="button" class="btn-primary" onclick="cerrarModalDetalle(); editarReceta(${id_receta})">
                        <i class="fas fa-edit"></i> Editar Receta
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Insertar modal en el DOM
    const modalExistente = document.getElementById('modalDetalleReceta');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal con animación
    setTimeout(() => {
        document.getElementById('modalDetalleReceta').classList.add('active');
    }, 10);
}

// ============================================
// CERRAR MODAL DETALLE
// ============================================
window.cerrarModalDetalle = function(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('modalDetalleReceta');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// ============================================
// EDITAR RECETA
// ============================================
window.editarReceta = function(id_receta) {
    console.log('🔧 Editando receta ID:', id_receta);
    
    // Buscar la receta en los datos
    let recetaEncontrada = null;
    for (const id_paciente in recetasDB) {
        const receta = recetasDB[id_paciente].find(r => r.id_receta === id_receta);
        if (receta) {
            recetaEncontrada = receta;
            break;
        }
    }
    
    if (!recetaEncontrada) {
        mostrarNotificacion('No se pudo cargar la receta para editar', 'error');
        return;
    }
    
    // Obtener datos del paciente
    const paciente = window.pacienteSeleccionado;
    
    if (!paciente) {
        mostrarNotificacion('Error: No se encontró información del paciente', 'error');
        return;
    }
    
    console.log('📋 Receta encontrada:', recetaEncontrada);
    console.log('👤 Paciente:', paciente);
    
    // Guardar la receta en sessionStorage para editar
    sessionStorage.setItem('recetaEditar', JSON.stringify({
        receta: recetaEncontrada,
        paciente: paciente,
        modo: 'editar'
    }));
    
    // Ocultar el historial
    document.getElementById('pacienteRecetasContainer').style.display = 'none';
    
    // Mostrar el formulario
    const formularioCard = document.getElementById('formularioRecetaCard');
    const datosPacienteContainer = document.getElementById('datosPacienteContainer');
    
    if (!formularioCard || !datosPacienteContainer) {
        mostrarNotificacion('Error: No se encontró el formulario de edición', 'error');
        return;
    }
    
    // Cambiar título
    document.getElementById('tituloFormularioReceta').innerHTML = `
        <i class="fas fa-edit"></i> Editar Receta ${recetaEncontrada.numero_receta}
    `;
    
    // Pre-llenar datos del paciente
    document.getElementById('pacienteIdHidden').value = paciente.id;
    document.getElementById('pacienteNombre').value = paciente.nombre;
    document.getElementById('pacienteIdentificacion').value = paciente.identificacion;
    document.getElementById('pacienteEdad').value = paciente.edad;
    document.getElementById('pacienteGenero').value = paciente.genero;
    document.getElementById('pacienteTelefono').value = paciente.telefono;
    document.getElementById('pacienteCorreo').value = paciente.correo || '';
    document.getElementById('pacienteDireccion').value = paciente.direccion || '';
    
    // Mostrar datos del paciente
    datosPacienteContainer.style.display = 'block';
    
    // Pre-llenar observaciones
    const observacionesField = document.getElementById('observaciones');
    if (observacionesField) {
        observacionesField.value = recetaEncontrada.observaciones || '';
    }
    
    // Pre-llenar estado (solo visible en modo edición)
    const seccionEstado = document.getElementById('seccionEstadoReceta');
    const estadoField = document.getElementById('estadoReceta');
    if (seccionEstado && estadoField) {
        seccionEstado.style.display = 'block';
        estadoField.value = recetaEncontrada.estado || 'Pendiente';
        
        // Limpiar el campo de motivo
        const motivoField = document.getElementById('motivoCambioEstado');
        if (motivoField) {
            motivoField.value = '';
        }
    }
    
    // Pre-llenar medicamentos
    const medicamentosContainer = document.getElementById('medicamentosContainer');
    if (medicamentosContainer && recetaEncontrada.medicamentos) {
        // Limpiar medicamentos existentes
        medicamentosContainer.innerHTML = '';
        
        // Agregar cada medicamento de la receta
        recetaEncontrada.medicamentos.forEach((med, index) => {
            const medicamentoHTML = `
                <div class="medicamento-item" data-index="${index}">
                    <div class="medicamento-header">
                        <h5><i class="fas fa-capsules"></i> Medicamento #${index + 1}</h5>
                        ${index > 0 ? `
                            <button type="button" class="btn-remove-medicamento" onclick="eliminarMedicamento(this)">
                                <i class="fas fa-trash-alt"></i> Eliminar
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group form-group-lg">
                            <label for="medicamento_${index}" class="required">Medicamento</label>
                            <div class="input-with-icon">
                                <i class="fas fa-prescription-bottle"></i>
                                <select id="medicamento_${index}" name="medicamento[]" required>
                                    <option value="${med.id_medicamento}" selected>${med.nombre}</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="dosis_${index}" class="required">Dosis</label>
                            <input type="text" id="dosis_${index}" name="dosis[]" value="${med.dosis}" placeholder="Ej: 500mg" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="frecuencia_${index}" class="required">Frecuencia</label>
                            <input type="text" id="frecuencia_${index}" name="frecuencia[]" value="${med.frecuencia}" placeholder="Ej: Cada 8 horas" required>
                        </div>
                        <div class="form-group">
                            <label for="duracion_${index}" class="required">Duración</label>
                            <input type="text" id="duracion_${index}" name="duracion[]" value="${med.duracion}" placeholder="Ej: 7 días" required>
                        </div>
                    </div>
                </div>
            `;
            
            medicamentosContainer.insertAdjacentHTML('beforeend', medicamentoHTML);
        });
        
        medicamentoCount = recetaEncontrada.medicamentos.length;
    }
    
    // Cargar todos los medicamentos disponibles para los selects
    cargarMedicamentosDisponibles().then(() => {
        // Después de cargar, establecer los valores seleccionados
        recetaEncontrada.medicamentos.forEach((med, index) => {
            const select = document.getElementById(`medicamento_${index}`);
            if (select) {
                select.value = med.id_medicamento;
            }
        });
    });
    
    // Mostrar el formulario
    formularioCard.style.display = 'block';
    
    // Scroll suave al formulario
    setTimeout(() => {
        formularioCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    mostrarNotificacion('Receta cargada para edición', 'success');
}

// ============================================
// MOSTRAR FORMULARIO NUEVA RECETA
// ============================================
window.mostrarFormularioNuevaReceta = function() {
    if (!window.pacienteSeleccionado) {
        mostrarNotificacion('Primero debe buscar un paciente', 'error');
        return;
    }
    
    // Mostrar formulario en la misma página
    const formularioCard = document.getElementById('formularioRecetaCard');
    const pacienteContainer = document.getElementById('pacienteRecetasContainer');
    
    if (formularioCard) {
        formularioCard.style.display = 'block';
    }
    
    if (pacienteContainer) {
        pacienteContainer.style.display = 'none';
    }
    
    // Pre-llenar datos del paciente en el formulario
    const paciente = window.pacienteSeleccionado;
    document.getElementById('pacienteIdHidden').value = paciente.id_paciente || paciente.id || '';
    document.getElementById('pacienteNombre').value = paciente.nombre || '';
    document.getElementById('pacienteIdentificacion').value = paciente.identificacion || '';
    document.getElementById('pacienteEdad').value = paciente.edad || '';
    document.getElementById('pacienteGenero').value = paciente.genero || '';
    document.getElementById('pacienteTelefono').value = paciente.telefono || '';
    document.getElementById('pacienteCorreo').value = paciente.correo || '';
    document.getElementById('pacienteDireccion').value = paciente.direccion || '';
    
    // Mostrar sección de datos del paciente
    const datosPacienteContainer = document.getElementById('datosPacienteContainer');
    if (datosPacienteContainer) {
        datosPacienteContainer.style.display = 'block';
    }
    
    // Scroll al formulario
    setTimeout(() => {
        formularioCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ============================================
// CERRAR FORMULARIO DE RECETA
// ============================================
window.cerrarFormularioReceta = function() {
    const formularioCard = document.getElementById('formularioRecetaCard');
    const pacienteContainer = document.getElementById('pacienteRecetasContainer');
    
    if (formularioCard) {
        formularioCard.style.display = 'none';
    }
    
    if (pacienteContainer) {
        pacienteContainer.style.display = 'block';
        setTimeout(() => {
            pacienteContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
    
    // Ocultar sección de estado (solo visible en modo edición)
    const seccionEstado = document.getElementById('seccionEstadoReceta');
    if (seccionEstado) {
        seccionEstado.style.display = 'none';
    }
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('recetaEditar');
}

// ============================================
// BUSCAR PACIENTE POR ID
// ============================================
function buscarPacientePorId() {
    const identificacion = document.getElementById('buscarPacienteId').value.trim();
    const container = document.getElementById('datosPacienteContainer');
    
    if (!identificacion) {
        mostrarNotificacion('Por favor ingrese un número de identificación', 'error');
        return;
    }
    
    // Buscar en la base de datos simulada
    // En producción: fetch(`/api/pacientes/buscar/${identificacion}`)
    const paciente = pacientesDB[identificacion];
    
    if (paciente) {
        // Mostrar el contenedor con los datos
        container.style.display = 'block';
        
        // Llenar los campos con los datos del paciente
        document.getElementById('pacienteIdHidden').value = paciente.id;
        document.getElementById('pacienteNombre').value = paciente.nombre;
        document.getElementById('pacienteIdentificacion').value = paciente.identificacion;
        document.getElementById('pacienteEdad').value = paciente.edad;
        document.getElementById('pacienteGenero').value = paciente.genero;
        document.getElementById('pacienteTelefono').value = paciente.telefono;
        document.getElementById('pacienteCorreo').value = paciente.correo;
        document.getElementById('pacienteDireccion').value = paciente.direccion;
        
        // Mostrar notificación de éxito
        mostrarNotificacion(`Paciente encontrado: ${paciente.nombre}`, 'success');
        
        // Scroll suave hacia los datos
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        actualizarVistaPrevia();
    } else {
        // Paciente no encontrado
        container.style.display = 'none';
        limpiarDatosPaciente();
        mostrarNotificacion('Paciente no encontrado. Verifique el número de identificación', 'error');
    }
}

// Función para limpiar los datos del paciente
function limpiarDatosPaciente() {
    document.getElementById('pacienteIdHidden').value = '';
    document.getElementById('pacienteNombre').value = '';
    document.getElementById('pacienteIdentificacion').value = '';
    document.getElementById('pacienteEdad').value = '';
    document.getElementById('pacienteGenero').value = '';
    document.getElementById('pacienteTelefono').value = '';
    document.getElementById('pacienteCorreo').value = '';
    document.getElementById('pacienteDireccion').value = '';
}

// ============================================
// GUARDAR CAMBIOS DEL PACIENTE
// ============================================
window.guardarCambiosPaciente = function() {
    const identificacion = document.getElementById('pacienteIdentificacion').value.trim();
    
    if (!identificacion) {
        mostrarNotificacion('No hay paciente seleccionado', 'error');
        return;
    }

    // Obtener los datos modificados del formulario
    const datosActualizados = {
        id: parseInt(document.getElementById('pacienteIdHidden').value),
        nombre: document.getElementById('pacienteNombre').value.trim(),
        identificacion: identificacion,
        edad: parseInt(document.getElementById('pacienteEdad').value) || 0,
        genero: document.getElementById('pacienteGenero').value,
        telefono: document.getElementById('pacienteTelefono').value.trim(),
        correo: document.getElementById('pacienteCorreo').value.trim(),
        direccion: document.getElementById('pacienteDireccion').value.trim()
    };

    // Validar datos básicos
    if (!datosActualizados.nombre || !datosActualizados.identificacion) {
        mostrarNotificacion('El nombre y la identificación son obligatorios', 'error');
        return;
    }

    // Validar correo si se proporciona
    if (datosActualizados.correo && !validarEmail(datosActualizados.correo)) {
        mostrarNotificacion('El formato del correo electrónico no es válido', 'error');
        return;
    }

    // Aquí iría la llamada al backend para actualizar el paciente
    // fetch(`/api/pacientes/${identificacion}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(datosActualizados)
    // })

    // Por ahora, simulamos la actualización localmente
    pacientesDB[identificacion] = datosActualizados;

    // Mostrar mensaje de éxito
    mostrarNotificacion('Datos del paciente actualizados correctamente', 'success');
    
    console.log('Paciente actualizado:', datosActualizados);
}

// Función auxiliar para validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    const icon = tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    notificacion.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// ============================================
// AGREGAR MEDICAMENTO
// ============================================
function agregarMedicamento() {
    const container = document.getElementById('medicamentosContainer');
    const medicamentoHTML = `
        <div class="medicamento-item" data-index="${medicamentoCount}">
            <div class="medicamento-header">
                <h5><i class="fas fa-capsules"></i> Medicamento #${medicamentoCount + 1}</h5>
                <button type="button" class="btn-remove-medicamento" onclick="eliminarMedicamento(this)">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </div>
            
            <div class="form-row">
                <div class="form-group form-group-lg">
                    <label for="medicamento_${medicamentoCount}" class="required">Medicamento</label>
                    <div class="input-with-icon">
                        <i class="fas fa-prescription-bottle"></i>
                        <select id="medicamento_${medicamentoCount}" name="medicamento[]" required>
                            <option value="">Seleccione un medicamento...</option>
                            <option value="1">Amoxicilina 500mg - Disponible: 150 unidades</option>
                            <option value="2">Ibuprofeno 400mg - Disponible: 200 unidades</option>
                            <option value="3">Paracetamol 500mg - Disponible: 300 unidades</option>
                            <option value="4">Loratadina 10mg - Disponible: 100 unidades</option>
                            <option value="5">Omeprazol 20mg - Disponible: 180 unidades</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="dosis_${medicamentoCount}" class="required">Dosis</label>
                    <input type="text" id="dosis_${medicamentoCount}" name="dosis[]" placeholder="Ej: 500mg" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="frecuencia_${medicamentoCount}" class="required">Frecuencia</label>
                    <input type="text" id="frecuencia_${medicamentoCount}" name="frecuencia[]" placeholder="Ej: Cada 8 horas" required>
                </div>
                <div class="form-group">
                    <label for="duracion_${medicamentoCount}" class="required">Duración</label>
                    <input type="text" id="duracion_${medicamentoCount}" name="duracion[]" placeholder="Ej: 7 días" required>
                </div>
                <div class="form-group">
                    <label for="cantidad_${medicamentoCount}" class="required">Cantidad</label>
                    <input type="number" id="cantidad_${medicamentoCount}" name="cantidad[]" min="1" placeholder="Ej: 20" required>
                    <small class="form-hint" style="font-size: 0.75rem; color: #666;">
                        <i class="fas fa-box"></i> Unidades a dispensar
                    </small>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', medicamentoHTML);
    medicamentoCount++;
    
    // Reinicializar eventos para los nuevos inputs
    const newInputs = container.lastElementChild.querySelectorAll('input, select');
    newInputs.forEach(input => {
        input.addEventListener('change', actualizarVistaPrevia);
        input.addEventListener('input', actualizarVistaPrevia);
    });
    
    actualizarVistaPrevia();
}

// ============================================
// ELIMINAR MEDICAMENTO
// ============================================
function eliminarMedicamento(button) {
    const medicamentoItem = button.closest('.medicamento-item');
    medicamentoItem.remove();
    actualizarNumeracionMedicamentos();
    actualizarVistaPrevia();
}

function actualizarNumeracionMedicamentos() {
    const medicamentos = document.querySelectorAll('.medicamento-item');
    medicamentos.forEach((item, index) => {
        const titulo = item.querySelector('.medicamento-header h5');
        titulo.innerHTML = `<i class="fas fa-capsules"></i> Medicamento #${index + 1}`;
    });
}

// ============================================
// ACTUALIZAR VISTA PREVIA
// ============================================
function actualizarVistaPrevia() {
    const pacienteNombre = document.getElementById('pacienteNombre').value;
    const pacienteId = document.getElementById('pacienteIdentificacion').value;
    const observaciones = document.getElementById('observaciones').value;
    const vistaPrevia = document.getElementById('vistaPrevia');
    
    if (!pacienteNombre || !pacienteId) {
        vistaPrevia.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-file-prescription"></i>
                <p>Busque un paciente para ver la vista previa de la receta</p>
            </div>
        `;
        return;
    }
    
    const medicamentos = obtenerMedicamentosFormulario();
    
    // Obtener médico seleccionado
    const selectMedico = document.getElementById('selectMedico');
    let medicoNombre = 'No seleccionado';
    let medicoEspecialidad = '';
    
    if (selectMedico && selectMedico.value) {
        const opcionSeleccionada = selectMedico.options[selectMedico.selectedIndex];
        medicoNombre = opcionSeleccionada.dataset.nombre || opcionSeleccionada.text;
        medicoEspecialidad = opcionSeleccionada.dataset.especialidad || '';
    }
    
    let medicamentosHTML = '';
    medicamentos.forEach((med, index) => {
        if (med.nombre) {
            medicamentosHTML += `
                <div class="preview-medicamento">
                    <h5>${index + 1}. ${med.nombre}</h5>
                    <p><strong>Dosis:</strong> ${med.dosis || 'No especificada'}</p>
                    <p><strong>Frecuencia:</strong> ${med.frecuencia || 'No especificada'}</p>
                    <p><strong>Duración:</strong> ${med.duracion || 'No especificada'}</p>
                    ${med.cantidad ? `<p><strong>Cantidad:</strong> ${med.cantidad} unidades</p>` : ''}
                </div>
            `;
        }
    });
    
    vistaPrevia.innerHTML = `
        <div class="preview-receta">
            <div class="preview-header">
                <h4><i class="fas fa-hospital"></i> Clínica Salud y Vida Bogotá</h4>
                <p class="preview-fecha">Fecha: ${new Date().toLocaleDateString('es-CO')}</p>
            </div>
            
            <div class="preview-section">
                <h5><i class="fas fa-user-md"></i> Médico</h5>
                <p><strong>${medicoNombre}</strong></p>
                ${medicoEspecialidad ? `<p>${medicoEspecialidad}</p>` : ''}
            </div>
            
            <div class="preview-section">
                <h5><i class="fas fa-user-injured"></i> Paciente</h5>
                <p><strong>${pacienteNombre}</strong></p>
                <p>CC: ${pacienteId}</p>
            </div>
            
            <div class="preview-section">
                <h5><i class="fas fa-pills"></i> Medicamentos Prescritos</h5>
                ${medicamentosHTML || '<p class="info-placeholder">No hay medicamentos agregados</p>'}
            </div>
            
            ${observaciones ? `
                <div class="preview-section">
                    <h5><i class="fas fa-notes-medical"></i> Observaciones</h5>
                    <p>${observaciones}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// OBTENER MEDICAMENTOS DEL FORMULARIO
// ============================================
function obtenerMedicamentosFormulario() {
    const medicamentos = [];
    const items = document.querySelectorAll('.medicamento-item');
    
    items.forEach((item, index) => {
        const select = item.querySelector(`select[name="medicamento[]"]`);
        const dosis = item.querySelector(`input[name="dosis[]"]`).value;
        const frecuencia = item.querySelector(`input[name="frecuencia[]"]`).value;
        const duracion = item.querySelector(`input[name="duracion[]"]`).value;
        const cantidad = item.querySelector(`input[name="cantidad[]"]`).value;
        
        medicamentos.push({
            nombre: select.options[select.selectedIndex]?.text.split(' - ')[0] || '',
            id: select.value,
            dosis: dosis,
            frecuencia: frecuencia,
            duracion: duracion,
            cantidad: parseInt(cantidad) || 0
        });
    });
    
    return medicamentos;
}

// ============================================
// GENERAR RECETA
// ============================================
function generarReceta(e) {
    e.preventDefault();
    // Validar formulario
    if (!validarFormulario()) {
        return;
    }
    // Obtener datos del formulario
    const pacienteId = document.getElementById('pacienteIdHidden').value;
    const pacienteIdentificacion = document.getElementById('pacienteIdentificacion').value;
    const pacienteNombre = document.getElementById('pacienteNombre').value;
    const observaciones = document.getElementById('observaciones').value;
    const medicamentos = obtenerMedicamentosFormulario();
    
    // Debug: ver qué valores se están enviando
    console.log('DEBUG generarReceta - Datos capturados:');
    console.log('  pacienteId:', pacienteId, 'tipo:', typeof pacienteId);
    console.log('  pacienteIdentificacion:', pacienteIdentificacion);
    console.log('  pacienteNombre:', pacienteNombre);
    
    // Obtener médico seleccionado del select
    const selectMedico = document.getElementById('selectMedico');
    let idMedicoSeleccionado = null;
    if (selectMedico && selectMedico.value) {
        idMedicoSeleccionado = parseInt(selectMedico.value);
    }
    // 1. RECETA (Tabla principal)
    const receta = {
        fecha_emision: new Date().toISOString().split('T')[0],
        observaciones: observaciones || null,
        estado: 'Activa',  // Estados válidos: Activa, Dispensada, Cancelada, Vencida
        id_paciente: pacienteId ? parseInt(pacienteId) : null,
        identificacion: pacienteIdentificacion || null,  // Fallback si id_paciente falla
        id_medico: idMedicoSeleccionado
    };
    // 2. DETALLE_RECETA (Tabla de detalles - relación con medicamentos)
    const detalles_receta = medicamentos
        .filter(m => m.id && m.dosis && m.frecuencia && m.duracion && m.cantidad)
        .map(med => ({
            // id_detalle: null, // Se auto-genera en backend
            // id_receta: null, // Se asigna después de crear la receta
            id_medicamento: parseInt(med.id), // FK a tabla MEDICAMENTO (Grupo 1)
            dosis: med.dosis, // Ej: "500 mg"
            frecuencia: med.frecuencia, // Ej: "Cada 8 horas"
            duracion: med.duracion, // Ej: "7 días"
            cantidad: parseInt(med.cantidad) || 0 // Cantidad a dispensar del inventario
        }));
    
    // Estructura completa para enviar al backend
    const recetaCompleta = {
        receta: receta,
        detalles: detalles_receta
    };
    
    console.log('═══════════════════════════════════════');
    console.log('📋 RECETA GENERADA - ESTRUCTURA BD');
    console.log('═══════════════════════════════════════');
    console.log('📄 TABLA: RECETA');
    console.log('  - fecha_emision:', receta.fecha_emision);
    console.log('  - observaciones:', receta.observaciones);
    console.log('  - estado:', receta.estado);
    console.log('  - id_paciente:', receta.id_paciente, '→', pacienteNombre);
    console.log('  - id_medico:', receta.id_medico);
    console.log('─────────────────────────────────────');
    console.log('📋 TABLA: DETALLE_RECETA');
    console.log('  Total de medicamentos:', detalles_receta.length);
    detalles_receta.forEach((detalle, i) => {
        const med = medicamentos[i];
        console.log(`  ${i + 1}. Medicamento ID: ${detalle.id_medicamento}`);
        console.log(`     - Nombre: ${med.nombre}`);
        console.log(`     - Dosis: ${detalle.dosis}`);
        console.log(`     - Frecuencia: ${detalle.frecuencia}`);
        console.log(`     - Duración: ${detalle.duracion}`);
        console.log(`     - Cantidad: ${detalle.cantidad} unidades`);
    });
    console.log('═══════════════════════════════════════');
    console.log('📤 OBJETO PARA BACKEND:');
    console.log(JSON.stringify(recetaCompleta, null, 2));
    console.log('═══════════════════════════════════════');
    
    // Verificar si estamos en modo edición
    const formularioCard = document.getElementById('formularioRecetaCard');
    const modoEdicion = formularioCard?.dataset.modoEdicion === 'true';
    const idReceta = formularioCard?.dataset.idReceta;
    
    let url = '/api/recetas';
    let method = 'POST';
    let mensajeExito = '✅ Receta creada exitosamente';
    
    if (modoEdicion && idReceta) {
        // Modo EDICIÓN: actualizar receta existente
        url = `/api/recetas/${idReceta}`;
        method = 'PUT';
        mensajeExito = '✅ Receta actualizada exitosamente';
        
        // Agregar el estado al payload si está en modo edición
        const estadoField = document.getElementById('estadoReceta');
        if (estadoField && estadoField.value) {
            recetaCompleta.receta.estado = estadoField.value;
        }
        
        console.log(`🔄 MODO EDICIÓN: Actualizando receta ID ${idReceta}`);
    } else {
        console.log('🆕 MODO CREACIÓN: Nueva receta');
    }
    
    // Enviar al backend Flask
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(recetaCompleta)
    })
    .then(async (res) => {
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Error ${res.status}: ${txt}`);
        }
        return res.json();
    })
    .then(data => {
        console.log('✅ Respuesta del servidor:', data);
        
        if (modoEdicion) {
            // En modo edición, mostrar mensaje y redirigir al historial
            mostrarNotificacion(mensajeExito, 'success');
            
            // Limpiar datos del formulario
            if (formularioCard) {
                delete formularioCard.dataset.modoEdicion;
                delete formularioCard.dataset.idReceta;
            }
            
            // Esperar 2 segundos y redirigir al historial
            setTimeout(() => {
                window.location.href = '/historial';
            }, 2000);
            
        } else {
            // En modo creación, mostrar modal de éxito
            if (data && data.numero_receta) {
                mostrarModalExito(data.numero_receta);
                mostrarNotificacion('✅ Receta guardada exitosamente: ' + data.numero_receta, 'success');
            } else {
                mostrarNotificacion('Receta creada pero sin número de respuesta', 'warning');
            }
        }
    })
    .catch(error => {
        console.error('❌ Error al guardar receta:', error);
        mostrarNotificacion('Error al guardar la receta: ' + error.message, 'error');
    });
}

// ============================================
// VALIDAR FORMULARIO
// ============================================
function validarFormulario() {
    const pacienteNombre = document.getElementById('pacienteNombre').value;
    const pacienteId = document.getElementById('pacienteIdentificacion').value;
    const medicamentos = obtenerMedicamentosFormulario();
    
    if (!pacienteNombre || !pacienteId) {
        mostrarNotificacion('Por favor busque y seleccione un paciente', 'error');
        return false;
    }
    
    // Validar que al menos un medicamento esté completo
    const medicamentosValidos = medicamentos.filter(m => m.id && m.dosis && m.frecuencia && m.duracion);
    if (medicamentosValidos.length === 0) {
        mostrarNotificacion('Por favor complete al menos un medicamento con todos sus datos', 'error');
        return false;
    }
    
    return true;
}

// ============================================
// LIMPIAR FORMULARIO
// ============================================
function limpiarFormulario(confirmar = true) {
    if (confirmar && !confirm('¿Está seguro de que desea limpiar el formulario? Se perderán todos los datos ingresados.')) {
        return;
    }
    
    document.getElementById('formNuevaReceta').reset();
    
    // Limpiar campo de búsqueda
    document.getElementById('buscarPacienteId').value = '';
    
    // Ocultar y limpiar datos del paciente
    document.getElementById('datosPacienteContainer').style.display = 'none';
    limpiarDatosPaciente();
    
    // Eliminar medicamentos adicionales
    const medicamentos = document.querySelectorAll('.medicamento-item');
    medicamentos.forEach((item, index) => {
        if (index > 0) item.remove();
    });
    
    medicamentoCount = 1;
    actualizarVistaPrevia();
}

// ============================================
// CANCELAR FORMULARIO
// ============================================
function cancelarFormulario() {
    if (confirm('¿Está seguro de que desea cancelar? Se perderán todos los datos ingresados.')) {
        window.location.href = 'index.html';
    }
}

// ============================================
// MODAL DE ÉXITO
// ============================================
function mostrarModalExito(numeroReceta) {
    const modal = document.getElementById('modalConfirmacion');
    document.getElementById('numeroReceta').textContent = numeroReceta;
    document.getElementById('fechaReceta').textContent = new Date().toLocaleString('es-CO');
    modal.classList.add('active');
}

window.cerrarModal = function() {
    const modal = document.getElementById('modalConfirmacion');
    modal.classList.remove('active');
    limpiarFormulario(false); // false = no pedir confirmación después de guardar exitosamente
}

window.imprimirReceta = function() {
    alert('Función de impresión en desarrollo. La receta se enviará a la impresora.');
    cerrarModal();
}

// ============================================
// UTILIDADES
// ============================================
function generarNumeroReceta() {
    const año = new Date().getFullYear();
    const numero = Math.floor(Math.random() * 9999) + 1;
    return `RX-${año}-${String(numero).padStart(4, '0')}`;
}

function actualizarFechaModal() {
    setInterval(() => {
        const fechaElement = document.getElementById('fechaReceta');
        if (fechaElement) {
            fechaElement.textContent = new Date().toLocaleString('es-CO');
        }
    }, 1000);
}

// ============================================
// ESTILOS ADICIONALES PARA VISTA PREVIA
// ============================================
// ============================================
// ELIMINAR RECETA
// ============================================
window.eliminarReceta = async function(id_receta, numero_receta) {
    // Confirmar eliminación
    if (!confirm(`¿Está seguro de que desea eliminar la receta ${numero_receta}?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }
    
    try {
        console.log(`🗑️ Eliminando receta ID: ${id_receta}`);
        
        const response = await fetch(`/api/recetas/${id_receta}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar la receta');
        }
        
        const result = await response.json();
        console.log('✅ Receta eliminada:', result);
        
        mostrarNotificacion(`Receta ${numero_receta} eliminada correctamente`, 'success');
        
        // Recargar el historial de recetas
        if (window.pacienteSeleccionado) {
            const identificacion = window.pacienteSeleccionado.identificacion;
            const recetasResponse = await fetch(`/api/recetas?identificacion=${identificacion}`);
            if (recetasResponse.ok) {
                const recetas = await recetasResponse.json();
                mostrarHistorialRecetas(recetas);
            }
        }
        
    } catch (error) {
        console.error('❌ Error eliminando receta:', error);
        mostrarNotificacion(`Error al eliminar la receta: ${error.message}`, 'error');
    }
}

const styles = `
    <style>
        .preview-receta {
            font-size: 0.9rem;
        }
        .preview-header {
            text-align: center;
            padding-bottom: 1rem;
            border-bottom: 2px solid #1E88A8;
            margin-bottom: 1.5rem;
        }
        .preview-header h4 {
            color: #1E88A8;
            margin: 0 0 0.5rem 0;
        }
        .preview-fecha {
            color: #6C757D;
            margin: 0;
        }
        .preview-section {
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #E0E6ED;
        }
        .preview-section h5 {
            color: #1E88A8;
            margin: 0 0 0.8rem 0;
            font-size: 1rem;
        }
        .preview-section p {
            margin: 0.3rem 0;
            color: #2C3E50;
        }
        .preview-medicamento {
            background-color: #F8F9FA;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        .preview-medicamento h5 {
            color: #2C3E50;
            margin: 0 0 0.5rem 0;
        }
        .btn-timeline-accion.btn-eliminar {
            background-color: #dc3545;
            color: white;
        }
        .btn-timeline-accion.btn-eliminar:hover {
            background-color: #c82333;
            transform: translateY(-2px);
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', styles);

// ============================================
// CARGAR RECETA DESDE HISTORIAL PARA EDICIÓN
// ============================================
async function verificarYCargarRecetaDesdeHistorial() {
    try {
        // Verificar si hay una receta pendiente de editar en sessionStorage
        const recetaEditarJSON = sessionStorage.getItem('recetaEditar');
        const pacienteJSON = sessionStorage.getItem('pacienteSeleccionado');
        
        // Si solo hay paciente (sin receta), cargar el paciente
        if (!recetaEditarJSON && pacienteJSON) {
            console.log('👤 Detectado paciente seleccionado desde index');
            const paciente = JSON.parse(pacienteJSON);
            
            // Ocultar el buscador de pacientes
            const searchHeroSection = document.querySelector('.search-hero-section');
            if (searchHeroSection) {
                searchHeroSection.style.display = 'none';
                console.log('🔒 Buscador de pacientes oculto');
            }
            
            // Llenar campo de búsqueda y ejecutar búsqueda completa
            const campoId = document.getElementById('buscarPacienteId');
            if (campoId && paciente.identificacion) {
                campoId.value = paciente.identificacion;
                
                // Ejecutar búsqueda completa del paciente y sus recetas
                try {
                    const response = await fetch(`/api/pacientes/buscar/${paciente.identificacion}`);
                    if (response.ok) {
                        const pacienteCompleto = await response.json();
                        mostrarInfoPaciente(pacienteCompleto);
                        
                        // Cargar recetas del paciente
                        const recetasResponse = await fetch(`/api/recetas?identificacion=${paciente.identificacion}`);
                        if (recetasResponse.ok) {
                            const recetas = await recetasResponse.json();
                            mostrarHistorialRecetas(recetas);
                        }
                    }
                } catch (error) {
                    console.error('❌ Error cargando datos del paciente:', error);
                }
            }
            
            console.log('✅ Paciente y sus recetas cargados automáticamente:', paciente.nombre);
            // NO eliminar sessionStorage aquí para permitir navegación hacia atrás
            return;
        }
        
        if (!recetaEditarJSON || !pacienteJSON) {
            console.log('ℹ️ No hay receta para editar desde historial');
            return;
        }
        
        console.log('🔄 Detectada receta para editar desde historial');
        
        const datosEdicion = JSON.parse(recetaEditarJSON);
        const paciente = JSON.parse(pacienteJSON);
        const receta = datosEdicion.receta;
        
        console.log('📋 Receta a editar:', receta);
        console.log('👤 Paciente:', paciente);
        
        // Limpiar sessionStorage para evitar recargas repetidas
        sessionStorage.removeItem('recetaEditar');
        sessionStorage.removeItem('pacienteSeleccionado');
        
        // Mostrar el formulario
        const formularioCard = document.getElementById('formularioRecetaCard');
        const datosPacienteContainer = document.getElementById('datosPacienteContainer');
        
        if (!formularioCard) {
            console.error('❌ No se encontró el formulario');
            return;
        }
        
        // Cambiar título del formulario
        const titulo = document.getElementById('tituloFormularioReceta');
        if (titulo) {
            titulo.innerHTML = `<i class="fas fa-edit"></i> Editar Receta ${receta.numero_receta || ''}`;
        }
        
        // Pre-llenar datos del paciente
        document.getElementById('pacienteIdHidden').value = paciente.id_paciente || paciente.id || '';
        document.getElementById('pacienteNombre').value = paciente.nombre || '';
        document.getElementById('pacienteIdentificacion').value = paciente.identificacion || '';
        
        // Buscar y mostrar información completa del paciente
        if (paciente.identificacion) {
            await buscarYMostrarPaciente(paciente.identificacion);
        }
        
        // Mostrar sección de datos del paciente
        if (datosPacienteContainer) {
            datosPacienteContainer.style.display = 'block';
        }
        
        // Pre-llenar médico si existe
        const selectMedico = document.getElementById('selectMedico');
        if (selectMedico && receta.id_medico) {
            selectMedico.value = receta.id_medico;
            medicoSeleccionadoExternamente = parseInt(receta.id_medico);
        }
        
        // Pre-llenar observaciones
        const observacionesField = document.getElementById('observaciones');
        if (observacionesField) {
            observacionesField.value = receta.observaciones || '';
        }
        
        // Pre-llenar estado (mostrar sección de estado)
        const seccionEstado = document.getElementById('seccionEstadoReceta');
        const estadoField = document.getElementById('estadoReceta');
        if (seccionEstado && estadoField) {
            seccionEstado.style.display = 'block';
            estadoField.value = receta.estado || 'Activa';
        }
        
        // Pre-llenar medicamentos
        await cargarMedicamentosDeReceta(receta);
        
        // Guardar ID de receta para actualización
        formularioCard.dataset.idReceta = receta.id_receta || receta.id || '';
        formularioCard.dataset.modoEdicion = 'true';
        
        // Mostrar formulario
        formularioCard.style.display = 'block';
        
        // Scroll al formulario
        setTimeout(() => {
            formularioCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
        
        mostrarNotificacion('Receta cargada para edición', 'success');
        
    } catch (error) {
        console.error('❌ Error al cargar receta desde historial:', error);
        mostrarNotificacion('Error al cargar la receta: ' + error.message, 'error');
    }
}

// ============================================
// BUSCAR Y MOSTRAR INFORMACIÓN DEL PACIENTE
// ============================================
async function buscarYMostrarPaciente(identificacion) {
    try {
        const response = await fetch(`/api/pacientes/buscar/${identificacion}`);
        if (!response.ok) {
            throw new Error('Paciente no encontrado');
        }
        
        const paciente = await response.json();
        
        // Llenar todos los campos del paciente
        document.getElementById('pacienteIdHidden').value = paciente.id_paciente || paciente.id || '';
        document.getElementById('pacienteNombre').value = paciente.nombre || '';
        document.getElementById('pacienteIdentificacion').value = paciente.identificacion || '';
        document.getElementById('pacienteEdad').value = paciente.edad || '';
        document.getElementById('pacienteGenero').value = paciente.genero || '';
        document.getElementById('pacienteTelefono').value = paciente.telefono || '';
        document.getElementById('pacienteCorreo').value = paciente.correo || '';
        document.getElementById('pacienteDireccion').value = paciente.direccion || '';
        
        // Guardar para uso global
        window.pacienteSeleccionado = paciente;
        
    } catch (error) {
        console.warn('⚠️ No se pudo cargar información adicional del paciente:', error);
    }
}

// ============================================
// CARGAR MEDICAMENTOS DE LA RECETA
// ============================================
async function cargarMedicamentosDeReceta(receta) {
    const medicamentosContainer = document.getElementById('medicamentosContainer');
    if (!medicamentosContainer) return;
    
    const detalles = receta.detalles || receta.medicamentos || [];
    
    if (detalles.length === 0) {
        console.warn('⚠️ No hay medicamentos en esta receta');
        return;
    }
    
    console.log('📦 Cargando medicamentos de la receta:', detalles);
    
    // Limpiar medicamentos existentes
    medicamentosContainer.innerHTML = '';
    medicamentoCount = 0;
    
    // IMPORTANTE: Esperar a que se carguen los medicamentos disponibles PRIMERO
    await cargarMedicamentosDisponibles();
    
    // Esperar un poco más para asegurar que el DOM esté actualizado
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Agregar cada medicamento de la receta
    for (let index = 0; index < detalles.length; index++) {
        const med = detalles[index];
        
        const medicamentoHTML = `
            <div class="medicamento-item" data-index="${index}">
                <div class="medicamento-header">
                    <h5><i class="fas fa-capsules"></i> Medicamento #${index + 1}</h5>
                    ${index > 0 ? `
                        <button type="button" class="btn-remove-medicamento" onclick="eliminarMedicamento(this)">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    ` : ''}
                </div>
                
                <div class="form-row">
                    <div class="form-group form-group-lg">
                        <label for="medicamento_${index}" class="required">Medicamento</label>
                        <div class="input-with-icon">
                            <i class="fas fa-prescription-bottle"></i>
                            <select id="medicamento_${index}" name="medicamento[]" required>
                                <option value="">Cargando...</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="dosis_${index}" class="required">Dosis</label>
                        <input type="text" id="dosis_${index}" name="dosis[]" value="${med.dosis || ''}" placeholder="Ej: 500mg" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="frecuencia_${index}" class="required">Frecuencia</label>
                        <input type="text" id="frecuencia_${index}" name="frecuencia[]" value="${med.frecuencia || ''}" placeholder="Ej: Cada 8 horas" required>
                    </div>
                    <div class="form-group">
                        <label for="duracion_${index}" class="required">Duración</label>
                        <input type="text" id="duracion_${index}" name="duracion[]" value="${med.duracion || ''}" placeholder="Ej: 7 días" required>
                    </div>
                    <div class="form-group">
                        <label for="cantidad_${index}" class="required">Cantidad</label>
                        <input type="number" id="cantidad_${index}" name="cantidad[]" min="1" value="${med.cantidad || 1}" placeholder="Ej: 20" required>
                        <small class="form-hint" style="font-size: 0.75rem; color: #666;">
                            <i class="fas fa-box"></i> Unidades a dispensar
                        </small>
                    </div>
                </div>
            </div>
        `;
        
        medicamentosContainer.insertAdjacentHTML('beforeend', medicamentoHTML);
        
        // Seleccionar el medicamento correcto después de insertar el HTML
        const select = document.getElementById(`medicamento_${index}`);
        if (select && med.id_medicamento) {
            // Copiar las opciones del primer select si existe
            const primeraLista = document.getElementById('medicamento_0');
            if (primeraLista && primeraLista !== select && primeraLista.options.length > 1) {
                select.innerHTML = primeraLista.innerHTML;
            }
            
            // Seleccionar el valor correcto
            select.value = med.id_medicamento;
            
            // Verificar si se seleccionó correctamente
            if (select.value != med.id_medicamento) {
                console.warn(`⚠️ No se pudo seleccionar medicamento ID ${med.id_medicamento} - puede que no exista en la lista`);
            } else {
                console.log(`✅ Medicamento ${med.id_medicamento} seleccionado en posición ${index}`);
            }
        }
        
        medicamentoCount++;
    }
    
    // Agregar eventos a los nuevos inputs
    const inputs = medicamentosContainer.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', actualizarVistaPrevia);
        input.addEventListener('input', actualizarVistaPrevia);
    });
    
    actualizarVistaPrevia();
}
