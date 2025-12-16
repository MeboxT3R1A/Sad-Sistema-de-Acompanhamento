from flask import jsonify, request
from . import alunos_bp
from ..utils.pagination import paginate_query
from . import services as aluno_services


@alunos_bp.route("", methods=['GET'])
def get_alunos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '').lower()

    # Delega paginação para o service (que usa paginate_query internamente)
    try:
        result = aluno_services.listar_alunos_paginado(
            paginate_query=paginate_query,
            page=page,
            per_page=per_page,
            search=search
        )
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

    return jsonify({
        'alunos': result['items'],
        'pagination': result['pagination']
    })


@alunos_bp.route("/<int:aluno_id>", methods=['GET'])
def get_aluno(aluno_id):
    try:
        aluno = aluno_services.buscar_aluno_por_id(aluno_id)
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

    if aluno:
        return jsonify(aluno)
    else:
        return jsonify({"erro": "Aluno não encontrado"}), 404


@alunos_bp.route("", methods=['POST'])
def criar_aluno():
    data = request.json
    try:
        aluno_id = aluno_services.criar_aluno(data)
        return jsonify({"id": aluno_id, "mensagem": "Aluno criado com sucesso!"}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@alunos_bp.route("/<int:aluno_id>", methods=['PUT'])
def atualizar_aluno(aluno_id):
    data = request.json
    try:
        aluno_services.atualizar_aluno(aluno_id, data)
        return jsonify({"mensagem": "Aluno atualizado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@alunos_bp.route("/<int:aluno_id>", methods=['DELETE'])
def excluir_aluno(aluno_id):
    try:
        aluno_services.excluir_aluno(aluno_id)
        return jsonify({"mensagem": "Aluno excluído com sucesso!"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
