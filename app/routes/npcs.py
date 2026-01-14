from flask import Blueprint, request, jsonify
from app.services.gemini_service import ai_service

bp = Blueprint('npcs', __name__, url_prefix='/api/npcs')


@bp.route('/generate', methods=['POST'])
def generate_npc():
    """
    Genera un NPC (Non-Player Character) con personalidad y rol.
    ---
    tags:
      - NPCs
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            description:
              type: string
              example: "Un posadero misterioso con un parche en el ojo"
              description: Descripción breve del NPC.
    responses:
      200:
        description: NPC generado exitosamente.
      500:
        description: Error del servidor.
    """
    data = request.get_json() or {}
    description = data.get('description', 'Un ciudadano común')

    result = ai_service.generate("npc", description)
    return jsonify(result)