from flask import Blueprint, request, jsonify
from app.services.librarian_service import librarian_service
from app.schemas.request import LibrarianRequestSchema

bp = Blueprint('librarian', __name__, url_prefix='/api/librarian')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = LibrarianRequestSchema().load(request.json)
        return jsonify(librarian_service.generate_book(data['topic'], data['type']))
    except Exception as e: return jsonify({"error": str(e)}), 400