from flask import render_template
from . import views_bp

@views_bp.route('/')
def index():
    return render_template('index.html', active_page='index')

@views_bp.route('/documentos')
def documentos():
    return render_template('documentos.html', active_page='documentos')

@views_bp.route('/registros')
def registros():
    return render_template('registros.html', active_page='registros')

@views_bp.route('/relatorios')
def relatorios():
    return render_template('relatorios.html', active_page='relatorios')
