from app.services.gemini_service import BaseService


class FactionService(BaseService):
    def generate_faction(self, theme, faction_type):
        system_instruction = """
        Eres un experto en intriga política y worldbuilding para D&D.
        Crea una organización con objetivos claros y recursos definidos.

        Devuelve JSON válido con esta estructura:
        {
            "nombre": "Nombre de la Facción",
            "simbolo": "Descripción visual de su emblema",
            "lema": "Frase o Lema",
            "lider": { "nombre": "Nombre", "clase": "Clase/Arquetipo", "rasgo": "Personalidad clave" },
            "objetivos": "Qué quieren conseguir a corto/largo plazo",
            "recursos": ["Escondites", "Red de espías", "Magia antigua", "Oro ilimitado"],
            "relacion_inicial": "Cómo suelen tratar a los aventureros desconocidos (Hostiles/Curiosos/Indiferentes)",
            "descripcion": "Resumen narrativo de quiénes son y dónde operan."
        }
        """

        prompt = f"Genera una facción de tipo '{faction_type}' que opere en un entorno de '{theme}'."
        return self._generate_content(system_instruction, prompt)


faction_service = FactionService()