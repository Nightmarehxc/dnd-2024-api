from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.adventure_service import adventure_service
from app.schemas.request import AdventureRequestSchema

bp = Blueprint('adventures', __name__, url_prefix='/api/adventures')

@bp.route('/generate', methods=['POST'])
def generate_adventure():
    schema = AdventureRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = adventure_service.generate_adventure(data['theme'], data['players'], data['level'])
    
    # DEBUG: Mostrar qué recibimos
    print(f"[DEBUG] Resultado del servicio: {result}")
    print(f"[DEBUG] Tipo: {type(result)}")
    
    # Si hay error en la respuesta, devolverlo
    if isinstance(result, dict) and 'error' in result:
        return jsonify(result), 400
    
    # La respuesta debe ser un dict con los datos de la aventura
    # Si result es válido, devolverlo directamente
    return jsonify(result)