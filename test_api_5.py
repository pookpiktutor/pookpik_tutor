import json
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://script.google.com/macros/s/AKfycbzK7sEShW6AGBqweRt20rpI8V8fyrJC3Dlv3uVwVFlhJvcJ2ciJmRXHXc05tL7Ft_5z/exec?action=getEvaluationsList&role=parent"
req = urllib.request.Request(url)
with urllib.request.urlopen(req, context=ctx) as response:
    data = json.loads(response.read().decode('utf-8'))

evals = data.get("evaluations", [])
if not evals and isinstance(data, list):
    evals = data

target_name = "กลุ่มย่อยอังกฤษ ธัญญ่า นิว ไอคิว"

for e in evals:
    s_name = e.get("studentName", "")
    if target_name in s_name:
        print("Name in DB: " + s_name.encode('utf-8').decode('utf-8'))
        
        # Test cleanNick logic
        clean_db = s_name.replace(" ", "").replace("\t", "").replace("\n", "").lower()
        query = "กลุ่มย่อยอังกฤษ ธัญญ่า นิว ไอคิว ม."
        clean_query = query.replace(" ", "").replace("\t", "").replace("\n", "").lower()
        
        print("clean_db: " + clean_db)
        print("clean_query: " + clean_query)
        print("Match?", clean_db in clean_query or clean_query in clean_db)

