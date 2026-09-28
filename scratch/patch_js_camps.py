import sys

sys.stdout.reconfigure(encoding='utf-8')

new_js_camps_module = '''// Camps Dashboard Feature
var campsFiltersInitialized = false;

function initCampsFilters(callback) {
  google.script.run.withSuccessHandler(function(res) {
    if (res) {
      var yearSelect = document.getElementById('camps_year_select');
      var nameSelect = document.getElementById('camps_name_select');
      
      if (yearSelect && res.academicYears) {
        yearSelect.innerHTML = '<option value="all">ทั้งหมด</option>';
        res.academicYears.forEach(function(y) {
          yearSelect.innerHTML += '<option value="' + y + '">' + y + '</option>';
        });
      }
      if (nameSelect && res.campNames) {
        nameSelect.innerHTML = '<option value="all">ทั้งหมด</option>';
        res.campNames.forEach(function(c) {
          nameSelect.innerHTML += '<option value="' + c + '">' + c + '</option>';
        });
      }
      campsFiltersInitialized = true;
      if (callback) callback();
    }
  }).getCampsFilterOptions();
}

function getCampDefaultFee(campName, grade) {
  campName = String(campName || '');
  grade = String(grade || '');
  if (campName.includes('เตรียมความพร้อม') || campName.includes('เมษายน')) {
    return 4400;
  } else if (campName.includes('วางแผนติดspeed') || campName.includes('ตุลาคม') || campName.includes('สานฝันปั้นน้อง')) {
    if (grade.includes('ม.3')) return 8900;
    return 7900;
  } else {
    if (grade.includes('ม.3')) return 8900;
    return 7900;
  }
}

// Manage / Edit Modal (ปุ่มจัดการ)
function showCampPaymentModal(timestamp) {
  var item = null;
  if (window.currentCampsData) {
    item = currentCampsData.find(function(c) {
      return String(c.timestamp) === String(timestamp);
    });
  }
  if (!item) {
    Swal.fire('Error', 'ไม่พบข้อมูลนักเรียนคนนี้ กรุณารีเฟรชข้อมูลแล้วลองใหม่', 'error');
    return;
  }

  var modalEl = document.getElementById('camp_payment_modal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = 'modal-backdrop';
    modalEl.id = 'camp_payment_modal';
    modalEl.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
    modalEl.innerHTML = '<div class="custom-modal" style="background: #ffffff; border-radius: 16px; width: 90%; max-width: 750px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);"><div id="camp_payment_modal_content"></div></div>';
    document.body.appendChild(modalEl);
  }

  var contentEl = document.getElementById('camp_payment_modal_content');
  var channels = ['โอนเงิน (แนบสลิป)', 'โอนธนาคาร', 'QR พร้อมเพย์', 'เงินสด', 'อื่นๆ'];
  var channelOptions = function(selected) {
    var opts = '<option value="">เลือกช่องทาง</option>';
    channels.forEach(function(ch) {
      opts += '<option value="' + ch + '"' + (ch === selected ? ' selected' : '') + '>' + ch + '</option>';
    });
    return opts;
  };

  var defaultFull = item.full || getCampDefaultFee(item.camp_name, item.std_grade);
  var defaultPaid = item.paid || 0;
  var defaultOutst = Math.max(0, defaultFull - defaultPaid);

  var html = '<div style="padding: 24px;">';
  html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">';
  html += '<h4 style="margin: 0; color: #1e293b; font-weight: 700;">⚙️ จัดการ & แก้ไขข้อมูลนักเรียนค่าย</h4>';
  html += '<button onclick="closeCampPaymentModal()" style="background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8;">&times;</button>';
  html += '</div>';

  html += '<input type="hidden" id="camp_pay_timestamp" value="' + (item.timestamp || '') + '">';

  // 1. Student Info Section
  html += '<div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">';
  html += '<h6 style="color: #2563eb; margin: 0 0 10px 0; font-weight: 700;">👤 ข้อมูลทั่วไปนักเรียน</h6>';
  html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">';
  html += '<div><label style="font-size:0.8rem; font-weight:600;">ชื่อ-นามสกุล</label><input type="text" id="camp_edit_std_name" class="form-control form-control-sm" value="' + (item.std_name || '') + '"></div>';
  html += '<div><label style="font-size:0.8rem; font-weight:600;">ชื่อเล่น</label><input type="text" id="camp_edit_std_nickname" class="form-control form-control-sm" value="' + (item.std_nickname || '') + '"></div>';
  html += '<div><label style="font-size:0.8rem; font-weight:600;">เบอร์โทรผู้ปกครอง</label><input type="text" id="camp_edit_parent_phone" class="form-control form-control-sm" value="' + (item.parent_phone || '') + '"></div>';
  html += '<div><label style="font-size:0.8rem; font-weight:600;">โรงเรียน</label><input type="text" id="camp_edit_std_school" class="form-control form-control-sm" value="' + (item.std_school || '') + '"></div>';
  html += '<div><label style="font-size:0.8rem; font-weight:600;">โรคประจำตัว/แพ้อาหาร</label><input type="text" id="camp_edit_medical" class="form-control form-control-sm" value="' + (item.medical_condition || '') + '"></div>';
  html += '<div><label style="font-size:0.8rem; font-weight:600;">Size เสื้อ</label><input type="text" id="camp_edit_shirt" class="form-control form-control-sm" value="' + (item.shirt_size || '') + '"></div>';
  html += '</div></div>';

  // 2. Camp Details Section
  html += '<div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">';
  html += '<h6 style="color: #2563eb; margin: 0 0 10px 0; font-weight: 700;">🏫 ข้อมูลค่าย & ห้องเรียน</h6>';
  html += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">';
  html += '<div style="grid-column: span 2;"><label style="font-size:0.8rem; font-weight:600;">ชื่อค่าย</label><input type="text" id="camp_edit_camp_name" class="form-control form-control-sm" value="' + (item.camp_name || '') + '"></div>';
  html += '<div><label style="font-size:0.8rem; font-weight:600;">ปีการศึกษา</label><input type="text" id="camp_edit_camp_year" class="form-control form-control-sm" value="' + (item.camp_year || '') + '"></div>';
  html += '<div><label style="font-size:0.8rem; font-weight:600;">ระดับชั้น</label><input type="text" id="camp_edit_grade" class="form-control form-control-sm" value="' + (item.std_grade || '') + '"></div>';
  html += '<div style="grid-column: span 2;"><label style="font-size:0.8rem; font-weight:600;">ห้องเรียน</label><input type="text" id="camp_edit_room" class="form-control form-control-sm" value="' + (item.class_section || '') + '"></div>';
  html += '<div style="grid-column: span 2;"><label style="font-size:0.8rem; font-weight:600;">สถานะ</label>';
  html += '<select id="camp_edit_status" class="form-select form-select-sm">';
  var statusOpts = ['รอตรวจสอบ', 'มัดจำแล้ว', 'ยืนยันแล้ว', 'ชำระครบแล้ว', 'ยกเลิก'];
  statusOpts.forEach(function(st) {
    html += '<option value="' + st + '"' + (st === item.status ? ' selected' : '') + '>' + st + '</option>';
  });
  html += '</select></div>';
  html += '</div></div>';

  // 3. Payment Section
  html += '<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; margin-bottom: 16px;">';
  html += '<h6 style="color: #166534; margin: 0 0 10px 0; font-weight: 700;">💳 การชำระเงิน</h6>';
  html += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">';
  html += '<div><label style="font-size:0.8rem; font-weight:600;">ยอดเต็ม (บาท)</label><input type="number" id="camp_pay_full" class="form-control form-control-sm" value="' + defaultFull + '" oninput="calcCampOutstanding()"></div>';
  html += '<div><label style="font-size:0.8rem; font-weight:600;">ชำระแล้ว (บาท)</label><input type="number" id="camp_pay_paid" class="form-control form-control-sm" value="' + defaultPaid + '" oninput="calcCampOutstanding()"></div>';
  html += '<div><label style="font-size:0.8rem; font-weight:600; color:#dc2626;">ค้างชำระ (บาท)</label><input type="number" id="camp_pay_outstanding" class="form-control form-control-sm" value="' + defaultOutst + '" readonly style="background:#fee2e2; font-weight:bold; color:#dc2626;"></div>';
  html += '</div>';

  for (var r = 1; r <= 3; r++) {
    var dateVal = item['pay_r' + r + '_date'] || '';
    var amtVal = item['pay_r' + r + '_amount'] || '';
    var chVal = item['pay_r' + r + '_channel'] || '';

    html += '<div style="border: 1px solid #cbd5e1; background:#ffffff; border-radius: 8px; padding: 10px; margin-bottom: 8px;">';
    html += '<div style="font-weight: 600; font-size: 0.8rem; margin-bottom: 6px; color: #4338ca;">💳 งวดที่ ' + r + '</div>';
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">';
    html += '<div><label style="font-size:0.75rem;">วันที่</label><input type="date" id="camp_pay_r' + r + '_date" class="form-control form-control-sm" value="' + dateVal + '"></div>';
    html += '<div><label style="font-size:0.75rem;">จำนวนเงิน (บาท)</label><input type="number" id="camp_pay_r' + r + '_amount" class="form-control form-control-sm" value="' + amtVal + '" oninput="recalcPaidFromRounds()"></div>';
    html += '<div><label style="font-size:0.75rem;">ช่องทาง</label><select id="camp_pay_r' + r + '_channel" class="form-select form-select-sm">' + channelOptions(chVal) + '</select></div>';
    html += '</div></div>';
  }

  if (item.slip_url && item.slip_url !== '-' && item.slip_url.trim() !== '') {
    html += '<div style="margin-top: 10px;"><a href="' + item.slip_url + '" target="_blank" class="btn btn-sm btn-outline-primary">🔍 ดูสลิปหลักฐานการโอน</a></div>';
  }
  html += '</div>';

  html += '<div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">';
  html += '<button class="btn btn-secondary btn-sm" onclick="closeCampPaymentModal()">ยกเลิก</button>';
  html += '<button class="btn btn-success btn-sm" onclick="saveCampPaymentData()" style="padding: 6px 16px; font-weight: 600;">💾 บันทึกการแก้ไข</button>';
  html += '</div>';
  html += '</div>';

  contentEl.innerHTML = html;
  modalEl.style.display = 'flex';
}

function closeCampPaymentModal() {
  var modalEl = document.getElementById('camp_payment_modal');
  if (modalEl) modalEl.style.display = 'none';
}

function calcCampOutstanding() {
  var full = parseFloat(document.getElementById('camp_pay_full').value) || 0;
  var paid = parseFloat(document.getElementById('camp_pay_paid').value) || 0;
  var outst = Math.max(0, full - paid);
  document.getElementById('camp_pay_outstanding').value = outst;
}

function recalcPaidFromRounds() {
  var r1 = parseFloat(document.getElementById('camp_pay_r1_amount').value) || 0;
  var r2 = parseFloat(document.getElementById('camp_pay_r2_amount').value) || 0;
  var r3 = parseFloat(document.getElementById('camp_pay_r3_amount').value) || 0;
  var totalPaid = r1 + r2 + r3;
  document.getElementById('camp_pay_paid').value = totalPaid;
  calcCampOutstanding();
}

function saveCampPaymentData() {
  var ts = document.getElementById('camp_pay_timestamp').value;
  var full = parseFloat(document.getElementById('camp_pay_full').value) || 0;
  var paid = parseFloat(document.getElementById('camp_pay_paid').value) || 0;
  var outst = parseFloat(document.getElementById('camp_pay_outstanding').value) || 0;

  var updatedData = {
    std_name: document.getElementById('camp_edit_std_name').value.trim(),
    std_nickname: document.getElementById('camp_edit_std_nickname').value.trim(),
    parent_phone: document.getElementById('camp_edit_parent_phone').value.trim(),
    std_school: document.getElementById('camp_edit_std_school').value.trim(),
    medical_condition: document.getElementById('camp_edit_medical').value.trim(),
    shirt_size: document.getElementById('camp_edit_shirt').value.trim(),
    camp_name: document.getElementById('camp_edit_camp_name').value.trim(),
    camp_year: document.getElementById('camp_edit_camp_year').value.trim(),
    std_grade: document.getElementById('camp_edit_grade').value.trim(),
    class_section: document.getElementById('camp_edit_room').value.trim(),
    status: document.getElementById('camp_edit_status').value,
    full: full,
    paid: paid,
    outstanding: outst,
    pay_r1_date: document.getElementById('camp_pay_r1_date').value,
    pay_r1_amount: document.getElementById('camp_pay_r1_amount').value,
    pay_r1_channel: document.getElementById('camp_pay_r1_channel').value,
    pay_r2_date: document.getElementById('camp_pay_r2_date').value,
    pay_r2_amount: document.getElementById('camp_pay_r2_amount').value,
    pay_r2_channel: document.getElementById('camp_pay_r2_channel').value,
    pay_r3_date: document.getElementById('camp_pay_r3_date').value,
    pay_r3_amount: document.getElementById('camp_pay_r3_amount').value,
    pay_r3_channel: document.getElementById('camp_pay_r3_channel').value
  };

  Swal.fire({
    title: 'กำลังบันทึกข้อมูล...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  google.script.run
    .withSuccessHandler(function(res) {
      if (res && res.success) {
        Swal.fire({ icon: 'success', title: 'บันทึกข้อมูลสำเร็จ', showConfirmButton: false, timer: 1500 });
        closeCampPaymentModal();
        loadCampsData();
      } else {
        Swal.fire('Error', res.error || 'บันทึกไม่สำเร็จ', 'error');
      }
    })
    .withFailureHandler(function(err) {
      Swal.fire('Error', err.message, 'error');
    })
    .updateCampStudentData(ts, updatedData);
}

function loadCampsData() {
  var tbody = document.getElementById('camps_table_body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="16" class="text-center">กำลังโหลดข้อมูล...</td></tr>';

  if (!campsFiltersInitialized) {
    initCampsFilters(function() {
      doLoadCampsData();
    });
  } else {
    doLoadCampsData();
  }
}

function doLoadCampsData() {
  var yearEl = document.getElementById('camps_year_select');
  var nameEl = document.getElementById('camps_name_select');
  var year = yearEl ? yearEl.value : 'all';
  var name = nameEl ? nameEl.value : 'all';

  var tbody = document.getElementById('camps_table_body');

  google.script.run.withSuccessHandler(function(data) {
    currentCampsData = data || [];

    var roomSelect = document.getElementById('camps_room_select');
    if (roomSelect) {
      var currentRoom = roomSelect.value;
      var roomsSet = new Set();
      currentCampsData.forEach(function(item) {
        if (item.class_section && item.class_section.trim() !== '') {
          roomsSet.add(item.class_section.trim());
        }
      });
      roomSelect.innerHTML = '<option value="all">ทุกห้องเรียน</option>';
      Array.from(roomsSet).sort().forEach(function(rm) {
        var selected = rm === currentRoom ? ' selected' : '';
        roomSelect.innerHTML += '<option value="' + rm + '"' + selected + '>' + rm + '</option>';
      });
    }

    renderCampsTable();
  }).withFailureHandler(function(err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="16" class="text-center text-danger">ไม่สามารถโหลดข้อมูลได้: ' + (err.message || err) + '</td></tr>';
  }).getCampsData(year, name);
}

function renderCampsTable() {
  var tbody = document.getElementById('camps_table_body');
  if (!tbody) return;
  
  var roomEl = document.getElementById('camps_room_select');
  var roomFilter = roomEl ? roomEl.value : 'all';

  var filteredData = currentCampsData.filter(function(item) {
    if (roomFilter !== 'all' && (item.class_section || '').trim() !== roomFilter) {
      return false;
    }
    return true;
  });

  // Summary Container
  var summaryContainer = document.getElementById('camps_summary_container');
  if (!summaryContainer) {
    summaryContainer = document.createElement('div');
    summaryContainer.id = 'camps_summary_container';
    summaryContainer.style.marginBottom = '15px';
    var parentNode = tbody.closest('.table-container') || tbody.parentElement;
    if (parentNode && parentNode.parentElement) {
      parentNode.parentElement.insertBefore(summaryContainer, parentNode);
    }
  }

  // Summary calculation with real prices
  var totalStudents = filteredData.length;
  var totalFullFee = 0;
  var totalPaid = 0;
  var totalOutstanding = 0;
  var finCamps = {};

  filteredData.forEach(function(item) {
    var full = parseFloat(item.full);
    if (isNaN(full) || full <= 0) {
      full = getCampDefaultFee(item.camp_name, item.std_grade);
    }
    var paid = parseFloat(item.paid) || 0;
    var outst = Math.max(0, full - paid);

    totalFullFee += full;
    totalPaid += paid;
    totalOutstanding += outst;

    var cName = (item.camp_name || 'ไม่ระบุ').trim();
    if (!finCamps[cName]) {
      finCamps[cName] = { full: 0, paid: 0, outst: 0, count: 0 };
    }
    finCamps[cName].full += full;
    finCamps[cName].paid += paid;
    finCamps[cName].outst += outst;
    finCamps[cName].count += 1;
  });

  var summaryHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">';
  summaryHtml += '<div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 14px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);"><div style="font-size: 0.85rem; opacity: 0.9;">👥 จำนวนนักเรียนค่ายทั้งหมด</div><div style="font-size: 1.6rem; font-weight: bold; margin-top: 4px;">' + totalStudents.toLocaleString() + ' คน</div></div>';
  summaryHtml += '<div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: white; padding: 14px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);"><div style="font-size: 0.85rem; opacity: 0.9;">💰 ยอดรวมค่าเรียนตามจริง</div><div style="font-size: 1.6rem; font-weight: bold; margin-top: 4px;">฿' + totalFullFee.toLocaleString() + '</div></div>';
  summaryHtml += '<div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 14px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);"><div style="font-size: 0.85rem; opacity: 0.9;">✅ ยอดที่ชำระแล้ว</div><div style="font-size: 1.6rem; font-weight: bold; margin-top: 4px;">฿' + totalPaid.toLocaleString() + '</div></div>';
  summaryHtml += '<div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 14px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);"><div style="font-size: 0.85rem; opacity: 0.9;">⏳ ยอดค้างชำระรวม</div><div style="font-size: 1.6rem; font-weight: bold; margin-top: 4px;">฿' + totalOutstanding.toLocaleString() + '</div></div>';
  summaryHtml += '</div>';

  summaryContainer.innerHTML = summaryHtml;

  if (filteredData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="16" class="text-center text-muted" style="padding: 30px;">ไม่พบข้อมูลนักเรียนค่ายตามเงื่อนไขที่เลือก</td></tr>';
    return;
  }

  // Render Table Rows
  var html = '';
  var grouped = {};

  filteredData.forEach(function(item) {
    var cName = item.camp_name || 'ไม่ระบุ';
    var cGroup = (item.std_grade || '-') + ' / ' + (item.class_section || '-');
    if (!grouped[cName]) grouped[cName] = {};
    if (!grouped[cName][cGroup]) grouped[cName][cGroup] = [];
    grouped[cName][cGroup].push(item);
  });

  for (var cName in grouped) {
    html += "<tr style='background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);'><td colspan='16' style='font-weight:bold; color:#1e293b; padding: 10px; font-size: 1.05rem;'>🏫 ค่าย: " + cName + "</td></tr>";
    
    for (var cGroup in grouped[cName]) {
      html += "<tr style='background-color: #f8fafc;'><td colspan='16' style='font-weight:600; color:#334155; padding: 8px 10px 8px 30px; border-bottom: 2px solid #e2e8f0;'>📂 ชั้น/ห้อง: " + cGroup + " <span class='badge bg-secondary' style='margin-left: 8px; font-weight: normal;'>" + grouped[cName][cGroup].length + " คน</span></td></tr>";
      
      grouped[cName][cGroup].forEach(function(item) {
        var full = parseFloat(item.full) || getCampDefaultFee(item.camp_name, item.std_grade);
        var paid = parseFloat(item.paid) || 0;
        var outst = Math.max(0, full - paid);
        var escTs = (item.timestamp || '').toString().replace(/'/g, "\\'");

        html += "<tr>";
        var displayDate = item.timestamp ? String(item.timestamp).split('T')[0] : "-";
        html += "<td>" + displayDate + "</td>";
        html += "<td>" + (item.camp_name || "-") + "</td>";
        html += "<td>" + (item.camp_year || "-") + "</td>";
        html += "<td>" + (item.std_grade || "-") + "</td>";
        html += "<td>" + (item.class_section || "-") + "</td>";
        html += "<td><strong>" + (item.std_name || "-") + "</strong></td>";
        html += "<td>" + (item.std_nickname || "-") + "</td>";
        html += "<td>" + (item.parent_phone || "-") + "</td>";
        html += "<td>" + (item.std_school || "-") + "</td>";
        html += "<td>" + (item.medical_condition || "-") + "</td>";
        html += "<td>" + (item.shirt_size || "-") + "</td>";
        
        if (item.slip_url && item.slip_url !== '-' && item.slip_url.trim() !== '') {
          html += "<td><a href='" + item.slip_url + "' target='_blank' class='btn btn-sm btn-outline-primary' style='font-size:0.75rem; padding: 2px 5px;'>ดูสลิป</a></td>";
        } else {
          html += "<td>-</td>";
        }
        
        // Outstanding Fee
        var outstColor = outst > 0 ? "color: #dc2626; font-weight: bold;" : "color: #16a34a;";
        html += "<td style='" + outstColor + "'>฿" + outst.toLocaleString() + "</td>";
        
        // Manage Button (ปุ่มจัดการ)
        html += "<td><button class='btn btn-sm btn-warning' style='font-size:0.75rem; padding: 3px 8px; font-weight:600;' onclick=\"showCampPaymentModal('" + escTs + "')\">🪙 จัดการ</button></td>";
        
        // Status Button (กดยืนยัน)
        var currentStatus = (item.status || "").trim();
        if (currentStatus === "ยืนยันแล้ว" || currentStatus === "ชำระครบแล้ว") {
          html += "<td><span class='badge bg-success' style='padding: 6px 10px;'>" + currentStatus + "</span></td>";
        } else {
          html += "<td>";
          if (currentStatus) {
            html += "<span class='badge bg-warning text-dark' style='margin-bottom:4px; display:inline-block;'>" + currentStatus + "</span><br/>";
          }
          html += "<button class='btn btn-sm btn-success' style='font-size:0.75rem; padding: 3px 8px;' onclick=\"confirmCampStatus('" + escTs + "')\">กดยืนยัน</button>";
          html += "</td>";
        }
        
        // Delete Button (ตรงลบ ให้กดแล้วสามารถลบข้อมูลออกจากฐานข้อมูลได้เลย)
        html += "<td style='text-align:center;'><button class='btn btn-sm btn-danger' style='padding: 3px 8px; font-size: 0.75rem;' onclick=\"deleteCampStudent('" + escTs + "')\" title='ลบข้อมูล'>🗑️ ลบ</button></td>";
        
        html += "</tr>";
      });
    }
  }
  
  tbody.innerHTML = html;
}

function confirmCampStatus(timestamp) {
  Swal.fire({
    title: 'ยืนยันสถานะ?',
    text: 'คุณต้องการยืนยันสถานะเป็น "ยืนยันแล้ว" สำหรับนักเรียนคนนี้ใช่หรือไม่?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ยืนยันเลย',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
      google.script.run
        .withSuccessHandler(function(res) {
          if (res && res.success) {
            Swal.fire({ icon: 'success', title: 'ยืนยันสถานะสำเร็จ', showConfirmButton: false, timer: 1200 });
            var itemIndex = currentCampsData.findIndex(function(item) { return String(item.timestamp) === String(timestamp); });
            if (itemIndex > -1) currentCampsData[itemIndex].status = 'ยืนยันแล้ว';
            renderCampsTable();
          } else {
            Swal.fire('Error', (res ? res.error : '') || 'ยืนยันไม่สำเร็จ', 'error');
          }
        })
        .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
        .updateCampStatus(timestamp, 'ยืนยันแล้ว');
    }
  });
}

function deleteCampStudent(timestamp) {
  Swal.fire({
    title: 'ยืนยันการลบข้อมูล?',
    text: 'คุณต้องการ "ลบ" ข้อมูลนักเรียนคนนี้ออกจากฐานข้อมูลค่ายใช่หรือไม่? (ลบแล้วจะไม่สามารถกู้คืนได้)',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'ใช่, ลบออกเลย',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({ title: 'กำลังลบข้อมูลออกจากฐานข้อมูล...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
      google.script.run
        .withSuccessHandler(function(res) {
          if (res && res.success) {
            Swal.fire({ icon: 'success', title: 'ลบข้อมูลสำเร็จแล้ว', showConfirmButton: false, timer: 1500 });
            loadCampsData();
          } else {
            Swal.fire('Error', (res ? res.error : '') || 'ลบข้อมูลไม่สำเร็จ', 'error');
          }
        })
        .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
        .deleteCampStudentByTimestamp(timestamp);
    }
  });
}
'''

for target_js in ['src/JavaScript.js', 'JavaScript.js']:
    with open(target_js, 'r', encoding='utf-8') as f:
        content = f.read()

    idx_start = content.find('// Camps Dashboard Feature')
    if idx_start != -1:
        # Find end of deleteCampStudent
        idx_end = content.find('function showDebtorsModal', idx_start)
        if idx_end == -1:
            idx_end = content.find('// Debtors', idx_start)
        if idx_end == -1:
            idx_end = len(content)
        content = content[:idx_start] + new_js_camps_module + '\n\n' + content[idx_end:]
    else:
        content += '\n\n' + new_js_camps_module

    with open(target_js, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Patched {target_js} successfully!')
