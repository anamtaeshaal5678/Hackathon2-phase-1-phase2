"""
Manual Test Script for Chat Endpoint

Tests the AI chatbot functionality with various scenarios
"""

import requests
import json

BASE_URL = "http://localhost:8000"
USER_ID = "kwZ2P1FWYqFs4jgZ1r15b4B2zwKGeDyV"

def print_response(response):
    """Pretty print response"""
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f"Error: {response.text}")
    print("-" * 60)

def test_chat():
    """Test chat endpoint"""
    
    print("=" * 60)
    print("TESTING AI CHAT ENDPOINT")
    print("=" * 60)
    
    # Test 1: Add task (English)
    print("\n1. Test: Add task in English")
    response = requests.post(
        f"{BASE_URL}/chat/{USER_ID}",
        json={
            "conversation_id": None,
            "message": "Add task to buy groceries"
        }
    )
    print_response(response)
    conversation_id = response.json().get("conversation_id") if response.status_code == 200 else None
    
    # Test 2: List tasks (English)
    print("\n2. Test: List tasks in English")
    response = requests.post(
        f"{BASE_URL}/chat/{USER_ID}",
        json={
            "conversation_id": conversation_id,
            "message": "Show my tasks"
        }
    )
    print_response(response)
    
    # Test 3: Add task (Urdu)
    print("\n3. Test: Add task in Urdu")
    response = requests.post(
        f"{BASE_URL}/chat/{USER_ID}",
        json={
            "conversation_id": conversation_id,
            "message": "نیا کام: دودھ خریدنا"
        }
    )
    print_response(response)
    
    # Test 4: List tasks (Urdu)
    print("\n4. Test: List tasks in Urdu")
    response = requests.post(
        f"{BASE_URL}/chat/{USER_ID}",
        json={
            "conversation_id": conversation_id,
            "message": "میری فہرست دکھاؤ"
        }
    )
    print_response(response)
    
    # Test 5: Complete task
    print("\n5. Test: Complete first task")
    response = requests.post(
        f"{BASE_URL}/chat/{USER_ID}",
        json={
            "conversation_id": conversation_id,
            "message": "Complete the first task"
        }
    )
    print_response(response)
    
    # Test 6: List tasks again
    print("\n6. Test: List tasks after completion")
    response = requests.post(
        f"{BASE_URL}/chat/{USER_ID}",
        json={
            "conversation_id": conversation_id,
            "message": "Show my tasks"
        }
    )
    print_response(response)
    
    # Test 7: Delete task
    print("\n7. Test: Delete last task")
    response = requests.post(
        f"{BASE_URL}/chat/{USER_ID}",
        json={
            "conversation_id": conversation_id,
            "message": "Delete the last task"
        }
    )
    print_response(response)
    
    # Test 8: Get conversation history
    print("\n8. Test: Get conversation history")
    response = requests.get(
        f"{BASE_URL}/chat/{USER_ID}/conversations/{conversation_id}/messages"
    )
    print_response(response)
    
    print("\n" + "=" * 60)
    print("TESTS COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_chat()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to backend at http://localhost:8000")
        print("Make sure the backend is running: cd backend && uv run uvicorn main:app --reload --port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")
