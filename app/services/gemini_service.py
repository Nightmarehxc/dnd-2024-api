import json
from flask import current_app
from google import genai
from google.genai import types


class GeminiService:
    def __init__(self):
        self.client = None

    def _get_client(self):
        if not self.client:
            self.client = genai.Client(api_key=current_app.config['GOOGLE_API_KEY'])
        return self.client

    def generate(self, prompt_type, user_input):
        client = self._get_client()

        # Añadimos "daño" a la lista de claves requeridas
        system_instruction = """
        Eres un experto en D&D 5e (2024). Responde SIEMPRE con un objeto JSON válido.

        IMPORTANTE - Estructura de claves requerida (en español):

        1. ITEMS (Objetos/Armas):
           - "nombre": String
           - "tipo": String (Arma, Objeto Maravilloso, etc.)
           - "rareza": String
           - "requiere_sintonizacion": Boolean
           - "dano": Objeto o null (Ej: {"formula": "1d8 + 2", "tipo": "slashing"}). SOLO si es arma.
           - "weapon_mastery": String o null
           - "propiedades_base": String (Ej: Versátil, Sutil)
           - "efecto_mecanico": String
           - "descripcion_vis": String

        2. NPCs: "nombre", "rol", "raza", "personalidad", "gancho_trama", "habilidad_especial".
        3. PERSONAJES: "nombre", "especie", "clase", "nivel", "trasfondo", "estadisticas", "equipo_destacado", "resumen_historia".
        """

        specific_prompts = {
            "character": f"Genera un PJ: {user_input}. Reglas 2024.",
            "npc": f"Genera un NPC: {user_input}. Reglas 2024.",
            "item": f"Genera un Objeto: {user_input}. Si es un arma, INCLUYE fórmula de daño (ej: 2d6) y tipo. Reglas 2024."
        }

        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"{system_instruction}\n\nTarea: {specific_prompts.get(prompt_type, user_input)}",
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                    temperature=0.7
                )
            )

            clean_text = response.text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text.replace("```json", "").replace("```", "")

            return json.loads(clean_text)

        except Exception as e:
            return {"error": "Error generando contenido", "details": str(e)}


ai_service = GeminiService()