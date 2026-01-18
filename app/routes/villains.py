from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.villain_service import villain_service
from app.schemas.request import VillainRequestSchema

bp = Blueprint('villains', __name__, url_prefix='/api/villains')

@bp.route('/generate', methods=['POST'])
def generate_villain():
    schema = VillainRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = villain_service.generate_villain(data['theme'], data['level_range'])

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)