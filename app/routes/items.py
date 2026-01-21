from flask import Blueprint, request, jsonify
from app.services.item_service import item_service
from app.schemas.request import ItemRequestSchema

bp = Blueprint('items', __name__, url_prefix='/api/items')


@bp.route('/generate', methods=['POST'])
def generate():
    try:
        # Validar datos con Marshmallow
        data = ItemRequestSchema().load(request.json)

        # Llamar al servicio con los nombres de parámetros correctos
        result = item_service.generate_item(
            name=data['name'],
            item_type=data['item_type'],
            rarity=data['rarity'],
            attunement=data['attunement']
        )
        return jsonify(result)
    except Exception as e:
        # Esto te ayudará a ver qué campo falla exactamente en la consola del navegador
        return jsonify({"error": f"Validation Error: {str(e)}"}), 400