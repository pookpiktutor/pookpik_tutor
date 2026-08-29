import io

with io.open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

old_toolbar = '''<div class="toolbar" style="padding: 8px 12px; display: flex; flex-direction: column; gap: 8px;">
              <div class="filter-actions" style="flex-grow: 1; justify-content: flex-start; gap: 6px; flex-wrap: wrap; align-items: center; width: 100%;">
                <label class="form-label" style="margin: 0; font-size: 0.78rem; white-space: nowrap;">สาขา:</label>
                <select id="private_branch_select" class="form-select" onchange="loadPrivateStudents()" style="min-width: 80px; max-width: 160px; font-size: 0.78rem; padding: 4px 6px;">
                  <option value="all" selected>ทั้งหมด</option>
                  <option value="สาขา1">สาขา 1</option>
                  <option value="สาขา2">สาขา 2</option>
                  <option value="สาขา3">สาขา 3</option>
                </select>

                <label class="form-label" style="margin: 0; font-size: 0.78rem; white-space: nowrap;">ระดับชั้น/กลุ่ม:</label>
                <select id="private_sheet_select" class="form-select" onchange="loadPrivateStudents()" style="min-width: 100px; max-width: 200px; font-size: 0.78rem; padding: 4px 6px;">
                  <option value="all" selected>แสดงทั้งหมด</option>
                  <optgroup label="เด็กเรียนเดี่ยว">
                    <option value="เดี่ยว อนุบาล">เดี่ยว อนุบาล</option>
                    <option value="เดี่ยว ป.1">เดี่ยว ป.1</option>
                    <option value="เดี่ยว ป.2">เดี่ยว ป.2</option>
                    <option value="เดี่ยว ป.3">เดี่ยว ป.3</option>
                    <option value="เดี่ยว ป.4">เดี่ยว ป.4</option>
                    <option value="เดี่ยว ป.5">เดี่ยว ป.5</option>
                    <option value="เดี่ยว ป.6">เดี่ยว ป.6</option>
                    <option value="เดี่ยว ม.1">เดี่ยว ม.1</option>
                    <option value="เดี่ยว ม.2">เดี่ยว ม.2</option>
                    <option value="เดี่ยว ม.3">เดี่ยว ม.3</option>
                    <option value="เดี่ยว ม.4">เดี่ยว ม.4</option>
                    <option value="เดี่ยว ม.5">เดี่ยว ม.5</option>
                    <option value="เดี่ยว ม.6">เดี่ยว ม.6</option>
                  </optgroup>
                  <optgroup label="กลุ่มย่อย">
                    <option value="ย่อย 2-3">กลุ่มย่อย 2 - 3 คน</option>
                    <option value="ย่อย 4-5">กลุ่มย่อย 4 - 5 คน</option>
                    <option value="ย่อย 6-10">กลุ่มย่อย 6 - 10 คน</option>
                  </optgroup>
                </select>
                <button class="btn btn-primary" onclick="loadPrivateStudents()" style="font-size: 0.78rem; padding: 4px 10px; white-space: nowrap;">🔄 โหลด</button>
              </div>
              <div class="filter-actions" style="flex-grow: 1; justify-content: flex-start; gap: 6px; flex-wrap: wrap; align-items: center; width: 100%;">
                <label class="form-label" style="margin: 0; font-size: 0.78rem; white-space: nowrap;">ค้นหา:</label>
                <input type="text" id="private_student_search" class="form-input" style="min-width: 120px; max-width: 180px; font-size: 0.78rem; padding: 4px 8px;" placeholder="ชื่อ, ชื่อเล่น..." onkeyup="filterPrivateStudents()">

                <button class="btn btn-primary" onclick="showAddStudentModal()" style="font-size: 0.78rem; padding: 4px 10px; white-space: nowrap;">➕ ลงทะเบียน</button>
              </div>
            </div>'''

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
                <select id="private_sheet_select" class="form-select" onchange="loadPrivateStudents()" style="min-width: 100px; max-width: 200px; font-size: 0.78rem; padding: 4px 6px;">
                  <option value="all" selected>แสดงทั้งหมด</option>
                  <optgroup label="เด็กเรียนเดี่ยว">
                    <option value="เดี่ยว อนุบาล">เดี่ยว อนุบาล</option>
                    <option value="เดี่ยว ป.1">เดี่ยว ป.1</option>
                    <option value="เดี่ยว ป.2">เดี่ยว ป.2</option>
                    <option value="เดี่ยว ป.3">เดี่ยว ป.3</option>
                    <option value="เดี่ยว ป.4">เดี่ยว ป.4</option>
                    <option value="เดี่ยว ป.5">เดี่ยว ป.5</option>
                    <option value="เดี่ยว ป.6">เดี่ยว ป.6</option>
                    <option value="เดี่ยว ม.1">เดี่ยว ม.1</option>
                    <option value="เดี่ยว ม.2">เดี่ยว ม.2</option>
                    <option value="เดี่ยว ม.3">เดี่ยว ม.3</option>
                    <option value="เดี่ยว ม.4">เดี่ยว ม.4</option>
                    <option value="เดี่ยว ม.5">เดี่ยว ม.5</option>
                    <option value="เดี่ยว ม.6">เดี่ยว ม.6</option>
                  </optgroup>
                  <optgroup label="กลุ่มย่อย">
                    <option value="ย่อย 2-3">กลุ่มย่อย 2 - 3 คน</option>
                    <option value="ย่อย 4-5">กลุ่มย่อย 4 - 5 คน</option>
                    <option value="ย่อย 6-10">กลุ่มย่อย 6 - 10 คน</option>
                  </optgroup>
                </select>
                <button class="btn btn-primary" onclick="loadPrivateStudents()" style="font-size: 0.78rem; padding: 4px 10px; white-space: nowrap;">🔄 โหลด</button>

                <label class="form-label" style="margin: 0; margin-left: 8px; font-size: 0.78rem; white-space: nowrap;">ค้นหา:</label>
                <input type="text" id="private_student_search" class="form-input" style="min-width: 120px; max-width: 180px; font-size: 0.78rem; padding: 4px 8px;" placeholder="ชื่อ, ชื่อเล่น..." onkeyup="filterPrivateStudents()">

                <button class="btn btn-primary" onclick="showAddStudentModal()" style="font-size: 0.78rem; padding: 4px 10px; white-space: nowrap;">➕ ลงทะเบียน</button>
              </div>
            </div>'''

if old_toolbar in c:
    c = c.replace(old_toolbar, new_toolbar)
    print("Replaced exact")
else:
    c = c.replace(old_toolbar.replace('\n', '\r\n'), new_toolbar.replace('\n', '\r\n'))
    print("Replaced with crlf")

with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)
