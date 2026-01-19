from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.character_service import character_service
from app.schemas.request import CharacterRequestSchema

bp = Blueprint('characters', __name__, url_prefix='/api/characters')

@bp.route('/generate', methods=['POST'])
def generate_character():
    schema = CharacterRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    # Pasamos los nuevos campos fixed_race y fixed_class
    result = character_service.generate_character(
        description=data['description'],
        level=data['level'],
        fixed_race=data.get('fixed_race'),
        fixed_class=data.get('fixed_class')
    )

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)