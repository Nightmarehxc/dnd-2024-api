from app.services.gemini_service import BaseService

class LibrarianService(BaseService):
    def generate_book(self, topic, book_type, tone, author_style=""):
        system = """
        Eres un bibliotecario arcano. Genera un documento interesante para D&D.
        Devuelve JSON: {
            "titulo": "Título evocador",
            "autor": "Nombre y título del autor",
            "descripcion_fisica": "Estado del libro/pergamino (quemado, encuadernado en piel...)",
            "contenido": "Un párrafo legible y jugable del texto (lore, pista o receta).",
            "valor": "Valor estimado en gp"
        }
        """
        style_hint = f" Estilo del autor: {author_style}." if author_style else ""
        prompt = f"Genera un {book_type} sobre el tema: {topic}. Tono: {tone}.{style_hint}"
        return self._generate_content(system, prompt)

librarian_service = LibrarianService()