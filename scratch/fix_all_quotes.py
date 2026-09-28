import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(37200, min(len(lines), 37240)):
    if 'onclick' in lines[i]:
        print(f'{i+1}: {repr(lines[i])}')
        # Fix string quotes cleanly
        if 'showCampPaymentModal' in lines[i]:
            lines[i] = "        html += \"<td><button class='btn btn-sm btn-warning' style='font-size:0.75rem; padding: 3px 8px; font-weight:600;' onclick=\\\"showCampPaymentModal('\" + escTs + \"')\\\">🪙 จัดการ</button></td>\";\n"
        elif 'confirmCampStatus' in lines[i]:
            lines[i] = "          html += \"<button class='btn btn-sm btn-success' style='font-size:0.75rem; padding: 3px 8px;' onclick=\\\"confirmCampStatus('\" + escTs + \"')\\\">กดยืนยัน</button>\";\n"
        elif 'deleteCampStudent' in lines[i]:
            lines[i] = "        html += \"<td style='text-align:center;'><button class='btn btn-sm btn-danger' style='padding: 3px 8px; font-size: 0.75rem;' onclick=\\\"deleteCampStudent('\" + escTs + \"')\\\" title='ลบข้อมูล'>🗑️ ลบ</button></td>\";\n"

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

with open('JavaScript.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed lines in both JS files!")

for fname in ['src/JavaScript.js', 'JavaScript.js']:
    res = subprocess.run(['node', '--check', fname], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if res.returncode != 0:
        print(f'❌ Syntax error in {fname}:')
        print(res.stderr)
    else:
        print(f'✅ {fname} is 100% VALID JS!')
