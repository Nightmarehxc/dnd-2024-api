from app.services.gemini_service import BaseService
from app.services.inn_service import inn_service
from app.services.shop_service import shop_service


class CityService(BaseService):
    def generate_city(self, name, size_type, biome):
        # 1. PRIMER PASO: Generar la Ciudad y obtener nombres para los locales
        system_instruction = """
        Eres un experto cartógrafo y urbanista de fantasía.
        Genera una ciudad detallada en formato JSON.
        IMPORTANTE: En la sección "lugares_destacados", debes incluir OBLIGATORIAMENTE:
        1. Una Posada (con nombre y temática).
        2. Una Tienda (con nombre y tipo, ej: Herrería, Alquimia).

        Estructura JSON:
        {
            "nombre": "Nombre de la Ciudad",
            "titulo": "Apodo (ej: La Joya del Desierto)",
            "poblacion": "Número aprox y razas principales",
            "gobierno": "Quién manda y cómo",
            "distritos": [
                {"nombre": "Nombre Distrito", "desc": "Descripción breve"}
            ],
            "lugares_destacados": [
                {"tipo": "Posada", "nombre": "Nombre Creativo", "desc": "Breve tema"},
                {"tipo": "Tienda", "nombre": "Nombre Creativo", "desc": "Tipo de tienda"}
            ],
            "conflicto_actual": "Problema político o social actual",
            "clima_atmosfera": "Descripción sensorial del ambiente"
        }
        """

        prompt = f"Genera una ciudad de tamaño {size_type} situada en un bioma de {biome}. {(f'Nombre: {name}' if name else '')}"

        city_data = self._generate_content(system_instruction, prompt)

        if "error" in city_data:
            return city_data

        # 2. SEGUNDO PASO: Generar los sub-objetos vinculados (Posada y Tienda)
        linked_inn = None
        linked_shop = None

        # Buscamos en los lugares destacados para generar sus fichas completas
        places = city_data.get('lugares_destacados', [])

        for place in places:
            p_type = place.get('tipo', '').lower()
            p_name = place.get('nombre', '')
            p_desc = place.get('desc', '')

            # Generar Posada Vinculada
            if 'posada' in p_type or 'taberna' in p_type:
                # Usamos el servicio de posadas existente
                # Asumimos nivel de vida "Modesta" por defecto para no complicar, o deducimos del tamaño
                comfort = "Confortable" if size_type in ["Metrópolis", "Capital"] else "Modesta"
                linked_inn = inn_service.generate_inn(
                    name=p_name,
                    comfort_level=comfort,
                    theme=p_desc,
                    city=city_data.get('nombre')  # VINCULACIÓN: Pasamos el nombre de la ciudad
                )

            # Generar Tienda Vinculada
            elif 'tienda' in p_type or 'mercado' in p_type or 'herrería' in p_type or 'alquimia' in p_type:
                # Usamos el servicio de tiendas
                # Intentamos adivinar el tipo por la descripción o nombre, sino "General"
                shop_type_guess = "General"
                if "magia" in p_desc.lower() or "arcano" in p_desc.lower():
                    shop_type_guess = "Objetos Mágicos"
                elif "armas" in p_desc.lower() or "herrería" in p_desc.lower():
                    shop_type_guess = "Herrería"
                elif "poción" in p_desc.lower() or "alquimia" in p_desc.lower():
                    shop_type_guess = "Alquimia"

                linked_shop = shop_service.generate_shop(
                    shop_type=shop_type_guess,
                    location=city_data.get('nombre'),  # VINCULACIÓN
                    level=1
                )

        # 3. TERCER PASO: Adjuntar los objetos completos a la respuesta de la ciudad
        city_data['linked_data'] = {
            'inn': linked_inn,
            'shop': linked_shop
        }

        return city_data


city_service = CityService()