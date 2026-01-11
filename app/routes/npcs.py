from flask import Blueprint, request, jsonify
from app.services.gemini_service import ai_service

bp = Blueprint('npcs', __name__, url_prefix='/api/npcs')


@bp.route('/generate', methods=['POST'])
def generate_npc():
    data = request.get_json() or {}
    description = data.get('description', 'Un ciudadano común')

    result = ai_service.generate("npc", description)
    return jsonify(result)