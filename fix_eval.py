import re

# Fix index.html - change evaluation form labels
filepath = 'index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Change "กรอกอย่างน้อย 4 ข้อขึ้นไป และมี 60 ตัวอักษรขึ้นไปต่อข้อ" -> 3 ข้อ, 50 ตัวอักษร
content = content.replace('กรอกอย่างน้อย 4 ข้อขึ้นไป และมี 60 ตัวอักษรขึ้นไปต่อข้อ', 'กรอกอย่างน้อย 3 ข้อขึ้นไป และมี 50 ตัวอักษรขึ้นไปต่อข้อ')

# Change placeholder text "ตัวอักษร 60 ตัวขึ้นไป" -> "ตัวอักษร 50 ตัวขึ้นไป"
content = content.replace('ตัวอักษร 60 ตัวขึ้นไป', 'ตัวอักษร 50 ตัวขึ้นไป')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed index.html evaluation form labels.")

# Fix src/JavaScript.js - change validation thresholds
filepath2 = 'src/JavaScript.js'
with open(filepath2, 'r', encoding='utf-8') as f:
    content2 = f.read()

# Fix validation: filledCount < 4 -> filledCount < 3
content2 = content2.replace('if (filledCount < 4) {', 'if (filledCount < 3) {')

# Fix validation: items.length < 4 -> items.length < 3
content2 = content2.replace('if (items.length < 4) {', 'if (items.length < 3) {')

# Fix error messages
content2 = content2.replace('ต้องตอบอย่างน้อย 4 ข้อขึ้นไป', 'ต้องตอบอย่างน้อย 3 ข้อขึ้นไป')
content2 = content2.replace('ต้องตอบมากกว่า 3 ข้อขึ้นไป (อย่างน้อย 4 ข้อ)', 'ต้องตอบอย่างน้อย 3 ข้อขึ้นไป')

# Fix char length validation: val.length < 60 -> val.length < 50
content2 = content2.replace('if (val.length < 60) {', 'if (val.length < 50) {')

# Fix error messages for char length
content2 = content2.replace('ความยาว 60 ตัวอักษรขึ้นไป', 'ความยาว 50 ตัวอักษรขึ้นไป')
content2 = content2.replace('ความยาวตัวอักษรมากกว่า 60 ตัวอักษรขึ้นไป', 'ความยาว 50 ตัวอักษรขึ้นไป')

with open(filepath2, 'w', encoding='utf-8') as f:
    f.write(content2)

print(f"Fixed src/JavaScript.js evaluation validation thresholds.")
