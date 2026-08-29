# -*- coding: utf-8 -*-
"""
Fix updates:
1. index.html - Add discount column to debtors table, update colspan
2. src/JavaScript.js - Update renderDebtorsTable to show discount
"""

import re

# ============================================================
# 1. Fix index.html - Debtors table headers
# ============================================================
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add discount column header after ค่าเรียนทั้งหมด in debtors panel
old_headers = '''<th style="text-align: right;">ค่าเรียนทั้งหมด</th>
                    <th style="text-align: right;">ชำระแล้ว</th>
                    <th style="text-align: right; color: var(--color-danger);">ยอดค้างชำระ</th>
                    <th>รูปแบบคลาส</th>
                    <th>วันที่ลงทะเบียน</th>'''

new_headers = '''<th style="text-align: right;">ค่าเรียนทั้งหมด</th>
                    <th style="text-align: right;">ส่วนลด</th>
                    <th style="text-align: right;">ชำระแล้ว</th>
                    <th style="text-align: right; color: var(--color-danger);">ยอดค้างชำระ</th>
                    <th style="white-space: nowrap;">รูปแบบคลาส</th>
                    <th style="white-space: nowrap;">วันที่ลงทะเบียน</th>'''

if old_headers in html:
    html = html.replace(old_headers, new_headers)
    print("[OK] index.html: Added discount column header to debtors table")
else:
    print("[WARN] index.html: Could not find old debtors headers - trying line by line")
    # Try matching just the key part
    html = html.replace(
        '<th style="text-align: right;">ชำระแล้ว</th>\r\n                    <th style="text-align: right; color: var(--color-danger);">ยอดค้างชำระ</th>\r\n                    <th>รูปแบบคลาส</th>\r\n                    <th>วันที่ลงทะเบียน</th>',
        '<th style="text-align: right;">ส่วนลด</th>\r\n                    <th style="text-align: right;">ชำระแล้ว</th>\r\n                    <th style="text-align: right; color: var(--color-danger);">ยอดค้างชำระ</th>\r\n                    <th style="white-space: nowrap;">รูปแบบคลาส</th>\r\n                    <th style="white-space: nowrap;">วันที่ลงทะเบียน</th>',
        1  # Only replace first occurrence (debtors panel)
    )
    print("[OK] index.html: Applied fallback replacement for debtors headers")

# Update colspan from 8 to 9 in debtors panel
html = html.replace(
    'กำลังโหลดรายชื่อนักเรียนค้างชำระเงิน...</td></tr>',
    'กำลังโหลดรายชื่อนักเรียนค้างชำระเงิน...</td></tr>'
)
# Fix colspan in debtors loading message
html = html.replace(
    '<td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">กำลังโหลดรายชื่อนักเรียนค้างชำระเงิน',
    '<td colspan="9" style="text-align: center; color: var(--text-muted); padding: 40px;">กำลังโหลดรายชื่อนักเรียนค้างชำระเงิน'
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] index.html: Saved")

# ============================================================
# 2. Fix src/JavaScript.js - renderDebtorsTable
# ============================================================
with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Update renderDebtorsTable: add discount column
# Old: no discount column between full and paid
old_render = '''<td style="text-align: right; font-weight: 500;">฿${s.full.toLocaleString()}</td>

      <td style="text-align: right; font-weight: 500; color: var(--color-success);">฿${s.paid.toLocaleString()}</td>

      <td style="text-align: right; font-weight: 700; color: var(--color-danger);">฿${s.outstanding.toLocaleString()}</td>

      <td><span class="badge badge-info">${s.classType || 'เดี่ยว'}</span></td>

      <td>${formatDateTimeToThaiLong(s.paymentDate) || '-'}</td>'''

new_render = '''<td style="text-align: right; font-weight: 500;">฿${s.full.toLocaleString()}</td>

      <td style="text-align: right; font-weight: 500; color: var(--color-warning);">฿${(s.discount || 0).toLocaleString()}</td>

      <td style="text-align: right; font-weight: 500; color: var(--color-success);">฿${s.paid.toLocaleString()}</td>

      <td style="text-align: right; font-weight: 700; color: var(--color-danger);">฿${s.outstanding.toLocaleString()}</td>

      <td style="white-space: nowrap;"><span class="badge badge-info">${s.classType || 'เดี่ยว'}</span></td>

      <td style="white-space: nowrap;">${formatDateTimeToThaiLong(s.paymentDate) || '-'}</td>'''

if old_render in js:
    js = js.replace(old_render, new_render)
    print("[OK] src/JavaScript.js: Added discount column to renderDebtorsTable")
else:
    print("[WARN] src/JavaScript.js: Could not find old renderDebtorsTable content")

# Update the "no debtors" message colspan from 8 to 9
js = js.replace(
    '<td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">🎉 ไม่มีนักเรียนค้างชำระเงินค่าเรียนในระบบ',
    '<td colspan="9" style="text-align: center; color: var(--text-muted); padding: 40px;">🎉 ไม่มีนักเรียนค้างชำระเงินค่าเรียนในระบบ'
)

# Update the renderStudentsTable course list display to show courses on separate lines
# Currently: const courseName = s.round || '-';
# Change to split by comma and show each on a new line
old_course_display = "const courseName = s.round || '-';"
new_course_display = "const courseName = s.round ? s.round.split(', ').map(c => c.trim()).join('<br>') : '-';"
if old_course_display in js:
    js = js.replace(old_course_display, new_course_display)
    print("[OK] src/JavaScript.js: Updated course display to show each course on separate line")

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("[OK] src/JavaScript.js: Saved")

print("\n=== All updates complete ===")
