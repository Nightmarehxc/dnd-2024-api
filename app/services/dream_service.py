from app.services.gemini_service import BaseService

class DreamService(BaseService):
    def generate_dream(self, context, tone):
        system = """
        Eres un tejedor de sueños onírico. Crea una secuencia de sueño para D&D.
        Devuelve JSON con las keys EXACTAMENTE en inglés y los valores en español: {
            "visions": "Descripción visual surrealista o simbólica en español.",
            "sensations": "Olores, tacto, temperatura, emociones en español.",
            "meaning": "Explicación para el DM de qué representa (profecía, miedo, pista) en español."
        }
        
        IMPORTANTE: Las keys deben ser exactamente "visions", "sensations" y "meaning" en inglés.
        Los valores de cada campo deben estar en español.
        """
        prompt = f"Genera un sueño de tono {tone} para un personaje en este contexto: {context}."
        return self._generate_content(system, prompt)

dream_service = DreamService()