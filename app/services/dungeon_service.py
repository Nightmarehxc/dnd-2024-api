from app.services.gemini_service import BaseService


class DungeonService(BaseService):
    def generate_dungeon(self, theme, level):
        system_instruction = """
        Eres un experto arquitecto de mazmorras de D&D. Tu especialidad es la "Técnica de las 5 Habitaciones".
        Crea una estructura jugable, lógica y emocionante.

        Debes devolver un JSON válido con esta estructura EXACTA:
        {
            "nombre": "Nombre de la Mazmorra",
            "ambiente": "Descripción general (olores, iluminación, temperatura)",
            "salas": [
                {
                    "id": 1,
                    "tipo": "Entrada/Guardián",
                    "titulo": "Nombre de la sala",
                    "descripcion": "Texto descriptivo para leer a los jugadores.",
                    "desafio": "Mecánicas (DC, monstruos, condiciones).",
                    "consecuencia": "Qué pasa si fallan o hacen ruido."
                },
                { "id": 2, "tipo": "Puzzle/Roleplay", ... },
                { "id": 3, "tipo": "Trampa/Revés", ... },
                { "id": 4, "tipo": "Clímax/Jefe", ... },
                { "id": 5, "tipo": "Recompensa/Giro", ... }
            ]
        }
        """

        prompt = f"""
        Genera una mazmorra de 5 habitaciones para un grupo de nivel {level}.
        Temática/Contexto: {theme}.
        Asegúrate de que las salas estén conectadas lógicamente.
        """

        return self._generate_content(system_instruction, prompt)


dungeon_service = DungeonService()