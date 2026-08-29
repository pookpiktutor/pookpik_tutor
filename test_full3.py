import requests
url = "https://script.google.com/macros/s/AKfycbynoDYcenMy9LpNnclnJr4eAwMapcfvP1DyepgmVVo1YB6lL3pMiqkhcp64uoniRAMhcw/exec?setupIframe=true"
res = requests.get(url, allow_redirects=True)
print("Status:", res.status_code)
print("Content:", res.text[-1000:])
