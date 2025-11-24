from flask import Flask, render_template, jsonify, request
from database import db
import os
import urllib.request
import urllib.parse
import json

# Serve the repository root as static so existing css/ and js/ folders work unchanged
app = Flask(__name__, static_folder='.', static_url_path='')


@app.route('/')
def dashboard():
    return render_template('dashboard.html')


@app.route('/recetas')
def index():
    return render_template('index.html')


@app.route('/nueva-receta')
def nueva_receta():
    return render_template('nueva-receta.html')


@app.route('/historial')
def historial():
    return render_template('historial.html')


@app.route('/test-endpoints')
def test_endpoints():
    return app.send_static_file('test_endpoints.html')


@app.route('/diagnostico')
def diagnostico():
    return app.send_static_file('diagnostico.html')


@app.route('/test-historial')
def test_historial():
    return render_template('test_historial_funciones.html')


# -------------------------
# API endpoints (JSON)
# -------------------------

@app.route('/api/pacientes/<identificacion>', methods=['GET'])
def api_get_paciente(identificacion):
    paciente = db.get_paciente_by_identificacion(identificacion)
    if paciente:
        return jsonify(paciente)
    return jsonify({'error': 'Paciente no encontrado'}), 404


@app.route('/api/pacientes', methods=['GET', 'POST'])
def api_create_or_list_pacientes():
    if request.method == 'GET':
        # List patients (debug / UI listing)
        try:
            limit = int(request.args.get('limit') or 200)
        except ValueError:
            limit = 200
        pacientes = db.listar_pacientes(limit=limit)
        return jsonify(pacientes)

    # POST -> create paciente
    try:
        payload = request.get_json(force=True)
        # payload expected keys: nombre, identificacion, edad, genero, direccion, telefono, correo
        paciente = db.crear_paciente(payload)
        # Si el paciente ya existía, devolver 200 con su dato
        return jsonify(paciente), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'details': str(e)}), 500


@app.route('/api/recetas', methods=['POST'])
def api_create_receta():
    try:
        payload = request.get_json(force=True)
        
        # Extraer datos de la receta y detalles
        receta_data = payload.get('receta', {})
        detalles_data = payload.get('detalles', [])
        
        # Si el payload incluye un id_medico que no existe en la BD SQLite,
        # intentar obtenerlo desde el módulo PHP (XAMPP) y crear un registro
        # local mínimo en SQLite para mantener la FK.
        id_medico_externo = receta_data.get('id_medico')
        if id_medico_externo:
            try:
                # Verificar si ya existe localmente en SQLite
                local_med = db.get_medico_by_id(id_medico_externo)
                if not local_med:
                    # Intentar obtener desde el endpoint PHP
                    php_url = f'http://localhost/Medidino_recetas/backend/medicos.php'
                    req = urllib.request.Request(php_url, headers={'Accept': 'application/json'})
                    
                    with urllib.request.urlopen(req, timeout=5) as resp:
                        raw = resp.read().decode('utf-8')
                        j = json.loads(raw)
                    
                    # API PHP devuelve: { success: true, data: [{id_medico, nombre, apellido, ...}] }
                    medicos_list = j.get('data', [])
                    medico_encontrado = None
                    
                    # Buscar el médico específico en la lista
                    for med in medicos_list:
                        if str(med.get('id_medico')) == str(id_medico_externo):
                            medico_encontrado = med
                            break
                    
                    if medico_encontrado:
                        print(f"✅ Sincronizando médico desde PHP: {medico_encontrado.get('nombre')} {medico_encontrado.get('apellido')}")
                        # Insertar médico en SQLite local
                        nuevo_id = db.ensure_medico_from_external(medico_encontrado)
                        print(f"   ID local asignado: {nuevo_id}")
                    else:
                        print(f"⚠️ Médico ID {id_medico_externo} no encontrado en API PHP")
            except Exception as e:
                print(f"❌ Error sincronizando médico: {e}")
                # No bloquear: continuar con la creación de la receta
        
        # Reconstruir payload para db.crear_receta_con_detalles
        payload_normalizado = {
            'identificacion': receta_data.get('identificacion'),
            'id_paciente': receta_data.get('id_paciente'),
            'id_medico': id_medico_externo,
            'fecha_emision': receta_data.get('fecha_emision'),
            'observaciones': receta_data.get('observaciones'),
            'estado': receta_data.get('estado', 'Activa'),  # Estados válidos: Activa, Dispensada, Cancelada, Vencida
            'detalles': detalles_data
        }
        
        result = db.crear_receta_con_detalles(payload_normalizado)
        
        # ✅ NUEVO: Reducir stock de medicamentos automáticamente
        try:
            medicamentos_api_url = 'http://localhost/Medidino_recetas/modulos/medicamentos/MediDino-main/api_medicamentos.php'
            
            for detalle in detalles_data:
                id_medicamento = detalle.get('id_medicamento')
                cantidad = detalle.get('cantidad', 0)
                
                if id_medicamento and cantidad > 0:
                    # Preparar datos para dispensar
                    dispensar_data = {
                        'id_medicamento': id_medicamento,
                        'cantidad': cantidad,
                        'motivo': f"Receta {result['numero_receta']}"
                    }
                    
                    # Convertir a formato URL-encoded para PHP
                    dispensar_params = urllib.parse.urlencode(dispensar_data).encode('utf-8')
                    
                    # Llamar al API para dispensar (reducir stock)
                    dispensar_req = urllib.request.Request(
                        f"{medicamentos_api_url}?action=dispensar",
                        data=dispensar_params,
                        headers={'Content-Type': 'application/x-www-form-urlencoded'}
                    )
                    
                    with urllib.request.urlopen(dispensar_req, timeout=5) as resp:
                        dispensar_result = json.loads(resp.read().decode('utf-8'))
                        
                        if dispensar_result.get('success'):
                            print(f"✅ Stock reducido: Medicamento ID {id_medicamento} - Cantidad: {cantidad}")
                        else:
                            error_msg = dispensar_result.get('message') or dispensar_result.get('error', 'Error desconocido')
                            print(f"⚠️ No se pudo reducir stock: {error_msg}")
                            print(f"   Respuesta completa: {dispensar_result}")
        
        except Exception as e:
            print(f"⚠️ Error al reducir stock (receta guardada correctamente): {e}")
            import traceback
            traceback.print_exc()
            # No fallar la creación de la receta si falla la reducción de stock
        
        return jsonify({
            'success': True,
            'id_receta': result['id_receta'],
            'numero_receta': result['numero_receta']
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Error interno del servidor', 'details': str(e)}), 500


@app.route('/api/pacientes/buscar/<identificacion>', methods=['GET'])
def api_buscar_paciente(identificacion):
    try:
        paciente = db.buscar_paciente_por_identificacion(identificacion)
        if not paciente:
            return jsonify({'error': 'Paciente no encontrado'}), 404
        return jsonify(paciente)
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'details': str(e)}), 500


