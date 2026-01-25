from app.services.gemini_service import BaseService
from app.services.inn_service import inn_service
from app.services.shop_service import shop_service


class CityService(BaseService):
    def generate_city(self, name, size_type, biome):
        # 1. FIRST STEP: Generate the city and get names for linked locations
        system_instruction = """
        You are an expert fantasy cartographer and urban planner.
        Generate a detailed city in JSON format English keys and Spanish values.
        IMPORTANT: In the "landmarks" section, you MUST include:
        1. An Inn (with name and theme).
        2. A Shop (with name and type, e.g: Blacksmith, Alchemy).

        JSON Structure:
        {
            "name": "City Name",
            "subtitle": "Nickname (e.g: The Gem of the Desert)",
            "population": "Approx number and main races",
            "government": "Who rules and how",
            "districts": [
                {"name": "District Name", "description": "Brief description"}
            ],
            "landmarks": [
                {"type": "Inn", "name": "Creative Name", "description": "Brief theme"},
                {"type": "Shop", "name": "Creative Name", "description": "Shop type"}
            ],
            "current_conflict": "Current political or social problem",
            "atmosphere": "Sensory description of the city"
        }
        """

        prompt = f"Generate a city of size {size_type} located in a {biome} biome. {(f'Name: {name}' if name else '')}"

        city_data = self._generate_content(system_instruction, prompt)

        if "error" in city_data:
            return city_data

        # 2. SECOND STEP: Generate linked sub-objects (Inn and Shop)
        linked_inn = None
        linked_shop = None

        # Search in landmarks to generate their full details
        places = city_data.get('landmarks', []) or city_data.get('lugares_destacados', [])
        city_name = city_data.get('name') or city_data.get('nombre', 'Unknown City')

        for place in places:
            p_type = (place.get('type') or place.get('tipo', '')).lower()
            p_name = place.get('name') or place.get('nombre', '')
            p_desc = (place.get('description') or place.get('desc', '')).lower()

            # Generate Linked Inn
            if 'inn' in p_type or 'tavern' in p_type or 'posada' in p_type:
                # Use the existing inn service
                # Assume "Comfortable" comfort level for large cities, "Modest" otherwise
                comfort = "Comfortable" if size_type in ["Metrópolis", "Metropolis", "Capital"] else "Modest"
                linked_inn = inn_service.generate_inn(
                    name=p_name,
                    comfort_level=comfort,
                    theme=(place.get('description') or place.get('desc', '')),
                    city=city_name
                )

            # Generate Linked Shop (check both English and Spanish keywords)
            elif any(keyword in p_type for keyword in ['shop', 'tienda', 'mercado', 'herrería', 'alquimia', 'magic']):
                # Guess shop type from description or name
                shop_type_guess = "General"
                if "magia" in p_desc or "arcano" in p_desc or "magic" in p_desc or "enchant" in p_desc:
                    shop_type_guess = "Objetos Mágicos"
                elif "armas" in p_desc or "herrería" in p_desc or "weapon" in p_desc or "blacksmith" in p_desc:
                    shop_type_guess = "Herrería"
                elif "poción" in p_desc or "alquimia" in p_desc or "potion" in p_desc or "alchemy" in p_desc:
                    shop_type_guess = "Alquimia"

                linked_shop = shop_service.generate_shop(
                    shop_type=shop_type_guess,
                    location=city_name,
                    level=1
                )

        # 3. TERCER PASO: Adjuntar los objetos completos a la respuesta de la ciudad
        city_data['linked_data'] = {
            'inn': linked_inn,
            'shop': linked_shop
        }

        return city_data


city_service = CityService()