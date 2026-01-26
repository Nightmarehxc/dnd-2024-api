from flask import Blueprint, request, jsonify
from marshmallow import ValidationError, Schema, fields, validate
from app.services.stronghold_service import stronghold_service
from app.models import Stronghold
from app import db

bp = Blueprint('strongholds', __name__, url_prefix='/api/strongholds')


class StrongholdRequestSchema(Schema):
    stronghold_type = fields.String(
        required=True,
        validate=validate.OneOf(
            ["Castle", "Wizard Tower", "Guild Hall", "Temple", "Fortress", "Manor", "Keep"],
            error="Tipo de baluarte no válido"
        )
    )
    name = fields.String(required=False, load_default="")
    level = fields.Integer(
        required=True,
        validate=validate.Range(min=5, max=20, error="El nivel debe ser entre 5 y 20")
    )
    location_description = fields.String(required=False, load_default="")


class FacilityBuildRequestSchema(Schema):
    facility_id = fields.Integer(required=True)
    stronghold_id = fields.Integer(required=True)


class BastionTurnRequestSchema(Schema):
    stronghold_id = fields.Integer(required=True)
    character_level = fields.Integer(required=True, validate=validate.Range(min=5, max=20))


class AssignOrderRequestSchema(Schema):
    facility_id = fields.Integer(required=True)
    order_type = fields.String(required=True, validate=validate.OneOf(
        ['Craft', 'Research', 'Gather', 'Trade', 'Recruit', 'Empower'],
        error="Tipo de orden no válido"
    ))


class HirelingRequestSchema(Schema):
    role = fields.String(required=True)
    stronghold_type = fields.String(required=True)


class EventRequestSchema(Schema):
    stronghold_type = fields.String(required=True)
    severity = fields.String(
        required=False,
        load_default="Moderate",
        validate=validate.OneOf(
            ["Minor", "Moderate", "Major"],
            error="Severidad no válida"
        )
    )


@bp.route('/facilities', methods=['GET'])
def get_available_facilities():
    """
    Lista las instalaciones disponibles según el nivel del personaje
    """
    level = request.args.get('level', type=int, default=5)
    if level < 5 or level > 20:
        return jsonify({'error': 'Level must be between 5 and 20'}), 400
    
    facilities = stronghold_service.get_available_facilities(level)
    return jsonify(facilities)


@bp.route('/build-facility', methods=['POST'])
def build_facility():
    """
    Inicia la construcción de una instalación en un baluarte
    """
    schema = FacilityBuildRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400
    
    result = stronghold_service.start_facility_construction(
        stronghold_id=data['stronghold_id'],
        facility_id=data['facility_id']
    )
    
    if "error" in result:
        return jsonify(result), 400
    
    return jsonify(result)


@bp.route('/bastion-turn', methods=['POST'])
def execute_bastion_turn():
    """
    Ejecuta un turno de bastión (cada 7 días)
    """
    schema = BastionTurnRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400
    
    result = stronghold_service.process_bastion_turn(
        stronghold_id=data['stronghold_id'],
        character_level=data['character_level']
    )
    
    if "error" in result:
        return jsonify(result), 404
    
    return jsonify(result)


@bp.route('/assign-order', methods=['POST'])
def assign_order():
    """
    Asigna una orden a una instalación específica
    """
    schema = AssignOrderRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400
    
    from app.models import StrongholdFacility
    
    sf = StrongholdFacility.query.get(data['facility_id'])
    if not sf:
        return jsonify({"error": "Instalación no encontrada"}), 404
    
    if sf.status != 'active':
        return jsonify({"error": "La instalación no está activa"}), 400
    
    sf.current_order = data['order_type']
    db.session.commit()
    
    return jsonify({
        'message': f'Orden {data["order_type"]} asignada a {sf.facility.name_es}',
        'facility': sf.facility.name_es,
        'order': data['order_type']
    })


@bp.route('/generate', methods=['POST'])
def generate_stronghold():
    """
    Genera un baluarte nuevo con descripción inmersiva usando IA
    """
    schema = StrongholdRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = stronghold_service.generate_stronghold(
        stronghold_type=data['stronghold_type'],
        name=data.get('name', ''),
        level=data['level'],
        location_description=data.get('location_description', '')
    )

    if "error" in result:
        return jsonify(result), 500

    # Guardar en la base de datos
    try:
        # Calcular BP inicial
        import random
        initial_bp = data['level'] + random.randint(1, 4)
        
        stronghold = Stronghold(
            name=result.get('name') or result.get('nombre', 'Unnamed Stronghold'),
            stronghold_type=data['stronghold_type'],
            level_requirement=data['level'],
            location=result.get('location') or result.get('ubicacion') or result.get('ubicación', ''),
            bastion_points=initial_bp,
            defense_score=10,
            total_gold_cost=0,
            monthly_maintenance=0,
            current_day=1,
            last_bastion_turn_day=1,
            staff=result.get('initial_staff') or result.get('personal_inicial', []),
            reputation=result.get('reputation') or result.get('reputacion') or result.get('reputación', {}),
            special_features=result.get('special_features') or result.get('caracteristicas_especiales', [])
        )
        
        db.session.add(stronghold)
        db.session.commit()
        
        # Devolver resultado completo
        result['id'] = stronghold.id
        result['bastion_points'] = initial_bp
        result['puntos_bastion'] = initial_bp
        return jsonify(result)
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al guardar: {str(e)}"}), 500


