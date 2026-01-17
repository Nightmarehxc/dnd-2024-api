from app.services.gemini_service import BaseService


class EncounterService(BaseService):
    def generate_encounter(self, level, difficulty, environment, players):
        system_instruction = """
        Eres un Diseñador de Encuentros Tácticos experto para D&D 5e (2024).
        Tu objetivo no es solo listar monstruos, sino crear una escena de combate memorable y estratégica.

        Genera SIEMPRE un JSON válido con esta estructura EXACTA:
        {
            "titulo": "Nombre del Encuentro",
            "resumen": "Breve descripción cinematográfica de la escena inicial.",
            "monstruos": [
                { "nombre": "Nombre (Ej: Goblin Arquero)", "cantidad": 3, "cr": "1/4", "rol": "Artillería/Tanque/Líder", "hp": 7 }
            ],
            "tacticas": [
                "Paso 1: Los arqueros disparan desde cobertura...",
                "Paso 2: Si el jefe cae, los esbirros huyen..."
            ],
            "terreno": [
                { 
                    "elemento": "Ej: Candelabro oxidado", 
                    "regla": "Si se corta la cuerda (AC 10), cae. DEX Save DC 12 o 2d6 daño." 
                },
                {
                    "elemento": "Ej: Niebla densa",
                    "regla": "Área de visibilidad reducida. Ataques con desventaja."
                }
            ],
            "tesoro_botin": "Opcional: Qué llevan encima los enemigos."
        }
        """

        prompt = f"""
        Diseña un encuentro de combate para un grupo de {players} jugadores de Nivel {level}.
        Dificultad deseada: {difficulty}.
        Entorno/Lugar: {environment}.

        Instrucciones Clave:
        1. Ajusta los monstruos al presupuesto de XP aproximado para esa dificultad.
        2. Usa monstruos con sinergia (ej: unos bloquean, otros disparan).
        3. El terreno DEBE ser interactivo, no solo decorativo.
        """

        return self._generate_content(system_instruction, prompt)


encounter_service = EncounterService()