from Bd import get_connection


def listar_registros():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            d.id               AS diploma_id,
            a.id               AS aluno_id,
            a.nome             AS aluno,
            a.data_matricula,
            d.livro,
            d.registro_numero  AS folha_registro,
            d.data_registro,
            d.numero_diploma,
            d.via              AS numero_emissoes
        FROM diplomas d
        JOIN alunos a ON a.id = d.aluno_id
        ORDER BY d.data_registro DESC
    """)

    dados = cursor.fetchall()
    conn.close()
    return dados


def salvar_registro(data):
    obrigatorios = [
        "aluno_id",
        "livro",
        "registro_numero",
        "data_registro",
        "numero_diploma",
        "via",
        "data_emissao"
    ]

    faltando = [c for c in obrigatorios if not data.get(c)]
    if faltando:
        return {
            "erro": "Campos obrigatórios faltando",
            "campos": faltando
        }, 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO diplomas (
            aluno_id,
            livro,
            registro_numero,
            data_registro,
            numero_diploma,
            via,
            data_emissao,
            situacao
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        data["aluno_id"],
        data["livro"],
        data["registro_numero"],
        data["data_registro"],
        data["numero_diploma"],
        data["via"],
        data["data_emissao"],
        data.get("situacao", "pendente")
    ))

    conn.commit()
    conn.close()

    return {"mensagem": "Registro salvo com sucesso"}, 201
