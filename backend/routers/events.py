from fastapi import APIRouter, Body
import logging
from typing import Dict, Any, List
from sqlmodel import Session, select
from database import engine
from models import Todo
from datetime import datetime, timedelta
import uuid

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dapr", tags=["dapr"])

@router.get("/subscribe")
def subscribe():
    """Dapr subscription endpoint"""
    subscriptions = [
        {
            "pubsubname": "pubsub",
            "topic": "task-events",
            "route": "/dapr/events/task-lifecycle"
        },
        {
            "pubsubname": "pubsub",
            "topic": "reminders",
            "route": "/dapr/events/reminders"
        }
    ]
    return subscriptions

@router.post("/events/task-lifecycle")
async def handle_task_lifecycle(event: Dict[str, Any] = Body(...)):
    """Handle task lifecycle events for recurrence logic"""
    data = event.get("data", {})
    event_type = data.get("type")
    user_id = data.get("user_id")
    task_id = data.get("task_id")
    
    logger.info(f"Received lifecycle event: {event_type} for task {task_id}")
    
    if event_type == "task_updated" and data.get("is_completed") is True:
        # Check recurrence
        with Session(engine) as session:
            task = session.get(Todo, uuid.UUID(task_id))
            if task and task.recurrence and task.recurrence != "none":
                # Create next instance of recurring task
                new_due_date = None
                if task.recurrence == "daily":
                    new_due_date = (task.due_date or datetime.utcnow()) + timedelta(days=1)
                elif task.recurrence == "weekly":
                    new_due_date = (task.due_date or datetime.utcnow()) + timedelta(weeks=1)
                elif task.recurrence == "monthly":
                    # Simple monthly logic
                    new_due_date = (task.due_date or datetime.utcnow()) + timedelta(days=30)
                
                if new_due_date:
                    new_task = Todo(
                        user_id=task.user_id,
                        title=task.title,
                        description=task.description,
                        priority=task.priority,
                        due_date=new_due_date,
                        recurrence=task.recurrence,
                        tags=task.tags
                    )
                    session.add(new_task)
                    session.commit()
                    logger.info(f"Created recurring task: {new_task.title} for {new_due_date}")

    return {"status": "SUCCESS"}

@router.post("/events/reminders")
async def handle_reminders(event: Dict[str, Any] = Body(...)):
    """Handle reminder triggers"""
    data = event.get("data", {})
    task_id = data.get("task_id")
    title = data.get("title")
    
    logger.info(f"🔔 REMINDER TRIGGERED: {title} (Task ID: {task_id})")
    # In a real app, this would trigger a push notification, email, or WebSocket message
    
    return {"status": "SUCCESS"}
