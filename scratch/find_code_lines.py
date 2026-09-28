import sys

sys.stdout.reconfigure(encoding='utf-8')
with open('src/Code.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('Total lines in src/Code.js:', len(lines))

for i, l in enumerate(lines):
    if 'function saveCampStudentData' in l:
        print(f'saveCampStudentData starts at line {i+1}')
    if 'function searchStudentPayment' in l:
        print(f'searchStudentPayment starts at line {i+1}')
    if 'function submitPaymentSlipSearch' in l:
        print(f'submitPaymentSlipSearch starts at line {i+1}')
