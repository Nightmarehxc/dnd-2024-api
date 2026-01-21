from flask import Blueprint, request, jsonify
from app.services.shop_service import shop_service
from app.schemas.request import ShopRequestSchema

bp = Blueprint('shops', __name__, url_prefix='/api/shops')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = ShopRequestSchema().load(request.json)
        return jsonify(shop_service.generate_shop(
            data['shop_type'],
            data['level'],
            data.get('location') # Pasamos la ciudad
        ))
    except Exception as e: return jsonify({"error": str(e)}), 400