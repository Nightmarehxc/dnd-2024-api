from app import db
from datetime import datetime
import json


# ============================================
# BASE CLASS PARA TODOS LOS MODELOS
# ============================================
class BaseGenerated(db.Model):
    """Clase base para todos los items generados"""
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=True)
    name = db.Column(db.String(150), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def type(self):
        """Obtiene el tipo dinámicamente de __tablename__"""
        return self.__tablename__.replace('_', '')

    def _sanitize_data(self, data, max_depth=10, current_depth=0):
        """
        Sanitiza datos para evitar recursión infinita y referencias circulares.
        Limita profundidad de anidamiento.
        """
        if current_depth >= max_depth:
            return None
        
        if isinstance(data, dict):
            return {
                k: self._sanitize_data(v, max_depth, current_depth + 1)
                for k, v in data.items()
            }
        elif isinstance(data, (list, tuple)):
            return [self._sanitize_data(item, max_depth, current_depth + 1) for item in data]
        elif isinstance(data, (str, int, float, bool, type(None))):
            return data
        else:
            # Para tipos complejos, intentamos convertir a string
            try:
                return str(data)
            except:
                return None

    def to_dict(self):
        """Convierte el modelo a diccionario con protección contra recursión"""
        # Asegurar que timestamp tiene un valor válido
        timestamp_str = None
        if self.timestamp:
            try:
                timestamp_str = self.timestamp.isoformat()
            except:
                timestamp_str = datetime.utcnow().isoformat()
        else:
            timestamp_str = datetime.utcnow().isoformat()
        
        try:
            data = self.get_data()
            # Sanitizar datos para evitar recursión
            data = self._sanitize_data(data)
            return {
                'id': self.id,
                'type': self.type,
                'name': self.name,
                'timestamp': timestamp_str,
                'data': data
            }
        except RecursionError:
            # Fallback en caso de recursión
            return {
                'id': self.id,
                'type': self.type,
                'name': self.name,
                'timestamp': timestamp_str,
                'data': {}
            }
        except Exception as e:
            # Log del error para debugging
            print(f"[ERROR] to_dict para {self.type}: {str(e)}")
            return {
                'id': self.id,
                'type': self.type,
                'name': self.name,
                'timestamp': timestamp_str,
                'data': {}
            }

    def get_data(self):
        """Obtiene los datos específicos del modelo. Sobrescribir en subclases."""
        raise NotImplementedError


# ============================================
# PERSONAJES Y NPCS
# ============================================
class Character(BaseGenerated):
    __tablename__ = 'characters'
    
    clase = db.Column(db.String(50))
    nivel = db.Column(db.Integer)
    especie = db.Column(db.String(50))
    alineamiento = db.Column(db.String(50))
    
    # Stats (guardamos como JSON)
    estadisticas = db.Column(db.JSON)
    equipo_destacado = db.Column(db.JSON)
    trasfondo = db.Column(db.JSON)
    resumen_historia = db.Column(db.Text)

    def get_data(self):
        return {
            'name': self.name,
            'class': self.clase,
            'level': self.nivel,
            'race': self.especie,
            'alignment': self.alineamiento,
            'stats': self.estadisticas,
            'equipment': self.equipo_destacado,
            'background_details': self.trasfondo,
            'summary': self.resumen_historia
        }


class NPC(BaseGenerated):
    __tablename__ = 'npcs'
    
    rol = db.Column(db.String(100))
    raza = db.Column(db.String(50))
    alineamiento = db.Column(db.String(50))
    
    estadisticas = db.Column(db.JSON)  # D&D Stats
    personalidad = db.Column(db.JSON)  # traits, ideals, bonds, flaws
    hp = db.Column(db.Integer)
    ca = db.Column(db.Integer)
    velocidad = db.Column(db.Integer)
    ataques = db.Column(db.JSON)
    habilidad_especial = db.Column(db.Text)
    gancho_trama = db.Column(db.Text)

    def get_data(self):
        return {
            'name': self.name,
            'role': self.rol,
            'race': self.raza,
            'alignment': self.alineamiento,
            'stats': self.estadisticas,
            'personality': self.personalidad,
            'hp': self.hp,
            'ca': self.ca,
            'speed': self.velocidad,
            'attacks': self.ataques,
            'special_ability': self.habilidad_especial,
            'plot_hook': self.gancho_trama
        }


# ============================================
# MUNDO Y LUGARES
# ============================================
class Adventure(BaseGenerated):
    __tablename__ = 'adventures'
    
    sinopsis = db.Column(db.Text)
    gancho = db.Column(db.Text)
    capitulos = db.Column(db.JSON)
    npcs_notables = db.Column(db.JSON)
    lugares = db.Column(db.JSON)

    def get_data(self):
        return {
            'title': self.name,
            'synopsis': self.sinopsis,
            'hook': self.gancho,
            'chapters': self.capitulos,
            'notable_npcs': self.npcs_notables,
            'locations': self.lugares
        }


class City(BaseGenerated):
    __tablename__ = 'cities'
    
    poblacion = db.Column(db.String(50))
    gobierno = db.Column(db.String(100))
    clima = db.Column(db.String(50))
    
    puntos_interes = db.Column(db.JSON)
    conflicto_local = db.Column(db.Text)
    secreto = db.Column(db.Text)
    
    # Nuevos campos para soportar todos los datos de Gemini
    subtitulo = db.Column(db.String(200))
    atmosfera = db.Column(db.Text)
    distritos = db.Column(db.JSON)
    linked_data = db.Column(db.JSON)  # Para posadas y tiendas vinculadas

    def get_data(self):
        return {
            'name': self.name,
            'nombre': self.name,
            'subtitle': self.subtitulo,
            'titulo': self.subtitulo,
            'population': self.poblacion,
            'poblacion': self.poblacion,
            'government': self.gobierno,
            'gobierno': self.gobierno,
            'climate': self.clima,
            'clima': self.clima,
            'atmosphere': self.atmosfera,
            'clima_atmosfera': self.atmosfera,
            'districts': self.distritos,
            'distritos': self.distritos,
            'landmarks': self.puntos_interes,
            'lugares_destacados': self.puntos_interes,
            'puntos_interes': self.puntos_interes,
            'current_conflict': self.conflicto_local,
            'conflicto_actual': self.conflicto_local,
            'conflicto_local': self.conflicto_local,
            'secret': self.secreto,
            'secreto': self.secreto,
            'linked_data': self.linked_data
        }


class Dungeon(BaseGenerated):
    __tablename__ = 'dungeons'
    
    descripcion = db.Column(db.Text)
    profundidad = db.Column(db.String(50))
    arquitecto = db.Column(db.String(100))
    
    salas = db.Column(db.JSON)
    trampas = db.Column(db.JSON)
    tesoro = db.Column(db.Text)
    secreto_central = db.Column(db.Text)

    def get_data(self):
        return {
            'name': self.name,
            'description': self.descripcion,
            'depth': self.profundidad,
            'architect': self.arquitecto,
            'rooms': self.salas,
            'traps': self.trampas,
            'treasure': self.tesoro,
            'central_secret': self.secreto_central
        }


class Encounter(BaseGenerated):
    __tablename__ = 'encounters'
    
    resumen = db.Column(db.Text)
    monstruos = db.Column(db.JSON)
    tacticas = db.Column(db.JSON)
    terreno = db.Column(db.JSON)
    tesoro_botin = db.Column(db.Text)
    
    # Campos adicionales para soporte bilingüe
    titulo = db.Column(db.String(150))
    
    def get_data(self):
        return {
            'name': self.name,
            'titulo': self.titulo or self.name,
            'title': self.titulo or self.name,
            'resumen': self.resumen,
            'summary': self.resumen,
            'monstruos': self.monstruos,
            'monsters': self.monstruos,
            'tacticas': self.tacticas,
            'tactics': self.tacticas,
            'terreno': self.terreno,
            'terrain': self.terreno,
            'tesoro_botin': self.tesoro_botin,
            'loot': self.tesoro_botin
        }


class Shop(BaseGenerated):
    __tablename__ = 'shops'
    
    propietario = db.Column(db.String(100))
    raza_propietario = db.Column(db.String(50))
    personalidad_propietario = db.Column(db.Text)
    especialidad = db.Column(db.String(100))
    ubicacion = db.Column(db.String(100))
    
    inventario = db.Column(db.JSON)
    ambiente = db.Column(db.Text)
    secreto = db.Column(db.Text)

    def get_data(self):
        return {
            'name': self.name,
            'shopkeeper_name': self.propietario,
            'shopkeeper_race': self.raza_propietario,
            'shopkeeper_personality': self.personalidad_propietario,
            'specialty': self.especialidad,
            'location': self.ubicacion,
            'inventory': self.inventario,
            'atmosphere': self.ambiente,
            'special_feature': self.secreto
        }


class Inn(BaseGenerated):
    __tablename__ = 'inns'
    
    tabernero = db.Column(db.String(100))
    raza_tabernero = db.Column(db.String(50))
    confort = db.Column(db.String(50))  # Poor, Modest, Rich, etc.
    
    rumor = db.Column(db.Text)
    ambiente = db.Column(db.Text)
    ofertas_especiales = db.Column(db.JSON)
    
    # 🆕 Campos para guardar datos completos de Gemini
    ubicacion = db.Column(db.String(150))
    descripcion = db.Column(db.Text)
    personalidad_tabernero = db.Column(db.Text)
    menu = db.Column(db.JSON)
    habitaciones = db.Column(db.JSON)
    patrones_notables = db.Column(db.JSON)
    datos_completos = db.Column(db.JSON)  # Fallback para datos no mapeados

    def get_data(self):
        # Devolver todos los datos disponibles, priorizando datos completos
        if self.datos_completos:
            return self.datos_completos
        
        return {
            'name': self.name,
            'location': self.ubicacion,
            'description': self.descripcion,
            'innkeeper_name': self.tabernero,
            'innkeeper_race': self.raza_tabernero,
            'innkeeper_personality': self.personalidad_tabernero,
            'comfort_level': self.confort,
            'rumor': self.rumor,
            'atmosphere': self.ambiente,
            'special_offers': self.ofertas_especiales,
            'menu': self.menu,
            'rooms': self.habitaciones,
            'notable_patrons': self.patrones_notables
        }


# ============================================
# CONTENIDO Y AVENTURAS
# ============================================
class Riddle(BaseGenerated):
    __tablename__ = 'riddles'
    
    tipo = db.Column(db.String(100))  # "Acertijo Verbal", "Mecanismo", "Trampa Mágica"
    descripcion_jugadores = db.Column(db.Text)
    solucion = db.Column(db.Text)
    
    pistas = db.Column(db.JSON)
    consecuencia_fallo = db.Column(db.JSON)
    recompensa = db.Column(db.Text)

    def get_data(self):
        return {
            'title': self.name,
            'type': self.tipo,
            'player_description': self.descripcion_jugadores,
            'solution': self.solucion,
            'hints': self.pistas,
            'failure_consequence': self.consecuencia_fallo,
            'reward': self.recompensa
        }


class Quest(BaseGenerated):
    __tablename__ = 'quests'
    
    flavor_text = db.Column(db.Text)
    misiones = db.Column(db.JSON)  # Array de misiones

    def get_data(self):
        return {
            'name': self.name,
            'flavor_text': self.flavor_text,
            'quests': self.misiones
        }


class Monster(BaseGenerated):
    __tablename__ = 'monsters'
    
    tipo = db.Column(db.String(50))
    tamaño = db.Column(db.String(20))
    alineamiento = db.Column(db.String(50))
    
    ca = db.Column(db.Integer)
    hp = db.Column(db.Integer)
    velocidad = db.Column(db.String(100))
    
    estadisticas = db.Column(db.JSON)
    habilidades = db.Column(db.JSON)
    resistencias = db.Column(db.JSON)
    acciones = db.Column(db.JSON)

    def get_data(self):
        return {
            'name': self.name,
            'type': self.tipo,
            'size': self.tamaño,
            'alignment': self.alineamiento,
            'ca': self.ca,
            'hp': self.hp,
            'speed': self.velocidad,
            'stats': self.estadisticas,
            'skills': self.habilidades,
            'resistances': self.resistencias,
            'actions': self.acciones
        }


class Spell(BaseGenerated):
    __tablename__ = 'spells'
    
    nivel = db.Column(db.Integer)
    escuela = db.Column(db.String(50))
    tiempo_lanzamiento = db.Column(db.String(50))
    rango = db.Column(db.String(50))
    
    componentes = db.Column(db.JSON)
    duracion = db.Column(db.String(100))
    descripcion = db.Column(db.Text)

    def get_data(self):
        return {
            'name': self.name,
            'level': self.nivel,
            'school': self.escuela,
            'casting_time': self.tiempo_lanzamiento,
            'range': self.rango,
            'components': self.componentes,
            'duration': self.duracion,
            'description': self.descripcion
        }


class Item(BaseGenerated):
    __tablename__ = 'items'
    
    tipo = db.Column(db.String(50))
    rareza = db.Column(db.String(50))
    valor = db.Column(db.String(50))
    
    descripcion = db.Column(db.Text)
    mechanics = db.Column(db.Text)
    propiedades = db.Column(db.JSON)
    class_requirement = db.Column(db.String(100))

    def get_data(self):
        return {
            'name': self.name,
            'type': self.tipo,
            'rarity': self.rareza,
            'value': self.valor,
            'description': self.descripcion,
            'mechanics': self.mechanics,
            'properties': self.propiedades,
            'class_requirement': self.class_requirement
        }


class Loot(BaseGenerated):
    __tablename__ = 'loot'
    
    cr = db.Column(db.Integer)
    enemy_type = db.Column(db.String(150))
    
    resumen = db.Column(db.Text)
    monedas = db.Column(db.JSON)
    objetos_arte = db.Column(db.JSON)
    objetos_magicos = db.Column(db.JSON)
    curiosidades = db.Column(db.JSON)

    def get_data(self):
        return {
            'resumen': self.resumen,
            'monedas': self.monedas,
            'objetos_arte': self.objetos_arte,
            'objetos_magicos': self.objetos_magicos,
            'curiosidades': self.curiosidades,
            'cr': self.cr,
            'enemy_type': self.enemy_type
        }


class Journal(BaseGenerated):
    __tablename__ = 'journals'
    
    session_title = db.Column(db.String(200))
    epic_recap = db.Column(db.Text)
    
    loot_gained = db.Column(db.JSON)
    npcs_met = db.Column(db.JSON)
    quests_updated = db.Column(db.JSON)

    def get_data(self):
        return {
            'session_title': self.session_title,
            'name': self.name,
            'epic_recap': self.epic_recap,
            'loot_gained': self.loot_gained,
            'npcs_met': self.npcs_met,
            'quests_updated': self.quests_updated
        }


class Travel(BaseGenerated):
    __tablename__ = 'travels'
    
    ambiente_general = db.Column(db.Text)
    general_environment = db.Column(db.Text)
    clima_dominante = db.Column(db.String(200))
    dominant_climate = db.Column(db.String(200))
    eventos = db.Column(db.JSON)
    events = db.Column(db.JSON)

    def get_data(self):
        # Devolver con ambos idiomas para compatibilidad
        events_data = self.events or self.eventos or []
        env_data = self.general_environment or self.ambiente_general or ''
        climate_data = self.dominant_climate or self.clima_dominante or ''
        
        return {
            'ambiente_general': env_data,
            'general_environment': env_data,
            'clima_dominante': climate_data,
            'dominant_climate': climate_data,
            'eventos': events_data,
            'events': events_data
        }


# ============================================
# MISCELÁNEA
# ============================================
class Faction(BaseGenerated):
    __tablename__ = 'factions'
    
    descripcion = db.Column(db.Text)
    objetivos = db.Column(db.JSON)
    miembros_notables = db.Column(db.JSON)
    enemigos = db.Column(db.JSON)
    secreto = db.Column(db.Text)

    def get_data(self):
        return {
            'name': self.name,
            'description': self.descripcion,
            'goals': self.objetivos,
            'notable_members': self.miembros_notables,
            'enemies': self.enemigos,
            'secret': self.secreto
        }


class Mystery(BaseGenerated):
    __tablename__ = 'mysteries'
    
    descripcion = db.Column(db.Text)
    pistas = db.Column(db.JSON)
    sospechosos = db.Column(db.JSON)  # Array de objetos {name, motive}
    solucion = db.Column(db.Text)
    consecuencias = db.Column(db.Text)

    def get_data(self):
        return {
            'title': self.name,
            'crime_event': self.descripcion,
            'clues': self.pistas,
            'suspects': self.sospechosos,
            'truth': self.solucion,
            'consequences': self.consecuencias,
            # Compatibilidad español
            'titulo': self.name,
            'crimen_evento': self.descripcion,
            'pistas': self.pistas,
            'sospechosos': self.sospechosos,
            'verdad': self.solucion
        }


class Villain(BaseGenerated):
    __tablename__ = 'villains'
    
    tipo = db.Column(db.String(100))
    objetivo = db.Column(db.Text)
    
    estadisticas = db.Column(db.JSON)
    habilidades = db.Column(db.JSON)
    planes = db.Column(db.JSON)
    debilidades = db.Column(db.Text)

    def get_data(self):
        return {
            'name': self.name,
            'type': self.tipo,
            'objective': self.objetivo,
            'stats': self.estadisticas,
            'abilities': self.habilidades,
            'plans': self.planes,
            'weaknesses': self.debilidades
        }

# ============================================
# RUINAS
# ============================================
class Ruins(BaseGenerated):
    __tablename__ = 'ruins'
    
    ruin_type = db.Column(db.String(100))  # Tipo original (templo, castillo, etc)
    original_use = db.Column(db.Text)  # Uso original
    cataclysm = db.Column(db.Text)  # Evento que causó la ruina
    current_state = db.Column(db.Text)  # Estado actual
    inhabitants = db.Column(db.Text)  # Quién vive ahí ahora
    secret = db.Column(db.Text)  # Secreto oculto
    
    def get_data(self):
        return {
            'id': self.id,
            'name': self.name,
            'ruin_type': self.ruin_type,
            'original_use': self.original_use,
            'cataclysm': self.cataclysm,
            'current_state': self.current_state,
            'inhabitants': self.inhabitants,
            'secret': self.secret,
            'created_at': self.timestamp.isoformat() if self.timestamp else None
        }

# ============================================
# CONTRATOS
# ============================================
class Contract(BaseGenerated):
    __tablename__ = 'contracts'
    
    patron = db.Column(db.String(200))  # Entidad que ofrece el contrato
    desire = db.Column(db.String(200))  # Deseo del mortal
    offer = db.Column(db.Text)  # Qué recibe el mortal
    price = db.Column(db.Text)  # Qué debe pagar
    small_print = db.Column(db.Text)  # Letra pequeña/trampa
    escape_clause = db.Column(db.Text)  # Forma de romper el contrato
    
    def get_data(self):
        return {
            'id': self.id,
            'name': self.name,
            'patron': self.patron,
            'desire': self.desire,
            'offer': self.offer,
            'price': self.price,
            'small_print': self.small_print,
            'escape_clause': self.escape_clause,
            'created_at': self.timestamp.isoformat() if self.timestamp else None
        }

# ============================================
# ALQUIMIA
# ============================================
class Alchemy(BaseGenerated):
    __tablename__ = 'alchemy'
    
    tipo = db.Column(db.String(50))  # Poción, Veneno, Aceite, etc.
    rareza = db.Column(db.String(50))
    apariencia = db.Column(db.Text)
    sabor_olor = db.Column(db.Text)
    efecto_mecanico = db.Column(db.Text)
    efecto_secundario = db.Column(db.Text)
    ingredientes = db.Column(db.JSON)  # Array de ingredientes
    
    def get_data(self):
        return {
            'nombre': self.name,
            'tipo': self.tipo,
            'rareza': self.rareza,
            'apariencia': self.apariencia,
            'sabor_olor': self.sabor_olor,
            'efecto_mecanico': self.efecto_mecanico,
            'efecto_secundario': self.efecto_secundario,
            'ingredientes': self.ingredientes
        }

# ============================================
# BOTÁNICO MÍSTICO / HERBALIST
# ============================================
class Herbalist(BaseGenerated):
    """Plantas mágicas y flora recolectable"""
    __tablename__ = 'herbalist'
    
    descripcion = db.Column(db.Text)
    ambiente = db.Column(db.String(100))  # Bosque, Pantano, etc.
    rareza = db.Column(db.String(50))
    propiedades_ocultas = db.Column(db.JSON)  # {cruda, hervida, aplicada, quemada}
    desafio_recoleccion = db.Column(db.JSON)  # {descripcion, consecuencias, cd_sugerida}
    valor_mercado = db.Column(db.String(50))
    usos_alquimia = db.Column(db.Text)
    folklore = db.Column(db.Text)
    
    def get_data(self):
        return {
            'nombre': self.name,
            'descripcion': self.descripcion,
            'ambiente': self.ambiente,
            'rareza': self.rareza,
            'propiedades_ocultas': self.propiedades_ocultas,
            'desafio_recoleccion': self.desafio_recoleccion,
            'valor_mercado': self.valor_mercado,
            'usos_alquimia': self.usos_alquimia,
            'folklore': self.folklore
        }

# ============================================
# BIBLIOTECARIO
# ============================================
class Librarian(BaseGenerated):
    """Libros, pergaminos y documentos mágicos"""
    __tablename__ = 'librarians'
    
    topic = db.Column(db.String(200))  # Tema del libro
    book_type = db.Column(db.String(100))  # Grimorio, Diario, Tratado, etc.
    tone = db.Column(db.String(100))  # Académico, Místico, Poético, etc.
    author = db.Column(db.String(100))  # Nombre del autor
    descripcion_fisica = db.Column(db.Text)  # Estado del libro (quemado, encuadernado...)
    contenido = db.Column(db.Text)  # Contenido principal del texto
    secret = db.Column(db.Text)  # Secreto oculto
    valor = db.Column(db.String(50))  # Valor en gp

    def get_data(self):
        return {
            'topic': self.topic,
            'book_type': self.book_type,
            'tone': self.tone,
            'title': self.name,
            'author': self.author,
            'description': self.descripcion_fisica,
            'content': self.contenido,
            'secret': self.secret,
            'value': self.valor
        }

# ============================================
# SUEÑOS (DREAM WEAVER)
# ============================================
class Dream(BaseGenerated):
    """Sueños oníricos para personajes"""
    __tablename__ = 'dreams'
    
    contexto = db.Column(db.Text)  # Contexto del personaje
    tono = db.Column(db.String(50))  # Tono del sueño
    imagenes = db.Column(db.Text)  # Descripción visual
    sensaciones = db.Column(db.Text)  # Sensaciones físicas y emocionales
    significado = db.Column(db.Text)  # Significado para el DM

    def get_data(self):
        return {
            'visions': self.imagenes,
            'sensations': self.sensaciones,
            'meaning': self.significado,
            # Compatibilidad español
            'imagenes': self.imagenes,
            'sensaciones': self.sensaciones,
            'significado': self.significado
        }

class Atmosphere(BaseGenerated):
    """Descripciones sensoriales de lugares (El Ojo del Director)"""
    __tablename__ = 'atmospheres'
    
    place = db.Column(db.String(200), nullable=False)  # Lugar descrito
    context = db.Column(db.Text)  # Contexto adicional
    sight = db.Column(db.Text)  # Descripción visual
    sound = db.Column(db.Text)  # Descripción sonora
    smell = db.Column(db.Text)  # Descripción olfativa
    touch = db.Column(db.Text)  # Descripción táctil
    atmosphere = db.Column(db.Text)  # Bloque completo para leer en voz alta

    def get_data(self):
        return {
            'place': self.place,
            'context': self.context,
            'sight': self.sight,
            'sound': self.sound,
            'smell': self.smell,
            'touch': self.touch,
            'atmosphere': self.atmosphere
        }

# ============================================
# BALUARTES (STRONGHOLD BUILDER)
# ============================================

# Tabla de Instalaciones Predefinidas
class Facility(db.Model):
    """Instalaciones disponibles para baluartes según nivel y reglas D&D 2024"""
    __tablename__ = 'facilities'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    name_es = db.Column(db.String(100), nullable=False)  # Nombre en español
    size = db.Column(db.String(20), nullable=False)  # Roomy, Vast
    min_level = db.Column(db.Integer, nullable=False)  # Nivel mínimo requerido
    order_type = db.Column(db.String(50))  # Empower, Research, Craft, etc
    description = db.Column(db.Text)
    description_es = db.Column(db.Text)
    benefit = db.Column(db.Text)
    benefit_es = db.Column(db.Text)
    construction_cost = db.Column(db.Integer, default=1000)  # Coste en GP
    construction_days = db.Column(db.Integer, default=7)  # Días de construcción
    bp_generation = db.Column(db.String(20))  # "1d4", "2d6", etc - BP que genera
    
    # Relación con baluartes
    stronghold_facilities = db.relationship('StrongholdFacility', back_populates='facility', cascade='all, delete-orphan')


# Tabla Intermedia: Baluartes ↔ Instalaciones
class StrongholdFacility(db.Model):
    """Relación entre baluartes e instalaciones construidas"""
    __tablename__ = 'stronghold_facilities'
    
    id = db.Column(db.Integer, primary_key=True)
    stronghold_id = db.Column(db.Integer, db.ForeignKey('strongholds.id', ondelete='CASCADE'), nullable=False)
    facility_id = db.Column(db.Integer, db.ForeignKey('facilities.id'), nullable=False)
    
    # Estado de la instalación
    status = db.Column(db.String(20), default='active')  # active, under_construction, damaged
    construction_started_day = db.Column(db.Integer)  # Día en que empezó la construcción
    construction_remaining_days = db.Column(db.Integer)  # Días restantes
    
    # Staff asignado (JSON)
    assigned_staff = db.Column(db.JSON)  # Personal asignado a esta instalación
    
    # Sistema de órdenes
    current_order = db.Column(db.String(50))  # Orden actual asignada (Craft, Research, etc.)
    order_result = db.Column(db.JSON)  # Resultado de la última orden ejecutada
    
    # Relaciones
    stronghold = db.relationship('Stronghold', back_populates='facilities')
    facility = db.relationship('Facility', back_populates='stronghold_facilities')

class Stronghold(BaseGenerated):
    """Baluartes, castillos, torres y bases de operaciones"""
    __tablename__ = 'strongholds'
    
    stronghold_type = db.Column(db.String(100), nullable=False)  # Castle, Wizard Tower, etc
    level_requirement = db.Column(db.Integer)  # Nivel mínimo del personaje
    location = db.Column(db.Text)  # Ubicación y descripción del terreno
    
    # Sistema de Puntos de Bastión (BP)
    bastion_points = db.Column(db.Integer, default=0)  # BP acumulados
    
    # Costes y Mantenimiento
    total_gold_cost = db.Column(db.Integer, default=0)
    monthly_maintenance = db.Column(db.Integer, default=0)
    
    # Gestión temporal
    current_day = db.Column(db.Integer, default=0)
    last_bastion_turn_day = db.Column(db.Integer, default=0)  # Último día que se calcularon BP
    
    # Defensas
    defense_score = db.Column(db.Integer, default=0)  # Puntuación de defensa
    
    # Datos complejos en JSON
    staff = db.Column(db.JSON)  # Personal general del baluarte
    events_history = db.Column(db.JSON)  # Historial de eventos
    reputation = db.Column(db.JSON)  # Reputación y posición local
    special_features = db.Column(db.JSON)  # Características especiales del baluarte
    
    # Relación con instalaciones
    facilities = db.relationship('StrongholdFacility', back_populates='stronghold', cascade='all, delete-orphan')

    def get_data(self):
        # Obtener instalaciones activas
        active_facilities = []
        under_construction = []
        
        for sf in self.facilities:
            facility_data = {
                'id': sf.facility_id,
                'sf_id': sf.id,  # ID de StrongholdFacility para asignar órdenes
                'name': sf.facility.name,
                'nombre': sf.facility.name_es,
                'size': sf.facility.size,
                'tamaño': sf.facility.size,
                'order_type': sf.facility.order_type,
                'tipo_orden': sf.facility.order_type,
                'description': sf.facility.description,
                'descripcion': sf.facility.description_es,
                'benefit': sf.facility.benefit,
                'beneficio': sf.facility.benefit_es,
                'bp_generation': sf.facility.bp_generation,
                'generacion_bp': sf.facility.bp_generation,
                'status': sf.status,
                'estado': sf.status,
                'current_order': sf.current_order,
                'orden_actual': sf.current_order,
                'order_result': sf.order_result,
                'resultado_orden': sf.order_result
            }
            
            if sf.status == 'under_construction':
                facility_data['construction_remaining_days'] = sf.construction_remaining_days
                facility_data['dias_restantes'] = sf.construction_remaining_days
                under_construction.append(facility_data)
            else:
                active_facilities.append(facility_data)
        
        return {
            'name': self.name,
            'nombre': self.name,
            'type': self.stronghold_type,
            'tipo': self.stronghold_type,
            'level_requirement': self.level_requirement,
            'nivel_requerido': self.level_requirement,
            'location': self.location,
            'ubicacion': self.location,
            'ubicación': self.location,
            'current_day': self.current_day or 0,
            'dia_actual': self.current_day or 0,
            'bastion_points': self.bastion_points or 0,
            'puntos_bastion': self.bastion_points or 0,
            'defense_score': self.defense_score or 0,
            'puntuacion_defensa': self.defense_score or 0,
            'total_cost': {
                'gold': self.total_gold_cost,
                'oro': self.total_gold_cost,
                'monthly_maintenance': self.monthly_maintenance,
                'mantenimiento_mensual': self.monthly_maintenance
            },
            'active_facilities': active_facilities,
            'instalaciones_activas': active_facilities,
            'under_construction': under_construction,
            'en_construccion': under_construction,
            'staff': self.staff or [],
            'personal': self.staff or [],
            'events_history': self.events_history or [],
            'historial_eventos': self.events_history or [],
            'reputation': self.reputation or {},
            'reputacion': self.reputation or {},
            'reputación': self.reputation or {}
        }


class Rule(BaseGenerated):
    """Tabla para Reglas de D&D 2024"""
    __tablename__ = 'rules'
    
    tema = db.Column(db.String(200), nullable=False)  # Tema principal
    explicacion = db.Column(db.Text, nullable=False)  # Explicación de la regla
    cambio_importante = db.Column(db.Text)  # Cambios respecto a 2014
    ejemplo = db.Column(db.Text)  # Ejemplo de uso
    pagina_ref = db.Column(db.String(100))  # Referencia de página

    def get_data(self):
        return {
            'tema': self.tema,
            'explicacion': self.explicacion,
            'cambio_importante': self.cambio_importante,
            'ejemplo': self.ejemplo,
            'pagina_ref': self.pagina_ref,
            # Compatibilidad con nombres en inglés
            'topic': self.tema,
            'explanation': self.explicacion,
            'important_change': self.cambio_importante,
            'example': self.ejemplo,
            'page_reference': self.pagina_ref
        }


# ============================================
# GM SCREEN - REFERENCIAS DE D&D 2024
# ============================================
class GMReference(db.Model):
    """Referencias rápidas para la GM Screen"""
    __tablename__ = 'gm_references'
    
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False, unique=True, index=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    items = db.Column(db.JSON, nullable=False)  # Lista de items con nombre, descripcion, mecanica, ejemplo
    notas_importantes = db.Column(db.JSON, nullable=True)  # Lista de notas
    cambios_2024 = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'items': self.items,
            'notas_importantes': self.notas_importantes,
            'cambios_2024': self.cambios_2024
        }