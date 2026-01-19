from app.services.gemini_service import BaseService


class TravelService(BaseService):
    def generate_events(self, environment, days):
        system_instruction = """
        Eres un experto Dungeon Master narrativo. Tu especialidad es describir viajes ("Travel Montages") y eventos de exploración.
        NO generes combates directos. Genera situaciones curiosas, belleza natural, problemas logísticos o encuentros sociales.

        Genera SIEMPRE un JSON válido con esta estructura:
        {
            "ambiente_general": "Descripción sensorial del viaje (clima, olores, sonidos).",
            "clima_dominante": "Ej: Lluvias torrenciales y viento frío.",
            "eventos": [
                {
                    "titulo": "Nombre corto del evento",
                    "tipo": "Social / Exploración / Obstáculo / Curiosidad",
                    "descripcion": "Descripción de lo que ocurre.",
                    "interaccion": "Qué pueden hacer los jugadores (tires de habilidad, roleo).",
                    "consecuencia": "Qué pasa si lo ignoran o fallan (si aplica)."
                }
            ]
        }
        """

        prompt = f"""
        Genera {days} eventos de viaje interesantes para un grupo de aventureros que atraviesa: {environment}.
        Busca evocar asombro, melancolía o tensión menor, pero no combate a muerte.
        """

        return self._generate_content(system_instruction, prompt)


travel_service = TravelService()