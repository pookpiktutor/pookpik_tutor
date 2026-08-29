import requests
url = "https://script.google.com/macros/s/AKfycbx7ygAe9rz6F-en4uKsmsVkbHJZMZrNjnucMoGFrpAElhHl5zI7v9_wuYWs7AyWHutcFg/exec"
res = requests.options(url)
print("Status:", res.status_code)
print("Headers:", res.headers)
print("Text:", res.text[:200])
