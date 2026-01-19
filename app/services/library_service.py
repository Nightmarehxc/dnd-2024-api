import os
import json
import re


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
        if not any(x['name'] == entity_name for x in current_data):
            current_data.append(entity_data)
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(current_data, f, ensure_ascii=False, indent=2)
            return True
        return False

    def get_options(self):
        data = {"races": [], "classes": []}
        for type_key in ["races", "classes"]:
            path = os.path.join(self.base_path, type_key, 'collection.json')
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    try:
                        data[type_key] = sorted([i.get('name') for i in json.load(f)])
                    except:
                        pass
        return data

    def process_foundry_import(self, char_json):
        stats_count = {"races": 0, "classes": 0, "backgrounds": 0, "items": 0, "spells": 0}

        char_race = "Desconocida"
        char_classes = []
        char_bg = "Desconocido"
        char_items = []
        char_features = []

        # 1. PROCESAR ITEMS
        items = char_json.get('items', [])
        for item in items:
            itype = item.get('type')
            name = item.get('name')
            system = item.get('system', {})
            raw_desc = system.get('description', {}).get('value', '') or ""
            clean_desc = re.sub(r'<[^>]+>', '', raw_desc)[:300]

            clean_item = {"name": name, "description": clean_desc, "source": "Foundry Import", "original_data": system}

            if itype == 'race':
                char_race = name
                if self._save_entity('races', clean_item): stats_count['races'] += 1

            elif itype == 'class':
                lvl = system.get('levels', 1)
                sub = system.get('subclass', '')
                c_str = f"{name} {lvl}"
                if sub: c_str += f" ({sub})"
                char_classes.append(c_str)
                clean_item['hit_dice'] = system.get('hitDice', 'd8')
                if self._save_entity('classes', clean_item): stats_count['classes'] += 1

            elif itype == 'background':
                char_bg = name
                if self._save_entity('backgrounds', clean_item): stats_count['backgrounds'] += 1

            elif itype == 'feat':
                char_features.append({"nombre": name, "descripcion": clean_desc})

            elif itype in ['weapon', 'equipment', 'loot', 'consumable', 'tool']:
                detail = ""
                if itype == 'weapon':
                    parts = system.get('damage', {}).get('parts', [])
                    if parts and len(parts) > 0: detail = f"{parts[0][0]} {parts[0][1]}"
                elif itype == 'equipment':
                    ac = system.get('armor', {}).get('value')
                    if ac: detail = f"AC {ac}"

                char_items.append({
                    "name": name,
                    "type": itype,
                    "quantity": system.get('quantity', 1),
                    "detail": detail
                })

                clean_item['type'] = itype
                if self._save_entity('items', clean_item): stats_count['items'] += 1

        # 2. EXTRAER STATS
        abilities = char_json.get('system', {}).get('abilities', {})
        map_stats = {'str': 'Fuerza', 'dex': 'Destreza', 'con': 'Constitución', 'int': 'Inteligencia',
                     'wis': 'Sabiduría', 'cha': 'Carisma'}
        final_stats = {}
        for key, label in map_stats.items():
            ab = abilities.get(key, {})
            val = ab.get('value', 10) if isinstance(ab, dict) else 10
            final_stats[label] = val

        # 3. EXTRAER HABILIDADES (SKILLS) - VERSIÓN ROBUSTA
        # Usamos nombres CLAVE simples (sin parentesis)
        skills_map = {
            'acr': 'Acrobacias', 'ani': 'Trato Animales', 'arc': 'Arcanos',
            'ath': 'Atletismo', 'dec': 'Engaño', 'his': 'Historia',
            'ins': 'Perspicacia', 'itm': 'Intimidación', 'inv': 'Investigación',
            'med': 'Medicina', 'nat': 'Naturaleza', 'prc': 'Percepción',
            'prf': 'Interpretación', 'per': 'Persuasión', 'rel': 'Religión',
            'slt': 'Juego de Manos', 'ste': 'Sigilo', 'sur': 'Supervivencia'
        }

        char_skills = {}
        foundry_skills = char_json.get('system', {}).get('skills', {})

        for code, label in skills_map.items():
            skill_data = foundry_skills.get(code, {})
            val = skill_data.get('value', 0)

            # BLINDAJE: Asegurar que es un número (int o float)
            try:
                num_val = float(val)
                if num_val >= 0.5:  # 0.5=Jack, 1=Prof, 2=Expert
                    char_skills[label] = num_val
            except (ValueError, TypeError):
                continue

        # 4. OBJETO FINAL
        character_data = {
            "nombre": char_json.get('name', 'Héroe Importado'),
            "raza": char_race,
            "clase": " / ".join(char_classes) if char_classes else "Aventurero",
            "trasfondo": char_bg,
            "alineamiento": char_json.get('system', {}).get('details', {}).get('alignment', 'Neutral'),
            "stats": final_stats,
            "habilidades": char_skills,  # Enviamos {"Sigilo": 2, "Acrobacias": 1}
            "rasgos": char_features,
            "equipo": char_items,
            "historia": str(char_json.get('system', {}).get('details', {}).get('biography', {}).get('value', ''))
        }

        return stats_count, character_data


library_service = LibraryService()