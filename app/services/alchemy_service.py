from app.services.gemini_service import BaseService


class AlchemyService(BaseService):
    def generate_concoction(self, item_type, rarity):
        system_instruction = """
        Eres un maestro alquimista. Crea consumibles únicos para D&D 5e (2024).
        Prioriza efectos creativos sobre simple "curar daño".

        Devuelve JSON válido:
        {
            "nombre": "Nombre evocador (Ej: Lágrima de Basilisco)",
            "tipo": "Poción/Veneno...",
            "rareza": "Común/Rara/Legendaria...",
            "apariencia": "Color, textura, viscosidad, si brilla...",
            "sabor_olor": "A qué sabe o huele",
            "efecto_mecanico": "Reglas de juego exactas (Dados, Duración, Save DC).",
            "ingredientes": ["Raíz de Mandrágora", "Escama de Dragón", etc.],
            "efecto_secundario": "Un efecto menor narrativo o cómico (Ej: La piel se vuelve azul)."
        }
        """

        prompt = f"Inventa un/a {item_type} de rareza {rarity}. Hazlo interesante y útil."
        return self._generate_content(system_instruction, prompt)


alchemy_service = AlchemyService()