from app.services.gemini_service import BaseService

class CityService(BaseService):
    def generate_city(self, size_type, biome, name):
        system_instruction = """
        Eres un experto Worldbuilder para D&D 5e (2024). Genera un Asentamiento detallado.
        Devuelve JSON válido con esta estructura EXACTA:
        {
            "nombre": "Nombre de la ciudad",
            "tipo": "Villa/Ciudad/Metrópolis...",
            "clima": "Descripción breve del clima/bioma",
            "poblacion": "Ej: 5,000 habitantes (Mayoría humanos)",
            "gobierno": {
                "tipo": "Monarquía/Consejo/Anarquía...",
                "lider": "Nombre y breve descripción del líder",
                "descripcion": "Cómo funciona la ley aquí"
            },
            "defensas": "Murallas, guardias, magia...",
            "distritos": [
                {
                    "nombre": "Nombre Distrito", 
                    "descripcion": "Qué se hace aquí...",
                    "ambiente": "Olores, sonidos, iluminación...",
                    "habitantes_tipo": "Clase social o raza predominante"
                }
            ],
            "lugares_interes": [
                {"nombre": "Nombre", "tipo": "Taberna/Tienda/Templo", "descripcion": "Detalle breve"}
            ],
            "rumores": [
                "Un rumor local o gancho de aventura..."
            ]
        }
        """

        prompt = f"""
        Genera un asentamiento de fantasía.
        Nombre sugerido: {name} (Si es genérico, inventa uno mejor).
        Tamaño/Tipo: {size_type}.
        Bioma/Clima: {biome}.

        Requisitos:
        1. Crea al menos 3 distritos con atmósferas muy diferentes.
        2. Incluye una peculiaridad única del gobierno o la ley.
        3. Los rumores deben ser ganchos de aventura accionables.
        """

        return self._generate_content(system_instruction, prompt)

city_service = CityService()