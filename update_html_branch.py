import sys

content = open('JavaScript.html', encoding='utf-8').read()

target1 = '''  if (!state.classLogs || state.classLogs.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 20px;">ไม่มีข้อมูลคลาสเรียนในวันนี้</div>`;
    return;
  }'''

replace1 = '''  const branchFilter = (state.activeBranchFilter || 'สาขา1').replace(/\s+/g, '');
  const filteredLogs = (state.classLogs || []).filter(log => {
    const logBranchClean = (log.roomBranch || '').replace(/\s+/g, '');
    return logBranchClean === branchFilter;
  });
  
  if (filteredLogs.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 20px;">ไม่มีข้อมูลคลาสเรียนในสาขานี้สำหรับวันนี้</div>`;
    return;
  }'''

if target1 not in content:
    print('target1 not found')
    sys.exit(1)

content = content.replace(target1, replace1)

# Now replace the forEach calls in renderDailyAttendanceSummary
func_start = content.find('function renderDailyAttendanceSummary() {')
func_end = content.find('function renderDailyGrid() {', func_start)

func_body = content[func_start:func_end]
new_func_body = func_body.replace('(state.classLogs || []).forEach(log => {', 'filteredLogs.forEach(log => {')

content = content[:func_start] + new_func_body + content[func_end:]

open('JavaScript.html', 'w', encoding='utf-8').write(content)
print('Done!')
