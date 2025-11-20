// ============================================
// SIDEBAR MENU TOGGLE
// ============================================
const menuToggle = document.getElementById('menuToggle');
const closeSidebar = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// Solo configurar eventos si los elementos existen
if (menuToggle && sidebar && overlay) {
    // Abrir sidebar
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
}

if (closeSidebar && sidebar && overlay) {
    // Cerrar sidebar
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
}

if (overlay && sidebar) {
    // Cerrar sidebar al hacer clic en el overlay
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// ============================================
// NAVIGATION ITEMS
// ============================================
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // NO prevenir default - dejar que los enlaces funcionen
        
        // Remover clase active de todos los items
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Agregar clase active al item clickeado
        item.classList.add('active');
        
        // Cerrar sidebar después de seleccionar
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
        
        // Log para debug
        console.log('Navegando a:', item.textContent.trim());
    });
});

// ============================================
// TABS NAVIGATION
// ============================================
const tabItems = document.querySelectorAll('.tab-item');

tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remover clase active de todos los tabs
        tabItems.forEach(t => t.classList.remove('active'));
        
        // Agregar clase active al tab clickeado
        tab.classList.add('active');
        
        const tabName = tab.getAttribute('data-tab');
        console.log('Tab seleccionado:', tabName);
        
        // Aquí puedes agregar lógica para mostrar/ocultar contenido
        // según el tab seleccionado
    });
});

// ============================================
// FORM SUBMISSION - GESTIÓN DE RECETA MÉDICA
// ============================================
const nuevaRecetaForm = document.getElementById('nuevaRecetaForm');

