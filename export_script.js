/**
 * PookPik Tutor - Firestore Data Exporter
 * 
 * วิธีใช้งาน:
 * 1. คัดลอกโค้ดทั้งหมดนี้ไปวางในไฟล์ Code.js (ล่างสุด) ใน Google Apps Script เดิม
 * 2. สั่งรันฟังก์ชัน `exportDatabaseToJson()` เพื่อจัดเตรียม JSON dump
 * 3. ดาวน์โหลดไฟล์ pookpik_export_data.json จาก Google Drive ไปนำเข้าใน Firestore
 */

function exportDatabaseToJson() {
  const db = SpreadsheetApp.openById(SPREADSHEET_ID);
  const result = {
    users: [],
    teachers: [],
    rooms: [],
    students: [],
    classLogs: [],
    evaluations: [],
    privateStudents: {}
  };

  // 1. Export UsersDB
  const usersSheet = db.getSheetByName('UsersDB');
  if (usersSheet) {
    const data = usersSheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      const userObj = {};
      headers.forEach((h, idx) => {
        userObj[h] = row[idx] !== undefined ? row[idx] : '';
      });
      result.users.push(userObj);
    }
  }

  // 2. Export TeachersDB
  const teachersSheet = db.getSheetByName('TeachersDB');
  if (teachersSheet) {
    const data = teachersSheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      const teacherObj = {};
      headers.forEach((h, idx) => {
        teacherObj[h] = row[idx] !== undefined ? row[idx] : '';
      });
      result.teachers.push(teacherObj);
    }
  }

  // 3. Export RoomsDB
  const roomsSheet = db.getSheetByName('RoomsDB');
  if (roomsSheet) {
    const data = roomsSheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[1]) continue; // RoomName
      const roomObj = {};
      headers.forEach((h, idx) => {
        roomObj[h] = row[idx] !== undefined ? row[idx] : '';
      });
      result.rooms.push(roomObj);
    }
  }

  // 4. Export StatusDB (Students list)
  const statusSheet = db.getSheetByName('StatusDB');
  if (statusSheet) {
    const data = statusSheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[1]) continue; // Student Name
      const studentObj = {};
      headers.forEach((h, idx) => {
        studentObj[h] = row[idx] !== undefined ? row[idx] : '';
      });
      result.students.push(studentObj);
    }
  }

  // 5. Export Data Learn (Class Logs)
  const learnSheet = db.getSheetByName('Data Learn');
  if (learnSheet) {
    const data = learnSheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[13]) continue; // Subject or Date missing
      const logObj = {};
      headers.forEach((h, idx) => {
        // Date parsing support
        if (h === 'วันที่' && row[idx] instanceof Date) {
          logObj[h] = Utilities.formatDate(row[idx], Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else {
          logObj[h] = row[idx] !== undefined ? row[idx] : '';
        }
      });
      result.classLogs.push(logObj);
    }
  }

  // 6. Export EvaluationsDB
  const evSheet = db.getSheetByName('EvaluationsDB');
  if (evSheet) {
    const data = evSheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[2]) continue; // StudentName
      const evObj = {};
      headers.forEach((h, idx) => {
        if (h === 'Date' && row[idx] instanceof Date) {
          evObj[h] = Utilities.formatDate(row[idx], Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else {
          evObj[h] = row[idx] !== undefined ? row[idx] : '';
        }
      });
      result.evaluations.push(evObj);
    }
  }

  // 7. Export Private sheets group
  const sheets = db.getSheets();
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name.indexOf('เดี่ยว ') === 0 || name.indexOf('ย่อย ') === 0) {
      const lastRow = sheet.getLastRow();
      if (lastRow >= 12) {
        const data = sheet.getRange(12, 1, lastRow - 11, 21).getValues();
        result.privateStudents[name] = data.map(row => {
          return {
            studentName: row[1] || '',
            branch: row[8] || '',
            branchPay: row[9] || '',
            paid: row[14] || 0
          };
        });
      }
    }
  });

  // Write file to Drive
  const file = DriveApp.getFileById(db.getId());
  const parent = file.getParents().next();
  const oldFiles = parent.getFilesByName('pookpik_export_data.json');
  while (oldFiles.hasNext()) {
    oldFiles.next().setTrashed(true);
  }
  const newFile = parent.createFile('pookpik_export_data.json', JSON.stringify(result, null, 2), MimeType.PLAIN_TEXT);
  Logger.log('✓ Exported database successfully to Drive file ID: ' + newFile.getId());
  return 'Export successful! File ID: ' + newFile.getId();
}
