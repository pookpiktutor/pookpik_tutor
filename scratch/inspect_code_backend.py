import sys

sys.stdout.reconfigure(encoding='utf-8')
with open('src/Code.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'searchStudentPayment' in l or 'confirmSearchPayment' in l or 'saveCampStudentData' in l or 'updateCampStudentData' in l:
        print(f'=== Line {i+1} ===')
        print(''.join(lines[i:min(i+35, len(lines))]))
