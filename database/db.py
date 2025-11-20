import sqlite3
import os
from contextlib import contextmanager
from datetime import datetime
import random


DB_FILENAME = os.path.join(os.path.dirname(__file__), 'medidino.db')


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


@contextmanager
def connect_db(db_path=None):
    path = db_path or DB_FILENAME
    conn = sqlite3.connect(path)
    conn.row_factory = dict_factory
    try:
        yield conn
    finally:
        conn.close()


def get_paciente_by_identificacion(identificacion, db_path=None):
    """Devuelve un diccionario con el paciente o None"""
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM PACIENTE WHERE identificacion = ?", (identificacion,))
        return cur.fetchone()


def get_medicamento_by_nombre(nombre, db_path=None):
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM MEDICAMENTO WHERE nombre = ?", (nombre,))
        return cur.fetchone()


def get_medico_by_id(id_medico, db_path=None):
    """Devuelve el registro del médico en la base de datos SQLite por su id_local (id_medico)."""
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM MEDICO WHERE id_medico = ?", (id_medico,))
        return cur.fetchone()


def find_medico_by_identificacion_o_correo(identificacion=None, correo=None, db_path=None):
    """Busca un médico por identificacion (cedula) o correo en la BD local."""
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        if identificacion:
            cur.execute("SELECT * FROM MEDICO WHERE identificacion = ?", (identificacion,))
            row = cur.fetchone()
            if row:
                return row
        if correo:
            cur.execute("SELECT * FROM MEDICO WHERE correo = ?", (correo,))
            row = cur.fetchone()
            if row:
                return row
    return None


def ensure_medico_from_external(external_medico, db_path=None):
    """Inserta un médico mínimo en la BD SQLite si no existe y devuelve su id_local.

    external_medico: dict que puede contener keys como 'id_medico', 'nombre', 'apellido',
    'cedula' or 'identificacion', 'email', 'telefono', 'nombre_especialidad', 'numero_licencia'
    """
    identificacion = external_medico.get('cedula') or external_medico.get('identificacion') or None
    correo = external_medico.get('email') or external_medico.get('correo') or None

    existente = find_medico_by_identificacion_o_correo(identificacion=identificacion, correo=correo, db_path=db_path)
    if existente:
        return existente.get('id_medico')

    nombre = external_medico.get('nombre', '')
    apellido = external_medico.get('apellido', '')
    nombre_completo = (str(nombre) + ' ' + str(apellido)).strip()
    especialidad = external_medico.get('nombre_especialidad') or external_medico.get('especialidad') or None
    telefono = external_medico.get('telefono') or external_medico.get('phone') or None
    registro_profesional = external_medico.get('numero_licencia') or external_medico.get('registro_profesional') or None

    with connect_db(db_path) as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO MEDICO (nombre, identificacion, especialidad, correo, telefono, registro_profesional, activo) VALUES (?, ?, ?, ?, ?, ?, 1)",
            (nombre_completo or None, identificacion, especialidad, correo, telefono, registro_profesional)
        )
        conn.commit()
        return cur.lastrowid


def listar_pacientes(limit=100, db_path=None):
    """Devuelve una lista de pacientes (útil para depuración y listados)."""
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM PACIENTE ORDER BY nombre LIMIT ?", (limit,))
        return cur.fetchall()


def create_medicamento(nombre, descripcion=None, principio_activo=None, presentacion=None, concentracion=None, db_path=None):
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO MEDICAMENTO (nombre, descripcion, principio_activo, presentacion, concentracion) VALUES (?, ?, ?, ?, ?)",
            (nombre, descripcion, principio_activo, presentacion, concentracion)
        )
        conn.commit()
        return cur.lastrowid


def _generar_numero_receta():
    año = datetime.now().year
    sufijo = str(random.randint(0, 99999)).zfill(5)
    return f"RX-{año}-{sufijo}"


