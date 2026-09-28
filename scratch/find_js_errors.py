import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("=== src/JavaScript.js around 36950 ===")
for i in range(36940, min(len(lines), 36970)):
    print(f'{i+1}: {repr(lines[i])}')

with open('JavaScript.js', 'r', encoding='utf-8') as f:
    lines2 = f.readlines()

print("=== JavaScript.js around 5980 ===")
for i in range(5970, min(len(lines2), 6000)):
    print(f'{i+1}: {repr(lines2[i])}')
