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

    print(f"Total evaluations: {len(evals)}")

    target_name = "กลุ่มย่อยอังกฤษ ธัญญ่า นิว ไอคิว"
    found = []
    for e in evals:
        name = e.get("studentName", "")
        if target_name in name:
            found.append(e)

    print(f"Found {len(found)} evaluations for {target_name}")
    for f in found:
        print(f" - Published: {f.get('published')}, Course: {f.get('courseName')}")
except Exception as e:
    print(f"Error fetching API: {e}")