def crear_receta_con_detalles(payload, db_path=None):
    """
    Crea una receta y sus detalles dentro de una transacción.

    payload expected keys:
      - identificacion (preferred) or id_paciente
      - id_medico
      - fecha_emision (YYYY-MM-DD)
      - observaciones
      - detalles: list of { medicamento_nombre, dosis, frecuencia, duracion, indicaciones }
    """
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        try:
            identificacion = payload.get('identificacion')
            id_paciente = payload.get('id_paciente')

            if not id_paciente and identificacion:
                cur.execute("SELECT id_paciente FROM PACIENTE WHERE identificacion = ?", (identificacion,))
                row = cur.fetchone()
                if not row:
                    raise ValueError('Paciente no encontrado')
                id_paciente = row['id_paciente']

            if not id_paciente:
                raise ValueError('id_paciente o identificacion es requerido')

            id_medico = payload.get('id_medico') or 1
            fecha_emision = payload.get('fecha_emision') or datetime.now().strftime('%Y-%m-%d')
            observaciones = payload.get('observaciones')
            estado = payload.get('estado') or 'Activa'

            numero_receta = _generar_numero_receta()

            # Insert receta
            cur.execute(
                "INSERT INTO RECETA (fecha_emision, observaciones, estado, id_paciente, id_medico, numero_receta) VALUES (?, ?, ?, ?, ?, ?)",
                (fecha_emision, observaciones, estado, id_paciente, id_medico, numero_receta)
            )
            id_receta = cur.lastrowid

            detalles = payload.get('detalles', []) or []

            for det in detalles:
                # Resolver id_medicamento por nombre o usar id_medicamento si fue provisto
                id_medicamento = det.get('id_medicamento')
                if not id_medicamento:
                    nombre = det.get('medicamento_nombre') or det.get('medicamento')
                    if not nombre:
                        raise ValueError('Cada detalle debe incluir id_medicamento o medicamento_nombre')

                    cur.execute("SELECT id_medicamento FROM MEDICAMENTO WHERE nombre = ?", (nombre,))
                    m = cur.fetchone()
                    if m:
                        id_medicamento = m['id_medicamento']
                    else:
                        # crear medicamento mínimo
                        cur.execute("INSERT INTO MEDICAMENTO (nombre) VALUES (?)", (nombre,))
                        id_medicamento = cur.lastrowid

                dosis = det.get('dosis') or ''
                frecuencia = det.get('frecuencia') or ''
                duracion = det.get('duracion') or ''
                cantidad = det.get('cantidad')
                indicaciones = det.get('indicaciones')

                cur.execute(
                    "INSERT INTO DETALLE_RECETA (id_receta, id_medicamento, dosis, frecuencia, duracion, cantidad, indicaciones) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (id_receta, id_medicamento, dosis, frecuencia, duracion, cantidad, indicaciones)
                )

            conn.commit()
            return {'id_receta': id_receta, 'numero_receta': numero_receta}

        except Exception:
            conn.rollback()
            raise


def listar_recetas(limit=100, db_path=None, identificacion=None):
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        query = "SELECT r.*, p.nombre as paciente_nombre, p.identificacion as paciente_identificacion, m.nombre as medico_nombre FROM RECETA r JOIN PACIENTE p ON r.id_paciente = p.id_paciente JOIN MEDICO m ON r.id_medico = m.id_medico"
        params = []
        if identificacion:
            query += " WHERE p.identificacion = ?"
            params.append(identificacion)
        query += " ORDER BY r.fecha_emision DESC LIMIT ?"
        params.append(limit)
        cur.execute(query, params)
        return cur.fetchall()


def listar_medicamentos(term=None, solo_disponibles=False, limit=200, db_path=None):
    """
    Devuelve una lista de medicamentos con información de inventario.

    Args:
      term: filtro parcial por nombre (LIKE)
      solo_disponibles: si True, filtra por cantidad_actual > 0
      limit: máximo de resultados
    """
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        query = (
            "SELECT med.id_medicamento as id, med.nombre, med.presentacion, med.descripcion, "
            "ifnull(inv.cantidad_actual, 0) as stock, inv.ubicacion as ubicacion, inv.lote as lote "
            "FROM MEDICAMENTO med "
            "LEFT JOIN INVENTARIO inv ON med.id_medicamento = inv.id_medicamento "
        )
        params = []
        where_clauses = []
        if term:
            where_clauses.append("med.nombre LIKE ?")
            params.append(f"%{term}%")
        if solo_disponibles:
            where_clauses.append("ifnull(inv.cantidad_actual,0) > 0")

        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)

        query += " ORDER BY med.nombre LIMIT ?"
        params.append(limit)

        cur.execute(query, params)
        return cur.fetchall()

