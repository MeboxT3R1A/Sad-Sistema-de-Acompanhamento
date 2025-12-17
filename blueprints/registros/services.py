from Bd import get_connection


from Bd import get_connection
from datetime import datetime

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
            d.folha_registro,
            d.data_registro,
            d.numero_diploma,
            d.via,
            d.data_emissao
        FROM diplomas d
        JOIN alunos a ON a.id = d.aluno_id
        ORDER BY d.data_registro DESC
    """)

    registros = cursor.fetchall()
    conn.close()

    # Função para formatar datas no padrão brasileiro DD/MM/YYYY
    def formatar_data(dt):
        if not dt:
            return None
        if isinstance(dt, str):
            try:
                dt = datetime.strptime(dt, "%Y-%m-%d")
            except ValueError:
                return dt  # caso já venha em outro formato
        return dt.strftime("%d/%m/%Y")

    # Aplica formatação nas datas
    for r in registros:
        r["data_matricula"] = formatar_data(r.get("data_matricula"))
        r["data_registro"] = formatar_data(r.get("data_registro"))
        r["data_emissao"] = formatar_data(r.get("data_emissao"))

    return registros


def salvar_registro(data):
    obrigatorios = [
        "aluno_id",
        "livro",
        "folha_registro",
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
    
    via = data.get("via")
    
    cursor.execute("""
        INSERT INTO diplomas (
            aluno_id,
            livro,
            folha_registro,
            data_registro,
            numero_diploma,
            via,
            data_emissao,
            situacao
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        data["aluno_id"],
        data["livro"],
        data["folha_registro"],
        data["data_registro"],
        data["numero_diploma"],
        via,
        data["data_emissao"],
        data.get("situacao", "pendente")
    ))

    conn.commit()
    conn.close()

    return {"mensagem": "Registro salvo com sucesso"}, 201
