from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.travel_service import travel_service
from app.schemas.request import TravelRequestSchema

bp = Blueprint('travel', __name__, url_prefix='/api/travel')

@bp.route('/generate', methods=['POST'])
def generate_travel():
    schema = TravelRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = travel_service.generate_events(data['environment'], data['days'])

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)