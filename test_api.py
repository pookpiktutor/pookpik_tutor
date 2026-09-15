import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://script.google.com/macros/s/AKfycbyYjh5-6frv-AytBYl1EnWB46Vh5_VCkVVRg6XsU4A-KUJoR8nFh46XZ-ffvbtwiZHhhA/exec?action=getTeacherCoursesAndStudents&logUser=tutor_0001"

try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, context=ctx) as response:
        data = response.read().decode('utf-8')
        try:
            parsed = json.loads(data)
            print("Response:", json.dumps(parsed, indent=2, ensure_ascii=False))
        except Exception as e:
            print("Failed to parse JSON. Raw response:")
            print(data)
except Exception as e:
    print("Request failed:", e)
