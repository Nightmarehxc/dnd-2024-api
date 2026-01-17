from app.services.gemini_service import BaseService


class RiddleService(BaseService):
    def generate_riddle(self, theme, difficulty):
        system_instruction = """
        Eres un diseñador de trampas y acertijos para D&D 5e (2024).
        Genera un desafío (Puzzle o Trampa con Acertijo).
        Devuelve JSON válido con esta estructura EXACTA:
        {
            "titulo": "Nombre del Desafío",
            "tipo": "Acertijo Verbal / Mecanismo / Trampa Mágica",
            "descripcion_jugadores": "Lo que ven y oyen los jugadores al entrar. EL ACERTIJO EN SÍ.",
            "solucion": "La respuesta exacta o la acción requerida.",
            "pistas": ["Pista 1 (DC 10)", "Pista 2 (DC 15)"],
            "consecuencia_fallo": {
                "descripcion": "Qué pasa si fallan o se equivocan (La Trampa).",
                "dano": "Ej: 4d6 fuego",
                "salvacion": "DC 15 Destreza"
            },
            "recompensa": "Qué obtienen al resolverlo (opcional)"
        }
        """

        prompt = f"""
        Diseña un acertijo o trampa basado en esta temática: '{theme}'.
        Dificultad: {difficulty}.
        Asegúrate de que el acertijo tenga rima o sea ingenioso si es verbal.
        """

        return self._generate_content(system_instruction, prompt)


riddle_service = RiddleService()