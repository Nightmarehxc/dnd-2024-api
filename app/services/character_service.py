from app.services.gemini_service import BaseService


class CharacterService(BaseService):
    def generate_character(self, description, level, fixed_race=None, fixed_class=None):

        race_instruction = f"La raza DEBE ser {fixed_race}." if fixed_race else "Elige una raza apropiada."
        class_instruction = f"La clase DEBE ser {fixed_class}." if fixed_class else "Elige una clase apropiada."

        system_instruction = """
        Eres un experto diseñador de personajes para D&D 5e (2024).
        Genera un personaje jugador (PC) completo con estadísticas de combate.
        
        Responde SIEMPRE con este JSON válido (snake_case español):
        {
            "nombre": "Nombre del Personaje",
            "raza": "Raza",
            "clase": "Clase",
            "nivel": 1,
            "alineamiento": "Ej: Neutral Good",
            "ca": 15,
            "hp": 35,
            "velocidad": 30,
            "estadisticas": { "FUE": 15, "DES": 14, "CON": 13, "INT": 12, "SAB": 10, "CAR": 8 },
            "ataques": [
                {
                    "nombre": "Ataque principal",
                    "tipo": "melee",
                    "bonificador_ataque": 4,
                    "formula_dano": "1d8 + 2",
                    "tipo_dano": "slashing"
                }
            ],
            "habilidades": ["Atletismo +4", "Percepción +2"],
            "personalidad": { "rasgo": "...", "ideal": "...", "vinculo": "...", "defecto": "..." },
            "trasfondo": "Breve historia del personaje",
            "equipo": ["Espada larga", "Armadura de cuero", "Mochila"]
        }
        """

        prompt = f"""
        Crea un personaje de D&D 5e basado en esta descripción: "{description}"
        - Nivel: {level}
        - {race_instruction}
        - {class_instruction}
        
        Asegúrate que las estadísticas sean apropiadas para el nivel y clase.
        Incluye una personalidad interesante y trasfondo breve.
        
        IMPORTANTE: Usa claves en español (snake_case).
        NO uses claves en inglés.
        """

        result = self._generate_content(system_instruction, prompt)
        print(f"👤 Character generado por Gemini: {result}")  # DEBUG
        return result


character_service = CharacterService()
