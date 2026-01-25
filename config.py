import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEBUG = True
    TESTING = True
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    MODEL_AI = os.getenv('MODEL_AI', 'gemini-3-flash-preview')  # Default if not set

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    # En producción debug debe ser False
    pass

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}