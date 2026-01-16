from app.services.gemini_service import BaseService


class ShopService(BaseService):
    def generate_shop(self, shop_type, location, level,vendor_race=None):
        system_instruction = """
        Eres un experto Dungeon Master. Genera una Tienda de D&D 5e (2024).
        Devuelve JSON válido con esta estructura EXACTA:
        {
            "nombre_tienda": "Nombre creativo",
            "descripcion_ambiente": "Olores, sonidos, iluminación...",
            "vendedor": {
                "nombre": "Nombre",
                "raza": "Raza",
                "rol": "Propietario/Tendero",
                "personalidad": "Breve descripción de cómo actúa",
                "apariencia": "Breve descripción visual",
                "stats_resumidos": { "ca": 10, "hp": 10 }
            },
            "inventario": [
                {
                    "nombre": "Nombre del objeto",
                    "tipo": "Arma/Poción/Equipo",
                    "rareza": "Común/Poco Común...",
                    "precio_gp": Entero (Precio en monedas de oro),
                    "descripcion": "Breve descripción",
                    "dano": "1d8 + 2 slashing" (O null si no es arma)
                }
            ]
        }
        """
        race_instruction = f"El vendedor DEBE ser de raza: {vendor_race}." if vendor_race else "Elige una raza adecuada para el contexto."
        prompt = f"""
        
        Crea una tienda de tipo '{shop_type}' ubicada en '{location}'.
        {race_instruction}
        El nivel promedio de los objetos debe ser adecuado para aventureros de nivel {level}.
        Genera al menos 5 objetos interesantes en el inventario.
        """

        return self._generate_content(system_instruction, prompt)


shop_service = ShopService()