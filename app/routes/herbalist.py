from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.herbalist_service import herbalist_service
from app.schemas.request import HerbalistRequestSchema

bp = Blueprint('herbalist', __name__, url_prefix='/api/herbalist')

@bp.route('/generate', methods=['POST'])
def generate():
    schema = HerbalistRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = herbalist_service.generate_plant(
        data['environment'], 
        data['skill_roll'], 
        data['character_level']
    )
    if "error" in result: 
        return jsonify(result), 500
    return jsonify(result)
