import os

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# We will use regex to find the ratings array and replace it.
pattern = re.compile(r'const ratings = \[.*?\];', re.DOTALL)

new_ratings = """const ratings = [
            { title: 'พื้นฐานความรู้เดิมที่ต้องใช้ในการต่อยอดเนื้อหาที่สอน', val: ev.rating1 || '' },
            { title: 'ความสามารถการเรียนรู้เนื้อหาใหม่', val: ev.rating2 || '' },
            { title: 'ความสามารถในการวิเคราะห์โจทย์ และจับประเด็นข้อคำถาม', val: ev.rating3 || '' },
            { title: 'การตอบคำถามในห้องเรียน', val: ev.rating4 || '' },
            { title: 'การทำแบบฝึกหัด/ ข้อสอบระดับง่าย (คำนวณ)', val: ev.rating5 || '' },
            { title: 'การทำแบบฝึกหัด/ ข้อสอบระดับกลาง (เน้นความเข้าใจ และการนำไปใช้)', val: ev.rating6 || '' },
            { title: 'การทำแบบฝึกหัด/ข้อสอบระดับยาก(เน้นโจทย์ปัญหา)', val: ev.rating7 || '' },
            { title: 'ความสามารถในการพลิกแพลง ใช้หลัก, กฎ, ทฤษฎี ตลอดจนองค์ความรู้ต่าง ๆ เพื่อหาคำตอบ', val: ev.rating8 || '' },
            { title: 'สมาธิในการเรียน และความตั้งใจเรียน', val: ev.rating9 || '' },
            { title: 'ความขยันหมั่นเพียร', val: ev.rating10 || '' },
            { title: 'ความคงทนในการเรียนรู้', val: ev.rating11 || '' }
          ];"""

content = pattern.sub(new_ratings, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replace done!")
