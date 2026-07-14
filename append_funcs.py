import os

code_file = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js'
with open(code_file, 'r', encoding='utf-8') as f:
    code = f.read()

missing_funcs = """
function clearClassLogsCache(dateStr) {
  if (dateStr) {
    clearCacheObject('class_logs_date_' + dateStr);
  }
  clearCacheObject('class_logs_date_all');
}

function invalidateTeacherSalaryCache(namesArray) {
  if (!namesArray) return;
  const thisYear = new Date().getFullYear();
  namesArray.forEach(name => {
    if (!name) return;
    const cleanTeacher = name.toString().trim().toLowerCase();
    const withoutKru = cleanTeacher.replace(/^ครู/, '').trim();
    const variations = [cleanTeacher, withoutKru, 'ครู' + withoutKru];
    variations.forEach(t => {
      for (let y = thisYear - 2; y <= thisYear + 2; y++) {
        clearCacheObject('yearly_pay_' + t + '_' + y);
      }
    });
  });
}
"""

if 'function clearClassLogsCache' not in code:
    with open(code_file, 'a', encoding='utf-8') as f:
        f.write('\n' + missing_funcs)
    print('Appended missing functions')
else:
    print('Already exists')
