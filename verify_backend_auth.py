import requests

url = "http://localhost:8000/todos/"
# The cookie value from the logs which includes the signature
cookie_value = "5IEC7T5zr880EJvNIyNcTyCYScxGVeHb.%2BU7l3pzve0R98e%2BeAg4Tlh16JAD1raEhkACwBGvpY9s%3D"
cookies = {"better-auth.session_token": cookie_value}

print(f"Testing access to {url} with signed cookie...")
try:
    response = requests.get(url, cookies=cookies)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✓ SUCCESS: Backend accepted the signed cookie!")
    else:
        print("✗ FAILURE: Backend rejected the cookie.")

except Exception as e:
    print(f"Error: {e}")
