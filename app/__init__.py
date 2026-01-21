import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from marshmallow import ValidationError
from flasgger import Swagger
from app.routes import characters, npcs, items, adventures, history, shops, images, cities, riddles, \
    encounters, loot, rules, quests, journal, spells, villains, travel, factions, alchemy, library, \
    dungeons, contracts, mysteries, dreams, librarian, ruins, monsters, inns  # <--- IMPORTAR
from config import config

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    CORS(app)

    # --- CONFIGURACIÓN SWAGGER ---
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs/"
    }

    template = {
        "swagger": "2.0",
        "info": {
            "title": "D&D 2024 AI Generator API",
            "description": "API generadora de contenido para Dungeons & Dragons 5e (Ruleset 2024) impulsada por Gemini.",
            "version": "1.0.0"
        }
    }

    Swagger(app, config=swagger_config, template=template)

    # Registrar Blueprints (API)
    from app.routes import characters, npcs, items
    app.register_blueprint(characters.bp)
    app.register_blueprint(npcs.bp)
    app.register_blueprint(items.bp)
    app.register_blueprint(adventures.bp)
    app.register_blueprint(history.bp)
    app.register_blueprint(shops.bp)
    app.register_blueprint(images.bp)
    app.register_blueprint(cities.bp)
    app.register_blueprint(riddles.bp)
    app.register_blueprint(encounters.bp)
    app.register_blueprint(loot.bp)
    app.register_blueprint(rules.bp)
    app.register_blueprint(quests.bp)
    app.register_blueprint(journal.bp)
    app.register_blueprint(spells.bp)
    app.register_blueprint(villains.bp)
    app.register_blueprint(travel.bp)
    app.register_blueprint(factions.bp)
    app.register_blueprint(alchemy.bp)
    app.register_blueprint(library.bp)
    app.register_blueprint(dungeons.bp)
    app.register_blueprint(librarian.bp)
    app.register_blueprint(dreams.bp)
    app.register_blueprint(mysteries.bp)
    app.register_blueprint(contracts.bp)
    app.register_blueprint(ruins.bp)
    app.register_blueprint(monsters.bp)
    app.register_blueprint(inns.bp)
    # --- SERVIR FRONTEND (NUEVO) ---
    # Calculamos la ruta absoluta a la carpeta 'frontend'
    # app.root_path apunta a /tu/proyecto/app
    frontend_folder = os.path.join(app.root_path, '../frontend')

    @app.route('/')
    def index():
        """Sirve el dashboard principal"""
        return send_from_directory(frontend_folder, 'index.html')

    @app.route('/<path:path>')
    def serve_frontend_files(path):
        """Sirve CSS, JS y subpáginas automáticamente"""
        return send_from_directory(frontend_folder, path)

    # Manejadores de errores
    @app.errorhandler(ValidationError)
    def handle_marshmallow_validation(err):
        return jsonify({"error": "Error de validación", "messages": err.messages}), 400

    return app