from app import db
from app.models import (
    Character, NPC, Adventure, City, Dungeon, Shop, Inn, Riddle, Quest,
    Monster, Spell, Item, Journal, Faction, Mystery, Villain, GeneratedItem
)
from sqlalchemy import desc, or_

# Mapeo de tipos a modelos (soporta singular y plural)
MODEL_MAP = {
    # Singular (legacy)
    'character': Character,
    'npc': NPC,
    'adventure': Adventure,
    'city': City,
    'dungeon': Dungeon,
    'shop': Shop,
    'inn': Inn,
    'riddle': Riddle,
    'quest': Quest,
    'monster': Monster,
    'spell': Spell,
    'item': Item,
    'journal': Journal,
    'faction': Faction,
    'mystery': Mystery,
    'villain': Villain,
    
    # Plural (actual - desde BD)
    'characters': Character,
    'npcs': NPC,
    'adventures': Adventure,
    'cities': City,
    'dungeons': Dungeon,
    'shops': Shop,
    'inns': Inn,
    'riddles': Riddle,
    'quests': Quest,
    'monsters': Monster,
    'spells': Spell,
    'items': Item,
    'journals': Journal,
    'factions': Faction,
    'mysteries': Mystery,
    'villains': Villain,
    
    # Tipos sin modelo específico (caen a GeneratedItem)
    'travel': GeneratedItem,
    'travels': GeneratedItem,
    'rules': GeneratedItem,
    'loot': GeneratedItem,
    'encounter': GeneratedItem,
    'encounters': GeneratedItem,
    'ruins': GeneratedItem,
    'alchemy': GeneratedItem,
    'dream': GeneratedItem,
    'dreams': GeneratedItem,
    'image': GeneratedItem,
    'images': GeneratedItem,
    'contract': GeneratedItem,
    'contracts': GeneratedItem,
}


