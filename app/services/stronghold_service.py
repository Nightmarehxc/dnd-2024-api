from app.services.gemini_service import BaseService
from app.models import Facility, Stronghold, StrongholdFacility
from app import db
import random


class StrongholdService(BaseService):
    
    def calculate_bastion_points(self, stronghold, character_level):
        """
        Calcula los Puntos de Bastión según las reglas de D&D 2024:
        - Base: Nivel del personaje + 1d4
        - Bonus por instalaciones que generan BP
        """
        # Puntos base
        base_points = character_level + random.randint(1, 4)
        
        # Bonus por instalaciones
        bonus_points = 0
        for sf in stronghold.facilities:
            if sf.status == 'active' and sf.facility.bp_generation:
                # Parsear el dado (ej: "1d4", "2d6")
                dice_str = sf.facility.bp_generation
                if 'd' in dice_str:
                    num_dice, dice_size = dice_str.split('d')
                    num_dice = int(num_dice)
                    dice_size = int(dice_size)
                    for _ in range(num_dice):
                        bonus_points += random.randint(1, dice_size)
        
        total = base_points + bonus_points
        return {
            'base': base_points,
            'bonus': bonus_points,
            'total': total
        }
    
    def process_bastion_turn(self, stronghold_id, character_level):
        """
        Procesa un turno de bastión (cada 7 días):
        - Calcula y añade BP
        - Actualiza construcciones en progreso
        - Ejecuta órdenes de las instalaciones
        - Genera eventos opcionales
        """
        stronghold = Stronghold.query.get(stronghold_id)
        if not stronghold:
            return {"error": "Stronghold not found"}
        
        # Calcular BP
        bp_data = self.calculate_bastion_points(stronghold, character_level)
        stronghold.bastion_points = (stronghold.bastion_points or 0) + bp_data['total']
        stronghold.last_bastion_turn_day = stronghold.current_day
        
        # Actualizar construcciones en progreso
        completed = []
        for sf in stronghold.facilities:
            if sf.status == 'under_construction':
                sf.construction_remaining_days = max(0, sf.construction_remaining_days - 7)
                if sf.construction_remaining_days <= 0:
                    sf.status = 'active'
                    completed.append(sf.facility.name_es)
        
        # Ejecutar órdenes de instalaciones activas
        order_results = self._process_facility_orders(stronghold)
        
        db.session.commit()
        
        return {
            'bp_earned': bp_data,
            'total_bp': stronghold.bastion_points,
            'completed_facilities': completed,
            'order_results': order_results,
            'message': f'Turno de Bastión procesado. Ganaste {bp_data["total"]} BP ({bp_data["base"]} base + {bp_data["bonus"]} bonus)'
        }
    
    def _process_facility_orders(self, stronghold):
        """
        Procesa las órdenes de todas las instalaciones activas
        """
        results = []
        
        for sf in stronghold.facilities:
            if sf.status == 'active' and sf.current_order:
                order_type = sf.current_order
                facility_name = sf.facility.name_es
                
                # Procesar según el tipo de orden
                if order_type == 'Craft':
                    result = self._execute_craft_order(sf)
                elif order_type == 'Research':
                    result = self._execute_research_order(sf)
                elif order_type == 'Gather':
                    result = self._execute_gather_order(sf)
                elif order_type == 'Trade':
                    result = self._execute_trade_order(sf)
                elif order_type == 'Recruit':
                    result = self._execute_recruit_order(sf)
                elif order_type == 'Empower':
                    result = self._execute_empower_order(sf)
                else:
                    result = {'success': False, 'message': f'Orden desconocida: {order_type}'}
                
                # Guardar resultado
                sf.order_result = result
                results.append({
                    'facility': facility_name,
                    'order': order_type,
                    'result': result
                })
                
                # Limpiar orden después de ejecutarla
                sf.current_order = None
        
        return results
    
    def _execute_craft_order(self, sf):
        """Ejecuta orden de Crafting (crear objetos)"""
        # Tirada aleatoria para determinar éxito
        roll = random.randint(1, 20)
        if roll >= 12:
            items = ["Poción de Curación", "Pergamino Mágico", "Arma+1", "Armadura+1"]
            item = random.choice(items)
            return {'success': True, 'message': f'¡Éxito! Creaste: {item}', 'item': item, 'roll': roll}
        else:
            return {'success': False, 'message': f'Fallo en la creación (tirada: {roll})', 'roll': roll}
    
    def _execute_research_order(self, sf):
        """Ejecuta orden de Research (investigación)"""
        roll = random.randint(1, 20)
        if roll >= 10:
            discoveries = ["Secreto sobre la región", "Hechizo perdido", "Historia antigua", "Debilidad de enemigo"]
            discovery = random.choice(discoveries)
            return {'success': True, 'message': f'Descubrimiento: {discovery}', 'discovery': discovery, 'roll': roll}
        else:
            return {'success': False, 'message': f'Sin resultados (tirada: {roll})', 'roll': roll}
    
    def _execute_gather_order(self, sf):
        """Ejecuta orden de Gather (recolectar recursos)"""
        roll = random.randint(1, 20)
        amount = roll * 10
        return {'success': True, 'message': f'Recolectaste {amount} GP en recursos', 'gold': amount, 'roll': roll}
    
    def _execute_trade_order(self, sf):
        """Ejecuta orden de Trade (comercio)"""
        roll = random.randint(1, 20)
        profit = roll * 5
        return {'success': True, 'message': f'Ganancia comercial: {profit} GP', 'gold': profit, 'roll': roll}
    
    def _execute_recruit_order(self, sf):
        """Ejecuta orden de Recruit (reclutar personal)"""
        roll = random.randint(1, 20)
        if roll >= 13:
            roles = ["Guardia", "Sirviente", "Artesano", "Escriba"]
            role = random.choice(roles)
            return {'success': True, 'message': f'Reclutaste un {role}', 'recruit': role, 'roll': roll}
        else:
            return {'success': False, 'message': f'No hubo candidatos adecuados (tirada: {roll})', 'roll': roll}
    
    def _execute_empower_order(self, sf):
        """Ejecuta orden de Empower (potenciar habilidades)"""
        roll = random.randint(1, 20)
        bp_bonus = random.randint(1, 4)
        return {'success': True, 'message': f'Potenciado: +{bp_bonus} BP adicionales', 'bp_bonus': bp_bonus, 'roll': roll}
    
    def get_available_facilities(self, character_level):
        """
        Obtiene las instalaciones disponibles según el nivel del personaje
        """
        facilities = Facility.query.filter(
            Facility.min_level <= character_level
        ).order_by(Facility.min_level, Facility.name).all()
        
        return [{
            'id': f.id,
            'name': f.name,
            'nombre': f.name_es,
            'size': f.size,
            'tamaño': f.size,
            'min_level': f.min_level,
            'nivel_minimo': f.min_level,
            'order_type': f.order_type,
            'tipo_orden': f.order_type,
            'description': f.description,
            'descripcion': f.description_es,
            'benefit': f.benefit,
            'beneficio': f.benefit_es,
            'construction_cost': f.construction_cost,
            'costo_construccion': f.construction_cost,
            'construction_days': f.construction_days,
            'dias_construccion': f.construction_days,
            'bp_generation': f.bp_generation,
            'generacion_bp': f.bp_generation
        } for f in facilities]
    
    def start_facility_construction(self, stronghold_id, facility_id):
        """
        Inicia la construcción de una instalación en el baluarte
        """
        stronghold = Stronghold.query.get(stronghold_id)
        facility = Facility.query.get(facility_id)
        
        if not stronghold or not facility:
            return {"error": "Stronghold or Facility not found"}
        
        # Verificar si ya existe esta instalación
        existing = StrongholdFacility.query.filter_by(
            stronghold_id=stronghold_id,
            facility_id=facility_id
        ).first()
        
        if existing:
            return {"error": f"Ya existe {facility.name_es} en este baluarte"}
        
        # Crear relación de construcción
        sf = StrongholdFacility(
            stronghold_id=stronghold_id,
            facility_id=facility_id,
            status='under_construction',
            construction_started_day=stronghold.current_day,
            construction_remaining_days=facility.construction_days,
            assigned_staff=[]
        )
        
        # Actualizar costes del baluarte
        stronghold.total_gold_cost += facility.construction_cost
        
        db.session.add(sf)
        db.session.commit()
        
        return {
            'message': f'Construcción de {facility.name_es} iniciada',
            'facility': facility.name_es,
            'cost': facility.construction_cost,
            'days': facility.construction_days,
            'completion_day': stronghold.current_day + facility.construction_days
        }

    def generate_stronghold(self, stronghold_type, name, level, location_description=""):
        """
        Genera un baluarte nuevo usando IA para crear una descripción inmersiva
        """
        system_instruction = """
        You are an expert in D&D 2024 Bastion rules.
        Generate a detailed stronghold description in JSON format with English keys and Spanish values.
        Focus on atmosphere, location, and initial setup.
        
        JSON Structure:
        {
            "name": "Stronghold Name",
            "location": "Detailed description of location and terrain",
            "initial_staff": [
                {
                    "name": "Character name",
                    "role": "Job title",
                    "description": "Brief background"
                }
            ],
            "reputation": {
                "local_standing": "How locals view this place",
                "known_for": "What it's famous for"
            },
            "special_features": ["Unique feature 1", "Unique feature 2"]
        }
        """

        prompt = f"""
        Generate a {stronghold_type} stronghold for a level {level} character.
        {f'Name: {name}' if name else ''}
        {f'Location context: {location_description}' if location_description else ''}
        
        Include:
        - Rich description of location and surroundings
        - 3-5 initial staff members with personalities
        - Unique features appropriate for a {stronghold_type}
        - Local reputation and standing
        """

        result = self._generate_content(system_instruction, prompt)
        
        if "error" in result:
            return result
        
        # El baluarte inicia sin instalaciones, el jugador debe construirlas
        result['note'] = 'Este baluarte está recién fundado. Construye instalaciones para desbloquer funcionalidades.'
        result['nota'] = 'Este baluarte está recién fundado. Construye instalaciones para desbloquear funcionalidades.'
        
        return result

    def generate_hireling(self, role, stronghold_type):
        """
        Genera un empleado individual con personalidad única
        """
        system_instruction = """
        You are a master storyteller creating memorable NPCs.
        Generate a detailed hireling in JSON format with English keys and Spanish values.
        
        JSON Structure:
        {
            "name": "Full name",
            "role": "Job title",
            "age": "Age",
            "race": "D&D race",
            "monthly_salary": "Monthly gold cost",
            "personality": {
                "quirk": "Main personality quirk",
                "likes": "What they enjoy",
                "dislikes": "What they hate",
                "secret": "Hidden aspect"
            },
            "skills": {
                "primary": "Main skill",
                "secondary": ["Other", "Skills"]
            },
            "backstory": "Detailed background (2-3 paragraphs)",
            "appearance": "Physical description",
            "daily_routine": "What they do each day"
        }
        """

        prompt = f"""
        Generate a {role} for a {stronghold_type}.
        
        Make them:
        - Memorable with a unique quirk (not generic)
        - Useful for their role
        - Interesting enough to be an NPC in adventures
        - Have secrets or connections that could create story hooks
        """

        return self._generate_content(system_instruction, prompt)

    def generate_bastion_event(self, stronghold_type, severity="Moderate"):
        """
        Genera un evento de bastión según las tablas de D&D 2024
        """
        system_instruction = """
        You are a DM creating Bastion events for D&D 2024.
        Generate a detailed event in JSON format with English keys and Spanish values.
        
        JSON Structure:
        {
            "title": "Event title",
            "type": "Positive/Negative/Neutral",
            "severity": "Minor/Moderate/Major",
            "description": "What happens",
            "immediate_effects": {
                "bp_change": "BP gained or lost (can be negative)",
                "gold_cost": "Gold required to resolve",
                "other": "Other effects"
            },
            "resolution_options": [
                {
                    "approach": "How to handle it",
                    "outcome": "Result",
                    "cost": "Resources needed"
                }
            ],
            "if_ignored": "Consequences of doing nothing"
        }
        """

        prompt = f"""
        Generate a {severity} Bastion event for a {stronghold_type}.
        
        Event types by stronghold:
        - Castle: Political intrigue, noble visitors, feudal disputes
        - Wizard Tower: Magical accidents, rival mages, planar disturbances
        - Guild Hall: Business opportunities, rival guilds, criminal activity
        - Temple: Pilgrims, divine tests, undead threats
        - Keep: Military threats, supply issues, deserters
        
        Balance positive and negative events. Make it interesting!
        """

        return self._generate_content(system_instruction, prompt)


# Singleton para usar en las rutas
stronghold_service = StrongholdService()
