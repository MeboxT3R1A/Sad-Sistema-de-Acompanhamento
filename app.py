from flask import Flask, render_template, jsonify, request
from Bd import * 
app = Flask(__name__)

# --- ROTAS DE PÁGINAS (HTML) ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/documentos')
def documentos():
    return render_template('documentos.html')

@app.route('/registros')
def registros():
    return render_template('registros.html')

@app.route('/relatorios')
def relatorios():
    return render_template('relatorios.html')


# --- ROTAS DA API (DADOS JSON) ---

@app.route("/api/alunos")
def get_alunos():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM alunos")
    alunos = cursor.fetchall()
    return jsonify(alunos)


@app.route("/api/documentos", methods=['GET'])
def listar_documentos():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    sql = """
        SELECT 
            a.id, 
            a.nome, 
            d.rg_entregue, 
            d.cpf_entregue, 
            d.foto_entregue, 
            d.historico_entregue, 
            d.comprovante_entregue,
            d.certidao_entregue,
            d.certificado_entregue,
            d.diploma_entregue
        FROM alunos a
        LEFT JOIN documentos_aluno d ON a.id = d.aluno_id
    """
    cursor.execute(sql)
    dados = cursor.fetchall()
    conn.close()
    
    lista_formatada = []
    for aluno in dados:
        lista_formatada.append({
            "id": aluno["id"],
            "nome": aluno["nome"],
            "rg": bool(aluno.get("rg_entregue")),
            "cpf": bool(aluno.get("cpf_entregue")),
            "foto": bool(aluno.get("foto_entregue")),
            "historico": bool(aluno.get("historico_entregue")),
            "endereco": bool(aluno.get("comprovante_entregue")), 
            "certidao": bool(aluno.get("certidao_entregue")),
            "certificado": bool(aluno.get("certificado_entregue")),
            "diploma": bool(aluno.get("diploma_entregue"))
        })
        
    return jsonify(lista_formatada)

@app.route("/api/documentos/<int:aluno_id>", methods=['PUT'])
def salvar_documentos(aluno_id):
    data = request.json 
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Verifica se existe
    cursor.execute("SELECT id FROM documentos_aluno WHERE aluno_id = %s", (aluno_id,))
    existe = cursor.fetchone()
    
    rg = data.get('rg', False)
    cpf = data.get('cpf', False)
    foto = data.get('foto', False)
    historico = data.get('historico', False)
    comprovante = data.get('endereco', False)
    certidao = data.get('certidao', False)   
    certificado = data.get('certificado', False)
    diploma = data.get('diploma', False)        
    
    if existe:
        sql = """
            UPDATE documentos_aluno 
            SET rg_entregue=%s, cpf_entregue=%s, foto_entregue=%s, 
                historico_entregue=%s, comprovante_entregue=%s,
                certidao_entregue=%s, certificado_entregue=%s, diploma_entregue=%s,
                data_verificacao=CURDATE()
            WHERE aluno_id=%s
        """
        cursor.execute(sql, (rg, cpf, foto, historico, comprovante, certidao, certificado, diploma, aluno_id))
    else:
        sql = """
            INSERT INTO documentos_aluno 
            (aluno_id, rg_entregue, cpf_entregue, foto_entregue, 
             historico_entregue, comprovante_entregue, 
             certidao_entregue, certificado_entregue, diploma_entregue, 
             data_verificacao)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURDATE())
        """
        cursor.execute(sql, (aluno_id, rg, cpf, foto, historico, comprovante, certidao, certificado, diploma))
    
    conn.commit()
    conn.close()
    return jsonify({"mensagem": "Documentos salvos com sucesso!"})


@app.route("/api/relatorios")
def get_relatorios_data():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT status, COUNT(*) as total FROM alunos GROUP BY status")
    stats_raw = cursor.fetchall()
    
    resumo = {'total': 0, 'ativo': 0, 'concluido': 0, 'evadido': 0}
    for item in stats_raw:
        s = item['status']
        qtd = item['total']
        if s in resumo:
            resumo[s] = qtd
        resumo['total'] += qtd

    cursor.execute("SELECT curso, status, COUNT(*) as total FROM alunos GROUP BY curso, status")
    cursos_raw = cursor.fetchall()
    
    cursos_dict = {}
    for row in cursos_raw:
        nome_curso = row['curso']
        status = row['status']
        qtd = row['total']
        
        if nome_curso not in cursos_dict:
            cursos_dict[nome_curso] = {'total': 0, 'ativo': 0, 'concluido': 0, 'evadido': 0}
            
        cursos_dict[nome_curso]['total'] += qtd
        if status in cursos_dict[nome_curso]:
            cursos_dict[nome_curso][status] += qtd

    cursor.execute("SELECT turma, status, COUNT(*) as total FROM alunos GROUP BY turma, status")
    turmas_raw = cursor.fetchall()
    
    turmas_dict = {}
    for row in turmas_raw:
        nome_turma = row['turma']
        if not nome_turma: continue # Pula se turma for vazia/nula
        
        status = row['status']
        qtd = row['total']
        
        if nome_turma not in turmas_dict:
            turmas_dict[nome_turma] = {'total': 0, 'ativo': 0, 'concluido': 0, 'evadido': 0}
            
        turmas_dict[nome_turma]['total'] += qtd
        if status in turmas_dict[nome_turma]:
            turmas_dict[nome_turma][status] += qtd

    conn.close()

    return jsonify({
        "resumo": resumo,
        "cursos": cursos_dict,
        "turmas": turmas_dict
    })


if __name__ == '__main__':
    app.run(debug=True)