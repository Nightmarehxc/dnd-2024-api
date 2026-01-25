from flask import Blueprint, request, jsonify
from app.services.history_service import history_service

bp = Blueprint('history', __name__, url_prefix='/api/history')


# Obtener lista
@bp.route('/<item_type>', methods=['GET'])
def get_history(item_type):
    print(f"[HISTORY-GET] Solicitando historial para: {item_type}")
    result = history_service.get_all_by_type(item_type)
    print(f"[HISTORY-GET] Resultados encontrados: {len(result)}")
    return jsonify(result)


# Guardar nuevo
@bp.route('/<item_type>', methods=['POST'])
def add_to_history(item_type):
    print(f"\n[HISTORY-POST] Recibida solicitud POST para tipo: {item_type}")
    print(f"[HISTORY-POST] Body completo: {request.json}")
    
    # Esperamos { "data": { ...objeto... } }
    payload = request.json.get('data') if request.json else None
    
    if not payload:
        print(f"[HISTORY-POST] ERROR: No data provided en payload")
        return jsonify({"error": "No data provided"}), 400
    
    print(f"[HISTORY-POST] Payload a guardar: {payload}")
    result = history_service.save_item(item_type, payload)
    print(f"[HISTORY-POST] Resultado guardado: {result}")
    return jsonify(result)


# Borrar (ID es numérico ahora)
@bp.route('/<item_type>/<int:item_id>', methods=['DELETE'])
def delete_item(item_type, item_id):
    print(f"[HISTORY-DELETE] Eliminando item {item_id} de tipo {item_type}")
    success = history_service.delete_item(item_id)
    return jsonify({"success": success})


# Editar (ID es numérico ahora)
@bp.route('/<item_type>/<int:item_id>', methods=['PUT'])
def update_item(item_type, item_id):
    print(f"[HISTORY-PUT] Actualizando item {item_id} de tipo {item_type}")
    payload = request.json.get('data') if request.json else None
    if not payload:
        print(f"[HISTORY-PUT] ERROR: No data provided")
        return jsonify({"error": "No data provided"}), 400

    result = history_service.update_item(item_id, payload, item_type)
    if result:
        return jsonify(result)
    return jsonify({"error": "Item not found"}), 404