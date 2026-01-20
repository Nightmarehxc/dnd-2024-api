from flask import Blueprint, request, jsonify
from app.services.contract_service import contract_service
from app.schemas.request import ContractRequestSchema

bp = Blueprint('contracts', __name__, url_prefix='/api/contracts')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = ContractRequestSchema().load(request.json)
        return jsonify(contract_service.generate_contract(data['patron'], data['desire']))
    except Exception as e: return jsonify({"error": str(e)}), 400