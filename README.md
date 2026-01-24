# 🚀 Next-Gen AI Todo Chatbot - Evolution of Todo

A state-of-the-art, cloud-native, AI-powered task management system with natural language processing, multi-lingual support (Urdu), and voice commands. Built with a 100% Agentic Dev Stack workflow for the Hackathon.

## 🌟 Key Features
- **🤖 AI Command Center:** Manage tasks using natural language ("Remind me to buy milk").
- **🇵🇰 Urdu Support:** Full support for Urdu commands and responses ("کام مکمل کر دو").
- **🎙️ Voice Integration:** Hands-free task management via Web Speech API.
- **📊 Real-time Analytics:** Smart dashboard for productivity tracking.
- **☁️ Cloud-Native:** Fully dockerized and ready for Kubernetes deployment.
- **🛡️ Secure Auth:** Built-in authentication via Better Auth.

## 🏗️ Architecture
- **Frontend:** Next.js 16.1.1 (React 19)
- **Backend:** FastAPI (Python 3.11)
- **AI Engine:** Mock AI with Intent Detection & MCP Tooling
- **Database:** SQLite (Local) / Neon PostgreSQL (Production Ready)
- **Orchestration:** Docker, Helm, Minikube

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
uv sync
uv run uvicorn main:app --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## ☸️ Phase IV: Local Kubernetes Deployment
The project includes a spec-driven Kubernetes deployment strategy.
- **Infrastructure Spec:** `specs/infrastructure_spec.md`
- **Dockerization:** Optimized multi-stage Dockerfiles.
- **Helm Charts:** Located in `k8s/helm/`.
- **Deployment Script:** `scripts/deploy_k8s.ps1`.

## 🧠 Agentic Workflow Evidence
This project was built following the **Spec-Driven Agentic Workflow**:
1. **Write Spec:** Infrastructure and features defined in markdown.
2. **AI Action:** Agents implemented logic, fixed linting, and generated K8s manifests.
3. **No-Code Ops:** Docker and Helm files were generated via agentic prompts.

See [docs/PHASE_IV_AGENTIC_WORKFLOW.md](docs/PHASE_IV_AGENTIC_WORKFLOW.md) for full details.

## 📜 License
Hackathon Project 2026.
