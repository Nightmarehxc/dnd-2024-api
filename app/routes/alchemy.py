from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.alchemy_service import alchemy_service
from app.schemas.request import AlchemyRequestSchema

bp = Blueprint('alchemy', __name__, url_prefix='/api/alchemy')

@bp.route('/generate', methods=['POST'])
def generate():
    schema = AlchemyRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = alchemy_service.generate_concoction(data['item_type'], data['rarity'])
    if "error" in result: return jsonify(result), 500
    return jsonify(result)