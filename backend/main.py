from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_db_and_tables
from routers import todos, chat
import os

import logging
import traceback
from fastapi import Request, Response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    create_db_and_tables()
    yield

app = FastAPI(title="AI-Powered Todo Chatbot - Phase III", version="0.2.0", lifespan=lifespan, redirect_slashes=False)

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"Global exception: {e}")
        logger.error(traceback.format_exc())
        return Response("Internal Server Error", status_code=500)

# Allow CORS for Frontend
# In production this should be restricted to the frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
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
