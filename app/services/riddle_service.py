from app.services.gemini_service import BaseService


class RiddleService(BaseService):
    def generate_riddle(self, theme, difficulty):
        system_instruction = """
        You are an expert trap and riddle designer for D&D 5e (2024).
        Generate a challenge (Puzzle or Trap with Riddle).
        Return valid JSON with this EXACT structure (English snake_case) English keys and Spanish values:
        {
            "title": "Challenge Name",
            "type": "Verbal Riddle / Mechanism / Magical Trap",
            "player_description": "What players see and hear when entering. THE RIDDLE ITSELF.",
            "solution": "The exact answer or required action.",
            "hints": ["Hint 1 (DC 10)", "Hint 2 (DC 15)"],
            "failure_consequence": {
                "description": "What happens if they fail or guess wrong (The Trap).",
                "damage": "E.g: 4d6 fire",
                "save": "DC 15 Dexterity"
            },
            "reward": "What they get for solving it (optional)"
        }
        """

        prompt = f"""
        Design a riddle or trap based on this theme: '{theme}'.
        Difficulty: {difficulty}.
        Make sure the riddle rhymes or is clever if it's verbal.
        
        CRITICAL: Use English keys (snake_case) English keys and Spanish values:
        "title", "type", "player_description", "solution", "hints", "failure_consequence", "reward"
        Do NOT use Spanish keys like "titulo", "descripcion_jugadores".
        """

        return self._generate_content(system_instruction, prompt)


riddle_service = RiddleService()
riddle_service = RiddleService()