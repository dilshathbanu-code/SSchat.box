import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from services.language_service import language_service
from config import Config

def test_tamil_script_validation():
    valid_tamil = "ஒவ்வொரு பொருளும் புறவிசை ஏதும் செயல்படாத வரையில் தமது ஓய்வு நிலையிலோ தொடர்ந்து இருக்கும்."
    res = language_service.validate_tamil_text(valid_tamil)
    assert res["is_valid"] is True
    assert res["tamil_char_count"] > 10
    assert res["warning"] is None

def test_hindi_script_validation():
    valid_hindi = "किसी भी रासायनिक अभिक्रिया में द्रव्यमान का न तो निर्माण होता है और न ही विनाश।"
    res = language_service.validate_hindi_text(valid_hindi)
    assert res["is_valid"] is True
    assert res["devanagari_char_count"] > 10
    assert res["warning"] is None

def test_script_detection():
    assert language_service.detect_script("வணக்கம் எப்படி இருக்கிறீர்கள்") == "ta"
    assert language_service.detect_script("नमस्ते आप कैसे हैं") == "hi"
    assert language_service.detect_script("Hello how are you") == "en"

def test_exact_fallback_messages_integrity():
    # Verify exact prompt-mandated honest fallback strings
    assert Config.FALLBACK_MESSAGES["ta"] == "கிடைக்கக்கூடிய பாடப்புத்தக ஆதாரங்களிலிருந்து இந்த பதிலை என்னால் உறுதிப்படுத்த முடியவில்லை. தயவுசெய்து பாடப்புத்தகத்தின் பதிப்பை சரிபார்க்கவும் அல்லது தொடர்புடைய பக்கத்தை வழங்கவும்."
    assert Config.FALLBACK_MESSAGES["en"] == "I couldn't verify this answer from the available textbook sources. Please check the textbook edition or provide the relevant page."
    assert Config.FALLBACK_MESSAGES["hi"] == "उपलब्ध पाठ्यपुस्तक स्रोतों से मैं इस उत्तर की पुष्टि नहीं कर सका। कृपया पाठ्यपुस्तक के संस्करण की जाँच करें या संबंधित पृष्ठ प्रदान करें।"

if __name__ == "__main__":
    pytest.main(["-v", __file__])
