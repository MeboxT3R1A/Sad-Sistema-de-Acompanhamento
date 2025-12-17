from flask import jsonify, request, Response
from . import registros_bp
from . import services as registros_services

@registros_bp.route('', methods=['GET'])
def listar_registros():
    try:
        dados = registros_services.listar_registros()
        return jsonify(dados), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@registros_bp.route('', methods=['POST'])
def salvar_registro():
    data = request.get_json()

    result = registros_services.salvar_registro(data)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 201

@registros_bp.route('/preview/<int:registro_id>', methods=['GET'])
def preview_registro(registro_id):
    pdf_bytes = registros_services.gerar_preview_pdf(registro_id)

    return Response(
        pdf_bytes,
        mimetype='application/pdf',
        headers={
            'Content-Disposition': 'inline; filename=registro_preview.pdf'
        }
    )