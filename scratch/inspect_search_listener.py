import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('register.html', 'r', encoding='utf-8') as f:
    content = f.read()

m = content.find('btnSearchStudentCamp.addEventListener')
if m != -1:
    print(content[m:m+1500])
