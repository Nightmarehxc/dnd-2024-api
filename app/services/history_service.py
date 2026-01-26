from app import db
from app.models import (
    Character, NPC, Adventure, City, Dungeon, Shop, Inn, Riddle, Quest,
    Monster, Spell, Item, Journal, Faction, Mystery, Villain, GeneratedItem, Alchemy, Librarian, Dream, Travel, Atmosphere, Rule
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
    'librarian': Librarian,
    
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
    'librarians': Librarian,
    
    # Alchemy (modelo específico)
    'alchemy': Alchemy,
    
    # Travel (modelo específico)
    'travel': Travel,
    'travels': Travel,
    
    # Tipos sin modelo específico (caen a GeneratedItem)
    'rules': GeneratedItem,
    'loot': GeneratedItem,
    'encounter': GeneratedItem,
    'encounters': GeneratedItem,
    'ruins': GeneratedItem,
    'image': GeneratedItem,
    'images': GeneratedItem,
    'contract': GeneratedItem,
    'contracts': GeneratedItem,
    
    # Dreams (modelo específico)
    'dream': Dream,
    'dreams': Dream,
    
    # Atmosphere (modelo específico)
    'atmosphere': Atmosphere,
    'atmospheres': Atmosphere,
    
    # Rules (modelo específico)
    'rules': Rule,
    'rule': Rule,
}


