import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

bad_manage_line = """        html += "<td><button class='btn btn-sm btn-warning' style='font-size:0.75rem; padding: 3px 8px; font-weight:600;' onclick=\\"showCampPaymentModal('" + escTs + "')">🪙 จัดการ</button></td>";"""
good_manage_line = """        html += '<td><button class="btn btn-sm btn-warning" style="font-size:0.75rem; padding: 3px 8px; font-weight:600;" onclick="showCampPaymentModal(\\'' + escTs + '\\')">🪙 จัดการ</button></td>';"""

content = content.replace(bad_manage_line, good_manage_line)

bad_confirm_line = """          html += "<button class='btn btn-sm btn-success' style='font-size:0.75rem; padding: 3px 8px;' onclick=\\"confirmCampStatus('" + escTs + "')">กดยืนยัน</button>";"""
good_confirm_line = """          html += '<button class="btn btn-sm btn-success" style="font-size:0.75rem; padding: 3px 8px;" onclick="confirmCampStatus(\\'' + escTs + '\\')">กดยืนยัน</button>';"""

content = content.replace(bad_confirm_line, good_confirm_line)

bad_delete_line = """        html += "<td style='text-align:center;'><button class='btn btn-sm btn-danger' style='padding: 3px 8px; font-size: 0.75rem;' onclick=\\"deleteCampStudent('" + escTs + "')\\" title='ลบข้อมูล'>🗑️ ลบ</button></td>";"""
good_delete_line = """        html += '<td style="text-align:center;"><button class="btn btn-sm btn-danger" style="padding: 3px 8px; font-size: 0.75rem;" onclick="deleteCampStudent(\\'' + escTs + '\\')" title="ลบข้อมูล">🗑️ ลบ</button></td>';"""

content = content.replace(bad_delete_line, good_delete_line)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

for fname in ['src/JavaScript.js', 'JavaScript.js']:
    res = subprocess.run(['node', '--check', fname], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if res.returncode != 0:
        print(f'❌ Syntax error in {fname}:')
        print(res.stderr)
    else:
        print(f'✅ {fname} is 100% VALID JS!')
