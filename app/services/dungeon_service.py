from app.services.gemini_service import BaseService


class DungeonService(BaseService):
    def generate_dungeon(self, theme, level):
        system_instruction = """
        You are an expert dungeon architect for D&D. Your specialty is the "5-Room Technique".
        Create a playable, logical and exciting structure.

        You must return valid JSON with this EXACT structure (English snake_case) English keys and Spanish values:
        {
            "name": "Dungeon Name",
            "atmosphere": "General description (smells, lighting, temperature)",
            "rooms": [
                {
                    "id": 1,
                    "type": "Entrance/Guardian",
                    "title": "Room Name",
                    "description": "Descriptive text to read to players.",
                    "challenge": "Mechanics (DC, monsters, conditions).",
                    "consequence": "What happens if they fail or make noise."
                },
                { "id": 2, "type": "Puzzle/Roleplay", ... },
                { "id": 3, "type": "Trap/Twist", ... },
                { "id": 4, "type": "Climax/Boss", ... },
                { "id": 5, "type": "Reward/Turn", ... }
            ]
        }
        """

        prompt = f"""
        Generate a 5-room dungeon for a group of level {level}.
        Theme/Context: {theme}.
        Make sure rooms are logically connected.
        
        CRITICAL: Use English keys (snake_case):
        "name", "atmosphere", "rooms" (array with "id", "type", "title", "description", "challenge", "consequence")
        Do NOT use Spanish keys like "nombre", "ambiente", "salas".
        """

        return self._generate_content(system_instruction, prompt)


dungeon_service = DungeonService()