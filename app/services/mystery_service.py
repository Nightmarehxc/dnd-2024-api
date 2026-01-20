from app.services.gemini_service import BaseService

class MysteryService(BaseService):
    def generate_mystery(self, setting, difficulty):
        system = """
        Eres un escritor de novelas de misterio. Crea una trama de investigación corta.
        Devuelve JSON: {
            "titulo": "El caso de...",
            "crimen_evento": "Qué pasó, a quién y dónde.",
            "sospechosos": [{"nombre": "...", "motivo": "..."}],
            "pistas": ["Pista física 1", "Testimonio contradictorio", "Olor extraño"],
            "verdad": "Quién fue realmente y por qué."
        }
        """
        prompt = f"Crea un misterio de dificultad {difficulty} ambientado en: {setting}."
        return self._generate_content(system, prompt)

mystery_service = MysteryService()