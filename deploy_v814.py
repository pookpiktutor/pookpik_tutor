import subprocess

print('Pushing...')
subprocess.run(['C:\\Users\\Windows 11\\AppData\\Roaming\\npm\\clasp.cmd', 'push', '-f'], check=True)
print('Deploying v814...')
subprocess.run(['C:\\Users\\Windows 11\\AppData\\Roaming\\npm\\clasp.cmd', 'version', '"Update 12"'], check=True)

output = subprocess.check_output(['C:\\Users\\Windows 11\\AppData\\Roaming\\npm\\clasp.cmd', 'deployments'], text=True)
lines = output.split('\n')
bat = '@echo on\nset PATH=C:\\Program Files\\nodejs;%PATH%\n\n'
for line in lines:
    if '- AKfyc' in line and '@HEAD' not in line:
        deploymentId = line.strip().split(' ')[1]
        bat += f'call "C:\\Users\\Windows 11\\AppData\\Roaming\\npm\\clasp.cmd" deploy -i {deploymentId} -V 814 -d V814\n'
bat += 'echo ALL DEPLOYMENTS UPDATED TO V814!\n'
with open('update_v814.bat', 'w') as f:
    f.write(bat)
print('Created update_v814.bat')
