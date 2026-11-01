import os

# Server socket
bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"

# Worker processes: 2-4 worker threads for fast concurrency on free/starter tiers
workers = int(os.environ.get("WEB_CONCURRENCY", 2))
threads = int(os.environ.get("PYTHON_THREADS", 4))
worker_class = "gthread"

# Timeout: 120 seconds to allow comprehensive RAG retrieval & external AI synthesis
timeout = 120
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("LOG_LEVEL", "info")

# Performance tuning
preload_app = True
max_requests = 1000
max_requests_jitter = 50
