# Phase III & IV: AI-Powered Todo Chatbot Specification

## 1. Project Overview

### 1.1 Objective
Build and deploy a cloud-native, stateless, AI-powered Todo chatbot that uses natural language to manage tasks, supports Urdu language and voice commands, and is deployed on Kubernetes (Minikube).

### 1.2 Technology Stack

**Frontend:**
- OpenAI ChatKit
- React/Next.js
- Web Speech API (voice input)

**Backend:**
- Python 3.11+
- FastAPI
- OpenAI Agents SDK
- Official MCP SDK
- SQLModel ORM
- Better Auth (existing)

**Database:**
- Neon Serverless PostgreSQL

**Deployment:**
- Docker
- Kubernetes (Minikube)
- Helm Charts

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ChatKit UI (Frontend)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Text Input   │  │ Voice Input  │  │ Urdu Support │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Stateless)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  POST /api/{user_id}/chat                            │  │
│  │  - Receive message                                   │  │
│  │  - Load conversation from DB                         │  │
│  │  - Invoke OpenAI Agent                               │  │
│  │  - Save conversation to DB                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                             │                                │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         OpenAI Agent (Runner)                        │  │
│  │  - Natural language understanding                    │  │
│  │  - Intent detection                                  │  │
│  │  - Tool selection & execution                        │  │
│  │  - Urdu language support                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                             │                                │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         MCP Server (Task Tools)                      │  │
│  │  - add_task                                          │  │
│  │  - list_tasks                                        │  │
│  │  - complete_task                                     │  │
│  │  - delete_task                                       │  │
│  │  - update_task                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ SQL
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Neon PostgreSQL Database                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Tasks     │  │Conversations │  │   Messages   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Stateless Design Principles

> [!IMPORTANT]
> The backend MUST be completely stateless:
> - No in-memory session storage
> - All conversation state persisted in database
> - Server can restart without data loss
> - Horizontal scaling ready

---

## 3. Database Schema

### 3.1 SQLModel Models

