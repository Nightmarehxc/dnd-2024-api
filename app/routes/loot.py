from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.loot_service import loot_service
from app.schemas.request import LootRequestSchema

bp = Blueprint('loot', __name__, url_prefix='/api/loot')

@bp.route('/generate', methods=['POST'])
def generate_loot():
    schema = LootRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = loot_service.generate_loot(data['cr'], data['enemy_type'])

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)