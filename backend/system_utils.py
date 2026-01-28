def get_system_status_data():
    return {
        "cluster_name": "Minikube",
        "version": "v1.27.3",
        "status": "Ready",
        "pods": [
            { "name": "todo-backend-678d6778f7-j7jt", "ready": "1/1", "status": "Running", "restarts": 0, "age": "14d" },
            { "name": "todo-backend-678d6778f7-gibxj", "ready": "1/1", "status": "Running", "restarts": 0, "age": "14d" },
            { "name": "todo-frontend-5bc8c8d977-bsvzr", "ready": "1/1", "status": "Running", "restarts": 0, "age": "520s" },
            { "name": "todo-frontend-5bc8c8d977-iftzh", "ready": "1/1", "status": "Running", "restarts": 0, "age": "14d" },
        ],
        "services": [
            "Todo Backend (Public)",
            "Backend Deployment (Helm)"
        ]
    }
