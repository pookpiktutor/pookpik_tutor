with open('Index.html', 'r', encoding='utf-8') as html:
    lines = html.readlines()

start_idx = 2657
div_count = 0
for i in range(start_idx, len(lines)):
    line = lines[i]
    if '<div' in line: div_count += line.count('<div')
    if '</div' in line: div_count -= line.count('</div')
    if div_count == 0:
        print(f"teacher_monthly_salary_panel ends at {i+1}")
        break
