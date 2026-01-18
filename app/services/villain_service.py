from app.services.gemini_service import BaseService


class VillainService(BaseService):
    def generate_villain(self, theme, level_range):
        system_instruction = """
        Eres un experto Narrador y Diseñador de Campañas de D&D.
        Tu especialidad es crear Villanos Finales (BBEG) complejos, carismáticos y peligrosos.

        Genera SIEMPRE un JSON válido con esta estructura EXACTA:
        {
            "nombre": "Nombre e Título (Ej: Malakor el Sombrío)",
            "arquetipo": "Clase/Monstruo principal (Ej: Lich Necromante)",
            "cita_celebre": "Una frase memorable que defina su filosofía.",
            "motivacion": "Por qué hace lo que hace (No solo 'es malo', busca una razón profunda o trágica).",
            "plan_maestro": "Su objetivo final en una frase.",
            "fases_plan": [
                "Fase 1: Infiltración en la corte...",
                "Fase 2: El ritual de la luna roja...",
                "Fase 3: Dominación total..."
            ],
            "tenientes": [
                { "nombre": "Nombre", "rol": "Rol (Ej: El Asesino, El General)", "raza": "Raza", "breve_desc": "Detalle rápido" }
            ],
            "guarida": "Descripción breve y evocadora de su base."
        }
        """

        prompt = f"""
        Diseña un Villano Principal (BBEG) para una campaña de niveles {level_range}.
        Temática o Tono de la campaña: {theme}.
        Asegúrate de que el villano tenga sinergia con la temática.
        """

        return self._generate_content(system_instruction, prompt)


villain_service = VillainService()