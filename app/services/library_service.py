import os
import json
from config import Config


class LibraryService:
    def __init__(self):
        # Definimos la ruta donde se guardarán los datos
        self.base_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'library')
        self._ensure_directories()

    def _ensure_directories(self):
        """Crea las carpetas si no existen"""
        categories = ['races', 'classes', 'backgrounds', 'items', 'spells']
        for cat in categories:
            os.makedirs(os.path.join(self.base_path, cat), exist_ok=True)

    def _save_entity(self, category, entity_data):
        """Guarda una entidad en su archivo JSON correspondiente (evita duplicados por nombre)"""
        filename = os.path.join(self.base_path, category, 'collection.json')

        # Cargar existente
        current_data = []
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                try:
                    current_data = json.load(f)
                except:
                    current_data = []

        # Verificar duplicados (por nombre)
        entity_name = entity_data.get('name', 'Unknown')
        exists = any(x['name'] == entity_name for x in current_data)

        if not exists:
            current_data.append(entity_data)
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(current_data, f, ensure_ascii=False, indent=2)
            return True
        return False

    def process_foundry_import(self, character_json):
        """Despieza un personaje de Foundry 5e y guarda sus componentes"""

        stats = {"races": 0, "classes": 0, "backgrounds": 0, "items": 0, "spells": 0}

        # 1. Procesar Items incrustados (Aquí suelen estar Raza, Clase, Trasfondo y Equipo)
        items = character_json.get('items', [])

        for item in items:
            itype = item.get('type')
            name = item.get('name')
            system = item.get('system', {})
            description = system.get('description', {}).get('value', '')

            # Objeto simplificado para guardar
            clean_item = {
                "name": name,
                "description": description,
                "source": "Foundry Import",
                "original_data": system  # Guardamos datos crudos por si acaso
            }

            if itype == 'race':
                if self._save_entity('races', clean_item): stats['races'] += 1

            elif itype == 'class':
                # Las clases tienen info extra importante como Hit Dice
                clean_item['hit_dice'] = system.get('hitDice', 'd8')
                if self._save_entity('classes', clean_item): stats['classes'] += 1

            elif itype == 'background':
                if self._save_entity('backgrounds', clean_item): stats['backgrounds'] += 1

            elif itype == 'spell':
                clean_item['level'] = system.get('level', 0)
                clean_item['school'] = system.get('school', '')
                if self._save_entity('spells', clean_item): stats['spells'] += 1

            elif itype in ['weapon', 'equipment', 'loot', 'consumable', 'tool']:
                clean_item['type'] = itype
                clean_item['rarity'] = system.get('rarity', '')
                if self._save_entity('items', clean_item): stats['items'] += 1

        return stats


library_service = LibraryService()