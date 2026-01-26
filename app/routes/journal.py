from flask import Blueprint, request, jsonify
from app.services.journal_service import journal_service
from app.schemas.request import JournalRequestSchema
import json

bp = Blueprint('journal', __name__, url_prefix='/api/journal')


@bp.route('/generate', methods=['POST'])
def generate():
    try:
        # 1. Validar datos
        data = JournalRequestSchema().load(request.json)

        # 2. Llamar al servicio
        # El servicio ahora se encarga de devolver un diccionario siempre
        result = journal_service.generate_recap(
            raw_notes=data['raw_notes'],
            tone=data['tone']
        )

        # 3. Guardar en Base de Datos
        # IMPORTANTE: Importar aquí dentro para evitar "Circular Import Error"
        from app.models import GeneratedItem
        from app import db

        # Asegurarnos de que result es un dict (por si acaso falló el parseo en el servicio)
        if isinstance(result, str):
            result = {"session_title": "Nota sin formato", "epic_recap": result}

        new_item = GeneratedItem(
            item_type='journal',
            name=result.get('session_title', 'Crónica sin título'),
            data=result,
            user_id='demo_user'
        )
        db.session.add(new_item)
        db.session.commit()

        # 4. Devolver respuesta con el ID
        result['_db_id'] = new_item.id
        return jsonify(result)

    except Exception as e:
        print(f"Error Journal CRITICAL: {e}")
        # Devolver error JSON para que el frontend no rompa con 'unexpected character'
        return jsonify({"error": str(e)}), 400