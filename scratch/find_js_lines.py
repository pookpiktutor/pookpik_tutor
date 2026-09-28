import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('Total lines in src/JavaScript.js:', len(lines))

for i, l in enumerate(lines):
    if 'function showCampPaymentModal' in l:
        print(f'showCampPaymentModal at line {i+1}')
    if 'function renderCampsTable' in l:
        print(f'renderCampsTable at line {i+1}')
    if 'function deleteCampStudent' in l:
        print(f'deleteCampStudent at line {i+1}')
