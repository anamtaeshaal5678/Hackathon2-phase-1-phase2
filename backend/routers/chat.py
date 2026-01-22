"""
Chat Router - Stateless AI Chat Endpoint

Provides natural language interface for task management with:
- Conversation persistence
- Mock AI (pattern matching)
- Urdu language support
- MCP tool integration
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
import json
import re

from database import get_session
from models import (
    Conversation, Message, ChatRequest, ChatResponse,
    ConversationRead, MessageRead, User
)
from auth import get_current_user
from mcp_server import mcp_tools

router = APIRouter(prefix="/api/chat", tags=["chat"])


class MockAI:
    """Mock AI for pattern-based natural language understanding"""
    
    @staticmethod
    def detect_language(text: str) -> str:
        """Detect if text is in Urdu"""
        # Simple Urdu detection - check for Urdu Unicode range
        urdu_pattern = re.compile(r'[\u0600-\u06FF]')
        return "urdu" if urdu_pattern.search(text) else "english"
    
    @staticmethod
    def extract_task_title(text: str, language: str) -> Optional[str]:
        """Extract task title from natural language"""
        text_lower = text.lower()
        
        # English patterns
        add_patterns = [
            r'add task:?\s*(.+)',
            r'create task:?\s*(.+)',
            r'new task:?\s*(.+)',
            r'add\s+(.+)\s+to\s+(my\s+)?list',
            r'remind me to\s+(.+)',
        ]
        
        # Urdu patterns
        urdu_add_patterns = [
            r'نیا کام:?\s*(.+)',
            r'کام شامل کرو:?\s*(.+)',
            r'یاد دہانی:?\s*(.+)',
        ]
        
        patterns = urdu_add_patterns if language == "urdu" else add_patterns
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None
    
    @staticmethod
    def detect_intent(text: str, language: str) -> tuple[str, dict]:
        """
        Detect user intent and extract parameters
        
        Returns:
            (intent, params) tuple
        """
        text_lower = text.lower()
        
        # Add task intent
        task_title = MockAI.extract_task_title(text, language)
        if task_title:
            params = {"title": task_title}
            
            # Extract priority
            priority = None
            if any(w in text_lower for w in ["high priority", "urgent", "important", "ضروری", "انتہائی"]):
                priority = "high"
            elif any(w in text_lower for w in ["low priority", "not urgent", "معمولی"]):
                priority = "low"
            elif any(w in text_lower for w in ["medium", "درمیانہ"]):
                priority = "medium"
            
            if priority:
                params["priority"] = priority

            # Extract due date (simple patterns)
            due_date = None
            if any(w in text_lower for w in ["today", "آج"]):
                due_date = datetime.utcnow().date().isoformat()
            elif any(w in text_lower for w in ["tomorrow", "کل"]):
                from datetime import timedelta
                due_date = (datetime.utcnow() + timedelta(days=1)).date().isoformat()
            
            if due_date:
                params["due_date"] = due_date

            return ("add_task", params)
        
        # List tasks intent
        list_keywords_en = ["show", "list", "display", "view", "my tasks", "what tasks"]
        list_keywords_ur = ["دکھاؤ", "فہرست", "کام"]
        
        keywords = list_keywords_ur if language == "urdu" else list_keywords_en
        if any(kw in text_lower for kw in keywords):
            # Check for status filter
            if "pending" in text_lower or "incomplete" in text_lower or "زیر التواء" in text_lower:
                return ("list_tasks", {"status": "pending"})
            elif "completed" in text_lower or "done" in text_lower or "مکمل" in text_lower:
                return ("list_tasks", {"status": "completed"})
            else:
                return ("list_tasks", {"status": "all"})
        
        # Complete task intent
        complete_keywords_en = ["complete", "finish", "done", "mark"]
        complete_keywords_ur = ["مکمل", "ختم"]
        
        keywords = complete_keywords_ur if language == "urdu" else complete_keywords_en
        if any(kw in text_lower for kw in keywords):
            # Try to extract task reference
            if "first" in text_lower or "پہلا" in text_lower:
                return ("complete_task", {"task_ref": "first"})
            elif "last" in text_lower or "آخری" in text_lower:
                return ("complete_task", {"task_ref": "last"})
            else:
                return ("complete_task", {"task_ref": "first"})  # Default to first
        
        # Delete task intent
        delete_keywords_en = ["delete", "remove", "cancel"]
        delete_keywords_ur = ["حذف", "ہٹاؤ"]
        
        keywords = delete_keywords_ur if language == "urdu" else delete_keywords_en
        if any(kw in text_lower for kw in keywords):
            if "first" in text_lower or "پہلا" in text_lower:
                return ("delete_task", {"task_ref": "first"})
            elif "last" in text_lower or "آخری" in text_lower:
                return ("delete_task", {"task_ref": "last"})
            else:
                return ("delete_task", {"task_ref": "first"})
        
        # Default: unknown intent
        return ("unknown", {})
    
    @staticmethod
    def generate_response(intent: str, result: dict, language: str) -> str:
        """Generate natural language response"""
        
        if language == "urdu":
            return MockAI._generate_urdu_response(intent, result)
        else:
            return MockAI._generate_english_response(intent, result)
    
    @staticmethod
    def _generate_english_response(intent: str, result: dict) -> str:
        """Generate English response"""
        
        if intent == "add_task":
            if result.get("status") == "success":
                return result.get("message", "✅ Task added successfully")
            else:
                return f"❌ {result.get('message', 'Failed to add task')}"
        
        elif intent == "list_tasks":
            if result.get("status") == "success":
                tasks = result.get("tasks", [])
                if not tasks:
                    return "📋 Your task list is empty."
                
                response = f"📋 You have {len(tasks)} task(s):\n\n"
                for i, task in enumerate(tasks, 1):
                    status = "✅" if task["completed"] else "⏳"
                    response += f"{i}. {status} {task['title']}\n"
                return response.strip()
            else:
                return f"❌ {result.get('message', 'Failed to list tasks')}"
        
        elif intent == "complete_task":
            if result.get("status") == "completed":
                return result.get("message", "✅ Task completed")
            else:
                return f"❌ {result.get('message', 'Failed to complete task')}"
        
        elif intent == "delete_task":
            if result.get("status") == "deleted":
                return result.get("message", "🗑️ Task deleted")
            else:
                return f"❌ {result.get('message', 'Failed to delete task')}"
        
        elif intent == "unknown":
            return "🤔 I'm not sure what you want to do. Try:\n• 'Add task: buy milk'\n• 'Show my tasks'\n• 'Complete first task'\n• 'Delete last task'"
        
        return "❌ Something went wrong"
    
    @staticmethod
    def _generate_urdu_response(intent: str, result: dict) -> str:
        """Generate Urdu response"""
        
        if intent == "add_task":
            if result.get("status") == "success":
                title = result.get("title", "")
                return f"✅ کام شامل کیا گیا: {title}"
            else:
                return f"❌ کام شامل نہیں ہو سکا"
        
        elif intent == "list_tasks":
            if result.get("status") == "success":
                tasks = result.get("tasks", [])
                if not tasks:
                    return "📋 آپ کی فہرست خالی ہے۔"
                
                response = f"📋 آپ کے {len(tasks)} کام:\n\n"
                for i, task in enumerate(tasks, 1):
                    status = "✅" if task["completed"] else "⏳"
                    response += f"{i}. {status} {task['title']}\n"
                return response.strip()
            else:
                return f"❌ فہرست نہیں دکھائی جا سکی"
        
        elif intent == "complete_task":
            if result.get("status") == "completed":
                return f"✅ کام مکمل ہو گیا"
            else:
                return f"❌ کام مکمل نہیں ہو سکا"
        
        elif intent == "delete_task":
            if result.get("status") == "deleted":
                return f"🗑️ کام حذف ہو گیا"
            else:
                return f"❌ کام حذف نہیں ہو سکا"
        
        elif intent == "unknown":
            return "🤔 میں سمجھ نہیں سکا۔ کوشش کریں:\n• 'نیا کام: دودھ خریدنا'\n• 'میری فہرست دکھاؤ'\n• 'پہلا کام مکمل کرو'\n• 'آخری کام حذف کرو'"
        
        return "❌ کچھ غلط ہو گیا"


@router.post("/{user_id}", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    session: Session = Depends(get_session),
):
    """
    Stateless chat endpoint
    
    Handles natural language task management with conversation persistence
    """
    
    # Get or create conversation
    conversation_id = request.conversation_id
    
    if conversation_id is None:
        # Create new conversation
        conversation = Conversation(
            user_id=user_id,
            title="New Conversation",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        conversation_id = conversation.id
    else:
        # Verify conversation exists and belongs to user
        conversation = session.get(Conversation, conversation_id)
        if not conversation or conversation.user_id != user_id:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Update timestamp
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)
        session.commit()
    
    # Save user message
    user_message = Message(
        user_id=user_id,
        conversation_id=conversation_id,
        role="user",
        content=request.message,
        created_at=datetime.utcnow()
    )
    session.add(user_message)
    session.commit()
    session.refresh(user_message)
    
    # Process with Mock AI
    language = MockAI.detect_language(request.message)
    intent, params = MockAI.detect_intent(request.message, language)
    
    # Execute MCP tool
    tool_calls = []
    result = {}
    
    if intent == "add_task":
        result = mcp_tools.add_task(
            user_id, 
            params["title"],
            priority=params.get("priority", "medium"),
            due_date=params.get("due_date")
        )
        tool_calls = ["add_task"]
    
    elif intent == "list_tasks":
        result = mcp_tools.list_tasks(user_id, params.get("status", "all"))
        tool_calls = ["list_tasks"]
    
    elif intent == "complete_task":
        # Get task to complete
        tasks_result = mcp_tools.list_tasks(user_id, "pending")
        if tasks_result.get("status") == "success" and tasks_result.get("tasks"):
            tasks = tasks_result["tasks"]
            task_ref = params.get("task_ref", "first")
            
            if task_ref == "first":
                task_id = tasks[0]["task_id"]
            elif task_ref == "last":
                task_id = tasks[-1]["task_id"]
            else:
                task_id = tasks[0]["task_id"]
            
            result = mcp_tools.complete_task(user_id, task_id)
            tool_calls = ["list_tasks", "complete_task"]
        else:
            result = {"status": "error", "message": "No pending tasks found"}
    
    elif intent == "delete_task":
        # Get task to delete
        tasks_result = mcp_tools.list_tasks(user_id, "all")
        if tasks_result.get("status") == "success" and tasks_result.get("tasks"):
            tasks = tasks_result["tasks"]
            task_ref = params.get("task_ref", "first")
            
            if task_ref == "first":
                task_id = tasks[0]["task_id"]
            elif task_ref == "last":
                task_id = tasks[-1]["task_id"]
            else:
                task_id = tasks[0]["task_id"]
            
            result = mcp_tools.delete_task(user_id, task_id)
            tool_calls = ["list_tasks", "delete_task"]
        else:
            result = {"status": "error", "message": "No tasks found"}
    
    else:
        result = {"status": "unknown"}
    
    # Generate response
    response_text = MockAI.generate_response(intent, result, language)
    
    # Save assistant message
    assistant_message = Message(
        user_id=user_id,
        conversation_id=conversation_id,
        role="assistant",
        content=response_text,
        tool_calls=json.dumps(tool_calls) if tool_calls else None,
        created_at=datetime.utcnow()
    )
    session.add(assistant_message)
    session.commit()
    session.refresh(assistant_message)
    
    return ChatResponse(
        conversation_id=conversation_id,
        message_id=assistant_message.id,
        response=response_text,
        tool_calls=tool_calls if tool_calls else None
    )


@router.get("/{user_id}/conversations", response_model=List[ConversationRead])
async def list_conversations(
    user_id: str,
    session: Session = Depends(get_session),
):
    """List all conversations for a user"""
    statement = select(Conversation).where(
        Conversation.user_id == user_id
    ).order_by(Conversation.updated_at.desc())
    
    conversations = session.exec(statement).all()
    return conversations


@router.get("/{user_id}/conversations/{conversation_id}/messages", response_model=List[MessageRead])
async def get_conversation_messages(
    user_id: str,
    conversation_id: int,
    session: Session = Depends(get_session),
):
    """Get all messages in a conversation"""
    # Verify conversation belongs to user
    conversation = session.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != user_id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    statement = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at)
    
    messages = session.exec(statement).all()
    
    # Parse tool_calls JSON
    result = []
    for msg in messages:
        tool_calls_list = None
        if msg.tool_calls:
            try:
                tool_calls_list = json.loads(msg.tool_calls)
            except:
                pass
        
        result.append(MessageRead(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            tool_calls=tool_calls_list,
            created_at=msg.created_at
        ))
    
    return result
