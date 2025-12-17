from flask import jsonify, request, send_file
from . import documentos_bp
from . import services as documentos_services
from ..utils.pagination import paginate_query


@documentos_bp.route("", methods=["GET"])
def listar_documentos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '').lower()

    try:
        result = documentos_services.listar_documentos_paginado(
            paginate_query=paginate_query,
            page=page,
            per_page=per_page,
            search=search
        )
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

    return jsonify({
        "documentos": result["items"],
        "pagination": result["pagination"]
    })


@documentos_bp.route("/<int:aluno_id>", methods=["PUT"])
def salvar_documentos(aluno_id):
    data = request.json
    try:
        documentos_services.salvar_documentos(aluno_id, data)
        return jsonify({"mensagem": "Documentos salvos com sucesso!"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 400

@documentos_bp.route("/teste-docx", methods=["GET"])
def teste_docx():
    caminho = documentos_services.gerar_docx_registro_teste()
    return send_file(
        caminho,
        as_attachment=True,
        download_name="registro_teste.docx"
    )