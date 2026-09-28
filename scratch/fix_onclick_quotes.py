import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

bad_onclick = """html += "<td><button class='btn btn-sm btn-warning' style='font-size:0.75rem; padding: 3px 8px; font-weight:600;' onclick="showCampPaymentModal('"""
good_onclick = """html += "<td><button class='btn btn-sm btn-warning' style='font-size:0.75rem; padding: 3px 8px; font-weight:600;' onclick=\\"showCampPaymentModal('"""

content = content.replace(bad_onclick, good_onclick)

# Also check for delete button quotes if needed
bad_del = """onclick="deleteCampStudent('"""
good_del = """onclick=\\"deleteCampStudent('"""
content = content.replace(bad_del, good_del)

bad_conf = """onclick="confirmCampStatus('"""
good_conf = """onclick=\\"confirmCampStatus('"""
content = content.replace(bad_conf, good_conf)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed quotes in src/JavaScript.js and JavaScript.js")

for fname in ['src/JavaScript.js', 'JavaScript.js']:
    res = subprocess.run(['node', '--check', fname], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if res.returncode != 0:
        print(f'❌ Syntax error in {fname}:')
        print(res.stderr)
    else:
        print(f'✅ {fname} is 100% VALID JS!')
