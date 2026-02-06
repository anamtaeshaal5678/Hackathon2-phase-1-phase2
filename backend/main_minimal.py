from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_db_and_tables
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    create_db_and_tables()
    yield

# Determine root path based on environment
root_path = "/api/backend" if os.environ.get("VERCEL") else ""

app = FastAPI(
    title="Todo App - Minimal", 
    version="0.1.0", 
    lifespan=lifespan, 
    redirect_slashes=False,
    root_path=root_path
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import only essential routers
from routers import todos_minimal

app.include_router(todos_minimal.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "minimal-0.1.0"}

@app.get("/")
def root():
    return {"message": "Todo API - Minimal Version"}
