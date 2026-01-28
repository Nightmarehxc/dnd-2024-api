from flask import Flask, send_from_directory  # <--- Añadir send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()


def create_app(config_name='default'):
    # 1. CONFIGURACIÓN DE CARPETAS
    # Le decimos a Flask que los archivos estáticos (HTML, CSS, JS) están en "../frontend"
    app = Flask(__name__,
                static_folder='../frontend',
                static_url_path='')

    app.config.from_object('config.Config')

    # Configuración de SQLite
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, '../dnd_database.sqlite')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app)
    db.init_app(app)

    # 2. RUTA PRINCIPAL (Para que al entrar a localhost:5001 cargue la web)
    @app.route('/')
    def serve_index():
        return send_from_directory(app.static_folder, 'index.html')

    # Registro de Blueprints
    from app.routes import (
        adventures, characters, items, spells, npcs, loot,
        encounters, cities, shops, images, history,
        factions, villains, quests, riddles, rules, travel, alchemy,
        dungeons, librarian, dreams, mysteries, contracts, ruins, monsters,
        inns, journal, atmosphere, strongholds, gm_screen, herbalist
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
    app.register_blueprint(journal.bp)
    app.register_blueprint(atmosphere.bp)
    app.register_blueprint(strongholds.bp)
    app.register_blueprint(gm_screen.bp)
    app.register_blueprint(herbalist.bp)

    # Crear tablas - Importar TODOS los modelos para que se registren
    with app.app_context():
        from app.models import (
            Character, NPC, Adventure, City, Dungeon, Encounter, Shop, Inn, Riddle, Quest,
            Monster, Spell, Item, Journal, Faction, Mystery, Villain,
            Alchemy, Herbalist, Librarian, Dream, Atmosphere, Stronghold, Facility, StrongholdFacility,
            GMReference, Loot, Travel, Ruins, Contract, Rule
        )
        db.create_all()
        print("✅ Base de datos creada/verificada correctamente")

    return app