<?php
/**
 * Medidino - Backend API
 * Documentación de endpoints disponibles
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medidino - API Backend</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1E88A8 0%, #4FC3DC 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1E88A8 0%, #4FC3DC 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .endpoint {
            margin-bottom: 40px;
            border-left: 5px solid #1E88A8;
            padding-left: 20px;
        }
        
        .endpoint h3 {
            color: #1E88A8;
            font-size: 1.5em;
            margin-bottom: 10px;
        }
        
        .method {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 5px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
        }
        
        .method.get {
            background: #4CAF50;
        }
        
        .method.post {
            background: #2196F3;
        }
        
        .method.put {
            background: #FF9800;
        }
        
        .method.delete {
            background: #F44336;
        }
        
        .url {
            background: #f5f5f5;
            padding: 10px 15px;
            border-radius: 5px;
            font-family: monospace;
            margin: 10px 0;
            word-break: break-all;
        }
        
        .description {
            color: #666;
            margin: 10px 0;
            line-height: 1.6;
        }
        
        .example {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
            font-size: 0.9em;
            overflow-x: auto;
        }
        
        .status {
            background: #E8F5E9;
            border-left: 3px solid #4CAF50;
            padding: 15px;
            margin: 10px 0;
            border-radius: 3px;
        }
        
        .status.success::before {
            content: '✓ ';
            color: #4CAF50;
            font-weight: bold;
        }
        
        .section-title {
            font-size: 1.8em;
            color: #1E88A8;
            margin-top: 30px;
            margin-bottom: 20px;
            border-bottom: 2px solid #4FC3DC;
            padding-bottom: 10px;
        }
        
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Medidino API</h1>
            <p>Backend PHP para Gestión de Médicos</p>
        </div>
        
        <div class="content">
            <h2 class="section-title">📋 Endpoints Disponibles</h2>
            
            <!-- MÉDICOS -->
            <h2 class="section-title">👨‍⚕️ Médicos</h2>
            
            <div class="endpoint">
                <h3>Obtener todos los médicos</h3>
                <span class="method get">GET</span>
                <div class="url">/backend/medicos.php</div>
                <p class="description">Retorna lista de todos los médicos activos con su especialidad</p>
                <div class="status success">Responde con un array JSON de médicos</div>
                <div class="example">
                    GET /backend/medicos.php<br>
                    Response: { "success": true, "data": [...] }
                </div>
            </div>
            
            <div class="endpoint">
                <h3>Obtener un médico específico</h3>
                <span class="method get">GET</span>
                <div class="url">/backend/medicos.php?id=1</div>
                <p class="description">Retorna los datos completos de un médico por su ID</p>
                <div class="example">
                    GET /backend/medicos.php?id=1<br>
                    Response: { "success": true, "data": { "id_medico": 1, ... } }
                </div>
            </div>
            
            <div class="endpoint">
                <h3>Crear nuevo médico</h3>
                <span class="method post">POST</span>
                <div class="url">/backend/medicos.php</div>
                <p class="description">Registra un nuevo médico en la base de datos</p>
                <p style="color: #666; margin: 10px 0;"><strong>Campos requeridos:</strong> nombre, apellido, email, numero_licencia</p>
                <div class="example">
                    POST /backend/medicos.php<br>
                    Content-Type: application/json<br><br>
                    {<br>
                    &nbsp;&nbsp;"nombre": "Juan",<br>
                    &nbsp;&nbsp;"apellido": "Pérez",<br>
                    &nbsp;&nbsp;"email": "juan@hospital.com",<br>
                    &nbsp;&nbsp;"telefono": "+57 300 123 4567",<br>
                    &nbsp;&nbsp;"numero_licencia": "LIC-001",<br>
                    &nbsp;&nbsp;"id_especialidad": 1<br>
                    }
                </div>
            </div>
            
            <div class="endpoint">
                <h3>Actualizar médico</h3>
                <span class="method put">PUT</span>
                <div class="url">/backend/medicos.php</div>
                <p class="description">Actualiza la información de un médico existente</p>
                <div class="example">
                    PUT /backend/medicos.php<br>
                    Content-Type: application/json<br><br>
                    {<br>
                    &nbsp;&nbsp;"id_medico": 1,<br>
                    &nbsp;&nbsp;"email": "newemail@hospital.com"<br>
                    }
                </div>
            </div>
            
            <div class="endpoint">
                <h3>Eliminar (desactivar) médico</h3>
                <span class="method delete">DELETE</span>
                <div class="url">/backend/medicos.php?id=1</div>
                <p class="description">Desactiva un médico (eliminación lógica)</p>
                <div class="example">
                    DELETE /backend/medicos.php?id=1
                </div>
            </div>
            
            <!-- ESPECIALIDADES -->
            <h2 class="section-title">🏥 Especialidades</h2>
            
            <div class="endpoint">
                <h3>Obtener especialidades</h3>
                <span class="method get">GET</span>
                <div class="url">/backend/especialidades.php</div>
                <p class="description">Retorna lista de todas las especialidades disponibles</p>
                <div class="status success">Responde con un array JSON de especialidades</div>
            </div>
            
            <!-- HORARIOS -->
            <h2 class="section-title">⏰ Horarios Laborales</h2>
            
            <div class="endpoint">
                <h3>Obtener horarios de un médico</h3>
                <span class="method get">GET</span>
                <div class="url">/backend/horarios.php?id_medico=1</div>
                <p class="description">Retorna los horarios laborales de un médico</p>
            </div>
            
            <div class="endpoint">
                <h3>Crear horario</h3>
                <span class="method post">POST</span>
                <div class="url">/backend/horarios.php</div>
                <p class="description">Registra un nuevo horario laboral para un médico</p>
                <div class="example">
                    POST /backend/horarios.php<br>
                    Content-Type: application/json<br><br>
                    {<br>
                    &nbsp;&nbsp;"id_medico": 1,<br>
                    &nbsp;&nbsp;"dia_semana": "lunes",<br>
                    &nbsp;&nbsp;"hora_inicio": "08:00",<br>
                    &nbsp;&nbsp;"hora_fin": "12:00"<br>
                    }
                </div>
            </div>
            
            <!-- REPORTES -->
            <h2 class="section-title">📊 Reportes y Estadísticas</h2>
            
            <div class="endpoint">
                <h3>Estadísticas generales</h3>
                <span class="method get">GET</span>
                <div class="url">/backend/reportes.php?tipo=general</div>
                <p class="description">Retorna estadísticas generales del sistema</p>
            </div>
            
            <div class="endpoint">
                <h3>Estadísticas por médico</h3>
                <span class="method get">GET</span>
                <div class="url">/backend/reportes.php?tipo=medico&id_medico=1</div>
                <p class="description">Retorna estadísticas específicas de un médico</p>
            </div>
            
            <h2 class="section-title">🔧 Configuración</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1E88A8; margin-bottom: 15px;">Base de Datos</h3>
                <p><strong>Host:</strong> localhost</p>
                <p><strong>Usuario:</strong> root</p>
                <p><strong>Contraseña:</strong> (vacía por defecto)</p>
                <p><strong>Base de datos:</strong> medidino_medicos</p>
            </div>
            
            <h2 class="section-title">📝 Respuestas</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Exitosa (200):</strong></p>
                <div class="example">
                    {<br>
                    &nbsp;&nbsp;"success": true,<br>
                    &nbsp;&nbsp;"message": "Médicos obtenidos correctamente",<br>
                    &nbsp;&nbsp;"data": [ ... ]<br>
                    }
                </div>
                
                <p style="margin-top: 20px;"><strong>Error (400/500):</strong></p>
                <div class="example">
                    {<br>
                    &nbsp;&nbsp;"success": false,<br>
                    &nbsp;&nbsp;"message": "Descripción del error",<br>
                    &nbsp;&nbsp;"data": null<br>
                    }
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Medidino Backend API v1.0 | Desarrollado con PHP y MySQL</p>
            <p style="margin-top: 10px; font-size: 0.9em;">
                Para más información, consulta la documentación del proyecto
            </p>
        </div>
    </div>
</body>
</html>
