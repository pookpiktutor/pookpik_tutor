import re
import sys

def main():
    with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace everything from `// Group filtered logs by date` to `      });\n\n    })\n    .withFailureHandler`
    # We will use regex to find the block
    start_str = "// Group filtered logs by date"
    end_str = "    })\n\n    .withFailureHandler(err => {"

    start_idx = content.find(start_str)
    end_idx = content.find(end_str)

    if start_idx == -1 or end_idx == -1:
        print("Could not find start or end bounds.")
        return

    replacement = """// Group filtered logs by date
      const groupedByDate = {};
      filtered.forEach(c => {
        if (!groupedByDate[c.date]) groupedByDate[c.date] = { dateStr: c.date, classes: [] };
        groupedByDate[c.date].classes.push(c);
      });

      const sortedDates = Object.values(groupedByDate).sort((a, b) => {
        const partsA = a.dateStr.split('/');
        const partsB = b.dateStr.split('/');
        const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));
        const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));
        return dateA - dateB;
      });

      function parseTimeToHours(t) {
        if (!t) return null;
        var s = String(t).replace(':', '.').replace(/\\s/g, '');
        var parts = s.split('.');
        var h = parseInt(parts[0], 10) || 0;
        var m = parseInt(parts[1], 10) || 0;
        return h + m / 60;
      }

      var HOUR_START = 8;
      var HOUR_END = 22;
      var TOTAL_HOURS = HOUR_END - HOUR_START;
      var COL_WIDTH = 190;
      var TIMELINE_WIDTH = TOTAL_HOURS * COL_WIDTH;
      var ROW_HEADER_WIDTH = 130;
      var CARD_ROW_HEIGHT = 160;

      var headerCols = '';
      for (var h = HOUR_START; h <= HOUR_END; h++) {
        var label = String(h).padStart(2, '0') + '.00';
        headerCols += '<div style="position:absolute; left:' + ((h - HOUR_START) * COL_WIDTH) + 'px; width:' + COL_WIDTH + 'px; text-align:center; font-weight:700; font-size:0.72rem; color:var(--text-main); padding:8px 0; box-sizing:border-box; border-right:1px dashed #e2e8f0; height: 100%; z-index: 0;">' + label + '</div>';
      }

      var html = '<div style="width:100%; height:75vh; overflow:auto; border:1px solid var(--border-color); border-radius:8px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.02); margin-top: 15px;">';

      html += '<div style="position:sticky; top:0; z-index:30; display:flex; min-width:' + (ROW_HEADER_WIDTH + TIMELINE_WIDTH) + 'px; background:#f8fafc; border-bottom:2px solid var(--border-color); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">';
      html += '<div style="position:sticky; left:0; z-index:40; min-width:' + ROW_HEADER_WIDTH + 'px; width:' + ROW_HEADER_WIDTH + 'px; padding:8px 10px; font-weight:700; font-size:0.75rem; color:var(--text-main); border-right:2px solid var(--border-color); background:#f8fafc; display:flex; align-items:center;">วันที่เรียน</div>';
      html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; height:36px;">' + headerCols + '</div>';
      html += '</div>';

      sortedDates.forEach(dateGroup => {
        var cards = [];
        dateGroup.classes.forEach(c => {
          var sh = parseTimeToHours(c.timeStart);
          var eh = parseTimeToHours(c.timeEnd);
          if (sh === null) return;
          if (eh === null || eh <= sh) eh = sh + 1;
          cards.push({ c: c, sh: sh, eh: eh });
        });
        cards.sort((a, b) => a.sh - b.sh || a.eh - b.eh);

        var rows = [];
        cards.forEach(card => {
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
        var rowHeight = maxRows * CARD_ROW_HEIGHT + 20;

        html += '<div style="display:flex; min-width:' + (ROW_HEADER_WIDTH + TIMELINE_WIDTH) + 'px; border-bottom:2px solid var(--border-color);">';

        var thDateStr = typeof formatDateTimeToThaiLong === 'function' ? formatDateTimeToThaiLong(dateGroup.dateStr) : dateGroup.dateStr;
        html += '<div style="position:sticky; left:0; z-index:20; min-width:' + ROW_HEADER_WIDTH + 'px; width:' + ROW_HEADER_WIDTH + 'px; padding:10px 8px; border-right:2px solid var(--border-color); background:#fff; box-shadow:2px 0 5px -2px rgba(0,0,0,0.05); display:flex; flex-direction:column; align-items:center; justify-content:center;">';
        html += '<div style="font-size:0.8rem; font-weight:700; color:var(--color-primary-hover); text-align:center; line-height:1.4;">' + thDateStr + '</div>';
        html += '<div style="font-size:0.65rem; color:var(--text-muted); margin-top:5px; background:rgba(0,0,0,0.04); padding:3px 8px; border-radius:12px; font-weight: 600;">' + cards.length + ' คลาส</div>';
        html += '</div>';

        html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; min-height:' + rowHeight + 'px; background: #fafafa;">';

        for (var gh = HOUR_START; gh <= HOUR_END; gh++) {
          html += '<div style="position:absolute; left:' + ((gh - HOUR_START) * COL_WIDTH) + 'px; top:0; bottom:0; width:1px; background:' + (gh === HOUR_END ? 'transparent' : '#e2e8f0') + '; z-index: 1;"></div>';
        }

        cards.forEach(cardObj => {
          var c = cardObj.c;
          var startPx = (cardObj.sh - HOUR_START) * COL_WIDTH;
          var widthPx = (cardObj.eh - cardObj.sh) * COL_WIDTH;
          var topPx = cardObj.row * CARD_ROW_HEIGHT + 10;
          
          if (startPx < 0) {
             widthPx += startPx;
             startPx = 0;
          }
          if (startPx + widthPx > TIMELINE_WIDTH) {
             widthPx = TIMELINE_WIDTH - startPx;
          }

          const isReg = (c.teacherRegular || '').toLowerCase().trim() === (nickname || '').toLowerCase().trim() || (c.teacherRegular || '').toLowerCase().trim() === (teacherName || '').toLowerCase().trim();
          const roleClass = isReg ? 'regular' : 'sub';
          const roleLabel = isReg ? 'ครูประจำ' : 'สอนแทน';

          const leaveCount = parseInt(c.leaveCount) || parseInt(c.isLeave) || 0;
          const totalKids = (parseInt(c.isPresentLive) || 0) + (parseInt(c.isPresentOnline) || 0) + (parseInt(c.isMakeup) || 0);

          const attendances = [];
          attendances.push(`สด: ${c.isPresentLive || 0}`);
          attendances.push(`ออน: ${c.isPresentOnline || 0}`);
          attendances.push(`ลา: ${c.isLeave || 0}`);
          attendances.push(`ขาด: ${c.isAbsent || 0}`);
          attendances.push(`ชด: ${c.isMakeup || 0}`);
          const attendanceSummaryHtml = attendances.length > 0 ? `<div style="font-size: 0.72rem; margin-top: 4px; color: var(--color-primary-hover); font-weight: 500;">👥 ${attendances.join(' ')}</div>` : '';

          let displayBranch = (c.roomBranch || c.roomBranchInfo || '').toString().trim();
          displayBranch = displayBranch.replace(/Zoom\\s*\\S*/i, '').replace(/\\s+/g, ' ').trim();

          let noteHtml = '';
          const noteText = (c.note || c.memo || '').toString().trim();
          if (noteText !== '' && noteText !== '-') {
            noteHtml = `<div class="teacher-card-note" style="font-size: 0.7rem; padding: 4px 6px; margin: 4px 0; background: rgba(0,0,0,0.03); border-radius: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">📝 ${noteText}</div>`;
          }

          const isTeacherLeave = noteText.includes('ครูลา');
          const subjectLower = (c.subject || '').toLowerCase();
          const isPrivateOrSubGroup = subjectLower.includes('เดี่ยว') || subjectLower.includes('ย่อย');
          const hasStudentLeave = leaveCount > 0 && isPrivateOrSubGroup;

          var bg = '#fff';
          var border = 'var(--border-color)';
          var timeBg = '#3b82f6';
          if (hasStudentLeave) {
             bg = 'rgb(254, 226, 226)';
             border = '#ef4444';
             timeBg = '#ef4444';
          } else if (c.teacherConfirmed) {
             bg = 'rgba(25, 135, 84, 0.08)';
             border = '#198754';
             timeBg = '#15803d';
          } else if (isTeacherLeave) {
             bg = 'rgb(254, 226, 226)';
             border = '#ef4444';
             timeBg = '#ef4444';
          }

          html += `<div style="position:absolute; left:${startPx}px; top:${topPx}px; width:${widthPx}px; height:${CARD_ROW_HEIGHT - 10}px; padding:6px 10px; box-sizing:border-box; background:${bg}; border:1.5px solid ${border}; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.08); overflow:hidden; z-index: 10; display:flex; flex-direction:column; justify-content:space-between; transition: transform 0.15s ease;">
            <div>
              <div style="padding-bottom: 4px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 4px;">
                <span style="font-size: 0.7rem; padding: 2px 8px; font-weight: 700; color: #fff; background: ${timeBg}; border-radius: 12px; white-space: nowrap;">⏰ ${cleanTimeStr(c.timeStart)} - ${cleanTimeStr(c.timeEnd)}</span>
                <span class="teacher-card-badge ${roleClass}" style="font-size: 0.65rem; padding: 1px 6px;">${roleLabel}</span>
              </div>
              <div style="font-size: 0.8rem; font-weight: 700; margin: 2px 0; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${c.subject}">${c.subject}</div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                 ${attendanceSummaryHtml}
                 <div style="font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><span style="font-weight:600; color:var(--text-muted);">📍 สาขา/ห้อง:</span> ${displayBranch}</div>
                 <div style="font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><span style="font-weight:600; color:var(--text-muted);">👨‍🏫 ครูประจำ:</span> ${c.teacherRegular || '-'}</div>
                 ${c.teacherSub ? `<div style="font-size: 0.7rem; color: var(--color-danger); font-weight:600;">🔄 ครูแทน: ${c.teacherSub}</div>` : ''}
              </div>
            </div>
            <div>
              ${noteHtml}
              <div style="border-top: 1px dashed rgba(0,0,0,0.15); margin-top: 4px; padding-top: 4px; display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                ${isReg ? `
                <label style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; cursor: pointer; font-weight: 700; color: var(--color-danger); margin:0;">
                  <input type="checkbox" class="teacher-kru-leave-chk" data-row="${c.rowIndex}" ${noteText.includes('ครูลา') ? 'checked' : ''} onchange="handleTeacherLeaveToggle(${c.rowIndex}, this)" style="width: 14px; height: 14px; cursor: pointer; accent-color: var(--color-danger); margin:0;">
                  ครูลา
                </label>
                ` : `<div></div>`}
                <label style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; cursor: pointer; font-weight: 700; color: var(--color-success); margin:0;">
                  <input type="checkbox" class="teacher-daily-confirm-chk" data-row="${c.rowIndex}" ${c.teacherConfirmed ? 'checked' : ''} onchange="toggleDailyScheduleConfirm(${c.rowIndex}, this)" style="width: 14px; height: 14px; cursor: pointer; accent-color: var(--color-success); margin:0;">
                  ยืนยัน
                </label>
              </div>
            </div>
          </div>`;
        });
        
        html += '</div></div>';
      });

      html += '</div>';
      container.innerHTML = html;
"""

    new_content = content[:start_idx] + replacement + content[end_idx:]

    with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("Success! JavaScript.js patched with new timeline logic for loadTeacherDailySchedule.")

if __name__ == '__main__':
    main()
