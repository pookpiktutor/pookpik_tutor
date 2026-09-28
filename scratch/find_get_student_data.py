import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('src/Code.js', 'r', encoding='utf-8') as f:
    content = f.read()

matches = [m.start() for m in re.finditer(r'getStudentData', content)]
print("Found getStudentData matches:", len(matches))
for m in matches:
    print(content[m:m+500])
    print('='*50)
