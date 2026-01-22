# Phase III & IV Implementation Plan

## Overview
This plan outlines the implementation of an AI-powered Todo chatbot with natural language processing, Urdu support, voice commands, and Kubernetes deployment.

---

## User Review Required

> [!IMPORTANT]
> **Database Migration Strategy**
> 
> We need to migrate from SQLite to Neon PostgreSQL. This requires:
> - Setting up Neon account and database
> - Exporting existing data from SQLite
> - Updating connection strings
> - Testing data migration
> 
> **Question:** Do you already have a Neon PostgreSQL account, or should I guide you through setup?

> [!IMPORTANT]
> **OpenAI API Key Required**
> 
> The chatbot requires OpenAI API access for:
> - GPT-4 for natural language understanding
> - Agents SDK for tool orchestration
> 
> **Question:** Do you have an OpenAI API key with Agents SDK access?

> [!WARNING]
> **Breaking Changes**
> 
> - Current `/todos` REST API will remain for backward compatibility
> - New `/api/{user_id}/chat` endpoint will be added
> - Frontend will be completely replaced with ChatKit UI
> - Database schema will be extended (existing tables preserved)

---

## Proposed Changes

### Database Layer

#### [NEW] [migrations/001_add_chat_tables.sql](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/migrations/001_add_chat_tables.sql)

Create new tables for conversation management:
- `conversation` table for chat sessions
- `message` table for chat history
- Indexes for performance

#### [MODIFY] [backend/database.py](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/backend/database.py)

Update database connection to use Neon PostgreSQL:
- Replace SQLite connection string
- Add PostgreSQL-specific configurations
- Update connection pooling

#### [MODIFY] [backend/models.py](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/backend/models.py)

Add new SQLModel classes:
- `Conversation` model
- `Message` model
- Keep existing `Task`, `User`, `Session` models

---

### MCP Server Implementation

#### [NEW] [backend/mcp_server.py](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/backend/mcp_server.py)

Implement MCP server with task management tools:
- `add_task` - Create new task
- `list_tasks` - List tasks with filtering
- `complete_task` - Mark task complete
- `delete_task` - Remove task
- `update_task` - Update task details

Each tool will:
- Accept `user_id` for multi-tenancy
- Validate inputs
- Execute database operations
- Return structured responses

---

### Backend API Layer

#### [NEW] [backend/routers/chat.py](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/backend/routers/chat.py)

Implement stateless chat endpoint:
- `POST /api/{user_id}/chat` - Main chat endpoint
- Load conversation history from DB
- Invoke OpenAI Agent with MCP tools
- Save messages to DB
- Return AI response

Features:
- Automatic conversation creation
- Full conversation history loading
- Tool call tracking
- Urdu language detection and response

#### [NEW] [backend/agent.py](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/backend/agent.py)

OpenAI Agent configuration:
- Initialize Agents SDK
- Configure MCP tool integration
- Set up system prompts for Urdu support
- Implement conversation state management

#### [MODIFY] [backend/main.py](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/backend/main.py)

Add chat router:
- Include new chat router
- Keep existing todos router for compatibility
- Update CORS for new endpoints

#### [NEW] [backend/.env.example](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/backend/.env.example)

Add new environment variables:
- `OPENAI_API_KEY`
- `DATABASE_URL` (Neon PostgreSQL)
- `MCP_SERVER_URL`

---

### Frontend Layer

#### [NEW] [frontend-chat/](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/frontend-chat/)

New Next.js application with OpenAI ChatKit:
- ChatKit UI components
- Text input interface
- Voice input using Web Speech API
- Urdu language toggle
- Conversation management
- Real-time message streaming

Structure:
```
frontend-chat/
├── app/
│   ├── page.tsx           # Main chat interface
│   ├── layout.tsx         # Root layout
│   └── api/
│       └── chat/
│           └── route.ts   # Proxy to backend
├── components/
│   ├── ChatInterface.tsx  # Main chat component
│   ├── VoiceInput.tsx     # Voice recording
│   └── LanguageToggle.tsx # English/Urdu switch
├── lib/
│   ├── chatkit.ts         # ChatKit configuration
│   └── api.ts             # API client
└── package.json
```

#### [MODIFY] [frontend/next.config.ts](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/frontend/next.config.ts)

Keep existing frontend for backward compatibility, or migrate completely (user preference).

---

### Containerization

