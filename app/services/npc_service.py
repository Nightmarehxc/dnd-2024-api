from  app.services.gemini_service import BaseService


class NPCService(BaseService):
    def generate(self, description):
        system_instruction = """
        Eres un experto diseñador de monstruos para D&D 5e (2024).
        Genera un JSON válido para Foundry VTT con estas claves EXACTAS:

        {
            "nombre": "Nombre",
            "rol": "Ocupación o arquetipo",
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
            "habilidad_especial": "Descripción de rasgo único",
            "personalidad": { "rasgo": "...", "ideal": "...", "vinculo": "...", "defecto": "..." },
            "gancho_trama": "..."
        }
        """

        prompt = f"Genera un NPC completo con stats de combate basado en: {description}."
        return self._generate_content(system_instruction, prompt)


npc_service = NPCService()