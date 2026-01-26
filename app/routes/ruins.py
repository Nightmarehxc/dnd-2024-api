from flask import Blueprint, request, jsonify
from app.services.ruins_service import ruins_service
from app.schemas.request import RuinsLoreRequestSchema
from app.models import Ruins
from app import db

bp = Blueprint('ruins', __name__, url_prefix='/api/ruins')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = RuinsLoreRequestSchema().load(request.json)
        result = ruins_service.generate_lore(data['name'], data['ruin_type'])
        
        if "error" in result:
            return jsonify(result), 500
        
        # Guardar en la base de datos
        try:
            ruins = Ruins(
                name=result.get('name'),
                ruin_type=data['ruin_type'],
                original_use=result.get('original_use'),
                cataclysm=result.get('cataclysm'),
                current_state=result.get('current_state'),
                inhabitants=result.get('inhabitants'),
                secret=result.get('secret')
            )
            db.session.add(ruins)
            db.session.commit()
            result['id'] = ruins.id
        except Exception as e:
            db.session.rollback()
            print(f"Error guardando ruina: {e}")
        
        return jsonify(result)
    except Exception as e: 
        return jsonify({"error": str(e)}), 400

@bp.route('/list', methods=['GET'])
def list_ruins():
    """Listar todas las ruinas guardadas"""
    try:
        ruins = Ruins.query.order_by(Ruins.timestamp.desc()).all()
        return jsonify([r.get_data() for r in ruins])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:ruins_id>', methods=['GET'])
def get_ruins(ruins_id):
    """Obtener una ruina específica"""
    try:
        ruins = Ruins.query.get_or_404(ruins_id)
        return jsonify(ruins.get_data())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:ruins_id>', methods=['DELETE'])
def delete_ruins(ruins_id):
    """Eliminar una ruina"""
    try:
        ruins = Ruins.query.get_or_404(ruins_id)
        db.session.delete(ruins)
        db.session.commit()
        return jsonify({"message": "Ruina eliminada"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500