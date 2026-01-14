from  app.services.gemini_service import BaseService


class ItemService(BaseService):
    def generate(self, description, item_type):
        system_instruction = """
        Eres un experto creador de objetos para D&D 5e (2024).
        Genera SIEMPRE un JSON válido con estas claves EXACTAS en español:

        {
            "nombre": "Nombre del objeto",
            "tipo": "Tipo (Arma, Poción, Anillo, etc)",
            "rareza": "Común, Poco Común, Rara, Muy Rara, Legendaria",
            "requiere_sintonizacion": boolean,
            "dano": { "formula": "1d8 + 2", "tipo": "fuego" } (O null si no es arma),
            "weapon_mastery": "Propiedad de maestría (Nick, Sap, Push, Topple) o null",
            "efecto_mecanico": "Descripción de reglas y bonificadores",
            "descripcion_vis": "Descripción visual y de sabor (flavor text)"
        }
        """

        prompt = f"Crea un objeto de tipo '{item_type}' basado en: {description}. Usa reglas de 2024."
        return self._generate_content(system_instruction, prompt)


item_service = ItemService()