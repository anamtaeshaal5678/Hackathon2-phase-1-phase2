from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
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
    print(f"DEBUG: get_todo_stats for user {current_user.id}")
    statement = select(Todo).where(Todo.user_id == current_user.id)
    todos = session.exec(statement).all()
    print(f"DEBUG: found {len(todos)} todos for stats")
    
    total = len(todos)
    completed = len([t for t in todos if t.is_completed])
    pending = total - completed
    rate = (completed / total * 100) if total > 0 else 0

    
    priority_map = {"high": 0, "medium": 0, "low": 0}
    for t in todos:
        p = t.priority.lower() if t.priority else "medium"
        if p in priority_map:
            priority_map[p] += 1
            
    return TodoStats(
        total_tasks=total,
        completed_tasks=completed,
        pending_tasks=pending,
        completion_rate=round(rate, 2),
        priority_breakdown=priority_map
    )


@router.post("", response_model=TodoRead)
async def create_todo(
    todo_in: TodoCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Ensure description is not None for database constraint parity
    if todo_in.description is None:
        todo_in.description = ""
        
    todo = Todo.model_validate(todo_in, update={"user_id": current_user.id})

    session.add(todo)
    session.commit()
    session.refresh(todo)
    
    # SP-1.5: Schedule reminder via Dapr Jobs API if needed
    if todo.reminder_time:
        try:
            from dapr_client import dapr
            # Schedule a job to fire at reminder_time
            await dapr.invoke_service("app", "jobs/reminders", {
                "jobId": f"reminder-{todo.id}",
                "dueTime": todo.reminder_time.isoformat(),
                "data": {"task_id": str(todo.id), "title": todo.title}
            })
        except: pass

    # SP-2: Emit event via Dapr
    try:
        from dapr_client import dapr
        await dapr.publish_event("pubsub", "task-events", {
            "type": "task_created",
            "user_id": current_user.id,
            "task_id": str(todo.id),
            "title": todo.title
        })
    except Exception as e:
        print(f"DEBUG: Failed to emit dapr event: {e}")
        
    return todo

@router.get("", response_model=List[TodoRead])
def read_todos(
    offset: int = 0,
    limit: int = Query(default=100, le=100),
    search: Optional[str] = None,
    priority: Optional[str] = None,
    is_completed: Optional[bool] = None,
    sort_by: Optional[str] = Query(default="created_at"), # "created_at", "due_date", "priority"
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    print(f"DEBUG: read_todos for user {current_user.id}")
    try:
        statement = select(Todo).where(Todo.user_id == current_user.id)
        
        # SP-1.1: Search, filter
        if search:
            statement = statement.where(Todo.title.contains(search) | Todo.description.contains(search))
        if priority:
            statement = statement.where(Todo.priority == priority)
        if is_completed is not None:
            statement = statement.where(Todo.is_completed == is_completed)
            
        # SP-1.1: Sort
        if sort_by == "due_date":
            statement = statement.order_by(Todo.due_date.asc())
        elif sort_by == "priority":
            statement = statement.order_by(Todo.priority.desc())
        else:
            statement = statement.order_by(Todo.created_at.desc())

        statement = statement.offset(offset).limit(limit)
        todos = session.exec(statement).all()
        return todos
    except Exception as e:
        print(f"DEBUG: error in read_todos: {e}")
        raise e

@router.put("/{todo_id}", response_model=TodoRead)
async def update_todo(
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
    
    # SP-2: Emit event via Dapr
    try:
        from dapr_client import dapr
        await dapr.publish_event("pubsub", "task-events", {
            "type": "task_updated",
            "user_id": current_user.id,
            "task_id": str(todo.id),
            "is_completed": todo.is_completed
        })
    except: pass
    
    return todo

@router.delete("/{todo_id}")
async def delete_todo(
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
    
    # SP-2: Emit event via Dapr
    try:
        from dapr_client import dapr
        await dapr.publish_event("pubsub", "task-events", {
            "type": "task_deleted",
            "user_id": current_user.id,
            "task_id": str(todo_id)
        })
    except: pass
    
    return {"ok": True}
