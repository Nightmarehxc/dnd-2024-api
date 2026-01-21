from flask import Blueprint, request, jsonify
from app.services.journal_service import journal_service
from app.schemas.request import JournalRequestSchema

bp = Blueprint('journal', __name__, url_prefix='/api/journal')


@bp.route('/generate', methods=['POST'])
def generate():
    try:
        # Validar los datos recibidos (raw_notes, tone)
        data = JournalRequestSchema().load(request.json)

        # Llamar al servicio
        result = journal_service.generate_recap(
            raw_notes=data['raw_notes'],
            tone=data['tone']
        )
        return jsonify(result)

    except Exception as e:
        print(f"Error Journal: {e}")
        return jsonify({"error": str(e)}), 400