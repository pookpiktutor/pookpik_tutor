import sys

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['src/JavaScript.js', 'index.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i, l in enumerate(lines):
        if 'defaultFull' in l or '7900' in l:
            print(f'=== {fname}:{i+1} ===')
            print(''.join(lines[max(0, i-5):min(len(lines), i+10)]))
