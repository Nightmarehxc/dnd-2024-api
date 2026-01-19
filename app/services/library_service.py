import os
import json


class LibraryService:
    def __init__(self):
        self.base_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'library')
        self._ensure_directories()

    def _ensure_directories(self):
        categories = ['races', 'classes', 'backgrounds', 'items', 'spells']
        for cat in categories:
            os.makedirs(os.path.join(self.base_path, cat), exist_ok=True)

    def _save_entity(self, category, entity_data):
        filename = os.path.join(self.base_path, category, 'collection.json')
        current_data = []
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                try:
                    current_data = json.load(f)
                except:
                    current_data = []

        entity_name = entity_data.get('name', 'Unknown')
        exists = any(x['name'] == entity_name for x in current_data)

        if not exists:
            current_data.append(entity_data)
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(current_data, f, ensure_ascii=False, indent=2)
            return True
        return False

    def process_foundry_import(self, character_json):
        stats = {"races": 0, "classes": 0, "backgrounds": 0, "items": 0, "spells": 0}

        # Variables para reconstruir el personaje
        char_race = "Desconocida"
        char_classes = []
        char_bg = "Desconocido"
        char_items = []

        # 1. Procesar Items (Guardar en Librería y Extraer datos)
        items = character_json.get('items', [])

        for item in items:
            itype = item.get('type')
            name = item.get('name')
            system = item.get('system', {})
            description = system.get('description', {}).get('value', '')

            clean_item = {
                "name": name,
                "description": description,
                "source": "Foundry Import",
                "original_data": system
            }

            if itype == 'race':
                char_race = name
                if self._save_entity('races', clean_item): stats['races'] += 1

            elif itype == 'class':
                level = system.get('levels', 1)
                char_classes.append(f"{name} {level}")
                clean_item['hit_dice'] = system.get('hitDice', 'd8')
                if self._save_entity('classes', clean_item): stats['classes'] += 1

            elif itype == 'background':
                char_bg = name
                if self._save_entity('backgrounds', clean_item): stats['backgrounds'] += 1

            elif itype == 'spell':
                clean_item['level'] = system.get('level', 0)
                clean_item['school'] = system.get('school', '')
                if self._save_entity('spells', clean_item): stats['spells'] += 1

            elif itype in ['weapon', 'equipment', 'loot', 'consumable', 'tool']:
                char_items.append(name)
                clean_item['type'] = itype
                clean_item['rarity'] = system.get('rarity', '')
                if self._save_entity('items', clean_item): stats['items'] += 1

        # 2. Extraer Estadísticas (Mapeo Foundry -> App)
        abilities = character_json.get('system', {}).get('abilities', {})
        map_stats = {'str': 'Fuerza', 'dex': 'Destreza', 'con': 'Constitución', 'int': 'Inteligencia',
                     'wis': 'Sabiduría', 'cha': 'Carisma'}
        final_stats = {}
        for key, label in map_stats.items():
            val = abilities.get(key, {}).get('value', 10)
            final_stats[label] = val

        # 3. Construir Objeto Personaje
        character_data = {
            "nombre": character_json.get('name', 'Héroe Importado'),
            "raza": char_race,
            "clase": " / ".join(char_classes) if char_classes else "Aventurero",
            "trasfondo": char_bg,
            "alineamiento": character_json.get('system', {}).get('details', {}).get('alignment', 'Neutral'),
            "stats": final_stats,
            "habilidades": [],  # Difícil de mapear genéricamente sin lógica compleja
            "rasgos": ["Importado de Foundry"],
            "equipo": char_items,
            "historia": str(
                character_json.get('system', {}).get('details', {}).get('biography', {}).get('value', 'Sin biografía.'))
        }

        # Devolvemos ambas cosas: stats de la librería y el personaje reconstruido
        return stats, character_data

    def get_options(self):
        """Devuelve listas simples de lo que hay en la biblioteca para el frontend/prompt"""
        data = {"races": [], "classes": []}

        # Leer Razas
        r_path = os.path.join(self.base_path, 'races', 'collection.json')
        if os.path.exists(r_path):
            with open(r_path, 'r', encoding='utf-8') as f:
                try:
                    items = json.load(f)
                    data["races"] = sorted([i.get('name') for i in items])
                except:
                    pass

        # Leer Clases
        c_path = os.path.join(self.base_path, 'classes', 'collection.json')
        if os.path.exists(c_path):
            with open(c_path, 'r', encoding='utf-8') as f:
                try:
                    items = json.load(f)
                    data["classes"] = sorted([i.get('name') for i in items])
                except:
                    pass

        return data


library_service = LibraryService()