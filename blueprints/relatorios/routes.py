from flask import jsonify, request
from . import relatorios_bp
from . import services as relatorios_services


@relatorios_bp.route('', methods=['GET'])
def get_relatorios_data():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    table_type = request.args.get('table', '')
    search = request.args.get('search', '').lower()

    try:
        dados = relatorios_services.obter_dados_relatorios(
            page, per_page, table_type, search
        )
        return jsonify(dados)
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
