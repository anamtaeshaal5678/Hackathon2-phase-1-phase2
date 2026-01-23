import urllib.request
import json

def test_endpoint(url, session_token):
    print(f"Testing {url}...")
    req = urllib.request.Request(url)
    req.add_header('Cookie', f'better-auth.session_token={session_token}')
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode()
            print(f"Status: {status}")
            print(f"Body: {body[:100]}...")
            return True
    except Exception as e:
        print(f"Error: {e}")
        return False

token = "sTUvrD5Cbk8ifnkaSbuwZ1Vfa0u6ivu5.Ijv87DbBoRKL8a%2FnTsIEvOiBsMLmBgEK38Qir0whw%2BU%3D"
test_endpoint("http://127.0.0.1:8000/todos", token)
test_endpoint("http://127.0.0.1:8000/todos/stats", token)
