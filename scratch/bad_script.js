
  // Camp Form Logic
  function switchRegistrationTab(tab) {
    document.getElementById('tab_regular').classList.remove('active');
    document.getElementById('tab_camp').classList.remove('active');
    document.getElementById('regular_section').style.display = 'none';
    document.getElementById('camp_section').style.display = 'none';

    if (tab === 'regular') {
      document.getElementById('tab_regular').classList.add('active');
      document.getElementById('regular_section').style.display = 'block';
    } else if (tab === 'camp') {
      document.getElementById('tab_camp').classList.add('active');
      document.getElementById('camp_section').style.display = 'block';
    }
  }

  // Populate Years 2569 to 2578
  document.addEventListener('DOMContentLoaded', () => {
    const yearSelect = document.getElementById('camp_year');
    if(yearSelect) {
      for (let y = 2569; y <= 2578; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = 'ปี ' + y;
        yearSelect.appendChild(opt);
      }
    }
  });

  // Render Rooms based on Grade
  function renderCampRooms() {
    const grade = document.getElementById('camp_grade').value;
    const roomSelect = document.getElementById('camp_room');
    roomSelect.innerHTML = '<option value="">-- เลือกห้องเรียน --</option>';
    
    let rooms = [];
    if (grade === 'ป.6') {
      rooms = ['ห้องพิเศษ Gifted', 'ห้องพิเศษ EP', 'ห้องพิเศษ Smart Com', 'ห้องปกติ'];
    } else if (grade === 'ม.3') {
      rooms = ['ห้องSciPro', 'EP วิทย์-คณิต', 'EP ภาษา', 'เตรียมนิติศาสตร์', 'เตรียมวิศวะ', 'ศิลป์-คณิต', 'วิทย์-คณิต', 'ศิลป์ภาษา', 'วิทย์-คอม'];
    }

    rooms.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      roomSelect.appendChild(opt);
    });
  }

  function toggleCampPriceType() {
    const isDaily = document.querySelector('input[name="camp_price_type"]:checked') && document.querySelector('input[name="camp_price_type"]:checked').value === 'daily';
    document.getElementById('camp_daily_days_container').style.display = isDaily ? 'block' : 'none';
  }

  function toggleCampPayMode() {
    const isDeposit = document.querySelector('input[name="camp_pay_mode"]:checked') && document.querySelector('input[name="camp_pay_mode"]:checked').value === 'deposit';
    document.getElementById('camp_deposit_field_container').style.display = isDeposit ? 'block' : 'none';
  }

  let unpaidSlipFileData = null;
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

    const payDateVal = document.getElementById('camp_pay_date') ? document.getElementById('camp_pay_date').value : '';
    const payTimeVal = document.getElementById('camp_pay_time') ? document.getElementById('camp_pay_time').value : '';
    const fullDateTime = (payDateVal && payTimeVal) ? (payDateVal + ' ' + payTimeVal) : new Date().toLocaleString('th-TH');

    const campData = {
      id: document.getElementById('camp_student_id') ? document.getElementById('camp_student_id').value : "",
      fileData: campSlipFileData,
      timestamp: fullDateTime,
      pay_date: payDateVal,
      pay_time: payTimeVal,
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

  // --- PAYMENT SEARCH LOGIC ---
  let searchSlipFileData = null;
  let searchResultsData = null;

  function handleSearchFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('ขนาดไฟล์ใหญ่เกิน 10MB กรุณาเลือกไฟล์ใหม่');
        event.target.value = '';
        return;
      }
      document.getElementById('search_upload_status').textContent = 'กำลังประมวลผลรูปภาพ...';
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64Data = e.target.result.split(',')[1];
        searchSlipFileData = {
          fileName: file.name,
          mimeType: file.type,
          base64: base64Data
        };
        document.getElementById('search_upload_status').textContent = 'เลือกไฟล์เรียบร้อย: ' + file.name;
        
        const previewContainer = document.getElementById('search_preview_container');
        const previewImg = document.getElementById('search_preview_img');
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }

  function execSearchPayment() {
    const nameInput = document.getElementById('search_std_name').value.trim();
    if (!nameInput) {
      alert('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    const spinner = document.getElementById('search_spinner');
    spinner.style.display = 'inline-block';
    
    google.script.run
      .withSuccessHandler(function(results) {
        spinner.style.display = 'none';
        searchResultsData = results;
        renderSearchResults(results);
      })
      .withFailureHandler(function(error) {
        spinner.style.display = 'none';
        alert("เกิดข้อผิดพลาดในการค้นหา: " + error.message);
      })
      .searchStudentPayment(nameInput);
  }

  function renderSearchResults(results) {
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

  function calcSearchTotal() {
    const checkboxes = document.querySelectorAll('.search_item_checkbox');
    const inputs = document.querySelectorAll('.search_item_input');
    let total = 0;
    checkboxes.forEach((cb, i) => {
      if (cb.checked) {
        total += parseFloat(inputs[i].value) || 0;
      }
    });
    document.getElementById('payment_search_total').textContent = '฿' + total.toLocaleString();
    document.getElementById('payment_search_transfer').value = total > 0 ? total : '';
  }

  function submitSearchPayment() {
    if (!searchSlipFileData) {
      alert('กรุณาแนบสลิปโอนเงิน');
      return;
    }

    const checkboxes = document.querySelectorAll('.search_item_checkbox');
    const inputs = document.querySelectorAll('.search_item_input');
    let selectedItems = [];
    let total = 0;

    checkboxes.forEach((cb, i) => {
      if (cb.checked) {
        let val = parseFloat(inputs[i].value) || 0;
        total += val;
        selectedItems.push(`${cb.dataset.name} (฿${val})`);
      }
    });

    if (selectedItems.length === 0) {
      alert('กรุณาเลือกรายการที่ต้องการชำระเงิน');
      return;
    }

    const transferAmount = document.getElementById('payment_search_transfer').value;
    if (!transferAmount || transferAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่โอน');
      return;
    }

    const btn = document.getElementById('submit_search_btn');
    const spinner = document.getElementById('btn_search_spinner');
    const text = document.getElementById('btn_search_text');

    btn.disabled = true;
    spinner.style.display = 'inline-block';
    text.textContent = 'กำลังส่งข้อมูล...';

    const payload = {
      std_name: document.getElementById('search_std_name').value,
      selected_items: selectedItems.join(', '),
      total_amount: total,
      transfer_amount: transferAmount,
      fileData: searchSlipFileData,
      timestamp: new Date().toLocaleString('th-TH')
    };

    google.script.run
      .withSuccessHandler(function() {
        document.getElementById('form_view').style.display = 'none';
        document.getElementById('success_view').style.display = 'block';
        document.querySelector('#success_view .success-title').textContent = 'ส่งหลักฐานชำระเงินเรียบร้อย!';
      })
      .withFailureHandler(function(error) {
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล: " + error.message);
        btn.disabled = false;
        spinner.style.display = 'none';
        text.textContent = 'ส่งข้อมูลชำระเงิน';
      })
      .submitPaymentSlipSearch(payload);
  }


document.addEventListener('DOMContentLoaded', function() {
    const btnSearchStudent = document.getElementById('btn_search_student');
    if (btnSearchStudent) {
        btnSearchStudent.addEventListener('click', function() {
            const nameInput = document.getElementById('std_name');
            const name = nameInput ? nameInput.value.trim() : '';
            if (!name) {
                alert("กรุณากรอกชื่อ - นามสกุลที่ต้องการค้นหา");
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
                    if (res && res.success && res.data) {
                        const data = res.data;
                        
                        if (data.id) {
                            const el = document.getElementById('student_id');
                            if(el) el.value = data.id;
                        }
                        if (data.Grade) {
                            const el = document.getElementById('std_grade');
                            if(el) { el.value = data.Grade; el.dispatchEvent(new Event('change')); }
                        }
                        if (data.BranchLearn) {
                            const el = document.getElementById('branch_learn');
                            if(el) { el.value = data.BranchLearn; el.dispatchEvent(new Event('change')); }
                        }
                        if (data.Nickname) {
                            const el = document.getElementById('std_nickname');
                            if(el) el.value = data.Nickname;
                        }
                        if (data.School) {
                            const el = document.getElementById('std_school');
                            if(el) el.value = data.School;
                        }
                        if (data.Contact) {
                            const el = document.getElementById('parent_contact');
                            if(el) el.value = data.Contact;
                        }
                        if (data.LineID) {
                            const el = document.getElementById('line_id');
                            if(el) el.value = data.LineID;
                        }
                        alert("ค้นพบข้อมูลนักเรียนเรียบร้อยแล้ว ระบบได้เติมข้อมูลให้โดยอัตโนมัติ");
                    } else {
                        alert("ไม่พบข้อมูลนักเรียนในระบบ หรือพิมพ์ชื่อ-นามสกุลไม่ถูกต้อง");
                    }
                })
                .withFailureHandler(function(err) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    alert("เกิดข้อผิดพลาดในการค้นหา: " + err.message);
                })
                .getStudentData(name);
        });
    }

    const btnSearchStudentCamp = document.getElementById('btn_search_student_camp');
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
    }
    }
});
