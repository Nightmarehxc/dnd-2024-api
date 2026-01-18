from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.spell_service import spell_service
from app.schemas.request import SpellRequestSchema

bp = Blueprint('spells', __name__, url_prefix='/api/spells')

@bp.route('/generate', methods=['POST'])
def generate_spell():
    schema = SpellRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = spell_service.generate_spell(data['description'], data.get('level'))

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)