if (nuevaRecetaForm) {
    nuevaRecetaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Verificar si hay un paciente encontrado (existente) o si se está registrando uno nuevo
        const pacienteIdExistente = document.getElementById('pacienteIdHidden')?.value;
        
        let datosPaciente;
        
        if (pacienteIdExistente) {
            // ✅ CASO 1: Paciente existente - Solo enviar el ID
            datosPaciente = {
                id_paciente: parseInt(pacienteIdExistente),
                es_nuevo: false
            };
            console.log('📋 Usando paciente existente - ID:', pacienteIdExistente);
        } else {
            // ✅ CASO 2: Paciente nuevo - Enviar todos los datos para crear el registro
            const nombrePaciente = document.getElementById('nombrePaciente')?.value;
            const identificacionPaciente = document.getElementById('identificacionPaciente')?.value;
            const fechaNacimiento = document.getElementById('fechaNacimiento')?.value;
            const telefonoPaciente = document.getElementById('telefonoPaciente')?.value;
            
            // Validar campos requeridos para paciente nuevo
            if (!nombrePaciente || !identificacionPaciente || !fechaNacimiento) {
                alert('⚠️ Por favor complete los datos del paciente:\n• Nombre completo\n• Identificación\n• Fecha de nacimiento');
                return;
            }
            
            datosPaciente = {
                es_nuevo: true,
                datos_paciente: {
                    nombre: nombrePaciente,
                    identificacion: identificacionPaciente,
                    fecha_nacimiento: fechaNacimiento,
                    telefono: telefonoPaciente || null
                }
            };
            console.log('📋 Registrando paciente nuevo:', datosPaciente.datos_paciente);
        }
        
        // Obtener datos de la receta
        const fechaEmision = document.getElementById('fechaEmision')?.value;
        const diagnostico = document.getElementById('diagnostico')?.value;
        const medicamentoNombre = document.getElementById('medicamentoNombre')?.value;
        const dosis = document.getElementById('dosis')?.value;
        const duracion = document.getElementById('duracion')?.value;
        const observaciones = document.getElementById('observaciones')?.value;
        
        // Validar campos requeridos de la receta
        if (!fechaEmision || !diagnostico || !medicamentoNombre || !dosis || !duracion) {
            alert('⚠️ Por favor complete todos los campos obligatorios de la receta');
            return;
        }
        
        // ============================================
        // ESTRUCTURA SEGÚN BASE DE DATOS
        // ============================================
        
        // Crear objeto completo según estructura de BD
        const recetaCompleta = {
            // Paciente (ID o datos completos según el caso)
            paciente: datosPaciente,
            
            // TABLA: RECETA
            receta: {
                fecha_emision: fechaEmision,
                observaciones: observaciones || `Diagnóstico: ${diagnostico}`,
                estado: 'Pendiente',
                id_medico: medicoActivo.id // FK - Médico de la sesión
                // id_paciente se asigna después de crear/obtener el paciente
            },
            
            // TABLA: DETALLE_RECETA
            detalles: [
                {
                    // id_medicamento: null, // Por ahora manual, después será del inventario
                    medicamento_manual: medicamentoNombre, // Temporal hasta integrar con Grupo 1
                    dosis: dosis,
                    frecuencia: "Según indicación médica", // Campo adicional si es necesario
                    duracion: duracion
                }
            ]
        };
        
        console.log('📤 Receta creada - Estructura BD:', recetaCompleta);
        
        // Aquí se enviarían los datos al backend
        // En producción sería algo como:
        /*
        fetch('/api/recetas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recetaCompleta)
        })
        .then(response => response.json())
        .then(data => {
            // Backend retorna:
            // {
            //   success: true,
            //   id_receta: 123,
            //   numero_receta: "RX-2025-00123",
            //   id_paciente: 456 (si era nuevo)
            // }
            
            // Crear registro en HISTORIAL_CAMBIO_RECETA
            // POST /api/historial-cambios
            // {
            //   id_receta: data.id_receta,
            //   id_usuario: medicoActivo.id,
            //   fecha_cambio: new Date(),
            //   campo_modificado: 'CREACION',
            //   valor_anterior: null,
            //   valor_nuevo: 'Receta creada',
            //   motivo: 'Emisión inicial de receta'
            // }
            
            alert('✅ Receta generada exitosamente!\n\nN° Receta: ' + data.numero_receta);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('❌ Error al guardar la receta');
        });
        */
        
        // Mostrar mensaje de éxito (simulado)
        const nombreMostrar = pacienteIdExistente 
            ? document.getElementById('pacienteNombreMostrar').textContent
            : document.getElementById('nombrePaciente').value;
            
        alert('✅ Receta generada exitosamente!\n\n' +
              'Paciente: ' + nombreMostrar + '\n' +
              'Diagnóstico: ' + diagnostico + '\n' +
              'Medicamento: ' + medicamentoNombre + '\n' +
              'Dosis: ' + dosis);
        
        // Limpiar el formulario
        nuevaRecetaForm.reset();
        limpiarPaciente();
        
        // Restablecer la fecha de hoy
        const fechaEmisionInput = document.getElementById('fechaEmision');
        if (fechaEmisionInput) {
            const hoy = new Date();
            fechaEmisionInput.value = hoy.toISOString().split('T')[0];
        }
    });
}

// ============================================
// BOTONES DE ACCIÓN EN LA TABLA
// ============================================
const botonesAccion = document.querySelectorAll('.btn-action');

botonesAccion.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const fila = e.target.closest('tr');
        const paciente = fila.cells[0].textContent;
        const medicamento = fila.cells[1].textContent;
        const estado = fila.cells[2].textContent;
        
        console.log('Ver detalles:', { paciente, medicamento, estado });
        
        // Aquí puedes abrir un modal con los detalles completos
        alert(`Detalles de la receta:\nPaciente: ${paciente}\nMedicamento: ${medicamento}\nEstado: ${estado}`);
    });
});

