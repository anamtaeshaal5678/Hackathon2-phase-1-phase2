from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
import uuid

from database import get_session
from models import Todo, TodoCreate, TodoUpdate, TodoRead, User
from auth import get_current_user

router = APIRouter(prefix="/todos", tags=["todos"])

@router.post("", response_model=TodoRead)
def create_todo(
    todo_in: TodoCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    todo = Todo.model_validate(todo_in, update={"user_id": current_user.id})
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@router.get("", response_model=List[TodoRead])
def read_todos(
    offset: int = 0,
    limit: int = Query(default=100, le=100),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(Todo).where(Todo.user_id == current_user.id).offset(offset).limit(limit)
    todos = session.exec(statement).all()
    return todos

@router.get("/{todo_id}", response_model=TodoRead)
def read_todo(
    todo_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(Todo).where(Todo.id == todo_id, Todo.user_id == current_user.id)
    todo = session.exec(statement).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@router.put("/{todo_id}", response_model=TodoRead)
def update_todo(
    todo_id: uuid.UUID,
    todo_in: TodoUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(Todo).where(Todo.id == todo_id, Todo.user_id == current_user.id)
    todo = session.exec(statement).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    todo_data = todo_in.model_dump(exclude_unset=True)
    for key, value in todo_data.items():
        setattr(todo, key, value)
        
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
    statement = select(Todo).where(Todo.id == todo_id, Todo.user_id == current_user.id)
    todo = session.exec(statement).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
        
    session.delete(todo)
    session.commit()
    return {"ok": True}
