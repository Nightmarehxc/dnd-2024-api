from app.services.gemini_service import BaseService

class DreamService(BaseService):
    def generate_dream(self, context, tone):
        system = """
        Eres un tejedor de sueños onírico. Crea una secuencia de sueño para D&D.
        Devuelve JSON: {
            "imagenes": "Descripción visual surrealista o simbólica.",
            "sensaciones": "Olores, tacto, temperatura, emociones.",
            "significado": "Explicación para el DM de qué representa (profecía, miedo, pista)."
        }
        """
        prompt = f"Genera un sueño de tono {tone} para un personaje en este contexto: {context}."
        return self._generate_content(system, prompt)

dream_service = DreamService()