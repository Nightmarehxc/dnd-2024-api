from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.faction_service import faction_service
from app.schemas.request import FactionRequestSchema

bp = Blueprint('factions', __name__, url_prefix='/api/factions')

@bp.route('/generate', methods=['POST'])
def generate():
    schema = FactionRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = faction_service.generate_faction(data['theme'], data['faction_type'])
    if "error" in result: return jsonify(result), 500
    return jsonify(result)