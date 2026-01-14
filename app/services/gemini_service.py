import json
import re  # <--- IMPORTANTE
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
        """Busca el primer objeto JSON válido dentro de la respuesta usando Regex"""
        text = response.text.strip()
        try:
            # 1. Intentar carga directa
            return json.loads(text)
        except json.JSONDecodeError:
            # 2. Si falla, buscar patrón { ... }
            # Esto captura desde el primer '{' hasta el último '}' ignorando texto extra
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                clean_json = match.group(0)
                try:
                    return json.loads(clean_json)
                except json.JSONDecodeError:
                    pass

            # 3. Si todo falla, devolver error legible
            print(f"FALLO PARSEO JSON. Respuesta cruda: {text}")
            return {"error": "La IA generó una respuesta que no es JSON válido", "raw_content": text}

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