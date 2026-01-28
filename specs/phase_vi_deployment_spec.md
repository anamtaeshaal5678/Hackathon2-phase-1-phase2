# Phase VI Specification: Cloud Deployment & Advanced Orchestration

## 1. Objective
Deploy the AI-Powered Todo Chatbot to a production-grade Kubernetes environment with full Dapr integration, Kafka backing for reliable event streams, and comprehensive observability.

## 2. Infrastructure Architecture
- **Cluster**: Kubernetes (v1.25+)
- **Service Mesh / Runtime**: Dapr v1.10+
- **Message Broker**:
  - **Primary**: Redis (Development/Simple Production)
  - **Advanced**: Kafka (High throughput events)
  - *Spec Decision*: Use Redis for State Store and Pub/Sub initially, with Helm option to switch to Kafka.
- **Database**:
  - **Primary**: PostgreSQL (replacing SQLite for stateless pods).
- **Ingress**: NGINX Ingress Controller.

## 3. Deployment Artifacts (Helm)
### Backend Chart (`charts/todo-backend`)
- **Dapr Annotations**: `dapr.io/enabled: "true"`, `dapr.io/app-id: "todo-backend"`.
- **Config**: Externalize DB credentials and API keys via Secrets.
- **Probes**: Liveness/Readiness pointing to `/health`.

### Frontend Chart (`charts/todo-frontend`)
- **Type**: Deployment.
- **Env**: `NEXT_PUBLIC_API_URL` must point to Ingress or Dapr Sidecar.

## 4. CI/CD Pipeline (GitHub Actions)
- **Build**: Docker build & push (GHCR.io).
- **Test**: Run `pytest` and `npm test`.
- **Lint**: `helm lint`.
- **Deploy**: Update GitOps repo (simulated via file update).

## 5. Observability (Optional for MVP)
- **Tracing**: Zipkin (Dapr default).
- **Metrics**: Prometheus scraper.

## 6. Success Criteria
- [ ] Helm charts validate (`helm lint`).
- [ ] Dockerfiles are production-optimized.
- [ ] Dapr components (State/PubSub) are defined in K8s manifests.
- [ ] CI/CD workflow defined in `.github/workflows/phase_vi_deploy.yml`.
