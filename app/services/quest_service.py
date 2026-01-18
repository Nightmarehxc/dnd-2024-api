from app.services.gemini_service import BaseService


class QuestService(BaseService):
    def generate_quests(self, location, level):
        system_instruction = """
        Eres un experto Dungeon Master especializado en crear misiones secundarias rápidas y memorables (Side Quests).

        Genera SIEMPRE un JSON válido con esta estructura EXACTA:
        {
            "flavor_text": "Descripción breve del tablón o el ambiente (ej: 'El tablón está lleno de navajazos...')",
            "misiones": [
                {
                    "titulo": "Nombre llamativo de la misión",
                    "cliente": "Quién paga (Nombre y arquetipo)",
                    "descripcion": "Lo que pone en el cartel (breve)",
                    "giro": "El secreto oculto o complicación (SOLO PARA EL DM)",
                    "recompensa": "Oro o ítem acorde a nivel"
                }
            ]
        }
        """

        prompt = f"""
        Genera 4 misiones secundarias variadas para un grupo de nivel {level} que se encuentran en: {location}.

        Requisitos:
        1. Una misión debe ser de combate.
        2. Una misión debe ser social/investigación.
        3. Una misión debe ser absurda o cómica.
        4. El "giro" debe subvertir las expectativas (ej: las ratas son druidas, el fantasma solo quiere un abrazo).
        """

        return self._generate_content(system_instruction, prompt)


quest_service = QuestService()