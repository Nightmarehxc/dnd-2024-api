from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.mystery_service import mystery_service
from app.schemas.request import MysteryRequestSchema
from app.models import Mystery
from app import db

bp = Blueprint('mysteries', __name__, url_prefix='/api/mysteries')

@bp.route('/generate', methods=['POST'])
def generate():
    schema = MysteryRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        print(f"Error Mystery: {err.messages}")
        return jsonify({"error": "Validación fallida", "detalles": err.messages}), 400

    try:
        # 1. Generar contenido con Gemini
        result = mystery_service.generate_mystery(data['setting'], data['difficulty'])
        
        # DEBUG: Ver qué devuelve Gemini
        print(f"[MYSTERY DEBUG] Resultado de Gemini:")
        print(f"  Keys disponibles: {list(result.keys())}")
        print(f"  Contenido: {result}")

        if "error" in result:
            return jsonify(result), 500

        # 2. Guardar en la base de datos
        # Obtener valores con fallback a claves en español
        title = result.get('title') or result.get('titulo') or 'Misterio Sin Título'
        crime_event = result.get('crime_event') or result.get('crimen_evento') or ''
        clues = result.get('clues') or result.get('pistas') or []
        truth = result.get('truth') or result.get('verdad') or ''
        suspects = result.get('suspects') or result.get('sospechosos') or []
        
        print(f"[MYSTERY DEBUG] Datos extraídos:")
        print(f"  title: {title}")
        print(f"  crime_event: {crime_event[:50] if crime_event else 'VACÍO'}...")
        print(f"  clues: {len(clues)} pistas")
        print(f"  truth: {truth[:50] if truth else 'VACÍO'}...")
        
        mystery = Mystery(
            name=title,
            descripcion=crime_event,
            pistas=clues,
            sospechosos=suspects,
            solucion=truth,
            consecuencias=''
        )
        db.session.add(mystery)
        db.session.commit()
        
        print(f"[MYSTERY DEBUG] Guardado en BD con ID: {mystery.id}")

        # 3. Retornar datos con ID de BD (normalizado)
        return jsonify({
            '_db_id': mystery.id,
            'title': title,
            'crime_event': crime_event,
            'suspects': suspects,
            'clues': clues,
            'truth': truth,
            # Mantener compatibilidad con claves en español
            'titulo': title,
            'crimen_evento': crime_event,
            'sospechosos': suspects,
            'pistas': clues,
            'verdad': truth
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error Mystery: {e}")
        return jsonify({"error": str(e)}), 400


# ============================================
# READ - Obtener un misterio por ID
# ============================================
@bp.route('/<int:mystery_id>', methods=['GET'])
def get_mystery(mystery_id):
    try:
        mystery = Mystery.query.get(mystery_id)
        if not mystery:
            return jsonify({"error": "Misterio no encontrado"}), 404

        return jsonify({
            '_db_id': mystery.id,
            'title': mystery.name,
            'crime_event': mystery.descripcion,
            'clues': mystery.pistas,
            'solution': mystery.solucion,
            'consequences': mystery.consecuencias or ''
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500