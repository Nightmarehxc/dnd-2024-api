from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy  # <--- 1. Importar
import os

# 2. Inicializar DB fuera de la función
db = SQLAlchemy()


def create_app(config_name='default'):
    app = Flask(__name__)

    # Configuración básica
    app.config.from_object('config.Config')

    # 3. Configuración SQLite
    # Esto creará un archivo "dnd_database.sqlite" en la carpeta raíz
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, '../dnd_database.sqlite')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app)

    # 4. Iniciar DB con la app
    db.init_app(app)

    # Registro de Blueprints (Mantén los que ya tienes)
    from app.routes import (
        adventures, characters, items, spells, npcs, loot,
        encounters, cities, shops, images, history,  # Asegúrate de que history está aquí
        factions, villains, quests, riddles, rules, travel, alchemy,
        dungeons, librarian, dreams, mysteries, contracts, ruins, monsters,
        inns
    )

    app.register_blueprint(adventures.bp)
    app.register_blueprint(characters.bp)
    app.register_blueprint(items.bp)
    app.register_blueprint(spells.bp)
    app.register_blueprint(npcs.bp)
    app.register_blueprint(loot.bp)
    app.register_blueprint(encounters.bp)
    app.register_blueprint(cities.bp)
    app.register_blueprint(shops.bp)
    app.register_blueprint(images.bp)
    app.register_blueprint(history.bp)
    app.register_blueprint(factions.bp)
    app.register_blueprint(villains.bp)
    app.register_blueprint(quests.bp)
    app.register_blueprint(riddles.bp)
    app.register_blueprint(rules.bp)
    app.register_blueprint(travel.bp)
    app.register_blueprint(alchemy.bp)
    app.register_blueprint(dungeons.bp)
    app.register_blueprint(librarian.bp)
    app.register_blueprint(dreams.bp)
    app.register_blueprint(mysteries.bp)
    app.register_blueprint(contracts.bp)
    app.register_blueprint(ruins.bp)
    app.register_blueprint(monsters.bp)
    app.register_blueprint(inns.bp)

    # 5. Crear tablas automáticamente si no existen
    with app.app_context():
        db.create_all()

    return app