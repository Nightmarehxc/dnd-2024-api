from flask import Blueprint, request, jsonify
from app.services.mystery_service import mystery_service
from app.schemas.request import MysteryRequestSchema

bp = Blueprint('mysteries', __name__, url_prefix='/api/mysteries')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = MysteryRequestSchema().load(request.json)
        return jsonify(mystery_service.generate_mystery(data['setting'], data['difficulty']))
    except Exception as e: return jsonify({"error": str(e)}), 400