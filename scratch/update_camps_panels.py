import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

new_camps_select = '''<select id="camps_name_select" class="form-select form-select-sm" style="width: 240px;" onchange="loadCampsData()">
                    <option value="all">ทั้งหมด</option>
                    <option value="ค่ายเตรียมความพร้อม(เมษายน)">ค่ายเตรียมความพร้อม(เมษายน)</option>
                    <option value="ค่ายวางแผนติดspeed(ตุลาคม)">ค่ายวางแผนติดspeed(ตุลาคม)</option>
                    <option value="ค่ายสานฝันปั้นน้อง ห้องพิเศษ (มีนาคม)">ค่ายสานฝันปั้นน้อง ห้องพิเศษ (มีนาคม)</option>
                    <option value="ค่ายสานฝันปั้นน้อง ห้องปกติ (มีนาคม) รอบ1">ค่ายสานฝันปั้นน้อง ห้องปกติ (มีนาคม) รอบ1</option>
                    <option value="ค่ายสานฝันปั้นน้อง ห้องปกติ (มีนาคม) รอบ2">ค่ายสานฝันปั้นน้อง ห้องปกติ (มีนาคม) รอบ2</option>
                  </select>'''

new_table_head = '''<thead style="position: sticky; top: 0; background-color: #f8f9fa; z-index: 1;">
                  <tr>
                    <th style="width: 110px;">วันที่สมัคร</th>
                    <th style="width: 150px;">ชื่อค่าย</th>
                    <th style="width: 70px;">ปี</th>
                    <th style="width: 70px;">ชั้น</th>
                    <th style="width: 90px;">ห้องเรียน</th>
                    <th style="width: 160px;">ชื่อ-นามสกุล</th>
                    <th style="width: 80px;">ชื่อเล่น</th>
                    <th style="width: 110px;">เบอร์โทร</th>
                    <th style="width: 130px;">โรงเรียน</th>
                    <th style="width: 120px;">โรคประจำตัว</th>
                    <th style="width: 70px;">เสื้อ</th>
                    <th style="width: 70px;">สลิป</th>
                    <th style="width: 90px; color:#dc2626;">ค้างชำระ</th>
                    <th style="width: 80px;">จัดการ</th>
                    <th style="width: 90px;">สถานะ</th>
                    <th style="width: 50px;">ลบ</th>
                  </tr>
                </thead>'''

for fname in ['index.html', 'src/Index.html', 'src/camps_panel.html']:
    try:
        with open(fname, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update select options
        old_sel_regex = r'<select id="camps_name_select".*?>.*?</select>'
        content = re.sub(old_sel_regex, new_camps_select, content, flags=re.DOTALL)

        # Update table head
        old_thead_regex = r'<thead style="position: sticky; top: 0; background-color: #f8f9fa; z-index: 1;">.*?</thead>'
        content = re.sub(old_thead_regex, new_table_head, content, flags=re.DOTALL)

        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {fname} successfully!')
    except Exception as e:
        print(f'Could not update {fname}: {e}')
