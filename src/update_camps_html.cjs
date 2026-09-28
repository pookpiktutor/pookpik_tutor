const fs = require('fs');
let html = fs.readFileSync('Index.html', 'utf8');

const campsPanelStart = html.indexOf('<div class="view-panel" id="camps_panel"');
const campsPanelEndHTML = `                    <th style="width: 120px;">เบอร์โทรศัพท์</th>
                  </tr>
                </thead>
                <tbody id="camps_table_body">`;

const replacement = `<div class="view-panel" id="camps_panel" style="display: none;">
            <div class="toolbar" style="padding: 8px 12px; margin-bottom: 15px;">
              <div class="filter-actions" style="flex-grow: 1; justify-content: flex-start; gap: 6px; flex-wrap: wrap; align-items: center;">
                <div class="d-flex align-items-center" style="gap: 5px;">
                  <label for="camps_year_select" style="margin-bottom:0; font-size: 0.85rem;">ปีการศึกษา:</label>
                  <select id="camps_year_select" class="form-select form-select-sm" style="width: 120px;" onchange="loadCampsData()">
                    <option value="all">ทั้งหมด</option>
                    <option value="2569">2569</option>
                    <option value="2570">2570</option>
                    <option value="2571">2571</option>
                    <option value="2572">2572</option>
                    <option value="2573">2573</option>
                  </select>
                </div>
                
                <div class="d-flex align-items-center" style="gap: 5px; margin-left: 10px;">
                  <label for="camps_name_select" style="margin-bottom:0; font-size: 0.85rem;">ชื่อค่าย:</label>
                  <select id="camps_name_select" class="form-select form-select-sm" style="width: 180px;" onchange="loadCampsData()">
                    <option value="all">ทั้งหมด</option>
                    <option value="ค่ายปิดเทอมตุลาคม">ค่ายปิดเทอมตุลาคม</option>
                    <option value="ค่ายห้องพิเศษ">ค่ายห้องพิเศษ</option>
                    <option value="ค่ายห้องปกติ">ค่ายห้องปกติ</option>
                    <option value="ค่ายเมษายน">ค่ายเมษายน</option>
                  </select>
                </div>
                
                <button class="btn btn-primary btn-sm ms-2" onclick="loadCampsData()" style="padding: 4px 10px; font-size: 0.8rem;">
                  🔄 รีเฟรชข้อมูล
                </button>
              </div>
              
              <div class="panel-actions">
                <a href="register.html" target="_blank" class="btn btn-success btn-sm" style="text-decoration: none; padding: 4px 10px; font-size: 0.8rem;">
                  📋 เปิดหน้าลงทะเบียนค่าย
                </a>
              </div>
            </div>

            <!-- สรุปข้อมูล -->
            <div id="camps_summary_container" style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 16px;">
              <!-- สรุป 1: แยกตามค่ายและห้อง -->
              <div class="summary-card" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 12px;">
                <h5 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  📊 สรุปจำนวนนักเรียนแยกตามค่ายและห้อง
                </h5>
                <div class="table-responsive">
                  <table class="table table-bordered table-sm text-center" style="font-size: 0.85rem; margin-bottom: 0;">
                    <thead style="background-color: #6f42c1; color: white;">
                      <tr>
                        <th style="text-align: left;">ชื่อค่าย / กิจกรรม</th>
                        <th>ห้องปกติ</th>
                        <th>ห้องพิเศษ EP</th>
                        <th>ห้องพิเศษ Gifted</th>
                        <th>ห้องพิเศษ Smart Com</th>
                        <th>รวม</th>
                      </tr>
                    </thead>
                    <tbody id="camps_summary_rooms_tbody">
                      <tr><td colspan="6" class="text-center text-muted">กำลังโหลดข้อมูล...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- สรุป 2: ไซส์เสื้อ -->
              <div class="summary-card" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 12px;">
                <h5 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  👕 สรุปจำนวนไซส์เสื้อแยกตามค่าย
                </h5>
                <div class="table-responsive">
                  <table class="table table-bordered table-sm text-center" style="font-size: 0.85rem; margin-bottom: 0;">
                    <thead style="background-color: #198754; color: white;">
                      <tr>
                        <th style="text-align: left;">ชื่อค่าย / กิจกรรม</th>
                        <th>S</th>
                        <th>M</th>
                        <th>L</th>
                        <th>XL</th>
                        <th>2XL</th>
                        <th>รวม</th>
                      </tr>
                    </thead>
                    <tbody id="camps_summary_shirts_tbody">
                      <tr><td colspan="7" class="text-center text-muted">กำลังโหลดข้อมูล...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- สรุป 3: ยอดเงิน -->
              <div class="summary-card" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 12px;">
                <h5 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  💰 สรุปยอดเงินแยกตามค่าย
                </h5>
                <div class="table-responsive">
                  <table class="table table-bordered table-sm text-center" style="font-size: 0.85rem; margin-bottom: 0;">
                    <thead style="background-color: #fd7e14; color: white;">
                      <tr>
                        <th style="text-align: left;">ชื่อค่าย / กิจกรรม</th>
                        <th>ยอดเต็ม (บาท)</th>
                        <th>ยอดจ่าย (บาท)</th>
                        <th>ค้างชำระ (บาท)</th>
                      </tr>
                    </thead>
                    <tbody id="camps_summary_money_tbody">
                      <tr><td colspan="4" class="text-center text-muted">กำลังโหลดข้อมูล...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div class="table-container" style="max-height: calc(100vh - 180px); overflow-y: auto;">
              <table class="table table-bordered table-hover custom-table" style="width: 100%; white-space: nowrap;">
                <thead style="position: sticky; top: 0; background-color: #f8f9fa; z-index: 1;">
                  <tr>
                    <th>วันที่สมัคร</th>
                    <th>ชื่อค่าย</th>
                    <th>ปีการศึกษา</th>
                    <th>ระดับชั้น</th>
                    <th>ห้องเรียน</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ชื่อเล่น</th>
                    <th>เบอร์โทรศัพท์</th>
                    <th>โรงเรียน</th>
                    <th>โรคประจำตัว/แพ้อาหาร</th>
                    <th>SIZE เสื้อ</th>
                    <th>สลิป</th>
                    <th>ค้างชำระ</th>
                    <th>จัดการเงิน</th>
                    <th>สถานะ</th>
                    <th>ลบ</th>
                  </tr>
                </thead>
                <tbody id="camps_table_body">`;

const oldString = html.substring(campsPanelStart, html.indexOf(campsPanelEndHTML, campsPanelStart) + campsPanelEndHTML.length);
html = html.replace(oldString, replacement);
fs.writeFileSync('Index.html', html);
console.log('Index.html updated');
