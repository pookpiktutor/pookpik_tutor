import re
import sys

html_path = 'src/Index.html'
try:
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the branch-tabs section
    tabs_pattern = r'<div class="branch-tabs" style="margin-bottom: 16px;">.*?</div>'
    new_tabs = '''<div class="branch-tabs" style="margin-bottom: 16px;">
              <button class="branch-tab active" id="tab_rev_paid" onclick="switchRevenueSubTab('paid')">📋 รายการที่ชำระแล้ว</button>
              <button class="branch-tab" id="tab_rev_all" onclick="switchRevenueSubTab('all')">📊 รายการลงทะเบียนทั้งหมด</button>
            </div>'''
    content = re.sub(tabs_pattern, new_tabs, content, flags=re.DOTALL)

    # Replace the table headers
    headers_pattern = r'<th>ชื่อ</th>.*?<th style="width: 1%; text-align: center;">เช็คแล้ว</th>'
    new_headers = '''<th>ชื่อ</th>
                      <th style="width: 1%;">ชั้น</th>
                      <th style="width: 1%;">สาขา</th>
                      <th style="width: 1%;">รายการชำระเงิน</th>
                      <th style="width: 1%; text-align: right;">ยอดเต็ม</th>
                      <th style="width: 1%; text-align: right;">ยอดชำระ</th>
                      <th style="width: 1%;">วันที่</th>
                      <th style="width: 1%;">เวลา</th>
                      <th style="width: 1%;">ช่องทางชำระเงิน</th>
                      <th style="width: 1%;">ผู้รับ</th>
                      <th style="width: 1%;">หมายเหตุ</th>
                      <th style="width: 1%; text-align: center;">สถานะ</th>'''
    content = re.sub(headers_pattern, new_headers, content, flags=re.DOTALL)

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Index.html updated.')
except Exception as e:
    print('Error:', e)
