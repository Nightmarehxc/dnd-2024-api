from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.quest_service import quest_service
from app.schemas.request import QuestRequestSchema

bp = Blueprint('quests', __name__, url_prefix='/api/quests')

@bp.route('/generate', methods=['POST'])
def generate_quests():
    schema = QuestRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = quest_service.generate_quests(data['location'], data['level'])

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)