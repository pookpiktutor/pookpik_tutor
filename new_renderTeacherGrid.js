function renderTeacherScheduleGrid(teacher) {
  const container = document.getElementById('teacher_calendar_container');
  container.innerHTML = '';
  container.style.display = 'block';

  if (!state.teacherClasses || state.teacherClasses.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">ไม่มีข้อมูลตารางสอนของคุณครูท่านนี้</div>`;
    return;
  }

  // Sort classes chronologically
  function parseSheetDate(dateStr) {
    if (!dateStr) return { sortKey: '0000-00-00' };
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      const sortKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return { sortKey };
    }
    return { sortKey: '0000-00-00' };
  }

  function getMonthYearThai(dateStr) {
    if (!dateStr) return 'อื่นๆ';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const thMonthsFull = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      return `${thMonthsFull[m]} ${y}`;
    }
    return 'อื่นๆ';
  }
  
  function getThaiDateLong(dateStr) {
    if (!dateStr) return '-';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const thMonthsFull = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      return `${d} ${thMonthsFull[m]} ${y}`;
    }
    return dateStr;
  }

  const sorted = [...state.teacherClasses].sort((a, b) => {
    const keyA = parseSheetDate(a.date).sortKey + ' ' + (a.timeStart || '');
    const keyB = parseSheetDate(b.date).sortKey + ' ' + (b.timeStart || '');
    return keyA.localeCompare(keyB);
  });
  
  // Group by Date
  const groupedByDate = {};
  sorted.forEach(log => {
      const dateKey = log.date || 'ไม่ระบุวันที่';
      if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
      groupedByDate[dateKey].push(log);
  });
  
  // Create wrapper HTML
  let html = `
    <div style="width: 100%; overflow-x: auto; border: 1px solid var(--border-color); border-radius: 8px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="min-width: 1300px; position: relative;">
        <!-- Header Row -->
        <div style="display: flex; position: sticky; top: 0; z-index: 20; background: #f8fafc; border-bottom: 2px solid var(--border-color);">
          <div style="width: 150px; min-width: 150px; position: sticky; left: 0; z-index: 30; background: #f8fafc; padding: 12px; font-weight: 700; border-right: 2px solid var(--border-color); color: var(--text-main); display: flex; align-items: center; justify-content: center;">
            วันที่
          </div>
          <div style="flex: 1; display: flex; position: relative;">
  `;
  
  for (let i = 8; i <= 19; i++) {
    html += `<div style="flex: 1; padding: 12px 8px; text-align: center; font-weight: 700; border-right: 1px dashed #e2e8f0; color: var(--text-main);">
               ${String(i).padStart(2, '0')}.00
             </div>`;
  }
  
  html += `
          </div>
        </div>
        <!-- Body Rows -->
        <div style="display: flex; flex-direction: column;">
  `;
  
  for (const dateKey in groupedByDate) {
      const dateClasses = groupedByDate[dateKey];
      const thaiDate = getThaiDateLong(dateKey);
      
      html += `
        <div style="display: flex; border-bottom: 1px solid var(--border-color); min-height: 120px; position: relative;">
          <!-- Date Info (Sticky Left) -->
          <div style="width: 150px; min-width: 150px; position: sticky; left: 0; z-index: 10; background: #fff; padding: 16px; border-right: 2px solid var(--border-color); box-shadow: 2px 0 5px -2px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; text-align: center;">
            <div style="font-weight: 700; font-size: 1rem; color: var(--color-primary-hover);">${thaiDate}</div>
          </div>
          <!-- Timeline Grid Area -->
          <div style="flex: 1; display: flex; position: relative;">
      `;
      
      // Background dashed lines
      for (let i = 8; i <= 19; i++) {
        html += `<div style="flex: 1; border-right: 1px dashed #e2e8f0; pointer-events: none;"></div>`;
      }
      
      // Cards Container
      html += `<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; padding: 8px 0; overflow-y: auto;">`;
      
      let rowPlacements = [];
      dateClasses.forEach(c => {
          let parseTime = (t) => {
              let parts = (t||'00.00').replace(':', '.').split('.');
              return parseInt(parts[0]||0) + (parseInt(parts[1]||0)/60);
          };
          
          let s = parseTime(c.timeStart || '08.00');
          let e = parseTime(c.timeEnd || '10.00');
          if (s < 8) s = 8;
          if (e > 20) e = 20;
          if (e <= s) e = s + 1;
          
          let leftPct = ((s - 8) / 12) * 100;
          let widthPct = ((e - s) / 12) * 100;
          
          let rowIndex = 0;
          while (true) {
              if (!rowPlacements[rowIndex]) rowPlacements[rowIndex] = [];
              let overlaps = false;
              for (let placed of rowPlacements[rowIndex]) {
                  if (s < placed.e && e > placed.s) { overlaps = true; break; }
              }
              if (!overlaps) {
                  rowPlacements[rowIndex].push({s, e});
                  break;
              }
              rowIndex++;
          }
          
          let topOffset = rowIndex * 120;
          
          let statusClass = '';
          if (c.isPresentLive > 0 || c.isPresentOnline > 0) statusClass = ''; 
          else if (c.isMakeup > 0) statusClass = 'status-makeup';
          else if (c.isLeave > 0) statusClass = 'status-leave';
          else if (c.isAbsent > 0) statusClass = 'status-absent';
          
          const attendances = [];
          attendances.push(`สด: ${c.isPresentLive || 0}`);
          attendances.push(`ออน: ${c.isPresentOnline || 0}`);
          attendances.push(`ลา: ${c.isLeave || 0}`);
          attendances.push(`ชด: ${c.isMakeup || 0}`);
          attendances.push(`ขาด: ${c.isAbsent || 0}`);
          
          const attendanceSummary = attendances.length > 0 
             ? `<span style="font-size:0.68rem; color:var(--color-primary-hover); font-weight:500; display:block; margin-top:2px;">👥 ${attendances.join(' ')}</span>`
             : '';
             
          let displayType = (c.classType || '').toString().trim();
          if (displayType) {
             displayType = `<span style="font-size: 0.65rem; background: var(--bg-body); padding: 1px 4px; border-radius: 4px; color: var(--text-muted); border: 1px solid #e2e8f0; margin-bottom: 4px; display: inline-block;">${displayType}</span><br>`;
          }
          
          let noteHtml = '';
          const noteText = (c.note || '').toString().trim();
          if (noteText && noteText !== '-') {
             noteHtml = `<div style="font-size: 0.72rem; padding: 4px 8px; margin-top: 6px; background: rgba(0,0,0,0.03); border-radius: 4px;">📝 <b>หมายเหตุ:</b> ${noteText}</div>`;
          }
          
          const subjectLower = (c.subject || '').toLowerCase();
          const isPrivateOrSubGroup = subjectLower.includes('เดี่ยว') || subjectLower.includes('ย่อย');
          const leaveCount = parseInt(c.isLeave) || 0;
          const hasStudentLeave = (leaveCount > 0) && isPrivateOrSubGroup;
          const isTeacherLeave = noteText.includes('ครูลา');
          
          let cardBg = '#fff';
          let cardBorder = 'var(--border-color)';
          if (hasStudentLeave) {
              cardBg = 'rgb(254, 226, 226)';
              cardBorder = 'rgba(239, 68, 68, 0.5)';
          } else if (c.teacherConfirmed) {
              cardBg = 'rgba(25, 135, 84, 0.08)';
              cardBorder = 'rgba(25, 135, 84, 0.3)';
          } else if (isTeacherLeave) {
              cardBg = 'rgb(254, 226, 226)';
              cardBorder = 'rgba(239, 68, 68, 0.35)';
          }
          
          let warningHtml = '';
          if (hasStudentLeave) {
              warningHtml += `<label style="font-size: 0.7rem; color: #dc2626; display: flex; align-items: center; gap: 4px;"><input type="checkbox" checked disabled> น้องลา</label>`;
          } else {
              warningHtml += `<label style="font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;"><input type="checkbox" disabled> น้องลา</label>`;
          }
          if (isTeacherLeave) {
              warningHtml += `<label style="font-size: 0.7rem; color: #dc2626; display: flex; align-items: center; gap: 4px;"><input type="checkbox" checked disabled> ครูลา</label>`;
          } else {
              warningHtml += `<label style="font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;"><input type="checkbox" disabled> ครูลา</label>`;
          }
          
          let confirmBtnHtml = '';
          if (c.teacherConfirmed) {
             confirmBtnHtml = `<div style="font-size:0.65rem; padding:2px 6px; background:#e2e8f0; color:#475569; border-radius:10px; margin-left:auto;">ยืนยันแล้ว</div>`;
          } else {
             confirmBtnHtml = `<button class="confirm-btn" onclick="teacherConfirmClass('${c.id}')" style="font-size:0.65rem; padding:2px 8px; margin-left:auto;">รอยืนยัน</button>`;
          }
          
          let branchDisplay = (c.roomBranch || '').replace(/Zoom\s*\S*/i, '').replace(/\s+/g, ' ').trim();
          
          let hoursDiff = ((e - s) || 0).toFixed(1).replace('.0', '');
          
          html += `
            <div class="${statusClass}" style="position: absolute; left: ${leftPct}%; width: calc(${widthPct}% - 4px); top: ${topOffset}px; background: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 6px; padding: 8px; font-size: 0.8rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); min-width: 120px; overflow: hidden; white-space: normal;">
              ${displayType}
              <div style="font-weight: 700; color: var(--text-main); margin-bottom: 2px;">${c.subject || '-'} ${branchDisplay}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">${c.timeStart || ''} - ${c.timeEnd || ''} (${hoursDiff} ชม.)</div>
              <div style="font-size: 0.75rem; color: var(--text-main); line-height: 1.3;">
                <div>ห้อง: ${c.room || '-'}</div>
              </div>
              ${attendanceSummary}
              ${noteHtml}
              <div style="display: flex; align-items: center; margin-top: 6px; flex-wrap: wrap; gap: 6px;">
                 ${warningHtml}
                 ${confirmBtnHtml}
              </div>
            </div>
          `;
      });
      
      let maxRows = rowPlacements.length > 0 ? rowPlacements.length : 1;
      let requiredHeight = maxRows * 120 + 20;
      
      html += `
            <div style="min-height: ${requiredHeight}px; width: 100%;"></div>
          </div>
        </div>
      </div>
      `;
  }
  
  html += `
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}
