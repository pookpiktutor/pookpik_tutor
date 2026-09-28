import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('register.html', 'r', encoding='utf-8') as f:
    content = f.read()

m = content.find('switchRegistrationTab')
if m != -1:
    print(content[m:m+1500])
else:
    print("switchRegistrationTab NOT FOUND in register.html!")

# Find tab buttons in HTML
matches = [m.start() for m in re.finditer(r'tab-btn', content)]
print("tab-btn matches:", len(matches))
for m in matches:
    print(content[max(0, m-50):min(len(content), m+300)])
    print('='*50)
