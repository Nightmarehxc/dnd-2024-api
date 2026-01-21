from app.services.gemini_service import BaseService


class LibrarianService(BaseService):
    def generate_book(self, book_type, topic, tone="Académico", author_style=""):
        style_instr = f"Estilo de escritura: {author_style}" if author_style else ""

        system = """
        Eres el Bibliotecario Jefe de Candlekeep. Generas libros detallados de D&D.
        Responde SOLO con este JSON exacto:
        {
            "title": "Título del Libro",
            "author": "Nombre del Autor",
            "type": "Tipo de libro",
            "description": "Descripción física del tomo (encuadernación, estado, olor).",
            "summary": "Resumen breve del contenido.",
            "content": "Un extracto largo y significativo del texto (3-4 párrafos). Puedes usar HTML básico (<br>, <i>, <b>).",
            "secret": "Un dato oculto, mensaje cifrado o pista que contiene el libro."
        }
        """

        prompt = f"""
        Genera un libro de tipo: "{book_type}".
        Tema principal: "{topic}".
        Tono: {tone}.
        {style_instr}

        El contenido debe ser inmersivo y útil para un DM.
        """

        return self._generate_content(system, prompt)


librarian_service = LibrarianService()