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

    def _generate_text(self, system_instruction, user_input, audio_bytes=None):
        """Genera respuesta de texto, aceptando texto O audio input"""
        client = self._get_client()
        try:
            contents = [system_instruction]

            # Si hay audio, añadimos el blob binario nativo
            if audio_bytes:
                contents.append(types.Part.from_bytes(
                    data=audio_bytes,
                    mime_type="audio/webm"  # Formato típico del navegador
                ))

            # Añadimos el texto (prompt o historial)
            if user_input:
                contents.append(user_input)

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.8
                )
            )
            return response.text
        except Exception as e:
            return f"Error con Gemini: {str(e)}"

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

    def _generate_image_content(self, user_prompt):
        """Generación de IMAGEN (Bytes) - Usamos Imagen 3"""
        client = self._get_client()
        try:
            # MÉTODO ESPECÍFICO PARA IMAGEN 3
            response = client.models.generate_images(
                model='imagen-3.0-generate-001',
                prompt=user_prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="1:1"
                )
            )

            # La respuesta de Imagen 3 tiene una estructura distinta
            if response.generated_images:
                image_obj = response.generated_images[0]
                # Accedemos a los bytes de la imagen
                if hasattr(image_obj, 'image') and hasattr(image_obj.image, 'bytes'):
                    return {"image_bytes": image_obj.image.bytes}
                # Fallback para versiones antiguas del SDK
                if hasattr(image_obj, 'bytes'):
                    return {"image_bytes": image_obj.bytes}

            return {"error": "No se generó ninguna imagen"}

        except Exception as e:
            error_msg = str(e)
            print(f"ERROR IMAGEN: {error_msg}")

            if "404" in error_msg:
                return {"error": "Tu cuenta no tiene acceso a Imagen 3 (Modelo no encontrado)."}
            if "400" in error_msg:
                return {"error": "Solicitud inválida a Imagen 3."}

            return {"error": f"Error al generar imagen: {error_msg}"}