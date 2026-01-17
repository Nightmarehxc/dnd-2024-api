from app.services.gemini_service import BaseService


class CityService(BaseService):
    def generate_city(self, city_type, theme):
        system_instruction = """
        Eres un experto Worldbuilder para D&D 5e (2024). Genera un Asentamiento detallado.
        Devuelve JSON válido con esta estructura EXACTA:
        {
            "nombre": "Nombre de la ciudad",
            "tipo": "Villa/Ciudad/Metrópolis...",
            "poblacion": "Ej: 5,000 habitantes (Mayoría humanos)",
            "gobierno": {
                "tipo": "Monarquía/Consejo/Anarquía...",
                "lider": "Nombre y breve descripción del líder",
                "descripcion": "Cómo funciona la ley aquí"
            },
            "distritos": [
                {"nombre": "Nombre Distrito", "descripcion": "Qué se hace aquí, ambiente..."}
            ],
            "lugares_interes": [
                {"nombre": "Nombre (Ej: La Taberna del Tuerto)", "tipo": "Taberna/Templo/Herrería", "descripcion": "Detalle breve"}
            ],
            "rumores": [
                "Un rumor local o gancho de aventura..."
            ]
        }
        """

        prompt = f"""
        Genera un asentamiento de tipo '{city_type}' con una ambientación o temática: '{theme}'.
        Incluye al menos 3 distritos diferenciados y 4 lugares de interés (una taberna, un templo y dos tiendas).
        Genera 3 rumores interesantes para aventureros.
        """

        return self._generate_content(system_instruction, prompt)


city_service = CityService()