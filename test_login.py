import urllib.request
import urllib.parse
import json

url = 'https://script.google.com/macros/s/AKfycbyYjh5-6frv-AytBYl1EnWB46Vh5_VCkVVRg6XsU4A-KUJoR8nFh46XZ-ffvbtwiZHhhA/exec'

data = {
    'func': 'verifyLogin',
    'args': json.dumps(['ผจก.พัช', 'พัช1234']) # Assuming this might be the password, or just anything to see the error
}

data_encoded = urllib.parse.urlencode(data).encode('utf-8')

req = urllib.request.Request(url, data=data_encoded, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Error Response:", e.read().decode('utf-8'))
