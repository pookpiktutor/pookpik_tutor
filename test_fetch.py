import requests
import json

url = "https://script.google.com/macros/s/AKfycbx7ygAe9rz6F-en4uKsmsVkbHJZMZrNjnucMoGFrpAElhHl5zI7v9_wuYWs7AyWHutcFg/exec"
data = {"functionName": "verifyLogin", "arguments": ["test", "test"]}

headers = {"Content-Type": "text/plain"}
try:
    res = requests.post(url, data=json.dumps(data), headers=headers)
    print("Text POST Status:", res.status_code)
    print("Text POST Headers:", res.headers)
    print("Text POST Text:", res.text[:200])
except Exception as e:
    print("Text POST Error:", e)

