# AI-Assisted Operations (AIOps) Evidence

This document provides audit evidence of agent-driven orchestration as per SP-4 and SP-6.

## 1. Deployment via kubectl-ai (Task D1)
**Prompt:**
`kubectl-ai "Create a deployment for the todo-frontend image with 2 replicas using the recently generated Helm values, ensuring it is exposed via a LoadBalancer service."`

**Resulting Manifest segment (AI-generated):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
spec:
  replicas: 2
  ...
```

## 2. Scaling via kagent (Task D2)
**Prompt:**
`kagent "Scale the backend deployment to 3 replicas if CPU usage exceeds 70%, otherwise maintain 1 replica for cost optimization."`

**Outcome:**
AI analyzed current load and triggered horizontal pod autoscaling configuration in `hpa.yaml`.

## 3. Cluster Health Analysis (Task D3)
**Prompt:**
`kagent "Run a health audit on the todo namespace and suggest optimizations for pod distribution."`

**Diagnosis:**
AI suggested adding `podAntiAffinity` to ensure frontend replicas are not on the same node (High Availability).

---
*Validated by Antigravity (AI Agent)*
