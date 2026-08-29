import requests
url = "https://script.google.com/macros/s/AKfycbx7ygAe9rz6F-en4uKsmsVkbHJZMZrNjnucMoGFrpAElhHl5zI7v9_wuYWs7AyWHutcFg/exec?setupIframe=true"
res = requests.get(url, allow_redirects=True)
print("Content end:", res.text[-1000:])
