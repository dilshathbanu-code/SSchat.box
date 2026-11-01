import time
import uuid
from flask import Blueprint, request, jsonify
from config import Config
from services.ai_service import ai_service
from services.rag_service import rag_service
from services.auth_service import auth_service
from services.db_service import db_service

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")

# Robust sliding window rate limiter
_rate_limit_records = {}

def _check_rate_limit(client_identifier: str, max_requests: int = 60, window_seconds: int = 60) -> bool:
    """Sliding-window rate limiter per client IP or user ID."""
    now = time.time()
    # Garbage collect older entries periodically
    if len(_rate_limit_records) > 2000:
        stale_threshold = now - window_seconds
        stale_keys = [k for k, v in _rate_limit_records.items() if not v or v[-1] < stale_threshold]
        for k in stale_keys:
            del _rate_limit_records[k]

    window = _rate_limit_records.get(client_identifier, [])
    window = [t for t in window if now - t < window_seconds]
    if len(window) >= max_requests:
        _rate_limit_records[client_identifier] = window
        return False

    window.append(now)
    _rate_limit_records[client_identifier] = window
    return True

def _get_current_user_and_session():
    """Extracts authenticated student from Bearer token if present, and session ID."""
    auth_header = request.headers.get("Authorization", "")
    token = ""
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    elif auth_header:
        token = auth_header.strip()

    user = auth_service.get_user_by_token(token) if token else None
    
    # Session ID passed by frontend (or generated)
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id") or request.args.get("session_id") or request.headers.get("X-Session-ID")
    if not session_id:
        session_id = f"guest_session_{request.remote_addr or 'default'}"

    return user, session_id

@chat_bp.route("/ask", methods=["POST"])
def ask_question():
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "127.0.0.1").split(",")[0].strip()
    user, session_id = _get_current_user_and_session()
    
    # Limit: 120/min for authenticated students, 60/min for guests
    limit = 120 if user else 60
    identifier = f"user_{user['id']}" if user else f"ip_{client_ip}"
    if not _check_rate_limit(identifier, max_requests=limit, window_seconds=60):
        return jsonify({
            "success": False,
            "message": "Too many requests. Please wait a moment before asking another question."
        }), 429

    data = request.get_json() or {}
    query = data.get("query", "").strip()
    board = data.get("board", "tn_state_board")
    class_grade = data.get("class_grade", "Class 10")
    subject = data.get("subject", "Science")
    response_language = data.get("language", "en")
    chat_history = data.get("history", [])

    if not query:
        return jsonify({
            "success": False,
            "message": "Question query cannot be empty."
        }), 400

    if len(query) > 1000:
        return jsonify({
            "success": False,
            "message": "Question query exceeds the maximum allowed length (1000 characters)."
        }), 400

    # Execute grounded RAG pipeline
    result = ai_service.generate_answer(
        query=query,
        board=board,
        class_grade=class_grade,
        subject=subject,
        response_language=response_language,
        history=chat_history
    )

    # Persist question & answer in database with strict student/session isolation
    user_id = user["id"] if user else None
    saved_msg = db_service.add_chat_message(
        user_id=user_id,
        session_id=session_id,
        query=query,
        board=board,
        class_grade=class_grade,
        subject=subject,
        language=response_language,
        answer=result.get("answer", ""),
        explanation=result.get("explanation"),
        example=result.get("example"),
        citations=result.get("citations", []),
        has_sufficient_evidence=result.get("has_sufficient_evidence", True),
        verification_status=result.get("verification_status"),
        ai_engine=result.get("ai_engine")
    )

    result["message_id"] = saved_msg["id"]
    result["session_id"] = session_id
    result["user_authenticated"] = user is not None
    return jsonify(result)

@chat_bp.route("/history", methods=["GET"])
def get_history():
    """Returns isolated chat history for the authenticated student or current guest session."""
    user, session_id = _get_current_user_and_session()
    limit = min(int(request.args.get("limit", 50)), 100)
    offset = int(request.args.get("offset", 0))

    if user:
        history = db_service.get_chat_history(user_id=user["id"], limit=limit, offset=offset)
    else:
        history = db_service.get_chat_history(session_id=session_id, limit=limit, offset=offset)

    return jsonify({
        "success": True,
        "count": len(history),
        "history": history,
        "is_authenticated": user is not None,
        "session_id": session_id
    })

@chat_bp.route("/history/clear", methods=["POST", "DELETE"])
@chat_bp.route("/clear", methods=["POST", "DELETE"])
def clear_history():
    """Clears history strictly for the calling student or guest session."""
    user, session_id = _get_current_user_and_session()
    if user:
        count = db_service.clear_chat_history(user_id=user["id"])
    else:
        count = db_service.clear_chat_history(session_id=session_id)

    return jsonify({
        "success": True,
        "message": f"Successfully cleared {count} conversation items.",
        "deleted_count": count
    })

@chat_bp.route("/passage/<passage_id>", methods=["GET"])
def get_passage(passage_id):
    """Fetches exact raw passage for the textbook source viewer modal."""
    for item in rag_service.textbooks:
        if item.get("id") == passage_id:
            return jsonify({
                "success": True,
                "passage": item
            })
    return jsonify({"success": False, "message": "Passage not found"}), 404
