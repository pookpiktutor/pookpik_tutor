import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://script.google.com/macros/s/AKfycbzK7sEShW6AGBqweRt20rpI8V8fyrJC3Dlv3uVwVFlhJvcJ2ciJmRXHXc05tL7Ft_5z/exec?action=getEvaluationsList&role=parent"

req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode('utf-8'))

    evals = data.get("evaluations", [])
    if not evals and isinstance(data, list):
        evals = data

    target_name = "กลุ่มย่อยอังกฤษ ธัญญ่า นิว ไอคิว"
    for e in evals:
        if target_name in e.get("studentName", ""):
            print("Found record:")
            for k, v in e.items():
                print(f"  {k}: {v}")
except Exception as e:
    print(f"Error fetching API: {e}")
