from flask import Blueprint, request, jsonify
from services.quiz_service import quiz_service

quiz_bp = Blueprint("quiz", __name__, url_prefix="/api/quiz")

@quiz_bp.route("/list", methods=["GET"])
def get_quiz_list():
    board = request.args.get("board")
    class_grade = request.args.get("class_grade")
    subject = request.args.get("subject")
    lang = request.args.get("language", "en")

    quizzes = quiz_service.get_quizzes(board=board, class_grade=class_grade, subject=subject, lang=lang)
    return jsonify({
        "success": True,
        "count": len(quizzes),
        "quizzes": quizzes
    })

@quiz_bp.route("/submit", methods=["POST"])
def submit_quiz():
    data = request.get_json() or {}
    answers = data.get("answers", [])
    lang = data.get("language", "en")

    if not isinstance(answers, list) or len(answers) == 0:
        return jsonify({"success": False, "message": "Answers list cannot be empty."}), 400

    result = quiz_service.grade_submission(answers, lang=lang)
    return jsonify({
        "success": True,
        "result": result
    })
