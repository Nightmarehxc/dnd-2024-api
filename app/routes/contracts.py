from flask import Blueprint, request, jsonify
from app.services.contract_service import contract_service
from app.schemas.request import ContractRequestSchema
from app.models import Contract
from app import db

bp = Blueprint('contracts', __name__, url_prefix='/api/contracts')

@bp.route('/generate', methods=['POST'])
def generate():
    try:
        data = ContractRequestSchema().load(request.json)
        result = contract_service.generate_contract(data['patron'], data['desire'])
        
        if "error" in result:
            return jsonify(result), 500
        
        # Guardar en la base de datos
        try:
            contract = Contract(
                name=result.get('title', f"Contrato con {data['patron']}"),
                patron=data['patron'],
                desire=data['desire'],
                offer=result.get('offer'),
                price=result.get('price'),
                small_print=result.get('small_print'),
                escape_clause=result.get('escape_clause')
            )
            db.session.add(contract)
            db.session.commit()
            result['id'] = contract.id
        except Exception as e:
            db.session.rollback()
            print(f"Error guardando contrato: {e}")
        
        return jsonify(result)
    except Exception as e: 
        return jsonify({"error": str(e)}), 400

@bp.route('/list', methods=['GET'])
def list_contracts():
    """Listar todos los contratos guardados"""
    try:
        contracts = Contract.query.order_by(Contract.timestamp.desc()).all()
        return jsonify([c.get_data() for c in contracts])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:contract_id>', methods=['GET'])
def get_contract(contract_id):
    """Obtener un contrato específico"""
    try:
        contract = Contract.query.get_or_404(contract_id)
        return jsonify(contract.get_data())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:contract_id>', methods=['DELETE'])
def delete_contract(contract_id):
    """Eliminar un contrato"""
    try:
        contract = Contract.query.get_or_404(contract_id)
        db.session.delete(contract)
        db.session.commit()
        return jsonify({"message": "Contrato eliminado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500