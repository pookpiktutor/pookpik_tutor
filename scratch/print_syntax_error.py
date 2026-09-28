import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/bad_script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Line count of bad_script.js:", len(lines))
for i in range(max(0, len(lines)-40), len(lines)):
    print(f'{i+1}: {lines[i]}', end='')
