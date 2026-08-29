import urllib.request
import re

with urllib.request.urlopen('https://pookpiktutor.github.io/pookpik_tutor/') as response:
    html = response.read().decode('utf-8')

# find the script tag or the function
start_idx = html.find('function loadTeacherSchedule(')
if start_idx != -1:
    end_idx = html.find('function renderTeacherScheduleGrid', start_idx)
    func_text = html[start_idx:end_idx]
    # Filter out emoji to avoid print errors
    print(func_text.encode('ascii', 'ignore').decode('ascii'))
else:
    print("Function not found in index.html directly")

start_idx2 = html.find('function renderTeacherScheduleGrid(')
if start_idx2 != -1:
    end_idx2 = html.find('function showAddTeacherModal', start_idx2)
    func_text2 = html[start_idx2:end_idx2]
    # Filter out emoji to avoid print errors
    print(func_text2.encode('ascii', 'ignore').decode('ascii'))

