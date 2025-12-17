from Bd import get_connection  # ajuste se seu helper tiver outro nome
from datetime import datetime


def get_dados_preview_por_aluno(aluno_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT 
            a.nome,
            a.cpf,
            a.data_nascimento,
            a.nacionalidade,
            a.naturalidade,
            a.uf,
            a.identidade,
            a.expedidor,
            a.data_expedicao,
            a.curso,
            a.turma,
            a.data_conclusao,
            d.livro,
            d.folha_registro,
            d.data_registro
        FROM alunos a
        LEFT JOIN diplomas d ON d.aluno_id = a.id
        WHERE a.id = %s
        LIMIT 1
    """

    cursor.execute(query, (aluno_id,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if not row:
        return None

    # Normalização EXATA para o HTML
    dados = {
        "livro": row["livro"] or "",
        "codigo_registro": row["folha_registro"] or "",
        "data_registro": formatar_data(row["data_registro"]),
        "turma": f'{row["curso"]} - {row["turma"]}',
        "data_conclusao": formatar_data(row["data_conclusao"]),
        "aluno": row["nome"],
        "data_nascimento": formatar_data(row["data_nascimento"]),
        "nacionalidade": row["nacionalidade"] or "",
        "naturalidade": row["naturalidade"] or "",
        "uf": row["uf"] or "",
        "identidade": row["identidade"] or "",
        "expedidor": row["expedidor"] or "",
        "data_expedicao": formatar_data(row["data_expedicao"]),
        "cpf": row["cpf"],
    }

    return dados


def formatar_data(data):
    if not data:
        return ""
    if isinstance(data, str):
        return data
    return data.strftime("%d/%m/%Y")
