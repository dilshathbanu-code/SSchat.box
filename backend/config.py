import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of backend
BASE_DIR = Path(__file__).resolve().parent

# Load .env file
load_dotenv(BASE_DIR / ".env")

class Config:
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    IS_PRODUCTION = FLASK_ENV == "production"
    DEBUG = os.getenv("DEBUG", "true").lower() in ("true", "1") and not IS_PRODUCTION
    PORT = int(os.getenv("PORT", 5000))

    # Cryptographic secrets
    SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production_sschatbox_2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)

    # Allowed CORS Origins (comma-separated for multiple domains)
    CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000,https://sschatbox.vercel.app")
    ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ORIGIN.split(",") if origin.strip()]

    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    MONGODB_URI = os.getenv("MONGODB_URI", "")

    # External AI Provider (Google Gemini)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # Storage paths
    DATA_DIR = BASE_DIR / "data"
    TEXTBOOKS_DIR = DATA_DIR / "textbooks"
    GLOSSARY_DIR = DATA_DIR / "glossary"
    USER_STORE_PATH = DATA_DIR / "users.json"
    HISTORY_STORE_PATH = DATA_DIR / "chat_history.json"
    SQLITE_DB_PATH = DATA_DIR / "sschatbox.db"

    # Mandatory Curriculum-Grounded Fallback Messages
    FALLBACK_MESSAGES = {
        "en": "I couldn't verify this answer from the available textbook sources. Please check the textbook edition or provide the relevant page.",
        "ta": "கிடைக்கக்கூடிய பாடப்புத்தக ஆதாரங்களிலிருந்து இந்த பதிலை என்னால் உறுதிப்படுத்த முடியவில்லை. தயவுசெய்து பாடப்புத்தகத்தின் பதிப்பை சரிபார்க்கவும் அல்லது தொடர்புடைய பக்கத்தை வழங்கவும்.",
        "hi": "उपलब्ध पाठ्यपुस्तक स्रोतों से मैं इस उत्तर की पुष्टि नहीं कर सका। कृपया पाठ्यपुस्तक के संस्करण की जाँच करें या संबंधित पृष्ठ प्रदान करें।"
    }
