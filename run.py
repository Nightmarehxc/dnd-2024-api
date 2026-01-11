import os
from app import create_app

# Lee la configuración del ambiente o usa default
config_name = os.getenv('FLASK_CONFIG') or 'default'
app = create_app(config_name)

if __name__ == '__main__':
    # --- AÑADE ESTO PARA VER LAS RUTAS ---
    print("\n--- RUTAS REGISTRADAS ---")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule}")
    print("-------------------------\n")
    # -------------------------------------
    app.run(port=5000)