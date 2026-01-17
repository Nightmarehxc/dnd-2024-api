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
    city_type = fields.String(required=True) # Ej: Villa, Ciudad, Fortaleza
    theme = fields.String(required=False, load_default="Fantasía Genérica")

class RiddleRequestSchema(Schema):
    theme = fields.String(required=True)  # Ej: "Biblioteca arcana", "Tumba egipcia"
    difficulty = fields.String(required=False, load_default="Normal") # Fácil, Mortal, etc.

class EncounterRequestSchema(Schema):
    level = fields.Integer(required=True, validate=validate.Range(min=1, max=20))
    difficulty = fields.String(required=True, validate=validate.OneOf(["Fácil", "Medio", "Difícil", "Mortal"]))
    environment = fields.String(required=True, validate=validate.Length(min=3))
    players = fields.Integer(required=False, load_default=4)