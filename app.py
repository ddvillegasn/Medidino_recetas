from flask import Flask, render_template, jsonify, request
from database import db
import os

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


@app.route('/api/pacientes', methods=['POST'])
def api_create_paciente():
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


if __name__ == '__main__':
    # Debug True for development; on production set to False and use a proper WSGI server
    app.run(host='127.0.0.1', port=5000, debug=True)
