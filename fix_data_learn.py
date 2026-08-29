# -*- coding: utf-8 -*-
"""
Comprehensive fix for Data Learn column shift after isOrange removal.

NEW column layout (0-indexed):
  A(0): subject
  B(1): teacherRegular
  C(2): teacherSub
  D(3): timeStart
  E(4): timeEnd
  F(5): note
  G(6): isPresentLive
  H(7): isPresentOnline
  I(8): isLeave
  J(9): isAbsent
  K(10): isMakeup
  L(11): hours          <-- was 12
  M(12): date           <-- was 13
  N(13): roomBranch     <-- was 14
  O(14): teacherConfirmed <-- was 15
  P(15): numKids        <-- was 16

isOrange column (old index 11) is REMOVED.
"""
import re

with open('Code.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
changes = 0

# ============================================================
# Fix 1: getTodayTeacherSchedules (around line 4600)
#   data[i][13] -> data[i][12] (date)
#   data[i][14] -> data[i][13] (roomBranch)
#   isOrange: parseInt(data[i][11]) -> remove (11 is now hours)
#   hours: data[i][12] -> data[i][11]
# ============================================================
for i in range(4580, 4650):
    if 'cleanSheetDate(data[i][13])' in lines[i]:
        lines[i] = lines[i].replace('data[i][13]', 'data[i][12]')
        changes += 1
    if 'data[i][14]' in lines[i] and 'roomBranch' in lines[i]:
        lines[i] = lines[i].replace('data[i][14]', 'data[i][13]')
        changes += 1
    if 'isOrange: parseInt(data[i][11])' in lines[i]:
        lines[i] = '        // isOrange removed'
        changes += 1
    if "hours: data[i][12]" in lines[i]:
        lines[i] = lines[i].replace('data[i][12]', 'data[i][11]')
        changes += 1

# ============================================================
# Fix 2: saveBatchClassLogs / updateClassLog write arrays (around 13230-13320)
#   Remove isOrange line from newVals array
#   Fix setRange column count 15 -> 14
#   Fix column 17 -> 16 for confirm
# ============================================================
for i in range(13220, 13320):
    if 'log.isOrange ? parseInt(log.isOrange, 10) || 0 : 0,' in lines[i]:
        lines[i] = '        // isOrange removed from write array'
        changes += 1
    if 'sheet.getRange(rowIndex, 1, 1, 15).setValues(newVals)' in lines[i]:
        lines[i] = lines[i].replace('1, 15)', '1, 14)')
        changes += 1
    if "sheet.getRange(rowIndex, 17)" in lines[i]:
        lines[i] = lines[i].replace('17)', '16)')
        changes += 1
    if "sheet.getRange(lastRow + 1, 1, rowsData.length, 15)" in lines[i]:
        lines[i] = lines[i].replace(', 15)', ', 14)')
        changes += 1

# ============================================================
# Fix 3: extraCount: c.isOrange -> 0 (around 13514)
# ============================================================
for i in range(13500, 13520):
    if 'extraCount: c.isOrange || 0' in lines[i]:
        lines[i] = lines[i].replace('c.isOrange || 0', '0')
        changes += 1

# ============================================================
# Fix 4: Remaining row[xx] in getTodayTeacherSchedules date/room (around 4420)
# ============================================================
for i in range(4400, 4470):
    if 'cleanSheetDate(row[13])' in lines[i]:
        lines[i] = lines[i].replace('row[13]', 'row[12]')
        changes += 1
    if "row[14]" in lines[i] and 'roomBranch' in lines[i]:
        lines[i] = lines[i].replace('row[14]', 'row[13]')
        changes += 1
    if "row[13]" in lines[i] and 'roomBranch' in lines[i]:
        lines[i] = lines[i].replace('row[13]', 'row[13]')  # already correct after fix

# ============================================================
# Fix 5: updateClassAbsenceAndAttendance cache invalidation (around 18295 old, now shifted)
# ============================================================
for i in range(11900, 12000):
    if 'cleanSheetDate(rowVals[13])' in lines[i]:
        lines[i] = lines[i].replace('rowVals[13]', 'rowVals[12]')
        changes += 1

# ============================================================
# Fix 6: addClassLog write array - ensure no isOrange, correct column count
# ============================================================
for i in range(11450, 11600):
    if 'log.isOrange' in lines[i]:
        lines[i] = '        // isOrange removed from addClassLog'
        changes += 1
    if 'sheet.getRange(lastRow + 1, 1, 1, 16).setValues' in lines[i]:
        lines[i] = lines[i].replace('1, 16)', '1, 14)')
        changes += 1

# ============================================================
# Fix 7: getClassLogByRow - ensure correct indices
# ============================================================
for i in range(11900, 12100):
    if 'hours: rowVals[12]' in lines[i]:
        lines[i] = lines[i].replace('rowVals[12]', 'rowVals[11]')
        changes += 1
    if 'date: cleanSheetDate(rowVals[13])' in lines[i]:
        lines[i] = lines[i].replace('rowVals[13]', 'rowVals[12]')
        changes += 1
    if "roomBranch: rowVals[14]" in lines[i]:
        lines[i] = lines[i].replace('rowVals[14]', 'rowVals[13]')
        changes += 1
    if 'teacherConfirmed: rowVals[15]' in lines[i] or "rowVals[15]" in lines[i] and 'teacherConfirmed' in lines[i]:
        lines[i] = lines[i].replace('rowVals[15]', 'rowVals[14]')
        changes += 1
    if 'numKids: rowVals[16]' in lines[i] or "rowVals[16]" in lines[i] and 'numKids' in lines[i]:
        lines[i] = lines[i].replace('rowVals[16]', 'rowVals[15]')
        changes += 1
    if 'isOrange' in lines[i] and 'removed' not in lines[i]:
        lines[i] = '        // isOrange removed'
        changes += 1

# ============================================================
# Fix 8: clearClassLogsCache - update cache key
# ============================================================
for i in range(len(lines)):
    if "clearCacheObject('class_logs_date_'" in lines[i]:
        lines[i] = lines[i].replace("'class_logs_date_'", "'class_logs_date_v3_'")
        changes += 1
    if "clearCacheObject('class_logs_date_all')" in lines[i]:
        lines[i] = lines[i].replace("'class_logs_date_all'", "'class_logs_date_v3_all'")
        changes += 1

# ============================================================
# Fix 9: Check ALL remaining old-index patterns in Data Learn context
# ============================================================
# Scan for any remaining data[i][13] that should be data[i][12] in Data Learn context
for i in range(4100, 4200):
    if 'data[i][13]' in lines[i] and ('cleanSheetDate' in lines[i] or 'date' in lines[i].lower()):
        lines[i] = lines[i].replace('data[i][13]', 'data[i][12]')
        changes += 1
    if 'data[i][14]' in lines[i] and 'roomBranch' in lines[i]:
        lines[i] = lines[i].replace('data[i][14]', 'data[i][13]')
        changes += 1

# ============================================================
# Fix 10: Scan for any remaining row[14] in getWeeklyTeacherSchedule
# ============================================================
for i in range(4400, 4470):
    if 'row[14]' in lines[i]:
        lines[i] = lines[i].replace('row[14]', 'row[13]')
        changes += 1

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'Applied {changes} fixes to Code.js')
