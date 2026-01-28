from sqlmodel import SQLModel, create_engine, Session
import os
from typing import Generator
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import event

# Helper to fix postgres protocol for SQLAlchemy if needed
def get_db_url():
    url = os.environ.get("DATABASE_URL")
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    
    # Vercel-specific: Use /tmp for SQLite if no DATABASE_URL is set
    if not url and os.environ.get("VERCEL"):
        print("DEBUG: Detected Vercel Environment. Using /tmp/todo.db for SQLite.")
        return "sqlite:////tmp/todo.db"
        
    return url

DATABASE_URL = get_db_url()

# Configure engine with WAL mode for SQLite
connect_args = {}
if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args) if DATABASE_URL else None

if engine and DATABASE_URL and DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

def get_session() -> Generator[Session, None, None]:
    if not engine:
        raise RuntimeError("DATABASE_URL is not set")
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    if not engine:
        raise RuntimeError("DATABASE_URL is not set")
    # Import all models to ensure they're registered
    from models import User, Session as DbSession, Todo, Conversation, Message
    SQLModel.metadata.create_all(engine)
