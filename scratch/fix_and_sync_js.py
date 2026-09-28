import sys
import re
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

# 1. Fix src/JavaScript.js string multiline issue
with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

bad_str = "html += '<div><label style=\"font-size:0.75rem;\">วันที่</label><input type=\"date\" id=\"camp_pay_r' + r + '_date\" class=\"form-control form-control-sm\" value=\"' + dateVal + '\"></div>\n    <div><label style=\"font-size:0.75rem;\">เวลา</label><input type=\"time\" id=\"camp_pay_r' + r + '_time\" class=\"form-control form-control-sm\" value=\"' + timeVal + '\"></div>';"
good_str = "html += '<div><label style=\"font-size:0.75rem;\">วันที่</label><input type=\"date\" id=\"camp_pay_r\' + r + \'_date\" class=\"form-control form-control-sm\" value=\"\' + dateVal + \'"></div>\';\n    html += \'<div><label style=\"font-size:0.75rem;\">เวลา</label><input type=\"time\" id=\"camp_pay_r\' + r + \'_time\" class=\"form-control form-control-sm\" value=\"\' + timeVal + \'"></div>\';"

content = content.replace(bad_str, good_str)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Copy src/JavaScript.js to JavaScript.js so both are identical and valid
with open('JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated src/JavaScript.js and synced to JavaScript.js!")

# Now check syntax of both files with node
for fname in ['src/JavaScript.js', 'JavaScript.js']:
    res = subprocess.run(['node', '--check', fname], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if res.returncode != 0:
        print(f'❌ Syntax error in {fname}:')
        print(res.stderr)
    else:
        print(f'✅ {fname} is 100% VALID JS!')
