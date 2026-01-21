from app.services.gemini_service import BaseService


class InnService(BaseService):
    def generate_inn(self, name, comfort_level, theme, city=""):
        context_city = ""
        if city:
            context_city = f"La posada se encuentra en la ciudad de: {city}. ADAPTA la comida, bebida y ambiente a la cultura y geografía de esa ciudad."

        system = """
        Eres un experto creador de mundos de D&D. Genera una posada detallada.
        Responde SIEMPRE con este JSON exacto:
        {
            "nombre": "Nombre de la Posada",
            "ubicacion": "Ciudad o lugar",
            "descripcion": "Descripción sensorial (olores, iluminación, ambiente).",
            "nivel_vida": "Miserable/Modesta/Rica...",
            "posadero": {
                "nombre": "Nombre",
                "raza": "Raza",
                "personalidad": "Rasgo distintivo o secreto."
            },
            "menu": [
                {"plato": "Nombre del plato/bebida", "precio": "X pc/pp/po", "desc": "Breve descripción"}
            ],
            "habitaciones": [
                {"tipo": "Común/Privada", "precio": "X po", "desc": "Estado de las camas."}
            ],
            "clientes_destacados": ["Un bardo triste", "Dos guardias borrachos"],
            "rumor_local": "Un chisme o pista de aventura que se escucha en la barra."
        }
        """

        prompt = f"""
        Genera una posada de nivel de vida "{comfort_level}" con temática "{theme}".
        {(f'El nombre debe ser: {name}' if name else 'Inventa un nombre creativo.')}
        {context_city}
        Asegúrate de que los precios del menú y habitaciones sean coherentes con el nivel de vida "{comfort_level}" (según D&D 5e).
        """

        return self._generate_content(system, prompt)


inn_service = InnService()