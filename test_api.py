import urllib.request
import json
import base64

url = "https://script.google.com/macros/s/AKfycbxrKH1GK2xCGhw_CVzxU8cuh9Zqtn7kJrCis2mJ1N7-L3OUHXMGEhtz6dDapqEYh_drjQ/exec?action=getEvaluationsList&role=parent"

req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode('utf-8'))

evals = data.get("evaluations", [])
if not evals and isinstance(data, list):
    evals = data

print(f"Total evaluations: {len(evals)}")

target_name = "ณัฐนรี รัศมีแก้ว"
found = []
for e in evals:
    name = e.get("studentName", "")
    if target_name in name:
        found.append(e)

print(f"Found {len(found)} evaluations for {target_name}")
for f in found:
    print(f" - Published: {f.get('published')}, Course: {f.get('courseName')}")
