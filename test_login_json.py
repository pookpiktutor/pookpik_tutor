import urllib.request
import json

url = 'https://script.google.com/macros/s/AKfycbyYjh5-6frv-AytBYl1EnWB46Vh5_VCkVVRg6XsU4A-KUJoR8nFh46XZ-ffvbtwiZHhhA/exec'

data = {
    'functionName': 'verifyLogin',
    'arguments': ['ผจก.พัช', 'พัช1234']
}

data_json = json.dumps(data).encode('utf-8')

req = urllib.request.Request(url, data=data_json, method='POST')
req.add_header('Content-Type', 'text/plain;charset=utf-8')

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Error Response:", e.read().decode('utf-8'))
