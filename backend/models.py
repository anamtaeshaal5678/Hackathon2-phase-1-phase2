from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

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
    description: str = Field(max_length=200)
    is_completed: bool = Field(default=False)

# Todo Table (Managed by Python Backend)
class Todo(TodoBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # specific user_id to link with User table
    user_id: str = Field(foreign_key="user.id", index=True) 
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TodoCreate(TodoBase):
    pass

class TodoUpdate(SQLModel):
    description: Optional[str] = None
    is_completed: Optional[bool] = None

class TodoRead(TodoBase):
    id: uuid.UUID
    created_at: datetime
