from marshmallow import Schema, fields, validate

# Esquema base para peticiones de generación
class GenerationRequestSchema(Schema):
    description = fields.String(
        required=True,
        validate=validate.Length(min=3, max=500, error="La descripción debe tener entre 3 y 500 caracteres.")
    )
    # Opcional: Nivel del personaje (por defecto 1 si no se envía)
    level = fields.Integer(
        required=False,
        load_default=1,
        validate=validate.Range(min=1, max=20, error="El nivel debe ser entre 1 y 20.")
    )

class CharacterRequestSchema(Schema):
    description = fields.String(required=False, load_default="")
    level = fields.Integer(required=False, load_default=1)
    # NUEVOS CAMPOS:
    fixed_race = fields.String(required=False, allow_none=True)
    fixed_class = fields.String(required=False, allow_none=True)

# Esquema específico para Objetos (Items)
class ItemRequestSchema(Schema):
    name = fields.String(required=False, load_default="")
    # El frontend envía 'item_type', asegúrate de que coincida aquí
    item_type = fields.String(required=True)
    rarity = fields.String(required=True)
    # El frontend envía un booleano (true/false) en 'attunement'
    attunement = fields.Boolean(required=False, load_default=False)

# Esquema para Aventuras (CORREGIDO)
class AdventureRequestSchema(Schema):
    theme = fields.String(required=True, validate=validate.Length(min=5))
    # Cambiado required=True por required=False porque tienen load_default
    players = fields.Integer(
        required=False,
        load_default=4,
        validate=validate.Range(min=1, max=10)
    )
    level = fields.Integer(
        required=False,
        load_default=1,
        validate=validate.Range(min=1, max=20)
    )

# Esquema para Tiendas
class ShopRequestSchema(Schema):
    shop_type = fields.String(required=True)
    # CAMBIO: Ahora es entero y validamos rango D&D
    level = fields.Integer(required=False, load_default=1, validate=validate.Range(min=1, max=20))
    location = fields.String(required=False, load_default="")


class CityRequestSchema(Schema):
    name = fields.String(required=False, load_default="Una ciudad sin nombre")
    size_type = fields.String(required=True, validate=validate.Length(min=3)) # Ej: "Aldea", "Metrópolis"
    biome = fields.String(required=False, load_default="Clima templado estándar") # Ej: "Desierto", "Tundra"

class RiddleRequestSchema(Schema):
    theme = fields.String(required=True)  # Ej: "Biblioteca arcana", "Tumba egipcia"
    difficulty = fields.String(required=False, load_default="Normal") # Fácil, Mortal, etc.

class EncounterRequestSchema(Schema):
    level = fields.Integer(required=True, validate=validate.Range(min=1, max=20))
    difficulty = fields.String(required=True, validate=validate.OneOf(["Fácil", "Medio", "Difícil", "Mortal"]))
    environment = fields.String(required=True, validate=validate.Length(min=3))
    players = fields.Integer(required=False, load_default=4)

class LootRequestSchema(Schema):
    cr = fields.Integer(required=True, validate=validate.Range(min=0, max=30))
    enemy_type = fields.String(required=True, validate=validate.Length(min=3))

class RuleRequestSchema(Schema):
    query = fields.String(required=True, validate=validate.Length(min=3))

class QuestRequestSchema(Schema):
    location = fields.String(required=True, validate=validate.Length(min=3))
    level = fields.Integer(required=False, load_default=1, validate=validate.Range(min=1, max=20))

class JournalRequestSchema(Schema):
    # SOLUCIÓN: Límite de 5000 caracteres para evitar abuso o costes excesivos
    raw_notes = fields.String(
        required=True,
        validate=validate.Length(max=5000, error="Las notas no pueden exceder los 5000 caracteres.")
    )
    tone = fields.String(required=False, load_default="Épico")

class SpellRequestSchema(Schema):
    description = fields.String(required=True, validate=validate.Length(min=5))
    level = fields.Integer(required=False, load_default=None, validate=validate.Range(min=0, max=9))

class VillainRequestSchema(Schema):
    theme = fields.String(required=True, validate=validate.Length(min=3))
    level_range = fields.String(required=False, load_default="1-5") # Ej: "1-5", "10-15"

class TravelRequestSchema(Schema):
    environment = fields.String(required=True, validate=validate.Length(min=3)) # Ej: Bosque de los Elfos, Desierto de ceniza
    days = fields.Integer(required=False, load_default=3, validate=validate.Range(min=1, max=10)) # Cuántos eventos generar

class FactionRequestSchema(Schema):
    theme = fields.String(required=True, validate=validate.Length(min=3)) # Ej: "Bajos fondos", "Corte Real"
    faction_type = fields.String(required=False, load_default="Organización Secreta")

class AlchemyRequestSchema(Schema):
    item_type = fields.String(required=True, validate=validate.OneOf(["Poción", "Veneno", "Aceite", "Elixir", "Ungüento"]))
    rarity = fields.String(required=False, load_default="Común")

class DungeonRequestSchema(Schema):
    theme = fields.String(required=True, validate=validate.Length(min=3))
    level = fields.Integer(required=False, load_default=1, validate=validate.Range(min=1, max=20))

class LibrarianRequestSchema(Schema):
    topic = fields.String(required=True, validate=validate.Length(min=3))  # Tema del libro
    type = fields.String(required=False, load_default="Libro Antiguo")     # Libro, Pergamino, Carta...

class DreamRequestSchema(Schema):
    context = fields.String(required=True)  # Contexto del personaje o situación
    tone = fields.String(required=False, load_default="Profético") # Pesadilla, Simbólico...

class MysteryRequestSchema(Schema):
    setting = fields.String(required=True)  # Mansión, Barco, Pueblo
    difficulty = fields.String(required=False, load_default="Medio")

class ContractRequestSchema(Schema):
    patron = fields.String(required=True)   # Diablo, Hada, Gremio
    desire = fields.String(required=True)   # Qué quiere el jugador (Poder, Oro)

class RuinsLoreRequestSchema(Schema):
    name = fields.String(required=True)  # Nombre del lugar
    ruin_type = fields.String(required=False, load_default="Estructura Antigua")

class MonsterRequestSchema(Schema):
    base_monster = fields.String(required=True) # Ej: Ogro, Goblin
    theme = fields.String(required=True)        # Ej: Cibernético, Infernal
    target_cr = fields.String(required=False, allow_none=True) # Ej: 5 (Opcional)

class InnRequestSchema(Schema):
    name = fields.String(required=False, load_default="")
    comfort_level = fields.String(
        required=False,
        load_default="Modesta",
        validate=validate.OneOf(["Miserable", "Pobre", "Modesta", "Confortable", "Rica", "Aristocrática"])
    )
    theme = fields.String(required=False, load_default="Fantasía Genérica")
    city = fields.String(required=False, load_default="") # NUEVO: Ciudad vinculada