from backend.main import app

# Vercel needs a handler, but FastAPI 'app' is enough if WSGI/ASGI is detected.
# For Vercel Python runtime, sticking to 'app' variable is standard.
