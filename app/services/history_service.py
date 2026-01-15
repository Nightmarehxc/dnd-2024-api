import json
import os
import uuid
from datetime import datetime


class HistoryService:
    def __init__(self):
        # Directorio base 'data/'
        self.base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

    def _get_file_path(self, type_name):
        """Devuelve la ruta del archivo según el tipo (npc, item, etc.)"""
        # Seguridad básica para evitar salir del directorio
        safe_name = "".join([c for c in type_name if c.isalpha() or c == '_'])
        return os.path.join(self.base_dir, f"history_{safe_name}.json")

    def _read_file(self, type_name):
        path = self._get_file_path(type_name)
        if not os.path.exists(path):
            return []
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    def _write_file(self, type_name, data):
        path = self._get_file_path(type_name)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def get_all(self, type_name):
        """Obtiene el historial de un tipo específico"""
        return self._read_file(type_name)

    def save_entry(self, data, type_name):
        """Guarda en el archivo específico del tipo"""
        history = self._read_file(type_name)

        # Detectar nombre
        name = data.get('nombre') or data.get('titulo') or "Sin nombre"

        new_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "type": type_name,
            "name": name,
            "data": data
        }

        # Insertar al inicio y limitar a 50
        history.insert(0, new_entry)
        history = history[:50]

        self._write_file(type_name, history)
        return new_entry

    def delete_entry(self, item_id, type_name):
        """Borra una entrada del archivo específico"""
        history = self._read_file(type_name)
        # Filtramos por ID
        new_history = [item for item in history if item['id'] != item_id]

        self._write_file(type_name, new_history)
        return {"status": "deleted", "id": item_id}


history_service = HistoryService()