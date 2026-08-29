# -*- coding: utf-8 -*-
"""Replace renderDailyGrid with timeline/Gantt chart layout"""

import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the function boundaries
start_marker = 'function renderDailyGrid() {'
end_marker_pattern = r'\nfunction quickAddClassLog\('

start_idx = content.index(start_marker)
end_match = re.search(end_marker_pattern, content[start_idx:])
if not end_match:
    print("ERROR: Could not find end of renderDailyGrid")
    exit(1)

# Go back to find the blank lines before quickAddClassLog
end_idx = start_idx + end_match.start()

# The new function
new_function = r'''function renderDailyGrid() {
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

  // Timeline constants
  const HOUR_START = 8;
  const HOUR_END = 22;
  const TOTAL_HOURS = HOUR_END - HOUR_START; // 14
  const COL_WIDTH = 180; // px per hour (reduced 20%)
  const TIMELINE_WIDTH = TOTAL_HOURS * COL_WIDTH;
  const ROOM_COL_WIDTH = 160;
  const CARD_ROW_HEIGHT = 120; // reduced 20% from ~150

  // Helper: parse time string to decimal hours
  function parseTimeToHours(t) {
    if (!t) return null;
    var s = String(t).replace(':', '.').replace(/\s/g, '');
    var parts = s.split('.');
    var h = parseInt(parts[0], 10) || 0;
    var m = parseInt(parts[1], 10) || 0;
    return h + m / 60;
  }

  // Build header
  var headerCols = '';
  for (var h = HOUR_START; h <= HOUR_END; h++) {
    var label = String(h).padStart(2, '0') + '.00';
    headerCols += '<div style="position:absolute; left:' + ((h - HOUR_START) * COL_WIDTH) + 'px; width:' + COL_WIDTH + 'px; text-align:center; font-weight:700; font-size:0.72rem; color:var(--text-main); padding:8px 0; box-sizing:border-box; border-right:1px dashed #e2e8f0;">' + label + '</div>';
  }

  var html = '<div style="width:100%; max-height:75vh; overflow:auto; border:1px solid var(--border-color); border-radius:8px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.02);">';
  html += '<div style="display:flex; min-width:' + (ROOM_COL_WIDTH + TIMELINE_WIDTH) + 'px;">';
  
  // Sticky header
  html += '<div style="position:sticky; top:0; z-index:20; display:flex; width:100%; background:#f8fafc; border-bottom:2px solid var(--border-color);">';
  html += '<div style="position:sticky; left:0; z-index:30; min-width:' + ROOM_COL_WIDTH + 'px; width:' + ROOM_COL_WIDTH + 'px; padding:8px 10px; font-weight:700; font-size:0.72rem; color:var(--text-main); border-right:2px solid var(--border-color); background:#f8fafc; display:flex; align-items:center;">ห้องเรียน / อุปกรณ์</div>';
  html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; height:36px;">' + headerCols + '</div>';
  html += '</div></div>';

  // Rows
  filteredRooms.forEach(function(room) {
    var roomClasses = (state.classLogs || []).filter(function(log) {
      return matchRoomAndBranch(log.roomBranch, room.roomName, room.branch);
    });

    // Parse times and compute positions
    var cards = [];
    roomClasses.forEach(function(c) {
      var sh = parseTimeToHours(c.timeStart);
      var eh = parseTimeToHours(c.timeEnd);
      if (sh === null) return;
      if (eh === null || eh <= sh) eh = sh + 1;
      cards.push({ c: c, sh: sh, eh: eh });
    });
    cards.sort(function(a, b) { return a.sh - b.sh || a.eh - b.eh; });

    // Compute row (vertical stacking for overlaps)
    var rows = [];
    cards.forEach(function(card) {
      var placed = false;
      for (var r = 0; r < rows.length; r++) {
        var conflict = false;
        for (var k = 0; k < rows[r].length; k++) {
          if (card.sh < rows[r][k].eh && card.eh > rows[r][k].sh) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          rows[r].push(card);
          card.row = r;
          placed = true;
          break;
        }
      }
      if (!placed) {
        card.row = rows.length;
        rows.push([card]);
      }
    });

    var maxRows = rows.length || 1;
    var rowHeight = maxRows * CARD_ROW_HEIGHT + 10;

    // Room details
    var detailsArr = [];
    if (room.ipad) detailsArr.push('📱 ' + room.ipad);
    if (room.zoom) detailsArr.push('💻 ' + room.zoom);
    var detailsStr = detailsArr.length > 0 ? detailsArr.map(function(d){ return '<div style="font-size:0.65rem; color:var(--text-muted);">' + d + '</div>'; }).join('') : '';
    var fullRoomLabel = (room.roomName + ' ' + room.branch + ' ' + (room.ipad||'') + ' ' + (room.zoom||'')).replace(/\s+/g, ' ').trim();

    html += '<div style="display:flex; min-width:' + (ROOM_COL_WIDTH + TIMELINE_WIDTH) + 'px; border-bottom:1px solid var(--border-color);">';
    
    // Room info (sticky left)
    html += '<div style="position:sticky; left:0; z-index:10; min-width:' + ROOM_COL_WIDTH + 'px; width:' + ROOM_COL_WIDTH + 'px; padding:8px 10px; border-right:2px solid var(--border-color); background:#fff; box-shadow:2px 0 5px -2px rgba(0,0,0,0.05); vertical-align:top;">';
    html += '<div style="font-size:0.8rem; font-weight:700; color:var(--color-primary-hover); margin-bottom:2px;">' + room.roomName + '</div>';
    html += '<div style="font-size:0.68rem; color:var(--text-muted); margin-bottom:2px;">' + (room.branch||'') + '</div>';
    html += detailsStr;
    html += '<div style="display:flex; gap:4px; margin-top:4px;">';
    html += '<button onclick="showEditRoomModal(\'' + room.branch + '\', \'' + room.roomName + '\', \'' + (room.ipad||'') + '\', \'' + (room.zoom||'') + '\')" style="font-size:0.62rem; padding:2px 4px; border:1px solid var(--border-color); border-radius:3px; background:#f8fafc; cursor:pointer;" title="แก้ไข">✏️ แก้ไข</button>';
    html += '<button onclick="deleteRoomFrontend(\'' + room.branch + '\', \'' + room.roomName + '\')" style="font-size:0.62rem; padding:2px 4px; border:1px solid var(--border-color); border-radius:3px; background:#fff5f5; color:var(--color-danger); cursor:pointer;" title="ลบ">🗑️ ลบ</button>';
    html += '</div>';
    html += '<button onclick="quickAddClassLog(\'' + fullRoomLabel + '\')" style="margin-top:6px; width:100%; display:flex; align-items:center; justify-content:center; gap:3px; padding:4px; font-size:0.65rem; border-radius:var(--radius-sm); border:1px dashed var(--color-primary); background:rgba(70,99,82,0.03); color:var(--color-primary); font-weight:600; cursor:pointer;">➕ เพิ่มคลาส</button>';
    html += '</div>';

    // Timeline area
    html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; min-height:' + rowHeight + 'px;">';
    
    // Vertical grid lines
    for (var gh = HOUR_START; gh <= HOUR_END; gh++) {
      html += '<div style="position:absolute; left:' + ((gh - HOUR_START) * COL_WIDTH) + 'px; top:0; bottom:0; width:1px; background:' + (gh === HOUR_END ? 'transparent' : '#f0f0f0') + ';"></div>';
    }

    // Cards
    cards.forEach(function(card) {
      var c = card.c;
      var leftPx = (card.sh - HOUR_START) * COL_WIDTH + 2;
      var widthPx = (card.eh - card.sh) * COL_WIDTH - 4;
      var topPx = card.row * CARD_ROW_HEIGHT + 4;

      // Status / color logic
      var isTeacherConfirmed = c.teacherConfirmed > 0;
      var isStudentLeaveChecked = (state.classAbsences && state.classAbsences[c.rowIndex] && state.classAbsences[c.rowIndex].studentLeave) || (c.isLeave > 0);
      var isTeacherLeaveChecked = (state.classAbsences && state.classAbsences[c.rowIndex] && state.classAbsences[c.rowIndex].teacherLeave) || (c.note && String(c.note).includes('ครูลา'));

      var cardBg = 'background:#fff;';
      var cardBorder = 'border:1px solid var(--border-color);';
      if (isTeacherConfirmed) {
        cardBg = 'background:rgba(25,135,84,0.08);';
        cardBorder = 'border:1.5px solid rgba(25,135,84,0.4);';
      } else if (isStudentLeaveChecked) {
        cardBg = 'background:rgb(254,226,226);';
        cardBorder = 'border:1px solid rgba(239,68,68,0.35);';
      } else if (isTeacherLeaveChecked) {
        cardBg = 'background:rgb(254,243,199);';
        cardBorder = 'border:1px solid rgba(245,158,11,0.45);';
      } else {
        var subjStr = String(c.subject || '');
        var isPrivate = subjStr.includes('เดี่ยว') || subjStr.includes('ย่อย');
        if (!isPrivate) {
          cardBg = 'background:rgba(56,189,248,0.08);';
          cardBorder = 'border:1.5px solid rgba(56,189,248,0.4);';
        }
      }

      // Attendance
      var attArr = [];
      attArr.push('สด:' + (c.isPresentLive||0));
      attArr.push('ออน:' + (c.isPresentOnline||0));
      attArr.push('ลา:' + (c.isLeave||0));
      attArr.push('ชด:' + (c.isMakeup||0));
      attArr.push('ขาด:' + (c.isAbsent||0));

      // Confirm button
      var confirmBtn = isTeacherConfirmed
        ? '<button type="button" onclick="toggleDailyGridConfirm(' + c.rowIndex + ',false)" style="font-size:0.58rem; padding:1px 5px; background:#15803d; color:white; font-weight:700; border-radius:10px; border:none; cursor:pointer;">✓ ยืนยัน</button>'
        : '<button type="button" onclick="toggleDailyGridConfirm(' + c.rowIndex + ',true)" style="font-size:0.58rem; padding:1px 5px; background:#e2e8f0; color:#475569; font-weight:700; border-radius:10px; border:none; cursor:pointer;">รอยืนยัน</button>';

      var confirmedBadge = isTeacherConfirmed ? '<div style="font-weight:bold; color:#2e7d32; font-size:0.58rem;">✅ ยืนยันแล้ว</div>' : '';

      // Room/device text
      var displayRoomText = c.roomBranch || '-';
      var displayDeviceText = '';
      var deviceMatch = displayRoomText.match(/(?:ipad|zoom).*/i);
      if (deviceMatch) {
        displayDeviceText = deviceMatch[0];
        displayRoomText = displayRoomText.replace(deviceMatch[0], '').trim();
      }

      html += '<div id="scheduled_item_' + c.rowIndex + '" style="position:absolute; left:' + leftPx + 'px; top:' + topPx + 'px; width:' + widthPx + 'px; height:' + (CARD_ROW_HEIGHT - 8) + 'px; ' + cardBg + ' ' + cardBorder + ' border-radius:6px; padding:4px 6px; font-size:0.62rem; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,0.04); cursor:default;">';
      
      // Top: subject + time
      html += '<div>';
      html += '<div style="font-weight:700; font-size:0.68rem; color:var(--text-main); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + (c.subject||'').replace(/"/g,'&quot;') + '">' + formatSubjectName(c.subject) + '</div>';
      html += '<span style="font-size:0.6rem; font-weight:bold; color:var(--color-primary-hover); background:rgba(0,132,255,0.06); padding:0px 5px; border-radius:10px; display:inline-block; margin-top:1px;">' + cleanTimeStr(c.timeStart) + ' - ' + cleanTimeStr(c.timeEnd) + '</span>';
      html += '</div>';
      
      // Middle: details
      html += '<div style="font-size:0.58rem; color:var(--text-muted); line-height:1.25; border-top:1px dashed var(--border-color); padding-top:2px; margin-top:2px; overflow:hidden;">';
      html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">🏢 ' + displayRoomText + '</div>';
      if (displayDeviceText) html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--color-primary-hover);">💻 ' + displayDeviceText + '</div>';
      html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><b>ครูประจำ:</b> ' + (c.teacherRegular||'-') + '</div>';
      html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><b>ครูแทน:</b> ' + (c.teacherSub ? '<b>' + c.teacherSub + '</b>' : '-') + '</div>';
      html += confirmedBadge;
      html += '<div style="color:var(--color-primary-hover); font-size:0.55rem;">👥 ' + attArr.join(' ') + '</div>';
      html += '</div>';
      
      // Bottom: combined row - checkboxes + confirm + edit/delete
      html += '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed rgba(0,0,0,0.06); padding-top:2px; margin-top:2px; gap:2px;" onclick="event.stopPropagation();">';
      html += '<div style="display:flex; gap:4px; align-items:center; flex-shrink:0;">';
      html += '<label style="display:flex; align-items:center; gap:1px; font-size:0.55rem; color:var(--color-danger); font-weight:bold; cursor:pointer; white-space:nowrap;"><input type="checkbox" class="student-leave-chk" data-row="' + c.rowIndex + '" ' + (isStudentLeaveChecked ? 'checked' : '') + ' onchange="toggleClassAbsence(' + c.rowIndex + ',\'studentLeave\',this)" style="transform:scale(0.75); margin:0;"> น้องลา</label>';
      html += '<label style="display:flex; align-items:center; gap:1px; font-size:0.55rem; color:var(--color-danger); font-weight:bold; cursor:pointer; white-space:nowrap;"><input type="checkbox" class="teacher-leave-chk" data-row="' + c.rowIndex + '" ' + (isTeacherLeaveChecked ? 'checked' : '') + ' onchange="toggleClassAbsence(' + c.rowIndex + ',\'teacherLeave\',this)" style="transform:scale(0.75); margin:0;"> ครูลา</label>';
      html += '</div>';
      html += '<div style="display:flex; gap:2px; align-items:center; flex-shrink:0;">';
      html += confirmBtn;
      html += '<button type="button" onclick="showEditClassLogModal(' + c.rowIndex + ')" style="padding:1px 3px; font-size:0.58rem; border:1px solid var(--border-color); background:#f8fafc; border-radius:3px; cursor:pointer; height:auto;" title="แก้ไข">✏️</button>';
      html += '<button type="button" onclick="deleteClassLog(' + c.rowIndex + ')" style="padding:1px 3px; font-size:0.58rem; border:1px solid #fecaca; background:#fef2f2; color:var(--color-danger); border-radius:3px; cursor:pointer; height:auto;" title="ลบ">🗑️</button>';
      html += '</div>';
      html += '</div>';
      
      html += '</div>'; // end card
    });

    html += '</div>'; // end timeline area
    html += '</div>'; // end row
  });

  html += '</div>'; // end outer
  container.innerHTML = html;
  
  if (state.pendingScrollRowIndex) {
    var targetRowIndex = state.pendingScrollRowIndex;
    state.pendingScrollRowIndex = null;
    setTimeout(function() {
      highlightScheduledItem(targetRowIndex);
    }, 400);
  }
}


'''

content = content[:start_idx] + new_function + content[end_idx:]

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! renderDailyGrid replaced successfully.")
