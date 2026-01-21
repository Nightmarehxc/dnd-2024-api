from app import db
from app.models import GeneratedItem
from sqlalchemy import desc


class HistoryService:

    def get_all_by_type(self, item_type):
        # Busca en DB por tipo, ordenado por fecha (más nuevo primero)
        items = GeneratedItem.query.filter_by(type=item_type) \
            .order_by(desc(GeneratedItem.timestamp)) \
            .all()
        return [item.to_dict() for item in items]

    def save_item(self, item_type, data):
        # Intentamos encontrar el nombre dentro del JSON, sea cual sea el formato
        name = (data.get('nombre') or
                data.get('name') or
                data.get('shop_name') or
                data.get('title') or
                "Sin Nombre")

        new_item = GeneratedItem(
            type=item_type,
            name=name,
            data=data
        )

        db.session.add(new_item)
        db.session.commit()
        return new_item.to_dict()

    def delete_item(self, item_id):
        item = GeneratedItem.query.get(item_id)
        if item:
            db.session.delete(item)
            db.session.commit()
            return True
        return False

    def update_item(self, item_id, new_data):
        item = GeneratedItem.query.get(item_id)
        if item:
            # Actualizar nombre si ha cambiado en el JSON
            new_name = (new_data.get('nombre') or
                        new_data.get('name') or
                        new_data.get('shop_name') or
                        new_data.get('title'))
            if new_name:
                item.name = new_name

            # Actualizar el JSON
            item.data = new_data

            # Forzar detección de cambios en JSON (para SQLAlchemy)
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(item, "data")

            db.session.commit()
            return item.to_dict()
        return None


history_service = HistoryService()