def get_receta_con_detalles(id_receta, db_path=None):
    """
    Devuelve una receta con sus detalles, medicamentos y datos del paciente y médico.
    """
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        # Obtener datos de la receta con paciente y medico
        cur.execute(
            "SELECT r.*, p.nombre AS paciente_nombre, p.identificacion AS paciente_identificacion, m.nombre AS medico_nombre, m.especialidad AS medico_especialidad "
            "FROM RECETA r "
            "JOIN PACIENTE p ON r.id_paciente = p.id_paciente "
            "LEFT JOIN MEDICO m ON r.id_medico = m.id_medico "
            "WHERE r.id_receta = ?",
            (id_receta,)
        )
        receta = cur.fetchone()
        if not receta:
            return None

        # Obtener detalles de la receta con nombres de medicamento
        cur.execute(
            "SELECT d.*, med.nombre as medicamento_nombre, med.presentacion "
            "FROM DETALLE_RECETA d "
            "LEFT JOIN MEDICAMENTO med ON d.id_medicamento = med.id_medicamento "
            "WHERE d.id_receta = ?",
            (id_receta,)
        )
        detalles = cur.fetchall()

        receta['detalles'] = detalles
        return receta


def crear_paciente(datos, db_path=None):
    """
    Crea un nuevo paciente si no existe uno con la misma identificacion.
    Si ya existe, devuelve el registro existente.

    Args:
      datos: dict con keys: nombre, identificacion, edad, genero, direccion, telefono, correo
    Returns:
      dict: registro del paciente creado o existente
    """
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        identificacion = datos.get('identificacion')
        if not identificacion:
            raise ValueError('identificacion es requerida')

        # Verificar si ya existe
        cur.execute("SELECT * FROM PACIENTE WHERE identificacion = ?", (identificacion,))
        existente = cur.fetchone()
        if existente:
            # Devolver el registro existente
            return existente

        # Insertar nuevo paciente
        cur.execute(
            "INSERT INTO PACIENTE (nombre, identificacion, edad, genero, direccion, telefono, correo) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                datos.get('nombre'),
                identificacion,
                datos.get('edad'),
                datos.get('genero'),
                datos.get('direccion'),
                datos.get('telefono'),
                datos.get('correo')
            )
        )
        conn.commit()
        new_id = cur.lastrowid
        cur.execute("SELECT * FROM PACIENTE WHERE id_paciente = ?", (new_id,))
        return cur.fetchone()


def crear_notificacion(id_paciente=None, id_receta=None, canal='SMS', mensaje=None, db_path=None):
    """
    Inserta una notificación en NOTIFICACION_RECETA. Devuelve el registro insertado.
    Si se pasa identificacion en lugar de id_paciente, resuélvelo antes de llamar.
    """
    with connect_db(db_path) as conn:
        cur = conn.cursor()

        if not id_paciente and not id_receta:
            raise ValueError('id_paciente o id_receta es requerido')

        # Insertar notificación
        estado = 'Pendiente'
        canal_val = canal or 'Sistema'
        cur.execute(
            "INSERT INTO NOTIFICACION_RECETA (id_paciente, id_receta, canal, estado, mensaje) VALUES (?, ?, ?, ?, ?)",
            (id_paciente, id_receta, canal_val, estado, mensaje)
        )
        conn.commit()
        nid = cur.lastrowid
        cur.execute("SELECT * FROM NOTIFICACION_RECETA WHERE id_notificacion = ?", (nid,))
        return cur.fetchone()
