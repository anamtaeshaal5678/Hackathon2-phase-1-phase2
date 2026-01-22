"""
MCP Server for Task Management Tools

This module implements the Model Context Protocol (MCP) server with 5 task management tools:
- add_task: Create a new task
- list_tasks: List tasks with optional filtering
- complete_task: Mark a task as completed
- delete_task: Delete a task
- update_task: Update task details
"""

from typing import Optional, List, Dict, Any
from sqlmodel import Session, select
from database import get_session, engine
from models import Todo, User
import uuid
import json
from datetime import datetime


class MCPTaskTools:
    """MCP Task Management Tools"""
    
    @staticmethod
    def add_task(
        user_id: str, 
        title: str, 
        description: Optional[str] = None,
        priority: str = "medium",
        due_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Add a new task for the user
        
        Args:
            user_id: User identifier
            title: Task title
            description: Optional task description
            priority: Task priority ("low" | "medium" | "high")
            due_date: ISO date string (optional)
            
        Returns:
            Dict with task_id, status, and title
        """
        try:
            with Session(engine) as session:
                # Verify user exists
                user = session.get(User, user_id)
                if not user:
                    return {
                        "status": "error",
                        "message": f"User {user_id} not found"
                    }
                
                # Parse due date if provided
                parsed_due_date = None
                if due_date:
                    try:
                        parsed_due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                    except ValueError:
                        pass

                # Create task
                task = Todo(
                    user_id=user_id,
                    description=title,  # Using description field as title
                    is_completed=False,
                    priority=priority.lower() if priority else "medium",
                    due_date=parsed_due_date
                )
                session.add(task)
                session.commit()
                session.refresh(task)
                
                return {
                    "task_id": str(task.id),
                    "status": "success",
                    "title": title,
                    "message": f"✅ Task added: {title}"
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to add task: {str(e)}"
            }
    
    @staticmethod
    def list_tasks(user_id: str, status: str = "all") -> Dict[str, Any]:
        """
        List user's tasks with optional filtering
        
        Args:
            user_id: User identifier
            status: Filter by status ("all" | "pending" | "completed")
            
        Returns:
            Dict with tasks array
        """
        try:
            with Session(engine) as session:
                # Build query
                statement = select(Todo).where(Todo.user_id == user_id)
                
                if status == "pending":
                    statement = statement.where(Todo.is_completed == False)
                elif status == "completed":
                    statement = statement.where(Todo.is_completed == True)
                
                tasks = session.exec(statement).all()
                
                task_list = [
                    {
                        "task_id": str(task.id),
                        "title": task.description,
                        "completed": task.is_completed,
                        "priority": task.priority,
                        "due_date": task.due_date.isoformat() if task.due_date else None,
                        "created_at": task.created_at.isoformat()
                    }
                    for task in tasks
                ]
                
                return {
                    "status": "success",
                    "tasks": task_list,
                    "count": len(task_list)
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to list tasks: {str(e)}"
            }
    
    @staticmethod
    def complete_task(user_id: str, task_id: str) -> Dict[str, Any]:
        """
        Mark a task as completed
        
        Args:
            user_id: User identifier
            task_id: Task identifier (UUID string)
            
        Returns:
            Dict with task_id, status, and title
        """
        try:
            with Session(engine) as session:
                # Find task
                try:
                    task_uuid = uuid.UUID(task_id)
                except ValueError:
                    return {
                        "status": "error",
                        "message": f"Invalid task ID format: {task_id}"
                    }
                
                statement = select(Todo).where(
                    Todo.id == task_uuid,
                    Todo.user_id == user_id
                )
                task = session.exec(statement).first()
                
                if not task:
                    return {
                        "status": "error",
                        "message": f"Task not found: {task_id}"
                    }
                
                # Mark as completed
                task.is_completed = True
                session.add(task)
                session.commit()
                
                return {
                    "task_id": task_id,
                    "status": "completed",
                    "title": task.description,
                    "message": f"✅ Marked '{task.description}' as completed"
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to complete task: {str(e)}"
            }
    
    @staticmethod
    def delete_task(user_id: str, task_id: str) -> Dict[str, Any]:
        """
        Delete a task
        
        Args:
            user_id: User identifier
            task_id: Task identifier (UUID string)
            
        Returns:
            Dict with task_id, status, and title
        """
        try:
            with Session(engine) as session:
                # Find task
                try:
                    task_uuid = uuid.UUID(task_id)
                except ValueError:
                    return {
                        "status": "error",
                        "message": f"Invalid task ID format: {task_id}"
                    }
                
                statement = select(Todo).where(
                    Todo.id == task_uuid,
                    Todo.user_id == user_id
                )
                task = session.exec(statement).first()
                
                if not task:
                    return {
                        "status": "error",
                        "message": f"Task not found: {task_id}"
                    }
                
                title = task.description
                session.delete(task)
                session.commit()
                
                return {
                    "task_id": task_id,
                    "status": "deleted",
                    "title": title,
                    "message": f"🗑️ Deleted task: {title}"
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to delete task: {str(e)}"
            }
    
    @staticmethod
    def update_task(
        user_id: str,
        task_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[str] = None,
        due_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update task details
        
        Args:
            user_id: User identifier
            task_id: Task identifier (UUID string)
            title: New title (optional)
            description: New description (optional)
            priority: New priority (optional)
            due_date: New due date string (optional)
            
        Returns:
            Dict with task_id, status, and title
        """
        try:
            with Session(engine) as session:
                # Find task
                try:
                    task_uuid = uuid.UUID(task_id)
                except ValueError:
                    return {
                        "status": "error",
                        "message": f"Invalid task ID format: {task_id}"
                    }
                
                statement = select(Todo).where(
                    Todo.id == task_uuid,
                    Todo.user_id == user_id
                )
                task = session.exec(statement).first()
                
                if not task:
                    return {
                        "status": "error",
                        "message": f"Task not found: {task_id}"
                    }
                
                # Update fields
                if title:
                    task.description = title
                if priority:
                    task.priority = priority.lower()
                if due_date:
                    try:
                        task.due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                    except ValueError:
                        pass
                
                session.add(task)
                session.commit()
                session.refresh(task)
                
                return {
                    "task_id": task_id,
                    "status": "updated",
                    "title": task.description,
                    "message": f"📝 Updated task: {task.description}"
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to update task: {str(e)}"
            }


# Export singleton instance
mcp_tools = MCPTaskTools()
