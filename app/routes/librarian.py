from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.services.librarian_service import librarian_service
from app.schemas.request import LibrarianRequestSchema
from app.models import Librarian
from app import db

bp = Blueprint('librarian', __name__, url_prefix='/api/librarian')


# ============================================
# CREATE - Generar un nuevo libro
# ============================================
@bp.route('/generate', methods=['POST'])
def generate():
    schema = LibrarianRequestSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        print(f"Error Librarian: {err.messages}")
        return jsonify({"error": "Validación fallida", "detalles": err.messages}), 400

    try:
        # 1. Generar contenido con Gemini
        result = librarian_service.generate_book(
            book_type=data['book_type'],
            topic=data['topic'],
            tone=data['tone'],
            author_style=data.get('author_style', '')
        )

        if "error" in result:
            return jsonify(result), 500

        # 2. Guardar en la base de datos
        book = Librarian(
            name=result.get('titulo', 'Libro Sin Título'),
            topic=data['topic'],
            book_type=data['book_type'],
            tone=data['tone'],
            author=result.get('autor', 'Autor Desconocido'),
            descripcion_fisica=result.get('descripcion_fisica', ''),
            contenido=result.get('contenido', ''),
            valor=result.get('valor', 'Desconocido')
        )
        db.session.add(book)
        db.session.commit()

        # 3. Retornar datos con ID de BD
        return jsonify({
            '_db_id': book.id,
            'title': book.name,
            'topic': book.topic,
            'book_type': book.book_type,
            'tone': book.tone,
            'author': book.author,
            'description': book.descripcion_fisica,
            'content': book.contenido,
            'value': book.valor,
            'secret': book.secret or ''
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error Librarian: {e}")
        return jsonify({"error": str(e)}), 400


# ============================================
# READ - Obtener un libro por ID
# ============================================
@bp.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    try:
        book = Librarian.query.get(book_id)
        if not book:
            return jsonify({"error": "Libro no encontrado"}), 404

        return jsonify({
            '_db_id': book.id,
            'title': book.name,
            'topic': book.topic,
            'book_type': book.book_type,
            'tone': book.tone,
            'author': book.author,
            'description': book.descripcion_fisica,
            'content': book.contenido,
            'secret': book.secret or '',
            'value': book.valor
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================
# UPDATE - Actualizar un libro existente
# ============================================
@bp.route('/<int:book_id>', methods=['PUT', 'PATCH'])
def update_book(book_id):
    try:
        book = Librarian.query.get(book_id)
        if not book:
            return jsonify({"error": "Libro no encontrado"}), 404

        data = request.json
        
        # Actualizar solo los campos proporcionados
        if 'title' in data:
            book.name = data['title']
        if 'topic' in data:
            book.topic = data['topic']
        if 'book_type' in data:
            book.book_type = data['book_type']
        if 'tone' in data:
            book.tone = data['tone']
        if 'author' in data:
            book.author = data['author']
        if 'description' in data:
            book.descripcion_fisica = data['description']
        if 'content' in data:
            book.contenido = data['content']
        if 'secret' in data:
            book.secret = data['secret']
        if 'value' in data:
            book.valor = data['value']

        db.session.commit()

        return jsonify({
            '_db_id': book.id,
            'title': book.name,
            'topic': book.topic,
            'book_type': book.book_type,
            'tone': book.tone,
            'author': book.author,
            'description': book.descripcion_fisica,
            'content': book.contenido,
            'secret': book.secret or '',
            'value': book.valor
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ============================================
# DELETE - Eliminar un libro
# ============================================
@bp.route('/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        book = Librarian.query.get(book_id)
        if not book:
            return jsonify({"error": "Libro no encontrado"}), 404

        db.session.delete(book)
        db.session.commit()

        return jsonify({"success": True, "message": "Libro eliminado correctamente"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ============================================
# LIST - Obtener todos los libros
# ============================================
@bp.route('', methods=['GET'])
def list_books():
    try:
        books = Librarian.query.all()
        return jsonify({
            "books": [
                {
                    '_db_id': book.id,
                    'title': book.name,
                    'topic': book.topic,
                    'book_type': book.book_type,
                    'tone': book.tone,
                    'author': book.author,
                    'timestamp': book.timestamp.isoformat() if book.timestamp else None
                }
                for book in books
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500