#### Task Model
```python
class Task(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = None
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

#### Conversation Model
```python
class Conversation(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

#### Message Model
```python
class Message(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    role: str = Field(max_length=20)  # "user" | "assistant" | "system"
    content: str
    tool_calls: Optional[str] = None  # JSON array of tool names
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## 4. API Specification

### 4.1 Chat Endpoint

**Endpoint:** `POST /api/{user_id}/chat`

**Request:**
```json
{
  "conversation_id": 1,
  "message": "Add a task to buy groceries"
}
```

**Response:**
```json
{
  "conversation_id": 1,
  "response": "✅ Task added: Buy groceries",
  "tool_calls": ["add_task"]
}
```

**Behavior:**
1. If `conversation_id` is null, create new conversation
2. Load conversation history from database
3. Append user message to history
4. Invoke OpenAI Agent with full history
5. Execute MCP tools as needed
6. Save assistant response to database
7. Return response with conversation_id

---

## 5. MCP Tool Specifications

### 5.1 add_task

**Description:** Add a new task for the user

**Inputs:**
- `user_id` (string, required): User identifier
- `title` (string, required): Task title
- `description` (string, optional): Task description

**Output:**
```json
{
  "task_id": "uuid",
  "status": "success",
  "title": "Buy groceries"
}
```

### 5.2 list_tasks

**Description:** List user's tasks

**Inputs:**
- `user_id` (string, required): User identifier
- `status` (string, optional): Filter by status ("all" | "pending" | "completed")

**Output:**
```json
{
  "tasks": [
    {
      "task_id": "uuid",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-22T10:00:00Z"
    }
  ]
}
```

### 5.3 complete_task

**Description:** Mark a task as completed

**Inputs:**
- `user_id` (string, required): User identifier
- `task_id` (string, required): Task identifier

**Output:**
```json
{
  "task_id": "uuid",
  "status": "completed",
  "title": "Buy groceries"
}
```

### 5.4 delete_task

**Description:** Delete a task

**Inputs:**
- `user_id` (string, required): User identifier
- `task_id` (string, required): Task identifier

**Output:**
```json
{
  "task_id": "uuid",
  "status": "deleted",
  "title": "Buy groceries"
}
```

### 5.5 update_task

**Description:** Update task details

**Inputs:**
- `user_id` (string, required): User identifier
- `task_id` (string, required): Task identifier
- `title` (string, optional): New title
- `description` (string, optional): New description

**Output:**
```json
{
  "task_id": "uuid",
  "status": "updated",
  "title": "Buy groceries and vegetables"
}
```

---

## 6. Agent Behavior Rules

### 6.1 Natural Language Understanding

The agent must:
- Detect user intent from natural language
- Support both English and Urdu
- Handle variations in phrasing
- Ask for clarification when ambiguous

**Examples:**
- "Add buy milk to my list" → `add_task`
- "میری فہرست دکھاؤ" → `list_tasks`
- "Mark groceries as done" → `complete_task`
- "کام مکمل کر دو" → `complete_task`

### 6.2 Tool Chaining

The agent should chain tools when needed:
- "Show my pending tasks and mark the first one complete"
  1. `list_tasks(status="pending")`
  2. `complete_task(task_id=first_task.id)`

### 6.3 Confirmation & Feedback

Always confirm actions:
- ✅ "Task added: Buy groceries"
- ✅ "Marked 'Buy groceries' as completed"
- ✅ "You have 3 pending tasks"

### 6.4 Error Handling

Gracefully handle errors:
- "Sorry, I couldn't find that task. Can you be more specific?"
- "معذرت، میں یہ کام نہیں ڈھونڈ سکا"

---

## 7. Language & Voice Support

### 7.1 Urdu Language Support

**Detection:**
- Automatically detect Urdu input
- Respond in the same language as user

**Common Phrases:**
- "نیا کام شامل کرو" → Add new task
- "میری فہرست دکھاؤ" → Show my list
- "کام مکمل کر دو" → Complete task
- "کام حذف کر دو" → Delete task

### 7.2 Voice Commands

**Implementation:**
- Use Web Speech API for speech-to-text
- Support both English and Urdu voice input
- Display transcription before sending

**Example Commands:**
- "Add task: Call doctor tomorrow"
- "کام شامل کرو: ڈاکٹر کو کال کرنا"

---

## 8. Phase IV: Kubernetes Deployment

### 8.1 Container Architecture

```
┌─────────────────────────────────────────────┐
│         Kubernetes Cluster (Minikube)       │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │  Frontend Pod                      │    │
│  │  - Next.js app                     │    │
│  │  - Port 3000                       │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │  Backend Pod                       │    │
│  │  - FastAPI app                     │    │
│  │  - OpenAI Agent                    │    │
│  │  - MCP Server                      │    │
│  │  - Port 8000                       │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │  Ingress Controller                │    │
│  │  - Route /api → Backend            │    │
│  │  - Route / → Frontend              │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│      Neon PostgreSQL (External)             │
└─────────────────────────────────────────────┘
```

### 8.2 Deployment Requirements

**Docker:**
- Multi-stage builds for optimization
- Health checks
- Non-root user
- Minimal base images

**Helm Charts:**
- Parameterized configurations
- Environment-specific values
- Secret management
- Resource limits

**Kubernetes Manifests:**
- Deployments
- Services
- ConfigMaps
- Secrets
- Ingress

---

## 9. Success Criteria

### 9.1 Functional Requirements
- ✅ Natural language task management
- ✅ Urdu language support
- ✅ Voice command support
- ✅ Stateless backend
- ✅ Conversation persistence
- ✅ All MCP tools working

### 9.2 Non-Functional Requirements
- ✅ Zero data loss on restart
- ✅ Production-ready code
- ✅ Error-free deployment
- ✅ Comprehensive documentation
- ✅ Kubernetes deployment working

### 9.3 Deliverables
- ✅ Complete source code
- ✅ Database migrations
- ✅ Docker images
- ✅ Helm charts
- ✅ Deployment guide
- ✅ README with setup instructions

---

## 10. Enhanced Features (Bonus)

### 10.1 Smart Task Suggestions
- AI suggests task priorities
- Deadline reminders
- Task categorization

### 10.2 Multi-Modal Input
- Image-based task creation (OCR)
- Location-based reminders

### 10.3 Analytics Dashboard
- Task completion trends
- Productivity insights
- Time tracking

### 10.4 Collaborative Features
- Share tasks with others
- Team task lists
- Real-time updates

---

## 11. Implementation Phases

### Phase III.1: Foundation (Week 1)
- Database setup
- MCP server implementation
- Basic chat endpoint

### Phase III.2: AI Integration (Week 1-2)
- OpenAI Agents SDK integration
- Natural language processing
- Urdu support

### Phase III.3: Frontend (Week 2)
- ChatKit UI
- Voice input
- Urdu interface

### Phase IV: Deployment (Week 3)
- Dockerization
- Kubernetes setup
- Production deployment

---

> [!NOTE]
> This specification follows the Agentic Dev Stack Workflow and is designed for implementation via Claude Code with Spec-Kit Plus.
