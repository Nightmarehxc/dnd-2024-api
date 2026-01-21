from flask import Blueprint, request, jsonify
from app.services.librarian_service import librarian_service
from app.schemas.request import LibrarianRequestSchema

bp = Blueprint('librarian', __name__, url_prefix='/api/librarian')


@bp.route('/generate', methods=['POST'])
def generate():
    try:
        # 1. Validar lo que llega del JS
        data = LibrarianRequestSchema().load(request.json)

        # 2. Llamar al servicio
        result = librarian_service.generate_book(
            book_type=data['book_type'],
            topic=data['topic'],
            tone=data['tone'],
            author_style=data.get('author_style', '')
        )
        return jsonify(result)

    except Exception as e:
        print(f"Error Librarian: {e}")
        # Esto evita que el frontend reciba HTML de error y falle el JSON.parse
        return jsonify({"error": str(e)}), 400