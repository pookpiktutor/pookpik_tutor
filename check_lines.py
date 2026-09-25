with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if 'src="src/JavaScript.js' in l:
        print('src/JavaScript.js loaded at line:', i)
    if 'function switchRevenueSubTab' in l:
        print('switchRevenueSubTab defined at line:', i)
