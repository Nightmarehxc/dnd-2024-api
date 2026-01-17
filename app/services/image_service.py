import os
import uuid
from app.services.gemini_service import BaseService


class ImageService(BaseService):
    def __init__(self):
        super().__init__()
        # Definir dónde se guardarán las imágenes (frontend/generated)
        self.output_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'frontend', 'generated'
        )
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_image(self, description, entity_type="generic"):
        prompt = f"Fantasy art, digital painting style, high quality D&D style illustration of: {description}"

        # 1. Llamar a Gemini (usando el nuevo método)
        result = self._generate_image_content(prompt)

        if "error" in result:
            return result

        # 2. Guardar los bytes en un archivo .png
        try:
            filename = f"{entity_type}_{uuid.uuid4().hex[:8]}.png"
            filepath = os.path.join(self.output_dir, filename)

            with open(filepath, "wb") as f:
                f.write(result["image_bytes"])

            # Devolver la URL relativa para el frontend
            return {
                "url": f"generated/{filename}",
                "message": "Imagen generada correctamente"
            }
        except Exception as e:
            return {"error": f"Error guardando imagen: {str(e)}"}


image_service = ImageService()