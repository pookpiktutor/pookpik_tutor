import urllib.request

with urllib.request.urlopen('https://pookpiktutor.github.io/pookpik_tutor/') as response:
    html = response.read().decode('utf-8')

start_idx = html.find('function loadTeacherSchedule(')
if start_idx != -1:
    end_idx = html.find('function renderTeacherScheduleGrid', start_idx)
    func_text = html[start_idx:end_idx]
    print(func_text.encode('ascii', 'ignore').decode('ascii'))
else:
    print("Not found")
