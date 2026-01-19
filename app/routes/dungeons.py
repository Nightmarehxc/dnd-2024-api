from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.dungeon_service import dungeon_service
from app.schemas.request import DungeonRequestSchema

bp = Blueprint('dungeons', __name__, url_prefix='/api/dungeons')

@bp.route('/generate', methods=['POST'])
def generate():
    schema = DungeonRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = dungeon_service.generate_dungeon(data['theme'], data['level'])
    if "error" in result: return jsonify(result), 500
    return jsonify(result)