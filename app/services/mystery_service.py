from app.services.gemini_service import BaseService

class MysteryService(BaseService):
    def generate_mystery(self, setting, difficulty):
        system = """
        You are a mystery novelist. Create a short investigation plot for a D&D game.
        
        IMPORTANT: Return ONLY valid JSON with these EXACT English keys (snake_case)Pero los valores han de ser en ESPAÑOL.:
        {
            "title": "Case title in Spanish",
            "crime_event": "Description of what happened, to whom, and where (in Spanish)",
            "suspects": [
                {"name": "Suspect 1 name", "motive": "Their motive in Spanish"},
                {"name": "Suspect 2 name", "motive": "Their motive in Spanish"}
            ],
            "clues": [
                "Physical clue 1 in Spanish",
                "Testimony or evidence 2 in Spanish",
                "Strange detail 3 in Spanish"
            ],
            "truth": "Who really did it and why (in Spanish)"
        }
        
        CRITICAL RULES:
        - Use ONLY English keys: "title", "crime_event", "suspects", "clues", "truth"
        - Do NOT use Spanish keys like "titulo", "crimen_evento", "pistas", "sospechosos", "verdad"
        - All VALUES must be in Spanish
        - Return ONLY the JSON, no extra text
        """
        
        prompt = f"""
        Create a mystery of difficulty "{difficulty}" set in: {setting}.
        
        Generate 3-4 suspects with motives, 4-5 clues, and a satisfying solution.
        Make it interesting for a D&D campaign.
        
        Remember: English keys, Spanish values. Return ONLY the JSON object.
        """
        
        return self._generate_content(system, prompt)

mystery_service = MysteryService()