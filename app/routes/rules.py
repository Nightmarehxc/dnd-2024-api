from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.rule_service import rule_service
from app.schemas.request import RuleRequestSchema

bp = Blueprint('rules', __name__, url_prefix='/api/rules')

@bp.route('/ask', methods=['POST'])
def ask_rule():
    schema = RuleRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Consulta inválida", "detalles": err.messages}), 400

    result = rule_service.ask_rule(data['query'])

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)