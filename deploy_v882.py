import subprocess

print('Fetching deployments...')
output = subprocess.check_output(['C:\\Users\\Windows 11\\AppData\\Roaming\\npm\\clasp.cmd', 'deployments'], text=True)
lines = output.split('\n')
bat = '@echo on\nset PATH=C:\\Program Files\\nodejs;%PATH%\n\n'
for line in lines:
    if '- AKfyc' in line and '@HEAD' not in line:
        deploymentId = line.strip().split(' ')[1]
        bat += f'call "C:\\Users\\Windows 11\\AppData\\Roaming\\npm\\clasp.cmd" deploy -i {deploymentId} -V 882 -d V882\n'
bat += 'echo ALL DEPLOYMENTS UPDATED TO V882!\n'
with open('update_v882.bat', 'w') as f:
    f.write(bat)
print('Created update_v882.bat')
