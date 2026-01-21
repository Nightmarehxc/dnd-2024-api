from app.services.gemini_service import BaseService


class CharacterService(BaseService):
    def generate_character(self, description, level, fixed_race=None, fixed_class=None):

        # 2. Construir instrucciones de contexto
        library_context = ""


        return None


character_service = CharacterService()
