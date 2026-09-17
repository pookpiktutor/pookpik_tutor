#!/usr/bin/env python3
"""Fix parent_eval.html:
1. Parse ratings from ev.scores (dynamic keys) instead of ev.rating1..rating11
2. Make rows tighter (less padding)
3. Use cute star symbols instead of checkmarks
"""

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================================
# FIX 1: Replace hardcoded ratings array with dynamic scores parsing
# ============================================================
old_ratings = """        // Parse scores/ratings dynamically
        const scores = ev.scores || {};
        const ratings = [
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

new_ratings = """        // Parse scores/ratings dynamically from ev.scores object
        const scores = ev.scores || {};
        const ratings = Object.entries(scores).map(([key, val]) => {
          // Remove leading number prefix like "1. ", "2. " etc from the key
          const title = key.replace(/^\\d+\\.\\s*/, '');
          return { title: title, val: val || '' };
        });"""

if old_ratings in content:
    content = content.replace(old_ratings, new_ratings, 1)
    print("FIX 1 OK: Replaced hardcoded ratings with dynamic scores parsing")
else:
    print("FIX 1 WARN: Could not find old ratings block")

# ============================================================
# FIX 2: Replace checkmark icons with cute star icons + tighter row spacing
# ============================================================
# Replace the table body rows template with stars and tighter padding

old_tbody = """                    ${ratings.map((r, idx) => {
                      const gIdx = getGradeIndex(r.val);
                      return `
                      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s; background: ${idx % 2 === 0 ? 'white' : '#fcfcfc'};">
                        <td style="padding: 14px 16px; font-size: 13px; color: #334155; font-weight: 600;">
                          ${idx + 1}. ${r.title}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 1 ? '<i class="fa-solid fa-check" style="color: #ef4444; font-size: 18px;"></i>' : ''}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 2 ? '<i class="fa-solid fa-check" style="color: #f97316; font-size: 18px;"></i>' : ''}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 3 ? '<i class="fa-solid fa-check" style="color: #eab308; font-size: 18px;"></i>' : ''}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 4 ? '<i class="fa-solid fa-check" style="color: #3b82f6; font-size: 18px;"></i>' : ''}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 5 ? '<i class="fa-solid fa-check" style="color: #10b981; font-size: 18px;"></i>' : ''}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 6 ? '<i class="fa-solid fa-check" style="color: #8b5cf6; font-size: 18px;"></i>' : ''}
                        </td>
                      </tr>
                      `}).join('')}"""

new_tbody = """                    ${ratings.map((r, idx) => {
                      const gIdx = getGradeIndex(r.val);
                      return `
                      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s; background: ${idx % 2 === 0 ? 'white' : '#fafbfc'};">
                        <td style="padding: 8px 12px; font-size: 12.5px; color: #334155; font-weight: 600; line-height: 1.3;">
                          ${idx + 1}. ${r.title}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 1 ? '<i class="fa-solid fa-star" style="color: #ef4444; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(239,68,68,0.3));"></i>' : ''}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 2 ? '<i class="fa-solid fa-star" style="color: #f97316; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(249,115,22,0.3));"></i>' : ''}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 3 ? '<i class="fa-solid fa-star" style="color: #eab308; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(234,179,8,0.3));"></i>' : ''}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 4 ? '<i class="fa-solid fa-star" style="color: #3b82f6; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(59,130,246,0.3));"></i>' : ''}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 5 ? '<i class="fa-solid fa-star" style="color: #10b981; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(16,185,129,0.3));"></i>' : ''}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 6 ? '<i class="fa-solid fa-star" style="color: #8b5cf6; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(139,92,253,0.3));"></i>' : ''}
                        </td>
                      </tr>
                      `}).join('')}"""

if old_tbody in content:
    content = content.replace(old_tbody, new_tbody, 1)
    print("FIX 2 OK: Replaced checkmarks with stars + tighter padding")
else:
    print("FIX 2 WARN: Could not find old tbody block")

# ============================================================
# FIX 3: Also tighten the table header padding
# ============================================================
old_th_padding = 'padding: 14px 16px; font-size: 14px; color: #475569; font-weight: 700; min-width: 250px;'
new_th_padding = 'padding: 10px 12px; font-size: 13px; color: #475569; font-weight: 700; min-width: 220px;'
if old_th_padding in content:
    content = content.replace(old_th_padding, new_th_padding, 1)
    print("FIX 3a OK: Tightened header first column padding")

old_th2_padding = 'padding: 14px 8px; text-align: center; font-size: 13px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;'
new_th2_padding = 'padding: 8px 4px; text-align: center; font-size: 11.5px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;'
content = content.replace(old_th2_padding, new_th2_padding)
print("FIX 3b OK: Tightened header grade columns padding")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nAll fixes applied successfully!")
