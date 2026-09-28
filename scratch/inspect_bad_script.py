import sys
import re
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

with open('register.html', 'r', encoding='utf-8') as f:
    content = f.read()

scripts = re.findall(r'<script.*?>(.*?)</script>', content, flags=re.DOTALL)
bad_script = scripts[3] # 4th script block (0-indexed 3)

with open('scratch/bad_script.js', 'w', encoding='utf-8') as tf:
    tf.write(bad_script)

res = subprocess.run(['node', '--check', 'scratch/bad_script.js'], capture_output=True, text=True, encoding='utf-8', errors='ignore')
print("Error output from node --check:")
print(res.stderr)
