from flask import Blueprint, request, jsonify
from app.services.npc_service import npc_service
import json

bp = Blueprint('npcs', __name__, url_prefix='/api/npcs')


@bp.route('/generate', methods=['POST'])
def generate_npc():
    data = request.get_json() or {}
    description = data.get('description', 'Un ciudadano común')
    result = npc_service.generate(description)
    return jsonify(result)


@bp.route('/chat', methods=['POST'])
def chat_npc():
    data = request.json or {}

    # 1. Extracción de datos agnóstica (Funciona para Web y Foundry)
    # Si viene 'npc_data' (Web), lo usa. Si no, intenta armarlo con los datos sueltos (Foundry).
    npc_data = data.get('npc_data')
    if not npc_data:
        npc_data = {
            "name": data.get('npc_name', 'Desconocido'),
            "role": data.get('role', 'Habitante'),
            "personality": data.get('bio', 'Genérica'),
            "appearance": "Visible en la escena"
        }

    # 2. Mapeo de mensaje (Web usa 'message', Foundry usa 'question')
    user_message = data.get('message') or data.get('question')

    # 3. Historial y Contexto Extra
    history = data.get('history', [])
    location = data.get('location', '')  # <--- NUEVO: Saber dónde estamos

    # Validación básica
    if not user_message:
        return jsonify({"error": "Falta el mensaje del usuario"}), 400

    # 4. Inyectar el lugar en el mensaje si existe (Truco para dar contexto sin tocar el servicio)
    if location:
        # Añadimos el contexto de lugar como una "acotación" al sistema
        # Esto evita tener que modificar npc_service.py
        user_message = f"[Situación: Estamos en {location}] {user_message}"

    try:
        response_text = npc_service.chat(npc_data, history, user_message)
        return jsonify({"response": response_text})
    except Exception as e:
        print(f"ERROR CHAT: {e}")
        return jsonify({"error": "El NPC se ha quedado mudo (Error interno)"}), 500

    # Llamamos a tu servicio existente (que ya funciona perfecto)
    response_text = npc_service.chat(npc_data, history, user_message)

    return jsonify({"response": response_text})


# --- RUTA DE AUDIO MEJORADA ---
@bp.route('/chat/audio', methods=['POST'])
def chat_npc_audio():
    print("\n--- 🎤 DEBUG AUDIO CHAT ---")

    # 1. Verificar Audio
    if 'audio' not in request.files:
        print("❌ Error: No se recibió archivo 'audio' en request.files")
        return jsonify({"error": "No se recibió archivo de audio"}), 400

    audio_file = request.files['audio']

    # 2. Obtener datos crudos
    npc_data_str = request.form.get('npc_data')
    history_str = request.form.get('history')

    print(f"📦 NPC Data (raw): {npc_data_str[:50]}..." if npc_data_str else "❌ NPC Data es None")

    # 3. Validación y Parsing de NPC Data (Crítico)
    if not npc_data_str or npc_data_str == "undefined" or npc_data_str == "null":
        return jsonify({"error": "Datos del NPC inválidos o vacíos"}), 400

    try:
        npc_data = json.loads(npc_data_str)
    except json.JSONDecodeError as e:
        print(f"❌ Error JSON NPC: {e}")
        print(f"String recibido: {npc_data_str}")
        return jsonify({"error": f"JSON corrupto en npc_data: {str(e)}"}), 400

    # 4. Parsing de Historial (Opcional)
    history = []
    if history_str and history_str != "undefined" and history_str != "null":
        try:
            history = json.loads(history_str)
        except json.JSONDecodeError:
            print("⚠️ Error leyendo historial, iniciando vacío.")
            history = []

    # 5. Procesar Audio
    try:
        audio_bytes = audio_file.read()
        print(f"🔊 Audio leído: {len(audio_bytes)} bytes")

        response_text = npc_service.chat(npc_data, history, user_message=None, audio_bytes=audio_bytes)
        print(f"🤖 Respuesta Gemini: {response_text[:50]}...")

        return jsonify({"response": response_text})

    except Exception as e:
        print(f"🔥 Error interno: {e}")
        return jsonify({"error": f"Error procesando audio: {str(e)}"}), 500