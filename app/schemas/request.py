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
    description = fields.String(required=True, validate=validate.Length(min=3))
    type = fields.String(
        required=False,
        load_default="Cualquiera",
        validate=validate.OneOf(["Arma", "Armadura", "Poción", "Objeto Maravilloso", "Cualquiera"])
    )

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
    shop_type = fields.String(required=True, validate=validate.Length(min=3))
    location = fields.String(required=False, load_default="Ciudad Genérica")
    level = fields.Integer(required=False, load_default=1, validate=validate.Range(min=1, max=20))
    vendor_race = fields.String(required=False, load_default=None)

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
    notes = fields.String(required=True, validate=validate.Length(min=10))

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

# ... imports existentes ...

class DungeonRequestSchema(Schema):
    theme = fields.String(required=True, validate=validate.Length(min=3))
    level = fields.Integer(required=False, load_default=1, validate=validate.Range(min=1, max=20))