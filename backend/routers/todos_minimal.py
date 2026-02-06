from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime
import uuid

from database import get_session
from models import Todo, TodoCreate, TodoUpdate, TodoRead, User, TodoStats
from auth import get_current_user

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/stats", response_model=TodoStats)
def get_todo_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(Todo).where(Todo.user_id == current_user.id)
    todos = session.exec(statement).all()
    
    total = len(todos)
    completed = len([t for t in todos if t.is_completed])
    pending = total - completed
    rate = (completed / total * 100) if total > 0 else 0
    
    priority_map = {"high": 0, "medium": 0, "low": 0}
    for t in todos:
        if t.priority in priority_map:
            priority_map[t.priority] += 1
    
    return TodoStats(
        total=total,
        completed=completed,
        pending=pending,
        completion_rate=rate,
        by_priority=priority_map
    )

@router.post("/", response_model=TodoRead)
def create_todo(
    todo_data: TodoCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    new_todo = Todo(
        user_id=current_user.id,
        title=todo_data.title,
        description=todo_data.description,
        priority=todo_data.priority or "medium",
        due_date=todo_data.due_date,
        recurrence=todo_data.recurrence,
        tags=todo_data.tags,
        is_completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    session.add(new_todo)
    session.commit()
    session.refresh(new_todo)
    
    return new_todo

@router.get("/", response_model=List[TodoRead])
def list_todos(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(Todo).where(Todo.user_id == current_user.id).order_by(Todo.created_at.desc())
    todos = session.exec(statement).all()
    return todos

@router.get("/{todo_id}", response_model=TodoRead)
def get_todo(
    todo_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    todo = session.get(Todo, todo_id)
    if not todo or todo.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@router.put("/{todo_id}", response_model=TodoRead)
def update_todo(
    todo_id: uuid.UUID,
    todo_update: TodoUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    todo = session.get(Todo, todo_id)
    if not todo or todo.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_data = todo_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(todo, key, value)
    
    todo.updated_at = datetime.utcnow()
    session.add(todo)
    session.commit()
    session.refresh(todo)
    
    return todo

@router.delete("/{todo_id}")
def delete_todo(
    todo_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    todo = session.get(Todo, todo_id)
    if not todo or todo.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    session.delete(todo)
    session.commit()
    
    return {"status": "deleted", "id": str(todo_id)}
