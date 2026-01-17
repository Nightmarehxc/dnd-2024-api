from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.encounter_service import encounter_service
from app.schemas.request import EncounterRequestSchema

bp = Blueprint('encounters', __name__, url_prefix='/api/encounters')

@bp.route('/generate', methods=['POST'])
def generate_encounter():
    schema = EncounterRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = encounter_service.generate_encounter(
        data['level'],
        data['difficulty'],
        data['environment'],
        data['players']
    )

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)