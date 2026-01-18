from app.services.gemini_service import BaseService


class LootService(BaseService):
    def generate_loot(self, cr, enemy_type):
        system_instruction = """
        Eres un experto Dungeon Master de D&D 5e (2024). Tu especialidad es generar tesoros (Loot Hoards) equilibrados y temáticos.

        Genera SIEMPRE un JSON válido con esta estructura:
        {
            "resumen": "Descripción visual del tesoro (ej: Un cofre podrido, un montón de oro suelto...)",
            "monedas": { 
                "cp": 0, "sp": 0, "gp": 0, "pp": 0 
            },
            "objetos_arte": [
                { "nombre": "Cáliz de plata", "valor": "25 gp", "descripcion": "Tiene grabados de dragones." }
            ],
            "objetos_magicos": [
                { "nombre": "Poción de Curación", "rareza": "Común", "efecto": "Cura 2d4+2 HP." }
            ],
            "curiosidades": [
                "Una carta de amor manchada de sangre",
                "Una llave oxidada que no abre nada aquí"
            ]
        }
        """

        prompt = f"""
        Genera un botín de tesoro (Hoard) para un encuentro de CR {cr} contra: {enemy_type}.

        Instrucciones:
        1. Ajusta la cantidad de oro y objetos mágicos al CR (Nivel de Desafío) según la DMG.
        2. Si el CR es bajo (0-4), pon pocos o ningún objeto mágico permanente, usa consumibles.
        3. Dale sabor temático al tesoro según el enemigo (ej: Si son cultistas, objetos oscuros; si son bandidos, joyas robadas).
        """

        return self._generate_content(system_instruction, prompt)


loot_service = LootService()