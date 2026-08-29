import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the button from the adjustment UI
# <button class="btn btn-primary btn-sm" style="font-size: 0.7rem; padding: 2px 8px;" onclick="openTeacherAdjustmentModal()">+ เพิ่มรายการหัก/เพิ่มเงิน</button>

button_str = '<button class="btn btn-primary btn-sm" style="font-size: 0.7rem; padding: 2px 8px;" onclick="openTeacherAdjustmentModal()">+ เพิ่มรายการหัก/เพิ่มเงิน</button>'
content = content.replace(button_str, '')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html patched to remove button")
