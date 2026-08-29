# -*- coding: utf-8 -*-
"""
Replace renderDailyGrid and renderTeacherScheduleGrid with Timeline/Gantt chart versions.
"""

def main():
    with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find renderDailyGrid boundaries (line 9381 to 9606, 1-indexed)
    daily_start = None
    daily_end = None
    for i, line in enumerate(lines):
        if line.strip() == 'function renderDailyGrid() {':
            daily_start = i
        if daily_start is not None and line.strip() == 'function quickAddClassLog(roomLabel) {':
            daily_end = i
            break

    if daily_start is None or daily_end is None:
        print("ERROR: Could not find renderDailyGrid boundaries")
        return

    # Find renderTeacherScheduleGrid boundaries  
    teacher_start = None
    teacher_end = None
    for i, line in enumerate(lines):
        if line.strip() == 'function renderTeacherScheduleGrid(teacher) {':
            teacher_start = i
        if teacher_start is not None and i > teacher_start and line.strip() == 'function loadTeacherProfiles() {':
            teacher_end = i
            break

    if teacher_start is None or teacher_end is None:
        print("ERROR: Could not find renderTeacherScheduleGrid boundaries")
        return

    print(f"renderDailyGrid: lines {daily_start+1} to {daily_end}")
    print(f"renderTeacherScheduleGrid: lines {teacher_start+1} to {teacher_end}")

    # New renderDailyGrid (Timeline version)
    new_daily = r'''function renderDailyGrid() {
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
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted)">ไม่พบข้อมูลห้องสำหรับสาขา: ' + branchFilter + '</div>';
    return;
  }

  function parseTimeToHours(t) {
    var parts = (t || '00.00').replace(':', '.').split('.');
    return parseInt(parts[0] || 0) + (parseInt(parts[1] || 0) / 60);
  }

  var timelineStart = 8;
  var timelineEnd = 20;
  var timelineSpan = timelineEnd - timelineStart;

  var tableHTML = '<div style="width:100%;overflow-x:auto;border:1px solid var(--border-color);border-radius:8px;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,0.02)">';
  tableHTML += '<div style="min-width:1300px;position:relative">';
  
  // Header
  tableHTML += '<div style="display:flex;position:sticky;top:0;z-index:20;background:#f8fafc;border-bottom:2px solid var(--border-color)">';
  tableHTML += '<div style="width:180px;min-width:180px;position:sticky;left:0;z-index:30;background:#f8fafc;padding:12px;font-weight:700;border-right:2px solid var(--border-color);color:var(--text-main);display:flex;align-items:center;justify-content:center">ห้องเรียน / อุปกรณ์</div>';
  tableHTML += '<div style="flex:1;display:flex;position:relative">';
  for (var h = timelineStart; h < timelineEnd; h++) {
    tableHTML += '<div style="flex:1;padding:12px 4px;text-align:center;font-weight:700;border-right:1px dashed #e2e8f0;color:var(--text-main);font-size:0.82rem">' + String(h).padStart(2, '0') + '.00</div>';
  }
  tableHTML += '</div></div>';

  // Body
  tableHTML += '<div style="display:flex;flex-direction:column">';

  filteredRooms.forEach(function(room) {
    var roomClasses = (state.classLogs || []).filter(function(log) {
      return matchRoomAndBranch(log.roomBranch, room.roomName, room.branch);
    });

    var details = [];
    if (room.ipad) details.push('📱 ' + room.ipad);
    if (room.zoom) details.push('💻 ' + room.zoom);
    var detailsStr = details.length > 0 ? '<div style="font-size:0.74rem;color:var(--text-muted);display:flex;flex-direction:column;gap:2px;margin-top:4px">' + details.map(function(d){return '<span>'+d+'</span>';}).join('') + '</div>' : '';

    var fullRoomLabel = (room.roomName + ' ' + room.branch + ' ' + (room.ipad || '') + ' ' + (room.zoom || '')).replace(/\s+/g, ' ').trim();

    // Calculate overlap rows
    var rowPlacements = [];
    roomClasses.sort(function(a, b) {
      return parseTimeToHours(a.timeStart) - parseTimeToHours(b.timeStart);
    });

    var cardPositions = [];
    roomClasses.forEach(function(c) {
      var s = parseTimeToHours(c.timeStart || '08.00');
      var e = parseTimeToHours(c.timeEnd || '10.00');
      if (s < timelineStart) s = timelineStart;
      if (e > timelineEnd) e = timelineEnd;
      if (e <= s) e = s + 1;
      
      var rowIndex = 0;
      while (true) {
        if (!rowPlacements[rowIndex]) rowPlacements[rowIndex] = [];
        var overlaps = false;
        for (var p = 0; p < rowPlacements[rowIndex].length; p++) {
          if (s < rowPlacements[rowIndex][p].e && e > rowPlacements[rowIndex][p].s) {
            overlaps = true;
            break;
          }
        }
        if (!overlaps) {
          rowPlacements[rowIndex].push({s: s, e: e});
          break;
        }
        rowIndex++;
      }
      cardPositions.push({c: c, s: s, e: e, row: rowIndex});
    });

    var maxRows = rowPlacements.length > 0 ? rowPlacements.length : 1;
    var rowHeight = maxRows * 135 + 20;

    // Room row
    tableHTML += '<div style="display:flex;border-bottom:1px solid var(--border-color);min-height:' + Math.max(rowHeight, 130) + 'px;position:relative">';
    
    // Left sticky room info
    tableHTML += '<div style="width:180px;min-width:180px;position:sticky;left:0;z-index:10;background:#fff;padding:12px;border-right:2px solid var(--border-color);box-shadow:2px 0 5px -2px rgba(0,0,0,0.05);display:flex;flex-direction:column">';
    tableHTML += '<div style="font-weight:700;font-size:0.95rem;color:var(--color-primary-hover);margin-bottom:4px;word-break:break-word">' + room.roomName + '</div>';
    tableHTML += detailsStr;
    tableHTML += '<div style="display:flex;gap:6px;align-items:center;margin-top:8px">';
    tableHTML += '<button onclick="showEditRoomModal(\'' + room.branch + '\',\'' + room.roomName + '\',\'' + (room.ipad||'') + '\',\'' + (room.zoom||'') + '\')" style="font-size:0.72rem;padding:3px 6px;border:1px solid var(--border-color);border-radius:4px;background:#f8fafc;cursor:pointer" title="แก้ไข">✏️ แก้ไข</button>';
    tableHTML += '<button onclick="deleteRoomFrontend(\'' + room.branch + '\',\'' + room.roomName + '\')" style="font-size:0.72rem;padding:3px 6px;border:1px solid var(--border-color);border-radius:4px;background:#fff5f5;color:var(--color-danger);cursor:pointer" title="ลบ">🗑️ ลบ</button>';
    tableHTML += '</div>';
    tableHTML += '<div style="margin-top:auto;padding-top:12px"><button onclick="quickAddClassLog(\'' + fullRoomLabel.replace(/'/g, "\\'") + '\')" style="width:100%;padding:6px;font-size:0.76rem;border-radius:4px;border:1px dashed var(--color-primary);background:rgba(70,99,82,0.03);color:var(--color-primary);font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px"><span>➕</span> เพิ่มคลาสเรียน</button></div>';
    tableHTML += '</div>';

    // Timeline area
    tableHTML += '<div style="flex:1;display:flex;position:relative">';
    // Background vertical dashed lines
    for (var h = timelineStart; h < timelineEnd; h++) {
      tableHTML += '<div style="flex:1;border-right:1px dashed #e2e8f0;pointer-events:none"></div>';
    }

    // Cards container (absolute positioned)
    tableHTML += '<div style="position:absolute;top:0;left:0;right:0;bottom:0;padding:4px 0">';

    cardPositions.forEach(function(pos) {
      var c = pos.c;
      var leftPct = ((pos.s - timelineStart) / timelineSpan) * 100;
      var widthPct = ((pos.e - pos.s) / timelineSpan) * 100;
      var topPx = pos.row * 135 + 4;

      var isTeacherConfirmed = c.teacherConfirmed > 0;
      var isStudentLeaveChecked = (state.classAbsences && state.classAbsences[c.rowIndex] && state.classAbsences[c.rowIndex].studentLeave) || (c.isLeave > 0);
      var isTeacherLeaveChecked = (state.classAbsences && state.classAbsences[c.rowIndex] && state.classAbsences[c.rowIndex].teacherLeave) || (c.note && String(c.note).includes('ครูลา'));

      var cardBg = '';
      var cardBorderStyle = '';
      if (isTeacherConfirmed) {
        cardBg = 'background:rgba(25,135,84,0.08);';
        cardBorderStyle = 'border:1.5px solid rgba(25,135,84,0.4);';
      } else if (isStudentLeaveChecked) {
        cardBg = 'background:rgb(254,226,226);';
        cardBorderStyle = 'border:1px solid rgba(239,68,68,0.35);';
      } else if (isTeacherLeaveChecked) {
        cardBg = 'background:rgb(254,243,199);';
        cardBorderStyle = 'border:1px solid rgba(245,158,11,0.45);';
      } else {
        var subjStr = String(c.subject || '');
        var isPrivate = subjStr.includes('เดี่ยว') || subjStr.includes('ย่อย');
        if (!isPrivate) {
          cardBg = 'background:rgba(56,189,248,0.08);';
          cardBorderStyle = 'border:1px solid rgba(56,189,248,0.4);';
        } else {
          cardBg = 'background:#fff;';
          cardBorderStyle = 'border:1px solid var(--border-color);';
        }
      }

      var attendances = [];
      attendances.push('สด:' + (c.isPresentLive || 0));
      attendances.push('ออน:' + (c.isPresentOnline || 0));
      attendances.push('ลา:' + (c.isLeave || 0));
      attendances.push('ขาด:' + (c.isAbsent || 0));
      attendances.push('ชด:' + (c.isMakeup || 0));
      var attendanceHTML = '<div style="font-size:0.66rem;color:var(--color-primary-hover);font-weight:500;margin-top:3px">👥 ' + attendances.join(' ') + '</div>';

      var displayRoomText = c.roomBranch || '-';
      var displayDeviceText = '';
      var deviceMatch = displayRoomText.match(/(?:ipad|zoom).*/i);
      if (deviceMatch) {
        displayDeviceText = deviceMatch[0];
        displayRoomText = displayRoomText.replace(deviceMatch[0], '').trim();
      }

      var confirmBtn = '';
      if (isTeacherConfirmed) {
        confirmBtn = '<button type="button" onclick="toggleDailyGridConfirm(' + c.rowIndex + ',false)" style="font-size:0.65rem;padding:2px 6px;background:#15803d;color:white;font-weight:700;border-radius:10px;border:none;cursor:pointer">✓ ยืนยัน</button>';
      } else {
        confirmBtn = '<button type="button" onclick="toggleDailyGridConfirm(' + c.rowIndex + ',true)" style="font-size:0.65rem;padding:2px 6px;background:#e2e8f0;color:#475569;font-weight:600;border-radius:10px;border:none;cursor:pointer">รอยืนยัน</button>';
      }

      tableHTML += '<div id="scheduled_item_' + c.rowIndex + '" style="position:absolute;left:' + leftPct + '%;width:calc(' + widthPct + '% - 4px);top:' + topPx + 'px;' + cardBg + cardBorderStyle + 'border-radius:6px;padding:6px 8px;font-size:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);overflow:hidden;white-space:normal;min-width:100px">';
      
      // Subject + time
      tableHTML += '<div style="font-weight:700;color:var(--text-main);margin-bottom:2px;font-size:0.76rem;line-height:1.2;padding-right:40px">' + formatSubjectName(c.subject) + '</div>';
      tableHTML += '<div style="font-size:0.68rem;font-weight:600;color:var(--color-primary-hover);margin-bottom:3px">' + cleanTimeStr(c.timeStart) + ' - ' + cleanTimeStr(c.timeEnd) + '</div>';
      
      // Teacher info
      tableHTML += '<div style="font-size:0.68rem;color:var(--text-muted);line-height:1.3">';
      tableHTML += '👨‍🏫 ' + (c.teacherRegular || '-');
      if (c.teacherSub) tableHTML += '<br>🔄 ' + c.teacherSub;
      tableHTML += '</div>';
      
      // Attendance
      tableHTML += attendanceHTML;

      // Checkboxes + confirm + edit/delete
      tableHTML += '<div style="display:flex;align-items:center;gap:4px;margin-top:4px;flex-wrap:wrap;border-top:1px dashed rgba(0,0,0,0.06);padding-top:4px" onclick="event.stopPropagation()">';
      tableHTML += '<label style="font-size:0.66rem;color:' + (isStudentLeaveChecked ? '#dc2626' : 'var(--text-muted)') + ';display:flex;align-items:center;gap:2px;cursor:pointer"><input type="checkbox" ' + (isStudentLeaveChecked ? 'checked' : '') + ' onchange="toggleClassAbsence(' + c.rowIndex + ',\'studentLeave\',this)" style="width:12px;height:12px;cursor:pointer;accent-color:var(--color-danger)"> น้องลา</label>';
      tableHTML += '<label style="font-size:0.66rem;color:' + (isTeacherLeaveChecked ? '#dc2626' : 'var(--text-muted)') + ';display:flex;align-items:center;gap:2px;cursor:pointer"><input type="checkbox" ' + (isTeacherLeaveChecked ? 'checked' : '') + ' onchange="toggleClassAbsence(' + c.rowIndex + ',\'teacherLeave\',this)" style="width:12px;height:12px;cursor:pointer;accent-color:var(--color-danger)"> ครูลา</label>';
      tableHTML += '<div style="margin-left:auto;display:flex;gap:3px">' + confirmBtn;
      tableHTML += '<button type="button" onclick="showEditClassLogModal(' + c.rowIndex + ')" style="font-size:0.65rem;padding:2px 4px;background:none;border:1px solid var(--border-color);border-radius:4px;cursor:pointer" title="แก้ไข">✏️</button>';
      tableHTML += '<button type="button" onclick="deleteClassLog(' + c.rowIndex + ')" style="font-size:0.65rem;padding:2px 4px;background:none;border:1px solid var(--border-color);border-radius:4px;cursor:pointer;color:var(--color-danger)" title="ลบ">🗑️</button>';
      tableHTML += '</div></div>';

      tableHTML += '</div>'; // end card
    });

    tableHTML += '</div>'; // end cards container
    tableHTML += '</div>'; // end timeline area
    tableHTML += '</div>'; // end room row
  });

  tableHTML += '</div>'; // end body
  tableHTML += '</div></div>'; // end wrapper

  container.innerHTML = tableHTML;

  if (state.pendingScrollRowIndex) {
    var targetRowIndex = state.pendingScrollRowIndex;
    state.pendingScrollRowIndex = null;
    setTimeout(function() {
      highlightScheduledItem(targetRowIndex);
    }, 400);
  }
}

''' + '\n\n\n'

    # New renderTeacherScheduleGrid (Timeline version)
    new_teacher = r'''function renderTeacherScheduleGrid(teacher) {
  var container = document.getElementById('teacher_calendar_container');
  container.innerHTML = '';
  container.style.display = 'block';

  if (!state.teacherClasses || state.teacherClasses.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px">ไม่มีข้อมูลตารางสอนของคุณครูท่านนี้</div>';
    return;
  }

  function parseSheetDate(dateStr) {
    if (!dateStr) return { sortKey: '0000-00-00' };
    var parts = dateStr.split('/');
    if (parts.length === 3) {
      var d = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10);
      var y = parseInt(parts[2], 10);
      return { sortKey: y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0') };
    }
    return { sortKey: '0000-00-00' };
  }

  function getThaiDateLabel(dateStr) {
    if (!dateStr) return '-';
    var parts = dateStr.split('/');
    if (parts.length === 3) {
      var d = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10) - 1;
      var thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
      return d + ' ' + thMonths[m] + ' ' + parts[2];
    }
    return dateStr;
  }

  function parseTimeToHours(t) {
    var parts = (t || '00.00').replace(':', '.').split('.');
    return parseInt(parts[0] || 0) + (parseInt(parts[1] || 0) / 60);
  }

  var timelineStart = 8;
  var timelineEnd = 20;
  var timelineSpan = timelineEnd - timelineStart;

  var sorted = state.teacherClasses.slice().sort(function(a, b) {
    var keyA = parseSheetDate(a.date).sortKey + ' ' + (a.timeStart || '');
    var keyB = parseSheetDate(b.date).sortKey + ' ' + (b.timeStart || '');
    return keyA.localeCompare(keyB);
  });

  // Group by date
  var dateGroups = {};
  var dateOrder = [];
  sorted.forEach(function(log) {
    var dk = log.date || 'ไม่ระบุ';
    if (!dateGroups[dk]) {
      dateGroups[dk] = [];
      dateOrder.push(dk);
    }
    dateGroups[dk].push(log);
  });

  var html = '<div style="width:100%;overflow-x:auto;border:1px solid var(--border-color);border-radius:8px;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,0.02)">';
  html += '<div style="min-width:1300px;position:relative">';

  // Header
  html += '<div style="display:flex;position:sticky;top:0;z-index:20;background:#f8fafc;border-bottom:2px solid var(--border-color)">';
  html += '<div style="width:150px;min-width:150px;position:sticky;left:0;z-index:30;background:#f8fafc;padding:12px;font-weight:700;border-right:2px solid var(--border-color);color:var(--text-main);display:flex;align-items:center;justify-content:center">วันที่</div>';
  html += '<div style="flex:1;display:flex">';
  for (var h = timelineStart; h < timelineEnd; h++) {
    html += '<div style="flex:1;padding:12px 4px;text-align:center;font-weight:700;border-right:1px dashed #e2e8f0;color:var(--text-main);font-size:0.82rem">' + String(h).padStart(2, '0') + '.00</div>';
  }
  html += '</div></div>';

  // Body
  html += '<div style="display:flex;flex-direction:column">';

  dateOrder.forEach(function(dateKey) {
    var dateClasses = dateGroups[dateKey];
    var thaiDate = getThaiDateLabel(dateKey);

    // Calculate overlap
    var rowPlacements = [];
    var cardPositions = [];
    dateClasses.forEach(function(c) {
      var s = parseTimeToHours(c.timeStart || '08.00');
      var e = parseTimeToHours(c.timeEnd || '10.00');
      if (s < timelineStart) s = timelineStart;
      if (e > timelineEnd) e = timelineEnd;
      if (e <= s) e = s + 1;

      var rowIdx = 0;
      while (true) {
        if (!rowPlacements[rowIdx]) rowPlacements[rowIdx] = [];
        var overlaps = false;
        for (var p = 0; p < rowPlacements[rowIdx].length; p++) {
          if (s < rowPlacements[rowIdx][p].e && e > rowPlacements[rowIdx][p].s) { overlaps = true; break; }
        }
        if (!overlaps) {
          rowPlacements[rowIdx].push({s: s, e: e});
          break;
        }
        rowIdx++;
      }
      cardPositions.push({c: c, s: s, e: e, row: rowIdx});
    });

    var maxRows = rowPlacements.length > 0 ? rowPlacements.length : 1;
    var rowHeight = maxRows * 135 + 20;

    // Date row
    html += '<div style="display:flex;border-bottom:1px solid var(--border-color);min-height:' + Math.max(rowHeight, 130) + 'px;position:relative">';
    // Left: date label
    html += '<div style="width:150px;min-width:150px;position:sticky;left:0;z-index:10;background:#fff;padding:16px 10px;border-right:2px solid var(--border-color);box-shadow:2px 0 5px -2px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;text-align:center"><div style="font-weight:700;font-size:0.95rem;color:var(--color-primary-hover)">' + thaiDate + '</div></div>';
    
    // Timeline area
    html += '<div style="flex:1;display:flex;position:relative">';
    for (var hh = timelineStart; hh < timelineEnd; hh++) {
      html += '<div style="flex:1;border-right:1px dashed #e2e8f0;pointer-events:none"></div>';
    }

    // Cards
    html += '<div style="position:absolute;top:0;left:0;right:0;bottom:0;padding:4px 0">';

    cardPositions.forEach(function(pos) {
      var c = pos.c;
      var leftPct = ((pos.s - timelineStart) / timelineSpan) * 100;
      var widthPct = ((pos.e - pos.s) / timelineSpan) * 100;
      var topPx = pos.row * 135 + 4;

      // Color logic
      var cleanRoom = (c.roomBranch || '').toLowerCase();
      var borderColor = 'var(--border-color)';
      if (cleanRoom.includes('สาขา 1') || cleanRoom.includes('สาขา1')) borderColor = 'var(--color-success)';
      else if (cleanRoom.includes('สาขา 2') || cleanRoom.includes('สาขา2')) borderColor = '#3b82f6';
      else if (cleanRoom.includes('สาขา 3') || cleanRoom.includes('สาขา3')) borderColor = '#f59e0b';
      else if (cleanRoom.includes('ออนไลน์') || cleanRoom.includes('online')) borderColor = '#8b5cf6';

      var isConfirmed = c.teacherConfirmed > 0;
      var cardBg = isConfirmed ? 'background:rgba(25,135,84,0.08);' : 'background:#fff;';
      var cardBorder = isConfirmed ? 'border:1.5px solid rgba(25,135,84,0.4);' : 'border:1px solid var(--border-color);';
      var borderLeft = 'border-left:4px solid ' + (isConfirmed ? '#15803d' : borderColor) + ';';

      var isSub = c.teacherSub && c.teacherSub.toLowerCase().includes(teacher.toLowerCase().trim());
      var roleBadge = isSub
        ? '<span style="font-size:0.6rem;background:var(--color-danger);color:white;padding:1px 4px;border-radius:4px;font-weight:700">สอนแทน</span>'
        : '<span style="font-size:0.6rem;background:var(--color-primary);color:white;padding:1px 4px;border-radius:4px;font-weight:700">ครูหลัก</span>';

      var attendances = [];
      attendances.push('<span class="badge badge-success" style="font-size:0.58rem;padding:1px 3px">สด:' + (c.isPresentLive || 0) + '</span>');
      attendances.push('<span class="badge badge-info" style="font-size:0.58rem;padding:1px 3px">ออน:' + (c.isPresentOnline || 0) + '</span>');
      attendances.push('<span class="badge badge-warning" style="font-size:0.58rem;padding:1px 3px">ลา:' + (c.isLeave || 0) + '</span>');
      attendances.push('<span class="badge badge-danger" style="font-size:0.58rem;padding:1px 3px">ขาด:' + (c.isAbsent || 0) + '</span>');
      attendances.push('<span class="badge" style="font-size:0.58rem;background:#c095e7;color:white;padding:1px 3px">ชด:' + (c.isMakeup || 0) + '</span>');

      var confirmedBadge = isConfirmed ? '<span style="font-size:0.6rem;background:#15803d;color:#fff;padding:1px 4px;border-radius:4px;font-weight:700">✅ ยืนยัน</span>' : '';

      var roomDisplay = (c.roomBranch || '').replace(/Zoom\s*\S*/i, '').replace(/\s+/g, ' ').trim() || '-';

      html += '<div style="position:absolute;left:' + leftPct + '%;width:calc(' + widthPct + '% - 4px);top:' + topPx + 'px;' + cardBg + cardBorder + borderLeft + 'border-radius:6px;padding:6px 8px;font-size:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);overflow:hidden;white-space:normal;min-width:100px">';
      
      // Subject
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:4px">';
      html += '<div style="font-weight:700;font-size:0.76rem;color:var(--text-main);line-height:1.2;word-break:break-word">' + formatSubjectName(c.subject) + '</div>';
      html += '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0">' + roleBadge + confirmedBadge + '</div>';
      html += '</div>';
      
      // Time + room
      html += '<div style="font-size:0.68rem;font-weight:600;color:var(--color-primary-hover);margin:2px 0">⏰ ' + cleanTimeStr(c.timeStart) + ' - ' + cleanTimeStr(c.timeEnd) + '</div>';
      html += '<div style="font-size:0.68rem;color:var(--text-muted)">🏢 ' + roomDisplay + '</div>';
      html += '<div style="font-size:0.68rem;color:var(--text-muted)">👨‍🏫 ' + (c.teacherRegular || '-') + (c.teacherSub ? ' (แทน: ' + c.teacherSub + ')' : '') + '</div>';

      // Note
      if (c.note) {
        html += '<div style="font-size:0.66rem;margin-top:3px;padding:3px 6px;background:rgba(0,0,0,0.02);border-radius:4px;font-style:italic;color:#64748b;word-break:break-word">📝 ' + c.note + '</div>';
      }

      // Attendance
      html += '<div style="display:flex;gap:2px;flex-wrap:wrap;margin-top:3px;border-top:1px dashed var(--border-color);padding-top:3px">' + attendances.join('') + '</div>';

      html += '</div>'; // end card
    });

    html += '</div>'; // cards container
    html += '</div>'; // timeline area
    html += '</div>'; // date row
  });

  html += '</div>'; // body
  html += '</div></div>'; // wrapper

  container.innerHTML = html;
}

''' + '\n\n'

    # Do the replacement
    # Replace teacher grid first (later in file, so line numbers for daily are unaffected)
    new_lines = lines[:daily_start] + [new_daily] + lines[daily_end:]
    
    # Recalculate teacher_start and teacher_end in new_lines
    teacher_start_new = None
    teacher_end_new = None
    for i, line in enumerate(new_lines):
        if isinstance(line, str) and 'function renderTeacherScheduleGrid(teacher) {' in line and teacher_start_new is None:
            teacher_start_new = i
        if teacher_start_new is not None and i > teacher_start_new and isinstance(line, str) and line.strip() == 'function loadTeacherProfiles() {':
            teacher_end_new = i
            break

    if teacher_start_new is None or teacher_end_new is None:
        print("ERROR: Could not find renderTeacherScheduleGrid boundaries after first replacement")
        # Write what we have so far
        with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Wrote renderDailyGrid replacement only")
        return

    final_lines = new_lines[:teacher_start_new] + [new_teacher] + new_lines[teacher_end_new:]
    
    with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
        f.writelines(final_lines)
    
    print("SUCCESS: Both functions replaced!")

if __name__ == '__main__':
    main()