#### [NEW] [backend/Dockerfile](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/backend/Dockerfile)

Multi-stage Docker build:
- Stage 1: Build dependencies with uv
- Stage 2: Production image
- Health checks
- Non-root user
- Optimized layers

#### [NEW] [frontend-chat/Dockerfile](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/frontend-chat/Dockerfile)

Next.js production build:
- Multi-stage build
- Standalone output
- Minimal image size
- Health checks

#### [NEW] [docker-compose.yml](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/docker-compose.yml)

Local development setup:
- Backend service
- Frontend service
- Environment configuration
- Volume mounts for development

---

### Kubernetes Deployment

#### [NEW] [k8s/helm/todo-chatbot/](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/k8s/helm/todo-chatbot/)

Helm chart structure:
```
todo-chatbot/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-prod.yaml
└── templates/
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── ingress.yaml
    ├── configmap.yaml
    └── secret.yaml
```

Features:
- Parameterized configurations
- Resource limits and requests
- Liveness and readiness probes
- Horizontal Pod Autoscaling
- Secret management

#### [NEW] [k8s/manifests/](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/k8s/manifests/)

Raw Kubernetes manifests for reference:
- Deployments
- Services
- ConfigMaps
- Secrets
- Ingress

---

### Documentation

#### [NEW] [docs/DEPLOYMENT.md](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/docs/DEPLOYMENT.md)

Comprehensive deployment guide:
- Prerequisites (Docker, Minikube, kubectl, Helm)
- Local development setup
- Docker build instructions
- Minikube deployment steps
- kubectl-ai command examples
- kagent usage examples
- Troubleshooting guide

#### [NEW] [docs/API.md](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/docs/API.md)

API documentation:
- Chat endpoint specification
- MCP tool documentation
- Request/response examples
- Error handling
- Rate limiting

#### [MODIFY] [README.md](file:///c:/Users/LAPTOP%20LAB/Desktop/Hackathon%202/README.md)

Update main README:
- Phase III & IV overview
- Quick start guide
- Architecture diagram
- Feature list
- Links to detailed docs

---

## Verification Plan

### Automated Tests

#### 1. MCP Server Tests
**File:** `backend/tests/test_mcp_server.py`

Test all MCP tools:
```python
def test_add_task()
def test_list_tasks()
def test_complete_task()
def test_delete_task()
def test_update_task()
```

**Run command:**
```bash
cd backend
uv run pytest tests/test_mcp_server.py -v
```

#### 2. Chat Endpoint Tests
**File:** `backend/tests/test_chat.py`

Test chat functionality:
```python
def test_create_conversation()
def test_send_message()
def test_conversation_persistence()
def test_urdu_support()
```

**Run command:**
```bash
cd backend
uv run pytest tests/test_chat.py -v
```

#### 3. Database Migration Tests
**File:** `backend/tests/test_migrations.py`

Verify database schema:
```python
def test_conversation_table_exists()
def test_message_table_exists()
def test_foreign_keys()
```

**Run command:**
```bash
cd backend
uv run pytest tests/test_migrations.py -v
```

---

### Manual Verification

#### 1. Local Development Testing

**Prerequisites:**
- Neon PostgreSQL database created
- OpenAI API key configured
- Backend and frontend running

**Steps:**
1. Start backend: `cd backend && uv run uvicorn main:app --reload --port 8000`
2. Start frontend: `cd frontend-chat && npm run dev`
3. Open browser: `http://localhost:3000`
4. Test scenarios:
   - Send English message: "Add task to buy groceries"
   - Verify task appears in database
   - Send Urdu message: "میری فہرست دکھاؤ"
   - Verify Urdu response
   - Test voice input (click microphone icon)
   - Verify conversation persists after page refresh

**Expected Results:**
- ✅ Tasks created via chat appear in database
- ✅ Urdu messages receive Urdu responses
- ✅ Voice input transcribes correctly
- ✅ Conversation history loads on refresh

#### 2. Docker Build Testing

**Steps:**
1. Build backend: `docker build -t todo-backend:latest ./backend`
2. Build frontend: `docker build -t todo-frontend:latest ./frontend-chat`
3. Run with docker-compose: `docker-compose up`
4. Test at `http://localhost:3000`

**Expected Results:**
- ✅ Both containers build successfully
- ✅ Application works same as local dev
- ✅ Containers restart without data loss

