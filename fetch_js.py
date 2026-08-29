import urllib.request
url = 'https://pookpiktutor.github.io/pookpik_tutor/src/JavaScript.js'
try:
    with urllib.request.urlopen(url) as response:
        js = response.read().decode('utf-8')
        print("Length of JS:", len(js))
        print(js[-1000:])
except Exception as e:
    print("Error:", e)
