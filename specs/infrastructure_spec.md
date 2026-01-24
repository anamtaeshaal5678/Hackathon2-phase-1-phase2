# Infrastructure Specification: Todo Chatbot System

## Overview
This specification defines the infrastructure requirements for the Phase IV Kubernetes deployment of the AI-powered Todo Chatbot.

## Services

### 1. Frontend Service (Todo UI)
- **Technology:** Next.js 16.1.1
- **Deployment Type:** Kubernetes Deployment
- **Replicas:** 2 (High Availability)
- **Containerization:** Production-optimized Dockerfile (multi-stage)
- **Port:** 3000
- **Environment Variables:**
  - `BACKEND_URL`: `http://todo-backend-service:80` (Internal Cluster Communication)
- **Service Type:** LoadBalancer (External Access via Minikube)

### 2. Backend Service (Todo API)
- **Technology:** FastAPI with uvicorn
- **Deployment Type:** Kubernetes Deployment
- **Replicas:** 1
- **Containerization:** Optimized Dockerfile using `uv`
- **Port:** 8000
- **Environment Variables:**
  - `DATABASE_URL`: `sqlite:///../todo.db` (Persistent volume mount)
- **Service Type:** ClusterIP (Internal Access Only)

## Persistence
- **Storage:** HostPath or PersistentVolume for the SQLite `todo.db` file to ensure data persistence across pod restarts.

## Platform Requirements
- **Local Cluster:** Minikube (Docker driver)
- **Package Manager:** Helm v3
- **Automation:** 100% Agent-generated manifests (no manual coding)
