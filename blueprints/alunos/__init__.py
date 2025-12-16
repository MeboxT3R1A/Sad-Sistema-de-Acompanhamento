from flask import Blueprint

alunos_bp = Blueprint(
    'alunos',
    __name__,
    url_prefix='/api/alunos'
)

from . import routes
