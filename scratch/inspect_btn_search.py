import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('register.html', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'id=["\']btn_search_student_camp["\']', content)
if m:
    print("Found btn_search_student_camp at:", m.start())
    print(content[max(0, m.start()-100):min(len(content), m.start()+1500)])

m_js = re.search(r'btn_search_student_camp', content)
matches = [m.start() for m in re.finditer(r'btn_search_student_camp', content)]
print("Matches in register.html for btn_search_student_camp:", len(matches))
for match in matches:
    print(content[max(0, match-50):min(len(content), match+300)])
    print('='*50)
