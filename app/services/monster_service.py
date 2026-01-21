from app.services.gemini_service import BaseService


class MonsterService(BaseService):
    def generate_monster(self, base_monster, theme, target_cr=None):
        cr_instruction = ""
        if target_cr:
            cr_instruction = f"AJUSTA OBLIGATORIAMENTE las estadísticas (HP, AC, Daño) para que el monstruo sea de Desafío (CR) {target_cr}."

        system = """
        Eres un diseñador de monstruos veterano para D&D 5e (2024).
        Tu trabajo es aplicar "plantillas" temáticas a monstruos existentes, modificando sus stats y habilidades.

        Devuelve SIEMPRE un JSON válido con esta estructura:
        {
            "name": "Nuevo Nombre del Monstruo",
            "type": "Tipo (ej: Humanoide, Aberración)",
            "alignment": "Alineamiento",
            "ac": 15,
            "hp": "50 (6d10 + 20)",
            "speed": "30 ft.",
            "stats": { "STR": 10, "DEX": 10, "CON": 10, "INT": 10, "WIS": 10, "CHA": 10 },
            "saves": "Str +5, Con +4 (Opcional)",
            "skills": "Perception +3 (Opcional)",
            "senses": "Darkvision 60ft",
            "languages": "Común",
            "cr": "3 (700 XP)",
            "traits": [ 
                {"name": "Nombre Rasgo", "desc": "Descripción del rasgo."} 
            ],
            "actions": [ 
                {"name": "Nombre Ataque", "desc": "Ataque de arma cuerpo a cuerpo: +5 al impacto, 1d8+3 daño."} 
            ],
            "visual": "Descripción breve de su apariencia para leer a los jugadores."
        }
        """

        prompt = f"""
        Toma el monstruo base "{base_monster}" y aplícale la plantilla/tema "{theme}".
        {cr_instruction}
        Cambia sus ataques y rasgos para reflejar el nuevo tema.
        """

        return self._generate_content(system, prompt)


monster_service = MonsterService()