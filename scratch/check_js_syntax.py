import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['register.html', 'src/register.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all <script> blocks
    scripts = re.findall(r'<script.*?>(.*?)</script>', content, flags=re.DOTALL)
    print(f'=== {fname}: Found {len(scripts)} script blocks ===')
    
    for idx, s in enumerate(scripts):
        if not s.strip(): continue
        # Write to temp file and test with node
        with open('scratch/temp_check.js', 'w', encoding='utf-8') as tf:
            tf.write(s)
        
        import subprocess
        res = subprocess.run(['node', '--check', 'scratch/temp_check.js'], capture_output=True, text=True)
        if res.returncode != 0:
            print(f'❌ Script block {idx+1} in {fname} HAS SYNTAX ERROR:')
            print(res.stderr)
        else:
            print(f'✅ Script block {idx+1} in {fname} is valid JS.')
