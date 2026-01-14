from  app.services.gemini_service import BaseService


class CharacterService(BaseService):
    def generate(self, description, level):
        system_instruction = """
        Genera un Personaje Jugador (PC) para D&D 5e (2024). JSON Requerido:
        {
            "nombre": "...",
            "especie": "...",
            "clase": "...",
            "nivel": Entero,
            "trasfondo": { 
                "nombre": "...", 
                "origin_feat": "Nombre del dote", 
                "atributos_bonificados": ["FUE", "CAR"] 
            },
            "estadisticas": { "FUE": 10, "DES": 10, "CON": 10, "INT": 10, "SAB": 10, "CAR": 10 },
            "equipo_destacado": ["Item 1", "Item 2"],
            "resumen_historia": "..."
        }
        """

        prompt = f"Crea un personaje de nivel {level} basado en: {description}."
        return self._generate_content(system_instruction, prompt)


character_service = CharacterService()