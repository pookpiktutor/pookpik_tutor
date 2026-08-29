# -*- coding: utf-8 -*-
"""
Fix private students toolbar to be more compact
"""

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the entire toolbar section for private students panel
old_toolbar = '''<div class="toolbar">
              <div class="filter-actions" style="flex-grow: 1; justify-content: flex-start; gap: 16px;">
                <label class="form-label" style="margin-top: 10px;">สาขา:</label>
                <select id="private_branch_select" class="form-select" onchange="loadPrivateStudents()" style="min-width: 250px;">
                  <option value="all" selected>ทั้งหมดทุกสาขา</option>
                  <option value="สาขา1">สาขา 1 แยกPMY</option>
                  <option value="สาขา2">สาขา 2 ข้างโรงเรียนระยองวิทยาคม</option>
                  <option value="สาขา3">สาขา 3 ตรงข้ามโรงเรียนอัสสัมชัญ เซนต์โยเซฟ</option>
                </select>

                <label class="form-label" style="margin-top: 10px;">ระดับชั้น/กลุ่ม:</label>
                <select id="private_sheet_select" class="form-select" onchange="loadPrivateStudents()" style="min-width: 320px;">'''

new_toolbar = '''<div class="toolbar" style="padding: 8px 12px;">
              <div class="filter-actions" style="flex-grow: 1; justify-content: flex-start; gap: 6px; flex-wrap: wrap; align-items: center;">
                <label class="form-label" style="margin: 0; font-size: 0.78rem; white-space: nowrap;">สาขา:</label>
                <select id="private_branch_select" class="form-select" onchange="loadPrivateStudents()" style="min-width: 80px; max-width: 160px; font-size: 0.78rem; padding: 4px 6px;">
                  <option value="all" selected>ทั้งหมด</option>
                  <option value="สาขา1">สาขา 1</option>
                  <option value="สาขา2">สาขา 2</option>
                  <option value="สาขา3">สาขา 3</option>
                </select>

                <label class="form-label" style="margin: 0; font-size: 0.78rem; white-space: nowrap;">ระดับชั้น/กลุ่ม:</label>
                <select id="private_sheet_select" class="form-select" onchange="loadPrivateStudents()" style="min-width: 100px; max-width: 200px; font-size: 0.78rem; padding: 4px 6px;">'''

if old_toolbar in html:
    html = html.replace(old_toolbar, new_toolbar)
    print("[OK] Replaced toolbar header (exact match)")
else:
    print("[WARN] Exact match not found, trying fallback...")
    # Try with \r\n
    old_toolbar_crlf = old_toolbar.replace('\n', '\r\n')
    if old_toolbar_crlf in html:
        html = html.replace(old_toolbar_crlf, new_toolbar.replace('\n', '\r\n'))
        print("[OK] Replaced toolbar header (CRLF match)")
    else:
        print("[FAIL] Could not find toolbar header")

# Fix the button and search input sizes
old_btn = '''<button class="btn btn-primary" onclick="loadPrivateStudents()">🔄 โหลดข้อมูล</button>

                <label class="form-label" style="margin-top: 10px;">ค้นหานักเรียน:</label>
                <input type="text" id="private_student_search" class="form-input" style="min-width: 200px;" placeholder="ชื่อ, นามสกุล, ชื่อเล่น..." onkeyup="filterPrivateStudents()">

                <button class="btn btn-primary" onclick="showAddStudentModal()"><span>➕</span> ลงทะเบียนเรียนแบบละเอียด</button>'''

new_btn = '''<button class="btn btn-primary" onclick="loadPrivateStudents()" style="font-size: 0.78rem; padding: 4px 10px; white-space: nowrap;">🔄 โหลด</button>

                <label class="form-label" style="margin: 0; font-size: 0.78rem; white-space: nowrap;">ค้นหา:</label>
                <input type="text" id="private_student_search" class="form-input" style="min-width: 120px; max-width: 180px; font-size: 0.78rem; padding: 4px 8px;" placeholder="ชื่อ, ชื่อเล่น..." onkeyup="filterPrivateStudents()">

                <button class="btn btn-primary" onclick="showAddStudentModal()" style="font-size: 0.78rem; padding: 4px 10px; white-space: nowrap;">➕ ลงทะเบียน</button>'''

if old_btn in html:
    html = html.replace(old_btn, new_btn)
    print("[OK] Replaced buttons and search (exact match)")
else:
    old_btn_crlf = old_btn.replace('\n', '\r\n')
    if old_btn_crlf in html:
        html = html.replace(old_btn_crlf, new_btn.replace('\n', '\r\n'))
        print("[OK] Replaced buttons and search (CRLF match)")
    else:
        print("[FAIL] Could not find buttons and search")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] index.html saved")
