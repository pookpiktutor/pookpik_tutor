import sys

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'id="camps_table_body"' in l:
        print("=== index.html table head ===")
        print(''.join(lines[max(0, i-25):i+5]))
