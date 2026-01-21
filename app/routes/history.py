from flask import Blueprint, request, jsonify
from app.services.history_service import history_service

bp = Blueprint('history', __name__, url_prefix='/api/history')


# Obtener lista
@bp.route('/<item_type>', methods=['GET'])
def get_history(item_type):
    return jsonify(history_service.get_all_by_type(item_type))


# Guardar nuevo
@bp.route('/<item_type>', methods=['POST'])
def add_to_history(item_type):
    # Esperamos { "data": { ...objeto... } }
    payload = request.json.get('data')
    if not payload:
        return jsonify({"error": "No data provided"}), 400
    return jsonify(history_service.save_item(item_type, payload))


# Borrar (ID es numérico ahora)
@bp.route('/<item_type>/<int:item_id>', methods=['DELETE'])
def delete_item(item_type, item_id):
    success = history_service.delete_item(item_id)
    return jsonify({"success": success})


# Editar (ID es numérico ahora)
@bp.route('/<item_type>/<int:item_id>', methods=['PUT'])
def update_item(item_type, item_id):
    payload = request.json.get('data')
    if not payload:
        return jsonify({"error": "No data provided"}), 400

    result = history_service.update_item(item_id, payload)
    if result:
        return jsonify(result)
    return jsonify({"error": "Item not found"}), 404