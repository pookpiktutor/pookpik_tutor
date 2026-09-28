function loadCampsData() {
  var yearEl = document.getElementById('camps_year_select');
  var nameEl = document.getElementById('camps_name_select');
  var year = yearEl ? yearEl.value : 'all';
  var name = nameEl ? nameEl.value : 'all';
  
  var tbody = document.getElementById('camps_table_body');
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="8" class="text-center">กำลังโหลดข้อมูล...</td></tr>';
  
  google.script.run.withSuccessHandler(function(data) {
    if (data && data.error) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">เกิดข้อผิดพลาด: ' + data.error + '</td></tr>';
      return;
    }
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">ไม่มีข้อมูลนักเรียนค่ายในระบบ</td></tr>';
      return;
    }
    
    var html = "";
    data.forEach(function(item) {
      html += "<tr>";
      html += "<td>" + (item.timestamp || "-") + "</td>";
      html += "<td>" + (item.camp_name || "-") + "</td>";
      html += "<td>" + (item.camp_year || "-") + "</td>";
      html += "<td>" + (item.std_grade || "-") + "</td>";
      html += "<td>" + (item.class_section || "-") + "</td>";
      html += "<td>" + (item.std_name || "-") + "</td>";
      html += "<td>" + (item.std_nickname || "-") + "</td>";
      html += "<td>" + (item.parent_phone || "-") + "</td>";
      html += "</tr>";
    });
    
    tbody.innerHTML = html;
  }).getCampsData(year, name);
}

