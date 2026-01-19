from app.services.gemini_service import BaseService
from app.services.library_service import library_service  # <--- IMPORTANTE


class CharacterService(BaseService):
    def generate_character(self, description, level, fixed_race=None, fixed_class=None):

        # 1. Obtener contexto de la biblioteca
        options = library_service.get_options()
        known_races = ", ".join(options['races'])
        known_classes = ", ".join(options['classes'])

        # 2. Construir instrucciones de contexto
        library_context = ""
        if known_races or known_classes:
            library_context = f"""
            [REGLAS DE MUNDO]
            Este mundo tiene definidas las siguientes opciones canónicas:
            - Razas Disponibles: {known_races}
            - Clases Disponibles: {known_classes}

            SIEMPRE que sea posible, elige una de estas opciones en lugar de inventar una genérica, 
            a menos que la descripción del usuario pida explícitamente algo exótico.
            """

        # 3. Restricciones forzadas (si el usuario seleccionó en el dropdown)
        constraints = ""
        if fixed_race and fixed_race != "Cualquiera":
            constraints += f"LA RAZA DEL PERSONAJE DEBE SER OBLIGATORIAMENTE: {fixed_race}.\n"
        if fixed_class and fixed_class != "Cualquiera":
            constraints += f"LA CLASE DEL PERSONAJE DEBE SER OBLIGATORIAMENTE: {fixed_class}.\n"

        system_instruction = """
        Eres un generador de personajes de D&D 5e (2024).
        Responde SIEMPRE con JSON válido siguiendo este esquema:
        {
            "nombre": "Nombre",
            "especie": "Raza",
            "clase": "Clase",
            "nivel": 1,
            "alineamiento": "Legal Bueno...",
            "trasfondo": {"nombre": "Nombre", "origin_feat": "Dote"},
            "estadisticas": {"Fuerza": 10, ...},
            "resumen_historia": "Breve historia...",
            "equipo_destacado": ["Espada", "Poción"]
        }
        """

        prompt = f"""
        Genera un personaje de nivel {level}.
        Concepto/Descripción: "{description}"

        {constraints}
        {library_context}
        """

        return self._generate_content(system_instruction, prompt)


character_service = CharacterService()