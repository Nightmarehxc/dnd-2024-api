from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.item_service import item_service # <--- NUEVO IMPORT
from app.schemas.request import ItemRequestSchema

bp = Blueprint('items', __name__, url_prefix='/api/items')

@bp.route('/generate', methods=['POST'])
def generate_item():
    schema = ItemRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    # Llamada limpia al servicio específico
    result = item_service.generate(data['description'], data['type'])
    return jsonify(result)