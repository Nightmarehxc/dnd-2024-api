from flask import Blueprint, request, jsonify
from app.services.inn_service import inn_service
from app.schemas.request import InnRequestSchema

bp = Blueprint('inns', __name__, url_prefix='/api/inns')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = InnRequestSchema().load(request.json)
        return jsonify(inn_service.generate_inn(
            data['name'],
            data['comfort_level'],
            data['theme'],
            data.get('city') # Pasamos la ciudad
        ))
    except Exception as e: return jsonify({"error": str(e)}), 400