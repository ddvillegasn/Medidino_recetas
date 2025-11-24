import sqlite3
import os
from contextlib import contextmanager
from datetime import datetime
import random
import mysql.connector
from mysql.connector import Error


DB_FILENAME = os.path.join(os.path.dirname(__file__), 'medidino.db')

# Configuración de MySQL para medicamentos
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'farmacia',  # Base de datos sin .sql
    'port': 3307  # Puerto personalizado de tu XAMPP
}


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


def buscar_paciente_por_identificacion(identificacion, db_path=None):
    """Alias de get_paciente_by_identificacion para compatibilidad con la API"""
    return get_paciente_by_identificacion(identificacion, db_path)


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
        # Solo traer datos de SQLite (paciente y receta)
        query = "SELECT r.*, p.nombre as paciente_nombre, p.identificacion as paciente_identificacion FROM RECETA r JOIN PACIENTE p ON r.id_paciente = p.id_paciente"
        params = []
        if identificacion:
            query += " WHERE p.identificacion = ?"
            params.append(identificacion)
        query += " ORDER BY r.fecha_emision DESC LIMIT ?"
        params.append(limit)
        cur.execute(query, params)
        recetas = cur.fetchall()
        
        # Conectar a MySQL para obtener nombres de médicos y medicamentos
        try:
            mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
            mysql_cur = mysql_conn.cursor(dictionary=True)
            print(f"✅ Conectado a MySQL farmacia.sql")
            
            # Conectar a MySQL de médicos
            medicos_config = {
                'host': 'localhost',
                'user': 'root',
                'password': '',
                'database': 'medidino_medicos',
                'port': 3307
            }
            medicos_conn = mysql.connector.connect(**medicos_config)
            medicos_cur = medicos_conn.cursor(dictionary=True)
            print(f"✅ Conectado a MySQL medidino_medicos")
            
        except Exception as e:
            print(f"⚠️ Error conectando a MySQL: {e}")
            mysql_conn = None
            medicos_conn = None
        
        # Procesar cada receta
        for receta in recetas:
            id_receta = receta['id_receta']
            id_medico = receta.get('id_medico')
            
            # Obtener nombre del médico desde MySQL
            receta['medico_nombre'] = None
            if medicos_conn and id_medico:
                try:
                    medicos_cur.execute(
                        "SELECT m.nombre, m.apellido, e.nombre_especialidad FROM medicos m LEFT JOIN especialidades e ON m.id_especialidad = e.id_especialidad WHERE m.id_medico = %s",
                        (id_medico,)
                    )
                    medico = medicos_cur.fetchone()
                    if medico:
                        receta['medico_nombre'] = f"{medico.get('nombre', '')} {medico.get('apellido', '')}".strip()
                        receta['medico_especialidad'] = medico.get('nombre_especialidad', '')
                except Exception:
                    pass
            
            # Obtener detalles de medicamentos desde SQLite
            cur.execute(
                """SELECT d.* FROM DETALLE_RECETA d WHERE d.id_receta = ?""",
                (id_receta,)
            )
            detalles = cur.fetchall()
            
            # Para cada detalle, obtener el nombre del medicamento desde MySQL
            for detalle in detalles:
                id_medicamento = detalle.get('id_medicamento')
                detalle['medicamento_nombre'] = 'Medicamento no disponible'
                detalle['presentacion'] = None
                
                if mysql_conn and id_medicamento:
                    try:
                        mysql_cur.execute(
                            "SELECT nombre, tipo, dosis_recomendada FROM medicamento WHERE id_medicamento = %s",
                            (id_medicamento,)
                        )
                        med = mysql_cur.fetchone()
                        if med:
                            detalle['medicamento_nombre'] = med.get('nombre')
                            detalle['presentacion'] = med.get('tipo')  # Usar 'tipo' como presentación
                        else:
                            print(f"⚠️ Medicamento id={id_medicamento} no encontrado en MySQL")
                    except Exception as e:
                        print(f"❌ Error consultando medicamento: {e}")
            
            receta['detalles'] = detalles
        
        # Cerrar conexiones MySQL
        if mysql_conn:
            mysql_cur.close()
            mysql_conn.close()
        if medicos_conn:
            medicos_cur.close()
            medicos_conn.close()
        
        return recetas


