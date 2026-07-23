function getCourseList() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('courseList2');
  if (cached) return JSON.parse(cached);

  const db = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetNames = [
    'เดี่ยว อนุบาล','เดี่ยว ป.1','เดี่ยว ป.2','เดี่ยว ป.3','เดี่ยว ป.4','เดี่ยว ป.5','เดี่ยว ป.6','เดี่ยว ม.1','เดี่ยว ม.2','เดี่ยว ม.3','เดี่ยว ม.4','เดี่ยว ม.5','เดี่ยว ม.6',
    'ย่อย 2-3','ย่อย 4-5','ย่อย 6-10'
  ];
  const branches = [1,2,3];
  const levels = ['อนุบาล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];
  branches.forEach(b => levels.forEach(l => sheetNames.push(l + '/' + b)));

  let courseMap = new Map();

  sheetNames.forEach(sName => {
    const sheet = db.getSheetByName(sName);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const data = sheet.getRange(2, 11, lastRow - 1, 1).getValues();
        data.forEach(row => {
          let courseName = row[0] ? row[0].toString().trim() : '';
          if (courseName !== '') {
            const match = courseName.match(/^(.*?)\s*(\d+)$/);
            if (match) {
              const base = match[1].trim();
              const num = parseInt(match[2], 10);
              if (!courseMap.has(base) || courseMap.get(base).num < num) {
                courseMap.set(base, { num: num, full: courseName });
              }
            } else {
              if (!courseMap.has(courseName)) {
                courseMap.set(courseName, { num: -1, full: courseName });
              }
            }
          }
        });
      }
    }
  });

  let courseArr = Array.from(courseMap.values()).map(item => item.full).sort();
  cache.put('courseList2', JSON.stringify(courseArr), 21600);
  return courseArr;
}

function getTeacherListForDropdown() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('teacherDropdownList2');
  if (cached) return JSON.parse(cached);

  const db = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = db.getSheetByName('TeachersDB');
  let teacherArr = [];
  if (sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      let teachers = new Set();
      data.forEach(row => {
        if (row[0] && row[0].toString().trim() !== '') {
          teachers.add(row[0].toString().trim());
        }
      });
      teacherArr = Array.from(teachers).sort();
    }
  }
  cache.put('teacherDropdownList2', JSON.stringify(teacherArr), 21600);
  return teacherArr;
}
