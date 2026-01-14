from flask import Blueprint, request, jsonify
from app.services.npc_service import npc_service # <--- NUEVO IMPORT

bp = Blueprint('npcs', __name__, url_prefix='/api/npcs')

@bp.route('/generate', methods=['POST'])
def generate_npc():
    data = request.get_json() or {}
    description = data.get('description', 'Un ciudadano común')

    result = npc_service.generate(description)
    return jsonify(result)