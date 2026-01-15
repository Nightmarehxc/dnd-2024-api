from flask import Blueprint, request, jsonify
from app.services.history_service import history_service

bp = Blueprint('history', __name__, url_prefix='/api/history')


# GET /api/history/npc
@bp.route('/<string:type_name>', methods=['GET'])
def get_history(type_name):
    data = history_service.get_all(type_name)
    return jsonify(data)


# POST /api/history/npc
@bp.route('/<string:type_name>', methods=['POST'])
def save_entry(type_name):
    req = request.json or {}
    if not req.get('data'):
        return jsonify({"error": "No data provided"}), 400

    entry = history_service.save_entry(req['data'], type_name)
    return jsonify(entry)


# DELETE /api/history/npc/12345
@bp.route('/<string:type_name>/<string:item_id>', methods=['DELETE'])
def delete_entry(type_name, item_id):
    result = history_service.delete_entry(item_id, type_name)
    return jsonify(result)