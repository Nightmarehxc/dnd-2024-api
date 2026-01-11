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