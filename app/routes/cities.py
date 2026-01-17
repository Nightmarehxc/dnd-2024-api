from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.city_service import city_service
from app.schemas.request import CityRequestSchema

bp = Blueprint('cities', __name__, url_prefix='/api/cities')


@bp.route('/generate', methods=['POST'])
def generate_city():
    schema = CityRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = city_service.generate_city(data['city_type'], data['theme'])

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)