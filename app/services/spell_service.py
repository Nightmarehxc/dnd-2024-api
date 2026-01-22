from app.services.gemini_service import BaseService


class SpellService(BaseService):
    def generate_spell(self, description, level=None):
        lvl_str = f"de Nivel {level}" if level is not None else "de un nivel de poder adecuado a la descripción"

        system_instruction = """
        Eres un Archimago experto en la creación de nuevos hechizos (Homebrew) para D&D 5e (2024).
        Tu prioridad absoluta es el BALANCE MATEMÁTICO. Usa la "Dungeon Master's Guide" para calcular el daño/efecto por nivel.

        Genera SIEMPRE un JSON válido con esta estructura (snake_case español):
        {
            "nombre": "Nombre Arcano del Hechizo",
            "nivel": 3,
            "escuela": "Evocación",
            "tiempo_casteo": "1 acción",
            "alcance": "60 pies (18 m)",
            "componentes": "V, S, M (descripción del material)",
            "duracion": "Instantáneo o Concentración, hasta 1 minuto",
            "descripcion": "Texto completo de reglas. Usa lenguaje técnico de D&D (Tirada de salvación, daño, condiciones).",
            "mejora_nivel_superior": "Texto de mejora por slot superior (o vacío si no aplica)"
        }
        """

        prompt = f"""
        Diseña un nuevo hechizo {lvl_str} basado en esta idea: "{description}".
        Hazlo creativo pero mecánicamente justo.
        
        IMPORTANTE: Usa claves en español (snake_case):
        "nombre", "nivel" (como número), "escuela", "tiempo_casteo", "alcance", "componentes", "duracion", "descripcion", "mejora_nivel_superior"
        NO incluyas "clases" - eso se gestiona en BD separadamente.
        """

        result = self._generate_content(system_instruction, prompt)
        print(f"✨ Spell generado por Gemini: {result}")  # DEBUG
        return result


spell_service = SpellService()