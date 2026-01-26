from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.rule_service import rule_service
from app.schemas.request import RuleRequestSchema
from app.models import Rule
from app import db

bp = Blueprint('rules', __name__, url_prefix='/api/rules')

@bp.route('/ask', methods=['POST'])
def ask_rule():
    schema = RuleRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Consulta inválida", "detalles": err.messages}), 400

    try:
        # 1. Generar respuesta con Gemini
        result = rule_service.ask_rule(data['query'])

        if "error" in result:
            return jsonify(result), 500

        # 2. Guardar en la base de datos
        name = result.get('tema') or result.get('topic') or 'Regla sin título'
        tema = result.get('tema', '')
        explicacion = result.get('explicacion', '')
        cambio_importante = result.get('cambio_importante', '')
        ejemplo = result.get('ejemplo', '')
        pagina_ref = result.get('pagina_ref', '')
        
        rule = Rule(
            name=name,
            tema=tema,
            explicacion=explicacion,
            cambio_importante=cambio_importante,
            ejemplo=ejemplo,
            pagina_ref=pagina_ref
        )
        
        db.session.add(rule)
        db.session.commit()
        
        print(f"[RULE DEBUG] Guardada en BD con ID: {rule.id}")

        # 3. Retornar datos con ID de BD
        return jsonify({
            '_db_id': rule.id,
            'tema': tema,
            'explicacion': explicacion,
            'cambio_importante': cambio_importante,
            'ejemplo': ejemplo,
            'pagina_ref': pagina_ref,
            # Mantener compatibilidad con nombres en inglés
            'topic': tema,
            'explanation': explicacion,
            'important_change': cambio_importante,
            'example': ejemplo,
            'page_reference': pagina_ref
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error Rule: {e}")
        return jsonify({"error": str(e)}), 500


# ============================================
# READ - Obtener una regla por ID
# ============================================
@bp.route('/<int:rule_id>', methods=['GET'])
def get_rule(rule_id):
    try:
        rule = Rule.query.get(rule_id)
        if not rule:
            return jsonify({"error": "Regla no encontrada"}), 404

        return jsonify({
            '_db_id': rule.id,
            'tema': rule.tema,
            'explicacion': rule.explicacion,
            'cambio_importante': rule.cambio_importante,
            'ejemplo': rule.ejemplo,
            'pagina_ref': rule.pagina_ref,
            'topic': rule.tema,
            'explanation': rule.explicacion,
            'important_change': rule.cambio_importante,
            'example': rule.ejemplo,
            'page_reference': rule.pagina_ref
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================
# LIST - Listar todas las reglas
# ============================================
@bp.route('/list', methods=['GET'])
def list_rules():
    try:
        rules = Rule.query.order_by(Rule.timestamp.desc()).all()
        
        return jsonify({
            'total': len(rules),
            'rules': [
                {
                    '_db_id': rule.id,
                    'tema': rule.tema,
                    'timestamp': rule.timestamp.isoformat() if rule.timestamp else None,
                    'explicacion': rule.explicacion[:100] + '...' if len(rule.explicacion) > 100 else rule.explicacion
                }
                for rule in rules
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================
# DELETE - Eliminar una regla
# ============================================
@bp.route('/<int:rule_id>', methods=['DELETE'])
def delete_rule(rule_id):
    try:
        rule = Rule.query.get(rule_id)
        if not rule:
            return jsonify({"error": "Regla no encontrada"}), 404

        db.session.delete(rule)
        db.session.commit()

        return jsonify({"message": "Regla eliminada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500