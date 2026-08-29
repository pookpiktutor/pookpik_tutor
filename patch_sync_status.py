import re

with open('Code_old.js', 'r', encoding='utf-16') as f:
    old_code = f.read()

# Extract syncStudentToStatusDB from Code_old.js
start_idx = old_code.find('function syncStudentToStatusDB(std, batch = false) {')
end_idx = old_code.find('function syncStudentCourses(', start_idx)
if start_idx != -1 and end_idx != -1:
    sync_func = old_code[start_idx:end_idx]
else:
    print("Could not find function bounds in old code")
    exit(1)

with open('Code.js', 'r', encoding='utf-8') as f:
    current_code = f.read()

# Find the old syncStudentToStatusDB in Code.js
curr_start = current_code.find('function syncStudentToStatusDB(std) {')
curr_end = current_code.find('function syncStudentCourses(', curr_start)

if curr_start != -1 and curr_end != -1:
    new_code = current_code[:curr_start] + sync_func + current_code[curr_end:]
    with open('Code.js', 'w', encoding='utf-8') as f:
        f.write(new_code)
    print("Code.js patched with new syncStudentToStatusDB successfully.")
else:
    print("Could not find function bounds in current code")
    exit(1)
