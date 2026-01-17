from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.riddle_service import riddle_service
from app.schemas.request import RiddleRequestSchema

bp = Blueprint('riddles', __name__, url_prefix='/api/riddles')


@bp.route('/generate', methods=['POST'])
def generate_riddle():
    schema = RiddleRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = riddle_service.generate_riddle(data['theme'], data['difficulty'])

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)