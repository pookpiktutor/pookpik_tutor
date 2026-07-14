import os

with open('Index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find bounds of evaluation_form_panel
start_eval = -1
end_eval = -1
for i, line in enumerate(lines):
    if 'id="evaluation_form_panel"' in line:
        start_eval = i
        # Since we found the start, let's find the end using div counts
        div_count = 0
        for j in range(i, len(lines)):
            if '<div' in lines[j]: div_count += lines[j].count('<div')
            if '</div' in lines[j]: div_count -= lines[j].count('</div')
            if div_count == 0:
                end_eval = j
                break
        break

# Extract the block
eval_block = lines[start_eval - 1 : end_eval + 1] # Include the comment before it if it exists

# Remove the block from original position
del lines[start_eval - 1 : end_eval + 1]

# Now find where to insert it. We want it after teacher_monthly_salary_panel
start_salary = -1
end_salary = -1
for i, line in enumerate(lines):
    if 'id="teacher_monthly_salary_panel"' in line:
        start_salary = i
        div_count = 0
        for j in range(i, len(lines)):
            if '<div' in lines[j]: div_count += lines[j].count('<div')
            if '</div' in lines[j]: div_count -= lines[j].count('</div')
            if div_count == 0:
                end_salary = j
                break
        break

# Insert the block after end_salary
for i, line in enumerate(eval_block):
    lines.insert(end_salary + 1 + i, line)

with open('Index.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"Moved evaluation block from {start_eval} to {end_salary+1}")