// ============================================
// FUNCIÓN PARA AGREGAR RECETA AL HISTORIAL
// ============================================
function agregarRecetaAHistorial(receta) {
    const tbody = document.querySelector('.recetas-table tbody');
    
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
        <td>${receta.paciente}</td>
        <td>${receta.medicamento}</td>
        <td><span class="badge badge-pendiente">${receta.estado}</span></td>
        <td><button class="btn-action">Ver</button></td>
    `;
    
    // Insertar la nueva fila al principio de la tabla
    tbody.insertBefore(nuevaFila, tbody.firstChild);
    
    // Agregar event listener al nuevo botón
    const nuevoBoton = nuevaFila.querySelector('.btn-action');
    nuevoBoton.addEventListener('click', (e) => {
        const fila = e.target.closest('tr');
        const paciente = fila.cells[0].textContent;
        const medicamento = fila.cells[1].textContent;
        const estado = fila.cells[2].textContent;
        
        alert(`Detalles de la receta:\nPaciente: ${paciente}\nMedicamento: ${medicamento}\nEstado: ${estado}`);
    });
}

// ============================================
// RESPONSIVE - CERRAR SIDEBAR AL CAMBIAR TAMAÑO
// ============================================
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }
});

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Módulo de Emisión y Seguimiento de Recetas cargado');
    
    // Cargar información del médico activo
    // cargarMedicoActivo();  // ahora la selección de médico se hace desde el home/index
    
    // Establecer fecha de emisión automáticamente a hoy
    const fechaEmisionInput = document.getElementById('fechaEmision');
    if (fechaEmisionInput) {
        const hoy = new Date();
        const fechaFormateada = hoy.toISOString().split('T')[0];
        fechaEmisionInput.value = fechaFormateada;
        console.log('Fecha de emisión establecida:', fechaFormateada);
    }
});

// La información del médico activo ahora se gestiona mediante selección en el home

// ============================================
// BÚSQUEDA RÁPIDA DE PACIENTE
// ============================================
const pacientesDBMain = {
    "1234567": {
        id: 1,
        nombre: "Ana María Pérez González",
        identificacion: "1234567",
        fechaNacimiento: "1989-03-15",
        telefono: "301-234-5678",
        correo: "ana.perez@email.com",
        direccion: "Calle 45 #12-34, Bogotá"
    },
    "2345678": {
        id: 2,
        nombre: "Juan Carlos García López",
        identificacion: "2345678",
        fechaNacimiento: "1982-07-22",
        telefono: "302-345-6789",
        correo: "juan.garcia@email.com",
        direccion: "Carrera 15 #23-45, Bogotá"
    },
    "3456789": {
        id: 3,
        nombre: "María Sofía Rodríguez Martínez",
        identificacion: "3456789",
        fechaNacimiento: "1996-11-08",
        telefono: "303-456-7890",
        correo: "sofia.rodriguez@email.com",
        direccion: "Avenida 68 #34-56, Bogotá"
    },
    "4567890": {
        id: 4,
        nombre: "Carlos Alberto Ramírez Torres",
        identificacion: "4567890",
        fechaNacimiento: "1969-05-30",
        telefono: "304-567-8901",
        correo: "carlos.ramirez@email.com",
        direccion: "Transversal 22 #45-67, Bogotá"
    },
    "5678901": {
        id: 5,
        nombre: "Laura Patricia Gómez Vargas",
        identificacion: "5678901",
        fechaNacimiento: "1993-09-14",
        telefono: "305-678-9012",
        correo: "laura.gomez@email.com",
        direccion: "Diagonal 30 #56-78, Bogotá"
    }
};

function buscarPacienteRapido() {
    const inputId = document.getElementById('buscarPacienteId');
    const contenedorEncontrado = document.getElementById('pacienteEncontrado');
    const nombreSpan = document.getElementById('nombrePacienteEncontrado');
    
    const identificacion = inputId.value.trim();
    
    if (!identificacion) {
        alert('Por favor ingrese un número de identificación');
        return;
    }
    
    const paciente = pacientesDBMain[identificacion];
    
    if (paciente) {
        nombreSpan.textContent = paciente.nombre;
        contenedorEncontrado.style.display = 'block';
        console.log('Paciente encontrado:', paciente);
    } else {
        contenedorEncontrado.style.display = 'none';
        alert('Paciente no encontrado. Verifique el número de identificación.');
    }
}

// Nueva función para buscar y cargar datos completos del paciente
function buscarYCargarPaciente() {
    const inputBusqueda = document.getElementById('buscarPacienteCedula');
    const identificacion = inputBusqueda.value.trim();
    
    if (!identificacion) {
        alert('⚠️ Por favor ingrese un número de cédula para buscar');
        return;
    }
    
    // Simular búsqueda en la BD (en producción sería: fetch(`/api/pacientes/buscar/${identificacion}`))
    const paciente = pacientesDB[identificacion];
    
    if (paciente) {
        // ✅ PACIENTE ENCONTRADO - Solo guardar el ID
        mostrarPacienteEncontrado(paciente);
        
        // Ocultar formulario de registro
        document.getElementById('formRegistroPaciente').style.display = 'none';
        
        console.log('✅ Paciente encontrado - ID:', paciente.id);
    } else {
        // ❌ PACIENTE NO ENCONTRADO - Mostrar formulario para registrar
        ocultarPacienteEncontrado();
        
        alert('❌ Paciente no encontrado\n\n' +
              'La cédula "' + identificacion + '" no está registrada.\n\n' +
              'Por favor complete los datos del paciente en el formulario.\n\n' +
              'Cédulas de prueba disponibles:\n' +
              '• 1234567 - Ana María Pérez González\n' +
              '• 2345678 - Juan Carlos García López\n' +
              '• 3456789 - María Sofía Rodríguez Martínez\n' +
              '• 4567890 - Carlos Alberto Ramírez Torres\n' +
              '• 5678901 - Laura Patricia Gómez Vargas');
        
        // Pre-llenar la cédula en el formulario
        document.getElementById('identificacionPaciente').value = identificacion;
        document.getElementById('nombrePaciente').focus();
        
        console.log('❌ Paciente no encontrado - Preparando registro nuevo');
    }
}

// Mostrar información del paciente encontrado
function mostrarPacienteEncontrado(paciente) {
    const box = document.getElementById('pacienteEncontradoBox');
    
    // Llenar los datos en la tarjeta
    document.getElementById('pacienteNombreMostrar').textContent = paciente.nombre;
    document.getElementById('pacienteCedulaMostrar').textContent = paciente.identificacion;
    document.getElementById('pacienteTelefonoMostrar').textContent = paciente.telefono;
    document.getElementById('pacienteIdHidden').value = paciente.id; // ⭐ SOLO guardamos el ID
    
    // Mostrar la tarjeta
    box.style.display = 'block';
    
    alert('✅ Paciente encontrado!\n\n' +
          'Nombre: ' + paciente.nombre + '\n' +
          'Cédula: ' + paciente.identificacion + '\n' +
          'Teléfono: ' + paciente.telefono + '\n\n' +
          'Los datos se han cargado. La receta se asociará a este paciente.');
}

// Ocultar tarjeta de paciente encontrado
function ocultarPacienteEncontrado() {
    document.getElementById('pacienteEncontradoBox').style.display = 'none';
    document.getElementById('formRegistroPaciente').style.display = 'block';
}

// Limpiar selección de paciente
function limpiarPaciente() {
    // Ocultar tarjeta de paciente encontrado
    ocultarPacienteEncontrado();
    
    // Limpiar campos del formulario
    document.getElementById('buscarPacienteCedula').value = '';
    document.getElementById('nombrePaciente').value = '';
    document.getElementById('identificacionPaciente').value = '';
    document.getElementById('fechaNacimiento').value = '';
    document.getElementById('telefonoPaciente').value = '';
    document.getElementById('pacienteIdHidden').value = '';
    
    console.log('🔄 Búsqueda de paciente reiniciada');
}

