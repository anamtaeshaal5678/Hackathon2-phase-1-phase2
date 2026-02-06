import requests

URL = "https://hackathon2-phase-1-phase2-fcfs.vercel.app"

def check(endpoint):
    try:
        r = requests.get(f"{URL}{endpoint}")
        print(f"GET {endpoint}: {r.status_code}")
        print(f"Response: {r.text[:200]}...")
    except Exception as e:
        print(f"GET {endpoint} FAILED: {e}")

if __name__ == "__main__":
    check("/api/backend/health")
    check("/api/auth/session") # Check frontend auth health
