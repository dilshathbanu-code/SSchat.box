from flask import Blueprint, request, jsonify
from services.auth_service import auth_service

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def _get_bearer_token(req) -> str:
    auth_header = req.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return auth_header.strip()

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "")
    password = data.get("password", "")
    name = data.get("name", "")
    board = data.get("board", "tn_state_board")
    class_grade = data.get("class_grade", "Class 10")
    preferred_lang = data.get("preferred_language", "en")

    result = auth_service.register(
        email=email,
        password=password,
        name=name,
        board=board,
        class_grade=class_grade,
        preferred_lang=preferred_lang
    )

    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "")
    password = data.get("password", "")

    result = auth_service.login(email=email, password=password)
    status_code = 200 if result.get("success") else 401
    return jsonify(result), status_code

@auth_bp.route("/me", methods=["GET"])
def me():
    token = _get_bearer_token(request)
    user = auth_service.get_user_by_token(token)
    if user:
        return jsonify({"success": True, "user": user})
    return jsonify({"success": False, "message": "Not authenticated"}), 401

@auth_bp.route("/profile", methods=["PUT", "POST"])
def update_profile():
    token = _get_bearer_token(request)
    user = auth_service.get_user_by_token(token)
    if not user:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    data = request.get_json() or {}
    result = auth_service.update_profile(user["id"], data)
    return jsonify(result), 200 if result.get("success") else 400

@auth_bp.route("/change-password", methods=["POST"])
def change_password():
    token = _get_bearer_token(request)
    user = auth_service.get_user_by_token(token)
    if not user:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    data = request.get_json() or {}
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")

    result = auth_service.change_password(user["id"], old_password, new_password)
    return jsonify(result), 200 if result.get("success") else 400
