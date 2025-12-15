from flask import Flask, render_template, jsonify, request
from Bd import * 
app = Flask(__name__)
import math

# ========== FUNÇÃO DE PAGINAÇÃO CENTRALIZADA ==========
def paginate_query(base_query, count_query, params=None, page=1, per_page=15, search=None, search_fields=None):
    """
    Função centralizada para paginação de qualquer query
    
    Args:
        base_query: Query SQL principal (sem LIMIT/OFFSET)
        count_query: Query para contar total
        params: Parâmetros da query
        page: Número da página
        per_page: Itens por página
        search: Termo de busca
        search_fields: Lista de campos para busca
    
    Returns:
        dict com dados paginados
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Parâmetros iniciais
        final_params = list(params) if params else []
        where_clauses = []
        
        # Adicionar filtro de busca se existir
        if search and search_fields:
            search_conditions = []
            search_param = f"%{search}%"
            
            for field in search_fields:
                search_conditions.append(f"LOWER({field}) LIKE %s")
                final_params.append(search_param)
            
            if search_conditions:
                where_clauses.append("(" + " OR ".join(search_conditions) + ")")
        
        # Adicionar WHERE às queries
        if where_clauses:
            where_sql = " WHERE " + " AND ".join(where_clauses)
            base_query += where_sql
            count_query += where_sql
        
        # Calcular offset
        offset = (page - 1) * per_page
        
        # 1. Contar total
        cursor.execute(count_query, tuple(final_params))
        total_result = cursor.fetchone()
        total_items = total_result['total'] if total_result else 0
        total_pages = math.ceil(total_items / per_page) if per_page > 0 else 1
        
        # 2. Buscar dados paginados
        paginated_query = f"{base_query} LIMIT %s OFFSET %s"
        final_params.extend([per_page, offset])
        
        cursor.execute(paginated_query, tuple(final_params))
        items = cursor.fetchall()
        
        conn.close()
        
        return {
            'items': items,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_items,
                'total_pages': total_pages,
                'has_prev': page > 1,
                'has_next': page < total_pages
            }
        }
        
    except Exception as e:
        print(f"Erro na paginação: {e}")
        return {'items': [], 'pagination': {}}

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

# Rota GET para buscar alunos COM PAGINAÇÃO
@app.route("/api/alunos")
def get_alunos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '').lower()
    
    base_query = "SELECT * FROM alunos"
    count_query = "SELECT COUNT(*) as total FROM alunos"
    search_fields = ['nome', 'cpf', 'curso', 'turma', 'identidade']
    
    result = paginate_query(
        base_query=base_query,
        count_query=count_query,
        page=page,
        per_page=per_page,
        search=search,
        search_fields=search_fields
    )
    
    return jsonify({
        'alunos': result['items'],
        'pagination': result['pagination']
    })

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
@app.route("/api/documentos")
def listar_documentos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '').lower()
    
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
    """
    
    count_sql = "SELECT COUNT(*) as total FROM alunos a LEFT JOIN documentos_aluno d ON a.id = d.aluno_id"
    search_fields = ['a.nome', 'a.cpf', 'a.identidade', 'a.curso', 'a.turma']
    
    result = paginate_query(
        base_query=sql,
        count_query=count_sql,
        page=page,
        per_page=per_page,
        search=search,
        search_fields=search_fields
    )
    
    # Formatar dados
    lista_formatada = []
    for aluno in result['items']:
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
    
    return jsonify({
        'documentos': lista_formatada,
        'pagination': result['pagination']
    })

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
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    table_type = request.args.get('table', '')  # Vazio para primeira carga
    search = request.args.get('search', '').lower()  # Parâmetro de busca
    
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Estatísticas gerais (sem paginação)
    cursor.execute("SELECT status, COUNT(*) as total FROM alunos GROUP BY status")
    stats_raw = cursor.fetchall()
    
    resumo = {'total': 0, 'ativo': 0, 'concluido': 0, 'evadido': 0}
    for item in stats_raw:
        s = item['status']
        qtd = item['total']
        if s in resumo:
            resumo[s] = qtd
        resumo['total'] += qtd

    # Se table_type estiver vazio (primeira carga), retornar dados para AMBAS as tabelas
    if not table_type:
        # Para primeira carga, se per_page for muito grande (ex: 1000), retornar tudo
        if per_page >= 1000:
            # ========== TODOS OS CURSOS (sem paginação) ==========
            sql_cursos = """
                SELECT 
                    curso,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativo,
                    SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluido,
                    SUM(CASE WHEN status = 'evadido' THEN 1 ELSE 0 END) as evadido
                FROM alunos 
                WHERE curso IS NOT NULL AND curso != ''
                GROUP BY curso
                ORDER BY curso
            """
            cursor.execute(sql_cursos)
            cursos_raw = cursor.fetchall()
            
            cursos_dict = {}
            for row in cursos_raw:
                nome_curso = row['curso']
                cursos_dict[nome_curso] = {
                    'total': row['total'],
                    'ativo': row['ativo'] or 0,
                    'concluido': row['concluido'] or 0,
                    'evadido': row['evadido'] or 0
                }
            
            # ========== TODAS AS TURMAS (sem paginação) ==========
            sql_turmas = """
                SELECT 
                    COALESCE(turma, 'Sem turma') as turma,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativo,
                    SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluido,
                    SUM(CASE WHEN status = 'evadido' THEN 1 ELSE 0 END) as evadido
                FROM alunos 
                GROUP BY turma
                ORDER BY 
                    CASE WHEN turma IS NULL THEN 1 ELSE 0 END,
                    turma
            """
            cursor.execute(sql_turmas)
            turmas_raw = cursor.fetchall()
            
            turmas_dict = {}
            for row in turmas_raw:
                nome_turma = row['turma']
                turmas_dict[nome_turma] = {
                    'total': row['total'],
                    'ativo': row['ativo'] or 0,
                    'concluido': row['concluido'] or 0,
                    'evadido': row['evadido'] or 0
                }
            
            conn.close()
            
            return jsonify({
                "resumo": resumo,
                "cursos": cursos_dict,
                "turmas": turmas_dict,
                "pagination": {
                    "page": 1,
                    "per_page": per_page,
                    "total_cursos": len(cursos_dict),
                    "total_turmas": len(turmas_dict),
                    "total_pages_cursos": 1,
                    "total_pages_turmas": 1,
                    "has_prev": False,
                    "has_next": False
                }
            })
        else:
            # Se per_page for normal, usar paginação normal
            return handle_normal_pagination(conn, cursor, resumo, table_type, page, per_page, search)
    else:
        # Se table_type especificado, usar paginação normal
        return handle_normal_pagination(conn, cursor, resumo, table_type, page, per_page, search)

