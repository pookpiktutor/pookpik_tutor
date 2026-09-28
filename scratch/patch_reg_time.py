import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def patch_register_with_time_and_search(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Date & Time fields to camp_payment_option_card
    if 'id="camp_pay_time"' not in content:
        old_dep_container = '<div id="camp_deposit_field_container" style="display: none; margin-bottom: 14px;">'
        new_datetime_html = '''<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div>
            <label class="form-label">วันที่ชำระเงิน (วันที่โอน) <span>*</span></label>
            <input type="date" id="camp_pay_date" class="form-input">
          </div>
          <div>
            <label class="form-label">เวลาที่ชำระเงิน (เวลาที่โอน) <span>*</span></label>
            <input type="time" id="camp_pay_time" class="form-input">
          </div>
        </div>

        <div id="camp_deposit_field_container" style="display: none; margin-bottom: 14px;">'''
        content = content.replace(old_dep_container, new_datetime_html, 1)

    # 2. Add unpaid_items_container right after name input search group
    if 'id="unpaid_items_container"' not in content:
        name_group_end = '</div>\n         <div style="font-size: 0.8rem; color: var(--color-primary); margin-top: 5px;">* สามารถกดค้นหาจากชื่อ-นามสกุล เพื่อดึงข้อมูลเดิมขึ้นมาได้</div>\n      </div>'
        unpaid_card_html = '''</div>
         <div style="font-size: 0.8rem; color: var(--color-primary); margin-top: 5px;">* สามารถกดค้นหาจากชื่อ-นามสกุล เพื่อดึงข้อมูลเดิมขึ้นมาได้</div>
      </div>

      <!-- Unpaid Items Card (สำหรับแจ้งโอนค้างชำระของนักเรียนเดิม) -->
      <div id="unpaid_items_container" style="display: none; background: #fff8f6; border: 1px solid #ffedd5; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <h4 style="color: #c2410c; margin-top: 0; margin-bottom: 10px; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
          📌 พบรายการค้างชำระ/มัดจำแล้ว ของนักเรียนคนนี้
        </h4>
        <div id="unpaid_items_list" style="margin-bottom: 14px;"></div>
        
        <div id="unpaid_payment_section" style="display: none; background: #ffffff; border: 1px dashed #fdba74; border-radius: 10px; padding: 14px; margin-top: 10px;">
          <h5 style="color: #9a3412; margin-top: 0; margin-bottom: 10px; font-size: 0.95rem;">💳 แจ้งโอนเงินค้างชำระ (อัปเดตลงฐานข้อมูลเดิม)</h5>
          
          <div class="row-grid" style="margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">จำนวนเงินที่โอน (บาท) <span>*</span></label>
              <input type="number" id="unpaid_pay_amount" class="form-input" placeholder="ระบุยอดเงินโอน">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">วันที่โอน <span>*</span></label>
              <input type="date" id="unpaid_pay_date" class="form-input">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">เวลาที่โอน <span>*</span></label>
              <input type="time" id="unpaid_pay_time" class="form-input">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label">แนบหลักฐานการโอนเงิน (สลิป)</label>
            <div class="upload-area" onclick="document.getElementById('unpaid_slip_file').click()">
              <div class="upload-icon">📸</div>
              <div class="upload-text" id="unpaid_upload_status">คลิกเพื่อแนบสลิปการโอน</div>
              <input type="file" id="unpaid_slip_file" style="display: none;" accept="image/*" onchange="handleUnpaidFileSelect(event)">
            </div>
            <div id="unpaid_preview_container" style="display: none; margin-top: 8px; text-align: center;">
              <img id="unpaid_preview_img" src="" style="max-height: 150px; border-radius: 8px;">
            </div>
          </div>

          <button type="button" id="btn_submit_unpaid_payment" class="btn btn-success" onclick="submitUnpaidPaymentConfirm()" style="width: 100%; font-weight: 700;">
            💾 บันทึกแจ้งชำระเงิน (อัปเดตตรงเข้าฐานข้อมูลเดิม)
          </button>
        </div>
      </div>'''
        content = content.replace(name_group_end, unpaid_card_html, 1)

    # 3. Update btn_search_student_camp event listener in JS script block
    search_listener_idx = content.find("const btnSearchStudentCamp = document.getElementById('btn_search_student_camp');")
    if search_listener_idx != -1:
        end_listener_idx = content.find("});", search_listener_idx)
        if end_listener_idx != -1:
            new_listener_code = '''const btnSearchStudentCamp = document.getElementById('btn_search_student_camp');
    if (btnSearchStudentCamp) {
        btnSearchStudentCamp.addEventListener('click', function() {
            const nameInput = document.getElementById('camp_std_name');
            const name = nameInput.value.trim();
            if (!name) {
                alert("กรุณากรอกชื่อ-นามสกุลนักเรียนก่อนค้นหา");
                return;
            }

            const btn = this;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังค้นหา...';
            btn.disabled = true;

            google.script.run
                .withSuccessHandler(function(res) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    
                    if (res && res.success) {
                        if (res.studentInfo) {
                            const info = res.studentInfo;
                            if (info.nickname) document.getElementById('camp_std_nickname').value = info.nickname;
                            if (info.parent_phone) document.getElementById('camp_parent_contact').value = info.parent_phone;
                            if (info.school) document.getElementById('camp_std_school').value = info.school;
                            if (info.medical_condition) document.getElementById('camp_medical_condition').value = info.medical_condition;
                            if (info.shirt_size) document.getElementById('camp_shirt_size').value = info.shirt_size;
                            if (info.grade) {
                                document.getElementById('camp_grade').value = info.grade;
                                if (typeof renderCampRooms === 'function') renderCampRooms();
                            }
                            if (info.room) document.getElementById('camp_room').value = info.room;
                            if (typeof calculateCampCost === 'function') calculateCampCost();
                        }

                        // Render unpaid items list if any exist
                        renderUnpaidItemsCard(res.unpaidItems);
                    } else {
                        alert("ไม่พบข้อมูลนักเรียนชื่อนี้");
                    }
                })
                .withFailureHandler(function(err) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    alert("เกิดข้อผิดพลาดในการค้นหา: " + err.message);
                })
                .searchStudentRegistrationAndUnpaid(name);
        });
    }'''
            content = content[:search_listener_idx] + new_listener_code + content[end_listener_idx+3:]

    # 4. Add helper JS for unpaid items card & filing date/time initialization
    if 'function renderUnpaidItemsCard' not in content:
        idx_helpers = content.find('function calculateCampCost()')
        if idx_helpers != -1:
            helper_js = '''let unpaidSlipFileData = null;
  let unpaidSelectedItemsData = [];

  function initDefaultDateTime() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const hours = String(today.getHours()).padStart(2, '0');
    const mins = String(today.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${mins}`;

    const dateInput = document.getElementById('camp_pay_date');
    const timeInput = document.getElementById('camp_pay_time');
    if (dateInput && !dateInput.value) dateInput.value = dateStr;
    if (timeInput && !timeInput.value) timeInput.value = timeStr;

    const uDateInput = document.getElementById('unpaid_pay_date');
    const uTimeInput = document.getElementById('unpaid_pay_time');
    if (uDateInput && !uDateInput.value) uDateInput.value = dateStr;
    if (uTimeInput && !uTimeInput.value) uTimeInput.value = timeStr;
  }

  document.addEventListener('DOMContentLoaded', initDefaultDateTime);
  setTimeout(initDefaultDateTime, 500);

  function handleUnpaidFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('ขนาดไฟล์ใหญ่เกิน 10MB กรุณาเลือกใหม่');
        event.target.value = '';
        return;
      }
      document.getElementById('unpaid_upload_status').textContent = 'กำลังประมวลผลรูปภาพ...';
      const reader = new FileReader();
      reader.onload = function(e) {
        unpaidSlipFileData = {
          fileName: file.name,
          mimeType: file.type,
          base64: e.target.result.split(',')[1]
        };
        document.getElementById('unpaid_upload_status').textContent = 'เลือกสลิปแล้ว: ' + file.name;
        document.getElementById('unpaid_preview_img').src = e.target.result;
        document.getElementById('unpaid_preview_container').style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }

  function renderUnpaidItemsCard(unpaidItems) {
    const container = document.getElementById('unpaid_items_container');
    const listEl = document.getElementById('unpaid_items_list');
    const sectionEl = document.getElementById('unpaid_payment_section');

    if (!unpaidItems || unpaidItems.length === 0) {
      container.style.display = 'none';
      return;
    }

    unpaidSelectedItemsData = unpaidItems;
    let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">';
    html += '<thead style="background: #ffedd5; font-weight: 700;"><tr>';
    html += '<th style="padding: 6px; text-align: left;">เลือก</th>';
    html += '<th style="padding: 6px; text-align: left;">รายการ</th>';
    html += '<th style="padding: 6px; text-align: right;">ยอดเต็ม</th>';
    html += '<th style="padding: 6px; text-align: right;">ชำระแล้ว</th>';
    html += '<th style="padding: 6px; text-align: right; color: #c2410c;">ค้างชำระ</th>';
    html += '</tr></thead><tbody>';

    unpaidItems.forEach((item, idx) => {
      const remain = item.remaining > 0 ? item.remaining : 0;
      const itemName = item.campName || item.course || 'รายการเรียน';
      const escTs = (item.timestamp || '').replace(/"/g, '&quot;');
      html += '<tr style="border-bottom: 1px solid #fed7aa;">';
      html += `<td style="padding: 6px;"><input type="checkbox" class="unpaid_item_cb" data-idx="${idx}" data-type="${item.type}" data-ts="${escTs}" data-name="${itemName}" data-remain="${remain}" checked onchange="updateUnpaidTotalAmount()"></td>`;
      html += `<td style="padding: 6px;"><strong>${itemName}</strong> (${item.grade||''} ${item.room||''})</td>`;
      html += `<td style="padding: 6px; text-align: right;">฿${(item.costFull||0).toLocaleString()}</td>`;
      html += `<td style="padding: 6px; text-align: right;">฿${(item.paid||0).toLocaleString()}</td>`;
      html += `<td style="padding: 6px; text-align: right; color: #dc2626; font-weight: bold;">฿${remain.toLocaleString()}</td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';
    listEl.innerHTML = html;
    container.style.display = 'block';
    sectionEl.style.display = 'block';
    updateUnpaidTotalAmount();
  }

  function updateUnpaidTotalAmount() {
    const cbs = document.querySelectorAll('.unpaid_item_cb:checked');
    let totalRemain = 0;
    cbs.forEach(cb => {
      totalRemain += parseFloat(cb.getAttribute('data-remain')) || 0;
    });
    document.getElementById('unpaid_pay_amount').value = totalRemain;
  }

  function submitUnpaidPaymentConfirm() {
    const cbs = document.querySelectorAll('.unpaid_item_cb:checked');
    if (cbs.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 รายการเพื่อชำระเงิน');
      return;
    }
    const payAmt = parseFloat(document.getElementById('unpaid_pay_amount').value);
    if (isNaN(payAmt) || payAmt <= 0) {
      alert('กรุณาระบุจำนวนเงินที่โอน');
      return;
    }
    if (!unpaidSlipFileData) {
      alert('กรุณาแนบหลักฐานการโอนเงิน (สลิป)');
      return;
    }

    const payDate = document.getElementById('unpaid_pay_date').value;
    const payTime = document.getElementById('unpaid_pay_time').value;
    if (!payDate || !payTime) {
      alert('กรุณาระบุวันที่และเวลาที่โอนเงิน');
      return;
    }

    let campItems = [];
    let regularItems = [];
    let selectedNames = [];

    cbs.forEach(cb => {
      const idx = cb.getAttribute('data-idx');
      const item = unpaidSelectedItemsData[idx];
      const itemType = cb.getAttribute('data-type');
      selectedNames.push(item.campName || item.course);

      if (itemType === 'camp') {
        campItems.push({
          timestamp: item.timestamp,
          name: document.getElementById('camp_std_name').value.trim(),
          campName: item.campName,
          costFull: item.costFull,
          amount: payAmt
        });
      } else {
        regularItems.push({
          id: item.id,
          name: document.getElementById('camp_std_name').value.trim(),
          course: item.course,
          amount: payAmt
        });
      }
    });

    const btn = document.getElementById('btn_submit_unpaid_payment');
    btn.disabled = true;
    btn.innerText = 'กำลังส่งข้อมูลอัปเดตลงฐานข้อมูล...';

    const payload = {
      timestamp: payDate + ' ' + payTime,
      pay_date: payDate,
      pay_time: payTime,
      std_name: document.getElementById('camp_std_name').value.trim(),
      selected_items: selectedNames.join(', '),
      total_amount: payAmt,
      transfer_amount: payAmt,
      camp_items: campItems,
      regular_items: regularItems,
      fileData: unpaidSlipFileData
    };

    google.script.run
      .withSuccessHandler(function(res) {
        btn.disabled = false;
        btn.innerText = '💾 บันทึกแจ้งชำระเงิน (อัปเดตตรงเข้าฐานข้อมูลเดิม)';
        if (res && res.success) {
          alert('บันทึกแจ้งชำระเงินสำเร็จเรียบร้อย! ข้อมูลถูกอัปเดตไปยังฐานข้อมูลนักเรียนเดิมแล้ว');
          document.getElementById('unpaid_items_container').style.display = 'none';
          unpaidSlipFileData = null;
        } else {
          alert('เกิดข้อผิดพลาด: ' + (res.error || 'ไม่สามารถบันทึกได้'));
        }
      })
      .withFailureHandler(function(err) {
        btn.disabled = false;
        btn.innerText = '💾 บันทึกแจ้งชำระเงิน (อัปเดตตรงเข้าฐานข้อมูลเดิม)';
        alert('เกิดข้อผิดพลาด: ' + err.message);
      })
      .confirmSearchPayment(payload);
  }

  '''
            content = content[:idx_helpers] + helper_js + content[idx_helpers:]

    # 5. Pass pay_date and pay_time in submitCampForm()
    submit_idx = content.find('const campData = {')
    if submit_idx != -1:
        old_data_block = '''const campData = {
      id: document.getElementById('camp_student_id') ? document.getElementById('camp_student_id').value : "",
      fileData: campSlipFileData,
      timestamp: new Date().toLocaleString('th-TH'),'''
        new_data_block = '''const payDateVal = document.getElementById('camp_pay_date') ? document.getElementById('camp_pay_date').value : '';
    const payTimeVal = document.getElementById('camp_pay_time') ? document.getElementById('camp_pay_time').value : '';
    const fullDateTime = (payDateVal && payTimeVal) ? (payDateVal + ' ' + payTimeVal) : new Date().toLocaleString('th-TH');

    const campData = {
      id: document.getElementById('camp_student_id') ? document.getElementById('camp_student_id').value : "",
      fileData: campSlipFileData,
      timestamp: fullDateTime,
      pay_date: payDateVal,
      pay_time: payTimeVal,'''
        content = content.replace(old_data_block, new_data_block, 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Successfully updated {filepath} with time & unpaid search enhancements!')

patch_register_with_time_and_search('register.html')
patch_register_with_time_and_search('src/register.html')
