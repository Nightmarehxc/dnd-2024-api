from flask import Blueprint, request, jsonify
from app.services.atmosphere_service import atmosphere_service
from app.schemas.request import AtmosphereRequestSchema
from app.models import Atmosphere
from app import db

bp = Blueprint('atmosphere', __name__, url_prefix='/api/atmosphere')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = AtmosphereRequestSchema().load(request.json)
        
        # Generar la descripción atmosférica con Gemini
        result = atmosphere_service.generate_atmosphere(
            data['place'], 
            data.get('context', '')
        )
        
        # Guardar en la base de datos
        atmosphere = Atmosphere(
            name=f"Atmósfera: {data['place']}",
            place=data['place'],
            context=data.get('context', ''),
            sight=result.get('sight', ''),
            sound=result.get('sound', ''),
            smell=result.get('smell', ''),
            touch=result.get('touch', ''),
            atmosphere=result.get('atmosphere', '')
        )
        
        db.session.add(atmosphere)
        db.session.commit()
        
        # Devolver el resultado
        return jsonify({
            'id': atmosphere.id,
            'sight': atmosphere.sight,
            'sound': atmosphere.sound,
            'smell': atmosphere.smell,
            'touch': atmosphere.touch,
            'atmosphere': atmosphere.atmosphere
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/history', methods=['GET'])
def get_history():
    try:
        atmospheres = Atmosphere.query.order_by(Atmosphere.timestamp.desc()).all()
        return jsonify([atm.to_dict() for atm in atmospheres])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/history/<int:atmosphere_id>', methods=['GET'])
def get_history_item(atmosphere_id):
    try:
        atmosphere = Atmosphere.query.get(atmosphere_id)
        if atmosphere:
            return jsonify(atmosphere.to_dict())
        return jsonify({'error': 'Atmosphere description not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/history/<int:atmosphere_id>', methods=['DELETE'])
def delete_history_item(atmosphere_id):
    try:
        atmosphere = Atmosphere.query.get(atmosphere_id)
        if atmosphere:
            db.session.delete(atmosphere)
            db.session.commit()
            return jsonify({'message': 'Atmosphere description deleted successfully'})
        return jsonify({'error': 'Atmosphere description not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
