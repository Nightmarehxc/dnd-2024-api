from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.villain_service import villain_service
from app.schemas.request import VillainRequestSchema
from app.models import Villain
from app import db

bp = Blueprint('villains', __name__, url_prefix='/api/villains')

@bp.route('/generate', methods=['POST'])
def generate_villain():
    schema = VillainRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = villain_service.generate_villain(data['theme'], data['level_range'])

    if "error" in result:
        return jsonify(result), 500

    # Guardar en la base de datos
    try:
        villain = Villain(
            name=result.get('name'),
            tipo=result.get('archetype'),
            objetivo=result.get('motivation'),
            debilidades=result.get('weaknesses', 'Por determinar'),
            estadisticas={
                'ca': result.get('ca', 15),
                'hp': result.get('hp', 100),
                'speed': result.get('speed', 30),
                'stats': result.get('stats', {}),
                'race': result.get('race', 'Desconocida')
            },
            habilidades={
                'attacks': result.get('attacks', []),
                'special_abilities': result.get('special_abilities', []),
                'legendary_actions': result.get('legendary_actions', []),
                'lieutenants': result.get('lieutenants', [])
            },
            planes={
                'master_plan': result.get('master_plan'),
                'plan_phases': result.get('plan_phases', []),
                'lair': result.get('lair'),
                'famous_quote': result.get('famous_quote')
            }
        )
        db.session.add(villain)
        db.session.commit()
        result['id'] = villain.id
    except Exception as e:
        db.session.rollback()
        print(f"Error guardando villano: {e}")

    return jsonify(result)

@bp.route('/list', methods=['GET'])
def list_villains():
    """Listar todos los villanos guardados"""
    try:
        villains = Villain.query.order_by(Villain.timestamp.desc()).all()
        return jsonify([{
            'id': v.id,
            'name': v.name,
            'archetype': v.tipo,
            'race': v.estadisticas.get('race') if v.estadisticas else 'Desconocida',
            'motivation': v.objetivo,
            'master_plan': v.planes.get('master_plan') if v.planes else None,
            'plan_phases': v.planes.get('plan_phases', []) if v.planes else [],
            'lair': v.planes.get('lair') if v.planes else None,
            'famous_quote': v.planes.get('famous_quote') if v.planes else None,
            'ca': v.estadisticas.get('ca') if v.estadisticas else 15,
            'hp': v.estadisticas.get('hp') if v.estadisticas else 100,
            'speed': v.estadisticas.get('speed') if v.estadisticas else 30,
            'stats': v.estadisticas.get('stats', {}) if v.estadisticas else {},
            'attacks': v.habilidades.get('attacks', []) if v.habilidades else [],
            'special_abilities': v.habilidades.get('special_abilities', []) if v.habilidades else [],
            'legendary_actions': v.habilidades.get('legendary_actions', []) if v.habilidades else [],
            'lieutenants': v.habilidades.get('lieutenants', []) if v.habilidades else [],
            'created_at': v.timestamp.isoformat() if v.timestamp else None
        } for v in villains])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:villain_id>', methods=['GET'])
def get_villain(villain_id):
    """Obtener un villano específico"""
    try:
        villain = Villain.query.get_or_404(villain_id)
        return jsonify({
            'id': villain.id,
            'name': villain.name,
            'archetype': villain.tipo,
            'race': villain.estadisticas.get('race') if villain.estadisticas else 'Desconocida',
            'motivation': villain.objetivo,
            'master_plan': villain.planes.get('master_plan') if villain.planes else None,
            'plan_phases': villain.planes.get('plan_phases', []) if villain.planes else [],
            'lair': villain.planes.get('lair') if villain.planes else None,
            'famous_quote': villain.planes.get('famous_quote') if villain.planes else None,
            'ca': villain.estadisticas.get('ca') if villain.estadisticas else 15,
            'hp': villain.estadisticas.get('hp') if villain.estadisticas else 100,
            'speed': villain.estadisticas.get('speed') if villain.estadisticas else 30,
            'stats': villain.estadisticas.get('stats', {}) if villain.estadisticas else {},
            'attacks': villain.habilidades.get('attacks', []) if villain.habilidades else [],
            'special_abilities': villain.habilidades.get('special_abilities', []) if villain.habilidades else [],
            'legendary_actions': villain.habilidades.get('legendary_actions', []) if villain.habilidades else [],
            'lieutenants': villain.habilidades.get('lieutenants', []) if villain.habilidades else [],
            'weaknesses': villain.debilidades,
            'created_at': villain.timestamp.isoformat() if villain.timestamp else None
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:villain_id>', methods=['DELETE'])
def delete_villain(villain_id):
    """Eliminar un villano"""
    try:
        villain = Villain.query.get_or_404(villain_id)
        db.session.delete(villain)
        db.session.commit()
        return jsonify({"message": "Villano eliminado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500