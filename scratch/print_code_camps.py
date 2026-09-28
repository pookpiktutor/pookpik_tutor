import sys

sys.stdout.reconfigure(encoding='utf-8')
with open('src/Code.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(''.join(lines[17750:18337]))