def handle_normal_pagination(conn, cursor, resumo, table_type, page, per_page, search):
    """Função auxiliar para lidar com paginação normal"""
    
    # Dados paginados para cursos (quando table_type='cursos')
    if table_type == 'cursos':
        # Query base para cursos
        sql_base = """
            SELECT 
                curso,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativo,
                SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluido,
                SUM(CASE WHEN status = 'evadido' THEN 1 ELSE 0 END) as evadido
            FROM alunos 
            WHERE curso IS NOT NULL AND curso != ''
        """
        
        # Adicionar filtro de busca se existir
        params = []
        if search:
            sql_base += " AND LOWER(curso) LIKE %s"
            params.append(f"%{search}%")
        
        sql_base += " GROUP BY curso ORDER BY curso"
        
        # Contar total
        count_sql = "SELECT COUNT(DISTINCT curso) as total FROM alunos WHERE curso IS NOT NULL AND curso != ''"
        if search:
            count_sql += " AND LOWER(curso) LIKE %s"
        
        cursor.execute(count_sql, tuple(params))
        total_result = cursor.fetchone()
        total_items = total_result['total'] if total_result else 0
        total_pages = math.ceil(total_items / per_page) if per_page > 0 else 1
        
        # Calcular offset com a página solicitada
        offset = (page - 1) * per_page
        
        # Buscar cursos com agregação paginada
        sql = sql_base + " LIMIT %s OFFSET %s"
        params.extend([per_page, offset])
        
        cursor.execute(sql, tuple(params))
        cursos_raw = cursor.fetchall()
        
        cursos_dict = {}
        for row in cursos_raw:
            nome_curso = row['curso']
            cursos_dict[nome_curso] = {
                'total': row['total'],
                'ativo': row['ativo'] or 0,
                'concluido': row['concluido'] or 0,
                'evadido': row['evadido'] or 0
            }
        
        turmas_dict = {}
        
    # Dados paginados para turmas (quando table_type='turmas')
    elif table_type == 'turmas':
        # Query base para turmas
        sql_base = """
            SELECT 
                COALESCE(turma, 'Sem turma') as turma,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativo,
                SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluido,
                SUM(CASE WHEN status = 'evadido' THEN 1 ELSE 0 END) as evadido
            FROM alunos 
        """
        
        # Adicionar filtro de busca se existir
        params = []
        if search:
            sql_base += " WHERE LOWER(turma) LIKE %s"
            params.append(f"%{search}%")
        
        sql_base += " GROUP BY turma ORDER BY CASE WHEN turma IS NULL THEN 1 ELSE 0 END, turma"
        
        # Contar total
        count_sql = "SELECT COUNT(DISTINCT turma) as total FROM alunos"
        if search:
            count_sql += " WHERE LOWER(turma) LIKE %s"
        
        cursor.execute(count_sql, tuple(params))
        total_result = cursor.fetchone()
        total_items = total_result['total'] if total_result else 0
        total_pages = math.ceil(total_items / per_page) if per_page > 0 else 1
        
        # Calcular offset com a página solicitada
        offset = (page - 1) * per_page
        
        # Buscar turmas com agregação paginada
        sql = sql_base + " LIMIT %s OFFSET %s"
        params.extend([per_page, offset])
        
        cursor.execute(sql, tuple(params))
        turmas_raw = cursor.fetchall()
        
        turmas_dict = {}
        for row in turmas_raw:
            nome_turma = row['turma']
            turmas_dict[nome_turma] = {
                'total': row['total'],
                'ativo': row['ativo'] or 0,
                'concluido': row['concluido'] or 0,
                'evadido': row['evadido'] or 0
            }
        
        cursos_dict = {}
    
    else:
        # Fallback
        cursos_dict = {}
        turmas_dict = {}
        total_pages = 1
        total_items = 0

    conn.close()

    return jsonify({
        "resumo": resumo,
        "cursos": cursos_dict,
        "turmas": turmas_dict,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total_items,
            "total_pages": total_pages,
            "has_prev": page > 1,
            "has_next": page < total_pages
        }
    })

if __name__ == '__main__':
    app.run(debug=True)