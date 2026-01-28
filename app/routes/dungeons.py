from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.dungeon_service import dungeon_service
from app.schemas.request import DungeonRequestSchema
from app.models import Dungeon
from app import db

bp = Blueprint('dungeons', __name__, url_prefix='/api/dungeons')

@bp.route('/generate', methods=['POST'])
def generate():
    schema = DungeonRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    try:
        # Generar la mazmorra con Gemini
        result = dungeon_service.generate_dungeon(data['theme'], data['level'])
        if "error" in result: 
            return jsonify(result), 500
        
        # Extraer y limpiar los datos antes de guardar
        name = result.get('name', f"Mazmorra - {data['theme']}")
        atmosphere = result.get('atmosphere', '')
        rooms = result.get('rooms', [])
        
        # Asegurar que rooms es una lista limpia de diccionarios
        clean_rooms = []
        if isinstance(rooms, list):
            for room in rooms:
                if isinstance(room, dict):
                    clean_rooms.append({
                        'id': room.get('id'),
                        'type': room.get('type', ''),
                        'title': room.get('title', ''),
                        'description': room.get('description', ''),
                        'challenge': room.get('challenge', ''),
                        'consequence': room.get('consequence', '')
                    })
        
        # Guardar en la base de datos
        dungeon = Dungeon(
            name=name,
            descripcion=atmosphere,
            profundidad=str(data['level']),
            arquitecto='AI Generator',
            salas=clean_rooms,
            trampas=[],
            tesoro='',
            secreto_central=''
        )
        
        db.session.add(dungeon)
        db.session.commit()
        
        # Devolver SOLO los datos necesarios, sin objetos de BD
        return jsonify({
            'id': dungeon.id,
            'name': name,
            'atmosphere': atmosphere,
            'rooms': clean_rooms
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error en dungeons/generate: {str(e)}")
        return jsonify({"error": str(e)}), 500