from flask import Flask, render_template, jsonify, request
from database import db
import os
import urllib.request
import json

# Serve the repository root as static so existing css/ and js/ folders work unchanged
app = Flask(__name__, static_folder='.', static_url_path='')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/nueva-receta')
def nueva_receta():
    return render_template('nueva-receta.html')


@app.route('/historial')
def historial():
    return render_template('historial.html')


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
        # Si el payload incluye un id_medico que no existe en la BD SQLite,
        # intentar obtenerlo desde el módulo PHP (XAMPP) y crear un registro
        # local mínimo en SQLite para mantener la FK.
        id_medico_externo = payload.get('id_medico')
        if id_medico_externo:
            try:
                # Verificar si ya existe localmente
                local_med = db.get_medico_by_id(id_medico_externo)
                if not local_med:
                    # Intentar obtener desde el endpoint PHP
                    # URL asumida (usar la ruta donde corre XAMPP)
                    php_url = f'http://localhost/Medidino_recetas/backend/medicos.php/{id_medico_externo}'
                    with urllib.request.urlopen(php_url) as resp:
                        raw = resp.read().decode('utf-8')
                        try:
                            j = json.loads(raw)
                        except Exception:
                            j = None
                    medico_data = None
                    if j and isinstance(j, dict):
                        # php API devuelve { success:true, message:'', data: [...] }
                        data = j.get('data')
                        if isinstance(data, list) and len(data) > 0:
                            medico_data = data[0]
                        elif isinstance(data, dict):
                            medico_data = data

                    if medico_data:
                        # Insertar/asegurar médico en SQLite y obtener id_local
                        nuevo_id = db.ensure_medico_from_external(medico_data)
                        payload['id_medico'] = nuevo_id
            except Exception:
                # No bloquear: si falla la sincronización, dejar que la creación falle
                pass

        result = db.crear_receta_con_detalles(payload)
        return jsonify({
            'success': True,
            'id_receta': result['id_receta'],
            'numero_receta': result['numero_receta']
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'details': str(e)}), 500


@app.route('/api/recetas', methods=['GET'])
def api_list_recetas():
    identificacion = request.args.get('identificacion')
    limit = int(request.args.get('limit') or 100)
    recetas = db.listar_recetas(limit=limit, identificacion=identificacion)
    return jsonify(recetas)


@app.route('/api/recetas/<int:id_receta>', methods=['GET'])
def api_get_receta(id_receta):
    try:
        receta = db.get_receta_con_detalles(id_receta)
        if not receta:
            return jsonify({'error': 'Receta no encontrada'}), 404
        return jsonify(receta)
    except Exception as e:
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
