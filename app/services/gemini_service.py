import json
from flask import current_app
from google import genai
from google.genai import types

class BaseService:
    def __init__(self):
        self.client = None

    def _get_client(self):
        if not self.client:
            self.client = genai.Client(api_key=current_app.config['GOOGLE_API_KEY'])
        return self.client

    def _clean_response(self, response):
        """Limpia la respuesta de Markdown y la convierte a dict"""
        try:
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "")
            return json.loads(text)
        except Exception as e:
            print(f"Error parseando JSON: {text}") # Log para debug
            return {"error": "Formato JSON inválido recibido de la IA", "raw": text}

    def _generate_content(self, system_instruction, user_prompt):
        client = self._get_client()
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash', # Modelo rápido y potente
                contents=f"{system_instruction}\n\nTarea: {user_prompt}",
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                    temperature=0.7
                )
            )
            return self._clean_response(response)
        except Exception as e:
            return {"error": str(e)}