import urllib.request
url = 'https://pookpiktutor.github.io/pookpik_tutor/src/JavaScript.js'
try:
    with urllib.request.urlopen(url) as response:
        js = response.read().decode('utf-8')
        with open('downloaded_js.txt', 'w', encoding='utf-8') as f:
            f.write(js)
        print("Downloaded!")
except Exception as e:
    print("Error:", e)
