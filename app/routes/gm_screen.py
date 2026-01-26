from flask import Blueprint, request, jsonify
from marshmallow import ValidationError, Schema, fields
from app.services.gm_screen_service import gm_screen_service

bp = Blueprint('gm_screen', __name__, url_prefix='/api/gm-screen')


class ReferenceRequestSchema(Schema):
    category = fields.Str(required=True)


class EncounterRequestSchema(Schema):
    party_level = fields.Int(required=True)
    terrain = fields.Str(required=True)
    difficulty = fields.Str(required=True)


class NPCRequestSchema(Schema):
    context = fields.Str(required=False, allow_none=True)


class ImprovisationRequestSchema(Schema):
    prompt_type = fields.Str(required=True)


@bp.route('/reference', methods=['POST'])
def get_reference():
    """
    Obtiene información de referencia rápida
    Categorías: conditions, actions, difficulty, skills, combat, travel, rests, death, cover, advantage, inspiration, exhaustion
    """
    schema = ReferenceRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    try:
        result = gm_screen_service.get_reference_info(data['category'])
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route('/encounter', methods=['POST'])
def generate_encounter():
    """
    Genera un encuentro aleatorio balanceado
    """
    schema = EncounterRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    try:
        result = gm_screen_service.generate_random_encounter(
            data['party_level'],
            data['terrain'],
            data['difficulty']
        )
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route('/quick-npc', methods=['POST'])
def get_quick_npc():
    """
    Genera un NPC rápido para improvisar
    """
    schema = NPCRequestSchema()
    try:
        data = schema.load(request.json or {})
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    try:
        result = gm_screen_service.get_quick_npc(data.get('context', ''))
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route('/improvisation', methods=['POST'])
def get_improvisation():
    """
    Obtiene prompts para improvisar
    Tipos: complications, secrets, twists, treasures, names, rumors, hooks, locations
    """
    schema = ImprovisationRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    try:
        result = gm_screen_service.get_improvisation_prompt(data['prompt_type'])
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
