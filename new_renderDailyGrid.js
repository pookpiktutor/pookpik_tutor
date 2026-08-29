function renderDailyGrid() {
  const container = document.getElementById('rooms_grid_container');
  if (!container) return;
  container.innerHTML = '';
  container.style.display = 'block';

  renderDailyAttendanceSummary();
  
  const branchFilter = (state.activeBranchFilter || 'สาขา1').replace(/\s+/g, '');
  const filteredRooms = (state.rooms || []).filter(room => {
    const roomBranchClean = (room.branch || '').replace(/\s+/g, '');
    return roomBranchClean.includes(branchFilter);
  });
  
  if (filteredRooms.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-state-message';
    emptyMsg.textContent = 'ไม่พบข้อมูลห้องสำหรับสาขา: ' + branchFilter;
    emptyMsg.style.padding = '20px';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = 'var(--text-muted)';
    container.appendChild(emptyMsg);
    return;
  }

  // Create timeline wrapper
  let html = `
    <div style="width: 100%; overflow-x: auto; border: 1px solid var(--border-color); border-radius: 8px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="min-width: 1300px; position: relative;">
        
        <!-- Header Row -->
        <div style="display: flex; position: sticky; top: 0; z-index: 20; background: #f8fafc; border-bottom: 2px solid var(--border-color);">
          <div style="width: 180px; min-width: 180px; position: sticky; left: 0; z-index: 30; background: #f8fafc; padding: 12px; font-weight: 700; border-right: 2px solid var(--border-color); color: var(--text-main); display: flex; align-items: center; justify-content: center;">
            ห้องเรียน / อุปกรณ์
          </div>
          <div style="flex: 1; display: flex; position: relative;">
  `;
  
  // 12 columns for hours 08:00 to 19:00
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
  
  filteredRooms.forEach(room => {
    const roomClasses = (state.classLogs || []).filter(log => matchRoomAndBranch(log.roomBranch, room.roomName, room.branch));
    
    let detailsStr = '';
    const details = [];
    if (room.ipad) details.push(`📱 ${room.ipad}`);
    if (room.zoom) details.push(`💻 ${room.zoom}`);
    if (details.length > 0) {
      detailsStr = `<div style="font-size: 0.74rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">` +
                   details.map(d => `<span>${d}</span>`).join('') +
                   `</div>`;
    }
    
    const fullRoomLabel = `${room.roomName} ${room.branch} ${room.ipad ? room.ipad : ''} ${room.zoom ? room.zoom : ''}`.replace(/\s+/g, ' ').trim();
    
    html += `
      <div style="display: flex; border-bottom: 1px solid var(--border-color); min-height: 120px; position: relative;">
        <!-- Room Info (Sticky Left) -->
        <div style="width: 180px; min-width: 180px; position: sticky; left: 0; z-index: 10; background: #fff; padding: 12px; border-right: 2px solid var(--border-color); box-shadow: 2px 0 5px -2px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--color-primary-hover); margin-bottom: 4px; word-break: break-word;">${room.roomName}</div>
          ${detailsStr}
          <div style="display: flex; gap: 6px; align-items: center; margin-top: 8px;">
            <button onclick="showEditRoomModal('${room.branch}', '${room.roomName}', '${room.ipad}', '${room.zoom}')" style="font-size: 0.72rem; padding: 3px 6px; border: 1px solid var(--border-color); border-radius: 4px; background: #f8fafc; cursor: pointer;">✏️ แก้ไข</button>
            <button onclick="deleteRoomFrontend('${room.branch}', '${room.roomName}')" style="font-size: 0.72rem; padding: 3px 6px; border: 1px solid var(--border-color); border-radius: 4px; background: #fff5f5; color: var(--color-danger); cursor: pointer;">🗑️ ลบ</button>
          </div>
          <div style="margin-top: auto; padding-top: 12px;">
            <button onclick="quickAddClassLog('${fullRoomLabel}')" style="width: 100%; padding: 6px; font-size: 0.76rem; border-radius: 4px; border: 1px dashed var(--color-primary); background: rgba(70,99,82,0.03); color: var(--color-primary); font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span>➕</span> เพิ่มคลาสเรียน
            </button>
          </div>
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
    
    // Sort and place classes
    let rowPlacements = []; // To handle overlapping cards
    
    roomClasses.sort((a,b) => {
        let parse = t => {
            let p = (t||'00.00').replace(':','.').split('.');
            return parseInt(p[0]||0) + (parseInt(p[1]||0)/60);
        };
        return parse(a.timeStart) - parse(b.timeStart);
    });
    
    roomClasses.forEach(c => {
        let parseTime = (t) => {
            let parts = (t||'00.00').replace(':', '.').split('.');
            return parseInt(parts[0]||0) + (parseInt(parts[1]||0)/60);
        };
        
        let s = parseTime(c.timeStart || '08.00');
        let e = parseTime(c.timeEnd || '10.00');
        if (s < 8) s = 8;
        if (e > 20) e = 20;
        if (e <= s) e = s + 1; // Minimum 1 hour width if invalid
        
        let leftPct = ((s - 8) / 12) * 100;
        let widthPct = ((e - s) / 12) * 100;
        
        // Find row to place to avoid overlap
        let rowIndex = 0;
        while (true) {
            if (!rowPlacements[rowIndex]) {
                rowPlacements[rowIndex] = [];
            }
            let overlaps = false;
            for (let placed of rowPlacements[rowIndex]) {
                if (s < placed.e && e > placed.s) { // Overlaps
                    overlaps = true;
                    break;
                }
            }
            if (!overlaps) {
                rowPlacements[rowIndex].push({s, e});
                break;
            }
            rowIndex++;
        }
        
        let topOffset = rowIndex * 120; // Each row takes about 110px height + 10px gap
        
        // --- Generate Card HTML (Similar to previous render logic) ---
        let statusClass = '';
        if (c.isPresentLive > 0 || c.isPresentOnline > 0) {
           statusClass = ''; 
        } else if (c.isMakeup > 0) {
           statusClass = 'status-makeup';
        } else if (c.isLeave > 0) {
           statusClass = 'status-leave';
        } else if (c.isAbsent > 0) {
           statusClass = 'status-absent';
        }
        
        const attendances = [];
        attendances.push(`สด: ${c.isPresentLive || 0}`);
        attendances.push(`ออน: ${c.isPresentOnline || 0}`);
        attendances.push(`ลา: ${c.isLeave || 0}`);
        attendances.push(`ชด: ${c.isMakeup || 0}`);
        attendances.push(`ขาด: ${c.isAbsent || 0}`);
        
        const attendanceSummary = attendances.length > 0 
           ? `<span style="font-size:0.68rem; color:var(--color-primary-hover); font-weight:500; display:block; margin-top:2px;">👥 ${attendances.join(' ')}</span>`
           : '';
           
        let confirmBtnHtml = '';
        if (c.confirmed) {
           confirmBtnHtml = `<div style="font-size:0.65rem; padding:2px 6px; background:#e2e8f0; color:#475569; border-radius:10px; margin-left:auto;">ยืนยันแล้ว</div>`;
        } else {
           confirmBtnHtml = `<button class="confirm-btn" onclick="confirmClassFrontend('${c.id}', '${c.classTopic}', '${c.roomBranch}')" style="font-size:0.65rem; padding:2px 8px; margin-left:auto;">รอยืนยัน</button>`;
        }
        
        let displayType = (c.classType || '').toString().trim();
        if (displayType) {
           displayType = `<span style="font-size: 0.65rem; background: var(--bg-body); padding: 1px 4px; border-radius: 4px; color: var(--text-muted); border: 1px solid #e2e8f0; margin-bottom: 4px; display: inline-block;">${displayType}</span><br>`;
        }
        
        let noteHtml = '';
        const noteText = (c.note || '').toString().trim();
        if (noteText && noteText !== '-') {
           noteHtml = `<div style="font-size: 0.72rem; padding: 4px 8px; margin-top: 6px; background: rgba(0,0,0,0.03); border-radius: 4px;">📝 <b>หมายเหตุ:</b> ${noteText}</div>`;
        }
        
        const subjectLower = (c.classTopic || '').toLowerCase();
        const isPrivateOrSubGroup = subjectLower.includes('เดี่ยว') || subjectLower.includes('ย่อย');
        const hasStudentLeave = (parseInt(c.isLeave) > 0) && isPrivateOrSubGroup;
        const isTeacherLeave = noteText.includes('ครูลา');
        
        let cardBg = '#fff';
        let cardBorder = 'var(--border-color)';
        if (hasStudentLeave) {
            cardBg = 'rgb(254, 226, 226)';
            cardBorder = 'rgba(239, 68, 68, 0.5)';
        } else if (c.confirmed) {
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
        
        const editDeleteHtml = `
           <div style="position:absolute; top: 6px; right: 6px; display:flex; gap: 4px;">
             <button onclick="editClassLog('${c.id}')" title="แก้ไขการจอง" style="font-size:0.7rem; color:var(--text-muted); background:none; border:none; cursor:pointer;">✏️</button>
             <button onclick="deleteClassLog('${c.id}')" title="ลบการจอง" style="font-size:0.7rem; color:var(--text-muted); background:none; border:none; cursor:pointer;">🗑️</button>
           </div>
        `;
        
        let hoursDiff = ((e - s) || 0).toFixed(1).replace('.0', '');
        
        html += `
          <div class="${statusClass}" style="position: absolute; left: ${leftPct}%; width: calc(${widthPct}% - 4px); top: ${topOffset}px; background: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 6px; padding: 8px; font-size: 0.8rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); min-width: 120px; overflow: hidden; white-space: normal;">
            ${editDeleteHtml}
            ${displayType}
            <div style="font-weight: 700; color: var(--text-main); margin-bottom: 2px; padding-right: 30px;">${c.classTopic || '-'}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">${c.timeStart || ''} - ${c.timeEnd || ''} (${hoursDiff} ชม.)</div>
            <div style="font-size: 0.75rem; color: var(--text-main); line-height: 1.3;">
              <div>ครูประจำ: ${c.teacherRegular || '-'}</div>
              <div>ครูแทน: ${c.teacherSubstitute || '-'}</div>
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
    
    // Adjust row min-height based on overlapping cards
    let maxRows = rowPlacements.length > 0 ? rowPlacements.length : 1;
    let requiredHeight = maxRows * 120 + 20; // Add some padding bottom
    
    html += `
          <div style="min-height: ${requiredHeight}px; width: 100%;"></div>
        </div>
      </div>
      </div>
    `;
  });
  
  html += `
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}
