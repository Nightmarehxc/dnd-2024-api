from app import db
from datetime import datetime
import json


class GeneratedItem(db.Model):
    __tablename__ = 'generated_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=True)  # Por si añades usuarios en el futuro

    # Metadatos comunes
    type = db.Column(db.String(50), nullable=False)  # Ej: 'npc', 'city', 'shop'
    name = db.Column(db.String(150), nullable=False)  # El nombre generado
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # AQUÍ ESTÁ LA MAGIA: Guardamos todo el objeto JSON generado aquí
    data = db.Column(db.JSON, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'name': self.name,
            'timestamp': self.timestamp.isoformat(),
            'data': self.data  # Devuelve el JSON completo
        }