from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.shop_service import shop_service
from app.schemas.request import ShopRequestSchema
from app.services.history_service import history_service  # Para guardar historial

bp = Blueprint('shops', __name__, url_prefix='/api/shops')


@bp.route('/generate', methods=['POST'])
def generate_shop():
    schema = ShopRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = shop_service.generate_shop(data['shop_type'],
                                        data['location'],
                                        data['level'],
                                        data.get('vendor_race')
                                        )

    # Si hay error en la IA, lo devolvemos
    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)