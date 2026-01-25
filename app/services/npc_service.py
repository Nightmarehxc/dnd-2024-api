from app.services.gemini_service import BaseService

class NPCService(BaseService):
    def generate(self, description):
        system_instruction = """
        Eres un diseñador experto de PNJ de D&D 5e (2024).
        Generate a valid JSON with these EXACT English keys:
        Pero los valores han de ser en ESPAÑOL.
        {
            "name": "NPC Name",
            "role": "Occupation",
            "race": "Species",
            "alignment": "e.g: Neutral Evil",
            "ca": 15,
            "hp": 45,
            "speed": 30,
            "stats": { "STR": 10, "DEX": 10, "CON": 10, "INT": 10, "WIS": 10, "CHA": 10 },
            "attacks": [
                {
                    "name": "Main Attack",
                    "type": "melee" or "ranged",
                    "bonus": 5,
                    "damage": "1d6 + 3",
                    "damage_type": "slashing"
                }
            ],
            "special_ability": "Unique trait or reaction",
            "personality": { "trait": "...", "ideal": "...", "bond": "...", "flaw": "..." },
            "plot_hook": "..."
        }
        """

        prompt = f"Generate a complete NPC with combat stats (HP, CA, Attacks) based on: {description}. Use English keys. and Spanish values."
        result = self._generate_content(system_instruction, prompt)
        print(f"[LOG] NPC generado por Gemini: {result}")  # DEBUG
        return result



    def chat(self, npc_data, history, user_message=None, audio_bytes=None):
        """Maneja chat de texto O voz"""

        # Soportar tanto claves inglesas (del API) como españolas (legacy)
        name = npc_data.get('name') or npc_data.get('nombre', 'Desconocido')
        role = npc_data.get('role') or npc_data.get('rol', 'Misterioso')
        personality = npc_data.get('personality') or npc_data.get('personalidad', 'Neutral')
        appearance = npc_data.get('appearance') or npc_data.get('apariencia', 'Desconocida')

        system_instruction = f"""
        Eres {name}, un NPC en un juego de D&D 5e.
        Tu rol/ocupación es: {role}.
        Tu personalidad es: {personality}.
        Tu apariencia es: {appearance}.

        INSTRUCCIONES DE ACTUACIÓN:
        - Responde SIEMPRE en primera persona ("Yo...").
        - Mantén tu personalidad (si eres rudo, sé rudo; si eres tímido, tartamudea).
        - No rompas el personaje (no menciones que eres una IA).
        - Responde de forma concisa (máximo 2-3 oraciones) a menos que te pidan una historia.
        - Sabes lo que sabe un habitante de tu mundo, no sabes reglas de juego ni stats.
        - Si recibes audio, responde como si te hubieran hablado.
        """

        # Construimos el historial como texto para contexto
        chat_log = "HISTORIAL RECIENTE:\n"
        recent_history = history[-6:] if history else []
        for msg in recent_history:
            role = "Viajero" if msg['role'] == 'user' else "Tú"
            chat_log += f"{role}: {msg['content']}\n"

        prompt = chat_log + "\nResponde al viajero (que puede haberte hablado o escrito):"
        if user_message:
            prompt += f"\nViajero dice: {user_message}"

        # Llamamos a Gemini pasando el audio si existe
        return self._generate_text(system_instruction, prompt, audio_bytes)


npc_service = NPCService()