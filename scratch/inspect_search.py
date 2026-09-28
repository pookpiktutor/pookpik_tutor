import sys

sys.stdout.reconfigure(encoding='utf-8')
with open('src/Code.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'searchStudentPayment' in l:
        print(''.join(lines[i:min(i+90, len(lines))]))
