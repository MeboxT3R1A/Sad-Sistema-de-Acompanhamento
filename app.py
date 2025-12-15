from flask import Flask, render_template, jsonify, request
from Bd import * 
import json
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

# Rota GET para buscar todos os alunos
@app.route("/api/alunos")
def get_alunos():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM alunos")
    alunos = cursor.fetchall()
    conn.close()
    return jsonify(alunos)

# Rota GET para buscar aluno específico por ID
@app.route("/api/alunos/<int:aluno_id>", methods=['GET'])
def get_aluno(aluno_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM alunos WHERE id = %s", (aluno_id,))
    aluno = cursor.fetchone()
    conn.close()
    
    if aluno:
        return jsonify(aluno)
    else:
        return jsonify({"erro": "Aluno não encontrado"}), 404

# Rota POST para criar novo aluno
@app.route("/api/alunos", methods=['POST'])
def criar_aluno():
    data = request.json
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        sql = """
            INSERT INTO alunos 
            (cpf, nome, data_nascimento, nacionalidade, naturalidade, uf,
             identidade, expedidor, data_expedicao, telefone, email, 
             curso, turma, data_conclusao, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        params = (
            data.get('cpf'),
            data.get('nome'),
            data.get('dataNascimento'),
            data.get('nacionalidade', 'Brasileiro'),
            data.get('naturalidade', ''),
            data.get('uf', ''),
            data.get('rg', ''),
            data.get('expedidor', ''),
            data.get('dataExpedicao'),
            data.get('telefone'),
            data.get('email', ''),
            data.get('curso'),
            data.get('turma'),
            data.get('dataMatricula'),
            data.get('status', 'ativo')
        )
        
        cursor.execute(sql, params)
        aluno_id = cursor.lastrowid
        
        # Se houver dados dos pais, inserir na tabela responsaveis
        nome_mae = data.get('nomeMae', '')
        nome_pai = data.get('nomePai', '')
        
        if nome_mae or nome_pai:
            cursor.execute(
                "INSERT INTO responsaveis (aluno_id, filiacao1, filiacao2) VALUES (%s, %s, %s)",
                (aluno_id, nome_pai, nome_mae)
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({"id": aluno_id, "mensagem": "Aluno criado com sucesso!"}), 201
        
    except Exception as e:
        return jsonify({"erro": str(e)}), 400

# Rota PUT para atualizar aluno
@app.route("/api/alunos/<int:aluno_id>", methods=['PUT'])
def atualizar_aluno(aluno_id):
    data = request.json
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        sql = """
            UPDATE alunos 
            SET cpf = %s, 
                nome = %s, 
                data_nascimento = %s,
                nacionalidade = %s,
                naturalidade = %s,
                uf = %s,
                identidade = %s,
                expedidor = %s,
                data_expedicao = %s,
                telefone = %s,
                email = %s,
                curso = %s,
                turma = %s,
                data_conclusao = %s,
                status = %s,
                updated_at = NOW()
            WHERE id = %s
        """
        
        params = (
            data.get('cpf'),
            data.get('nome'),
            data.get('dataNascimento'),
            data.get('nacionalidade', 'Brasileiro'),
            data.get('naturalidade', ''),
            data.get('uf', ''),
            data.get('rg', ''),
            data.get('expedidor', ''),
            data.get('dataExpedicao'),
            data.get('telefone'),
            data.get('email', ''),
            data.get('curso'),
            data.get('turma'),
            data.get('dataMatricula'),
            data.get('status', 'ativo'),
            aluno_id
        )
        
        cursor.execute(sql, params)
        
        # Atualizar responsáveis
        nome_mae = data.get('nomeMae', '')
        nome_pai = data.get('nomePai', '')
        
        cursor.execute("SELECT id FROM responsaveis WHERE aluno_id = %s", (aluno_id,))
        responsavel = cursor.fetchone()
        
        if responsavel:
            cursor.execute(
                "UPDATE responsaveis SET filiacao1 = %s, filiacao2 = %s WHERE aluno_id = %s",
                (nome_pai, nome_mae, aluno_id)
            )
        elif nome_mae or nome_pai:
            cursor.execute(
                "INSERT INTO responsaveis (aluno_id, filiacao1, filiacao2) VALUES (%s, %s, %s)",
                (aluno_id, nome_pai, nome_mae)
            )
        
        # Registrar alteração no histórico
        cursor.execute(
            "INSERT INTO historico_alteracoes (aluno_id, campo_alterado) VALUES (%s, %s)",
            (aluno_id, "Dados cadastrais atualizados")
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({"mensagem": "Aluno atualizado com sucesso!"}), 200
        
    except Exception as e:
        return jsonify({"erro": str(e)}), 400

# Rota DELETE para excluir aluno
@app.route("/api/alunos/<int:aluno_id>", methods=['DELETE'])
def excluir_aluno(aluno_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM alunos WHERE id = %s", (aluno_id,))
        conn.commit()
        conn.close()
        
        return jsonify({"mensagem": "Aluno excluído com sucesso!"}), 200
        
    except Exception as e:
        return jsonify({"erro": str(e)}), 400

# Rota GET para documentos com busca aprimorada
@app.route("/api/documentos", methods=['GET'])
def listar_documentos():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Parâmetros de busca
    busca = request.args.get('busca', '').lower()
    curso = request.args.get('curso', '')
    turma = request.args.get('turma', '')
    
    sql = """
        SELECT 
            a.id, 
            a.nome,
            a.cpf,
            a.identidade as rg,
            a.curso,
            a.turma,
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
        WHERE 1=1
    """
    
    params = []
    
    if busca:
        sql += " AND (LOWER(a.nome) LIKE %s OR a.cpf LIKE %s OR a.identidade LIKE %s OR LOWER(a.curso) LIKE %s OR LOWER(a.turma) LIKE %s)"
        busca_param = f"%{busca}%"
        params.extend([busca_param, busca_param, busca_param, busca_param, busca_param])
    
    if curso:
        sql += " AND LOWER(a.curso) = %s"
        params.append(curso.lower())
    
    if turma:
        sql += " AND LOWER(a.turma) = %s"
        params.append(turma.lower())
    
    sql += " ORDER BY a.nome"
    
    cursor.execute(sql, tuple(params))
    dados = cursor.fetchall()
    conn.close()
    
    lista_formatada = []
    for aluno in dados:
        lista_formatada.append({
            "id": aluno["id"],
            "nome": aluno["nome"],
            "cpf": aluno["cpf"],
            "rg": aluno["rg"],
            "curso": aluno["curso"],
            "turma": aluno["turma"],
            "rg_entregue": bool(aluno.get("rg_entregue")),
            "cpf_entregue": bool(aluno.get("cpf_entregue")),
            "foto_entregue": bool(aluno.get("foto_entregue")),
            "historico_entregue": bool(aluno.get("historico_entregue")),
            "endereco_entregue": bool(aluno.get("comprovante_entregue")), 
            "certidao_entregue": bool(aluno.get("certidao_entregue")),
            "certificado_entregue": bool(aluno.get("certificado_entregue")),
            "diploma_entregue": bool(aluno.get("diploma_entregue"))
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