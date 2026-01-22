from app import db
from datetime import datetime


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

    def to_dict(self):
        """Convierte el modelo a diccionario"""
        return {
            'id': self.id,
            'type': self.type,
            'name': self.name,
            'timestamp': self.timestamp.isoformat(),
            'data': self.get_data()
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
            'nombre': self.name,
            'clase': self.clase,
            'nivel': self.nivel,
            'especie': self.especie,
            'alineamiento': self.alineamiento,
            'estadisticas': self.estadisticas,
            'equipo_destacado': self.equipo_destacado,
            'trasfondo': self.trasfondo,
            'resumen_historia': self.resumen_historia
        }


class NPC(BaseGenerated):
    __tablename__ = 'npcs'
    
    rol = db.Column(db.String(100))
    raza = db.Column(db.String(50))
    alineamiento = db.Column(db.String(50))
    
    estadisticas = db.Column(db.JSON)  # Estadísticas D&D
    personalidad = db.Column(db.JSON)  # traits, ideals, bonds, flaws
    hp = db.Column(db.Integer)
    ca = db.Column(db.Integer)
    velocidad = db.Column(db.Integer)
    ataques = db.Column(db.JSON)
    habilidad_especial = db.Column(db.Text)
    gancho_trama = db.Column(db.Text)

    def get_data(self):
        return {
            'nombre': self.name,
            'rol': self.rol,
            'raza': self.raza,
            'alineamiento': self.alineamiento,
            'estadisticas': self.estadisticas,
            'personalidad': self.personalidad,
            'hp': self.hp,
            'ca': self.ca,
            'velocidad': self.velocidad,
            'ataques': self.ataques,
            'habilidad_especial': self.habilidad_especial,
            'gancho_trama': self.gancho_trama
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
            'titulo': self.name,
            'sinopsis': self.sinopsis,
            'gancho': self.gancho,
            'capitulos': self.capitulos,
            'npcs_notables': self.npcs_notables,
            'lugares': self.lugares
        }


class City(BaseGenerated):
    __tablename__ = 'cities'
    
    poblacion = db.Column(db.String(50))
    gobierno = db.Column(db.String(100))
    clima = db.Column(db.String(50))
    
    puntos_interes = db.Column(db.JSON)
    conflicto_local = db.Column(db.Text)
    secreto = db.Column(db.Text)

    def get_data(self):
        return {
            'nombre': self.name,
            'poblacion': self.poblacion,
            'gobierno': self.gobierno,
            'clima': self.clima,
            'puntos_interes': self.puntos_interes,
            'conflicto_local': self.conflicto_local,
            'secreto': self.secreto
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
            'nombre': self.name,
            'descripcion': self.descripcion,
            'profundidad': self.profundidad,
            'arquitecto': self.arquitecto,
            'salas': self.salas,
            'trampas': self.trampas,
            'tesoro': self.tesoro,
            'secreto_central': self.secreto_central
        }


class Shop(BaseGenerated):
    __tablename__ = 'shops'
    
    propietario = db.Column(db.String(100))
    especialidad = db.Column(db.String(100))
    ubicacion = db.Column(db.String(100))
    
    inventario = db.Column(db.JSON)
    ambiente = db.Column(db.Text)
    secreto = db.Column(db.Text)

    def get_data(self):
        return {
            'shop_name': self.name,
            'propietario': self.propietario,
            'especialidad': self.especialidad,
            'ubicacion': self.ubicacion,
            'inventario': self.inventario,
            'ambiente': self.ambiente,
            'secreto': self.secreto
        }


class Inn(BaseGenerated):
    __tablename__ = 'inns'
    
    tabernero = db.Column(db.String(100))
    raza_tabernero = db.Column(db.String(50))
    confort = db.Column(db.String(50))  # Lujoso, Confortable, Básico, etc.
    
    rumor = db.Column(db.Text)
    ambiente = db.Column(db.Text)
    ofertas_especiales = db.Column(db.JSON)

    def get_data(self):
        return {
            'nombre': self.name,
            'tabernero': self.tabernero,
            'raza_tabernero': self.raza_tabernero,
            'confort': self.confort,
            'rumor': self.rumor,
            'ambiente': self.ambiente,
            'ofertas_especiales': self.ofertas_especiales
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
            'titulo': self.name,
            'tipo': self.tipo,
            'descripcion_jugadores': self.descripcion_jugadores,
            'solucion': self.solucion,
            'pistas': self.pistas,
            'consecuencia_fallo': self.consecuencia_fallo,
            'recompensa': self.recompensa
        }


class Quest(BaseGenerated):
    __tablename__ = 'quests'
    
    flavor_text = db.Column(db.Text)
    misiones = db.Column(db.JSON)  # Array de misiones

    def get_data(self):
        return {
            'nombre': self.name,
            'flavor_text': self.flavor_text,
            'misiones': self.misiones
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
            'nombre': self.name,
            'tipo': self.tipo,
            'tamaño': self.tamaño,
            'alineamiento': self.alineamiento,
            'ca': self.ca,
            'hp': self.hp,
            'velocidad': self.velocidad,
            'estadisticas': self.estadisticas,
            'habilidades': self.habilidades,
            'resistencias': self.resistencias,
            'acciones': self.acciones
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
            'nombre': self.name,
            'nivel': self.nivel,
            'escuela': self.escuela,
            'tiempo_lanzamiento': self.tiempo_lanzamiento,
            'rango': self.rango,
            'componentes': self.componentes,
            'duracion': self.duracion,
            'descripcion': self.descripcion
        }


class Item(BaseGenerated):
    __tablename__ = 'items'
    
    tipo = db.Column(db.String(50))
    rareza = db.Column(db.String(50))
    valor = db.Column(db.String(50))
    
    descripcion = db.Column(db.Text)
    mecanica = db.Column(db.Text)
    propiedades = db.Column(db.JSON)

    def get_data(self):
        return {
            'nombre': self.name,
            'tipo': self.tipo,
            'rarity': self.rareza,
            'valor': self.valor,
            'descripcion': self.descripcion,
            'mecanica': self.mecanica,
            'propiedades': self.propiedades
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
            'nombre': self.name,
            'descripcion': self.descripcion,
            'objetivos': self.objetivos,
            'miembros_notables': self.miembros_notables,
            'enemigos': self.enemigos,
            'secreto': self.secreto
        }


class Mystery(BaseGenerated):
    __tablename__ = 'mysteries'
    
    descripcion = db.Column(db.Text)
    pistas = db.Column(db.JSON)
    solucion = db.Column(db.Text)
    consecuencias = db.Column(db.Text)

    def get_data(self):
        return {
            'titulo': self.name,
            'descripcion': self.descripcion,
            'pistas': self.pistas,
            'solucion': self.solucion,
            'consecuencias': self.consecuencias
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
            'nombre': self.name,
            'tipo': self.tipo,
            'objetivo': self.objetivo,
            'estadisticas': self.estadisticas,
            'habilidades': self.habilidades,
            'planes': self.planes,
            'debilidades': self.debilidades
        }


# ============================================
# TABLA GENÉRICA PARA TIPOS NO MAPEADOS
# ============================================
class GeneratedItem(BaseGenerated):
    """Fallback para tipos que aún no tienen modelo específico"""
    __tablename__ = 'generated_items'
    
    item_type = db.Column(db.String(50), nullable=False)
    data = db.Column(db.JSON, nullable=False)

    def get_data(self):
        return self.data