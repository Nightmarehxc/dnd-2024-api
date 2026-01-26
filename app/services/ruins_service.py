from app.services.gemini_service import BaseService

class RuinsService(BaseService):
    def generate_lore(self, name, ruin_type):
        system = """
        Eres un arqueólogo e historiador de fantasía experto. Tu misión es dar "alma" a lugares abandonados.
        Estructura la respuesta en un JSON válido con claves en inglés y valores en español: 
        {
            "name": "Nombre evocador del lugar",
            "original_use": "Descripción vívida de qué era este lugar en su época de esplendor.",
            "cataclysm": "El evento específico (mágico, bélico, natural) que causó su ruina.",
            "current_state": "Descripción atmosférica actual (vegetación, estado de los muros, olores).",
            "inhabitants": "Qué vive ahí ahora (monstruos, fantasmas, bandidos).",
            "secret": "Un detalle oculto o leyenda que los jugadores pueden descubrir."
        }
        """
        prompt = f"Genera la historia (Lore) para unas ruinas llamadas '{name}' que originalmente eran: {ruin_type}."
        return self._generate_content(system, prompt)

ruins_service = RuinsService()