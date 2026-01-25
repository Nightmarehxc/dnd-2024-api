from app.services.gemini_service import BaseService


class VillainService(BaseService):
    def generate_villain(self, theme, level_range):
        system_instruction = """
        You are an expert D&D 2024 Narrator and Campaign Designer.
        Your specialty is creating complex, charismatic and dangerous Final Villains (BBEG).

        Always generate valid JSON with this EXACT structure (English snake_case keys, Spanish values):
        {
            "name": "Name and Title (E.g: Malakor the Dark)",
            "archetype": "Main Class/Monster (E.g: Necromancer Lich)",
            "race": "Race or creature type",
            "famous_quote": "A memorable phrase that defines their philosophy.",
            "motivation": "Why they do what they do (Not just 'they're evil', seek deep or tragic reason).",
            "master_plan": "Their ultimate goal in one phrase.",
            "plan_phases": [
                "Phase 1: Infiltration of the court...",
                "Phase 2: The red moon ritual...",
                "Phase 3: Total domination..."
            ],
            "lieutenants": [
                { "name": "Name", "role": "Role (E.g: The Assassin, The General)", "race": "Race", "brief_desc": "Quick detail" }
            ],
            "lair": "Brief and evocative description of their base.",
            "ca": 18,
            "hp": 250,
            "speed": 30,
            "stats": { "STR": 16, "DEX": 14, "CON": 18, "INT": 20, "WIS": 16, "CHA": 18 },
            "attacks": [
                {
                    "name": "Attack Name",
                    "type": "melee" or "ranged" or "spell",
                    "bonus": 8,
                    "damage": "2d8 + 5",
                    "damage_type": "necrotic" or other damage type
                }
            ],
            "special_abilities": [
                "Legendary Resistance (3/Day): The villain can choose to succeed on a failed saving throw.",
                "Other unique abilities..."
            ],
            "legendary_actions": [
                "Attack: The villain makes one attack.",
                "Cast a Cantrip: The villain casts a cantrip.",
                "Teleport (Costs 2 Actions): The villain magically teleports up to 60 feet."
            ]
        }
        """

        prompt = f"""
        Design a Main Villain (BBEG) for a campaign of levels {level_range}.
        Campaign Theme or Tone: {theme}.
        Make sure the villain has synergy with the theme.
        
        CRITICAL: 
        - Use English keys (snake_case): "name", "archetype", "famous_quote", "motivation", "master_plan", "plan_phases", "lieutenants", "lair", "ca", "hp", "speed", "stats", "attacks", "special_abilities", "legendary_actions"
        - Do NOT use Spanish keys like "nombre", "arquetipo", "motivacion".
        - Include combat statistics (CA, HP, Stats, Attacks) appropriate for the level range.
        - Add 2-3 attacks including both physical and magical/special abilities.
        - Add 2-4 special abilities including legendary resistance.
        - Add 3 legendary actions.
        - Values should be in Spanish.
        """

        return self._generate_content(system_instruction, prompt)


villain_service = VillainService()