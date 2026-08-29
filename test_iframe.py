import requests
url = "https://script.google.com/macros/s/AKfycbx2e1un3cMZfUfmddPILkATSLhC4-qr-gIxsPxhbTk48p84w7M9a6lN7qnWwQSBZQTplg/exec?setupIframe=true"
res = requests.get(url, allow_redirects=True)
print("Status:", res.status_code)
print("Text:", res.text)
