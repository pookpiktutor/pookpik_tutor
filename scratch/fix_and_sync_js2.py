import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace broken string concatenation in showCampPaymentModal
bad_part = """    html += '<div><label style="font-size:0.75rem;">วันที่</label><input type="date" id="camp_pay_r' + r + '_date" class="form-control form-control-sm" value="' + dateVal + '"></div>\n    <div><label style="font-size:0.75rem;">เวลา</label><input type="time" id="camp_pay_r' + r + '_time" class="form-control form-control-sm" value="' + timeVal + '"></div>';"""

good_part = """    html += '<div><label style="font-size:0.75rem;">วันที่</label><input type="date" id="camp_pay_r' + r + '_date" class="form-control form-control-sm" value="' + dateVal + '"></div>';\n    html += '<div><label style="font-size:0.75rem;">เวลา</label><input type="time" id="camp_pay_r' + r + '_time" class="form-control form-control-sm" value="' + timeVal + '"></div>';"""

if bad_part in content:
    content = content.replace(bad_part, good_part)
    print("Fixed bad_part in src/JavaScript.js")

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Synced src/JavaScript.js -> JavaScript.js")

for fname in ['src/JavaScript.js', 'JavaScript.js']:
    res = subprocess.run(['node', '--check', fname], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if res.returncode != 0:
        print(f'❌ Syntax error in {fname}:')
        print(res.stderr)
    else:
        print(f'✅ {fname} is 100% VALID JS!')
