import re

with open('Code_old.js', 'r', encoding='utf-16') as f:
    lines = f.readlines()

# Extract from line 6975 to 7165 (0-indexed 6974 to 7165)
sync_func_lines = lines[6974:7165]
sync_func = "".join(sync_func_lines)

with open('Code.js', 'r', encoding='utf-8') as f:
    current_lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(current_lines):
    if line.startswith('function syncStudentToStatusDB(std)'):
        start_idx = i
    elif start_idx != -1 and line.startswith('function '):
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_lines = current_lines[:start_idx] + sync_func_lines + current_lines[end_idx:]
    with open('Code.js', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Code.js patched with new syncStudentToStatusDB successfully.")
else:
    print(f"Could not find function bounds in current code: start={start_idx}, end={end_idx}")
    exit(1)
