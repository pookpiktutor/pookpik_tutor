function loadCampsData() {
  var tbody = document.getElementById('camps_table_body');
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="15" class="text-center">กำลังโหลดข้อมูล...</td></tr>';
  
  // Initialize filters from sheet data on first load
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
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="15" class="text-center">กำลังโหลดข้อมูล...</td></tr>';
  

  google.script.run.withSuccessHandler(function(data) {
    if (data && data.error) {
      tbody.innerHTML = '<tr><td colspan="15" class="text-center text-danger">เกิดข้อผิดพลาด: ' + data.error + '</td></tr>';
      return;
    }
    
    currentCampsData = data || [];
    
    // Populate room dropdown
    var roomSelect = document.getElementById('camps_room_select');
    if (roomSelect) {
      var currentRoom = roomSelect.value;
      var rooms = new Set();
      currentCampsData.forEach(function(item) {
        if (item.class_section && item.class_section.trim() !== '' && item.class_section !== '-') {
          rooms.add(item.class_section.trim());
        }
      });
      var roomOptions = '<option value="all">ทั้งหมด</option>';
      Array.from(rooms).sort().forEach(function(r) {
        roomOptions += '<option value="' + r + '">' + r + '</option>';
      });
      roomSelect.innerHTML = roomOptions;
      if (rooms.has(currentRoom)) {
        roomSelect.value = currentRoom;
      } else {
        roomSelect.value = 'all';
      }
    }
    
    renderCampsTable();
  }).getCampsData(year, name);
}

