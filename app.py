from flask import Flask
from blueprints import (
    alunos_bp,
    documentos_bp,
    registros_bp,
    relatorios_bp,
    views_bp,
)

app = Flask(__name__)

# === Registro dos blueprints ===
app.register_blueprint(views_bp)
app.register_blueprint(alunos_bp)
app.register_blueprint(documentos_bp)
app.register_blueprint(registros_bp)
app.register_blueprint(relatorios_bp)
if __name__ == "__main__":
    app.run(debug=True)
