from app.services.gemini_service import BaseService


class ItemService(BaseService):
    def generate_item(self, item_type, rarity, attunement=False, name=""):
        attunement_str = "Requiere sintonización (Attunement)." if attunement else "NO requiere sintonización."
        name_instruction = f"El objeto se llama '{name}'." if name else "Inventa un nombre místico y único."

        system = """
        Eres un maestro herrero arcano de D&D 5e (2024). Genera un objeto mágico.
        Responde SOLO con este JSON exacto:
        {
            "name": "Nombre del Objeto",
            "type": "Tipo (Espada, Anillo, etc)",
            "rarity": "Rareza",
            "requires_attunement": true/false,
            "description": "Descripción física y visual detallada.",
            "mechanics": "Reglas de juego, bonificadores, daño y efectos mágicos (D&D 5e).",
            "value": "Precio estimado en po"
        }
        """

        prompt = f"""
        Genera un objeto mágico con estas características:
        - Tipo: {item_type}
        - Rareza: {rarity}
        - {attunement_str}
        - {name_instruction}

        Asegúrate de que las mecánicas sean equilibradas para su rareza.
        """

        return self._generate_content(system, prompt)


item_service = ItemService()