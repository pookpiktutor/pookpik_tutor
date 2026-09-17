import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://script.google.com/macros/s/AKfycbzK7sEShW6AGBqweRt20rpI8V8fyrJC3Dlv3uVwVFlhJvcJ2ciJmRXHXc05tL7Ft_5z/exec?action=getEvaluationsList&role=parent"

req = urllib.request.Request(url)
with urllib.request.urlopen(req, context=ctx) as response:
    data = json.loads(response.read().decode('utf-8'))

with open('api_dump.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
