import urllib.request
with urllib.request.urlopen('https://pookpiktutor.github.io/pookpik_tutor/index.html') as response:
    html = response.read().decode('utf-8')
    lines = html.split('\n')
    for i, line in enumerate(lines):
        if 'teacher_schedule_select' in line:
            for j in range(max(0, i-5), min(len(lines), i+10)):
                print(f"{j}: {lines[j]}")
