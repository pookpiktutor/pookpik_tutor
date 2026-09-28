import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('src/Code.js', 'r', encoding='utf-8') as f:
    content = f.read()

matches = [m.start() for m in re.finditer(r'StatusDB', content)]
print("StatusDB matches:", len(matches))
for m in matches[:5]:
    print(content[m:m+300])
    print('='*50)