@bp.route('/hireling', methods=['POST'])
def generate_hireling():
    """
    Genera un empleado individual con personalidad usando IA
    """
    schema = HirelingRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = stronghold_service.generate_hireling(
        role=data['role'],
        stronghold_type=data['stronghold_type']
    )

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)


@bp.route('/event', methods=['POST'])
def generate_event():
    """
    Genera un evento de bastión usando IA
    """
    schema = EventRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    result = stronghold_service.generate_bastion_event(
        stronghold_type=data['stronghold_type'],
        severity=data.get('severity', 'Moderate')
    )

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)


# ============================================
# CRUD ENDPOINTS
# ============================================

@bp.route('/list', methods=['GET'])
def list_strongholds():
    """
    Lista todos los baluartes guardados
    """
    try:
        print("[STRONGHOLDS] Fetching all strongholds from database...")
        strongholds = Stronghold.query.order_by(Stronghold.timestamp.desc()).all()
        print(f"[STRONGHOLDS] Found {len(strongholds)} strongholds")
        
        result = []
        for s in strongholds:
            data = s.to_dict()
            # Incluir conteo de instalaciones
            data['facility_count'] = len([f for f in s.facilities if f.status == 'active'])
            data['construction_count'] = len([f for f in s.facilities if f.status == 'under_construction'])
            result.append(data)
        
        return jsonify(result)
    except Exception as e:
        print(f"[STRONGHOLDS ERROR] {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500


@bp.route('/<int:stronghold_id>', methods=['GET'])
def get_stronghold(stronghold_id):
    """
    Obtiene un baluarte específico por ID con todas sus instalaciones
    """
    try:
        stronghold = Stronghold.query.get(stronghold_id)
        if not stronghold:
            return jsonify({'error': 'Stronghold not found'}), 404
        
        data = stronghold.to_dict()
        
        # Incluir instalaciones activas
        data['active_facilities'] = []
        data['under_construction'] = []
        
        for sf in stronghold.facilities:
            facility_data = {
                'id': sf.facility.id,
                'name': sf.facility.name,
                'nombre': sf.facility.name_es,
                'size': sf.facility.size,
                'description': sf.facility.description_es,
                'benefit': sf.facility.benefit_es,
                'bp_generation': sf.facility.bp_generation,
                'assigned_staff': sf.assigned_staff or [],
                'status': sf.status
            }
            
            if sf.status == 'active':
                data['active_facilities'].append(facility_data)
            elif sf.status == 'under_construction':
                facility_data['construction_remaining_days'] = sf.construction_remaining_days
                facility_data['construction_started_day'] = sf.construction_started_day
                data['under_construction'].append(facility_data)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:stronghold_id>', methods=['PUT'])
def update_stronghold(stronghold_id):
    """
    Actualiza un baluarte existente (campos básicos y día actual)
    """
    try:
        stronghold = Stronghold.query.get(stronghold_id)
        if not stronghold:
            return jsonify({'error': 'Stronghold not found'}), 404
        
        data = request.json
        
        # Actualizar campos básicos
        if 'name' in data or 'nombre' in data:
            stronghold.name = data.get('name') or data.get('nombre')
        if 'stronghold_type' in data or 'tipo' in data:
            stronghold.stronghold_type = data.get('stronghold_type') or data.get('tipo')
        if 'location' in data or 'ubicacion' in data or 'ubicación' in data:
            stronghold.location = data.get('location') or data.get('ubicacion') or data.get('ubicación')
        if 'level_requirement' in data or 'nivel_requerido' in data:
            stronghold.level_requirement = data.get('level_requirement') or data.get('nivel_requerido')
        
        # Actualizar día actual y progreso de construcciones
        if 'current_day' in data or 'dia_actual' in data:
            old_day = stronghold.current_day
            new_day = data.get('current_day') or data.get('dia_actual')
            days_passed = new_day - old_day
            
            stronghold.current_day = new_day
            
            # Actualizar construcciones en progreso
            if days_passed > 0:
                for sf in stronghold.facilities:
                    if sf.status == 'under_construction':
                        sf.construction_remaining_days = max(0, sf.construction_remaining_days - days_passed)
                        if sf.construction_remaining_days <= 0:
                            sf.status = 'active'
        
        # Actualizar personal, reputación, características
        if 'staff' in data or 'personal' in data:
            stronghold.staff = data.get('staff') or data.get('personal')
        if 'reputation' in data or 'reputacion' in data or 'reputación' in data:
            stronghold.reputation = data.get('reputation') or data.get('reputacion') or data.get('reputación')
        if 'special_features' in data or 'caracteristicas_especiales' in data:
            stronghold.special_features = data.get('special_features') or data.get('caracteristicas_especiales')
        if 'bastion_points' in data or 'puntos_bastion' in data:
            stronghold.bastion_points = data.get('bastion_points') or data.get('puntos_bastion')
        if 'defense_score' in data or 'puntuacion_defensa' in data:
            stronghold.defense_score = data.get('defense_score') or data.get('puntuacion_defensa')
        
        db.session.commit()
        return jsonify(get_stronghold(stronghold_id).json)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:stronghold_id>', methods=['DELETE'])
def delete_stronghold(stronghold_id):
    """
    Elimina un baluarte y todas sus relaciones
    """
    try:
        stronghold = Stronghold.query.get(stronghold_id)
        if stronghold:
            db.session.delete(stronghold)
            db.session.commit()
            return jsonify({'message': 'Stronghold deleted successfully'})
        return jsonify({'error': 'Stronghold not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