function renderCampsTable() {
  var tbody = document.getElementById('camps_table_body');
  if (!tbody) return;
  
  var roomEl = document.getElementById('camps_room_select');
  var selectedRoom = roomEl ? roomEl.value : 'all';
  
  var filteredData = currentCampsData.filter(function(item) {
    if (selectedRoom === 'all') return true;
    var itemRoom = (item.class_section || '').toString().trim();
    return itemRoom === selectedRoom;
  });
  
  // Calculate Summaries
  var summaryContainer = document.getElementById('camps_summary_container');
  if (summaryContainer) {
    var totalStudents = filteredData.length;
    var countsByCamp = {};
    filteredData.forEach(function(item) {
      var cname = item.camp_name || 'ไม่ระบุค่าย';
      countsByCamp[cname] = (countsByCamp[cname] || 0) + 1;
    });
    
    var summaryHtml = `
      <div class="glass-panel widget-card" style="border-left: 4px solid var(--color-primary); flex-direction: column; align-items: flex-start; gap: 8px; padding: 12px 16px; min-width: 150px;">
        <div style="font-size: 0.85rem; color: var(--text-muted);">จำนวนนักเรียนรวม</div>
        <div style="font-weight: 600; font-size: 1.5rem; color: var(--text-main);">${totalStudents} <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted);">คน</span></div>
      </div>
    `;
    
    Object.keys(countsByCamp).sort().forEach(function(cname) {
      summaryHtml += `
        <div class="glass-panel widget-card" style="border-left: 4px solid var(--color-success); flex-direction: column; align-items: flex-start; gap: 8px; padding: 12px 16px; min-width: 150px;">
          <div style="font-size: 0.85rem; color: var(--text-muted);">${cname}</div>
          <div style="font-weight: 600; font-size: 1.5rem; color: var(--text-main);">${countsByCamp[cname]} <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted);">คน</span></div>
        </div>
      `;
    });
    summaryContainer.innerHTML = summaryHtml;
  }
  
  // Cross-tab Summary Table: Camp × Room
  var crosstabContainer = document.getElementById('camps_crosstab_container');
  if (crosstabContainer) {
    // Use ALL data (not filtered by room) for the cross-tab
    var allData = currentCampsData || [];
    
    // Collect unique camp names and rooms
    var campNames = {};
    var roomNames = {};
    var crossCounts = {}; // key: "campName||room" => count
    
    allData.forEach(function(item) {
      var cname = (item.camp_name || 'ไม่ระบุค่าย').trim();
      var room = (item.class_section || 'ไม่ระบุห้อง').toString().trim();
      if (room === '' || room === '-') room = 'ไม่ระบุห้อง';
      
      campNames[cname] = true;
      roomNames[room] = true;
      
      var key = cname + '||' + room;
      crossCounts[key] = (crossCounts[key] || 0) + 1;
    });
    
    var sortedCamps = Object.keys(campNames).sort();
    var sortedRooms = Object.keys(roomNames).sort(function(a, b) {
      // Sort "ไม่ระบุห้อง" to the end
      if (a === 'ไม่ระบุห้อง') return 1;
      if (b === 'ไม่ระบุห้อง') return -1;
      return a.localeCompare(b, 'th');
    });
    
    if (sortedCamps.length > 0) {
      var ctHtml = '<div class="glass-panel" style="padding: 16px; border-radius: 12px;">';
      ctHtml += '<div style="font-weight: 600; font-size: 1rem; margin-bottom: 10px; color: var(--text-main);">📊 สรุปจำนวนนักเรียนแยกตามค่ายและห้อง</div>';
      ctHtml += '<div style="overflow-x: auto;">';
      ctHtml += '<table class="table table-bordered table-hover" style="width: 100%; font-size: 0.85rem; margin-bottom: 0; border-collapse: collapse;">';
      
      // Header row
      ctHtml += '<thead><tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">';
      ctHtml += '<th style="padding: 8px 12px; text-align: left; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);">ชื่อค่าย / กิจกรรม</th>';
      sortedRooms.forEach(function(room) {
        ctHtml += '<th style="padding: 8px 10px; text-align: center; font-weight: 600; border: 1px solid rgba(255,255,255,0.2); min-width: 70px;">' + room + '</th>';
      });
      ctHtml += '<th style="padding: 8px 10px; text-align: center; font-weight: 700; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.15); min-width: 70px;">รวม</th>';
      ctHtml += '</tr></thead>';
      
      // Data rows
      ctHtml += '<tbody>';
      var grandTotal = 0;
      var roomTotals = {};
      
      sortedCamps.forEach(function(cname, idx) {
        var rowBg = idx % 2 === 0 ? 'background-color: rgba(102, 126, 234, 0.04);' : '';
        ctHtml += '<tr style="' + rowBg + '">';
        ctHtml += '<td style="padding: 8px 12px; font-weight: 500; border: 1px solid #e2e8f0; color: var(--text-main);">' + cname + '</td>';
        var rowTotal = 0;
        
        sortedRooms.forEach(function(room) {
          var key = cname + '||' + room;
          var count = crossCounts[key] || 0;
          rowTotal += count;
          roomTotals[room] = (roomTotals[room] || 0) + count;
          
          var cellStyle = 'padding: 8px 10px; text-align: center; border: 1px solid #e2e8f0;';
          if (count > 0) {
            ctHtml += '<td style="' + cellStyle + ' font-weight: 600; color: #2563eb;">' + count + '</td>';
          } else {
            ctHtml += '<td style="' + cellStyle + ' color: #cbd5e1;">-</td>';
          }
        });
        
        grandTotal += rowTotal;
        ctHtml += '<td style="padding: 8px 10px; text-align: center; font-weight: 700; border: 1px solid #e2e8f0; background-color: rgba(102, 126, 234, 0.08); color: #1e40af;">' + rowTotal + '</td>';
        ctHtml += '</tr>';
      });
      
      // Footer totals row
      ctHtml += '<tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e8ecff 100%); font-weight: 700;">';
      ctHtml += '<td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: var(--text-main);">รวมทั้งหมด</td>';
      sortedRooms.forEach(function(room) {
        var rt = roomTotals[room] || 0;
        ctHtml += '<td style="padding: 8px 10px; text-align: center; border: 1px solid #e2e8f0; color: #1e40af;">' + rt + '</td>';
      });
      ctHtml += '<td style="padding: 8px 10px; text-align: center; border: 1px solid #e2e8f0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 1rem;">' + grandTotal + '</td>';
      ctHtml += '</tr>';
      
            ctHtml += '</tbody></table></div>';
      
      // SHIRT SIZE CROSSTAB
      var sizeNames = {};
      var sizeCrossCounts = {};
      allData.forEach(function(item) {
        var cname = (item.camp_name || 'ไม่ระบุค่าย').trim();
        var size = (item.shirt_size || 'ไม่ระบุไซส์').toString().trim();
        if (size === '' || size === '-') size = 'ไม่ระบุไซส์';
        sizeNames[size] = true;
        var key = cname + '||' + size;
        sizeCrossCounts[key] = (sizeCrossCounts[key] || 0) + 1;
      });
      
      var sortedSizes = Object.keys(sizeNames).sort(function(a, b) {
        if (a === 'ไม่ระบุไซส์') return 1;
        if (b === 'ไม่ระบุไซส์') return -1;
        var sizeOrder = {'S':1, 'M':2, 'L':3, 'XL':4, 'XXL':5, 'XXXL':6, '3XL':6};
        var oa = sizeOrder[a.toUpperCase()] || 99;
        var ob = sizeOrder[b.toUpperCase()] || 99;
        if (oa !== ob) return oa - ob;
        return a.localeCompare(b, 'en');
      });
      
      ctHtml += '<div style="font-weight: 600; font-size: 1rem; margin-top: 20px; margin-bottom: 10px; color: var(--text-main);">👕 สรุปจำนวนไซส์เสื้อแยกตามค่าย</div>';
      ctHtml += '<div style="overflow-x: auto;">';
      ctHtml += '<table class="table table-bordered table-hover" style="width: 100%; font-size: 0.85rem; margin-bottom: 0; border-collapse: collapse;">';
      ctHtml += '<thead><tr style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">';
      ctHtml += '<th style="padding: 8px 12px; text-align: left; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);">ชื่อค่าย / กิจกรรม</th>';
      sortedSizes.forEach(function(size) {
        ctHtml += '<th style="padding: 8px 10px; text-align: center; font-weight: 600; border: 1px solid rgba(255,255,255,0.2); min-width: 50px;">' + size + '</th>';
      });
      ctHtml += '<th style="padding: 8px 10px; text-align: center; font-weight: 700; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.15); min-width: 60px;">รวม</th>';
      ctHtml += '</tr></thead><tbody>';
      
      var sizeGrandTotal = 0;
      var sizeTotals = {};
      sortedCamps.forEach(function(cname, idx) {
        var rowBg = idx % 2 === 0 ? 'background-color: rgba(16, 185, 129, 0.04);' : '';
        ctHtml += '<tr style="' + rowBg + '">';
        ctHtml += '<td style="padding: 8px 12px; font-weight: 500; border: 1px solid #e2e8f0; color: var(--text-main);">' + cname + '</td>';
        var rowTotal = 0;
        
        sortedSizes.forEach(function(size) {
          var key = cname + '||' + size;
          var count = sizeCrossCounts[key] || 0;
          rowTotal += count;
          sizeTotals[size] = (sizeTotals[size] || 0) + count;
          
          if (count > 0) {
            ctHtml += '<td style="padding: 8px 10px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600; color: #059669;">' + count + '</td>';
          } else {
            ctHtml += '<td style="padding: 8px 10px; text-align: center; border: 1px solid #e2e8f0; color: #cbd5e1;">-</td>';
          }
        });
        
        sizeGrandTotal += rowTotal;
        ctHtml += '<td style="padding: 8px 10px; text-align: center; font-weight: 700; border: 1px solid #e2e8f0; background-color: rgba(16, 185, 129, 0.08); color: #047857;">' + rowTotal + '</td>';
        ctHtml += '</tr>';
      });
      
      ctHtml += '<tr style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); font-weight: 700;">';
      ctHtml += '<td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: var(--text-main);">รวม</td>';
      sortedSizes.forEach(function(size) {
        ctHtml += '<td style="padding: 8px 10px; text-align: center; border: 1px solid #e2e8f0; color: #047857;">' + (sizeTotals[size] || 0) + '</td>';
      });
      ctHtml += '<td style="padding: 8px 10px; text-align: center; border: 1px solid #e2e8f0; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-size: 1rem;">' + sizeGrandTotal + '</td>';
      ctHtml += '</tr>';
      
      ctHtml += '</tbody></table></div>';
      
      // FINANCIAL SUMMARY TABLE
      var finCamps = {};
      allData.forEach(function(item) {
        var cname = (item.camp_name || 'ไม่ระบุค่าย').trim();
        if (!finCamps[cname]) {
          finCamps[cname] = { full: 0, paid: 0, outst: 0 };
        }
        finCamps[cname].full += (parseFloat(item.full) || 0);
        finCamps[cname].paid += (parseFloat(item.paid) || 0);
        finCamps[cname].outst += (parseFloat(item.outstanding) || 0);
      });
      
      ctHtml += '<div style="font-weight: 600; font-size: 1rem; margin-top: 20px; margin-bottom: 10px; color: var(--text-main);">💰 สรุปยอดเงินแยกตามค่าย</div>';
      ctHtml += '<div style="overflow-x: auto;">';
      ctHtml += '<table class="table table-bordered table-hover" style="width: 100%; font-size: 0.85rem; margin-bottom: 0; border-collapse: collapse;">';
      ctHtml += '<thead><tr style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white;">';
      ctHtml += '<th style="padding: 8px 12px; text-align: left; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);">ชื่อค่าย / กิจกรรม</th>';
      ctHtml += '<th style="padding: 8px 10px; text-align: right; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);">ยอดเต็ม (บาท)</th>';
      ctHtml += '<th style="padding: 8px 10px; text-align: right; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);">ยอดจ่าย (บาท)</th>';
      ctHtml += '<th style="padding: 8px 10px; text-align: right; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);">ค้างชำระ (บาท)</th>';
      ctHtml += '</tr></thead><tbody>';
      
      var totalFull = 0, totalPaid = 0, totalOutst = 0;
      sortedCamps.forEach(function(cname, idx) {
        var rowBg = idx % 2 === 0 ? 'background-color: rgba(245, 158, 11, 0.04);' : '';
        var fc = finCamps[cname] || {full:0, paid:0, outst:0};
        totalFull += fc.full;
        totalPaid += fc.paid;
        totalOutst += fc.outst;
        
        ctHtml += '<tr style="' + rowBg + '">';
        ctHtml += '<td style="padding: 8px 12px; font-weight: 500; border: 1px solid #e2e8f0; color: var(--text-main);">' + cname + '</td>';
        ctHtml += '<td style="padding: 8px 10px; text-align: right; border: 1px solid #e2e8f0;">' + fc.full.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + '</td>';
        ctHtml += '<td style="padding: 8px 10px; text-align: right; border: 1px solid #e2e8f0; color: #059669;">' + fc.paid.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + '</td>';
        ctHtml += '<td style="padding: 8px 10px; text-align: right; border: 1px solid #e2e8f0; ' + (fc.outst > 0 ? 'color: #dc2626; font-weight: 600;' : '') + '">' + fc.outst.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + '</td>';
        ctHtml += '</tr>';
      });
      
      ctHtml += '<tr style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); font-weight: 700;">';
      ctHtml += '<td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: var(--text-main);">รวมทั้งหมด</td>';
      ctHtml += '<td style="padding: 8px 10px; text-align: right; border: 1px solid #e2e8f0;">' + totalFull.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + '</td>';
      ctHtml += '<td style="padding: 8px 10px; text-align: right; border: 1px solid #e2e8f0; color: #059669;">' + totalPaid.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + '</td>';
      ctHtml += '<td style="padding: 8px 10px; text-align: right; border: 1px solid #e2e8f0; ' + (totalOutst > 0 ? 'color: #dc2626;' : '') + '">' + totalOutst.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + '</td>';
      ctHtml += '</tr>';
      
      ctHtml += '</tbody></table></div></div>';
      crosstabContainer.innerHTML = ctHtml;
    } else {
      crosstabContainer.innerHTML = '';
    }
  }
  
  if (filteredData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="15" class="text-center">ไม่มีข้อมูลนักเรียนในระบบตามเงื่อนไขที่เลือก</td></tr>';
    return;
  }
  
  var html = "";
  
  // Group by Camp Name -> Class/Room
  var grouped = {};
  filteredData.forEach(function(item) {
    var cName = item.camp_name || 'ไม่ระบุค่าย';
    var cGroup = (item.std_grade || '') + ' ' + (item.class_section || '');
    cGroup = cGroup.trim() || 'ไม่ระบุชั้น/ห้อง';
    
    if(!grouped[cName]) grouped[cName] = {};
    if(!grouped[cName][cGroup]) grouped[cName][cGroup] = [];
    grouped[cName][cGroup].push(item);
  });
  
  for(var cName in grouped) {
    html += "<tr style='background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);'><td colspan='16' style='font-weight:bold; color:#1e293b; padding: 10px; font-size: 1.05rem;'>🏫 ค่าย: " + cName + "</td></tr>";
    
    for(var cGroup in grouped[cName]) {
      html += "<tr style='background-color: #f8fafc;'><td colspan='16' style='font-weight:600; color:#334155; padding: 8px 10px 8px 30px; border-bottom: 2px solid #e2e8f0;'>📂 ชั้น/ห้อง: " + cGroup + " <span class='badge bg-secondary' style='margin-left: 8px; font-weight: normal;'>" + grouped[cName][cGroup].length + " คน</span></td></tr>";
      
      grouped[cName][cGroup].forEach(function(item, idx) {
        html += "<tr>";
        var displayDate = item.timestamp ? String(item.timestamp).split('T')[0] : "-";
        html += "<td>" + displayDate + "</td>";
        html += "<td>" + (item.camp_name || "-") + "</td>";
        html += "<td>" + (item.camp_year || "-") + "</td>";
        html += "<td>" + (item.std_grade || "-") + "</td>";
        html += "<td>" + (item.class_section || "-") + "</td>";
        html += "<td>" + (item.std_name || "-") + "</td>";
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
        
        // ค้างชำระ
        var outst = parseFloat(item.outstanding) || 0;
        var outstColor = outst > 0 ? "color: red; font-weight: bold;" : "color: green;";
        html += "<td style='" + outstColor + "'>" + outst.toLocaleString() + "</td>";
        
        // จัดการเงิน (Modal)
        var escTs = (item.timestamp || '').toString().replace(/'/g, "\\'");
        html += "<td><button class='btn btn-sm btn-outline-warning' style='font-size:0.75rem; padding: 2px 5px;' onclick=\"showCampPaymentModal('" + escTs + "')\">🪙 จัดการ</button></td>";
        
        var currentStatus = (item.status || "").trim();
        if (currentStatus === "ยืนยันแล้ว") {
          html += "<td><span class='badge bg-success'>" + currentStatus + "</span></td>";
        } else {
          html += "<td>";
          if (currentStatus) {
            html += "<span class='badge bg-warning text-dark' style='margin-bottom:4px; display:inline-block;'>" + currentStatus + "</span><br/>";
          }
          var escTs = (item.timestamp || '').toString().replace(/'/g, "\\'");
          html += "<button class='btn btn-sm btn-success' style='font-size:0.75rem; padding: 2px 5px;' onclick=\"confirmCampStatus('" + escTs + "')\">กดยืนยัน</button>";
          html += "</td>";
        }
        
        // Delete Button
        var escTs = (item.timestamp || '').toString().replace(/'/g, "\\'");
        html += "<td style='text-align:center;'><button class='btn btn-sm btn-danger' style='padding: 2px 6px; font-size: 0.75rem;' onclick=\"deleteCampStudent('" + escTs + "')\" title='ลบข้อมูล'>🗑️ ลบ</button></td>";
        
        html += "</tr>";
      });
    }
  }
  
  tbody.innerHTML = html;
}

function deleteCampStudent(timestamp) {
  showCustomConfirm('คุณแน่ใจหรือไม่ว่าต้องการ "ลบ" ข้อมูลนักเรียนคนนี้ออกจากค่าย? (ลบแล้วกู้คืนไม่ได้)', function() {
    Swal.fire({
      title: 'กำลังลบข้อมูล...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    google.script.run
      .withSuccessHandler(function(res) {
        if(res && res.success) {
          Swal.fire({
            icon: 'success',
            title: 'ลบข้อมูลสำเร็จ',
            showConfirmButton: false,
            timer: 1500
          });
          fetchCampsData(); // refresh table
        } else {
          Swal.fire('Error', res.error || 'ลบข้อมูลไม่สำเร็จ', 'error');
        }
      })
      .withFailureHandler(function(err) {
        Swal.fire('Error', err.message, 'error');
      })
      .deleteCampStudentByTimestamp(timestamp);
  });
}function confirmCampStatus(timestamp) {
  showCustomConfirm('คุณต้องการยืนยันสถานะเป็น "ยืนยันแล้ว" สำหรับนักเรียนคนนี้ใช่หรือไม่?', function() {
    google.script.run.withSuccessHandler(function(res) {
    if (res && res.success) {
      // Update local data and re-render
      var itemIndex = currentCampsData.findIndex(function(item) {
        return String(item.timestamp) === String(timestamp);
      });
      if (itemIndex > -1) {
        currentCampsData[itemIndex].status = 'ยืนยันแล้ว';
        renderCampsTable();
      } else {
        loadCampsData(); // Fallback reload
      }
    } else {
      alert('เกิดข้อผิดพลาด: ' + (res ? res.error : 'ไม่ทราบสาเหตุ'));
    }
  }).updateCampStatus(timestamp, 'ยืนยันแล้ว');
  });
}

