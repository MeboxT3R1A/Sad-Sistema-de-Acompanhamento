from flask import render_template, abort
from . import preview_bp
from .services import get_dados_preview_por_aluno


@preview_bp.route("/registro/<int:aluno_id>")
def preview_registro(aluno_id):
    dados = get_dados_preview_por_aluno(aluno_id)

    if not dados:
        abort(404, "Aluno não encontrado")

    return render_template(
        "preview/preview_registro.html",
        **dados
    )