class HistoryService:
    """Servicio de historial que usa modelos específicos de SQLAlchemy"""

    def _normalize_json_field(self, value):
        """
        Normaliza valores para campos JSON.
        Convierte cadenas separadas por comas a arrays JSON.
        """
        if value is None:
            return None
        
        # Si ya es un dict o list, está bien
        if isinstance(value, (dict, list)):
            return value
        
        # Si es una cadena que parece ser una lista separada por comas
        if isinstance(value, str):
            # Detectar si parece ser una lista separada por comas
            if ',' in value:
                # Dividir por comas y limpiar espacios
                return [item.strip() for item in value.split(',')]
            # Si no tiene comas, devolverlo como una lista con un elemento
            return [value]
        
        return value

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
        print(f"\n{'='*60}")
        print(f"[LOG] GUARDANDO ITEM - Tipo: {item_type}")
        print(f"[LOG] Datos recibidos: {data}")
        print(f"{'='*60}")
        
        model = self.get_model_for_type(item_type)
        print(f"[LOG] Modelo seleccionado: {model.__name__}")
        
        # Extraer nombre de diferentes formatos
        name = (data.get('nombre') or
                data.get('name') or
                data.get('titulo') or
                data.get('shop_name') or
                data.get('title') or
                "Sin Nombre")
        
        print(f"[LOG] Nombre extraído: '{name}'")

        if model == GeneratedItem:
            # Para tipos no mapeados, usar tabla genérica
            print(f"[LOG] Usando tabla genérica GeneratedItem")
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
        print(f"[LOG] Item guardado con ID: {new_item.id}")
        print(f"[LOG] to_dict(): {result}")
        print(f"{'='*60}\n")
        return result

    def _populate_model(self, model_instance, data):
        """Popula los campos específicos del modelo con datos del JSON"""
        model_type = type(model_instance).__name__.lower()
        
        # Mapping de tipos a lógica de población
        if isinstance(model_instance, Character):
            model_instance.clase = data.get('class') or data.get('clase')
            model_instance.nivel = data.get('level') or data.get('nivel')
            model_instance.especie = data.get('race') or data.get('especie')
            model_instance.alineamiento = data.get('alignment') or data.get('alineamiento')
            model_instance.estadisticas = data.get('stats') or data.get('estadisticas')
            model_instance.equipo_destacado = data.get('equipment') or data.get('equipo_destacado')
            model_instance.trasfondo = data.get('background_details') or data.get('trasfondo')
            model_instance.resumen_historia = data.get('summary') or data.get('resumen_historia')

        elif isinstance(model_instance, NPC):
            model_instance.rol = data.get('role') or data.get('rol')
            model_instance.raza = data.get('race') or data.get('raza')
            model_instance.alineamiento = data.get('alignment') or data.get('alineamiento')
            model_instance.estadisticas = data.get('stats') or data.get('estadisticas')
            model_instance.personalidad = data.get('personality') or data.get('personalidad')
            model_instance.hp = data.get('hp')
            model_instance.ca = data.get('ca')
            model_instance.velocidad = data.get('speed') or data.get('velocidad')
            model_instance.ataques = data.get('attacks') or data.get('ataques')
            model_instance.habilidad_especial = data.get('special_ability') or data.get('habilidad_especial')
            model_instance.gancho_trama = data.get('plot_hook') or data.get('gancho_trama')

        elif isinstance(model_instance, Adventure):
            model_instance.sinopsis = data.get('synopsis') or data.get('sinopsis')
            model_instance.gancho = data.get('hook') or data.get('gancho')
            model_instance.capitulos = data.get('chapters') or data.get('capitulos')
            model_instance.npcs_notables = data.get('notable_npcs') or data.get('npcs_notables')
            model_instance.lugares = data.get('locations') or data.get('lugares')

        elif isinstance(model_instance, City):
            model_instance.poblacion = data.get('population') or data.get('poblacion')
            model_instance.gobierno = data.get('government') or data.get('gobierno')
            model_instance.clima = data.get('climate') or data.get('clima')
            model_instance.puntos_interes = data.get('landmarks') or data.get('puntos_interes') or data.get('lugares_destacados')
            model_instance.conflicto_local = data.get('current_conflict') or data.get('conflicto_actual') or data.get('conflicto_local')
            model_instance.secreto = data.get('secret') or data.get('secreto')
            
            # Nuevos campos
            model_instance.subtitulo = data.get('subtitle') or data.get('titulo')
            model_instance.atmosfera = data.get('atmosphere') or data.get('clima_atmosfera')
            model_instance.distritos = data.get('districts') or data.get('distritos')
            model_instance.linked_data = data.get('linked_data')

        elif isinstance(model_instance, Dungeon):
            model_instance.descripcion = data.get('description') or data.get('descripcion')
            model_instance.profundidad = data.get('depth') or data.get('profundidad')
            model_instance.arquitecto = data.get('architect') or data.get('arquitecto')
            model_instance.salas = data.get('rooms') or data.get('salas')
            model_instance.trampas = data.get('traps') or data.get('trampas')
            model_instance.tesoro = data.get('treasure') or data.get('tesoro')
            model_instance.secreto_central = data.get('central_secret') or data.get('secreto_central')

        elif isinstance(model_instance, Shop):
            model_instance.propietario = data.get('shopkeeper_name') or data.get('propietario')
            model_instance.raza_propietario = data.get('shopkeeper_race') or data.get('raza_propietario')
            model_instance.personalidad_propietario = data.get('shopkeeper_personality') or data.get('personalidad_propietario')
            model_instance.especialidad = data.get('specialty') or data.get('especialidad')
            model_instance.ubicacion = data.get('location') or data.get('ubicacion')
            model_instance.inventario = data.get('inventory') or data.get('inventario')
            model_instance.ambiente = data.get('atmosphere') or data.get('ambiente')
            model_instance.secreto = data.get('special_feature') or data.get('secreto')

        elif isinstance(model_instance, Inn):
            model_instance.tabernero = data.get('innkeeper_name') or data.get('tabernero')
            model_instance.raza_tabernero = data.get('innkeeper_race') or data.get('raza_tabernero')
            model_instance.confort = data.get('comfort_level') or data.get('confort')
            model_instance.rumor = data.get('rumor')
            model_instance.ambiente = data.get('atmosphere') or data.get('ambiente')
            model_instance.ofertas_especiales = data.get('special_offers') or data.get('ofertas_especiales')
            
            # 🆕 Guardar datos completos de Gemini
            model_instance.ubicacion = data.get('location') or data.get('ubicacion')
            model_instance.descripcion = data.get('description') or data.get('descripcion')
            model_instance.personalidad_tabernero = data.get('innkeeper_personality') or data.get('personalidad_tabernero')
            model_instance.menu = data.get('menu')
            model_instance.habitaciones = data.get('rooms') or data.get('habitaciones')
            model_instance.patrones_notables = data.get('notable_patrons') or data.get('patrones_notables')
            
            # Guardar copia completa de datos como fallback
            model_instance.datos_completos = data

        elif isinstance(model_instance, Riddle):
            model_instance.tipo = data.get('type') or data.get('tipo')
            model_instance.descripcion_jugadores = data.get('player_description') or data.get('descripcion_jugadores')
            model_instance.solucion = data.get('solution') or data.get('solucion')
            model_instance.pistas = data.get('hints') or data.get('pistas')
            model_instance.consecuencia_fallo = data.get('failure_consequence') or data.get('consecuencia_fallo')
            model_instance.recompensa = data.get('reward') or data.get('recompensa')

        elif isinstance(model_instance, Quest):
            model_instance.flavor_text = data.get('flavor_text')
            model_instance.misiones = data.get('quests') or data.get('misiones')

        elif isinstance(model_instance, Monster):
            model_instance.tipo = data.get('type') or data.get('tipo')
            model_instance.tamaño = data.get('size') or data.get('tamaño')
            model_instance.alineamiento = data.get('alignment') or data.get('alineamiento')
            model_instance.ca = data.get('ca')
            model_instance.hp = data.get('hp')
            model_instance.velocidad = data.get('speed') or data.get('velocidad')
            model_instance.estadisticas = data.get('stats') or data.get('estadisticas')
            model_instance.habilidades = data.get('skills') or data.get('habilidades')
            model_instance.resistencias = data.get('resistances') or data.get('resistencias')
            model_instance.acciones = data.get('actions') or data.get('acciones')

        elif isinstance(model_instance, Spell):
            model_instance.nivel = data.get('level') or data.get('nivel')
            model_instance.escuela = data.get('school') or data.get('escuela')
            model_instance.tiempo_lanzamiento = data.get('casting_time') or data.get('tiempo_lanzamiento')
            model_instance.rango = data.get('range') or data.get('rango')
            model_instance.componentes = self._normalize_json_field(
                data.get('components') or data.get('componentes')
            )
            model_instance.duracion = data.get('duration') or data.get('duracion')
            model_instance.descripcion = data.get('description') or data.get('descripcion')

        elif isinstance(model_instance, Item):
            model_instance.tipo = data.get('type') or data.get('tipo')
            model_instance.rareza = data.get('rarity') or data.get('rareza')
            model_instance.valor = data.get('value') or data.get('valor')
            model_instance.descripcion = data.get('description') or data.get('descripcion')
            model_instance.mechanics = data.get('mechanics') or data.get('mecanica')
            model_instance.propiedades = data.get('properties') or data.get('propiedades')
            model_instance.class_requirement = data.get('class_requirement') or data.get('clase_sugerida')

        elif isinstance(model_instance, Journal):
            model_instance.session_title = data.get('session_title')
            model_instance.epic_recap = data.get('epic_recap')
            model_instance.loot_gained = data.get('loot_gained')
            model_instance.npcs_met = data.get('npcs_met')
            model_instance.quests_updated = data.get('quests_updated')

        elif isinstance(model_instance, Faction):
            model_instance.descripcion = data.get('description') or data.get('descripcion')
            model_instance.objetivos = data.get('goals') or data.get('objetivos')
            model_instance.miembros_notables = data.get('notable_members') or data.get('miembros_notables')
            model_instance.enemigos = data.get('enemies') or data.get('enemigos')
            model_instance.secreto = data.get('secret') or data.get('secreto')

        elif isinstance(model_instance, Mystery):
            # Soportar claves en inglés y español
            model_instance.descripcion = (
                data.get('crime_event') or 
                data.get('crimen_evento') or 
                data.get('description') or 
                data.get('descripcion') or 
                ''
            )
            model_instance.pistas = (
                data.get('clues') or 
                data.get('pistas') or 
                []
            )
            model_instance.sospechosos = (
                data.get('suspects') or 
                data.get('sospechosos') or 
                []
            )
            model_instance.solucion = (
                data.get('truth') or 
                data.get('verdad') or 
                data.get('solution') or 
                data.get('solucion') or 
                ''
            )
            model_instance.consecuencias = (
                data.get('consequences') or 
                data.get('consecuencias') or 
                ''
            )

        elif isinstance(model_instance, Villain):
            model_instance.tipo = data.get('type') or data.get('tipo')
            model_instance.objetivo = data.get('objective') or data.get('objetivo')
            model_instance.estadisticas = data.get('stats') or data.get('estadisticas')
            model_instance.habilidades = data.get('abilities') or data.get('habilidades')
            model_instance.planes = data.get('plans') or data.get('planes')
            model_instance.debilidades = data.get('weaknesses') or data.get('debilidades')

        elif isinstance(model_instance, Alchemy):
            model_instance.tipo = data.get('type') or data.get('tipo')
            model_instance.rareza = data.get('rarity') or data.get('rareza')
            model_instance.apariencia = data.get('appearance') or data.get('apariencia')
            model_instance.sabor_olor = data.get('taste_smell') or data.get('sabor_olor')
            model_instance.efecto_mecanico = data.get('mechanic_effect') or data.get('efecto_mecanico')
            model_instance.efecto_secundario = data.get('secondary_effect') or data.get('efecto_secundario')
            model_instance.ingredientes = data.get('ingredients') or data.get('ingredientes')

        elif isinstance(model_instance, Dream):
            model_instance.contexto = data.get('context') or data.get('contexto') or ''
            model_instance.tono = data.get('tone') or data.get('tono') or ''
            model_instance.imagenes = data.get('visions') or data.get('imagenes') or ''
            model_instance.sensaciones = data.get('sensations') or data.get('sensaciones') or ''
            model_instance.significado = data.get('meaning') or data.get('significado') or ''

        elif isinstance(model_instance, Travel):
            # Soportar ambos idiomas
            env = data.get('general_environment') or data.get('ambiente_general') or ''
            climate = data.get('dominant_climate') or data.get('clima_dominante') or ''
            events = data.get('events') or data.get('eventos') or []
            
            model_instance.ambiente_general = env
            model_instance.general_environment = env
            model_instance.clima_dominante = climate
            model_instance.dominant_climate = climate
            model_instance.eventos = events
            model_instance.events = events

        elif isinstance(model_instance, Rule):
            # Soportar ambos idiomas
            model_instance.tema = data.get('tema') or data.get('topic') or ''
            model_instance.explicacion = data.get('explicacion') or data.get('explanation') or ''
            model_instance.cambio_importante = data.get('cambio_importante') or data.get('important_change') or data.get('major_change') or ''
            model_instance.ejemplo = data.get('ejemplo') or data.get('example') or ''
            model_instance.pagina_ref = data.get('pagina_ref') or data.get('page_reference') or ''

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

    def update_item(self, item_id, new_data, item_type=None):
        """Actualiza un item existente"""
        print(f"\n[LOG UPDATE] Actualizando item ID: {item_id}, Tipo: {item_type}")  # DEBUG
        print(f"[LOG UPDATE] Nuevos datos: {new_data}")  # DEBUG
        
        # Extraer nombre
        new_name = (new_data.get('nombre') or
                    new_data.get('name') or
                    new_data.get('titulo') or
                    new_data.get('shop_name') or
                    new_data.get('title'))

        # Si se proporciona item_type, buscar primero en ese modelo específico
        if item_type:
            model = self.get_model_for_type(item_type)
            if model != GeneratedItem:
                print(f"[LOG UPDATE] Buscando en modelo específico: {model.__name__}")  # DEBUG
                item = model.query.get(item_id)
                if item:
                    print(f"[LOG UPDATE] ✅ Item encontrado en {model.__name__}")  # DEBUG
                    if new_name:
                        item.name = new_name
                    self._populate_model(item, new_data)
                    db.session.commit()
                    result = item.to_dict()
                    print(f"[LOG UPDATE] Item actualizado: {result}")  # DEBUG
                    return result
        
        # Buscar en todos los modelos si no se encontró o no se especificó tipo
        for model in MODEL_MAP.values():
            print(f"[LOG UPDATE] Buscando en modelo: {model.__name__}")  # DEBUG
            item = model.query.get(item_id)
            if item:
                print(f"[LOG UPDATE] ✅ Item encontrado en {model.__name__}")  # DEBUG
                if new_name:
                    item.name = new_name
                self._populate_model(item, new_data)
                db.session.commit()
                result = item.to_dict()
                print(f"[LOG UPDATE] Item actualizado: {result}")  # DEBUG
                return result
        
        print(f"[LOG UPDATE] No encontrado en modelos específicos, buscando en GeneratedItem")  # DEBUG
        # Fallback a tabla genérica
        item = GeneratedItem.query.get(item_id)
        if item:
            print(f"[LOG UPDATE] ✅ Item encontrado en GeneratedItem")  # DEBUG
            if new_name:
                item.name = new_name
            item.data = new_data
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(item, "data")
            db.session.commit()
            result = item.to_dict()
            print(f"[LOG UPDATE] Item actualizado: {result}")  # DEBUG
            return result
        
        print(f"[LOG UPDATE] ❌ Item no encontrado")  # DEBUG
        return None


history_service = HistoryService()