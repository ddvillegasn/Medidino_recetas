<?php
/**
 * Script de prueba para verificar los endpoints de la API
 * Acceder desde: http://localhost/MediDino/backend/test-api.php
 */

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test API - MediDino</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .test-section {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-section h2 {
            color: #1E88A8;
            border-bottom: 2px solid #1E88A8;
            padding-bottom: 10px;
        }
        .test-button {
            background: #1E88A8;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        .test-button:hover {
            background: #176a84;
        }
        .result {
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            margin: 10px 0;
            max-height: 400px;
            overflow-y: auto;
        }
        .success {
            color: #4CAF50;
            font-weight: bold;
        }
        .error {
            color: #F44336;
            font-weight: bold;
        }
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <h1>🔧 Test de API - MediDino</h1>
    
    <div class="test-section">
        <h2>1. Test de Conexión a Base de Datos</h2>
        <button class="test-button" onclick="testConnection()">Probar Conexión</button>
        <div id="connectionResult" class="result"></div>
    </div>
    
    <div class="test-section">
        <h2>2. Test de Endpoint: Obtener Médicos (GET)</h2>
        <button class="test-button" onclick="testGetMedicos()">Obtener Médicos</button>
        <div id="medicosResult" class="result"></div>
    </div>
    
    <div class="test-section">
        <h2>3. Test de Endpoint: Obtener Especialidades (GET)</h2>
        <button class="test-button" onclick="testGetEspecialidades()">Obtener Especialidades</button>
        <div id="especialidadesResult" class="result"></div>
    </div>
    
    <div class="test-section">
        <h2>4. Test de Endpoint: Crear Médico (POST)</h2>
        <button class="test-button" onclick="testCreateMedico()">Crear Médico de Prueba</button>
        <div id="createResult" class="result"></div>
    </div>
    
    <div class="test-section">
        <h2>5. Test de Endpoint: Obtener Horarios (GET)</h2>
        <input type="number" id="medicoId" placeholder="ID del Médico" style="padding: 8px; margin: 5px;">
        <button class="test-button" onclick="testGetHorarios()">Obtener Horarios</button>
        <div id="horariosResult" class="result"></div>
    </div>

    <script>
        const API_URL = 'http://localhost/MediDino/backend';
        
        async function testConnection() {
            const resultDiv = document.getElementById('connectionResult');
            resultDiv.innerHTML = '<p>Cargando...</p>';
            
            try {
                const response = await fetch(API_URL + '/test-connection.php');
                const data = await response.json();
                
                let html = '<h3 class="' + (data.conexion && data.base_datos ? 'success' : 'error') + '">';
                html += (data.conexion && data.base_datos ? '✓ Conexión Exitosa' : '✗ Error de Conexión');
                html += '</h3>';
                html += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                resultDiv.innerHTML = html;
            } catch (error) {
                resultDiv.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
            }
        }
        
        async function testGetMedicos() {
            const resultDiv = document.getElementById('medicosResult');
            resultDiv.innerHTML = '<p>Cargando...</p>';
            
            try {
                const response = await fetch(API_URL + '/medicos.php');
                const data = await response.json();
                
                let html = '<h3 class="' + (data.success ? 'success' : 'error') + '">';
                html += (data.success ? '✓ Médicos Obtenidos' : '✗ Error');
                html += '</h3>';
                html += '<p>Total de médicos: ' + (data.data ? data.data.length : 0) + '</p>';
                html += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                resultDiv.innerHTML = html;
            } catch (error) {
                resultDiv.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
            }
        }
        
        async function testGetEspecialidades() {
            const resultDiv = document.getElementById('especialidadesResult');
            resultDiv.innerHTML = '<p>Cargando...</p>';
            
            try {
                const response = await fetch(API_URL + '/especialidades.php');
                const data = await response.json();
                
                let html = '<h3 class="' + (data.success ? 'success' : 'error') + '">';
                html += (data.success ? '✓ Especialidades Obtenidas' : '✗ Error');
                html += '</h3>';
                html += '<p>Total de especialidades: ' + (data.data ? data.data.length : 0) + '</p>';
                html += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                resultDiv.innerHTML = html;
            } catch (error) {
                resultDiv.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
            }
        }
        
        async function testCreateMedico() {
            const resultDiv = document.getElementById('createResult');
            resultDiv.innerHTML = '<p>Cargando...</p>';
            
            // Datos de prueba
            const medicoTest = {
                nombre: 'Test',
                apellido: 'Médico Prueba',
                email: 'test' + Date.now() + '@test.com',
                telefono: '3001234567',
                cedula: '12345678',
                numero_licencia: 'LIC-TEST-' + Date.now(),
                id_especialidad: 1,
                experiencia_anos: 5
            };
            
            try {
                const response = await fetch(API_URL + '/medicos.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(medicoTest)
                });
                
                const data = await response.json();
                
                let html = '<h3 class="' + (data.success ? 'success' : 'error') + '">';
                html += (data.success ? '✓ Médico Creado' : '✗ Error');
                html += '</h3>';
                html += '<p>Datos enviados:</p>';
                html += '<pre>' + JSON.stringify(medicoTest, null, 2) + '</pre>';
                html += '<p>Respuesta:</p>';
                html += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                resultDiv.innerHTML = html;
            } catch (error) {
                resultDiv.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
            }
        }
        
        async function testGetHorarios() {
            const resultDiv = document.getElementById('horariosResult');
            const medicoId = document.getElementById('medicoId').value;
            
            if (!medicoId) {
                resultDiv.innerHTML = '<p class="error">Por favor ingresa un ID de médico</p>';
                return;
            }
            
            resultDiv.innerHTML = '<p>Cargando...</p>';
            
            try {
                const response = await fetch(API_URL + '/horarios.php?id_medico=' + medicoId);
                const data = await response.json();
                
                let html = '<h3 class="' + (data.success ? 'success' : 'error') + '">';
                html += (data.success ? '✓ Horarios Obtenidos' : '✗ Error');
                html += '</h3>';
                html += '<p>Total de horarios: ' + (data.data ? data.data.length : 0) + '</p>';
                html += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                resultDiv.innerHTML = html;
            } catch (error) {
                resultDiv.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
            }
        }
        
        // Ejecutar test de conexión al cargar la página
        window.onload = function() {
            testConnection();
        };
    </script>
</body>
</html>

