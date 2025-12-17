import mysql.connector

def get_connection():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="12345",
        database="bd_diplomas"
    )
    return conn

def query(sql, params=None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(sql, params or ())
    dados = cursor.fetchall()
    conn.close()
    return dados

def execute(sql, params=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(sql, params or ())
    conn.commit()
    conn.close()
