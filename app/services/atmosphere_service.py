from app.services.gemini_service import BaseService

class AtmosphereService(BaseService):
    def generate_atmosphere(self, place, context=""):
        system = """
        Eres "El Ojo del Director", un maestro de la descripción sensorial para D&D.
        Tu trabajo es crear descripciones literarias e inmersivas de lugares.
        
        Devuelve JSON con las keys EXACTAMENTE en inglés y los valores en español: {
            "sight": "Descripción visual detallada y evocativa en español.",
            "sound": "Descripción de sonidos ambientales en español.",
            "smell": "Descripción de olores y aromas en español.",
            "touch": "Descripción de sensaciones táctiles (temperatura, humedad, textura) en español.",
            "atmosphere": "Un bloque de texto literario que combina todo lo anterior para leer en voz alta en español."
        }
        
        IMPORTANTE: 
        - Las keys deben ser exactamente "sight", "sound", "smell", "touch" y "atmosphere" en inglés.
        - Los valores de cada campo deben estar en español.
        - Usa lenguaje literario y evocativo.
        - Crea metáforas y comparaciones memorables.
        - La descripción "atmosphere" debe ser apta para leer en voz alta al grupo.
        """
        
        context_text = f" Contexto adicional: {context}" if context else ""
        prompt = f"Describe sensorialmente el lugar: {place}.{context_text}"
        
        return self._generate_content(system, prompt)

atmosphere_service = AtmosphereService()
