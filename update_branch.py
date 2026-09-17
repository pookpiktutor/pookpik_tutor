import os
import re

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change title
content = content.replace('บ้านครูปุ๊กปิ๊ก TUTOR', 'โรงเรียนกวดวิชาบ้านครูปุ๊กปิ๊ก')

# 2. Add branch back but without ipad
# Let's find where to put the badge back.
# It was next to course-badge
target_badge = """                    <span class="course-badge">
                      <i class="fa-solid fa-book-open"></i> ${courseName}
                    </span>"""

replacement_badge = """                    <span class="course-badge">
                      <i class="fa-solid fa-book-open"></i> ${courseName}
                    </span>
                    <span style="background: white; color: #475569; padding: 6px 14px; border-radius: 30px; font-size: 13px; font-weight: 600; box-shadow: var(--shadow-sm);">
                      <i class="fa-solid fa-school"></i> ${branchName.replace(/ipad/gi, '').replace(/jiped/gi, '').replace(/ห้องเรียน/g, 'ห้อง').trim()}
                    </span>"""

content = content.replace(target_badge, replacement_badge)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully!")
