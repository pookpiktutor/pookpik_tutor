import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['src/JavaScript.js', 'JavaScript.js', 'src/Code.js', 'Code.js']:
    res = subprocess.run(['node', '--check', fname], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if res.returncode != 0:
        print(f'❌ Syntax error in {fname}:')
        print(res.stderr)
    else:
        print(f'✅ {fname} is valid JS.')
