from app.services.gemini_service import BaseService


class MonsterService(BaseService):
    def generate_monster(self, base_monster, theme, target_cr=None):
        cr_instruction = ""
        if target_cr:
            cr_instruction = f"AJUSTA OBLIGATORIAMENTE las estadísticas (HP, AC, Daño) para que el monstruo sea de Desafío (CR) {target_cr}."

        system = """
        Eres un diseñador de monstruos veterano para D&D 5e (2024).
        Tu trabajo es aplicar "plantillas" temáticas a monstruos existentes, modificando sus stats y habilidades.

        Devuelve SIEMPRE un JSON válido con esta estructura EXACTA (snake_case español):
        {
            "nombre": "Nuevo Nombre del Monstruo",
            "tipo": "Tipo (ej: Humanoide, Aberración)",
            "alineamiento": "Alineamiento",
            "ca": 15,
            "hp": "50 (6d10 + 20)",
            "velocidad": "30 ft.",
            "estadisticas": { "FUE": 10, "DES": 10, "CON": 10, "INT": 10, "SAB": 10, "CAR": 10 },
            "salvaguardas": "FUE +5, CON +4 (Opcional)",
            "habilidades": "Percepción +3 (Opcional)",
            "sentidos": "Visión en la oscuridad 60 pies",
            "idiomas": "Común",
            "desafio": "3 (700 XP)",
            "rasgos": [ 
                {"nombre": "Nombre Rasgo", "descripcion": "Descripción del rasgo."} 
            ],
            "acciones": [ 
                {"nombre": "Nombre Ataque", "descripcion": "Ataque de arma cuerpo a cuerpo: +5 al impacto, 1d8+3 daño."} 
            ],
            "apariencia": "Descripción breve de su apariencia para leer a los jugadores."
        }
        """

        prompt = f"""
        Toma el monstruo base "{base_monster}" y aplícale la plantilla/tema "{theme}".
        {cr_instruction}
        Cambia sus ataques y rasgos para reflejar el nuevo tema.
        
        IMPORTANTE: Devuelve EXACTAMENTE el JSON con las claves en español (snake_case).
        NO uses claves en inglés como "name", "stats", "alignment". 
        USA: "nombre", "estadisticas", "alineamiento".
        """

        result = self._generate_content(system, prompt)
        print(f"👹 Monster generado por Gemini: {result}")  # DEBUG
        return result


monster_service = MonsterService()