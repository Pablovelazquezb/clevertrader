"""
Config — carga API keys desde .env
"""
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY_ID = os.getenv("APCA_API_KEY_ID")
API_SECRET_KEY = os.getenv("APCA_API_SECRET_KEY")
API_BASE_URL = os.getenv("APCA_API_BASE_URL", "https://paper-api.alpaca.markets")

# Data URLs
DATA_URL = "https://data.alpaca.markets"

def validate():
    missing = []
    if not API_KEY_ID:
        missing.append("APCA_API_KEY_ID")
    if not API_SECRET_KEY:
        missing.append("APCA_API_SECRET_KEY")
    if missing:
        raise RuntimeError(f"Faltan variables de entorno: {', '.join(missing)}")

validate()
