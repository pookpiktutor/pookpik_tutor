const fs = require('fs');
let js = fs.readFileSync('JavaScript.js', 'utf8');

const startIndex = js.indexOf('function loadCampsData()');
const endIndex = js.indexOf('function ', startIndex + 20);

const replacement = `function loadCampsData() {
  var yearEl = document.getElementById('camps_year_select');
  var nameEl = document.getElementById('camps_name_select');
  var year = yearEl ? yearEl.value : 'all';
  var name = nameEl ? nameEl.value : 'all';
  
  var tbody = document.getElementById('camps_table_body');
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="16" class="text-center">กำลังโหลดข้อมูล...</td></tr>';
  
  google.script.run.withSuccessHandler(function(data) {
    if (data && data.error) {
      tbody.innerHTML = '<tr><td colspan="16" class="text-center text-danger">เกิดข้อผิดพลาด: ' + data.error + '</td></tr>';
      return;
    }
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="16" class="text-center">ไม่มีข้อมูลนักเรียนค่ายในระบบ</td></tr>';
      document.getElementById('camps_summary_rooms_tbody').innerHTML = '<tr><td colspan="6" class="text-center">ไม่มีข้อมูล</td></tr>';
      document.getElementById('camps_summary_shirts_tbody').innerHTML = '<tr><td colspan="7" class="text-center">ไม่มีข้อมูล</td></tr>';
      document.getElementById('camps_summary_money_tbody').innerHTML = '<tr><td colspan="4" class="text-center">ไม่มีข้อมูล</td></tr>';
      return;
    }
    
    // Process summaries
    const roomsStats = {};
    const shirtsStats = {};
    const moneyStats = {};

    let totalRooms = { normal: 0, ep: 0, gifted: 0, smartcom: 0 };
    let totalShirts = { S: 0, M: 0, L: 0, XL: 0, '2XL': 0 };
    let totalMoney = { full: 0, paid: 0, outstanding: 0 };

    var html = "";
    data.forEach(function(item) {
      const camp = item.camp_name || 'ไม่ระบุค่าย';
      const room = item.class_section || '';
      const size = (item.shirt_size || '').toUpperCase();
      const full = item.full || 0;
      const paid = item.paid || 0;
      const outst = item.outstanding !== undefined ? item.outstanding : (full - paid);
      
      // Rooms
      if (!roomsStats[camp]) roomsStats[camp] = { normal: 0, ep: 0, gifted: 0, smartcom: 0 };
      if (room.includes('ห้องปกติ')) { roomsStats[camp].normal++; totalRooms.normal++; }
      else if (room.includes('EP')) { roomsStats[camp].ep++; totalRooms.ep++; }
      else if (room.includes('Gifted')) { roomsStats[camp].gifted++; totalRooms.gifted++; }
      else if (room.includes('Smart')) { roomsStats[camp].smartcom++; totalRooms.smartcom++; }

      // Shirts
      if (!shirtsStats[camp]) shirtsStats[camp] = { S: 0, M: 0, L: 0, XL: 0, '2XL': 0 };
      if (size === 'S') { shirtsStats[camp].S++; totalShirts.S++; }
      else if (size === 'M') { shirtsStats[camp].M++; totalShirts.M++; }
      else if (size === 'L') { shirtsStats[camp].L++; totalShirts.L++; }
      else if (size === 'XL') { shirtsStats[camp].XL++; totalShirts.XL++; }
      else if (size === '2XL' || size === 'XXL') { shirtsStats[camp]['2XL']++; totalShirts['2XL']++; }
      
      // Money
      if (!moneyStats[camp]) moneyStats[camp] = { full: 0, paid: 0, outstanding: 0 };
      moneyStats[camp].full += full; moneyStats[camp].paid += paid; moneyStats[camp].outstanding += outst;
      totalMoney.full += full; totalMoney.paid += paid; totalMoney.outstanding += outst;

      const slipHtml = item.slip_url ? \`<a href="\${item.slip_url}" target="_blank" class="btn btn-sm btn-info" style="font-size: 0.7rem; padding: 2px 6px;">ดูสลิป</a>\` : '-';
      const statusHtml = item.status === 'ชำระครบแล้ว' ? \`<span class="badge bg-success">ชำระครบแล้ว</span>\` : (item.paid > 0 ? \`<span class="badge bg-warning text-dark">มัดจำแล้ว</span>\` : \`<span class="badge bg-danger">ยังไม่ชำระ</span>\`);
      
      let ts = item.timestamp || "-";
      if (typeof ts === 'string' && ts.includes('T')) {
         ts = ts.replace('T', ' ').substring(0, 19);
      } else if (ts instanceof Date) {
         ts = ts.toLocaleString('th-TH');
      }

      html += "<tr>";
      html += "<td>" + ts + "</td>";
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
      html += "<td>" + slipHtml + "</td>";
      html += "<td class='text-danger fw-bold text-end'>" + (outst > 0 ? outst.toLocaleString() : "-") + "</td>";
      html += "<td><button class='btn btn-sm btn-outline-primary' style='font-size: 0.7rem;' onclick='alert(\"ฟังก์ชันจัดการเงิน (อยู่ระหว่างพัฒนา)\")'>จัดการเงิน</button></td>";
      html += "<td>" + statusHtml + "</td>";
      html += "<td><button class='btn btn-sm btn-outline-danger' style='font-size: 0.7rem;' onclick='alert(\"ฟังก์ชันลบ (อยู่ระหว่างพัฒนา)\")'>🗑️</button></td>";
      html += "</tr>";
    });
    
    tbody.innerHTML = html;

    // Render Room Stats
    let roomsHtml = '';
    Object.keys(roomsStats).forEach(camp => {
      const sum = Object.values(roomsStats[camp]).reduce((a,b)=>a+b, 0);
      roomsHtml += \`<tr>
        <td class="text-start" style="white-space: nowrap;">\${camp}</td>
        <td><span style="color: blue; font-weight: 600;">\${roomsStats[camp].normal || ''}</span></td>
        <td><span style="color: blue; font-weight: 600;">\${roomsStats[camp].ep || ''}</span></td>
        <td><span style="color: blue; font-weight: 600;">\${roomsStats[camp].gifted || ''}</span></td>
        <td><span style="color: blue; font-weight: 600;">\${roomsStats[camp].smartcom || ''}</span></td>
        <td class="fw-bold bg-light">\${sum}</td>
      </tr>\`;
    });
    const totalRoomSum = Object.values(totalRooms).reduce((a,b)=>a+b, 0);
    roomsHtml += \`<tr class="fw-bold" style="background-color: #f8f9fa;">
      <td class="text-start" style="white-space: nowrap;">รวมทั้งหมด</td>
      <td><span style="color: blue;">\${totalRooms.normal || ''}</span></td>
      <td><span style="color: blue;">\${totalRooms.ep || ''}</span></td>
      <td><span style="color: blue;">\${totalRooms.gifted || ''}</span></td>
      <td><span style="color: blue;">\${totalRooms.smartcom || ''}</span></td>
      <td style="background-color: #6f42c1; color: white;">\${totalRoomSum}</td>
    </tr>\`;
    document.getElementById('camps_summary_rooms_tbody').innerHTML = roomsHtml;

    // Render Shirts Stats
    let shirtsHtml = '';
    Object.keys(shirtsStats).forEach(camp => {
      const sum = Object.values(shirtsStats[camp]).reduce((a,b)=>a+b, 0);
      shirtsHtml += \`<tr>
        <td class="text-start" style="white-space: nowrap;">\${camp}</td>
        <td><span style="color: #198754; font-weight: 600;">\${shirtsStats[camp].S || ''}</span></td>
        <td><span style="color: #198754; font-weight: 600;">\${shirtsStats[camp].M || ''}</span></td>
        <td><span style="color: #198754; font-weight: 600;">\${shirtsStats[camp].L || ''}</span></td>
        <td><span style="color: #198754; font-weight: 600;">\${shirtsStats[camp].XL || ''}</span></td>
        <td><span style="color: #198754; font-weight: 600;">\${shirtsStats[camp]['2XL'] || ''}</span></td>
        <td class="fw-bold bg-light">\${sum}</td>
      </tr>\`;
    });
    const totalShirtSum = Object.values(totalShirts).reduce((a,b)=>a+b, 0);
    shirtsHtml += \`<tr class="fw-bold" style="background-color: #e8f5e9;">
      <td class="text-start" style="white-space: nowrap;">รวม</td>
      <td><span style="color: #198754;">\${totalShirts.S || ''}</span></td>
      <td><span style="color: #198754;">\${totalShirts.M || ''}</span></td>
      <td><span style="color: #198754;">\${totalShirts.L || ''}</span></td>
      <td><span style="color: #198754;">\${totalShirts.XL || ''}</span></td>
      <td><span style="color: #198754;">\${totalShirts['2XL'] || ''}</span></td>
      <td style="background-color: #198754; color: white;">\${totalShirtSum}</td>
    </tr>\`;
    document.getElementById('camps_summary_shirts_tbody').innerHTML = shirtsHtml;

    // Render Money Stats
    let moneyHtml = '';
    Object.keys(moneyStats).forEach(camp => {
      moneyHtml += \`<tr>
        <td class="text-start" style="white-space: nowrap;">\${camp}</td>
        <td>\${moneyStats[camp].full.toLocaleString()}</td>
        <td style="color: #198754; font-weight: 600;">\${moneyStats[camp].paid.toLocaleString()}</td>
        <td style="color: #dc3545; font-weight: 600;">\${moneyStats[camp].outstanding.toLocaleString()}</td>
      </tr>\`;
    });
    moneyHtml += \`<tr class="fw-bold" style="background-color: #fff3cd;">
      <td class="text-start" style="white-space: nowrap;">รวมทั้งหมด</td>
      <td>\${totalMoney.full.toLocaleString()}</td>
      <td style="color: #198754;">\${totalMoney.paid.toLocaleString()}</td>
      <td style="color: #dc3545;">\${totalMoney.outstanding.toLocaleString()}</td>
    </tr>\`;
    document.getElementById('camps_summary_money_tbody').innerHTML = moneyHtml;

  }).getCampsData(year, name);
}
`;

js = js.substring(0, startIndex) + replacement + js.substring(endIndex > -1 ? endIndex : js.length);
fs.writeFileSync('JavaScript.js', js);
console.log('JavaScript.js updated');
