import requests

url = "http://127.0.0.1:8000/todos"
cookies = {
    "better-auth.session_token": "sTUvrD5Cbk8ifnkaSbuwZ1Vfa0u6ivu5.Ijv87DbBoRKL8a%2FnTsIEvOiBsMLmBgEK38Qir0whw%2BU%3D"
}

print(f"Testing {url}...")
try:
    response = requests.get(url, cookies=cookies)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

url_stats = "http://127.0.0.1:8000/todos/stats"
print(f"\nTesting {url_stats}...")
try:
    response = requests.get(url_stats, cookies=cookies)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
