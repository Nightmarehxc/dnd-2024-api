from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.character_service import character_service # <--- NUEVO IMPORT
from app.schemas.request import GenerationRequestSchema

bp = Blueprint('characters', __name__, url_prefix='/api/characters')

@bp.route('/generate', methods=['POST'])
def generate_character():
    schema = GenerationRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = character_service.generate(data['description'], data['level'])
    return jsonify(result)