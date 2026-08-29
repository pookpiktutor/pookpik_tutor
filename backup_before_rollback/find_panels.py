with open('Index.html', 'r', encoding='utf-8') as html:
    lines = html.readlines()

for i, line in enumerate(lines):
    if 'id="evaluation_form_panel"' in line:
        print(f"evaluation_form_panel starts at {i+1}")
    if 'id="teacher_monthly_salary_panel"' in line:
        print(f"teacher_monthly_salary_panel starts at {i+1}")
