# Step 3: Local Kubernetes Cluster Setup (Minikube)

# 1. Start Minikube with the docker driver
minikube start --driver=docker

# 2. Point your shell to Minikube's docker-env (to build images inside the cluster)
# For PowerShell:
# & minikube -p minikube docker-env --shell powershell | Invoke-Expression

# 3. Build optimized Docker images inside Minikube
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# 4. Verify nodes
kubectl get nodes

# Step 5: Deploy via Helm
helm install todo-backend ./k8s/helm/todo-backend
helm install todo-frontend ./k8s/helm/todo-frontend

# 5. Verify deployment
kubectl get pods
kubectl get services

# 6. Expose frontend to access via browser
minikube service todo-frontend
