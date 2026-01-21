from flask import Blueprint, request, jsonify
from app.services.ruins_service import ruins_service
from app.schemas.request import RuinsLoreRequestSchema

bp = Blueprint('ruins', __name__, url_prefix='/api/ruins')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = RuinsLoreRequestSchema().load(request.json)
        return jsonify(ruins_service.generate_lore(data['name'], data['ruin_type']))
    except Exception as e: return jsonify({"error": str(e)}), 400