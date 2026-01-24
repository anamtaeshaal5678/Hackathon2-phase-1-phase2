from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
import json

# User Table (Managed by Better Auth, defining here for Reference/FK if needed)
# Assumed schema based on Better Auth defaults
class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    email: str
    name: Optional[str] = None
    image: Optional[str] = None
    emailVerified: bool = False
    createdAt: datetime
    updatedAt: datetime

# Session Table (Managed by Better Auth)
class Session(SQLModel, table=True):
    id: str = Field(primary_key=True)
    userId: str = Field(foreign_key="user.id")
    expiresAt: datetime
    token: str
    createdAt: datetime
    updatedAt: datetime
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None

# Todo Schemas
class TodoBase(SQLModel):
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)
    is_completed: bool = Field(default=False)
    priority: str = Field(default="medium")  # "low" | "medium" | "high"
    due_date: Optional[datetime] = None



# Todo Table (Managed by Python Backend)
class Todo(TodoBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # specific user_id to link with User table
    user_id: str = Field(foreign_key="user.id", index=True) 
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TodoCreate(TodoBase):
    pass

class TodoUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None



class TodoRead(TodoBase):
    id: uuid.UUID
    created_at: datetime

# Conversation Table (For AI Chat)
class Conversation(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    title: str = Field(default="New Conversation", max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Message Table (For Chat History)
class Message(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    role: str = Field(max_length=20)  # "user" | "assistant" | "system"
    content: str
    tool_calls: Optional[str] = None  # JSON array of tool names
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Chat Schemas
class MessageCreate(SQLModel):
    content: str

class ConversationRead(SQLModel):
    id: int
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime

class MessageRead(SQLModel):
    id: int
    role: str
    content: str
    tool_calls: Optional[List[str]] = None
    created_at: datetime

class ChatRequest(SQLModel):
    conversation_id: Optional[int] = None
    message: str

class ChatResponse(SQLModel):
    conversation_id: int
    message_id: int
    response: str
    tool_calls: Optional[List[str]] = None

# Stats Schema
class TodoStats(SQLModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    completion_rate: float
    priority_breakdown: dict  # {"high": 1, "medium": 2, "low": 0}

