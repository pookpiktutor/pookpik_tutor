import os
import re

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Reduce paddings and sizes in CSS
content = content.replace('padding: 25px 30px;', 'padding: 15px 20px;')
content = content.replace('padding: 30px;', 'padding: 20px;')
content = content.replace('.scores-grid {\\n      display: grid;', '.scores-grid {\\n      display: grid;\\n      gap: 10px;')
content = content.replace('gap: 15px;', 'gap: 10px;')
content = content.replace('font-size: 24px;', 'font-size: 18px;')
content = content.replace('font-size: 22px;', 'font-size: 18px;')
content = content.replace('font-size: 26px;', 'font-size: 22px;')

# 2. Format evalDate
old_date_logic = "const evalDate = ev.date || ev.evalDate || 'ล่าสุด';"
new_date_logic = """let evalDate = ev.date || ev.evalDate || 'ล่าสุด';
        if (evalDate && evalDate.includes('T')) {
          const d = new Date(evalDate);
          if (!isNaN(d.getTime())) {
            evalDate = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
          }
        }"""
content = content.replace(old_date_logic, new_date_logic)

# 3. Remove branch badge (ห้องเรียน ipad)
# The badge looks like:
# <span style="background: white; color: #475569; padding: 6px 14px; border-radius: 30px; font-size: 13px; font-weight: 600; box-shadow: var(--shadow-sm);">
#   <i class="fa-solid fa-school"></i> ${branchName}
# </span>
# We can use regex to remove it
badge_pattern = r'<span[^>]*>\\s*<i class="fa-solid fa-school"></i> \$\{branchName\}\\s*</span>'
content = re.sub(badge_pattern, '', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated parent_eval.html")
