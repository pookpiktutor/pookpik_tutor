import os

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_ratings = """          const ratings = [
            { title: 'ความตรงต่อเวลา & แต่งกาย', val: scores.attire || scores.attirePrep || ev.rating1 || 'ดีมาก', icon: 'fa-clock-rotate-left', color: '#ff3366' },
            { title: 'ความตั้งใจ & สมาธิ', val: scores.attention || scores.attentionFocus || ev.rating2 || 'ดีมาก', icon: 'fa-brain', color: '#7d5fff' },
            { title: 'ความเข้าใจเนื้อหา', val: scores.understanding || scores.comprehension || ev.rating3 || 'ดีมาก', icon: 'fa-lightbulb', color: '#0ea5e9' },
            { title: 'การส่งงาน & แบบฝึกหัด', val: scores.homework || scores.workCompletion || ev.rating4 || 'เรียบร้อยดี', icon: 'fa-pen-to-square', color: '#10b981' },
            { title: 'การมีส่วนร่วมในห้องเรียน', val: scores.behavior || ev.rating5 || 'สม่ำเสมอ', icon: 'fa-users', color: '#f59e0b' }
          ];"""

new_ratings = """          const ratings = [
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

content = content.replace(old_ratings, new_ratings)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Ratings array updated!")