def listar_medicamentos(term=None, solo_disponibles=False, limit=200, db_path=None):
    """
    Devuelve una lista de medicamentos desde la base de datos MySQL (farmacia).

    Args:
      term: filtro parcial por nombre (LIKE)
      solo_disponibles: si True, filtra por stock > 0
      limit: máximo de resultados
    """
    try:
        # Conectar a MySQL
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cur = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                id_medicamento as id,
                nombre,
                categoria,
                descripcion,
                dosis_recomendada,
                tipo,
                estado,
                fecha_vencimiento as vencimiento,
                stock,
                minimo_stock as stockMinimo
            FROM medicamento
            WHERE 1=1
        """
        params = []
        
        if term:
            query += " AND nombre LIKE %s"
            params.append(f"%{term}%")
        
        if solo_disponibles:
            query += " AND stock > 0"
        
        # Mostrar todos los medicamentos, sin filtrar por estado
        query += " ORDER BY nombre LIMIT %s"
        params.append(limit)
        
        cur.execute(query, params)
        medicamentos = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return medicamentos
        
    except Error as e:
        print(f"Error al consultar medicamentos de MySQL: {e}")
        # Fallback a SQLite si falla MySQL
        return listar_medicamentos_sqlite(term, solo_disponibles, limit, db_path)


def listar_medicamentos_sqlite(term=None, solo_disponibles=False, limit=200, db_path=None):
    """
    Versión original que consulta de SQLite (fallback).
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
        # Obtener datos de la receta con paciente (sin médico desde SQLite)
        cur.execute(
            "SELECT r.*, p.nombre AS paciente_nombre, p.identificacion AS paciente_identificacion "
            "FROM RECETA r "
            "JOIN PACIENTE p ON r.id_paciente = p.id_paciente "
            "WHERE r.id_receta = ?",
            (id_receta,)
        )
        receta = cur.fetchone()
        if not receta:
            return None

        # Obtener nombre del médico desde MySQL
        id_medico = receta.get('id_medico')
        receta['medico_nombre'] = None
        if id_medico:
            try:
                medicos_config = {
                    'host': 'localhost',
                    'user': 'root',
                    'password': '',
                    'database': 'medidino_medicos',
                    'port': 3307
                }
                medicos_conn = mysql.connector.connect(**medicos_config)
                medicos_cur = medicos_conn.cursor(dictionary=True)
                medicos_cur.execute(
                    "SELECT m.nombre, m.apellido, e.nombre_especialidad FROM medicos m LEFT JOIN especialidades e ON m.id_especialidad = e.id_especialidad WHERE m.id_medico = %s",
                    (id_medico,)
                )
                medico = medicos_cur.fetchone()
                if medico:
                    receta['medico_nombre'] = f"{medico.get('nombre', '')} {medico.get('apellido', '')}".strip()
                    receta['medico_especialidad'] = medico.get('nombre_especialidad', '')
                medicos_cur.close()
                medicos_conn.close()
            except Exception as e:
                print(f"⚠️ Error obteniendo médico: {e}")

        # Obtener detalles de la receta desde SQLite
        cur.execute(
            "SELECT d.* FROM DETALLE_RECETA d WHERE d.id_receta = ?",
            (id_receta,)
        )
        detalles = cur.fetchall()

        # Obtener nombres de medicamentos desde MySQL
        try:
            mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
            mysql_cur = mysql_conn.cursor(dictionary=True)
            
            for detalle in detalles:
                id_medicamento = detalle.get('id_medicamento')
                detalle['medicamento_nombre'] = 'Medicamento no disponible'
                detalle['presentacion'] = None
                
                if id_medicamento:
                    mysql_cur.execute(
                        "SELECT nombre, tipo FROM medicamento WHERE id_medicamento = %s",
                        (id_medicamento,)
                    )
                    med = mysql_cur.fetchone()
                    if med:
                        detalle['medicamento_nombre'] = med.get('nombre')
                        detalle['presentacion'] = med.get('tipo')
                    else:
                        print(f"⚠️ Medicamento id={id_medicamento} no encontrado en MySQL")
            
            mysql_cur.close()
            mysql_conn.close()
        except Exception as e:
            print(f"⚠️ Error obteniendo medicamentos: {e}")

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


