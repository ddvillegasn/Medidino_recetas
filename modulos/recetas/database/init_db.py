"""
MediDino Database Initializer
Script para crear e inicializar la base de datos SQLite de MediDino
"""

import sqlite3
import os
from datetime import datetime

def crear_base_datos(db_path='medidino.db'):
    """
    Crea la base de datos SQLite y ejecuta el script schema.sql
    
    Args:
        db_path (str): Ruta donde se creará la base de datos
    
    Returns:
        bool: True si se creó exitosamente, False en caso contrario
    """
    try:
        # Verificar si existe el archivo schema.sql
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        
        if not os.path.exists(schema_path):
            print(f"❌ Error: No se encuentra el archivo schema.sql en {schema_path}")
            return False
        
        # Crear conexión a la base de datos
        print(f"📁 Creando base de datos en: {db_path}")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Leer y ejecutar el script SQL
        print("📄 Leyendo schema.sql...")
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        # Ejecutar el script (sqlite3 puede ejecutar múltiples statements)
        print("⚙️  Ejecutando script de creación...")
        cursor.executescript(schema_sql)
        
        # Confirmar cambios
        conn.commit()
        
        # Verificar tablas creadas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tablas = cursor.fetchall()
        
        print("\n✅ Base de datos creada exitosamente!")
        print(f"\n📊 Tablas creadas ({len(tablas)}):")
        for tabla in tablas:
            cursor.execute(f"SELECT COUNT(*) FROM {tabla[0]}")
            count = cursor.fetchone()[0]
            print(f"   - {tabla[0]}: {count} registros")
        
        # Verificar vistas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name")
        vistas = cursor.fetchall()
        
        if vistas:
            print(f"\n👁️  Vistas creadas ({len(vistas)}):")
            for vista in vistas:
                print(f"   - {vista[0]}")
        
        # Verificar triggers
        cursor.execute("SELECT name FROM sqlite_master WHERE type='trigger' ORDER BY name")
        triggers = cursor.fetchall()
        
        if triggers:
            print(f"\n⚡ Triggers creados ({len(triggers)}):")
            for trigger in triggers:
                print(f"   - {trigger[0]}")
        
        # Cerrar conexión
        conn.close()
        
        print(f"\n🎉 Base de datos lista para usar: {os.path.abspath(db_path)}")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Error de SQLite: {e}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False


def verificar_base_datos(db_path='medidino.db'):
    """
    Verifica la integridad de la base de datos
    
    Args:
        db_path (str): Ruta de la base de datos
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("\n🔍 Verificando integridad de la base de datos...")
        
        # Verificar integridad
        cursor.execute("PRAGMA integrity_check")
        resultado = cursor.fetchone()[0]
        
        if resultado == 'ok':
            print("✅ Integridad: OK")
        else:
            print(f"⚠️  Problemas de integridad: {resultado}")
        
        # Verificar foreign keys
        cursor.execute("PRAGMA foreign_keys")
        fk_status = cursor.fetchone()[0]
        print(f"🔗 Foreign Keys: {'Activadas' if fk_status else 'Desactivadas'}")
        
        # Mostrar estadísticas
        cursor.execute("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()")
        size = cursor.fetchone()[0]
        print(f"💾 Tamaño de la base de datos: {size / 1024:.2f} KB")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error al verificar: {e}")


def mostrar_datos_ejemplo(db_path='medidino.db'):
    """
    Muestra algunos datos de ejemplo de la base de datos
    
    Args:
        db_path (str): Ruta de la base de datos
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("\n📋 Datos de ejemplo cargados:")
        
        # Mostrar pacientes
        print("\n👥 PACIENTES:")
        cursor.execute("SELECT identificacion, nombre, telefono FROM PACIENTE LIMIT 5")
        for row in cursor.fetchall():
            print(f"   - {row[0]}: {row[1]} ({row[2]})")
        
        # Mostrar médicos
        print("\n👨‍⚕️ MÉDICOS:")
        cursor.execute("SELECT nombre, especialidad, correo FROM MEDICO LIMIT 5")
        for row in cursor.fetchall():
            print(f"   - {row[0]} - {row[1]}")
        
        # Mostrar medicamentos
        print("\n💊 MEDICAMENTOS:")
        cursor.execute("SELECT nombre, concentracion, presentacion FROM MEDICAMENTO LIMIT 5")
        for row in cursor.fetchall():
            print(f"   - {row[0]} ({row[1]}, {row[2]})")
        
        # Mostrar inventario
        print("\n📦 INVENTARIO:")
        cursor.execute("""
            SELECT m.nombre, i.cantidad_actual, i.cantidad_minima, i.ubicacion 
            FROM INVENTARIO i 
            JOIN MEDICAMENTO m ON i.id_medicamento = m.id_medicamento
            LIMIT 5
        """)
        for row in cursor.fetchall():
            estado = "⚠️ BAJO" if row[1] <= row[2] else "✅"
            print(f"   {estado} {row[0]}: {row[1]} unidades (ubicación: {row[3]})")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error al mostrar datos: {e}")


def main():
    """Función principal"""
    print("=" * 60)
    print("🦕 MediDino - Inicializador de Base de Datos")
    print("=" * 60)
    
    # Ruta de la base de datos
    db_path = os.path.join(os.path.dirname(__file__), 'medidino.db')
    
    # Preguntar si sobrescribir si ya existe
    if os.path.exists(db_path):
        respuesta = input(f"\n⚠️  La base de datos '{db_path}' ya existe. ¿Desea sobrescribirla? (s/n): ")
        if respuesta.lower() != 's':
            print("❌ Operación cancelada.")
            return
        os.remove(db_path)
        print("🗑️  Base de datos anterior eliminada.")
    
    # Crear base de datos
    if crear_base_datos(db_path):
        # Verificar integridad
        verificar_base_datos(db_path)
        
        # Mostrar datos de ejemplo
        mostrar_datos_ejemplo(db_path)
        
        print("\n" + "=" * 60)
        print("✅ Proceso completado exitosamente")
        print("=" * 60)
        print(f"\n💡 Puedes conectarte a la base de datos usando:")
        print(f"   sqlite3 {os.path.basename(db_path)}")
        print("\n💡 O desde Python:")
        print(f"   import sqlite3")
        print(f"   conn = sqlite3.connect('{os.path.basename(db_path)}')")
    else:
        print("\n❌ No se pudo crear la base de datos")


if __name__ == "__main__":
    main()
