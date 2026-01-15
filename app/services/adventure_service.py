from app.services.gemini_service import BaseService


class AdventureService(BaseService):
    def generate_adventure(self, theme, players, level):
        system_instruction = """
        Eres un experto Dungeon Master de D&D 5e.
        Genera una aventura estructurada en JSON válido con estas claves EXACTAS:
        {
            "titulo": "String",
            "sinopsis": "String (Resumen breve)",
            "gancho": "String (Cómo atrapar a los jugadores)",
            "capitulos": [
                { "titulo": "String", "descripcion": "String (Detalle esquemático de lo que ocurre)" }
            ],
            "npcs_notables": [
                { "nombre": "String", "rol": "String", "breve_descripcion": "String" }
            ],
            "lugares": [
                { "nombre": "String", "descripcion": "String" }
            ]
        }
        """

        prompt = f"""
        Diseña una aventura para {players} jugadores de nivel {level}.
        Temática/Idea base: {theme}.
        La aventura debe ser dinámica, con un gancho fuerte y dividida en 3-5 capítulos esquemáticos.
        """

        # CORRECCIÓN AQUÍ: Cambiado self._generate por self._generate_content
        return self._generate_content(system_instruction, prompt)


adventure_service = AdventureService()