def actualizar_receta_con_detalles(id_receta, payload, db_path=None):
    """
    Actualiza una receta existente y sus detalles.
    
    payload expected keys:
      - observaciones (opcional)
      - estado (opcional): Activa, Dispensada, Cancelada, Vencida
      - detalles (opcional): lista de detalles para reemplazar los existentes
    """
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        try:
            # Verificar que la receta existe
            cur.execute("SELECT * FROM RECETA WHERE id_receta = ?", (id_receta,))
            receta = cur.fetchone()
            if not receta:
                return None
            
            # Actualizar campos de la receta
            observaciones = payload.get('observaciones')
            estado = payload.get('estado')
            
            if observaciones is not None or estado is not None:
                updates = []
                params = []
                
                if observaciones is not None:
                    updates.append("observaciones = ?")
                    params.append(observaciones)
                    # Registrar cambio en historial
                    cur.execute(
                        "INSERT INTO HISTORIAL_CAMBIO_RECETA (id_receta, id_usuario, campo_modificado, valor_anterior, valor_nuevo, motivo) VALUES (?, ?, ?, ?, ?, ?)",
                        (id_receta, 1, 'observaciones', receta.get('observaciones'), observaciones, 'Edición de receta')
                    )
                
                if estado is not None:
                    updates.append("estado = ?")
                    params.append(estado)
                    # Registrar cambio en historial
                    cur.execute(
                        "INSERT INTO HISTORIAL_CAMBIO_RECETA (id_receta, id_usuario, campo_modificado, valor_anterior, valor_nuevo, motivo) VALUES (?, ?, ?, ?, ?, ?)",
                        (id_receta, 1, 'estado', receta.get('estado'), estado, 'Edición de receta')
                    )
                
                params.append(id_receta)
                query = f"UPDATE RECETA SET {', '.join(updates)} WHERE id_receta = ?"
                cur.execute(query, params)
            
            # Si se proporcionan nuevos detalles, eliminar los anteriores y crear los nuevos
            detalles = payload.get('detalles')
            if detalles is not None:
                # Registrar cambio de medicamentos en historial
                cur.execute("SELECT COUNT(*) as count FROM DETALLE_RECETA WHERE id_receta = ?", (id_receta,))
                count_anterior = cur.fetchone()['count']
                
                # Eliminar detalles existentes
                cur.execute("DELETE FROM DETALLE_RECETA WHERE id_receta = ?", (id_receta,))
                
                # Registrar en historial
                cur.execute(
                    "INSERT INTO HISTORIAL_CAMBIO_RECETA (id_receta, id_usuario, campo_modificado, valor_anterior, valor_nuevo, motivo) VALUES (?, ?, ?, ?, ?, ?)",
                    (id_receta, 1, 'medicamentos', f'{count_anterior} medicamentos', f'{len(detalles)} medicamentos', 'Actualización de medicamentos')
                )
                
                # Insertar nuevos detalles
                for det in detalles:
                    id_medicamento = det.get('id_medicamento')
                    if not id_medicamento:
                        nombre = det.get('medicamento_nombre') or det.get('medicamento')
                        if not nombre:
                            continue
                        
                        cur.execute("SELECT id_medicamento FROM MEDICAMENTO WHERE nombre = ?", (nombre,))
                        m = cur.fetchone()
                        if m:
                            id_medicamento = m['id_medicamento']
                        else:
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
            return {'id_receta': id_receta}
            
        except Exception:
            conn.rollback()
            raise


def eliminar_receta(id_receta, db_path=None):
    """
    Elimina una receta y todos sus detalles.
    
    Args:
        id_receta: ID de la receta a eliminar
    
    Returns:
        dict con resultado o None si no existe
    """
    with connect_db(db_path) as conn:
        cur = conn.cursor()
        try:
            # Verificar que la receta existe
            cur.execute("SELECT * FROM RECETA WHERE id_receta = ?", (id_receta,))
            receta = cur.fetchone()
            if not receta:
                return None
            
            # Eliminar detalles primero (restricción de clave foránea)
            cur.execute("DELETE FROM DETALLE_RECETA WHERE id_receta = ?", (id_receta,))
            
            # Eliminar notificaciones relacionadas
            cur.execute("DELETE FROM NOTIFICACION_RECETA WHERE id_receta = ?", (id_receta,))
            
            # Eliminar la receta
            cur.execute("DELETE FROM RECETA WHERE id_receta = ?", (id_receta,))
            
            conn.commit()
            return {'id_receta': id_receta, 'deleted': True}
            
        except Exception:
            conn.rollback()
            raise
