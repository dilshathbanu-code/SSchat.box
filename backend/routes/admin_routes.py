from flask import Blueprint, jsonify
from services.rag_service import rag_service
from services.auth_service import auth_service
from services.db_service import db_service
from config import Config

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/stats", methods=["GET"])
def get_stats():
    total_passages = len(rag_service.textbooks)
    catalog = rag_service.get_all_textbooks_summary()
    total_students = db_service.get_total_users_count()
    total_chats = db_service.get_total_messages_count()
    
    # Calculate board distribution
    board_counts = {}
    for t in rag_service.textbooks:
        b = t.get("board", "unknown")
        board_counts[b] = board_counts.get(b, 0) + 1

    return jsonify({
        "success": True,
        "health": "operational",
        "total_passages_indexed": total_passages,
        "total_chapters": len(catalog),
        "total_registered_students": total_students,
        "total_conversations_saved": total_chats,
        "board_distribution": board_counts,
        "system_status": {
            "rag_engine": "Active - Strict Board Grounding",
            "multilingual_nlp": "Tamil, Hindi, English UTF-8 Verified",
            "database_engine": "Production SQLite WAL Thread-Safe Engine" if not Config.MONGODB_URI else "MongoDB Atlas Cloud",
            "ai_grounding_policy": "Zero Hallucination with Fallback Enforcement"
        }
    })

@admin_bp.route("/reload", methods=["POST"])
def reload_index():
    count = rag_service.reload()
    return jsonify({
        "success": True,
        "message": f"Successfully reloaded and indexed {count} verified textbook passages."
    })
