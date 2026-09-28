import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('JavaScript.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("=== JavaScript.js lines 5950 to 6000 ===")
print(''.join(lines[5950:6000]))
