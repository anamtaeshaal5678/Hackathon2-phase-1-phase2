import requests
import uuid
from sqlmodel import Session, select, create_engine
import sys
import os

# Create consistency with app's runtime environment
# We need 'backend' folder in sys.path so 'import models' works as it does in the app
backend_path = os.path.join(os.getcwd(), "backend")
if backend_path not in sys.path:
    sys.path.append(backend_path)

# Verify imports work relative to backend/
try:
    from models import Todo, User
    from database import engine, create_db_and_tables
except ImportError as e:
    # If falling back to root import
    print(f"Direct import failed: {e}. Trying absolute...")
    try:
        from backend.models import Todo, User
        from backend.database import engine, create_db_and_tables
    except ImportError as e2:
        print(f"Absolute import failed: {e2}")
        raise e

from datetime import datetime, timedelta
import time

BASE_URL = "http://localhost:8000"

def test_recurrence():
    print("--- Verifying Recurrence Logic ---")
    
    # Ensure tables exist
    create_db_and_tables()

    # 1. Create a dummy user and task directly in DB
    user_id = str(uuid.uuid4()) # User ID is string in model
    task_id = uuid.uuid4()
    
    # We need a user because Todo needs a user_id (though foreign key constraints might not be enforced in simple sqlite setup depending on config, but let's be safe if we can, or just try inserting Todo)
    # Actually, let's just insert the Todo. The current model definition might just require a UUID for user_id.
    
    recurring_task = Todo(
        id=task_id,
        user_id=user_id,
        title="Test Recurring Task",
        description="This should respawn",
        is_completed=False,
        priority="medium",
        recurrence="daily",
        due_date=datetime.utcnow()
    )
    
    with Session(engine) as session:
        session.add(recurring_task)
        session.commit()
        print(f"✅ Created test task: {task_id}")

    # 2. Simulate Dapr Event
    payload = {
        "data": {
            "type": "task_updated",
            "user_id": str(user_id),
            "task_id": str(task_id),
            "is_completed": True
        }
    }
    
    print("Simulating Dapr event...")
    response = requests.post(f"{BASE_URL}/dapr/events/task-lifecycle", json=payload)
    
    if response.status_code != 200:
        print(f"❌ API Request failed: {response.text}")
        return

    print("✅ Event sent successfully.")
    
    # 3. Verify new task creation
    print("Waiting for async processing (if any)...")
    time.sleep(2)
    
    with Session(engine) as session:
        # Look for tasks with same title but different ID
        statement = select(Todo).where(Todo.title == "Test Recurring Task").where(Todo.id != task_id)
        results = session.exec(statement).all()
        
        if len(results) > 0:
            new_task = results[0]
            print(f"✅ Recurrence Success! New task created: {new_task.id}")
            print(f"   Due Date: {new_task.due_date}")
            print(f"   Recurrence: {new_task.recurrence}")
            
            # Clean up
            session.delete(new_task)
            original_task = session.get(Todo, task_id)
            if original_task:
                 session.delete(original_task)
            session.commit()
            print("Cleanup complete.")
        else:
            print("❌ Recurrence Failed: No new task found.")
            # Debug: check if original task was found by ID in the router logic
            # (Requires checking logs, but here we just report failure)

if __name__ == "__main__":
    try:
        test_recurrence()
    except Exception as e:
        print(f"❌ Error: {e}")
