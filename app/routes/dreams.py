from flask import Blueprint, request, jsonify
from app.services.dream_service import dream_service
from app.schemas.request import DreamRequestSchema

bp = Blueprint('dreams', __name__, url_prefix='/api/dreams')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = DreamRequestSchema().load(request.json)
        return jsonify(dream_service.generate_dream(data['context'], data['tone']))
    except Exception as e: return jsonify({"error": str(e)}), 400