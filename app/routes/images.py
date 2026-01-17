from flask import Blueprint, request, jsonify
from app.services.image_service import image_service

bp = Blueprint('images', __name__, url_prefix='/api/images')


@bp.route('/generate', methods=['POST'])
def generate():
    data = request.json or {}
    description = data.get('description')
    entity_type = data.get('type', 'generic')  # 'npc', 'item', 'location'

    if not description:
        return jsonify({"error": "Se requiere una descripción"}), 400

    result = image_service.generate_image(description, entity_type)

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)