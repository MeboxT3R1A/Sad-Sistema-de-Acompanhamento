from Bd import get_connection

def listar_alunos_paginado(paginate_query, page, per_page, search):
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

    # Formata as datas para BR
    for aluno in result['items']:
        for campo in ['data_nascimento', 'data_expedicao', 'data_matricula', 'data_conclusao', 'created_at', 'updated_at']:
            if aluno.get(campo):
                # Se já for string, tenta parsear
                if isinstance(aluno[campo], str):
                    try:
                        from datetime import datetime
                        d = datetime.fromisoformat(aluno[campo].split('T')[0])
                        aluno[campo] = d.strftime("%d/%m/%Y")
                    except:
                        # se não der, deixa como está
                        pass
                else:
                    # é date/datetime
                    aluno[campo] = aluno[campo].strftime("%d/%m/%Y")

    return result
def buscar_aluno_por_id(aluno_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            cpf,
            nome,
            data_nascimento,
            nacionalidade,
            naturalidade,
            uf,
            identidade,
            expedidor,
            data_expedicao,
            telefone,
            email,
            curso,
            turma,
            data_matricula,
            status
        FROM alunos
        WHERE id = %s
    """, (aluno_id,))

    aluno = cursor.fetchone()
    conn.close()

    if not aluno:
        return None
    
    # ⚠️ FORMATAÇÃO DE DATAS PARA INPUT TYPE="DATE"
    if aluno.get("data_nascimento"):
        aluno["data_nascimento"] = aluno["data_nascimento"].strftime("%Y-%m-%d")
    if aluno.get("data_expedicao"):
        aluno["data_expedicao"] = aluno["data_expedicao"].strftime("%Y-%m-%d")


    # ⚠️ ADAPTAÇÃO IMPORTANTE
    # Mesmo tendo só um curso no banco,
    # devolvemos como lista para o front
    cursos = []
    if aluno.get("curso"):
        cursos.append({
            "curso": aluno["curso"],
            "turma": aluno.get("turma")
        })

    return {
        "id": aluno["id"],
        "cpf": aluno["cpf"],
        "nome": aluno["nome"],
        "data_nascimento": aluno["data_nascimento"],
        "nacionalidade": aluno["nacionalidade"],
        "naturalidade": aluno["naturalidade"],
        "uf": aluno["uf"],
        "identidade": aluno["identidade"],
        "expedidor": aluno["expedidor"],
        "data_expedicao": aluno["data_expedicao"],
        "telefone": aluno["telefone"],
        "email": aluno["email"],
        "data_matricula": aluno["data_matricula"],
        "status": aluno["status"],
        "cursos": cursos
    }



def criar_aluno(data):
    conn = get_connection()
    cursor = conn.cursor()

    sql = """
        INSERT INTO alunos 
        (cpf, nome, data_nascimento, nacionalidade, naturalidade, uf,
         identidade, expedidor, data_expedicao, telefone, email, 
         curso, turma, data_matricula, status)
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

    nome_mae = data.get('nomeMae', '')
    nome_pai = data.get('nomePai', '')

    if nome_mae or nome_pai:
        cursor.execute(
            "INSERT INTO responsaveis (aluno_id, filiacao1, filiacao2) VALUES (%s, %s, %s)",
            (aluno_id, nome_pai, nome_mae)
        )

    conn.commit()
    conn.close()

    return aluno_id


def atualizar_aluno(aluno_id, data):
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
            data_matricula = %s,
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

    cursor.execute(
        "INSERT INTO historico_alteracoes (aluno_id, campo_alterado) VALUES (%s, %s)",
        (aluno_id, "Dados cadastrais atualizados")
    )

    conn.commit()
    conn.close()


def excluir_aluno(aluno_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM alunos WHERE id = %s", (aluno_id,))

    conn.commit()
    conn.close()
