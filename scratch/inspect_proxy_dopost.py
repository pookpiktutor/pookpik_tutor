import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('register.html', 'r', encoding='utf-8') as f:
    content = f.read()

m1 = content.find('const GAS_API_URL')
if m1 != -1:
    print('=== Proxy in register.html ===')
    print(content[m1:m1+1200])

with open('src/Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

m2 = code.find('function doPost(e)')
if m2 != -1:
    print('=== doPost in src/Code.js ===')
    print(code[m2:m2+1000])
