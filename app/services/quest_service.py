from app.services.gemini_service import BaseService


class QuestService(BaseService):
    def generate_quests(self, location, level):
        system_instruction = """
        You are an expert Dungeon Master specializing in creating fast and memorable side quests.

        Always generate valid JSON with this EXACT structure (English snake_case) English keys and Spanish values:
        {
            "flavor_text": "Brief description of the bulletin board or environment (e.g: 'The board is full of scratches...')",
            "quests": [
                {
                    "title": "Catchy quest name",
                    "client": "Who pays (Name and archetype)",
                    "description": "What's posted on the board (brief)",
                    "twist": "The hidden secret or complication (DM EYES ONLY)",
                    "reward": "Gold or item appropriate to level"
                }
            ]
        }
        """

        prompt = f"""
        Generate 4 varied side quests for a group of level {level} who find themselves in: {location}.

        Requirements:
        1. One quest must be combat.
        2. One quest must be social/investigation.
        3. One quest must be absurd or funny.
        4. The "twist" must subvert expectations (e.g: the rats are druids, the ghost just wants a hug).
        
        CRITICAL: Use English keys (snake_case) English keys and Spanish values:
        "flavor_text", "quests" (array with "title", "client", "description", "twist", "reward")
        Do NOT use Spanish keys like "titulo", "cliente", "giro".
        """

        return self._generate_content(system_instruction, prompt)


quest_service = QuestService()