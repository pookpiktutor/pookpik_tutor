import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('src/Code.js', 'r', encoding='utf-8') as f:
    content = f.read()

m = content.find('function getStudentDataByName')
if m != -1:
    print(content[m:m+1500])
