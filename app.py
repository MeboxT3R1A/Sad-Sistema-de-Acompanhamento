from flask import Flask, render_template, jsonify
from Bd import *
app = Flask(__name__)


@app.route('/')
def index():
	# Usa o template existente templates/index.html se houver
	return render_template('index.html')

	
@app.route('/documentos')
def documentos():
    return render_template('documentos.html')

	
@app.route('/resgistros')
def registros():
    return render_template('registros.html')



@app.route('/relatorios')
def relatorios():
    return render_template('relatorios.html')

@app.route("/api/alunos")
def get_alunos():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM alunos")
    alunos = cursor.fetchall()
    return jsonify(alunos)

if __name__ == '__main__':
	app.run(debug=True)
