from flask import Blueprint, request, jsonify
from app.services.gemini_service import ai_service
from app.schemas.request import GenerationRequestSchema

bp = Blueprint('characters', __name__, url_prefix='/api/characters')


@bp.route('/generate', methods=['POST'])
def generate_character():
    """
    Genera un Personaje Jugador (PC) completo.
    ---
    tags:
      - Personajes
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            description:
              type: string
              example: "Un clérigo enano forjado en la guerra"
              description: Descripción base del personaje.
            level:
              type: integer
              example: 3
              default: 1
              description: Nivel del personaje (1-20).
    responses:
      200:
        description: Personaje generado exitosamente con reglas 2024.
        schema:
          type: object
          properties:
            nombre:
              type: string
            clase:
              type: string
            stats:
              type: object
      400:
        description: Error de validación o entrada incorrecta.
      500:
        description: Error del servidor o de la IA.
    """
    # ... (El código de validación y lógica sigue igual) ...
    schema = GenerationRequestSchema()
    data = schema.load(request.json)  # Si esto falla, el error handler global lo captura

    full_description = f"{data['description']} (Nivel {data['level']})"
    result = ai_service.generate("character", full_description)

    return jsonify(result)