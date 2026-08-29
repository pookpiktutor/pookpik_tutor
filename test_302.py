import requests
import json

url = "https://script.google.com/macros/s/AKfycbx7ygAe9rz6F-en4uKsmsVkbHJZMZrNjnucMoGFrpAElhHl5zI7v9_wuYWs7AyWHutcFg/exec"
data = {"functionName": "verifyLogin", "arguments": ["test", "test"]}

headers = {"Content-Type": "text/plain"}
res = requests.post(url, data=json.dumps(data), headers=headers, allow_redirects=False)
print("302 Status:", res.status_code)
print("302 Headers:", res.headers)
print("302 Location:", res.headers.get("Location"))
