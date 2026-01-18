from app.services.gemini_service import BaseService


class JournalService(BaseService):
    def generate_chronicle(self, notes):
        system_instruction = """
        Eres "El Cronista", un bardo legendario encargado de registrar las hazañas de un grupo de aventureros.
        Tu tarea es convertir notas desordenadas en un relato épico y organizado.

        Genera SIEMPRE un JSON válido con esta estructura:
        {
            "titulo_episodio": "Un título evocador (Ej: La Caída del Rey Goblin)",
            "narracion": "Un resumen narrativo de 2-3 párrafos, escrito en tono de novela de fantasía, dramatizando los eventos.",
            "puntos_clave": [
                "Lista breve de hechos importantes (Ej: Encontraron la Llave de Hueso)"
            ],
            "botin_y_cambios": [
                "Items ganados/perdidos o cambios de nivel"
            ],
            "estado_misiones": [
                "Ej: Misión 'Rescatar al Herrero' -> COMPLETADA"
            ]
        }
        """

        prompt = f"""
        Convierte estas notas borrador de una sesión de D&D en una crónica oficial:

        NOTAS DEL JUGADOR:
        {notes}
        """

        return self._generate_content(system_instruction, prompt)


journal_service = JournalService()