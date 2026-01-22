from app.services.gemini_service import BaseService


class ItemService(BaseService):
    def generate_item(self, item_type, rarity, attunement=False, name=""):
        attunement_str = "Requiere sintonización (Attunement)." if attunement else "NO requiere sintonización."
        name_instruction = f"El objeto se llama '{name}'." if name else "Inventa un nombre místico y único."

        system = """
        Eres un maestro herrero arcano de D&D 5e (2024). Genera un objeto mágico.
        Responde SOLO con este JSON exacto (snake_case español):
        {
            "nombre": "Nombre del Objeto",
            "tipo": "Tipo (Espada, Anillo, etc)",
            "rareza": "Rareza",
            "sintonizacion": true/false,
            "descripcion": "Descripción física y visual detallada.",
            "mecanicas": "Reglas de juego, bonificadores, daño y efectos mágicos (D&D 5e).",
            "valor": "Precio estimado en po"
        }
        """

        prompt = f"""
        Genera un objeto mágico con estas características:
        - Tipo: {item_type}
        - Rareza: {rarity}
        - {attunement_str}
        - {name_instruction}

        Asegúrate de que las mecánicas sean equilibradas para su rareza.
        
        IMPORTANTE: Usa claves en español (snake_case):
        "nombre", "tipo", "rareza", "sintonizacion", "descripcion", "mecanicas", "valor"
        """

        result = self._generate_content(system, prompt)
        print(f"⚔️ Item generado por Gemini: {result}")  # DEBUG
        return result


item_service = ItemService()