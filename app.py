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


# Busca todos os alunos e junta com a tabela de documentos
@app.route("/api/documentos", methods=['GET'])
def listar_documentos():
    sql = """
        SELECT 
            a.id, 
            a.nome, 
            d.rg_entregue, 
            d.cpf_entregue, 
            d.foto_entregue, 
            d.historico_entregue, 
            d.comprovante_entregue,
            d.certidao_entregue,     -- Novo
            d.certificado_entregue,  -- Novo
            d.diploma_entregue       -- Novo
        FROM alunos a
        LEFT JOIN documentos_aluno d ON a.id = d.aluno_id
    """
    dados = query(sql)
    
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

# Recebe os dados do checkbox e salva no banco
@app.route("/api/documentos/<int:aluno_id>", methods=['PUT'])
def salvar_documentos(aluno_id):
    data = request.json 
    
    check_sql = "SELECT id FROM documentos_aluno WHERE aluno_id = %s"
    existe = query(check_sql, (aluno_id,))
    
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
        execute(sql, (rg, cpf, foto, historico, comprovante, certidao, certificado, diploma, aluno_id))
    else:
        sql = """
            INSERT INTO documentos_aluno 
            (aluno_id, rg_entregue, cpf_entregue, foto_entregue, 
             historico_entregue, comprovante_entregue, 
             certidao_entregue, certificado_entregue, diploma_entregue, 
             data_verificacao)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURDATE())
        """
        execute(sql, (aluno_id, rg, cpf, foto, historico, comprovante, certidao, certificado, diploma))
        
    return jsonify({"mensagem": "Documentos salvos com sucesso!"})

if __name__ == '__main__':
    app.run(debug=True)