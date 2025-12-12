from flask import Flask, render_template, jsonify, request
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

@app.route("/api/alunos", methods=["POST"])
def create_aluno():
    data = request.get_json() or {}

    # Mapeamento Front -> Banco
    aluno = {
        "cpf": data.get("cpf"),
        "nome": data.get("nome"),
        "data_nascimento": data.get("dataNascimento") or None,  # aceitar None
        "identidade": data.get("rg"),
        "telefone": data.get("telefone"),
        "email": data.get("email"),
        "curso": data.get("curso"),
        "turma": data.get("turma"),
    }

    # Validação mínima
    obrig = ["cpf", "nome", "identidade", "curso"]
    faltando = [f for f in obrig if not aluno.get(f)]
    if faltando:
        return jsonify({"erro": f"Campos obrigatórios faltando: {faltando}"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
            INSERT INTO alunos
            (cpf, nome, data_nascimento, identidade, telefone, email, curso, turma)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """
        values = (
            aluno["cpf"],
            aluno["nome"],
            aluno["data_nascimento"],
            aluno["identidade"],
            aluno["telefone"],
            aluno["email"],
            aluno["curso"],
            aluno["turma"],
        )

        cursor.execute(sql, values)
        conn.commit()

        new_id = cursor.lastrowid

        # Monta o objeto de resposta explicitamente (MySQL não tem RETURNING)
        resposta = {
            "id": new_id,
            "cpf": aluno["cpf"],
            "nome": aluno["nome"],
            "data_nascimento": aluno["data_nascimento"],
            "identidade": aluno["identidade"],
            "telefone": aluno["telefone"],
            "email": aluno["email"],
            "curso": aluno["curso"],
            "turma": aluno["turma"],
            "status": data.get("status", "ativo")  # só devolve ao front, não grava no banco
        }

        return jsonify(resposta), 201

    except Exception as e:
        # Log explícito para o terminal — importante para debugar 500
        import traceback
        print("ERRO NO INSERT:", e)
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500



if __name__ == '__main__':
	app.run(debug=True)
