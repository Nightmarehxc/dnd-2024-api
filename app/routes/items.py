from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.gemini_service import ai_service
from app.schemas.request import ItemRequestSchema

bp = Blueprint('items', __name__, url_prefix='/api/items')


@bp.route('/generate', methods=['POST'])
def generate_item():
    """
    Genera un Objeto Mágico o Mundano (con reglas 2024).
    ---
    tags:
      - Objetos
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            description:
              type: string
              example: "Una daga hecha de hielo eterno"
            type:
              type: string
              example: "Arma"
              enum: ["Arma", "Armadura", "Poción", "Objeto Maravilloso", "Cualquiera"]
    responses:
      200:
        description: Objeto generado exitosamente.
      400:
        description: Error de validación.
    """
    schema = ItemRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    full_desc = f"{data['description']}, Tipo: {data['type']}"
    result = ai_service.generate("item", full_desc)
    return jsonify(result)