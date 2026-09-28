import sys
import re
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['register.html', 'src/register.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    scripts = re.findall(r'<script.*?>(.*?)</script>', content, flags=re.DOTALL)
    print(f'=== Checking {fname} ({len(scripts)} script blocks) ===')
    
    for idx, s in enumerate(scripts):
        if not s.strip(): continue
        with open('scratch/temp_check.js', 'w', encoding='utf-8') as tf:
            tf.write(s)
        
        res = subprocess.run(['node', '--check', 'scratch/temp_check.js'], capture_output=True, text=True, encoding='utf-8', errors='ignore')
        if res.returncode != 0:
            print(f'❌ Script block {idx+1} in {fname} HAS SYNTAX ERROR:')
            print(res.stderr)
        else:
            print(f'✅ Script block {idx+1} in {fname} is valid JS.')