class HistoryService:
    """Servicio de historial que usa modelos específicos de SQLAlchemy"""

    def get_model_for_type(self, item_type):
        """Obtiene el modelo correspondiente al tipo"""
        return MODEL_MAP.get(item_type, GeneratedItem)

    def get_all_by_type(self, item_type):
        """Obtiene todos los items de un tipo, ordenados por fecha descendente"""
        model = self.get_model_for_type(item_type)
        
        if model == GeneratedItem:
            # Para tipos no mapeados, filtrar por item_type
            items = GeneratedItem.query.filter_by(item_type=item_type) \
                .order_by(desc(GeneratedItem.timestamp)) \
                .all()
        else:
            # Para tipos mapeados, consultar el modelo específico
            items = model.query.order_by(desc(model.timestamp)).all()
        
        return [item.to_dict() for item in items]

    def save_item(self, item_type, data):
        """Guarda un item usando el modelo correspondiente"""
        print(f"\n📝 GUARDANDO ITEM - Tipo: {item_type}")  # DEBUG
        print(f"📦 Datos recibidos: {data}")  # DEBUG
        
        model = self.get_model_for_type(item_type)
        
        # Extraer nombre de diferentes formatos
        name = (data.get('nombre') or
                data.get('name') or
                data.get('titulo') or
                data.get('shop_name') or
                data.get('title') or
                "Sin Nombre")

        if model == GeneratedItem:
            # Para tipos no mapeados, usar tabla genérica
            new_item = GeneratedItem(
                item_type=item_type,
                name=name,
                data=data
            )
        else:
            # Instanciar el modelo específico
            new_item = model(name=name)
            
            # Poblarlo con los datos correspondientes (sobrescribir get_data)
            self._populate_model(new_item, data)

        db.session.add(new_item)
        db.session.commit()
        result = new_item.to_dict()
        print(f"✅ Item guardado - to_dict(): {result}")  # DEBUG
        return result

    def _populate_model(self, model_instance, data):
        """Popula los campos específicos del modelo con datos del JSON"""
        model_type = type(model_instance).__name__.lower()
        
        # Mapping de tipos a lógica de población
        if isinstance(model_instance, Character):
            model_instance.clase = data.get('clase')
            model_instance.nivel = data.get('nivel')
            model_instance.especie = data.get('especie')
            model_instance.alineamiento = data.get('alineamiento')
            model_instance.estadisticas = data.get('estadisticas')
            model_instance.equipo_destacado = data.get('equipo_destacado')
            model_instance.trasfondo = data.get('trasfondo')
            model_instance.resumen_historia = data.get('resumen_historia')

        elif isinstance(model_instance, NPC):
            model_instance.rol = data.get('rol')
            model_instance.raza = data.get('raza')
            model_instance.alineamiento = data.get('alineamiento')
            model_instance.estadisticas = data.get('estadisticas')
            model_instance.personalidad = data.get('personalidad')
            model_instance.hp = data.get('hp')
            model_instance.ca = data.get('ca')
            model_instance.velocidad = data.get('velocidad')
            model_instance.ataques = data.get('ataques')
            model_instance.habilidad_especial = data.get('habilidad_especial')
            model_instance.gancho_trama = data.get('gancho_trama')

        elif isinstance(model_instance, Adventure):
            model_instance.sinopsis = data.get('sinopsis')
            model_instance.gancho = data.get('gancho')
            model_instance.capitulos = data.get('capitulos')
            model_instance.npcs_notables = data.get('npcs_notables')
            model_instance.lugares = data.get('lugares')

        elif isinstance(model_instance, City):
            model_instance.poblacion = data.get('poblacion')
            model_instance.gobierno = data.get('gobierno')
            model_instance.clima = data.get('clima')
            model_instance.puntos_interes = data.get('puntos_interes')
            model_instance.conflicto_local = data.get('conflicto_local')
            model_instance.secreto = data.get('secreto')

        elif isinstance(model_instance, Dungeon):
            model_instance.descripcion = data.get('descripcion')
            model_instance.profundidad = data.get('profundidad')
            model_instance.arquitecto = data.get('arquitecto')
            model_instance.salas = data.get('salas')
            model_instance.trampas = data.get('trampas')
            model_instance.tesoro = data.get('tesoro')
            model_instance.secreto_central = data.get('secreto_central')

        elif isinstance(model_instance, Shop):
            model_instance.propietario = data.get('propietario')
            model_instance.especialidad = data.get('especialidad')
            model_instance.ubicacion = data.get('ubicacion')
            model_instance.inventario = data.get('inventario')
            model_instance.ambiente = data.get('ambiente')
            model_instance.secreto = data.get('secreto')

        elif isinstance(model_instance, Inn):
            model_instance.tabernero = data.get('tabernero')
            model_instance.raza_tabernero = data.get('raza_tabernero')
            model_instance.confort = data.get('confort')
            model_instance.rumor = data.get('rumor')
            model_instance.ambiente = data.get('ambiente')
            model_instance.ofertas_especiales = data.get('ofertas_especiales')

        elif isinstance(model_instance, Riddle):
            model_instance.tipo = data.get('tipo')
            model_instance.descripcion_jugadores = data.get('descripcion_jugadores')
            model_instance.solucion = data.get('solucion')
            model_instance.pistas = data.get('pistas')
            model_instance.consecuencia_fallo = data.get('consecuencia_fallo')
            model_instance.recompensa = data.get('recompensa')

        elif isinstance(model_instance, Quest):
            model_instance.flavor_text = data.get('flavor_text')
            model_instance.misiones = data.get('misiones')

        elif isinstance(model_instance, Monster):
            model_instance.tipo = data.get('tipo')
            model_instance.tamaño = data.get('tamaño')
            model_instance.alineamiento = data.get('alineamiento')
            model_instance.ca = data.get('ca')
            model_instance.hp = data.get('hp')
            model_instance.velocidad = data.get('velocidad')
            model_instance.estadisticas = data.get('estadisticas')
            model_instance.habilidades = data.get('habilidades')
            model_instance.resistencias = data.get('resistencias')
            model_instance.acciones = data.get('acciones')

        elif isinstance(model_instance, Spell):
            model_instance.nivel = data.get('nivel')
            model_instance.escuela = data.get('escuela')
            model_instance.tiempo_lanzamiento = data.get('tiempo_lanzamiento')
            model_instance.rango = data.get('rango')
            model_instance.componentes = data.get('componentes')
            model_instance.duracion = data.get('duracion')
            model_instance.descripcion = data.get('descripcion')

        elif isinstance(model_instance, Item):
            model_instance.tipo = data.get('tipo')
            model_instance.rareza = data.get('rarity') or data.get('rareza')
            model_instance.valor = data.get('valor')
            model_instance.descripcion = data.get('descripcion')
            model_instance.mecanica = data.get('mecanica')
            model_instance.propiedades = data.get('propiedades')

        elif isinstance(model_instance, Journal):
            model_instance.session_title = data.get('session_title')
            model_instance.epic_recap = data.get('epic_recap')
            model_instance.loot_gained = data.get('loot_gained')
            model_instance.npcs_met = data.get('npcs_met')
            model_instance.quests_updated = data.get('quests_updated')

        elif isinstance(model_instance, Faction):
            model_instance.descripcion = data.get('descripcion')
            model_instance.objetivos = data.get('objetivos')
            model_instance.miembros_notables = data.get('miembros_notables')
            model_instance.enemigos = data.get('enemigos')
            model_instance.secreto = data.get('secreto')

        elif isinstance(model_instance, Mystery):
            model_instance.descripcion = data.get('descripcion')
            model_instance.pistas = data.get('pistas')
            model_instance.solucion = data.get('solucion')
            model_instance.consecuencias = data.get('consecuencias')

        elif isinstance(model_instance, Villain):
            model_instance.tipo = data.get('tipo')
            model_instance.objetivo = data.get('objetivo')
            model_instance.estadisticas = data.get('estadisticas')
            model_instance.habilidades = data.get('habilidades')
            model_instance.planes = data.get('planes')
            model_instance.debilidades = data.get('debilidades')

    def delete_item(self, item_id):
        """Borra un item por ID (búsqueda en todos los modelos)"""
        # Intentar encontrar en todos los modelos
        for model in MODEL_MAP.values():
            item = model.query.get(item_id)
            if item:
                db.session.delete(item)
                db.session.commit()
                return True
        
        # Fallback a tabla genérica
        item = GeneratedItem.query.get(item_id)
        if item:
            db.session.delete(item)
            db.session.commit()
            return True
        
        return False

    def update_item(self, item_id, new_data):
        """Actualiza un item existente"""
        # Extraer nombre
        new_name = (new_data.get('nombre') or
                    new_data.get('name') or
                    new_data.get('titulo') or
                    new_data.get('shop_name') or
                    new_data.get('title'))

        # Buscar en todos los modelos
        for model in MODEL_MAP.values():
            item = model.query.get(item_id)
            if item:
                if new_name:
                    item.name = new_name
                self._populate_model(item, new_data)
                db.session.commit()
                return item.to_dict()
        
        # Fallback a tabla genérica
        item = GeneratedItem.query.get(item_id)
        if item:
            if new_name:
                item.name = new_name
            item.data = new_data
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(item, "data")
            db.session.commit()
            return item.to_dict()
        
        return None


history_service = HistoryService()