import urllib.request
url = 'https://pookpiktutor.github.io/pookpik_tutor/'
try:
    with urllib.request.urlopen(url) as response:
        html = response.read().decode('utf-8')
        print(html[-1500:]) # Print the last 1500 chars to see script tags
except Exception as e:
    print("Error:", e)
