from flask import Blueprint, request, jsonify
from app.services.library_service import library_service

bp = Blueprint('library', __name__, url_prefix='/api/library')

@bp.route('/import-foundry', methods=['POST'])
def import_foundry():
    if 'file' not in request.files:
        return jsonify({"error": "No se ha subido ningún archivo"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nombre de archivo vacío"}), 400

    try:
        import json
        data = json.load(file)

        # Desempaquetamos los dos valores que ahora devuelve el servicio
        stats, character_data = library_service.process_foundry_import(data)

        return jsonify({
            "message": "Importación completada",
            "detalles": stats,
            "character": character_data  # <--- ¡Esto es lo que faltaba!
        })

    except Exception as e:
        return jsonify({"error": f"Error procesando el archivo: {str(e)}"}), 500

@bp.route('/options', methods=['GET'])
def get_library_options():
    """Devuelve las razas y clases disponibles en la biblioteca local"""
    return jsonify(library_service.get_options())