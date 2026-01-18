from app.services.gemini_service import BaseService


class SpellService(BaseService):
    def generate_spell(self, description, level=None):
        lvl_str = f"de Nivel {level}" if level is not None else "de un nivel de poder adecuado a la descripción"

        system_instruction = """
        Eres un Archimago experto en la creación de nuevos hechizos (Homebrew) para D&D 5e (2024).
        Tu prioridad absoluta es el BALANCE MATEMÁTICO. Usa la "Dungeon Master's Guide" para calcular el daño/efecto por nivel.

        Genera SIEMPRE un JSON válido con esta estructura:
        {
            "nombre": "Nombre Arcano del Hechizo",
            "nivel_escuela": "Ej: Evocación de nivel 3",
            "tiempo_casteo": "Ej: 1 acción",
            "alcance": "Ej: 60 pies (18 m)",
            "componentes": "V, S, M (descripción del material)",
            "duracion": "Ej: Instantáneo o Concentración, hasta 1 minuto",
            "descripcion": "Texto completo de reglas. Usa lenguaje técnico de D&D (Tirada de salvación, daño, condiciones).",
            "a_niveles_superiores": "Texto de mejora por slot superior (o null si no aplica).",
            "clases": ["Mago", "Hechicero", "Brujo"]
        }
        """

        prompt = f"""
        Diseña un nuevo hechizo {lvl_str} basado en esta idea: "{description}".
        Hazlo creativo pero mecánicamente justo.
        """

        return self._generate_content(system_instruction, prompt)


spell_service = SpellService()