from app.services.gemini_service import BaseService

class NPCService(BaseService):
    def generate(self, description):
        system_instruction = """
        Eres un experto diseñador de monstruos para D&D 5e (2024).
        Genera un JSON válido con estas claves EXACTAS:

        {
            "nombre": "Nombre",
            "rol": "Ocupación",
            "raza": "Especie",
            "alineamiento": "Ej: Neutral Evil",
            "ca": 15 (Entero),
            "hp": 45 (Entero),
            "velocidad": 30 (Entero),
            "estadisticas": { "FUE": 10, "DES": 10, "CON": 10, "INT": 10, "SAB": 10, "CAR": 10 },
            "ataques": [
                {
                    "nombre": "Ataque principal",
                    "tipo": "melee" o "ranged",
                    "bonificador_ataque": 5 (Entero),
                    "formula_dano": "1d6 + 3",
                    "tipo_dano": "slashing"
                }
            ],
            "habilidad_especial": "Rasgo único o reacción",
            "personalidad": { "rasgo": "...", "ideal": "...", "vinculo": "...", "defecto": "..." },
            "gancho_trama": "..."
        }
        """

        prompt = f"Genera un NPC completo con stats de combate (HP, CA, Ataques) basado en: {description}."
        result = self._generate_content(system_instruction, prompt)
        print(f"🎭 NPC generado por Gemini: {result}")  # DEBUG
        return result



    def chat(self, npc_data, history, user_message=None, audio_bytes=None):
        """Maneja chat de texto O voz"""

        system_instruction = f"""
        Eres {npc_data['nombre']}, un NPC en un juego de D&D 5e.
        Tu rol/ocupación es: {npc_data['rol']}.
        Tu personalidad es: {npc_data.get('personalidad', 'Neutral')}.
        Tu apariencia es: {npc_data.get('apariencia', 'Desconocida')}.

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