import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the entire renderTeacherScheduleGrid function
pattern = r'function renderTeacherScheduleGrid\(teacher\) \{.*?(?=\nfunction loadTeacherProfiles)'

new_function = """function renderTeacherScheduleGrid(teacher) {
  const container = document.getElementById('teacher_calendar_container');
  container.innerHTML = '';
  container.style.display = 'block';
  container.style.gridTemplateColumns = 'none';
  container.className = '';

  if (!state.teacherClasses || state.teacherClasses.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">ไม่มีข้อมูลตารางสอนของคุณครูท่านนี้</div>';
    return;
  }

  function parseTimeToHours(t) {
    if (!t) return null;
    var s = String(t).replace(':', '.').replace(/\\s/g, '');
    var parts = s.split('.');
    var h = parseInt(parts[0], 10) || 0;
    var m = parseInt(parts[1], 10) || 0;
    return h + m / 60;
  }

  function parseSheetDate(dateStr) {
    if (!dateStr) return { sortKey: '0000-00-00' };
    var parts = dateStr.split('/');
    if (parts.length === 3) {
      var d = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10);
      var y = parseInt(parts[2], 10);
      var sortKey = y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      return { sortKey: sortKey };
    }
    return { sortKey: '0000-00-00' };
  }

  // Group by date
  var groupedByDate = {};
  state.teacherClasses.forEach(function(log) {
    var sortKey = parseSheetDate(log.date).sortKey;
    if (!groupedByDate[sortKey]) {
      groupedByDate[sortKey] = { dateStr: log.date, sortKey: sortKey, classes: [] };
    }
    groupedByDate[sortKey].classes.push(log);
  });

  var sortedDates = Object.values(groupedByDate).sort(function(a, b) {
    return a.sortKey.localeCompare(b.sortKey);
  });

  // Timeline constants - match admin daily grid exactly
  var HOUR_START = 8;
  var HOUR_END = 22;
  var TOTAL_HOURS = HOUR_END - HOUR_START;
  var COL_WIDTH = 180;
  var TIMELINE_WIDTH = TOTAL_HOURS * COL_WIDTH;
  var ROW_HEADER_WIDTH = 140;
  var CARD_ROW_HEIGHT = 120;

  // Build header
  var headerCols = '';
  for (var h = HOUR_START; h <= HOUR_END; h++) {
    var label = String(h).padStart(2, '0') + '.00';
    headerCols += '<div style="position:absolute; left:' + ((h - HOUR_START) * COL_WIDTH) + 'px; width:' + COL_WIDTH + 'px; text-align:center; font-weight:700; font-size:0.72rem; color:var(--text-main); padding:8px 0; box-sizing:border-box; border-right:1px dashed #e2e8f0;">' + label + '</div>';
  }

  var html = '<div style="width:100%; height:65vh; overflow:auto; border:1px solid var(--border-color); border-radius:8px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.02);">';

  // Sticky header row
  html += '<div style="position:sticky; top:0; z-index:20; display:flex; min-width:' + (ROW_HEADER_WIDTH + TIMELINE_WIDTH) + 'px; background:#f8fafc; border-bottom:2px solid var(--border-color);">';
  html += '<div style="position:sticky; left:0; z-index:30; min-width:' + ROW_HEADER_WIDTH + 'px; width:' + ROW_HEADER_WIDTH + 'px; padding:8px 10px; font-weight:700; font-size:0.72rem; color:var(--text-main); border-right:2px solid var(--border-color); background:#f8fafc; display:flex; align-items:center;">วันที่สอน</div>';
  html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; height:36px;">' + headerCols + '</div>';
  html += '</div>';

  // Data rows
  sortedDates.forEach(function(dateGroup) {
    var cards = [];
    dateGroup.classes.forEach(function(c) {
      var sh = parseTimeToHours(c.timeStart);
      var eh = parseTimeToHours(c.timeEnd);
      if (sh === null) return;
      if (eh === null || eh <= sh) eh = sh + 1;
      cards.push({ c: c, sh: sh, eh: eh });
    });
    cards.sort(function(a, b) { return a.sh - b.sh || a.eh - b.eh; });

    // Overlap stacking
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

    html += '<div style="display:flex; min-width:' + (ROW_HEADER_WIDTH + TIMELINE_WIDTH) + 'px; border-bottom:1px solid var(--border-color);">';

    // Left sticky date column
    var thDateStr = typeof formatDateTimeToThaiLong === 'function' ? formatDateTimeToThaiLong(dateGroup.dateStr) : dateGroup.dateStr;
    html += '<div style="position:sticky; left:0; z-index:10; min-width:' + ROW_HEADER_WIDTH + 'px; width:' + ROW_HEADER_WIDTH + 'px; padding:10px 8px; border-right:2px solid var(--border-color); background:#fff; box-shadow:2px 0 5px -2px rgba(0,0,0,0.05); display:flex; flex-direction:column; align-items:center; justify-content:center;">';
    html += '<div style="font-size:0.78rem; font-weight:700; color:var(--color-primary-hover); text-align:center; line-height:1.3;">' + thDateStr + '</div>';
    html += '<div style="font-size:0.6rem; color:var(--text-muted); margin-top:3px; background:rgba(0,0,0,0.04); padding:1px 5px; border-radius:4px;">' + cards.length + ' คลาส</div>';
    html += '</div>';

    // Timeline area
    html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; min-height:' + rowHeight + 'px;">';

    // Background grid lines
    for (var gh = HOUR_START; gh <= HOUR_END; gh++) {
      html += '<div style="position:absolute; left:' + ((gh - HOUR_START) * COL_WIDTH) + 'px; top:0; bottom:0; width:1px; background:' + (gh === HOUR_END ? 'transparent' : '#f0f0f0') + ';"></div>';
    }

    // Cards - same style as admin daily grid
    cards.forEach(function(cardObj) {
      var c = cardObj.c;
      var leftPx = (cardObj.sh - HOUR_START) * COL_WIDTH + 2;
      var widthPx = (cardObj.eh - cardObj.sh) * COL_WIDTH - 4;
      var topPx = cardObj.row * CARD_ROW_HEIGHT + 4;

      // Color logic
      var isTeacherConfirmed = c.teacherConfirmed > 0;
      var cardBg = 'background:#fff;';
      var cardBorder = 'border:1px solid var(--border-color);';
      if (isTeacherConfirmed) {
        cardBg = 'background:rgba(25,135,84,0.08);';
        cardBorder = 'border:1.5px solid rgba(25,135,84,0.4);';
      } else {
        var subjStr = String(c.subject || '');
        var isPrivate = subjStr.includes('เดี่ยว') || subjStr.includes('ย่อย');
        if (!isPrivate) {
          cardBg = 'background:rgba(56,189,248,0.08);';
          cardBorder = 'border:1.5px solid rgba(56,189,248,0.4);';
        }
      }

      // Branch color for left border
      var cleanRoom = (c.roomBranch || '').toLowerCase();
      var borderLeftColor = 'var(--border-color)';
      if (cleanRoom.includes('สาขา 1') || cleanRoom.includes('สาขา1')) {
        borderLeftColor = 'var(--color-success)';
      } else if (cleanRoom.includes('สาขา 2') || cleanRoom.includes('สาขา2')) {
        borderLeftColor = '#3b82f6';
      } else if (cleanRoom.includes('สาขา 3') || cleanRoom.includes('สาขา3')) {
        borderLeftColor = '#f59e0b';
      } else if (cleanRoom.includes('ออนไลน์') || cleanRoom.includes('online')) {
        borderLeftColor = '#8b5cf6';
      }
      if (isTeacherConfirmed) borderLeftColor = '#15803d';

      // Attendance
      var attArr = [];
      attArr.push('สด:' + (c.isPresentLive||0));
      attArr.push('ออน:' + (c.isPresentOnline||0));
      attArr.push('ลา:' + (c.isLeave||0));
      attArr.push('ชด:' + (c.isMakeup||0));
      attArr.push('ขาด:' + (c.isAbsent||0));

      var confirmedBadge = isTeacherConfirmed ? '<div style="font-weight:bold; color:#2e7d32; font-size:0.58rem;">✅ ยืนยันแล้ว</div>' : '';

      // Sub teacher check
      var isSub = c.teacherSub && c.teacherSub.toLowerCase().includes(teacher.toLowerCase().trim());
      var roleLabel = isSub ? '<span style="color:var(--color-danger); font-weight:bold;">[สอนแทน]</span>' : '';

      // Room/device text
      var displayRoomText = c.roomBranch || '-';
      var displayDeviceText = '';
      var deviceMatch = displayRoomText.match(/(?:ipad|zoom).*/i);
      if (deviceMatch) {
        displayDeviceText = deviceMatch[0];
        displayRoomText = displayRoomText.replace(deviceMatch[0], '').trim();
      }

      html += '<div style="position:absolute; left:' + leftPx + 'px; top:' + topPx + 'px; width:' + widthPx + 'px; height:' + (CARD_ROW_HEIGHT - 8) + 'px; ' + cardBg + ' ' + cardBorder + ' border-left:4px solid ' + borderLeftColor + '; border-radius:6px; padding:4px 6px; font-size:0.62rem; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,0.04); cursor:default;">';

      // Top: subject + time
      html += '<div>';
      html += '<div style="font-weight:700; font-size:0.68rem; color:var(--text-main); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + (c.subject||'').replace(/"/g,'&quot;') + '">' + formatSubjectName(c.subject) + ' ' + roleLabel + '</div>';
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
      if (c.note) html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-style:italic; color:#64748b;">📝 ' + c.note + '</div>';
      html += '</div>';

      // Bottom: confirm + edit
      html += '<div style="display:flex; justify-content:flex-end; align-items:center; border-top:1px dashed rgba(0,0,0,0.06); padding-top:2px; margin-top:2px; gap:2px;" onclick="event.stopPropagation();">';
      if (isTeacherConfirmed) {
        html += '<button type="button" onclick="toggleDailyGridConfirm(' + c.rowIndex + ',false)" style="font-size:0.58rem; padding:1px 5px; background:#15803d; color:white; font-weight:700; border-radius:10px; border:none; cursor:pointer;">✓ ยืนยัน</button>';
      } else {
        html += '<button type="button" onclick="toggleDailyGridConfirm(' + c.rowIndex + ',true)" style="font-size:0.58rem; padding:1px 5px; background:#e2e8f0; color:#475569; font-weight:700; border-radius:10px; border:none; cursor:pointer;">รอยืนยัน</button>';
      }
      html += '<button type="button" onclick="showEditClassLogModal(' + c.rowIndex + ')" style="padding:1px 3px; font-size:0.58rem; border:1px solid var(--border-color); background:#f8fafc; border-radius:3px; cursor:pointer; height:auto;" title="แก้ไข">✏️</button>';
      html += '</div>';

      html += '</div>'; // end card

    });

    html += '</div>'; // end timeline area
    html += '</div>'; // end row
  });

  html += '</div>'; // end scroll container

  container.innerHTML = html;
}
"""

new_content = re.sub(pattern, lambda m: new_function.lstrip(), content, flags=re.DOTALL)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done! Teacher schedule grid replaced with admin-style timeline.")
