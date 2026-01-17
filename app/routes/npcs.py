from flask import Blueprint, request, jsonify
from app.services.npc_service import npc_service # <--- NUEVO IMPORT

bp = Blueprint('npcs', __name__, url_prefix='/api/npcs')

@bp.route('/generate', methods=['POST'])
def generate_npc():
    data = request.get_json() or {}
    description = data.get('description', 'Un ciudadano común')

    result = npc_service.generate(description)
    return jsonify(result)


@bp.route('/chat', methods=['POST'])
def chat_npc():
    data = request.json or {}
    npc_data = data.get('npc_data')
    history = data.get('history', [])
    user_message = data.get('message')

    if not npc_data or not user_message:
        return jsonify({"error": "Faltan datos"}), 400

    response_text = npc_service.chat(npc_data, history, user_message)

    return jsonify({"response": response_text})