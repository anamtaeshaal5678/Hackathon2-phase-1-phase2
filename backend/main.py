from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_db_and_tables
from routers import todos, chat
from system_utils import get_system_status_data
import os

import logging
import traceback
from fastapi import Request, Response

# SP-7: Structured Logging
class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

logger = logging.getLogger()
handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    create_db_and_tables()
    yield

# Determine root path based on environment
# On Vercel, requests to /api/backend/xxx are routed to this app
# So we need to strip /api/backend prefix or tell FastAPI about it
root_path = "/api/backend" if os.environ.get("VERCEL") else ""

app = FastAPI(
    title="AI-Powered Todo Chatbot - Phase III", 
    version="0.2.0", 
    lifespan=lifespan, 
    redirect_slashes=False,
    root_path=root_path
)

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        # Don't catch HTTPExceptions (like 401 Unauthorized), let FastAPI handle them
        if type(e).__name__ == "HTTPException" or type(e).__name__ == "StarletteHTTPException":
            raise e
            
        logger.error(f"Global exception: {e}")
        logger.error(traceback.format_exc())
        return Response("Internal Server Error", status_code=500)

# Allow CORS for Frontend
# In production this should be restricted to the frontend domain
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todos.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Evolution of Todo API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/system/status")
def get_system_status():
    return get_system_status_data()
