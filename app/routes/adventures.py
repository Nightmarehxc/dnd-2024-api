from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.adventure_service import adventure_service
from app.schemas.request import AdventureRequestSchema

bp = Blueprint('adventures', __name__, url_prefix='/api/adventures')

@bp.route('/generate', methods=['POST'])
def generate_adventure():
    schema = AdventureRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = adventure_service.generate_adventure(data['theme'], data['players'], data['level'])
    return jsonify(result)