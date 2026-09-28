import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def patch_register_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update camp options in select #camp_name
    old_select_regex = r'<select id="camp_name".*?>.*?</select>'
    new_select_html = '''<select id="camp_name" class="form-select" required onchange="calculateCampCost()">
            <option value="">-- เลือกค่าย --</option>
            <option value="ค่ายเตรียมความพร้อม(เมษายน)">ค่ายเตรียมความพร้อม(เมษายน)</option>
            <option value="ค่ายวางแผนติดspeed(ตุลาคม)">ค่ายวางแผนติดspeed(ตุลาคม)</option>
            <option value="ค่ายสานฝันปั้นน้อง ห้องพิเศษ (มีนาคม)">ค่ายสานฝันปั้นน้อง ห้องพิเศษ (มีนาคม)</option>
            <option value="ค่ายสานฝันปั้นน้อง ห้องปกติ (มีนาคม) รอบ1">ค่ายสานฝันปั้นน้อง ห้องปกติ (มีนาคม) รอบ1</option>
            <option value="ค่ายสานฝันปั้นน้อง ห้องปกติ (มีนาคม) รอบ2">ค่ายสานฝันปั้นน้อง ห้องปกติ (มีนาคม) รอบ2</option>
          </select>'''
    content = re.sub(old_select_regex, new_select_html, content, flags=re.DOTALL)

    # 2. Add camp_price_type radio options right after camp_room select form-group
    room_group_target = '</div>\n      </div>\n\n      <div class="form-group">'
    if 'name="camp_price_type"' not in content:
        price_type_html = '''</div>
      </div>

      <!-- รูปแบบการเรียนค่าย (เต็มค่าย / รายวัน) -->
      <div class="row-grid" style="margin-top: 12px; margin-bottom: 16px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">รูปแบบการเรียนค่าย <span>*</span></label>
          <div style="display: flex; gap: 16px; margin-top: 6px; background: #ffffff; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: var(--radius-md);">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 600; color: #1e293b;">
              <input type="radio" name="camp_price_type" value="full" checked onchange="toggleCampPriceType(); calculateCampCost();">
              <span>ลงเต็มค่าย</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 600; color: #1e293b;">
              <input type="radio" name="camp_price_type" value="daily" onchange="toggleCampPriceType(); calculateCampCost();">
              <span>ลงรายวัน</span>
            </label>
          </div>
        </div>
        <div class="form-group" id="camp_daily_days_container" style="display: none; margin-bottom: 0;">
          <label class="form-label">จำนวนวันที่เรียน (วัน) <span>*</span></label>
          <input type="number" id="camp_daily_days" class="form-input" min="1" max="30" value="1" oninput="calculateCampCost()">
        </div>
      </div>

      <div class="form-group">'''
        content = content.replace('</div>\n      </div>\n\n      <div class="form-group">', price_type_html, 1)

    # 3. Add payment option card before slip upload
    if 'id="camp_payment_option_card"' not in content:
        old_cost_card_start = '<div id="camp_cost_display"'
        new_payment_card_html = '''<div class="info-card" id="camp_payment_option_card" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          รูปแบบการชำระเงินก่อนแนบสลิป
        </h3>
        <div style="display: flex; gap: 20px; margin-bottom: 14px; flex-wrap: wrap;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600; color: #1e293b;">
            <input type="radio" name="camp_pay_mode" value="full" checked onchange="toggleCampPayMode(); calculateCampCost();">
            <span>ชำระเต็มจำนวน</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600; color: #1e293b;">
            <input type="radio" name="camp_pay_mode" value="deposit" onchange="toggleCampPayMode(); calculateCampCost();">
            <span>ชำระ 2 ครั้ง (ครั้งแรกมัดจำ)</span>
          </label>
        </div>

        <div id="camp_deposit_field_container" style="display: none; margin-bottom: 14px;">
          <label class="form-label">ยอดเงินมัดจำ (ชำระครั้งแรก/ครั้งนี้) (บาท) <span>*</span></label>
          <input type="number" id="camp_deposit_amount_input" class="form-input" placeholder="ระบุยอดเงินชำระ เช่น 2000" oninput="calculateCampCost()">
        </div>

        <!-- Summary Breakdown Card -->
        <div style="background: #ffffff; border: 1px dashed #94a3b8; border-radius: 8px; padding: 14px; line-height: 1.8; font-size: 0.95rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #475569;">💰 ยอดรวมค่าเรียนค่ายทั้งหมด:</span>
            <strong id="summary_total_fee" style="color: #0284c7; font-size: 1.05rem;">0 บาท</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #475569;">✅ ยอดเงินที่ชำระครั้งนี้:</span>
            <strong id="summary_pay_now" style="color: #16a34a; font-size: 1.05rem;">0 บาท</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #475569;">⏳ ยอดค้างชำระ (ชำระครั้งที่ 2):</span>
            <strong id="summary_remaining" style="color: #dc2626; font-size: 1.05rem;">0 บาท</strong>
          </div>
        </div>
      </div>

      <div id="camp_cost_display"'''
        content = content.replace(old_cost_card_start, new_payment_card_html, 1)

    # 4. Replace JS calculateCampCost and submitCampForm and search payment handlers
    js_search_target = 'function calculateCampCost()'
    idx_js = content.find(js_search_target)
    if idx_js != -1:
        # Find end of submitCampForm
        idx_submit_end = content.find('// --- PAYMENT SEARCH LOGIC ---', idx_js)
        if idx_submit_end != -1:
            new_js_code = '''function toggleCampPriceType() {
    const isDaily = document.querySelector('input[name="camp_price_type"]:checked') && document.querySelector('input[name="camp_price_type"]:checked').value === 'daily';
    document.getElementById('camp_daily_days_container').style.display = isDaily ? 'block' : 'none';
  }

  function toggleCampPayMode() {
    const isDeposit = document.querySelector('input[name="camp_pay_mode"]:checked') && document.querySelector('input[name="camp_pay_mode"]:checked').value === 'deposit';
    document.getElementById('camp_deposit_field_container').style.display = isDeposit ? 'block' : 'none';
  }

  function calculateCampCost() {
    const campName = document.getElementById('camp_name').value;
    const campGrade = document.getElementById('camp_grade').value;
    const priceTypeEl = document.querySelector('input[name="camp_price_type"]:checked');
    const priceType = priceTypeEl ? priceTypeEl.value : 'full';
    const dailyDays = parseInt(document.getElementById('camp_daily_days').value) || 1;
    const payModeEl = document.querySelector('input[name="camp_pay_mode"]:checked');
    const payMode = payModeEl ? payModeEl.value : 'full';
    
    let baseFull = 7900;
    let dailyRate = 1700;

    if (campName.includes('เตรียมความพร้อม') || campName.includes('เมษายน')) {
      baseFull = 4400;
      dailyRate = 1700;
    } else if (campName.includes('วางแผนติดspeed') || campName.includes('ตุลาคม') || campName.includes('สานฝันปั้นน้อง')) {
      if (campGrade.includes('ม.3')) {
        baseFull = 8900;
        dailyRate = 1900;
      } else {
        baseFull = 7900;
        dailyRate = 1700;
      }
    } else {
      if (campGrade.includes('ม.3')) {
        baseFull = 8900;
        dailyRate = 1900;
      }
    }

    let totalCost = (priceType === 'daily') ? (dailyRate * dailyDays) : baseFull;
    
    let payNow = totalCost;
    if (payMode === 'deposit') {
      const depInput = parseFloat(document.getElementById('camp_deposit_amount_input').value);
      payNow = !isNaN(depInput) && depInput > 0 ? depInput : 0;
    }
    let remaining = Math.max(0, totalCost - payNow);

    const costDisplay = document.getElementById('camp_cost_display');
    if (campName) {
      document.getElementById('camp_full_price').innerText = '฿' + baseFull.toLocaleString();
      document.getElementById('camp_daily_price').innerText = '฿' + dailyRate.toLocaleString() + ' / วัน';
      costDisplay.style.display = 'block';

      document.getElementById('summary_total_fee').innerText = totalCost.toLocaleString() + ' บาท';
      document.getElementById('summary_pay_now').innerText = payNow.toLocaleString() + ' บาท';
      document.getElementById('summary_remaining').innerText = remaining.toLocaleString() + ' บาท';
    } else {
      costDisplay.style.display = 'none';
    }
  }

  // Submit Camp Form
  function submitCampForm() {
    const form = document.getElementById('camp_form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const btn = document.getElementById('submit_camp_btn');
    const spinner = document.getElementById('btn_camp_spinner');
    const text = document.getElementById('btn_camp_text');

    btn.disabled = true;
    spinner.style.display = 'inline-block';
    text.textContent = 'กำลังส่งข้อมูล...';

    const priceTypeEl = document.querySelector('input[name="camp_price_type"]:checked');
    const priceType = priceTypeEl ? priceTypeEl.value : 'full';
    const dailyDays = parseInt(document.getElementById('camp_daily_days').value) || 1;
    const payModeEl = document.querySelector('input[name="camp_pay_mode"]:checked');
    const payMode = payModeEl ? payModeEl.value : 'full';

    const campName = document.getElementById('camp_name').value;
    const campGrade = document.getElementById('camp_grade').value;

    let baseFull = 7900;
    let dailyRate = 1700;
    if (campName.includes('เตรียมความพร้อม') || campName.includes('เมษายน')) {
      baseFull = 4400; dailyRate = 1700;
    } else if (campName.includes('วางแผนติดspeed') || campName.includes('ตุลาคม') || campName.includes('สานฝันปั้นน้อง')) {
      if (campGrade.includes('ม.3')) { baseFull = 8900; dailyRate = 1900; }
      else { baseFull = 7900; dailyRate = 1700; }
    } else {
      if (campGrade.includes('ม.3')) { baseFull = 8900; dailyRate = 1900; }
    }

    let totalCost = (priceType === 'daily') ? (dailyRate * dailyDays) : baseFull;
    let payNow = totalCost;
    if (payMode === 'deposit') {
      const depInput = parseFloat(document.getElementById('camp_deposit_amount_input').value);
      payNow = !isNaN(depInput) && depInput > 0 ? depInput : 0;
    }
    let remaining = Math.max(0, totalCost - payNow);

    const campData = {
      id: document.getElementById('camp_student_id') ? document.getElementById('camp_student_id').value : "",
      fileData: campSlipFileData,
      timestamp: new Date().toLocaleString('th-TH'),
      camp_name: campName,
      camp_year: document.getElementById('camp_year').value,
      std_grade: campGrade,
      class_section: document.getElementById('camp_room').value,
      std_name: document.getElementById('camp_std_name').value,
      std_nickname: document.getElementById('camp_std_nickname').value,
      parent_contact: document.getElementById('camp_parent_contact').value,
      std_school: document.getElementById('camp_std_school').value,
      medical_condition: document.getElementById('camp_medical_condition').value,
      shirt_size: document.getElementById('camp_shirt_size').value,
      camp_type: priceType,
      daily_count: dailyDays,
      full: totalCost,
      paid: payNow,
      outstanding: remaining,
      amount_paid: payNow,
      status: (remaining <= 0) ? "ชำระครบแล้ว" : (payNow > 0 ? "มัดจำแล้ว" : "รอตรวจสอบ")
    };

    google.script.run
      .withSuccessHandler(function() {
        document.getElementById('form_view').style.display = 'none';
        document.getElementById('success_view').style.display = 'block';
        document.querySelector('#success_view .success-title').textContent = 'ลงทะเบียนสำเร็จ!';
      })
      .withFailureHandler(function(error) {
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล: " + error.message);
        btn.disabled = false;
        spinner.style.display = 'none';
        text.textContent = 'ส่งข้อมูลลงทะเบียนค่าย';
      })
      .saveCampStudentData(campData);
  }

  '''
            content = content[:idx_js] + new_js_code + content[idx_submit_end:]

    # 5. Update renderSearchResults in JS for Search Payment
    idx_render_search = content.find('function renderSearchResults(results)')
    if idx_render_search != -1:
        idx_render_end = content.find('function calcSearchTotal()', idx_render_search)
        if idx_render_end != -1:
            new_render_code = '''function renderSearchResults(results) {
    const tbody = document.getElementById('payment_search_tbody');
    tbody.innerHTML = '';
    let hasData = false;

    if (results.regular && results.regular.length > 0) {
      results.regular.forEach((item) => {
        hasData = true;
        const tr = document.createElement('tr');
        const remain = item.remaining > 0 ? item.remaining : 0;
        tr.innerHTML = `
          <td style="padding: 8px;"><input type="checkbox" class="search_item_checkbox" data-type="regular" data-id="${item.id}" data-cost="${remain}" data-name="${item.course}" style="width:18px;height:18px;cursor:pointer;accent-color:#0084ff;" onchange="calcSearchTotal()"></td>
          <td style="padding: 8px;"><span class="badge bg-primary">วิชาเรียน</span></td>
          <td style="padding: 8px;"><strong>${item.name}</strong> - ${item.course} (คงเหลือ: ฿${remain.toLocaleString()})</td>
          <td style="padding: 8px; text-align: right;">
             <input type="number" class="search_item_input form-input" value="${remain}" style="width: 100px; text-align:right;" oninput="calcSearchTotal()">
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (results.camp && results.camp.length > 0) {
      results.camp.forEach((item) => {
        hasData = true;
        const tr = document.createElement('tr');
        const remain = item.remaining > 0 ? item.remaining : 0;
        const escTimestamp = (item.timestamp || '').replace(/"/g, '&quot;');
        tr.innerHTML = `
          <td style="padding: 8px;">
            <input type="checkbox" class="search_item_checkbox" data-type="camp" data-timestamp="${escTimestamp}" data-name="${item.campName}" data-grade="${item.grade}" data-cost="${remain}" style="width:18px;height:18px;cursor:pointer;accent-color:#16a34a;" onchange="calcSearchTotal()">
          </td>
          <td style="padding: 8px;"><span class="badge bg-success">ค่าย</span></td>
          <td style="padding: 8px;">
            <strong>${item.name}</strong> (${item.nickname || '-'}) — 
            ${item.campName} ${item.grade} ${item.room ? '('+item.room+')' : ''} 
            <div style="font-size:0.8rem; color:#64748b;">ยอดเต็ม: ฿${(item.costFull||0).toLocaleString()} | ชำระแล้ว: ฿${(item.paid||0).toLocaleString()} | คงเหลือ: <span style="color:#dc2626; font-weight:bold;">฿${remain.toLocaleString()}</span> [${item.status||'-'}]</div>
          </td>
          <td style="padding: 8px; text-align: right;">
             <input type="number" class="search_item_input form-input" value="${remain}" style="width: 100px; text-align:right;" oninput="calcSearchTotal()">
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (!hasData) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#64748b; padding:20px;">ไม่พบรายการค่ายหรือวิชาเรียนที่ต้องชำระสำหรับชื่อนี้</td></tr>';
      document.getElementById('search_payment_action_box').style.display = 'none';
    } else {
      document.getElementById('search_payment_action_box').style.display = 'block';
      calcSearchTotal();
    }
  }

  '''
            content = content[:idx_render_search] + new_render_code + content[idx_render_end:]

    # 6. Update submitSearchPaymentConfirm
    idx_sub_search = content.find('function submitSearchPaymentConfirm()')
    if idx_sub_search != -1:
        idx_sub_end = content.find('</script>', idx_sub_search)
        if idx_sub_end != -1:
            new_sub_code = '''function submitSearchPaymentConfirm() {
    const checkboxes = document.querySelectorAll('.search_item_checkbox:checked');
    if (checkboxes.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 รายการเพื่อชำระเงิน');
      return;
    }
    if (!searchSlipFileData) {
      alert('กรุณาแนบรูปภาพสลิปการโอนเงินก่อนยืนยัน');
      return;
    }

    let campItems = [];
    let selectedNames = [];
    let totalTransfer = 0;

    checkboxes.forEach(cb => {
      const tr = cb.closest('tr');
      const inputAmt = tr.querySelector('.search_item_input');
      const amt = parseFloat(inputAmt ? inputAmt.value : 0) || 0;
      totalTransfer += amt;

      const itemType = cb.getAttribute('data-type');
      if (itemType === 'camp') {
        campItems.push({
          timestamp: cb.getAttribute('data-timestamp'),
          name: document.getElementById('search_std_name').value.trim(),
          campName: cb.getAttribute('data-name'),
          costFull: parseFloat(cb.getAttribute('data-cost')) || 0,
          amount: amt
        });
      }
      selectedNames.push(cb.getAttribute('data-name'));
    });

    const btn = document.getElementById('submit_search_payment_btn');
    btn.disabled = true;
    btn.innerText = 'กำลังส่งข้อมูล...';

    const payload = {
      timestamp: new Date().toLocaleString('th-TH'),
      std_name: document.getElementById('search_std_name').value.trim(),
      selected_items: selectedNames.join(', '),
      total_amount: totalTransfer,
      transfer_amount: totalTransfer,
      camp_items: campItems,
      fileData: searchSlipFileData
    };

    google.script.run
      .withSuccessHandler(function(res) {
        btn.disabled = false;
        btn.innerText = 'ยืนยันการชำระเงิน แนบสลิป';
        if (res && res.success) {
          alert('ส่งหลักฐานการชำระเงินสำเร็จ ข้อมูลจะถูกอัปเดตในระบบ');
          execSearchPayment();
        } else {
          alert('เกิดข้อผิดพลาด: ' + (res.error || 'ไม่สามารถบันทึกได้'));
        }
      })
      .withFailureHandler(function(err) {
        btn.disabled = false;
        btn.innerText = 'ยืนยันการชำระเงิน แนบสลิป';
        alert('เกิดข้อผิดพลาด: ' + err.message);
      })
      .confirmSearchPayment(payload);
  }
'''
            content = content[:idx_sub_search] + new_sub_code + '\n' + content[idx_sub_end:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Patched {filepath} successfully!')

patch_register_html('register.html')
patch_register_html('src/register.html')
