from app.services.gemini_service import BaseService
from app.models import GMReference
from app import db


class GMScreenService(BaseService):
    
    def get_reference_info(self, category):
        """
        Obtiene información de referencia rápida para GMs de D&D 2024 desde la base de datos
        Categorías: conditions, actions, difficulty, skills, combat, travel, rests, death, cover, advantage, inspiration, exhaustion
        """
        # Buscar en la base de datos
        reference = GMReference.query.filter_by(category=category).first()
        
        if not reference:
            return {
                "error": f"Categoría '{category}' no encontrada. Categorías disponibles: conditions, actions, difficulty, skills, combat, travel, rests, death, cover, advantage, inspiration, exhaustion"
            }
        
        # Retornar datos en formato compatible con el frontend
        return reference.to_dict()
    
    def generate_random_encounter(self, party_level, terrain, difficulty):
        """
        Genera un encuentro aleatorio balanceado
        """
        system_instruction = """
        Eres un experto Game Master de D&D 2024 que genera encuentros balanceados.
        
        Genera SIEMPRE un JSON válido con esta estructura:
        {
            "titulo": "Nombre del encuentro",
            "descripcion": "Descripción narrativa del escenario",
            "enemigos": [
                {
                    "nombre": "Nombre de la criatura",
                    "cantidad": 2,
                    "cr": "1/4",
                    "nota": "Táctica o característica relevante"
                }
            ],
            "xp_total": 450,
            "dificultad_real": "Medium",
            "terreno_ventajas": "Cómo el terreno afecta el combate",
            "objetivo_encuentro": "Objetivo táctico o narrativo",
            "recompensas_sugeridas": "Botín o recompensas apropiadas"
        }
        
        Usa las reglas de construcción de encuentros de D&D 2024.
        """
        
        prompt = f"""
        Genera un encuentro para:
        - Nivel del grupo: {party_level}
        - Terreno: {terrain}
        - Dificultad deseada: {difficulty}
        
        El encuentro debe ser apropiado, balanceado y tener sentido narrativo.
        """
        
        return self._generate_content(system_instruction, prompt)
    
    def get_quick_npc(self, context=""):
        """
        Genera un NPC rápido para improvisar
        """
        system_instruction = """
        Eres un Game Master experimentado que crea NPCs rápidos para improvisar en partida.
        
        Genera SIEMPRE un JSON válido con esta estructura:
        {
            "nombre": "Nombre del NPC",
            "aspecto": "Descripción física en 1-2 líneas",
            "personalidad": "Rasgos de personalidad clave",
            "motivacion": "Qué quiere o necesita",
            "secreto": "Un secreto menor interesante",
            "voz": "Cómo habla (acento, tono, muletillas)",
            "stats_rapidas": {
                "ca": 12,
                "hp": 22,
                "modificadores_clave": "+3 Persuasión, +2 Engaño"
            }
        }
        
        Haz NPCs memorables pero rápidos de usar.
        """
        
        prompt = f"Genera un NPC para usar ahora mismo. Contexto: {context or 'genérico'}"
        
        return self._generate_content(system_instruction, prompt)
    
    def get_improvisation_prompt(self, prompt_type):
        """
        Obtiene prompts para ayudar al GM a improvisar
        """
        system_instruction = """
        Eres un asistente creativo para Game Masters de D&D 2024.
        
        Genera SIEMPRE un JSON válido con esta estructura:
        {
            "tipo": "Tipo de prompt",
            "opciones": [
                "Opción 1 interesante",
                "Opción 2 interesante",
                "Opción 3 interesante",
                "Opción 4 interesante",
                "Opción 5 interesante"
            ],
            "consejos": ["Consejo 1", "Consejo 2"],
            "ejemplo": "Ejemplo de cómo usar estos elementos"
        }
        
        Sé creativo y útil para improvisar en partida.
        """
        
        prompt_types = {
            "complications": "5 complicaciones que pueden surgir en la escena actual",
            "secrets": "5 secretos que un NPC podría revelar",
            "twists": "5 giros argumentales sorprendentes",
            "treasures": "5 tesoros inusuales e interesantes",
            "names": "20 nombres rápidos para NPCs (variedad de culturas)",
            "rumors": "5 rumores que los PJs podrían escuchar",
            "hooks": "5 ganchos de misión secundaria",
            "locations": "5 localizaciones interesantes para explorar"
        }
        
        prompt = prompt_types.get(prompt_type, f"Genera ideas para: {prompt_type}")
        
        return self._generate_content(system_instruction, prompt)


gm_screen_service = GMScreenService()
