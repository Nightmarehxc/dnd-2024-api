from app.services.gemini_service import BaseService


class HerbalistService(BaseService):
    def generate_plant(self, environment, skill_roll, character_level):
        system_instruction = """
        Eres un botánico místico experto en flora mágica de D&D 5e (2024).
        Cuando un aventurero usa Supervivencia o Naturaleza para buscar plantas, generas descubrimientos únicos.

        Devuelve JSON válido:
        {
            "nombre": "Nombre evocador de la planta (Ej: Raíz de Sangre de Troll)",
            "descripcion": "Apariencia física detallada (color, forma, textura, aroma)",
            "ambiente": "Dónde crece naturalmente",
            "rareza": "Común/Poco Común/Rara/Muy Rara/Legendaria",
            "propiedades_ocultas": {
                "cruda": "Efecto si se consume sin preparar (con reglas mecánicas: dados, duración, CD)",
                "hervida": "Efecto si se hierve o cocina",
                "aplicada": "Efecto si se usa como ungüento o cataplasma",
                "quemada": "Efecto si se quema como incienso (opcional)"
            },
            "desafio_recoleccion": {
                "descripcion": "Qué dificulta o hace peligrosa la recolección",
                "consecuencias": "Qué pasa si fallas o no tienes cuidado (atrae enemigos, daño, maldición, etc.)",
                "cd_sugerida": 12
            },
            "valor_mercado": "En piezas de oro (po)",
            "usos_alquimia": "Cómo puede usarse en pociones o combinarse con otros ingredientes",
            "folklore": "Leyenda o historia sobre la planta"
        }

        IMPORTANTE:
        - Las propiedades deben ser mecánicamente útiles pero equilibradas
        - Los efectos deben incluir dados, duraciones y CDs específicas
        - El desafío de recolección debe ser narrativo e interesante
        - Ajusta la rareza y potencia según el nivel del personaje
        """

        prompt = f"""
        Entorno: {environment}
        Tirada de habilidad: {skill_roll}
        Nivel del personaje: {character_level}
        
        Genera una planta mágica que un aventurero podría encontrar. 
        La calidad del hallazgo debe reflejar la tirada (tiradas altas = plantas más raras/potentes).
        Ajusta la potencia y rareza al nivel del personaje.
        """
        return self._generate_content(system_instruction, prompt)


herbalist_service = HerbalistService()
