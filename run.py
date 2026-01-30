import os
from app import create_app
from google import genai
# Lee la configuración del ambiente o usa default
config_name = os.getenv('FLASK_CONFIG') or 'default'
app = create_app(config_name)
models_list = False
route_list = False
if __name__ == '__main__':
    client = genai.Client(api_key= os.getenv('GOOGLE_API_KEY'))
    if route_list:
        print("\n--- RUTAS REGISTRADAS ---")
        for rule in app.url_map.iter_rules():
            print(f"{rule.endpoint}: {rule}")
    print("-------------------------\n")
    if models_list:
        for model in client.models.list():
            print(f"Nombre: {model.name}")
            print(f"  Soporte de Generación: {model.supported_actions}")
            print("-" * 30)
    # -------------------------------------
    app.run(host='0.0.0.0', port=5001, debug=True)