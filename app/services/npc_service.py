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
        return self._generate_content(system_instruction, prompt)


    # Agregar a NPCService
    def chat(self, npc_data, history, user_message):
        # 1. Construir la "System Instruction" dinámica con los datos del NPC
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
        """

        # 2. Formatear historial para Gemini (simplificado)
        # Gemini espera lista de contenidos o un string largo. Para chat simple, un string funciona bien.
        chat_log = ""
        for msg in history:
            role = "Jugador" if msg['role'] == 'user' else npc_data['nombre']
            chat_log += f"{role}: {msg['content']}\n"

        chat_log += f"Jugador: {user_message}\n{npc_data['nombre']}:"

        # 3. Llamar al modelo
        # Nota: Usamos generate_content estándar, no JSON, porque queremos texto libre (diálogo).
        prompt = f"{chat_log}"

        # Aquí llamamos a un método raw (sin forzar JSON) que deberíamos añadir a GeminiService
        # o simplemente usar el existente y parsear el texto.
        return self._generate_text(system_instruction, prompt)

npc_service = NPCService()