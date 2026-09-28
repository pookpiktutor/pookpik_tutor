import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['register.html', 'src/register.html', 'Code.js', 'src/Code.js']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f'=== Searching {fname} ===')
    matches = [m.start() for m in re.finditer(r'doGet|doPost|google\.script\.run|exec|script\.google\.com', content)]
    print(f'Found {len(matches)} matches in {fname}')
    for m in matches[:5]:
        print(content[max(0, m-50):min(len(content), m+200)])
        print('-'*40)
