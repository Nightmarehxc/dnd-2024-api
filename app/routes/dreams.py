from flask import Blueprint, request, jsonify
from app.services.dream_service import dream_service
from app.schemas.request import DreamRequestSchema
from app.models import Dream
from app import db

bp = Blueprint('dreams', __name__, url_prefix='/api/dreams')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = DreamRequestSchema().load(request.json)
        
        # Generar el sueño con Gemini
        result = dream_service.generate_dream(data['context'], data['tone'])
        
        # Guardar en la base de datos
        dream = Dream(
            name=f"Sueño ({data['tone']})",
            contexto=data['context'],
            tono=data['tone'],
            imagenes=result.get('visions', result.get('imagenes', '')),
            sensaciones=result.get('sensations', result.get('sensaciones', '')),
            significado=result.get('meaning', result.get('significado', ''))
        )
        
        db.session.add(dream)
        db.session.commit()
        
        # Devolver el resultado con la estructura esperada
        return jsonify({
            'id': dream.id,
            'visions': dream.imagenes,
            'sensations': dream.sensaciones,
            'meaning': dream.significado,
            # Compatibilidad con frontend antiguo
            'imagenes': dream.imagenes,
            'sensaciones': dream.sensaciones,
            'significado': dream.significado
        })
        
    except Exception as e: 
        db.session.rollback()
        return jsonify({"error": str(e)}), 400