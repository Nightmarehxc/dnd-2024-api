import google.generativeai as genai
import json
from flask import current_app


class GeminiService:
    def __init__(self):
        # Se inicializa cuando se crea la instancia, usando la config de Flask
        # Nota: En un entorno real, pasamos la API key al instanciar o usamos current_app dentro de los métodos
        pass

    def _configure(self):
        # Lazy loading de la configuración para evitar problemas de contexto
        if not getattr(self, 'configured', False):
            genai.configure(api_key=current_app.config['GOOGLE_API_KEY'])
            self.model = genai.GenerativeModel(
                'gemini-1.5-flash',
                generation_config={"response_mime_type": "application/json"}
            )
            self.configured = True

    def generate(self, prompt_type, user_input):
        self._configure()

        # PROMPTS DEL SISTEMA (Reglas D&D 2024)
        system_instruction = """
        Actúa como un motor de reglas experto en D&D 5e (Revisión 2024).
        Reglas clave a respetar:
        1. Backgrounds otorgan Stats y Origin Feat.
        2. Especies no otorgan Stats.
        3. Armas tienen propiedades de Mastery (Nick, Sap, Vex, etc.).
        4. Clases y Hechizos usan versiones 2024.
        Devuelve SOLO JSON válido.
        """

        # Mapeo de prompts específicos
        specific_prompts = {
            "character": f"Genera un PJ completo (JSON) basado en: {user_input}. Incluye: Nombre, Especie, Clase, Nivel, Trasfondo (con Origin Feat), Stats, Equipo (con Weapon Mastery).",
            "npc": f"Genera un NPC (JSON) para DM basado en: {user_input}. Incluye: Rol, Apariencia, Personalidad (Ideal/Bond/Flaw), Gancho de trama.",
            "item": f"Genera un Objeto (JSON) basado en: {user_input}. Si es arma, incluye propiedad Mastery. Incluye rareza y mecánica 2024."
        }

        full_prompt = f"{system_instruction}\n\nTarea: {specific_prompts.get(prompt_type, user_input)}"

        try:
            response = self.model.generate_content(full_prompt)
            return json.loads(response.text)
        except Exception as e:
            return {"error": "Error generando contenido", "details": str(e)}


# Instancia singleton para ser importada
ai_service = GeminiService()