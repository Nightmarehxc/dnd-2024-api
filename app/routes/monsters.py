from flask import Blueprint, request, jsonify
from app.services.monster_service import monster_service
from app.schemas.request import MonsterRequestSchema

bp = Blueprint('monsters', __name__, url_prefix='/api/monsters')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = MonsterRequestSchema().load(request.json)
        # target_cr es opcional
        cr = data.get('target_cr')
        return jsonify(monster_service.generate_monster(data['base_monster'], data['theme'], cr))
    except Exception as e: return jsonify({"error": str(e)}), 400