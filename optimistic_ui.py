import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix saveClassLog
pattern1 = r'''          if \(activePanel === 'daily_grid'\) loadDailyGrid\(\);\s*else loadRevenueLogs\(\);\s*checkLowBalanceStudents\(\);'''
replacement1 = """          window._forceDailyGridRefresh = true;
          window._forceTeacherGridRefresh = true;
          if (activePanel === 'daily_grid') loadDailyGrid(true);
          else loadRevenueLogs(true);
          loadTeacherSchedule(true); // background sync
          checkLowBalanceStudents();"""
content = re.sub(pattern1, replacement1, content)

# Fix submitBatchClassLogs
pattern2 = r'''          const activePanel = document\.querySelector\('\.nav-item\.active'\)\?\.getAttribute\('data-panel'\);\s*if \(activePanel === 'daily_grid'\) loadDailyGrid\(\);\s*else loadRevenueLogs\(\);\s*checkLowBalanceStudents\(\);'''
replacement2 = """          const activePanel = document.querySelector('.nav-item.active')?.getAttribute('data-panel');
          window._forceDailyGridRefresh = true;
          window._forceTeacherGridRefresh = true;
          if (activePanel === 'daily_grid') loadDailyGrid(true);
          else loadRevenueLogs(true);
          loadTeacherSchedule(true);
          checkLowBalanceStudents();"""
content = re.sub(pattern2, replacement2, content)

# Fix deleteClassLog
pattern3 = r'''          if \(activePanel === 'daily_grid'\) loadDailyGrid\(\);\s*else if \(activePanel === 'teacher_schedule'\) loadTeacherSchedule\(true\);\s*else loadRevenueLogs\(\);\s*// Force update teacher schedule to keep it synced\s*loadTeacherSchedule\(true\);\s*checkLowBalanceStudents\(\); // update warning banner'''
replacement3 = """          // Optimistic UI update
          state.classLogs = state.classLogs.filter(c => c.rowIndex !== rowIndex);
          if (activePanel === 'daily_grid') renderDailyGrid();
          else if (activePanel === 'teacher_schedule') renderTeacherScheduleGrid(document.getElementById('teacher_schedule_select').value);
          
          window._forceDailyGridRefresh = true;
          window._forceTeacherGridRefresh = true;
          if (activePanel === 'daily_grid') loadDailyGrid(true);
          else if (activePanel === 'teacher_schedule') loadTeacherSchedule(true);
          else loadRevenueLogs(true);
          
          checkLowBalanceStudents();"""
content = re.sub(pattern3, replacement3, content)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Optimistic UI implemented.")
