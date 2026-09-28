import sys

sys.stdout.reconfigure(encoding='utf-8')
with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(''.join(lines[36820:37504]))