#### 3. Kubernetes Deployment Testing

**Prerequisites:**
- Minikube installed and running
- Helm installed
- Docker images built

**Steps:**
1. Start Minikube: `minikube start`
2. Load images: `minikube image load todo-backend:latest todo-frontend:latest`
3. Deploy with Helm: `helm install todo-chatbot ./k8s/helm/todo-chatbot`
4. Port forward: `kubectl port-forward svc/frontend 3000:3000`
5. Test at `http://localhost:3000`

**Expected Results:**
- ✅ All pods running: `kubectl get pods`
- ✅ Services accessible: `kubectl get svc`
- ✅ Application functional
- ✅ Logs show no errors: `kubectl logs -l app=backend`

#### 4. kubectl-ai Command Examples

Test AI-assisted Kubernetes operations:

```bash
# Check deployment status
kubectl-ai "show me the status of all todo chatbot pods"

# Scale deployment
kubectl-ai "scale the backend deployment to 3 replicas"

# Check logs
kubectl-ai "show me the last 50 lines of backend logs"

# Troubleshoot
kubectl-ai "why is my frontend pod not starting?"
```

#### 5. kagent Usage Examples

Test agent-based deployment:

```bash
# Deploy application
kagent "deploy the todo chatbot to minikube"

# Update configuration
kagent "update the backend environment variable OPENAI_API_KEY"

# Monitor health
kagent "check if all services are healthy"
```

---

### User Acceptance Testing

**Scenarios to test with real users:**

1. **English Task Management**
   - "Add a task to call mom tomorrow"
   - "Show me all my tasks"
   - "Mark the first task as complete"
   - "Delete the task about calling mom"

2. **Urdu Task Management**
   - "نیا کام شامل کرو: دودھ خریدنا"
   - "میری تمام فہرست دکھاؤ"
   - "پہلا کام مکمل کر دو"
   - "یہ کام حذف کر دو"

3. **Voice Commands**
   - Click microphone, say: "Add task buy groceries"
   - Click microphone, say in Urdu: "میری فہرست دکھاؤ"

4. **Stateless Verification**
   - Create conversation
   - Restart backend pod: `kubectl rollout restart deployment/backend`
   - Refresh page
   - Verify conversation history still loads

---

## Implementation Order

### Phase 1: Database & MCP (Days 1-2)
1. Set up Neon PostgreSQL
2. Create database migrations
3. Update models
4. Implement MCP server
5. Write MCP tests

### Phase 2: Backend AI Integration (Days 3-4)
6. Integrate OpenAI Agents SDK
7. Implement chat endpoint
8. Add Urdu language support
9. Write chat tests

### Phase 3: Frontend (Days 5-6)
10. Set up ChatKit UI
11. Implement text chat
12. Add voice input
13. Add Urdu toggle

### Phase 4: Containerization (Day 7)
14. Create Dockerfiles
15. Test Docker builds
16. Create docker-compose

### Phase 5: Kubernetes (Days 8-9)
17. Create Helm charts
18. Create K8s manifests
19. Test Minikube deployment
20. Document kubectl-ai/kagent usage

### Phase 6: Documentation & Polish (Day 10)
21. Write deployment guide
22. Update README
23. Create API docs
24. Final testing

---

## Risk Mitigation

### Risk 1: OpenAI API Costs
**Mitigation:** 
- Implement request rate limiting
- Add token usage monitoring
- Use GPT-3.5-turbo for development

### Risk 2: Neon PostgreSQL Connection
**Mitigation:**
- Implement connection pooling
- Add retry logic
- Test connection failures

### Risk 3: Kubernetes Complexity
**Mitigation:**
- Start with simple manifests
- Use Helm for parameterization
- Document every step

### Risk 4: Urdu Language Quality
**Mitigation:**
- Test with native Urdu speakers
- Fine-tune system prompts
- Provide fallback to English

---

## Success Metrics

- ✅ All MCP tools working correctly
- ✅ Chat endpoint responds in <2 seconds
- ✅ Urdu responses are grammatically correct
- ✅ Voice input accuracy >90%
- ✅ Zero data loss on pod restart
- ✅ Successful Kubernetes deployment
- ✅ All tests passing
- ✅ Documentation complete

---

> [!NOTE]
> This implementation plan follows the Agentic Dev Stack Workflow and is designed for step-by-step execution via Claude Code.
