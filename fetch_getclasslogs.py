import sys
import re

with open('Code_old.js', 'r', encoding='utf-16') as f:
    content = f.read()

start_idx = content.find('function getClassLogsForTeacher(')
if start_idx != -1:
    end_idx = content.find('function ', start_idx + 10)
    sys.stdout.buffer.write(content[start_idx:end_idx].encode('utf-8'))
else:
    print("Function not found")
