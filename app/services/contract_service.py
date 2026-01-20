from app.services.gemini_service import BaseService

class ContractService(BaseService):
    def generate_contract(self, patron, desire):
        system = """
        Eres un abogado diabólico experto en contratos mágicos.
        Devuelve JSON: {
            "titulo": "Acuerdo vinculante",
            "oferta": "Qué recibe el mortal exactamente.",
            "precio": "Qué debe pagar o hacer a cambio.",
            "letra_pequena": "Una trampa o consecuencia imprevista redactada legalmente.",
            "clausula_escape": "Una forma muy difícil pero posible de romper el contrato."
        }
        """
        prompt = f"Redacta un contrato entre una entidad tipo '{patron}' y un mortal que desea '{desire}'."
        return self._generate_content(system, prompt)

contract_service = ContractService()