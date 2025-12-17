from flask import render_template, abort, send_file
from . import preview_bp
from .services import get_dados_registro_por_aluno, gerar_docx_por_aluno
import os
import tempfile
from docxtpl import DocxTemplate


@preview_bp.route("/registro/<int:aluno_id>")
def preview_registro(aluno_id):
    dados = get_dados_registro_por_aluno(aluno_id)

    if not dados:
        abort(404)

    return render_template(
        "preview/preview_registro.html",
        aluno_id=aluno_id,
        **dados
    )


BASE_DIR = os.path.dirname(__file__)
TEMPLATE_PATH = os.path.join(
    BASE_DIR,
    "template_preview",
    "MODELO_LIVRO_REGISTRO.docx"
)

from flask import send_file

@preview_bp.route("/registro/<int:aluno_id>/docx")
def baixar_docx(aluno_id):
    caminho = gerar_docx_por_aluno(aluno_id)

    if not caminho:
        abort(404)

    return send_file(
        caminho,
        as_attachment=True,
        download_name="registro_diploma.docx"
    )
