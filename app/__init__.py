from flask import Flask, jsonify
from flask_cors import CORS
from marshmallow import ValidationError
from flasgger import Swagger  # <--- IMPORTAR
from config import config


def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    CORS(app)

    # --- CONFIGURACIÓN DE SWAGGER ---
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,  # incluir todas las reglas
                "model_filter": lambda tag: True,  # incluir todos los modelos
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs/"  # <--- URL donde verás la documentación
    }

    template = {
        "swagger": "2.0",
        "info": {
            "title": "D&D 2024 AI Generator API",
            "description": "API generadora de contenido para Dungeons & Dragons 5e (Ruleset 2024) impulsada por Gemini.",
            "version": "1.0.0"
        }
    }

    Swagger(app, config=swagger_config, template=template)  # <--- INICIALIZAR

    # Registrar Blueprints
    from app.routes import characters, npcs, items
    app.register_blueprint(characters.bp)
    app.register_blueprint(npcs.bp)
    app.register_blueprint(items.bp)

    # Manejadores de errores (igual que antes)
    @app.errorhandler(ValidationError)
    def handle_marshmallow_validation(err):
        return jsonify({"error": "Error de validación", "messages": err.messages}), 400

    return app