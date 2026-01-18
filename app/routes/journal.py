from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.journal_service import journal_service
from app.schemas.request import JournalRequestSchema

bp = Blueprint('journal', __name__, url_prefix='/api/journal')

@bp.route('/generate', methods=['POST'])
def generate_chronicle():
    schema = JournalRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Notas inválidas", "detalles": err.messages}), 400

    result = journal_service.generate_chronicle(data['notes'])

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)