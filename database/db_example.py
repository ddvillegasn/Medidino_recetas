"""
Ejemplo de conexión y operaciones con la base de datos MediDino
Este archivo muestra cómo interactuar con la BD desde Python
"""

import sqlite3
from datetime import datetime, date
import json

class MediDinoDB:
    """Clase para gestionar operaciones con la base de datos MediDino"""
    
    def __init__(self, db_path='medidino.db'):
        """
        Inicializa la conexión a la base de datos
        
        Args:
            db_path (str): Ruta al archivo de la base de datos
        """
        self.db_path = db_path
        self.conn = None
        self.cursor = None
    
    def conectar(self):
        """Abre la conexión a la base de datos"""
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row  # Para acceder a columnas por nombre
            self.cursor = self.conn.cursor()
            # Activar foreign keys
            self.cursor.execute("PRAGMA foreign_keys = ON")
            print("✅ Conectado a la base de datos")
            return True
        except Exception as e:
            print(f"❌ Error al conectar: {e}")
            return False
    
    def desconectar(self):
        """Cierra la conexión a la base de datos"""
        if self.conn:
            self.conn.close()
            print("🔒 Conexión cerrada")
    
    # =====================================================
    # OPERACIONES CON PACIENTES
    # =====================================================
    
    def buscar_paciente(self, identificacion):
        """
        Busca un paciente por su identificación
        
        Args:
            identificacion (str): Número de identificación del paciente
        
        Returns:
            dict: Datos del paciente o None si no existe
        """
        try:
            self.cursor.execute("""
                SELECT * FROM PACIENTE WHERE identificacion = ?
            """, (identificacion,))
            
            resultado = self.cursor.fetchone()
            
            if resultado:
                return dict(resultado)
            return None
            
        except Exception as e:
            print(f"❌ Error al buscar paciente: {e}")
            return None
    
    def crear_paciente(self, datos):
        """
        Crea un nuevo paciente
        
        Args:
            datos (dict): Diccionario con los datos del paciente
                - nombre (str)
                - identificacion (str)
                - edad (int)
                - genero (str)
                - direccion (str)
                - telefono (str)
                - correo (str)
        
        Returns:
            int: ID del paciente creado o None si falla
        """
        try:
            self.cursor.execute("""
                INSERT INTO PACIENTE 
                (nombre, identificacion, edad, genero, direccion, telefono, correo)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                datos['nombre'],
                datos['identificacion'],
                datos.get('edad'),
                datos.get('genero'),
                datos.get('direccion'),
                datos.get('telefono'),
                datos.get('correo')
            ))
            
            self.conn.commit()
            paciente_id = self.cursor.lastrowid
            print(f"✅ Paciente creado con ID: {paciente_id}")
            return paciente_id
            
        except Exception as e:
            print(f"❌ Error al crear paciente: {e}")
            self.conn.rollback()
            return None
    
    # =====================================================
    # OPERACIONES CON RECETAS
    # =====================================================
    
    def crear_receta(self, id_paciente, id_medico, observaciones='', medicamentos=[]):
        """
        Crea una nueva receta con sus medicamentos
        
        Args:
            id_paciente (int): ID del paciente
            id_medico (int): ID del médico
            observaciones (str): Observaciones de la receta
            medicamentos (list): Lista de diccionarios con:
                - id_medicamento (int)
                - dosis (str)
                - frecuencia (str)
                - duracion (str)
                - indicaciones (str, opcional)
        
        Returns:
            dict: Datos de la receta creada o None si falla
        """
        try:
            # Generar número de receta
            year = datetime.now().year
            self.cursor.execute("""
                SELECT COUNT(*) as total FROM RECETA 
                WHERE strftime('%Y', fecha_emision) = ?
            """, (str(year),))
            
            count = self.cursor.fetchone()['total'] + 1
            numero_receta = f"RX-{year}-{count:05d}"
            
            # Crear la receta
            self.cursor.execute("""
                INSERT INTO RECETA 
                (fecha_emision, observaciones, estado, id_paciente, id_medico, numero_receta)
                VALUES (DATE('now'), ?, 'Activa', ?, ?, ?)
            """, (observaciones, id_paciente, id_medico, numero_receta))
            
            receta_id = self.cursor.lastrowid
            
            # Agregar medicamentos
            for med in medicamentos:
                self.cursor.execute("""
                    INSERT INTO DETALLE_RECETA 
                    (id_receta, id_medicamento, dosis, frecuencia, duracion, indicaciones)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    receta_id,
                    med['id_medicamento'],
                    med['dosis'],
                    med['frecuencia'],
                    med['duracion'],
                    med.get('indicaciones', '')
                ))
            
            self.conn.commit()
            
            print(f"✅ Receta creada: {numero_receta}")
            
            return {
                'id_receta': receta_id,
                'numero_receta': numero_receta,
                'fecha_emision': date.today().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Error al crear receta: {e}")
            self.conn.rollback()
            return None
    
    def obtener_recetas_paciente(self, identificacion):
        """
        Obtiene todas las recetas de un paciente
        
        Args:
            identificacion (str): Identificación del paciente
        
        Returns:
            list: Lista de recetas
        """
        try:
            self.cursor.execute("""
                SELECT 
                    r.id_receta,
                    r.numero_receta,
                    r.fecha_emision,
                    r.estado,
                    r.observaciones,
                    m.nombre as medico_nombre,
                    m.especialidad
                FROM RECETA r
                JOIN MEDICO m ON r.id_medico = m.id_medico
                WHERE r.id_paciente = (
                    SELECT id_paciente FROM PACIENTE WHERE identificacion = ?
                )
                ORDER BY r.fecha_emision DESC
            """, (identificacion,))
            
            return [dict(row) for row in self.cursor.fetchall()]
            
        except Exception as e:
            print(f"❌ Error al obtener recetas: {e}")
            return []
    
    def obtener_detalle_receta(self, numero_receta):
        """
        Obtiene el detalle completo de una receta
        
        Args:
            numero_receta (str): Número de la receta
        
        Returns:
            dict: Información completa de la receta
        """
        try:
            # Información general
            self.cursor.execute("""
                SELECT 
                    r.*,
                    p.nombre as paciente_nombre,
                    p.identificacion as paciente_id,
                    m.nombre as medico_nombre,
                    m.especialidad
                FROM RECETA r
                JOIN PACIENTE p ON r.id_paciente = p.id_paciente
                JOIN MEDICO m ON r.id_medico = m.id_medico
                WHERE r.numero_receta = ?
            """, (numero_receta,))
            
            receta = dict(self.cursor.fetchone())
            
            # Medicamentos
            self.cursor.execute("""
                SELECT 
                    med.nombre as medicamento,
                    med.concentracion,
                    dr.dosis,
                    dr.frecuencia,
                    dr.duracion,
                    dr.indicaciones
                FROM DETALLE_RECETA dr
                JOIN MEDICAMENTO med ON dr.id_medicamento = med.id_medicamento
                WHERE dr.id_receta = ?
            """, (receta['id_receta'],))
            
            receta['medicamentos'] = [dict(row) for row in self.cursor.fetchall()]
            
            return receta
            
        except Exception as e:
            print(f"❌ Error al obtener detalle: {e}")
            return None
    
    # =====================================================
    # OPERACIONES CON MEDICAMENTOS
    # =====================================================
    
    def buscar_medicamentos(self, termino=''):
        """
        Busca medicamentos por nombre
        
        Args:
            termino (str): Término de búsqueda
        
        Returns:
            list: Lista de medicamentos
        """
        try:
            self.cursor.execute("""
                SELECT 
                    id_medicamento,
                    nombre,
                    descripcion,
                    concentracion,
                    presentacion
                FROM MEDICAMENTO
                WHERE nombre LIKE ? AND activo = 1
                ORDER BY nombre
            """, (f'%{termino}%',))
            
            return [dict(row) for row in self.cursor.fetchall()]
            
        except Exception as e:
            print(f"❌ Error al buscar medicamentos: {e}")
            return []
    
    def obtener_inventario_medicamento(self, id_medicamento):
        """
        Obtiene el inventario de un medicamento
        
        Args:
            id_medicamento (int): ID del medicamento
        
        Returns:
            dict: Información del inventario
        """
        try:
            self.cursor.execute("""
                SELECT 
                    i.*,
                    m.nombre as medicamento
                FROM INVENTARIO i
                JOIN MEDICAMENTO m ON i.id_medicamento = m.id_medicamento
                WHERE i.id_medicamento = ?
            """, (id_medicamento,))
            
            resultado = self.cursor.fetchone()
            return dict(resultado) if resultado else None
            
        except Exception as e:
            print(f"❌ Error al obtener inventario: {e}")
            return None


# =====================================================
# EJEMPLO DE USO
# =====================================================

def ejemplo_uso():
    """Ejemplo de cómo usar la clase MediDinoDB"""
    
    # Crear instancia y conectar
    db = MediDinoDB('medidino.db')
    db.conectar()
    
    print("\n" + "="*60)
    print("📋 EJEMPLO DE USO DE LA BASE DE DATOS")
    print("="*60)
    
    # 1. Buscar un paciente
    print("\n1️⃣ Buscando paciente con ID 1234567...")
    paciente = db.buscar_paciente('1234567')
    if paciente:
        print(f"   ✅ Encontrado: {paciente['nombre']}")
    
    # 2. Buscar medicamentos
    print("\n2️⃣ Buscando medicamentos con 'ibu'...")
    medicamentos = db.buscar_medicamentos('ibu')
    for med in medicamentos:
        print(f"   💊 {med['nombre']} - {med['concentracion']}")
    
    # 3. Crear una receta de ejemplo
    print("\n3️⃣ Creando receta de ejemplo...")
    receta = db.crear_receta(
        id_paciente=paciente['id_paciente'],
        id_medico=1,
        observaciones='Control de dolor',
        medicamentos=[
            {
                'id_medicamento': 1,  # Ibuprofeno
                'dosis': '400mg',
                'frecuencia': 'Cada 8 horas',
                'duracion': '5 días',
                'indicaciones': 'Tomar después de las comidas'
            },
            {
                'id_medicamento': 4,  # Omeprazol
                'dosis': '20mg',
                'frecuencia': 'Cada 24 horas',
                'duracion': '5 días',
                'indicaciones': 'Tomar en ayunas'
            }
        ]
    )
    
    if receta:
        print(f"   ✅ Receta creada: {receta['numero_receta']}")
        
        # 4. Obtener detalle de la receta
        print("\n4️⃣ Obteniendo detalle de la receta...")
        detalle = db.obtener_detalle_receta(receta['numero_receta'])
        if detalle:
            print(f"   📄 Paciente: {detalle['paciente_nombre']}")
            print(f"   👨‍⚕️ Médico: {detalle['medico_nombre']}")
            print(f"   📅 Fecha: {detalle['fecha_emision']}")
            print(f"   💊 Medicamentos:")
            for med in detalle['medicamentos']:
                print(f"      - {med['medicamento']}: {med['dosis']}, {med['frecuencia']}")
    
    # 5. Obtener historial de recetas del paciente
    print(f"\n5️⃣ Historial de recetas del paciente {paciente['nombre']}...")
    recetas = db.obtener_recetas_paciente('1234567')
    print(f"   📋 Total de recetas: {len(recetas)}")
    for r in recetas:
        print(f"      - {r['numero_receta']} ({r['fecha_emision']}) - Estado: {r['estado']}")
    
    # Desconectar
    db.desconectar()
    
    print("\n" + "="*60)
    print("✅ Ejemplo completado")
    print("="*60)


if __name__ == "__main__":
    ejemplo_uso()
