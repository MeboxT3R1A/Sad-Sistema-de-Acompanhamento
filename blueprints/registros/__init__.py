from flask import Blueprint

registros_bp = Blueprint(
    'registros',
    __name__,
    url_prefix='/api/registros'
)

from . import routes
