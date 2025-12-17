from Bd import get_connection
import os
import tempfile
from docxtpl import DocxTemplate


def listar_documentos_paginado(paginate_query, page, per_page, search):
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

    count_sql = """
        SELECT COUNT(*) as total
        FROM alunos a
        LEFT JOIN documentos_aluno d ON a.id = d.aluno_id
    """

    search_fields = ['a.nome', 'a.cpf', 'a.identidade', 'a.curso', 'a.turma']

    result = paginate_query(
        base_query=sql,
        count_query=count_sql,
        page=page,
        per_page=per_page,
        search=search,
        search_fields=search_fields
    )

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

    return {
        "items": lista_formatada,
        "pagination": result["pagination"]
    }


def salvar_documentos(aluno_id, data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM documentos_aluno WHERE aluno_id = %s",
        (aluno_id,)
    )
    existe = cursor.fetchone()

    valores = (
        data.get('rg', False),
        data.get('cpf', False),
        data.get('foto', False),
        data.get('historico', False),
        data.get('endereco', False),
        data.get('certidao', False),
        data.get('certificado', False),
        data.get('diploma', False),
        aluno_id
    )

    if existe:
        sql = """
            UPDATE documentos_aluno 
            SET rg_entregue=%s, cpf_entregue=%s, foto_entregue=%s, 
                historico_entregue=%s, comprovante_entregue=%s,
                certidao_entregue=%s, certificado_entregue=%s,
                diploma_entregue=%s,
                data_verificacao=CURDATE()
            WHERE aluno_id=%s
        """
        cursor.execute(sql, valores)
    else:
        sql = """
            INSERT INTO documentos_aluno 
            (rg_entregue, cpf_entregue, foto_entregue,
             historico_entregue, comprovante_entregue,
             certidao_entregue, certificado_entregue,
             diploma_entregue, aluno_id, data_verificacao)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,CURDATE())
        """
        cursor.execute(sql, valores)

    conn.commit()
    conn.close()

BASE_DIR = os.path.dirname(__file__)

def gerar_docx_registro_teste():
    template_path = os.path.join(
        BASE_DIR,
        "template_doc",
        "MODELO_LIVRO_REGISTRO.docx"
    )

    if not os.path.exists(template_path):
        raise FileNotFoundError("Modelo DOCX não encontrado")

    doc = DocxTemplate(template_path)

    dados = {
        "livro": "03",
        "codigo_registro": "1203 / TESTE",
        "data_registro": "01/01/2025",

        "turma": "TURMA TESTE",
        "data_conclusao": "28/11/2024",
        "aluno": "Aluno Teste",
        "data_nascimento": "01/01/2000",

        "nacionalidade": "Brasileira",
        "naturalidade": "BRASÍLIA",
        "uf": "DF",

        "identidade": "0000000",
        "expedidor": "SSP/DF",
        "data_expedicao": "01/01/2015",

        "cpf": "000.000.000-00",
    }

    doc.render(dados)

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
    doc.save(tmp.name)

    return tmp.name