@app.route('/api/recetas', methods=['GET'])
def api_list_recetas():
    identificacion = request.args.get('identificacion')
    limit = int(request.args.get('limit') or 100)
    recetas = db.listar_recetas(limit=limit, identificacion=identificacion)
    return jsonify(recetas)


@app.route('/api/recetas/<int:id_receta>', methods=['GET', 'PUT', 'DELETE'])
def api_get_update_delete_receta(id_receta):
    if request.method == 'GET':
        try:
            receta = db.get_receta_con_detalles(id_receta)
            if not receta:
                return jsonify({'error': 'Receta no encontrada'}), 404
            return jsonify(receta)
        except Exception as e:
            return jsonify({'error': 'Error interno del servidor', 'details': str(e)}), 500
    
    elif request.method == 'PUT':
        try:
            payload = request.get_json(force=True)
            
            # Normalizar el payload: si viene con estructura {receta: {}, detalles: []}, extraerlo
            if 'receta' in payload and 'detalles' in payload:
                # Estructura desde nueva-receta.js
                receta_data = payload['receta']
                detalles_data = payload['detalles']
                
                # Construir payload normalizado
                payload_normalizado = {
                    'observaciones': receta_data.get('observaciones'),
                    'estado': receta_data.get('estado'),
                    'detalles': detalles_data
                }
            else:
                # Estructura simple (para compatibilidad)
                payload_normalizado = payload
            
            result = db.actualizar_receta_con_detalles(id_receta, payload_normalizado)
            if not result:
                return jsonify({'error': 'Receta no encontrada'}), 404
            return jsonify({
                'success': True,
                'message': 'Receta actualizada correctamente',
                'id_receta': id_receta
            }), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({'error': 'Error interno del servidor', 'details': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            result = db.eliminar_receta(id_receta)
            if not result:
                return jsonify({'error': 'Receta no encontrada'}), 404
            return jsonify({
                'success': True,
                'message': 'Receta eliminada correctamente'
            }), 200
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({'error': 'Error interno del servidor', 'details': str(e)}), 500


@app.route('/api/medicamentos', methods=['GET'])
def api_list_medicamentos():
        """Devuelve medicamentos, opcionalmente filtrados por término y/o solo disponibles.

        Query params:
            - term: string para buscar en nombre
            - disponibles: if '1' or 'true' -> solo con stock > 0
            - limit: número máximo de resultados
        """
        term = request.args.get('term')
        disponibles = request.args.get('disponibles')
        limit = int(request.args.get('limit') or 200)
        solo_disponibles = str(disponibles).lower() in ('1', 'true', 'yes')
        meds = db.listar_medicamentos(term=term, solo_disponibles=solo_disponibles, limit=limit)
        return jsonify(meds)


@app.route('/api/notificaciones', methods=['POST'])
def api_create_notificacion():
    try:
        payload = request.get_json(force=True)

        # payload may include: id_paciente OR identificacion, id_receta, canal, mensaje
        id_paciente = payload.get('id_paciente')
        identificacion = payload.get('identificacion')
        id_receta = payload.get('id_receta')
        canal = payload.get('canal') or 'Sistema'
        mensaje = payload.get('mensaje')

        if not id_paciente and identificacion:
            p = db.get_paciente_by_identificacion(identificacion)
            if not p:
                return jsonify({'error': 'Paciente no encontrado para crear notificación'}), 404
            id_paciente = p.get('id_paciente')

        if not id_paciente:
            return jsonify({'error': 'id_paciente o identificacion requerido'}), 400

        noti = db.crear_notificacion(id_paciente=id_paciente, id_receta=id_receta, canal=canal, mensaje=mensaje)
        return jsonify(noti), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'details': str(e)}), 500


if __name__ == '__main__':
    # Debug True for development; on production set to False and use a proper WSGI server
    app.run(host='127.0.0.1', port=5000, debug=True)
