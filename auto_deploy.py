import subprocess
import re

print("Creating new version...")
try:
    v_output = subprocess.check_output('clasp version "Auto Update"', shell=True, text=True, encoding='utf-8', errors='ignore')
except Exception as e:
    v_output = str(e)

match = re.search(r'Created version ([\d,]+)', v_output)
if not match:
    print(f"Failed: {v_output}")
    exit(1)
new_version = match.group(1).replace(',', '')
print(f"New version: {new_version}")

print('Fetching deployments...')
output = subprocess.check_output('clasp deployments', shell=True, text=True, encoding='utf-8', errors='ignore')
lines = output.split('\n')

for line in lines:
    if '- AKfyc' in line and '@HEAD' not in line:
        deploymentId = line.strip().split(' ')[1]
        print(f"Deploying to {deploymentId} with version {new_version}...")
        subprocess.call(f'clasp deploy -i {deploymentId} -V {new_version} -d V{new_version}', shell=True)

print("Deployment complete!")


