import os
import time
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config

# Import blueprints
from routes.auth_routes import auth_bp
from routes.chat_routes import chat_bp
from routes.curriculum_routes import curriculum_bp
from routes.quiz_routes import quiz_bp
from routes.admin_routes import admin_bp

# Import services for health validation
from services.rag_service import rag_service
from services.db_service import db_service

START_TIME = time.time()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure production structured logging
    log_level = logging.INFO if Config.IS_PRODUCTION else logging.DEBUG
    logging.basicConfig(
        level=log_level,
        format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    )

    # Configure CORS securely for multi-domain production deployment
    origins = Config.ALLOWED_ORIGINS if Config.ALLOWED_ORIGINS else ["*"]
    if "*" in origins or not Config.IS_PRODUCTION:
        CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    else:
        CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(curriculum_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(admin_bp)

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "service": "SSchat.box AI Backend",
            "version": "1.0.0",
            "description": "Textbook-Grounded Multilingual Educational Assistant for LKG-12 (Tamil Nadu Samacheer Kalvi, CBSE, NCERT)",
            "status": "online",
            "environment": Config.FLASK_ENV,
            "docs": "/api/admin/stats"
        })

    @app.route("/api/health", methods=["GET"])
    def health():
        """Comprehensive production health check endpoint."""
        uptime_seconds = round(time.time() - START_TIME, 1)
        db_healthy = True
        total_students = 0
        try:
            total_students = db_service.get_total_users_count()
        except Exception as e:
            app.logger.error(f"Health check DB probe failed: {e}")
            db_healthy = False

        passages_count = len(rag_service.textbooks)
        is_healthy = db_healthy and passages_count > 0

        return jsonify({
            "status": "healthy" if is_healthy else "degraded",
            "uptime_seconds": uptime_seconds,
            "environment": Config.FLASK_ENV,
            "database": {
                "status": "connected" if db_healthy else "error",
                "registered_students": total_students
            },
            "rag_engine": {
                "status": "operational",
                "indexed_textbook_passages": passages_count
            },
            "timestamp": time.time()
        }), 200 if is_healthy else 503

    @app.errorhandler(400)
    def handle_bad_request(e):
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": str(getattr(e, "description", "The request could not be processed."))
        }), 400

    @app.errorhandler(401)
    def handle_unauthorized(e):
        return jsonify({
            "success": False,
            "error": "Unauthorized",
            "message": "Authentication required to access this resource."
        }), 401

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({
            "success": False,
            "error": "Endpoint not found",
            "message": "Please refer to the SSchat.box API documentation at /api/admin/stats."
        }), 404

    @app.errorhandler(429)
    def handle_rate_limit(e):
        return jsonify({
            "success": False,
            "error": "Too Many Requests",
            "message": "Rate limit exceeded. Please wait a moment before sending more requests."
        }), 429

    @app.errorhandler(500)
    def handle_server_error(e):
        app.logger.error(f"Internal server error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": "An error occurred while processing your request. Please try again later."
        }), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = Config.PORT
    print(f"[SSchat.box] Starting Backend Server on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
