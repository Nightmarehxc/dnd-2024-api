import json
import re
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
        """Busca y extrae el JSON válido de la respuesta usando Regex"""
        text = response.text.strip()
        try:
            # 1. Intento directo
            return json.loads(text)
        except json.JSONDecodeError:
            # 2. Búsqueda de patrón { ... }
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                clean_json = match.group(0)
                try:
                    return json.loads(clean_json)
                except json.JSONDecodeError:
                    pass

            print(f"ERROR JSON: {text}")
            return {"error": "La IA no generó un JSON válido", "raw": text}

    def _generate_content(self, system_instruction, user_prompt):
        client = self._get_client()
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"{system_instruction}\n\nTarea: {user_prompt}",
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                    temperature=0.7
                )
            )
            return self._clean_response(response)
        except Exception as e:
            return {"error": str(e)}