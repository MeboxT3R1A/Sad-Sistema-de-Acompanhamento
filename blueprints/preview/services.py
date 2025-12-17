from Bd import get_connection
from datetime import date
import os
import tempfile
from docxtpl import DocxTemplate

BASE_DIR = os.path.dirname(__file__)
TEMPLATE_PATH = os.path.join(
    BASE_DIR,
    "template_preview",
    "MODELO_LIVRO_REGISTRO.docx"
)

def gerar_docx_por_aluno(aluno_id: int):
    dados = get_dados_registro_por_aluno(aluno_id)

    if not dados:
        return None

    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError("Template DOCX não encontrado")

    doc = DocxTemplate(TEMPLATE_PATH)
    doc.render(dados)

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
    doc.save(tmp.name)

    return tmp.name

def formatar_data(data):
    if not data:
        return ""
    if isinstance(data, str):
        return data
    return data.strftime("%d/%m/%Y")

def get_dados_registro_por_aluno(aluno_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            a.nome              AS aluno,
            a.cpf,
            a.data_nascimento,
            a.nacionalidade,
            a.naturalidade,
            a.uf,
            a.identidade,
            a.expedidor,
            a.data_expedicao,
            CONCAT(a.curso, ' - ', a.turma) AS turma,
            a.data_conclusao,
            d.livro,
            d.folha_registro    AS codigo_registro,
            d.data_registro
        FROM alunos a
        LEFT JOIN diplomas d ON d.aluno_id = a.id
        WHERE a.id = %s
        LIMIT 1
    """, (aluno_id,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return None

    return {
        "livro": row["livro"] or "",
        "codigo_registro": row["codigo_registro"] or "",
        "data_registro": formatar_data(row["data_registro"]),
        "turma": row["turma"] or "",
        "data_conclusao": formatar_data(row["data_conclusao"]),
        "aluno": row["aluno"] or "",
        "data_nascimento": formatar_data(row["data_nascimento"]),
        "nacionalidade": row["nacionalidade"] or "",
        "naturalidade": row["naturalidade"] or "",
        "uf": row["uf"] or "",
        "identidade": row["identidade"] or "",
        "expedidor": row["expedidor"] or "",
        "data_expedicao": formatar_data(row["data_expedicao"]),
        "cpf": row["cpf"] or "",
    }