from app.services.gemini_service import BaseService


class AdventureService(BaseService):
    def generate_adventure(self, theme, players, level):
        system_instruction = """
        You are an expert Dungeon Master for D&D 5e.
        Generate a structured adventure in valid JSON with EXACTLY these keys and Spanish values:
        {
            "title": "Título de la aventura en español",
            "synopsis": "Resumen breve de la aventura en español (2-3 líneas)",
            "hook": "Gancho que engancha a los jugadores en español (cómo comienza la aventura)",
            "chapters": [
                {
                    "title": "Título del Capítulo en español",
                    "description": "Descripción detallada de qué sucede en este capítulo en español (2-3 párrafos)"
                }
            ],
            "notable_npcs": [
                {
                    "name": "Nombre del personaje en español",
                    "role": "Rol del personaje en español",
                    "brief_description": "Descripción breve del personaje en español"
                }
            ],
            "locations": [
                {
                    "name": "Nombre del lugar en español",
                    "description": "Descripción del lugar en español"
                }
            ]
        }

        CRITICAL REQUIREMENTS:
        - EVERY chapter MUST have BOTH "title" AND "description" fields
        - EVERY notable_npc MUST have "name", "role", AND "brief_description" fields
        - EVERY location MUST have "name" AND "description" fields
        - ALL values MUST be in Spanish
        - Use ONLY the English keys shown above, NEVER Spanish keys
        - Return ONLY valid JSON, no markdown, no extra text
        """

        prompt = f"""
        Diseña una aventura para {players} jugadores de nivel {level}.
        Temática/Idea base: {theme}.
        
        La aventura DEBE tener:
        1. Un TÍTULO atractivo en español
        2. Una SINOPSIS de 2-3 líneas en español
        3. Un GANCHO (hook) emocionante que explique cómo comienza en español
        4. Exactamente 3-5 CAPÍTULOS con:
           - Título descriptivo en español
           - Descripción DETALLADA de 2-3 párrafos en español explicando qué sucede
        5. Entre 2-4 PERSONAJES NOTABLES con:
           - Nombre en español
           - Rol en español
           - Descripción breve en español
        6. Entre 2-4 LUGARES IMPORTANTES con:
           - Nombre en español
           - Descripción en español

        IMPORTANT: Every chapter, NPC, and location MUST be completely filled with descriptions.
        NO "Sin descripción", NO empty fields.
        Generate REAL content in Spanish for ALL fields.
        """

        result = self._generate_content(system_instruction, prompt)
        
        # DEBUG: Log del resultado
        print(f"[ADVENTURE SERVICE] Resultado bruto de Gemini: {result}")
        print(f"[ADVENTURE SERVICE] Tipo: {type(result)}")
        
        # Validar que sea un dict válido
        if isinstance(result, dict):
            if 'error' in result:
                print(f"[ADVENTURE SERVICE] Error en respuesta: {result['error']}")
                return result
            # Validar que tenga las claves esperadas
            required_keys = ['title', 'synopsis', 'hook', 'chapters', 'notable_npcs', 'locations']
            missing_keys = [k for k in required_keys if k not in result]
            if missing_keys:
                print(f"[ADVENTURE SERVICE] ADVERTENCIA: Faltan claves: {missing_keys}")
                print(f"[ADVENTURE SERVICE] Claves presentes: {list(result.keys())}")
        
        return result


adventure_service = AdventureService()