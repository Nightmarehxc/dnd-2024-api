import json
import os
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
        print(f"[GEMINI] Respuesta bruta (primeros 500 chars): {text[:500]}")
        
        try:
            # 1. Intento directo
            result = json.loads(text)
            print(f"✅ JSON parseado de Gemini: {result}")
            return result
        except json.JSONDecodeError as e:
            print(f"[GEMINI] Error al parsear directo: {e}")
            
            # 2. Búsqueda de patrón { ... } (usando método manual para evitar recursión)
            # Buscar el primer { y su } correspondiente usando conteo de llaves
            start_idx = text.find('{')
            if start_idx != -1:
                brace_count = 0
                end_idx = -1
                for i in range(start_idx, len(text)):
                    if text[i] == '{':
                        brace_count += 1
                    elif text[i] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i + 1
                            break
                
                if end_idx != -1:
                    clean_json = text[start_idx:end_idx]
                    try:
                        result = json.loads(clean_json)
                        print(f"✅ JSON limpiado (método manual): claves = {list(result.keys())}")
                        return result
                    except json.JSONDecodeError as e:
                        print(f"[GEMINI] Error al parsear con método manual: {e}")
            
            # 4. Última opción: procurar arreglar formato
            cleaned = text
            try:
                # Remover prefijos comunes
                for prefix in ['```json', '```', '```python']:
                    if cleaned.startswith(prefix):
                        cleaned = cleaned[len(prefix):].strip()
                
                # Remover sufijos comunes
                for suffix in ['```']:
                    if cleaned.endswith(suffix):
                        cleaned = cleaned[:-len(suffix)].strip()
                
                result = json.loads(cleaned)
                print(f"✅ JSON limpiado (removiendo bloques): claves = {list(result.keys())}")
                return result
            except json.JSONDecodeError as e:
                print(f"[GEMINI] Error en último intento: {e}")

            print(f"❌ ERROR JSON: No se pudo parsear. Respuesta completa:\n{text}")
            return {"error": "La IA no generó un JSON válido", "raw": text[:500]}

    def _generate_text(self, system_instruction, user_input, audio_bytes=None):
        """Genera respuesta de texto, aceptando texto O audio input"""
        print(current_app.config['MODEL_AI'])
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
                model=current_app.config['MODEL_AI'],
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
        print(current_app.config['MODEL_AI'])
        try:
            response = client.models.generate_content(
                model=current_app.config['MODEL_AI'],
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