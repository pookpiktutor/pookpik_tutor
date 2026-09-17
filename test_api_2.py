import urllib.request
import json

url = "https://script.google.com/macros/s/AKfycbyZHKlu_c263M9DdjpWlHpSDp5I5pjfu0IH3YglrfK6b8FhHse88DJ6QZRSp9-Qps2jnQ/exec?action=getEvaluationsList&role=parent"

req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as response:
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
