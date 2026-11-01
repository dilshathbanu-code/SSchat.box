import json
from flask import Blueprint, jsonify, request
from config import Config
from services.rag_service import rag_service

curriculum_bp = Blueprint("curriculum", __name__, url_prefix="/api/curriculum")

@curriculum_bp.route("/catalog", methods=["GET"])
def get_catalog():
    catalog_path = Config.DATA_DIR / "curriculum_catalog.json"
    if catalog_path.exists():
        with open(catalog_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return jsonify({"success": True, "data": data})
    return jsonify({"success": False, "message": "Catalog not found"}), 404

@curriculum_bp.route("/textbooks", methods=["GET"])
def get_textbooks():
    catalog = rag_service.get_all_textbooks_summary()
    return jsonify({
        "success": True,
        "count": len(catalog),
        "textbooks": catalog
    })

@curriculum_bp.route("/chapters", methods=["GET"])
def get_full_chapters_list():
    """Returns list of complete authorized chapters available for structured learning."""
    chapters_file = Config.TEXTBOOKS_DIR / "full_chapters.json"
    if chapters_file.exists():
        with open(chapters_file, "r", encoding="utf-8") as f:
            chapters = json.load(f)
            summaries = [
                {
                    "id": c.get("id"),
                    "chapter_number": c.get("chapter_number"),
                    "chapter_name": c.get("chapter_name"),
                    "chapter_name_ta": c.get("chapter_name_ta"),
                    "chapter_name_hi": c.get("chapter_name_hi"),
                    "board": c.get("board"),
                    "board_name": c.get("board_name"),
                    "class_grade": c.get("class_grade"),
                    "subject": c.get("subject"),
                    "total_sections": len(c.get("sections", [])),
                    "page_range": f"Pages {c.get('page_start')}–{c.get('page_end')}",
                    "verification_status": c.get("verification_status")
                }
                for c in chapters
            ]
            return jsonify({"success": True, "count": len(summaries), "chapters": summaries})
    return jsonify({"success": True, "count": 0, "chapters": []})

@curriculum_bp.route("/chapter/<chapter_id>", methods=["GET"])
def get_chapter_detail(chapter_id):
    """Returns full section-by-section breakdown of a verified authorized chapter."""
    chapters_file = Config.TEXTBOOKS_DIR / "full_chapters.json"
    if chapters_file.exists():
        with open(chapters_file, "r", encoding="utf-8") as f:
            chapters = json.load(f)
            for c in chapters:
                if c.get("id") == chapter_id:
                    return jsonify({"success": True, "chapter": c})
    return jsonify({"success": False, "message": "Chapter not found"}), 404
