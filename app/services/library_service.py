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
        # Evitar duplicados exactos
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

        # 1. PROCESAR ITEMS (Equipo, Clases, Feats)
        items = char_json.get('items', [])
        for item in items:
            itype = item.get('type')
            name = item.get('name')
            system = item.get('system', {})
            desc = system.get('description', {}).get('value', '') or ""

            # Limpiar HTML de descripciones para la base de conocimientos
            import re
            clean_desc = re.sub('<[^<]+?>', '', desc)[:200]

            clean_item = {"name": name, "description": clean_desc, "source": "Foundry Import", "original_data": system}

            if itype == 'race':
                char_race = name
                self._save_entity('races', clean_item)
                stats_count['races'] += 1

            elif itype == 'class':
                lvl = system.get('levels', 1)
                sub = system.get('subclass', '')
                class_str = f"{name} {lvl}"
                if sub: class_str += f" ({sub})"
                char_classes.append(class_str)
                clean_item['hit_dice'] = system.get('hitDice', 'd8')
                self._save_entity('classes', clean_item)
                stats_count['classes'] += 1

            elif itype == 'background':
                char_bg = name
                self._save_entity('backgrounds', clean_item)
                stats_count['backgrounds'] += 1

            elif itype == 'feat':
                char_features.append({"nombre": name, "descripcion": clean_desc})

            elif itype in ['weapon', 'equipment', 'loot', 'consumable', 'tool', 'backpack']:
                detail = ""
                if itype == 'weapon':
                    # Intento robusto de sacar daño
                    damage_parts = system.get('damage', {}).get('parts', [])
                    if damage_parts and len(damage_parts) > 0:
                        dmg = damage_parts[0][0]  # Ej: 1d8 + @mod
                        dtype = damage_parts[0][1] if len(damage_parts[0]) > 1 else ""
                        detail = f"{dmg} {dtype}".strip()
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
                self._save_entity('items', clean_item)
                stats_count['items'] += 1

        # 2. EXTRAER STATS (Blindaje contra nulos)
        abilities = char_json.get('system', {}).get('abilities', {})
        map_stats = {'str': 'Fuerza', 'dex': 'Destreza', 'con': 'Constitución', 'int': 'Inteligencia',
                     'wis': 'Sabiduría', 'cha': 'Carisma'}
        final_stats = {}
        for key, label in map_stats.items():
            # A veces viene como 'value', a veces directo
            ab_data = abilities.get(key, {})
            val = ab_data.get('value') if isinstance(ab_data, dict) else 10
            final_stats[label] = val or 10

        # 3. EXTRAER HABILIDADES (SKILLS) - Mapeo Simplificado
        # Usamos nombres CLAVE simples para evitar problemas de " (Des)"
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
            # Soporte para varias versiones de Foundry
            val = skill_data.get('value') or skill_data.get('proficient') or 0

            try:
                val = float(val)  # Asegurar que es número
                if val >= 0.5:  # Si es 1 (prof) o 2 (expert), o 0.5 (jack of all trades)
                    char_skills[label] = val
            except:
                pass

        # 4. CONSTRUIR OBJETO
        character_data = {
            "nombre": char_json.get('name', 'Héroe Importado'),
            "raza": char_race,
            "clase": " / ".join(char_classes) if char_classes else "Aventurero",
            "trasfondo": char_bg,
            "alineamiento": char_json.get('system', {}).get('details', {}).get('alignment', 'Neutral'),
            "stats": final_stats,
            "habilidades": char_skills,  # { "Sigilo": 2, "Atletismo": 1 }
            "rasgos": char_features,
            "equipo": char_items,
            "historia": str(char_json.get('system', {}).get('details', {}).get('biography', {}).get('value', ''))
        }

        return stats_count, character_data


library_service = LibraryService()