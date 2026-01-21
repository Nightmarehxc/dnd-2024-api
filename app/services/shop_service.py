from app.services.gemini_service import BaseService


class ShopService(BaseService):
    def generate_shop(self, shop_type, level=1, location=""):

        context_loc = ""
        if location:
            context_loc = f"La tienda está ubicada en la ciudad de: {location}. ADAPTA el inventario, los precios y la raza del tendero a la cultura de esa ciudad."

        # Instrucciones de escalado de nivel para D&D 5e
        level_guidance = ""
        if level <= 4:
            level_guidance = "Nivel 1-4: Inventario mundano, pociones curativas básicas, quizás un objeto mágico común (de sabor)."
        elif level <= 10:
            level_guidance = "Nivel 5-10: Armas +1, pociones variadas, objetos Poco Comunes (Uncommon)."
        elif level <= 16:
            level_guidance = "Nivel 11-16: Armas +2, armaduras mágicas, objetos Raros (Rare)."
        else:
            level_guidance = "Nivel 17-20: Objetos Muy Raros o Legendarios, precios exorbitantes."

        system = """
        Eres un experto comerciante de D&D 5e (2024). Genera una tienda detallada y EQUILIBRADA.
        Responde SIEMPRE con este JSON exacto:
        {
            "shop_name": "Nombre Creativo",
            "shop_type": "Tipo de tienda",
            "location": "Ciudad o lugar",
            "description": "Descripción visual y olfativa del local.",
            "shopkeeper": {
                "name": "Nombre",
                "race": "Raza",
                "traits": "Personalidad o rasgo físico."
            },
            "inventory": [
                {"item": "Nombre Objeto", "price": "X po", "stock": 1, "desc": "Breve detalle (ej: +1, oxidado)"}
            ],
            "special_feature": "Algo único de esta tienda (ej: descuento a bardos, trastienda ilegal)."
        }
        """

        prompt = f"""
        Genera una tienda de tipo "{shop_type}" adecuada para un grupo de aventureros de NIVEL {level}.
        {context_loc}

        DIRECTRICES DE INVENTARIO:
        {level_guidance}

        Genera entre 5 y 10 items acordes a este nivel de poder y economía.
        """

        return self._generate_content(system, prompt)


shop_service = ShopService()