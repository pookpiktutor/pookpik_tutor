// Version 53.9.3: ปรับรูปแบบหน้าล็อกอินใหม่ พื้นหลังสีเขียวเข้มพาสเทล ชื่อโรงเรียนตัวใหญ่สีสันสดใส
const SPREADSHEET_ID = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';

function doGet(e) {
  if (e && e.parameter && e.parameter.init === '1') {
    try {
      initAllDatabases();
      return HtmlService.createHtmlOutput('<h1>✓ จัดเตรียมฐานข้อมูลสำเร็จเรียบร้อยแล้ว! (Database Initialized Successfully)</h1>');
    } catch (err) {
      return HtmlService.createHtmlOutput('<h1>❌ เกิดข้อผิดพลาด: ' + err.toString() + '</h1>');
    }
  }
  if (e && e.parameter && e.parameter.debug_sheets === '1') {
    try {
      const db = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheets = db.getSheets().map(s => s.getName());
      const file = DriveApp.getFileById(db.getId());
      const parent = file.getParents().next();
      
      const oldFiles = parent.getFilesByName('debug_sheets.json');
      while (oldFiles.hasNext()) {
        oldFiles.next().setTrashed(true);
      }
      parent.createFile('debug_sheets.json', JSON.stringify(sheets), MimeType.PLAIN_TEXT);
      
      let headersData = {};
      try {
        headersData = debugReadSheetHeaders();
      } catch (e2) {}
      
      return HtmlService.createHtmlOutput('<h1>✓ debug_sheets.json written: ' + sheets.join(', ') + '<br/>Headers: ' + JSON.stringify(headersData) + '</h1>');
    } catch (err) {
      return HtmlService.createHtmlOutput('<h1>❌ Error: ' + err.toString() + '</h1>');
    }
  }
  if (e && e.parameter && e.parameter.debug === '1') {
    return HtmlService.createHtmlOutput(getDebugDiagnosticHtml());
  }
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('ระบบดูแลโรงเรียนกวดวิชาบ้านครูปุ๊กปิ๊ก')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDebugDiagnosticHtml() {
  let html = '<h1>ระบบตรวจสอบความถูกต้องของฐานข้อมูล (Diagnostic Page)</h1>';
  try {
    const db = getDb();
    html += `<p><b>Spreadsheet Title:</b> ${db.getName()}</p>`;
    html += `<p><b>Spreadsheet ID:</b> ${db.getId()}</p>`;
    
    const sheets = db.getSheets().map(s => s.getName());
    html += `<p><b>ตารางทั้งหมดในสเปรดชีต:</b> ${sheets.join(', ')}</p>`;
    
    // Check UsersDB
    const usersSheet = db.getSheetByName('UsersDB');
    if (!usersSheet) {
      html += '<p style="color:red;"><b>❌ ไม่พบตาราง UsersDB</b></p>';
    } else {
      const data = usersSheet.getDataRange().getValues();
      html += '<h3>รายชื่อผู้ใช้ที่อยู่ในระบบ (UsersDB):</h3>';
      html += '<table border="1" cellpadding="5" style="border-collapse:collapse; width: 100%; max-width: 600px;">';
      html += '<tr><th>แถวที่</th><th>Username</th><th>Password Length</th><th>Role</th></tr>';
      for (let i = 0; i < data.length; i++) {
        const username = data[i][0];
        const password = data[i][1];
        const role = data[i][2];
        if (i === 0) {
          html += `<tr style="background:#eee;"><td>หัวตาราง</td><td>${username}</td><td>${password}</td><td>${role}</td></tr>`;
        } else {
          const passLen = password ? password.toString().length : 0;
          html += `<tr><td>${i + 1}</td><td>"${username}"</td><td>${passLen} ตัวอักษร</td><td>"${role}"</td></tr>`;
        }
      }
      html += '</table>';
    }
    
    // Check RoomsDB
    const roomsSheet = db.getSheetByName('RoomsDB');
    if (!roomsSheet) {
      html += '<p style="color:red;"><b>❌ ไม่พบตาราง RoomsDB</b></p>';
    } else {
      html += `<p style="color:green;"><b>✓ พบตาราง RoomsDB</b> (${roomsSheet.getLastRow()} แถว)</p>`;
    }
    
    // Check TeachersDB
    const teachersSheet = db.getSheetByName('TeachersDB');
    if (!teachersSheet) {
      html += '<p style="color:red;"><b>❌ ไม่พบตาราง TeachersDB</b></p>';
    } else {
      html += `<p style="color:green;"><b>✓ พบตาราง TeachersDB</b> (${teachersSheet.getLastRow()} แถว)</p>`;
    }
    
    // Force initialize button/link
    html += '<h3>การจัดการ:</h3>';
    html += '<button onclick="google.script.run.withSuccessHandler(function(){alert(\'จัดเตรียมฐานข้อมูลสำเร็จ!\');location.reload();}).initAllDatabases()">🔄 สั่งรัน initAllDatabases() เพื่อสร้างและรีเซ็ตตารางเริ่มต้น</button>';
    
  } catch (e) {
    html += `<p style="color:red;"><b>เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:</b> ${e.toString()}</p>`;
  }
  
  // Include basic styling
  html = `<html><head><style>body { font-family: sans-serif; padding: 20px; line-height: 1.6; } table { margin-bottom: 20px; } button { padding: 12px 20px; cursor: pointer; background: #ff7da0; color: white; border: none; border-radius: 8px; font-weight: bold; }</style></head><body>${html}</body></html>`;
  return html;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏫 ระบบครูปุ๊กปิ๊ก')
      .addItem('🔄 สร้าง/รีเซ็ตฐานข้อมูลตารางเรียน', 'initAllDatabases')
      .addItem('📥 คัดลอกข้อมูลทุกแผ่นงานไปยังสเปรดชีตใหม่', 'copyAllSheetsFromOldDb')
      .addItem('🌐 เปิดระบบเว็บไซต์ดูแลโรงเรียน', 'openWebAppUrl')
      .addToUi();
}

function openWebAppUrl() {
  const url = ScriptApp.getService().getUrl();
  if (!url) {
    SpreadsheetApp.getUi().alert('กรุณาทำการ Deploy Web App ก่อนเรียกใช้งานเมนูนี้');
    return;
  }
  const html = HtmlService.createHtmlOutput(`
    <script>
      window.open("${url}", "_blank");
      google.script.host.close();
    </script>
  `).setWidth(300).setHeight(100);
  SpreadsheetApp.getUi().showModalDialog(html, 'กำลังเปิดหน้าเว็บไซต์...');
}

function copyAllSheetsFromOldDb() {
  const oldId = '1_GFW3sorojPARW70CvlSXmzDXN6XdeFfzInqqz4r2_4';
  const newId = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';
  
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'ยืนยันการคัดลอกข้อมูล',
    'คุณต้องการคัดลอกแผ่นงานทั้งหมดจากสเปรดชีตเก่าไปสเปรดชีตใหม่หรือไม่? (หากมีแผ่นงานชื่อซ้ำในไฟล์ใหม่จะถูกเขียนทับ)',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  try {
    const oldDb = SpreadsheetApp.openById(oldId);
    const newDb = SpreadsheetApp.openById(newId);
    
    const oldSheets = oldDb.getSheets();
    
    let copiedCount = 0;
    oldSheets.forEach(sheet => {
      const sheetName = sheet.getName();
      
      let newSheet = newDb.getSheetByName(sheetName);
      if (newSheet) {
        newDb.deleteSheet(newSheet);
      }
      
      const copied = sheet.copyTo(newDb);
      copied.setName(sheetName);
      copiedCount++;
    });
    
    // Initialize standard DBs on the new sheet
    initAllDatabases();
    
    ui.alert('เสร็จสิ้น', 'คัดลอกแผ่นงานสำเร็จจำนวน ' + copiedCount + ' แผ่นงานไปยังสเปรดชีตใหม่เรียบร้อยแล้ว!', ui.ButtonSet.OK);
  } catch (err) {
    ui.alert('ข้อผิดพลาด', 'ไม่สามารถคัดลอกข้อมูลได้: ' + err.toString(), ui.ButtonSet.OK);
  }
}

// Helper: Open Spreadsheet
function getDb() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// Helper: Convert sheet to array of values
function getSheetRows(sheetName) {
  const sheet = getDb().getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow === 0 || lastCol === 0) return [];
  return sheet.getRange(1, 1, lastRow, lastCol).getValues();
}

function cleanSheetDate(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Bangkok', 'dd/MM/yyyy');
  }
  return val ? val.toString().trim() : '';
}

function cleanSheetTimestamp(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
  }
  const str = val ? val.toString().trim() : '';
  const parsed = Date.parse(str);
  if (!isNaN(parsed) && str.length > 15) {
    return Utilities.formatDate(new Date(parsed), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
  }
  return str;
}

// ----------------------------------------------------
// Database Initialization & Settings
// ----------------------------------------------------
function initRoomsDatabase() {
  const db = getDb();
  let sheet = db.getSheetByName('RoomsDB');
  
  if (!sheet) {
    sheet = db.insertSheet('RoomsDB');
  }
  
  if (sheet.getLastRow() < 2) {
    sheet.clear();
    sheet.appendRow(['Branch', 'RoomName', 'IPAD', 'Zoom']);
    
    // Add default rooms
    const defaultRooms = [];
    
    // Branch 1
    defaultRooms.push(['สาขา1', 'ออนไลน์ สาขา1', 'IPAD 001', 'Zoom 001']);
    for (let i = 1; i <= 10; i++) {
      if (i === 5) {
        for (let j = 1; j <= 6; j++) {
          defaultRooms.push(['สาขา1', `ห้อง 05/${j}`, `IPAD 005`, `Zoom 005`]);
        }
      } else {
        const pad = i < 10 ? '0' + i : i;
        defaultRooms.push(['สาขา1', `ห้อง ${pad}`, `IPAD 0${pad}`, `Zoom 0${pad}`]);
      }
    }
    
    // Branch 2
    defaultRooms.push(['สาขา2', 'ออนไลน์ สาขา2', 'IPAD 020', 'Zoom 020']);
    defaultRooms.push(['สาขา2', 'ห้อง เอนกประสงค์', 'IPAD 021', 'Zoom 021']);
    const b2Rooms = [1,2,3,4,5,6,7,8,9,21,22,23,24,25,26,31,32,33,34,35,36,41,42,43,44,45,52,53];
    b2Rooms.forEach(r => {
      const pad = r < 10 ? '0' + r : r;
      defaultRooms.push(['สาขา2', `ห้อง ${pad}`, `IPAD 0${pad}`, `Zoom 0${pad}`]);
    });
    
    // Branch 3
    defaultRooms.push(['สาขา3', 'ออนไลน์ สาขา3', 'IPAD 030', 'Zoom 030']);
    const b3Rooms = ['01', '02', '03', '04', '21', '30', '31', '32/1', '32/2', '32/3', '32/4', '33', '34', '40', '41', '42', '43', '44', '50'];
    b3Rooms.forEach(r => {
      defaultRooms.push(['สาขา3', `ห้อง ${r}`, `IPAD 0${r.replace('/', '')}`, `Zoom 0${r.replace('/', '')}`]);
    });
    
    sheet.getRange(2, 1, defaultRooms.length, 4).setValues(defaultRooms);
  }
}

function initAllDatabases() {
  const db = getDb();
  
  // 1. RoomsDB
  initRoomsDatabase();
  
  // 2. UsersDB
  let usersSheet = db.getSheetByName('UsersDB');
  if (!usersSheet) {
    usersSheet = db.insertSheet('UsersDB');
  }
  if (usersSheet.getLastRow() < 2) {
    usersSheet.clear();
    usersSheet.appendRow(['Username', 'Password', 'Role']);
    usersSheet.appendRow(['admin', '1234', 'Administrator']);
    usersSheet.appendRow(['staff', '1234', 'Staff']);
  }
  
  // 3. TeachersDB
  let teachersSheet = db.getSheetByName('TeachersDB');
  if (!teachersSheet) {
    teachersSheet = db.insertSheet('TeachersDB');
  }
  if (teachersSheet.getLastRow() < 2) {
    teachersSheet.clear();
    teachersSheet.appendRow(['Nickname', 'FullName', 'School', 'Phone', 'Subjects', 'Bank', 'AccountNumber']);
    
    // Seed default teachers from General list
    try {
      const rawData = getSheetRows('DATA General');
      const teachers = [];
      rawData.forEach((row, idx) => {
        if (idx === 0) return;
        if (row[0]) teachers.push(row[0].toString().trim());
      });
      const uniqueTeachers = [...new Set(teachers)].sort();
      uniqueTeachers.forEach(t => {
        teachersSheet.appendRow([t, '', '', '', '', '', '']);
      });
    } catch (e) {
      // ignore seed error
    }
  }
  
  // 4. ActivityLog
  let logSheet = db.getSheetByName('ActivityLog');
  if (!logSheet) {
    logSheet = db.insertSheet('ActivityLog');
  }
  if (logSheet.getLastRow() < 1) {
    logSheet.appendRow(['Timestamp', 'User', 'Action', 'Details']);
  }
  
  // 4b. StatusDB (Central Student Registration)
  let statusSheet = db.getSheetByName('StatusDB');
  if (!statusSheet) {
    statusSheet = db.insertSheet('StatusDB');
  }
  if (statusSheet.getLastRow() < 1) {
    statusSheet.appendRow([
      'ID', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'โรงเรียน', 'เบอร์ติดต่อ', 
      'สาขาเรียน', 'สาขาที่เก็บเงิน', 'หมายเหตุเวลาจ่ายเงิน', 'หมายเหตุเพิ่มเติม', 
      'ยอดจ่ายมา', 'ค่าเรียน', 'คงเหลือ', 'วันที่ชำระเงิน', 'ช่องทางชำระเงิน', 
      'ผู้รับเงิน', 'รอบการเรียน', 'ระดับชั้น', 'ห้องเรียนย่อย', 'ชื่อไลน์โปรไฟล์', 
      'ID LINE', 'ค่าเรียนยกมา', 'ชั่วโมงเรียน', 'ชั่วโมงคงเหลือ', 'ประเภทคลาส'
    ]);
  }
  
  // 4c. DATA General
  let generalSheet = db.getSheetByName('DATA General');
  if (!generalSheet) {
    generalSheet = db.insertSheet('DATA General');
  }
  if (generalSheet.getLastRow() < 1) {
    generalSheet.appendRow(['รายชื่อครู', 'รายชื่อโรงเรียน']);
  }
  
  // 4d. Data Learn
  let learnSheet = db.getSheetByName('Data Learn');
  if (!learnSheet) {
    learnSheet = db.insertSheet('Data Learn');
  }
  if (learnSheet.getLastRow() < 1) {
    learnSheet.appendRow([
      'วิชา', 'ครูประจำ', 'ครูแทน', 'เวลาเริ่ม', 'เวลาจบ', 
      'หมายเหตุ', 'สด', 'ออน', 'ลา', 'ขาด', 
      'ชด', 'แสด', 'ชม.', 'วันที่', 'ห้อง/สาขา/iPad'
    ]);
  } else {
    // Auto-migrate Data Learn: insert "แสด" between "ชด" and "ชม."
    try {
      const lastCol = learnSheet.getLastColumn();
      if (lastCol >= 11) {
        const headers = learnSheet.getRange(1, 1, 1, lastCol).getValues()[0];
        const headersStr = headers.map(h => h ? h.toString().trim() : '');
        const hasOrange = headersStr.includes('แสด');
        if (!hasOrange) {
          const idxChod = headersStr.indexOf('ชด');
          if (idxChod !== -1) {
            const colIndex = idxChod + 1; // 1-indexed column number for 'ชด'
            learnSheet.insertColumnAfter(colIndex);
            learnSheet.getRange(1, colIndex + 1).setValue('แสด');
            const lastRow = learnSheet.getLastRow();
            if (lastRow > 1) {
              const zeros = Array(lastRow - 1).fill([0]);
              learnSheet.getRange(2, colIndex + 1, lastRow - 1, 1).setValues(zeros);
            }
          }
        }
      }
    } catch (e) {
      Logger.log('Error migrating Data Learn: ' + e.message);
    }
  }
  
  // 5. Initialize All Grade/Private/Subgroup sheets
  initAllGradeSheets();
}

// ----------------------------------------------------
// Security & Authentication
// ----------------------------------------------------
function verifyLogin(username, password) {
  initAllDatabases();
  const db = getDb();
  const sheet = db.getSheetByName('UsersDB');
  if (!sheet) {
    return { success: false, error: 'ไม่พบตารางฐานข้อมูลผู้ใช้งาน UsersDB' };
  }
  const rows = sheet.getDataRange().getValues();
  const cleanUsername = username ? username.toString().trim().toLowerCase() : '';
  const cleanPassword = password ? password.toString().trim() : '';
  
  if (!cleanUsername || !cleanPassword) {
    return { success: false, error: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน' };
  }
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] && rows[i][1]) {
      const dbUsername = rows[i][0].toString().trim().toLowerCase();
      const dbPassword = rows[i][1].toString().trim();
      
      if (dbUsername === cleanUsername && dbPassword === cleanPassword) {
        const role = rows[i][2] ? rows[i][2].toString().trim() : 'Staff';
        logActivity(rows[i][0].toString().trim(), 'เข้าสู่ระบบ', 'เจ้าหน้าที่เข้าใช้ระบบสำเร็จ');
        return { success: true, user: { username: rows[i][0].toString().trim(), role: role } };
      }
    }
  }
  return { success: false, error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
}

function changePassword(username, newPassword, logUser) {
  const db = getDb();
  const sheet = db.getSheetByName('UsersDB');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().trim() === username) {
      sheet.getRange(i + 1, 2).setValue(newPassword);
      logActivity(logUser, 'เปลี่ยนรหัสผ่าน', `ผู้ใช้: ${username} เปลี่ยนรหัสผ่านใหม่`);
      return { success: true };
    }
  }
  return { success: false, error: 'ไม่พบชื่อผู้ใช้งานนี้' };
}

function logActivity(user, action, details) {
  try {
    const db = getDb();
    let sheet = db.getSheetByName('ActivityLog');
    if (!sheet) {
      sheet = db.insertSheet('ActivityLog');
      sheet.appendRow(['Timestamp', 'User', 'Action', 'Details']);
    }
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
    sheet.appendRow([timestamp, user || 'System', action, details || '']);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function getActivityLogs() {
  try {
    const rows = getSheetRows('ActivityLog');
    const logs = [];
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][0]) {
        logs.push({
          timestamp: cleanSheetTimestamp(rows[i][0]),
          user: rows[i][1] ? rows[i][1].toString() : '',
          action: rows[i][2] ? rows[i][2].toString() : '',
          details: rows[i][3] ? rows[i][3].toString() : ''
        });
        if (logs.length >= 100) break;
      }
    }
    return logs;
  } catch (e) {
    return { error: e.message };
  }
}

// ----------------------------------------------------
// Rooms DB Settings
// ----------------------------------------------------
function getRoomsList() {
  initRoomsDatabase();
  const rawRows = getSheetRows('RoomsDB');
  const rooms = [];
  rawRows.forEach((row, idx) => {
    if (idx === 0) return;
    if (!row[0]) return;
    rooms.push({
      branch: row[0].toString().trim(),
      roomName: row[1].toString().trim(),
      ipad: row[2] ? row[2].toString().trim() : '',
      zoom: row[3] ? row[3].toString().trim() : ''
    });
  });
  return rooms;
}

function updateRoomSettings(branch, roomName, ipad, zoom, logUser) {
  try {
    initRoomsDatabase();
    const sheet = getDb().getSheetByName('RoomsDB');
    const lastRow = sheet.getLastRow();
    const range = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    
    let targetRow = -1;
    for (let i = 0; i < range.length; i++) {
      if (range[i][0].toString().trim() === branch && range[i][1].toString().trim() === roomName) {
        targetRow = i + 2;
        break;
      }
    }
    
    if (targetRow === -1) {
      sheet.appendRow([branch, roomName, ipad, zoom]);
    } else {
      sheet.getRange(targetRow, 3).setValue(ipad);
      sheet.getRange(targetRow, 4).setValue(zoom);
    }
    logActivity(logUser, 'ตั้งค่าห้องเรียน', `ห้อง: ${roomName} (iPad: ${ipad}, Zoom: ${zoom})`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function deleteRoom(branch, roomName, logUser) {
  try {
    const sheet = getDb().getSheetByName('RoomsDB');
    if (!sheet) throw new Error('RoomsDB sheet not found');
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: true };
    
    const range = sheet.getRange(1, 1, lastRow, 2).getValues();
    let rowIndex = -1;
    for (let i = 1; i < range.length; i++) {
      if (range[i][0].toString().trim() === branch && range[i][1].toString().trim() === roomName) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex !== -1) {
      sheet.deleteRow(rowIndex);
      logActivity(logUser, 'ลบห้องเรียน', `สาขา: ${branch} ห้อง: ${roomName}`);
      return { success: true };
    }
    return { success: false, error: 'ไม่พบห้องเรียนที่ต้องการลบ' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// Daily Grid
// ----------------------------------------------------
function getDailyGridData(dateStr) {
  try {
    const rooms = getRoomsList();
    const classes = getClassLogs(dateStr);
    return {
      rooms: rooms,
      classes: classes
    };
  } catch (err) {
    return { error: err.message };
  }
}

// ----------------------------------------------------
// General Dropdowns
// ----------------------------------------------------
function getGeneralSettings() {
  try {
    const rawData = getSheetRows('DATA General');
    const teachers = [];
    const schools = [];
    
    const defaultSchools = [
      "ระยองวิทยาคม", "อัสสัมชัญระยอง", "เซนต์โยเซฟระยอง", "วัดป่าประดู่", "มัธยมตากสินระยอง", "ระยองวิทยาคมปากน้ำ", "บ้านค่าย", "แกลง \"วิทยสถาวร\"", "กำเนิดวิทย์", "ระยองวิทยาคม นิคมอุตสาหกรรม",
      "เบญจมราชูทิศ จันทบุรี", "ศรียานุสรณ์", "สาธิตมหาวิทยาลัยราชภัฏรำไพพรรณี", "ลาซาลจันทบุรี", "ประทีปศึกษา", "คิชฌกูฏวิทยา", "ท่าใหม่ \"พูลสวัสดิ์ราษฎร์นุกูล\"",
      "สตรีประเสริฐศิลป์", "ตราดสรรเสริญวิทยาคม", "พิทยานุสรณ์ตราด", "คลองใหญ่วิทยาคม", "ตราษตระการคุณ",
      "ชลราษฎรอำรุง", "ชลกันยานุกูล", "สาธิตพิบูลบำเพ็ญ มหาวิทยาลัยบูรพา", "ดาราสมุทร ศรีราชา", "อัสสัมชัญศรีราชา", "เซนต์ปอลคอนแวนต์", "พนัสพิทยาคาร", "บางละมุง", "ศรีราชา", "จุฬาภรณราชวิทยาลัย ชลบุรี", "สาธิตอุดมศึกษา", "มารีวิทย์",
      "เตรียมอุดมศึกษา", "สวนกุหลาบวิทยาลัย", "เทพศิรินทร์", "สามเสนวิทยาลัย", "สตรีวิทยา", "บดินทรเดชา (สิงห์ สิงหเสนี)", "หอวัง", "สาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ปทุมวัน", "สาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ประสานมิตร", "อัสสัมชัญ", "กรุงเทพคริสเตียนวิทยาลัย", "เซนต์คาเบรียล", "มาแตร์เดอีวิทยาลัย", "วัฒนาวิทยาลัย", "ศึกษานารี", "วัดสุทธิวราราม", "สายน้ำผึ้ง", "เตรียมอุดมศึกษาพัฒนาการ", "เตรียมอุดมศึกษาน้อมเกล้า", "สตรีวิทยา ๒", "สาธิตมหาวิทยาลัยราชภัฏสวนสุนันทา", "สาธิตจุฬาลงกรณ์มหาวิทยาลัย",
      "สวนกุหลาบวิทยาลัย นนทบุรี", "สตรีนนทบุรี", "หอวังนนทบุรี", "เบญจมราชานุสรณ์", "ราชวินิตนนทบุรี", "เตรียมอุดมศึกษาพัฒนาการ นนทบุรี",
      "สตรีสมุทรปราการ", "สมุทรปราการ", "ราชวินิตบางแก้ว", "มัธยมวัดด่านสำโรง", "บางพลีราษฎร์บำรุง",
      "อัมพวันวิทยาลัย", "ถาวรานุกูล", "ศรัทธาสมุทร",
      "สมุทรสาครบูรณะ", "สมุทรสาครวิทยาลัย", "กระทุ่มแบน \"วิเศษสมุทคุณ\"",
      "คณะราษฎร์บำรุงปทุมธานี", "ปทุมวิไล", "สวนกุหลาบวิทยาลัย รังสิต", "สาธิตมหาวิทยาลัยราชภัฏพระนครศรีอยุธยา"
    ];
    
    rawData.forEach((row, idx) => {
      if (idx === 0) return;
      if (row[1]) schools.push(row[1].toString().trim());
    });
    
    try {
      const teachersData = getSheetRows('TeachersDB');
      teachersData.forEach((row, idx) => {
        if (idx === 0) return;
        if (row[0]) teachers.push(row[0].toString().trim());
      });
    } catch (e) {
      rawData.forEach((row, idx) => {
        if (idx === 0) return;
        if (row[0]) teachers.push(row[0].toString().trim());
      });
    }
    
    const allSchools = [...schools, ...defaultSchools];
    
    const requestedChannels = [
      "กรุงไทย พี่ปิ๊ก",
      "กรุงเทพ พี่ปิ๊ก",
      "SCB พี่ปิ๊ก",
      "กรุงศรี พี่ปิ๊ก",
      "TTB",
      "กสิกร พี่ปิ๊ก",
      "กสิกร บัญชีบริษัท",
      "SCB คุณยาย",
      "กรุงศรี คุณตา",
      "ออมสิน ยาย",
      "กรุงไทย ยาย",
      "กรุงเทพ ยาย",
      "โอนผิดบัญชี",
      "ยังไม่ชำระเงิน"
    ];
    
    const db = getDb();
    const statusSheet = db.getSheetByName('StatusDB');
    const dbSummary = {
      name: db.getName(),
      id: db.getId(),
      statusRows: statusSheet ? statusSheet.getLastRow() : -1,
      sheets: db.getSheets().map(s => s.getName())
    };
    
    return {
      teachers: [...new Set(teachers)].sort(),
      schools: [...new Set(allSchools)].sort(),
      paymentChannels: requestedChannels,
      dbSummary: dbSummary
    };
  } catch (err) {
    return { error: err.message };
  }
}

// ----------------------------------------------------
// Dashboard Aggregator
// ----------------------------------------------------
function getDashboardData() {
  try {
    const statusData = getSheetRows('StatusDB');
    const learnData = getSheetRows('Data Learn');
    
    let totalIncome = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let totalClasses = 0;
    let totalHours = 0;
    
    const branchFin = {
      'สาขา1': { full: 0, paid: 0, debt: 0 },
      'สาขา2': { full: 0, paid: 0, debt: 0 },
      'สาขา3': { full: 0, paid: 0, debt: 0 },
      'อื่นๆ': { full: 0, paid: 0, debt: 0 }
    };

    const roundFin = {};

    statusData.forEach((row, idx) => {
      if (idx === 0 && row[0] && row[0].toString().toLowerCase().includes('id')) return;
      const studentName = row[1] ? row[1].toString().trim() : '';
      if (!row[0] && !studentName) return;
      
      const paid = parseFloat(row[9]) || 0;
      const full = parseFloat(row[10]) || 0;
      const debt = full - paid;
      const branchRaw = row[5] ? row[5].toString().trim() : '';
      const round = row[15] ? row[15].toString().trim() : 'ทั่วไป';
      
      totalPaid += paid;
      totalIncome += full;
      totalOutstanding += debt;
      
      let branchKey = 'อื่นๆ';
      if (branchRaw.includes('สาขา1')) branchKey = 'สาขา1';
      else if (branchRaw.includes('สาขา2')) branchKey = 'สาขา2';
      else if (branchRaw.includes('สาขา3')) branchKey = 'สาขา3';
      
      branchFin[branchKey].full += full;
      branchFin[branchKey].paid += paid;
      branchFin[branchKey].debt += debt;
      
      if (round) {
        if (!roundFin[round]) {
          roundFin[round] = { full: 0, paid: 0, debt: 0 };
        }
        roundFin[round].full += full;
        roundFin[round].paid += paid;
        roundFin[round].debt += debt;
      }
    });

    learnData.forEach((row, idx) => {
      if (idx === 0) return;
      if (row[0] && row[0] !== '0') {
        totalClasses++;
        const hoursRaw = row[12] ? row[12].toString().trim() : '';
        if (hoursRaw && hoursRaw.includes(':')) {
          const parts = hoursRaw.split(':');
          const hr = parseFloat(parts[0]) || 0;
          const min = parseFloat(parts[1]) || 0;
          totalHours += hr + (min / 60);
        }
      }
    });

    return {
      totalIncome: totalIncome,
      totalPaid: totalPaid,
      totalOutstanding: totalOutstanding,
      totalClasses: totalClasses,
      totalHours: Math.round(totalHours * 100) / 100,
      branchFin: branchFin,
      roundFin: roundFin
    };
  } catch (err) {
    return { error: err.message };
  }
}

// ----------------------------------------------------
// PDF Dynamic Round Summary calculations (สรุป 2569)
// ----------------------------------------------------
function getRoundSummary(round, branch) {
  initAllDatabases();
  try {
    const statusRows = getSheetRows('StatusDB');
    const categories = [
      'อนุบาล3 /ฝากเลี้ยง',
      'ชั้นประถมศึกษาปีที่ 1',
      'ชั้นประถมศึกษาปีที่ 2',
      'ชั้นประถมศึกษาปีที่ 3',
      'ชั้นประถมศึกษาปีที่ 4',
      'ชั้นประถมศึกษาปีที่ 5',
      'ชั้นประถมศึกษาปีที่ 6',
      'ชั้นมัธยมศึกษาปีที่ 1',
      'ชั้นมัธยมศึกษาปีที่ 2',
      'ชั้นมัธยมศึกษาปีที่ 3',
      'ชั้นมัธยมศึกษาปีที่ 4',
      'ชั้นมัธยมศึกษาปีที่ 5',
      'ชั้นมัธยมศึกษาปีที่ 6',
      'กลุ่มย่อย 2 - 3 คน',
      'กลุ่มย่อย 4 - 5 คน',
      'กลุ่มย่อย 6 - 10 คน'
    ];
    
    const stats = {};
    categories.forEach(cat => {
      stats[cat] = {
        paidKids: 0,          // จำนวนผู้จ่ายแล้ว
        outstandingKids: 0,   // จำนวนค้างชำระ
        singleKids: 0,        // เด็กเรียนเดี่ยว
        groupKids: 0,         // เรียนกลุ่มย่อย
        attendedKids: 0,      // เรียนจริง
        regularGroupKids: 0,   // กลุ่มหลัก
        totalFull: 0,         // ยอดเต็ม
        totalPaid: 0,         // ยอดจ่าย
        totalOutstanding: 0,  // คงค้าง
        overFiveKids: 0,      // เด็กกลุ่มเกิน 5 คน
        notes: []
      };
    });
    
    function getGradeCategoryKey(gradeVal) {
      if (!gradeVal) return 'ชั้นประถมศึกษาปีที่ 1';
      const g = gradeVal.toString().trim();
      if (g.includes('อนุบาล') || g.includes('ฝากเลี้ยง')) return 'อนุบาล3 /ฝากเลี้ยง';
      if (g.includes('ป.1') || g === '1') return 'ชั้นประถมศึกษาปีที่ 1';
      if (g.includes('ป.2') || g === '2') return 'ชั้นประถมศึกษาปีที่ 2';
      if (g.includes('ป.3') || g === '3') return 'ชั้นประถมศึกษาปีที่ 3';
      if (g.includes('ป.4') || g === '4') return 'ชั้นประถมศึกษาปีที่ 4';
      if (g.includes('ป.5') || g === '5') return 'ชั้นประถมศึกษาปีที่ 5';
      if (g.includes('ป.6') || g === '6') return 'ชั้นประถมศึกษาปีที่ 6';
      if (g.includes('ม.1')) return 'ชั้นมัธยมศึกษาปีที่ 1';
      if (g.includes('ม.2')) return 'ชั้นมัธยมศึกษาปีที่ 2';
      if (g.includes('ม.3')) return 'ชั้นมัธยมศึกษาปีที่ 3';
      if (g.includes('ม.4')) return 'ชั้นมัธยมศึกษาปีที่ 4';
      if (g.includes('ม.5')) return 'ชั้นมัธยมศึกษาปีที่ 5';
      if (g.includes('ม.6')) return 'ชั้นมัธยมศึกษาปีที่ 6';
      return 'ชั้นประถมศึกษาปีที่ 1';
    }
    
    statusRows.forEach((row, idx) => {
      if (idx === 0) return;
      if (row[0] && row[0].toString().toLowerCase().includes('id')) return;
      const studentName = row[1] ? row[1].toString().trim() : '';
      if (!row[0] && !studentName) return;
      
      const stdRound = row[15] ? row[15].toString().trim() : '';
      const stdBranchPay = row[6] ? row[6].toString().trim() : '';
      
      if (round && stdRound !== round) return;
      if (branch && stdBranchPay !== branch) return;
      
      const paid = parseFloat(row[9]) || 0;
      const full = parseFloat(row[10]) || 0;
      const outstanding = full - paid;
      const nickname = row[2] ? row[2].toString().trim() : '';
      const grade = row[16] ? row[16].toString().trim() : '';
      const classType = row[23] ? row[23].toString().trim() : 'เดี่ยว';
      
      let catKey = '';
      let isSingle = false;
      let isSubgroup = false;
      let isRegular = false;
      
      if (classType.includes('เดี่ยว')) {
        isSingle = true;
        catKey = getGradeCategoryKey(grade);
      } else if (classType.includes('ย่อย') || classType.includes('2-3') || classType.includes('4-5') || classType.includes('6-10')) {
        isSubgroup = true;
        if (classType.includes('4-5')) {
          catKey = 'กลุ่มย่อย 4 - 5 คน';
        } else if (classType.includes('6-10')) {
          catKey = 'กลุ่มย่อย 6 - 10 คน';
        } else {
          catKey = 'กลุ่มย่อย 2 - 3 คน';
        }
      } else {
        isRegular = true;
        catKey = getGradeCategoryKey(grade || classType);
      }
      
      const cat = stats[catKey];
      if (cat) {
        if (paid > 0) cat.paidKids++;
        if (outstanding > 0) cat.outstandingKids++;
        
        if (isSingle) {
          cat.singleKids++;
        } else if (isSubgroup) {
          cat.groupKids++;
        } else if (isRegular) {
          cat.regularGroupKids++;
        }
        
        cat.attendedKids++;
        cat.totalFull += full;
        cat.totalPaid += paid;
        cat.totalOutstanding += outstanding;
        
        if (row[8]) cat.notes.push(`${nickname}: ${row[8]}`);
      }
    });
    
    return { success: true, summary: stats, categories: categories };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function getAllCoursesFromGradeSheets() {
  try {
    const db = getDb();
    const sheets = db.getSheets();
    const courses = [];
    
    sheets.forEach(sheet => {
      const name = sheet.getName();
      const match = name.match(/^(.+)\/([1-3])$/);
      if (match) {
        const lastCol = sheet.getLastColumn();
        if (lastCol >= 71) {
          const vals = sheet.getRange(1, 71, 1, lastCol - 70).getValues()[0];
          vals.forEach(val => {
            if (val) {
              const cName = val.toString().trim();
              if (cName) courses.push(cName);
            }
          });
        }
      }
    });
    
    return [...new Set(courses)].sort();
  } catch (err) {
    return { error: err.message };
  }
}

// ----------------------------------------------------
// Central Student Registration (StatusDB)
// ----------------------------------------------------
function getStudentsList() {
  try {
    return getStudentsListRaw();
  } catch (err) {
    return { error: err.message };
  }
}

function getStudentsListRaw() {
  const statusData = getSheetRows('StatusDB');
  const students = [];
  
  statusData.forEach((row, idx) => {
    if (idx === 0 && row[0] && row[0].toString().toLowerCase().includes('id')) return;
    const studentName = row[1] ? row[1].toString().trim() : '';
    if (!row[0] && !studentName) return;
    
    const id = row[0] ? row[0].toString().trim() : 'TEMP_' + (idx + 1);
    const paid = parseFloat(row[9]) || 0;
    const full = parseFloat(row[10]) || 0;
    const debt = full - paid;
    
    students.push({
      id: id,
      name: studentName,
      nickname: row[2] ? row[2].toString().trim() : '',
      school: row[3] ? row[3].toString().trim() : '',
      contact: row[4] ? row[4].toString().trim() : '',
      branchLearn: row[5] ? row[5].toString().trim() : '',
      branchPay: row[6] ? row[6].toString().trim() : '',
      paymentTimeNote: row[7] ? row[7].toString().trim() : '',
      extraNote: row[8] ? row[8].toString().trim() : '',
      paid: paid,
      full: full,
      outstanding: debt,
      paymentDate: cleanSheetDate(row[12]),
      paymentChannel: row[13] ? row[13].toString().trim() : '',
      staff: row[14] ? row[14].toString().trim() : '',
      round: row[15] ? row[15].toString().trim() : '',
      
      grade: row[16] ? row[16].toString().trim() : '',
      classSection: row[17] ? row[17].toString().trim() : '',
      lineName: row[18] ? row[18].toString().trim() : '',
      lineId: row[19] ? row[19].toString().trim() : '',
      carriedForwardFee: parseFloat(row[20]) || 0,
      classHours: row[21] ? row[21].toString().trim() : '',
      classHoursLeft: row[22] ? row[22].toString().trim() : '',
      classType: row[23] ? row[23].toString().trim() : 'เดี่ยว'
    });
  });
  
  return students;
}

function getStudentDetailedCourses(studentName, nickname, grade, branchLearn, classType) {
  try {
    const db = getDb();
    
    // If it's a private/small group student
    if (classType && (classType.includes('เดี่ยว') || classType.includes('ย่อย'))) {
      let normalizedClassType = 'เดี่ยว';
      let sheetName = '';
      if (classType.includes('เดี่ยว')) {
        normalizedClassType = 'เดี่ยว';
        sheetName = `เดี่ยว ${grade}`;
      } else {
        if (classType.includes('2-3')) normalizedClassType = 'ย่อย 2-3';
        else if (classType.includes('4-5')) normalizedClassType = 'ย่อย 4-5';
        else if (classType.includes('6-10')) normalizedClassType = 'ย่อย 6-10';
        sheetName = normalizedClassType;
      }
      
      const sheet = db.getSheetByName(sheetName);
      if (sheet) {
        const lastRow = sheet.getLastRow();
        const lastCol = sheet.getLastColumn();
        if (lastRow >= 12) {
          const rawData = sheet.getRange(12, 1, lastRow - 11, lastCol).getValues();
          for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            if (row[1] && row[1].toString().trim() === studentName) {
              const courseName = row[10] ? row[10].toString().trim() : '';
              const price = parseFloat(row[13]) || 0;
              const note = row[11] ? row[11].toString().trim() : '';
              return [{
                courseName: courseName,
                price: price,
                dayTime: note,
                classType: classType
              }];
            }
          }
        }
      }
      return [];
    }
    
    // Otherwise, they are a group student ("กลุ่มหลัก")
    let suffix = '1';
    if (branchLearn && (branchLearn.includes('สาขา2') || branchLearn.includes('2'))) suffix = '2';
    else if (branchLearn && (branchLearn.includes('สาขา3') || branchLearn.includes('3'))) suffix = '3';
    
    const sheetName = `${grade}/${suffix}`;
    const sheet = db.getSheetByName(sheetName);
    if (!sheet) return [];
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 6 || lastCol < 71) return [];
    
    const headerRow1 = sheet.getRange(1, 71, 1, lastCol - 70).getValues()[0];
    const headerRow2 = sheet.getRange(2, 71, 1, lastCol - 70).getValues()[0];
    const headerRow3 = sheet.getRange(3, 71, 1, lastCol - 70).getValues()[0];
    
    const studentData = sheet.getRange(6, 1, lastRow - 5, lastCol).getValues();
    for (let idx = 0; idx < studentData.length; idx++) {
      const row = studentData[idx];
      const name = row[1] ? row[1].toString().trim() : '';
      if (name === studentName) {
        const detailedCourses = [];
        for (let i = 0; i < headerRow1.length; i++) {
          const val = row[70 + i];
          if (val !== '' && val !== null && val !== undefined) {
            detailedCourses.push({
              courseName: headerRow1[i].toString().trim(),
              price: parseFloat(headerRow2[i]) || 0,
              dayTime: headerRow3[i] ? headerRow3[i].toString().trim() : '',
              classType: 'กลุ่มหลัก'
            });
          }
        }
        return detailedCourses;
      }
    }
    return [];
  } catch (e) {
    return [];
  }
}

// Load grade courses dynamically for registration dropdown
function getGradeCourses(grade, branch) {
  try {
    const db = getDb();
    let suffix = '1';
    if (branch.includes('สาขา2')) suffix = '2';
    else if (branch.includes('สาขา3')) suffix = '3';
    
    const sheetName = `${grade}/${suffix}`;
    const sheet = db.getSheetByName(sheetName);
    if (!sheet) return [];
    
    const lastCol = sheet.getLastColumn();
    if (lastCol < 71) return [];
    
    const headerRow1 = sheet.getRange(1, 71, 1, lastCol - 70).getValues()[0];
    const headerRow2 = sheet.getRange(2, 71, 1, lastCol - 70).getValues()[0];
    const headerRow3 = sheet.getRange(3, 71, 1, lastCol - 70).getValues()[0];
    const headerRow4 = sheet.getRange(4, 71, 1, lastCol - 70).getValues()[0];
    
    const courses = [];
    for (let i = 0; i < headerRow1.length; i++) {
      if (headerRow1[i]) {
        courses.push({
          courseName: headerRow1[i].toString().trim(),
          price: parseFloat(headerRow2[i]) || 0,
          dayTime: headerRow3[i] ? headerRow3[i].toString().trim() : '',
          totalSessions: parseInt(headerRow4[i]) || 10
        });
      }
    }
    return courses;
  } catch (e) {
    return [];
  }
}

// Sync back student records to grade sheets
function syncToGradeSheet(student) {
  const db = getDb();
  let sheetName = '';
  
  const uiClassType = student.classType || 'เดี่ยว';
  const grade = student.grade || 'อนุบาล';
  
  let normalizedClassType = 'เดี่ยว';
  if (uiClassType.includes('เดี่ยว')) {
    normalizedClassType = 'เดี่ยว';
    sheetName = `เดี่ยว ${grade}`;
  } else if (uiClassType.includes('ย่อย')) {
    if (uiClassType.includes('2-3')) normalizedClassType = 'ย่อย 2-3';
    else if (uiClassType.includes('4-5')) normalizedClassType = 'ย่อย 4-5';
    else if (uiClassType.includes('6-10')) normalizedClassType = 'ย่อย 6-10';
    sheetName = normalizedClassType;
  } else {
    normalizedClassType = 'กลุ่มหลัก';
    let suffix = '1';
    if (student.branchLearn.includes('สาขา2')) suffix = '2';
    else if (student.branchLearn.includes('สาขา3')) suffix = '3';
    sheetName = `${grade}/${suffix}`;
  }
  
  const sheet = db.getSheetByName(sheetName);
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  let range = [];
  const startRow = sheetName.includes('เดี่ยว') || sheetName.includes('ย่อย') ? 12 : 6;
  
  if (lastRow >= startRow) {
    range = sheet.getRange(startRow, 2, lastRow - (startRow - 1), 10).getValues(); 
  }
  
  let targetRowIndex = -1;
  const courseName = student.round || '';
  
  for (let i = 0; i < range.length; i++) {
    if (range[i][0].toString().trim() === student.name && (sheetName.includes('เดี่ยว') ? range[i][9].toString().trim() === courseName : true)) {
      targetRowIndex = i + startRow;
      break;
    }
  }
  
  const rowDataClassType = normalizedClassType === 'เดี่ยว' ? `เดี่ยว ${student.grade}` : normalizedClassType;
  const rowData = [
    rowDataClassType,
    student.name,
    student.nickname,
    student.school,
    student.classSection || '',
    student.contact || '', 
    student.lineName || '',
    student.lineId || '',
    student.branchLearn,
    student.branchPay,
    student.round || '', 
    student.paymentTimeNote || '',
    student.carriedForwardFee || 0,
    student.full || 0,
    student.paid || 0,
    student.full - student.paid,
    student.paymentDate || '',
    student.paymentChannel,
    student.staff || '',
    student.classHours || '',
    student.classHoursLeft || ''
  ];
  
  if (sheetName.includes('เดี่ยว') || sheetName.includes('ย่อย')) {
    if (targetRowIndex === -1) {
      sheet.appendRow(rowData);
    } else {
      sheet.getRange(targetRowIndex, 1, 1, 21).setValues([rowData]);
    }
  } else {
    let targetRow = targetRowIndex;
    if (targetRowIndex === -1) {
      targetRow = sheet.getLastRow() + 1;
      sheet.getRange(targetRow, 1, 1, 10).setValues([[
        student.grade, student.name, student.nickname, student.school, student.classSection,
        student.contact, student.lineName, student.lineId, student.branchLearn, student.branchPay
      ]]);
      sheet.getRange(targetRow, 51).setValue(student.full); 
      sheet.getRange(targetRow, 62).setValue(0); 
      sheet.getRange(targetRow, 64).setValue(student.paid); 
      sheet.getRange(targetRow, 70).setValue(student.isCard ? 1 : 0);
    } else {
      sheet.getRange(targetRow, 1, 1, 10).setValues([[
        student.grade, student.name, student.nickname, student.school, student.classSection,
        student.contact, student.lineName, student.lineId, student.branchLearn, student.branchPay
      ]]);
      sheet.getRange(targetRow, 51).setValue(student.full);
      sheet.getRange(targetRow, 64).setValue(student.paid);
      sheet.getRange(targetRow, 70).setValue(student.isCard ? 1 : 0);
    }
    
    // Sync checked courses into columns 71+ in the grade sheet
    try {
      const selectedList = student.selectedCourses || [];
      if (selectedList.length > 0) {
        const lastCol = sheet.getLastColumn();
        if (lastCol >= 71) {
          const header1 = sheet.getRange(1, 71, 1, lastCol - 70).getValues()[0];
          const header2 = sheet.getRange(2, 71, 1, lastCol - 70).getValues()[0];
          const header4 = sheet.getRange(4, 71, 1, lastCol - 70).getValues()[0];
          
          const coursesInSheet = [];
          for (let j = 0; j < header1.length; j++) {
            if (header1[j]) {
              coursesInSheet.push({
                colIndex: 71 + j,
                courseName: header1[j].toString().trim(),
                price: parseFloat(header2[j]) || 0,
                sessions: parseInt(header4[j]) || 10
              });
            }
          }
          
          // Map selected list items (which could be string or object)
          const selectedMap = {};
          selectedList.forEach(item => {
            if (item && typeof item === 'object' && item.courseName) {
              selectedMap[item.courseName.toString().trim()] = parseInt(item.sessions) || 0;
            } else if (item) {
              selectedMap[item.toString().trim()] = null;
            }
          });
          
          const selectedConfig = coursesInSheet.filter(c => c.courseName in selectedMap);
          const fullCourses = [];
          const partialCourses = [];
          
          selectedConfig.forEach(c => {
            const userSessions = selectedMap[c.courseName];
            const isPartial = (userSessions !== null && userSessions !== undefined && userSessions < c.sessions);
            if (isPartial) {
              c.userSessions = userSessions;
              partialCourses.push(c);
            } else {
              c.userSessions = c.sessions;
              fullCourses.push(c);
            }
          });
          
          const courseValuesToWrite = {};
          coursesInSheet.forEach(c => {
            courseValuesToWrite[c.colIndex] = ''; // clear cell by default
          });
          
          // Sort descending by price to apply discounts correctly to full courses
          fullCourses.sort((a, b) => b.price - a.price);
          fullCourses.forEach((c, idx) => {
            if (idx === 0 || idx === 1) {
              courseValuesToWrite[c.colIndex] = c.sessions; // full sessions
            } else if (idx === 2) {
              courseValuesToWrite[c.colIndex] = 30; // 30% discount
            } else {
              courseValuesToWrite[c.colIndex] = 50; // 50% discount
            }
          });
          
          // Write partial courses (directly custom sessions count, no discount)
          partialCourses.forEach(c => {
            courseValuesToWrite[c.colIndex] = c.userSessions;
          });
          
          for (const colIndex in courseValuesToWrite) {
            sheet.getRange(targetRow, parseInt(colIndex)).setValue(courseValuesToWrite[colIndex]);
          }
        }
      }
    } catch (err) {
      // ignore sync courses details error to keep main save successful
    }
  }
}

function syncStudentToStatusDB(std) {
  const sheet = getDb().getSheetByName('StatusDB');
  const lastRow = sheet.getLastRow();
  let range = [];
  let rounds = [];
  if (lastRow > 0) {
    range = sheet.getRange(1, 2, lastRow, 1).getValues();
    rounds = sheet.getRange(1, 16, lastRow, 1).getValues();
  }
  
  let rowIndex = -1;
  for (let i = 0; i < range.length; i++) {
    if (range[i][0].toString().trim() === std.name && rounds[i][0].toString().trim() === std.round) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const timestamp = new Date().getTime();
  const id = rowIndex !== -1 ? sheet.getRange(rowIndex, 1).getValue() : `${std.name.replace(/\s+/g, '')}_${timestamp}_${std.round}`;
  
  const rowValues = [
    id,
    std.name,
    std.nickname,
    std.school,
    std.contact,
    std.branchLearn,
    std.branchPay,
    std.paymentTimeNote || '',
    std.extraNote || '',
    std.paid,
    std.full,
    std.outstanding,
    std.paymentDate || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy'),
    std.paymentChannel || 'กสิกร บัญชีบริษัท',
    std.staff || '',
    std.round,
    std.grade,
    std.classSection || '',
    std.lineName || '',
    std.lineId || '',
    std.carriedForwardFee || 0,
    std.classHours || '',
    std.classHoursLeft || '',
    std.classType
  ];
  
  if (rowIndex === -1) {
    sheet.appendRow(rowValues);
  } else {
    sheet.getRange(rowIndex, 1, 1, 24).setValues([rowValues]);
  }
}

function addStudentRegistration(student, logUser) {
  try {
    const sheet = getDb().getSheetByName('StatusDB');
    if (!sheet) throw new Error('StatusDB sheet not found');
    
    const timestamp = new Date().getTime();
    const round = student.round || 'Summer69';
    const id = `${student.name.replace(/\s+/g, '')}_${timestamp}_${round}`;
    
    const paid = parseFloat(student.paid) || 0;
    const full = parseFloat(student.full) || 0;
    const outstanding = full - paid;
    
    const rowData = [
      id,
      student.name,
      student.nickname,
      student.school,
      student.contact,
      student.branchLearn,
      student.branchPay,
      student.paymentTimeNote || '',
      student.extraNote || '',
      paid,
      full,
      outstanding,
      student.paymentDate || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy'),
      student.paymentChannel,
      student.staff || '',
      round,
      
      student.grade || '',
      student.classSection || '',
      student.lineName || '',
      student.lineId || '',
      student.carriedForwardFee || 0,
      student.classHours || '',
      student.classHoursLeft || '',
      student.classType || 'เดี่ยว'
    ];
    
    sheet.appendRow(rowData);
    syncToGradeSheet(student);
    logActivity(logUser, 'ลงทะเบียนเด็กใหม่', `นักเรียน: ${student.name} คอร์ส: ${round} ยอดเต็ม: ${full}`);
    return { success: true, id: id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateStudentRegistration(student, logUser) {
  try {
    const sheet = getDb().getSheetByName('StatusDB');
    if (!sheet) throw new Error('StatusDB sheet not found');
    
    const lastRow = sheet.getLastRow();
    const keys = sheet.getRange(1, 1, lastRow, 1).getValues();
    
    let rowIndex = -1;
    
    // 1. If it's a TEMP ID, check that row first
    if (student.id && student.id.startsWith('TEMP_')) {
      const parts = student.id.split('_');
      const tempIdx = parseInt(parts[1], 10);
      if (!isNaN(tempIdx) && tempIdx >= 1 && tempIdx <= lastRow) {
        const currentName = sheet.getRange(tempIdx, 2).getValue().toString().trim();
        if (currentName === student.name.trim()) {
          rowIndex = tempIdx;
        }
      }
    }
    
    // 2. Fallback: Search by ID
    if (rowIndex === -1) {
      for (let i = 0; i < keys.length; i++) {
        if (keys[i][0].toString().trim() === student.id) {
          rowIndex = i + 1;
          break;
        }
      }
    }
    
    // 3. Fallback: Search by Name and Round
    if (rowIndex === -1) {
      for (let i = 0; i < lastRow; i++) {
        const nameVal = sheet.getRange(i + 1, 2).getValue().toString().trim();
        const roundVal = sheet.getRange(i + 1, 16).getValue().toString().trim();
        if (nameVal === student.name.trim() && roundVal === student.round) {
          rowIndex = i + 1;
          break;
        }
      }
    }
    
    if (rowIndex === -1) {
      throw new Error(`Student record not found for ID/Name: ${student.id} / ${student.name}`);
    }
    
    // If it was a TEMP ID, promote it to a permanent ID so column A is populated
    if (student.id.startsWith('TEMP_')) {
      const timestamp = new Date().getTime();
      const round = student.round || 'Summer69';
      student.id = `${student.name.replace(/\s+/g, '')}_${timestamp}_${round}`;
    }
    
    const paid = parseFloat(student.paid) || 0;
    const full = parseFloat(student.full) || 0;
    const outstanding = full - paid;
    
    const rowValues = [
      [
        student.id,
        student.name,
        student.nickname,
        student.school,
        student.contact,
        student.branchLearn,
        student.branchPay,
        student.paymentTimeNote || '',
        student.extraNote || '',
        paid,
        full,
        outstanding,
        student.paymentDate || '',
        student.paymentChannel,
        student.staff || '',
        student.round,
        
        student.grade || '',
        student.classSection || '',
        student.lineName || '',
        student.lineId || '',
        student.carriedForwardFee || 0,
        student.classHours || '',
        student.classHoursLeft || '',
        student.classType || 'เดี่ยว'
      ]
    ];
    
    sheet.getRange(rowIndex, 1, 1, 24).setValues(rowValues);
    syncToGradeSheet(student);
    logActivity(logUser, 'แก้ไขรายละเอียดเด็กนักเรียน', `นักเรียน: ${student.name} (ID: ${student.id})`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function deleteStudentRegistration(id, logUser) {
  try {
    const sheet = getDb().getSheetByName('StatusDB');
    if (!sheet) throw new Error('StatusDB sheet not found');
    
    const lastRow = sheet.getLastRow();
    const keys = sheet.getRange(1, 1, lastRow, 1).getValues();
    
    let rowIndex = -1;
    
    // 1. If it's a TEMP ID, check that row first
    if (id && id.startsWith('TEMP_')) {
      const parts = id.split('_');
      const tempIdx = parseInt(parts[1], 10);
      if (!isNaN(tempIdx) && tempIdx >= 1 && tempIdx <= lastRow) {
        rowIndex = tempIdx;
      }
    }
    
    // 2. Fallback: Search by ID
    if (rowIndex === -1) {
      for (let i = 0; i < keys.length; i++) {
        if (keys[i][0].toString().trim() === id) {
          rowIndex = i + 1;
          break;
        }
      }
    }
    
    if (rowIndex === -1) {
      throw new Error(`Student record not found for ID: ${id}`);
    }
    
    const stdName = sheet.getRange(rowIndex, 2).getValue();
    sheet.deleteRow(rowIndex);
    logActivity(logUser, 'ลบข้อมูลลงทะเบียนเรียน', `นักเรียน: ${stdName} (ID: ${id})`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// Grade-Level Registration Sheet Grid Editor (เช่น ม.1/2)
// ----------------------------------------------------
function getGradeSheetData(grade, branch) {
  try {
    const db = getDb();
    const suffixes = ['1', '2', '3'];
    const allCourses = [];
    const allStudents = [];
    
    suffixes.forEach(suffix => {
      const sheetName = `${grade}/${suffix}`;
      const sheet = db.getSheetByName(sheetName);
      if (!sheet) return;
      
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow < 5) return;
      
      const branchName = `สาขา${suffix}`;
      
      const sheetCourses = [];
      if (lastCol >= 71) {
        const headerRow1 = sheet.getRange(1, 71, 1, lastCol - 70).getValues()[0];
        const headerRow2 = sheet.getRange(2, 71, 1, lastCol - 70).getValues()[0];
        const headerRow3 = sheet.getRange(3, 71, 1, lastCol - 70).getValues()[0];
        const headerRow4 = sheet.getRange(4, 71, 1, lastCol - 70).getValues()[0];
        
        for (let i = 0; i < headerRow1.length; i++) {
          if (headerRow1[i]) {
            sheetCourses.push({
              colIndex: 71 + i,
              courseName: headerRow1[i].toString().trim(),
              price: parseFloat(headerRow2[i]) || 0,
              dayTime: headerRow3[i] ? headerRow3[i].toString().trim() : '',
              totalSessions: parseInt(headerRow4[i]) || 10,
              sheetName: sheetName,
              branch: branchName
            });
          }
        }
      }
      
      allCourses.push(...sheetCourses);
      
      if (lastRow >= 6) {
        const studentData = sheet.getRange(6, 1, lastRow - 5, lastCol).getValues();
        studentData.forEach((row, idx) => {
          const name = row[1] ? row[1].toString().trim() : '';
          if (!name) return;
          
          const courseValues = {};
          sheetCourses.forEach(c => {
            const val = row[c.colIndex - 1];
            courseValues[c.colIndex] = val !== '' ? parseFloat(val) : '';
          });
          
          allStudents.push({
            rowIndex: 6 + idx,
            grade: row[0] ? row[0].toString().trim() : '',
            name: name,
            nickname: row[2] ? row[2].toString().trim() : '',
            school: row[3] ? row[3].toString().trim() : '',
            classSection: row[4] ? row[4].toString().trim() : '',
            contact: row[5] ? row[5].toString().trim() : '',
            lineName: row[6] ? row[6].toString().trim() : '',
            lineId: row[7] ? row[7].toString().trim() : '',
            branchLearn: row[8] ? row[8].toString().trim() : '',
            branchPay: row[9] ? row[9].toString().trim() : '',
            
            full: parseFloat(row[50]) || 0, 
            discount: parseFloat(row[61]) || 0, 
            outstanding: parseFloat(row[62]) || 0, 
            paid: parseFloat(row[63]) || 0, 
            isCard: parseInt(row[69]) === 1 ? 1 : 0, 
            
            courseValues: courseValues,
            sheetName: sheetName,
            branch: branchName
          });
        });
      }
    });
    
    return {
      success: true,
      sheetName: `${grade}/merged`,
      courses: allCourses,
      students: allStudents
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function saveGradeSheetData(grade, branch, coursesUpdate, studentsUpdate, logUser) {
  try {
    const db = getDb();
    
    // Group courses update by sheetName
    const coursesBySheet = {};
    coursesUpdate.forEach(c => {
      const sName = c.sheetName || `${grade}/1`;
      if (!coursesBySheet[sName]) coursesBySheet[sName] = [];
      coursesBySheet[sName].push(c);
    });
    
    // Group students update by sheetName
    const studentsBySheet = {};
    studentsUpdate.forEach(s => {
      const sName = s.sheetName || `${grade}/1`;
      if (!studentsBySheet[sName]) studentsBySheet[sName] = [];
      studentsBySheet[sName].push(s);
    });
    
    const allSheetNames = new Set([...Object.keys(coursesBySheet), ...Object.keys(studentsBySheet)]);
    
    allSheetNames.forEach(sheetName => {
      const sheet = db.getSheetByName(sheetName);
      if (!sheet) return;
      
      const sheetCoursesUpdate = coursesBySheet[sheetName] || [];
      const sheetStudentsUpdate = studentsBySheet[sheetName] || [];
      
      sheetCoursesUpdate.forEach(c => {
        sheet.getRange(1, c.colIndex).setValue(c.courseName);
        sheet.getRange(2, c.colIndex).setValue(c.price);
        sheet.getRange(3, c.colIndex).setValue(c.dayTime || '');
        sheet.getRange(4, c.colIndex).setValue(c.totalSessions);
      });
      
      sheetStudentsUpdate.forEach(s => {
        const row = s.rowIndex;
        sheet.getRange(row, 2).setValue(s.name);
        sheet.getRange(row, 3).setValue(s.nickname);
        sheet.getRange(row, 4).setValue(s.school);
        sheet.getRange(row, 5).setValue(s.classSection);
        sheet.getRange(row, 6).setValue(s.contact);
        sheet.getRange(row, 7).setValue(s.lineName);
        sheet.getRange(row, 8).setValue(s.lineId);
        sheet.getRange(row, 9).setValue(s.branchLearn);
        sheet.getRange(row, 10).setValue(s.branchPay);
        
        sheet.getRange(row, 62).setValue(s.discount); 
        sheet.getRange(row, 64).setValue(s.paid); 
        sheet.getRange(row, 70).setValue(s.isCard ? 1 : 0); 
        
        for (const colIndex in s.courseValues) {
          sheet.getRange(row, parseInt(colIndex)).setValue(s.courseValues[colIndex]);
        }
        
        // Recalculate subtotal using only courses belonging to this sheet
        let subtotal = 0;
        sheetCoursesUpdate.forEach(c => {
          const val = s.courseValues[c.colIndex];
          if (val !== '' && !isNaN(val)) {
            const num = parseFloat(val);
            const price = parseFloat(c.price) || 0;
            const totalSessions = parseInt(c.totalSessions) || 10;
            
            if (num === 30) subtotal += price * 0.7;
            else if (num === 20) subtotal += price * 0.9;
            else if (num === 50) subtotal += price * 0.5;
            else if (num >= 1 && num <= 2) subtotal += num * 350;
            else if (num >= 3) subtotal += num * (price / totalSessions);
          }
        });
        
        if (s.isCard) subtotal *= 1.03;
        const full = subtotal - s.discount;
        const outstanding = full - s.paid;
        
        sheet.getRange(row, 51).setValue(full); 
        sheet.getRange(row, 63).setValue(outstanding); 
        
        syncStudentToStatusDB({
          name: s.name,
          nickname: s.nickname,
          school: s.school,
          contact: s.contact,
          branchLearn: s.branchLearn,
          branchPay: s.branchPay,
          full: full,
          paid: s.paid,
          outstanding: outstanding,
          discount: s.discount,
          grade: grade,
          classSection: s.classSection,
          lineName: s.lineName,
          lineId: s.lineId,
          classType: 'กลุ่มหลัก',
          round: s.sheetName || sheetName
        });
      });
    });
    
    logActivity(logUser, 'แก้ไขห้องเรียนแยกสาขา (รวม)', `แก้ไขชีตระดับชั้น ${grade} รวมทุกสาขา จำนวนที่ส่งอัปเดต ${studentsUpdate.length} คน`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function addNewCourseColumn(grade, branch, courseName, price, dayTime, sessions, logUser) {
  try {
    const db = getDb();
    let suffix = '1';
    if (branch.includes('สาขา2')) suffix = '2';
    else if (branch.includes('สาขา3')) suffix = '3';
    
    const sheetName = `${grade}/${suffix}`;
    const sheet = db.getSheetByName(sheetName);
    if (!sheet) throw new Error(`ไม่พบชีตห้องเรียน ${sheetName}`);
    
    const lastCol = sheet.getLastColumn();
    const targetCol = lastCol + 1;
    
    sheet.getRange(1, targetCol).setValue(courseName);
    sheet.getRange(2, targetCol).setValue(price);
    sheet.getRange(3, targetCol).setValue(dayTime || ''); 
    sheet.getRange(4, targetCol).setValue(parseInt(sessions) || 10); 
    
    logActivity(logUser, 'เพิ่มคอร์สเรียนแยกห้อง', `ชีต ${sheetName} เพิ่มคอร์ส ${courseName} ราคา ${price} จำนวนครั้ง ${sessions} วัน/เวลา ${dayTime || ''}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function deleteCourseColumn(grade, branch, sheetName, colIndex, courseName, logUser) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName(sheetName);
    if (!sheet) throw new Error(`ไม่พบชีตห้องเรียน ${sheetName}`);
    
    // Delete column
    sheet.deleteColumn(colIndex);
    
    logActivity(logUser, 'ลบคอลัมน์วิชาเรียน', `ชีต ${sheetName} ลบวิชา ${courseName} (คอลัมน์ที่ ${colIndex})`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ----------------------------------------------------
// Private & Small Group Student Editor (เดี่ยว / ย่อย)
// ----------------------------------------------------
function getPrivateSheetData(sheetName) {
  try {
    const db = getDb();
    let sheetsToProcess = [];
    if (sheetName === 'ALL') {
      sheetsToProcess = [
        "เดี่ยว อนุบาล", "เดี่ยว ป.1", "เดี่ยว ป.2", "เดี่ยว ป.3", "เดี่ยว ป.4", "เดี่ยว ป.5", "เดี่ยว ป.6",
        "เดี่ยว ม.1", "เดี่ยว ม.2", "เดี่ยว ม.3", "เดี่ยว ม.4", "เดี่ยว ม.5", "เดี่ยว ม.6",
        "ย่อย 2-3", "ย่อย 4-5", "ย่อย 6-10"
      ];
    } else {
      sheetsToProcess = [sheetName];
    }
    
    const students = [];
    sheetsToProcess.forEach(sName => {
      const sheet = db.getSheetByName(sName);
      if (!sheet) return;
      
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow < 12) return;
      
      const rawData = sheet.getRange(12, 1, lastRow - 11, lastCol).getValues();
      rawData.forEach((row, idx) => {
        const name = row[1] ? row[1].toString().trim() : '';
        if (!name) return;
        
        students.push({
          rowIndex: 12 + idx,
          sheetName: sName,
          classType: row[0] ? row[0].toString().trim() : '',
          name: name,
          nickname: row[2] ? row[2].toString().trim() : '',
          school: row[3] ? row[3].toString().trim() : '',
          classSection: row[4] ? row[4].toString().trim() : '',
          contact: row[5] ? row[5].toString().trim() : '',
          lineName: row[6] ? row[6].toString().trim() : '',
          lineId: row[7] ? row[7].toString().trim() : '',
          branchLearn: row[8] ? row[8].toString().trim() : '',
          branchPay: row[9] ? row[9].toString().trim() : '',
          courseName: row[10] ? row[10].toString().trim() : '',
          note: row[11] ? row[11].toString().trim() : '',
          carriedForward: parseFloat(row[12]) || 0,
          full: parseFloat(row[13]) || 0,
          paid: parseFloat(row[14]) || 0,
          outstanding: parseFloat(row[15]) || 0,
          paymentDate: row[16] ? row[16].toString().trim() : '',
          paymentChannel: row[17] ? row[17].toString().trim() : '',
          staff: row[18] ? row[18].toString().trim() : '',
          hours: row[19] ? row[19].toString().trim() : '',
          hoursLeft: row[20] ? row[20].toString().trim() : ''
        });
      });
    });
    
    return { success: true, sheetName: sheetName, students: students };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function savePrivateStudentPayment(sheetName, name, courseName, paymentData, logUser) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName(sheetName);
    if (!sheet) throw new Error(`ไม่พบชีตข้อมูล ${sheetName}`);
    
    const lastRow = sheet.getLastRow();
    const range = sheet.getRange(12, 2, lastRow - 11, 1).getValues(); 
    const courses = sheet.getRange(12, 11, lastRow - 11, 1).getValues(); 
    
    let rowIndex = -1;
    for (let i = 0; i < range.length; i++) {
      if (range[i][0].toString().trim() === name && courses[i][0].toString().trim() === courseName) {
        rowIndex = i + 12;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error(`ไม่พบข้อมูลนักเรียน ${name} ในวิชา ${courseName} ในชีต ${sheetName}`);
    }
    
    const paid = parseFloat(paymentData.paid) || 0;
    const carriedForward = parseFloat(paymentData.carriedForward) || 0;
    const hours = paymentData.hours || '';
    
    let rate = 250;
    if (courseName.toLowerCase().includes('ex')) rate = 312.5;
    
    let minutes = 0;
    if (hours.includes(':')) {
      const parts = hours.split(':');
      minutes = (parseInt(parts[0]) * 60) + parseInt(parts[1]);
    }
    
    const full = (minutes * rate) / 60;
    const outstanding = (paid + carriedForward) - full;
    
    sheet.getRange(rowIndex, 13).setValue(carriedForward); 
    sheet.getRange(rowIndex, 14).setValue(full); 
    sheet.getRange(rowIndex, 15).setValue(paid); 
    sheet.getRange(rowIndex, 16).setValue(outstanding); 
    sheet.getRange(rowIndex, 17).setValue(paymentData.paymentDate || ''); 
    sheet.getRange(rowIndex, 18).setValue(paymentData.paymentChannel || ''); 
    sheet.getRange(rowIndex, 19).setValue(paymentData.staff || ''); 
    sheet.getRange(rowIndex, 20).setValue(hours); 
    
    const stdDetails = sheet.getRange(rowIndex, 1, 1, 10).getValues()[0];
    syncStudentToStatusDB({
      name: name,
      nickname: stdDetails[2],
      school: stdDetails[3],
      contact: stdDetails[5],
      branchLearn: stdDetails[8],
      branchPay: stdDetails[9],
      full: full,
      paid: paid,
      outstanding: -outstanding, 
      carriedForwardFee: carriedForward,
      grade: sheetName.includes('เดี่ยว') ? sheetName.replace('เดี่ยว', '').trim() : 'อนุบาล',
      classSection: stdDetails[4],
      lineName: stdDetails[6],
      lineId: stdDetails[7],
      classHours: hours,
      classHoursLeft: paymentData.hoursLeft || '',
      classType: sheetName.includes('เดี่ยว') ? 'เดี่ยว' : sheetName,
      round: courseName
    });
    
    logActivity(logUser, 'อัปเดตยอดเงินเด็กเดี่ยว/ย่อย', `นักเรียน: ${name} ค่าเรียนใหม่: ${full} ชำระ: ${paid} ในชีต ${sheetName}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ----------------------------------------------------
// Teacher Hours Log & Monthly Pay Calculations
// ----------------------------------------------------
function getTeachersDB() {
  initAllDatabases();
  try {
    const rawData = getSheetRows('TeachersDB');
    const teachers = [];
    rawData.forEach((row, idx) => {
      if (idx === 0) return;
      if (!row[0]) return;
      teachers.push({
        nickname: row[0].toString().trim(),
        fullName: row[1] ? row[1].toString().trim() : '',
        school: row[2] ? row[2].toString().trim() : '',
        phone: row[3] ? row[3].toString().trim() : '',
        subjects: row[4] ? row[4].toString().trim() : '',
        bank: row[5] ? row[5].toString().trim() : '',
        accountNumber: row[6] ? row[6].toString().trim() : ''
      });
    });
    return teachers;
  } catch (e) {
    return { error: e.message };
  }
}

function saveTeacherProfile(teacher, logUser) {
  try {
    initAllDatabases();
    const db = getDb();
    const sheet = db.getSheetByName('TeachersDB');
    const lastRow = sheet.getLastRow();
    const nicknames = sheet.getRange(1, 1, lastRow, 1).getValues();
    
    let rowIndex = -1;
    for (let i = 0; i < nicknames.length; i++) {
      if (nicknames[i][0].toString().trim() === teacher.nickname) {
        rowIndex = i + 1;
        break;
      }
    }
    
    const rowValues = [
      teacher.nickname,
      teacher.fullName || '',
      teacher.school || '',
      teacher.phone || '',
      teacher.subjects || '',
      teacher.bank || '',
      teacher.accountNumber || ''
    ];
    
    if (rowIndex === -1) {
      sheet.appendRow(rowValues);
      const genSheet = db.getSheetByName('DATA General');
      if (genSheet) {
        genSheet.appendRow([teacher.nickname]);
      }
    } else {
      sheet.getRange(rowIndex, 1, 1, 7).setValues([rowValues]);
    }
    
    logActivity(logUser, 'บันทึกประวัติครู', `ครู: ${teacher.nickname}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function calculateTeacherMonthlyPay(teacher, startDateStr, endDateStr) {
  try {
    const classLogs = getClassLogs(''); 
    if (classLogs.error) throw new Error(classLogs.error);
    
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    const matchedClasses = [];
    let grandTotalHours = 0;
    let grandTotalPay = 0;
    
    classLogs.forEach(c => {
      const dateParts = c.date.split('/');
      if (dateParts.length !== 3) return;
      const cDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
      
      if (cDate < start || cDate > end) return;
      
      const isReg = c.teacherRegular.toLowerCase().includes(teacher.toLowerCase().trim());
      const isSub = c.teacherSub.toLowerCase().includes(teacher.toLowerCase().trim());
      const isLeave = c.note.toLowerCase().includes('ครูลา') || c.note.toLowerCase().includes('ลา');
      
      let matches = false;
      let role = 'ครูประจำ';
      if (isReg && !isLeave) {
        matches = true;
      } else if (isSub) {
        matches = true;
        role = `สอนแทน ${c.teacherRegular}`;
      }
      
      if (!matches) return;
      
      const liveKids = parseInt(c.isPresentLive) || 0;
      const onlineKids = parseInt(c.isPresentOnline) || 0;
      const numKids = liveKids + onlineKids;
      
      let hoursVal = 0;
      if (c.hours.includes(':')) {
        const parts = c.hours.split(':');
        hoursVal = parseFloat(parts[0]) + (parseFloat(parts[1]) / 60);
      } else {
        hoursVal = parseFloat(c.hours) || 0;
      }
      
      const hasEx = c.subject.toLowerCase().includes('ex');
      const hasRyw = c.teacherRegular.toLowerCase().includes('รยว.') || (c.teacherSub && c.teacherSub.toLowerCase().includes('รยว.'));
      const isSpecial = hasEx || hasRyw;
      
      let rate = 0;
      if (numKids > 0) {
        const base = isSpecial ? 200 : 150;
        rate = base + Math.floor((numKids - 1) / 5) * 50;
      }
      
      const pay = hoursVal * rate;
      
      grandTotalHours += hoursVal;
      grandTotalPay += pay;
      
      matchedClasses.push({
        date: c.date,
        subject: c.subject,
        room: c.roomBranch,
        role: role,
        numKids: numKids,
        hours: c.hours,
        rate: rate,
        pay: Math.round(pay * 100) / 100
      });
    });
    
    return {
      success: true,
      teacher: teacher,
      startDate: startDateStr,
      endDate: endDateStr,
      classes: matchedClasses,
      totalHours: Math.round(grandTotalHours * 100) / 100,
      totalPay: Math.round(grandTotalPay * 100) / 100
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ----------------------------------------------------
// Master Class Logs (Data Learn)
// ----------------------------------------------------
function getClassLogs(filterDate) {
  try {
    const rawData = getSheetRows('Data Learn');
    const logs = [];
    
    rawData.forEach((row, idx) => {
      if (idx === 0) return;
      if (!row[0] || row[0] === '0') return;
      
      const dateRaw = cleanSheetDate(row[13]);
      if (filterDate && dateRaw !== filterDate) return;
      
      logs.push({
        subject: row[0] ? row[0].toString().trim() : '',
        teacherRegular: row[1] ? row[1].toString().trim() : '',
        teacherSub: row[2] ? row[2].toString().trim() : '',
        timeStart: row[3] ? row[3].toString().trim() : '',
        timeEnd: row[4] ? row[4].toString().trim() : '',
        note: row[5] ? row[5].toString().trim() : '',
        isPresentLive: parseInt(row[6]) || 0,
        isPresentOnline: parseInt(row[7]) || 0,
        isLeave: parseInt(row[8]) || 0,
        isAbsent: parseInt(row[9]) || 0,
        isMakeup: parseInt(row[10]) || 0,
        isOrange: parseInt(row[11]) || 0,
        hours: row[12] ? row[12].toString().trim() : '',
        date: dateRaw,
        roomBranch: row[14] ? row[14].toString().trim() : '',
        rowIndex: idx + 1
      });
    });
    
    return logs;
  } catch (err) {
    return { error: err.message };
  }
}

function addClassLog(log, logUser) {
  try {
    const sheet = getDb().getSheetByName('Data Learn');
    if (!sheet) throw new Error('Data Learn sheet not found');
    
    const rowData = [
      log.subject,
      log.teacherRegular,
      log.teacherSub || '',
      log.timeStart,
      log.timeEnd,
      log.note || '',
      log.isPresentLive ? parseInt(log.isPresentLive) || 0 : 0,
      log.isPresentOnline ? parseInt(log.isPresentOnline) || 0 : 0,
      log.isLeave ? parseInt(log.isLeave) || 0 : 0,
      log.isAbsent ? parseInt(log.isAbsent) || 0 : 0,
      log.isMakeup ? parseInt(log.isMakeup) || 0 : 0,
      log.isOrange ? parseInt(log.isOrange) || 0 : 0,
      log.hours || '',
      log.date || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy'),
      log.roomBranch || ''
    ];
    
    sheet.appendRow(rowData);
    
    try {
      processClassHoursDeduction(log, false);
    } catch (e_deduct) {
      // Don't fail the class logging if deduction fails
    }
    
    logActivity(logUser, 'บันทึกคาบสอน', `วิชา: ${log.subject} ครู: ${log.teacherRegular} ห้อง: ${log.roomBranch}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateClassLog(rowIndex, log, logUser) {
  try {
    const sheet = getDb().getSheetByName('Data Learn');
    if (!sheet) throw new Error('Data Learn sheet not found');
    
    // Read old log values first to revert them
    const rowVals = sheet.getRange(rowIndex, 1, 1, 15).getValues()[0];
    const oldLog = {
      subject: rowVals[0] ? rowVals[0].toString().trim() : '',
      teacherRegular: rowVals[1] ? rowVals[1].toString().trim() : '',
      teacherSub: rowVals[2] ? rowVals[2].toString().trim() : '',
      timeStart: rowVals[3] ? rowVals[3].toString().trim() : '',
      timeEnd: rowVals[4] ? rowVals[4].toString().trim() : '',
      note: rowVals[5] ? rowVals[5].toString().trim() : '',
      isPresentLive: parseInt(rowVals[6]) || 0,
      isPresentOnline: parseInt(rowVals[7]) || 0,
      isLeave: parseInt(rowVals[8]) || 0,
      isAbsent: parseInt(rowVals[9]) || 0,
      isMakeup: parseInt(rowVals[10]) || 0,
      isOrange: parseInt(rowVals[11]) || 0,
      hours: rowVals[12] ? rowVals[12].toString().trim() : '',
      date: cleanSheetDate(rowVals[13]),
      roomBranch: rowVals[14] ? rowVals[14].toString().trim() : ''
    };
    
    try {
      processClassHoursDeduction(oldLog, true); // Revert old class log hours
      processClassHoursDeduction(log, false);   // Deduct new class log hours
    } catch (e_deduct) {
      // Ignore or log
    }
    
    const rowValues = [
      [
        log.subject,
        log.teacherRegular,
        log.teacherSub || '',
        log.timeStart,
        log.timeEnd,
        log.note || '',
        log.isPresentLive ? parseInt(log.isPresentLive) || 0 : 0,
        log.isPresentOnline ? parseInt(log.isPresentOnline) || 0 : 0,
        log.isLeave ? parseInt(log.isLeave) || 0 : 0,
        log.isAbsent ? parseInt(log.isAbsent) || 0 : 0,
        log.isMakeup ? parseInt(log.isMakeup) || 0 : 0,
        log.isOrange ? parseInt(log.isOrange) || 0 : 0,
        log.hours || '',
        log.date,
        log.roomBranch || ''
      ]
    ];
    
    sheet.getRange(rowIndex, 1, 1, 15).setValues(rowValues);
    logActivity(logUser, 'แก้ไขบันทึกคาบสอน', `วิชา: ${log.subject} (แถวที่: ${rowIndex})`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function deleteClassLog(rowIndex, logUser) {
  try {
    const sheet = getDb().getSheetByName('Data Learn');
    if (!sheet) throw new Error('Data Learn sheet not found');
    
    const rowVals = sheet.getRange(rowIndex, 1, 1, 15).getValues()[0];
    const subject = rowVals[0];
    const oldLog = {
      subject: rowVals[0] ? rowVals[0].toString().trim() : '',
      teacherRegular: rowVals[1] ? rowVals[1].toString().trim() : '',
      teacherSub: rowVals[2] ? rowVals[2].toString().trim() : '',
      timeStart: rowVals[3] ? rowVals[3].toString().trim() : '',
      timeEnd: rowVals[4] ? rowVals[4].toString().trim() : '',
      note: rowVals[5] ? rowVals[5].toString().trim() : '',
      isPresentLive: parseInt(rowVals[6]) || 0,
      isPresentOnline: parseInt(rowVals[7]) || 0,
      isLeave: parseInt(rowVals[8]) || 0,
      isAbsent: parseInt(rowVals[9]) || 0,
      isMakeup: parseInt(rowVals[10]) || 0,
      isOrange: parseInt(rowVals[11]) || 0,
      hours: rowVals[12] ? rowVals[12].toString().trim() : '',
      date: cleanSheetDate(rowVals[13]),
      roomBranch: rowVals[14] ? rowVals[14].toString().trim() : ''
    };
    
    try {
      processClassHoursDeduction(oldLog, true); // Revert class log hours
    } catch (e_deduct) {
      // Ignore or log
    }
    
    sheet.deleteRow(rowIndex);
    logActivity(logUser, 'ลบบันทึกคาบสอน', `วิชา: ${subject} (แถวที่: ${rowIndex})`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// Manager Log (Data ผจก.)
// ----------------------------------------------------
function getManagerOTLogs() {
  try {
    const rawData = getSheetRows('Data ผจก.');
    const logs = [];
    
    rawData.forEach((row, idx) => {
      if (idx === 0) return;
      if (!row[0] || row[0] === '0') return;
      
      logs.push({
        managerName: row[0].toString().trim(),
        otIn: row[1] ? row[1].toString().trim() : '',
        otOut: row[2] ? row[2].toString().trim() : '',
        workIn: row[3] ? row[3].toString().trim() : '',
        workOut: row[4] ? row[4].toString().trim() : '',
        otDetail: row[5] ? row[5].toString().trim() : '',
        isPresent: parseInt(row[6]) || 0,
        isAbsent: parseInt(row[8]) || 0,
        otHours: row[10] ? row[10].toString().trim() : '',
        workHours: row[11] ? row[11].toString().trim() : '',
        date: cleanSheetDate(row[12])
      });
    });
    
    return logs;
  } catch (err) {
    return { error: err.message };
  }
}

function addManagerLog(log, logUser) {
  try {
    const sheet = getDb().getSheetByName('Data ผจก.');
    if (!sheet) throw new Error('Data ผจก. sheet not found');
    
    const rowData = [
      log.managerName,
      log.otIn || '',
      log.otOut || '',
      log.workIn || '',
      log.workOut || '',
      log.otDetail || '',
      log.isPresent ? 1 : 0,
      '',
      log.isAbsent ? 1 : 0,
      '',
      log.otHours || '',
      log.workHours || '',
      log.date || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy')
    ];
    
    sheet.appendRow(rowData);
    logActivity(logUser, 'บันทึกเวลาผู้จัดการ', `ผู้จัดการ: ${log.managerName} สถานะ: ${log.isPresent ? 'มาทำงาน' : 'หยุดงาน'}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function debugReadSheetHeaders() {
  const db = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = db.getSheets();
  let targetSheet = null;
  for (let i = 0; i < sheets.length; i++) {
    const name = sheets[i].getName();
    if (name.includes('/') && !name.includes('เดี่ยว') && !name.includes('ย่อย')) {
      targetSheet = sheets[i];
      break;
    }
  }
  
  if (!targetSheet) {
    targetSheet = sheets[0];
  }
  
  const lastCol = targetSheet.getLastColumn();
  const numCols = Math.min(15, lastCol - 70);
  let result = {
    sheetName: targetSheet.getName(),
    headers: []
  };
  
  if (numCols > 0) {
    result.headers = targetSheet.getRange(1, 71, 5, numCols).getValues();
  }
  
  const file = DriveApp.getFileById(db.getId());
  const parent = file.getParents().next();
  const oldFiles = parent.getFilesByName('debug_headers.json');
  while (oldFiles.hasNext()) {
    oldFiles.next().setTrashed(true);
  }
  parent.createFile('debug_headers.json', JSON.stringify(result), MimeType.PLAIN_TEXT);
  return result;
}

function initAllGradeSheets() {
  const db = getDb();
  const grades = ['อนุบาล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];
  const suffixes = ['1', '2', '3'];
  
  // 1. Initialize grade-specific classroom sheets (e.g. ป.1/1)
  grades.forEach(grade => {
    suffixes.forEach(suffix => {
      const name = `${grade}/${suffix}`;
      let sheet = db.getSheetByName(name);
      if (!sheet) {
        sheet = db.insertSheet(name);
      }
      if (sheet.getLastRow() < 5) {
        sheet.clear();
        const headers = [
          'ระดับชั้น',
          'ชื่อ-นามสกุล',
          'ชื่อเล่น',
          'โรงเรียน',
          'ห้องเรียนย่อย',
          'เบอร์ติดต่อ',
          'ชื่อโปรไฟล์ไลน์',
          'ID LINE',
          'สาขาเรียน',
          'สาขาที่เก็บเงิน'
        ];
        const row5 = new Array(70).fill('');
        headers.forEach((h, idx) => {
          row5[idx] = h;
        });
        row5[50] = 'ยอดรวม'; // Col 51
        row5[61] = 'ส่วนลด'; // Col 62
        row5[62] = 'คงเหลือ'; // Col 63
        row5[63] = 'ยอดจ่าย'; // Col 64
        row5[69] = 'รูดบัตร'; // Col 70
        
        sheet.getRange(5, 1, 1, 70).setValues([row5]);
      }
    });
  });
  
  // 2. Initialize private sheets (e.g. เดี่ยว ป.1)
  grades.forEach(grade => {
    const name = `เดี่ยว ${grade}`;
    let sheet = db.getSheetByName(name);
    if (!sheet) {
      sheet = db.insertSheet(name);
    }
    if (sheet.getLastRow() < 11) {
      sheet.clear();
      const headers = [
        'ประเภทคอร์ส',
        'ชื่อ-นามสกุล',
        'ชื่อเล่น',
        'โรงเรียน',
        'ห้อง',
        'เบอร์ติดต่อ',
        'ชื่อไลน์/กลุ่มติดต่อ',
        'ID LINE',
        'เรียน(สาขา)',
        'เก็บเงิน(สาขา)',
        'คอร์สเรียน',
        'หมายเหตุ',
        'ค่าเรียนยกมา',
        'ค่าเรียน',
        'จ่ายมา',
        'คงเหลือ',
        'วันที่ชำระเงิน',
        'ช่องทางชำระเงิน',
        'ผู้รับเงิน',
        'ชั่วโมงเรียน',
        'ชั่วโมงคงเหลือ'
      ];
      sheet.getRange(11, 1, 1, 21).setValues([headers]);
    }
  });
  
  // 3. Initialize subgroup sheets (e.g. ย่อย 2-3)
  const subgroups = ['ย่อย 2-3', 'ย่อย 4-5', 'ย่อย 6-10'];
  subgroups.forEach(name => {
    let sheet = db.getSheetByName(name);
    if (!sheet) {
      sheet = db.insertSheet(name);
    }
    if (sheet.getLastRow() < 11) {
      sheet.clear();
      const headers = [
        'ประเภทคอร์ส',
        'ชื่อ-นามสกุล',
        'ชื่อเล่น',
        'โรงเรียน',
        'ห้อง',
        'เบอร์ติดต่อ',
        'ชื่อไลน์/กลุ่มติดต่อ',
        'ID LINE',
        'เรียน(สาขา)',
        'เก็บเงิน(สาขา)',
        'คอร์สเรียน',
        'หมายเหตุ',
        'ค่าเรียนยกมา',
        'ค่าเรียน',
        'จ่ายมา',
        'คงเหลือ',
        'วันที่ชำระเงิน',
        'ช่องทางชำระเงิน',
        'ผู้รับเงิน',
        'ชั่วโมงเรียน',
        'ชั่วโมงคงเหลือ'
      ];
      sheet.getRange(11, 1, 1, 21).setValues([headers]);
    }
  });
}

// ----------------------------------------------------
// Version 53.8 New Backend Helpers
// ----------------------------------------------------

function parseHoursLeftToMinutes(str) {
  if (!str) return 0;
  const isNeg = str.indexOf('-') !== -1;
  const matches = str.match(/(\d+)\s*ชม\.\s*(\d+)\s*นาที/);
  if (!matches) {
    const num = parseFloat(str);
    if (isNaN(num)) return 0;
    return num * 60;
  }
  const hrs = parseInt(matches[1], 10) || 0;
  const mins = parseInt(matches[2], 10) || 0;
  const total = hrs * 60 + mins;
  return isNeg ? -total : total;
}

function formatMinutesToHoursLeft(totalMins) {
  const isNeg = totalMins < 0;
  const absMins = Math.abs(totalMins);
  const hrs = Math.floor(absMins / 60);
  const mins = Math.round(absMins % 60);
  return (isNeg ? '-' : '') + hrs + ' ชม. ' + mins + ' นาที';
}

function getNextCourseName(currentName) {
  const matches = currentName.match(/(.+?)(\d+)$/);
  if (matches) {
    const base = matches[1];
    const num = parseInt(matches[2], 10) + 1;
    return base + num;
  }
  return currentName + ' 2';
}

function findTargetSheetNameAndStudent(subject) {
  const grades = ['อนุบาล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];
  let matchedGrade = '';
  
  grades.forEach(g => {
    if (subject.indexOf(g) !== -1) matchedGrade = g;
  });
  
  let sheetName = '';
  if (subject.indexOf('เดี่ยว') !== -1) {
    if (matchedGrade) sheetName = 'เดี่ยว ' + matchedGrade;
  } else if (subject.indexOf('ย่อย') !== -1) {
    if (subject.indexOf('2-3') !== -1) sheetName = 'ย่อย 2-3';
    else if (subject.indexOf('4-5') !== -1) sheetName = 'ย่อย 4-5';
    else if (subject.indexOf('6-10') !== -1) sheetName = 'ย่อย 6-10';
  }
  return { sheetName: sheetName, grade: matchedGrade };
}

function processClassHoursDeduction(log, isDelete) {
  const db = getDb();
  const res = findTargetSheetNameAndStudent(log.subject);
  if (!res.sheetName) return; 
  
  const sheet = db.getSheetByName(res.sheetName);
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 12) return;
  
  const rawData = sheet.getRange(12, 1, lastRow - 11, 21).getValues();
  let matchedIndex = -1;
  let matchedRow = null;
  
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    const nickname = row[2] ? row[2].toString().trim() : '';
    const name = row[1] ? row[1].toString().trim() : '';
    const courseName = row[10] ? row[10].toString().trim() : '';
    
    const nameMatch = (nickname && log.subject.indexOf(nickname) !== -1) || (name && log.subject.indexOf(name) !== -1);
    const courseMatch = courseName && (log.subject.toLowerCase().indexOf(courseName.toLowerCase()) !== -1 || 
                        courseName.toLowerCase().indexOf(log.subject.toLowerCase().replace(/[^a-zA-Z]/g, '')) !== -1);
    
    if (nameMatch && courseMatch) {
      matchedIndex = i + 12;
      matchedRow = row;
      break;
    }
  }
  
  if (matchedIndex === -1) return; 
  
  let classMinutes = 0;
  if (log.hours.indexOf(':') !== -1) {
    const parts = log.hours.split(':');
    classMinutes = (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
  } else {
    classMinutes = parseFloat(log.hours) * 60;
  }
  
  const currentHoursLeftStr = matchedRow[20] ? matchedRow[20].toString().trim() : '';
  const currentMinutes = parseHoursLeftToMinutes(currentHoursLeftStr);
  
  let newMinutes = currentMinutes;
  if (isDelete) {
    newMinutes += classMinutes;
  } else {
    newMinutes -= classMinutes;
  }
  
  const newHoursLeftStr = formatMinutesToHoursLeft(newMinutes);
  sheet.getRange(matchedIndex, 21).setValue(newHoursLeftStr); 
  
  if (!isDelete && newMinutes <= 0) {
    const classType = matchedRow[0] ? matchedRow[0].toString().trim() : '';
    const name = matchedRow[1] ? matchedRow[1].toString().trim() : '';
    const nickname = matchedRow[2] ? matchedRow[2].toString().trim() : '';
    const school = matchedRow[3] ? matchedRow[3].toString().trim() : '';
    const classSection = matchedRow[4] ? matchedRow[4].toString().trim() : '';
    const contact = matchedRow[5] ? matchedRow[5].toString().trim() : '';
    const lineName = matchedRow[6] ? matchedRow[6].toString().trim() : '';
    const lineId = matchedRow[7] ? matchedRow[7].toString().trim() : '';
    const branchLearn = matchedRow[8] ? matchedRow[8].toString().trim() : '';
    const branchPay = matchedRow[9] ? matchedRow[9].toString().trim() : '';
    const courseName = matchedRow[10] ? matchedRow[10].toString().trim() : '';
    
    const nextCourseName = getNextCourseName(courseName);
    
    let nextCoursePrice = 2000;
    let nextHoursStr = '08:00';
    if (res.sheetName.indexOf('เดี่ยว') !== -1) {
      const isEx = nextCourseName.toLowerCase().trim().endsWith('ex');
      if (['ม.4', 'ม.5', 'ม.6'].indexOf(res.grade) !== -1 || isEx) {
        nextCoursePrice = 2500;
      } else {
        nextCoursePrice = 2000;
      }
      nextHoursStr = '08:00';
    } else {
      nextHoursStr = '16:00';
      if (res.sheetName.indexOf('2-3') !== -1) nextCoursePrice = 3000;
      else if (res.sheetName.indexOf('4-5') !== -1) nextCoursePrice = 2500;
      else if (res.sheetName.indexOf('6-10') !== -1) nextCoursePrice = 2000;
    }
    
    const previousFull = parseFloat(matchedRow[13]) || 0;
    const previousPaid = parseFloat(matchedRow[14]) || 0;
    const previousCarried = parseFloat(matchedRow[12]) || 0;
    const previousOutstanding = previousFull - previousPaid - previousCarried;
    
    const newCarriedForward = -previousOutstanding;
    const newOutstanding = nextCoursePrice - newCarriedForward; 
    
    const defaultMins = res.sheetName.indexOf('เดี่ยว') !== -1 ? 8 * 60 : 16 * 60;
    const newCourseMinutes = defaultMins + newMinutes;
    const newCourseHoursLeftStr = formatMinutesToHoursLeft(newCourseMinutes);
    
    const nextRow = [
      classType,
      name,
      nickname,
      school,
      classSection,
      contact,
      lineName,
      lineId,
      branchLearn,
      branchPay,
      nextCourseName,
      '', 
      newCarriedForward,
      nextCoursePrice,
      0, 
      newOutstanding,
      '', 
      '', 
      '', 
      nextHoursStr,
      newCourseHoursLeftStr
    ];
    sheet.appendRow(nextRow);
    
    sheet.getRange(matchedIndex, 12).setValue('เรียนครบแล้ว (ต่อคอร์สใหม่: ' + nextCourseName + ')'); 
    
    syncStudentToStatusDB({
      name: name,
      nickname: nickname,
      school: school,
      contact: contact,
      branchLearn: branchLearn,
      branchPay: branchPay,
      full: nextCoursePrice,
      paid: 0,
      outstanding: newOutstanding,
      carriedForwardFee: newCarriedForward,
      grade: res.grade || 'อนุบาล',
      classSection: classSection,
      lineName: lineName,
      lineId: lineId,
      classHours: nextHoursStr,
      classHoursLeft: newCourseHoursLeftStr,
      classType: classType,
      round: nextCourseName
    });
  } else {
    const outstanding = parseFloat(matchedRow[15]) || 0;
    const carriedForward = parseFloat(matchedRow[12]) || 0;
    syncStudentToStatusDB({
      name: matchedRow[1] ? matchedRow[1].toString().trim() : '',
      nickname: matchedRow[2] ? matchedRow[2].toString().trim() : '',
      school: matchedRow[3] ? matchedRow[3].toString().trim() : '',
      contact: matchedRow[5] ? matchedRow[5].toString().trim() : '',
      branchLearn: matchedRow[8] ? matchedRow[8].toString().trim() : '',
      branchPay: matchedRow[9] ? matchedRow[9].toString().trim() : '',
      full: parseFloat(matchedRow[13]) || 0,
      paid: parseFloat(matchedRow[14]) || 0,
      outstanding: outstanding,
      carriedForwardFee: carriedForward,
      grade: res.grade || 'อนุบาล',
      classSection: matchedRow[4] ? matchedRow[4].toString().trim() : '',
      lineName: matchedRow[6] ? matchedRow[6].toString().trim() : '',
      lineId: matchedRow[7] ? matchedRow[7].toString().trim() : '',
      classHours: matchedRow[19] ? matchedRow[19].toString().trim() : '',
      classHoursLeft: newHoursLeftStr,
      classType: matchedRow[0] ? matchedRow[0].toString().trim() : '',
      round: matchedRow[10] ? matchedRow[10].toString().trim() : ''
    });
  }
}

function addMultipleClassLogs(logs, logUser) {
  try {
    const sheet = getDb().getSheetByName('Data Learn');
    if (!sheet) throw new Error('Data Learn sheet not found');
    
    const rowsData = logs.map(log => [
      log.subject,
      log.teacherRegular,
      log.teacherSub || '',
      log.timeStart,
      log.timeEnd,
      log.note || '',
      log.isPresentLive ? parseInt(log.isPresentLive, 10) || 0 : 0,
      log.isPresentOnline ? parseInt(log.isPresentOnline, 10) || 0 : 0,
      log.isLeave ? parseInt(log.isLeave, 10) || 0 : 0,
      log.isAbsent ? parseInt(log.isAbsent, 10) || 0 : 0,
      log.isMakeup ? parseInt(log.isMakeup, 10) || 0 : 0,
      log.isOrange ? parseInt(log.isOrange, 10) || 0 : 0,
      log.hours || '',
      log.date || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy'),
      log.roomBranch || ''
    ]);
    
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rowsData.length, 15).setValues(rowsData);
    
    logs.forEach(log => {
      try {
        processClassHoursDeduction(log, false);
      } catch (e_deduct) {}
    });
    
    logActivity(logUser, 'บันทึกคาบสอนหลายรายการ', 'จำนวน: ' + logs.length + ' วิชา: ' + logs[0].subject);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function convertDateToIso(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  const d = parts[0].length < 2 ? '0' + parts[0] : parts[0];
  const m = parts[1].length < 2 ? '0' + parts[1] : parts[1];
  const y = parts[2];
  return y + '-' + m + '-' + d;
}

function getStudentHistoryData(name, nickname) {
  try {
    const db = getDb();
    const statusSheet = db.getSheetByName('StatusDB');
    const allStudents = [];
    if (statusSheet) {
      const data = statusSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const stdName = row[1] ? row[1].toString().trim() : '';
        const stdNick = row[2] ? row[2].toString().trim() : '';
        
        if (stdName === name || (nickname && stdNick === nickname)) {
          allStudents.push({
            id: row[0] ? row[0].toString().trim() : '',
            name: stdName,
            nickname: stdNick,
            courseName: row[15] ? row[15].toString().trim() : '',
            carriedForward: parseFloat(row[20]) || 0,
            full: parseFloat(row[10]) || 0,
            paid: parseFloat(row[9]) || 0,
            outstanding: parseFloat(row[11]) || 0,
            paymentDate: row[12] ? row[12].toString().trim() : '',
            paymentChannel: row[13] ? row[13].toString().trim() : '',
            staff: row[14] ? row[14].toString().trim() : '',
            hours: row[21] ? row[21].toString().trim() : '',
            hoursLeft: row[22] ? row[22].toString().trim() : '',
            classType: row[23] ? row[23].toString().trim() : ''
          });
        }
      }
    }
    
    const classSheet = db.getSheetByName('Data Learn');
    const matchedClasses = [];
    if (classSheet) {
      const cData = classSheet.getDataRange().getValues();
      for (let i = 1; i < cData.length; i++) {
        const row = cData[i];
        const subject = row[0] ? row[0].toString().trim() : '';
        
        const nameMatch = (nickname && subject.indexOf(nickname) !== -1) || (name && subject.indexOf(name) !== -1);
        if (nameMatch) {
          matchedClasses.push({
            subject: subject,
            teacherRegular: row[1] ? row[1].toString().trim() : '',
            teacherSub: row[2] ? row[2].toString().trim() : '',
            timeStart: row[3] ? row[3].toString().trim() : '',
            timeEnd: row[4] ? row[4].toString().trim() : '',
            note: row[5] ? row[5].toString().trim() : '',
            isPresentLive: parseInt(row[6], 10) || 0,
            isPresentOnline: parseInt(row[7], 10) || 0,
            isLeave: parseInt(row[8], 10) || 0,
            isAbsent: parseInt(row[9], 10) || 0,
            isMakeup: parseInt(row[10], 10) || 0,
            isOrange: parseInt(row[11], 10) || 0,
            hours: row[12] ? row[12].toString().trim() : '',
            date: cleanSheetDate(row[13]),
            roomBranch: row[14] ? row[14].toString().trim() : '',
            rowIndex: i + 1
          });
        }
      }
    }
    
    matchedClasses.sort((a, b) => {
      const dateA = convertDateToIso(a.date);
      const dateB = convertDateToIso(b.date);
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return b.timeStart.localeCompare(a.timeStart);
    });
    
    return { success: true, courses: allStudents, classes: matchedClasses };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function updateStudentPaymentDetails(id, paymentData, logUser) {
  try {
    const db = getDb();
    const statusSheet = db.getSheetByName('StatusDB');
    if (!statusSheet) throw new Error('StatusDB sheet not found');
    
    const lastRow = statusSheet.getLastRow();
    const range = statusSheet.getRange(1, 1, lastRow, 1).getValues();
    let rowIndex = -1;
    for (let i = 0; i < range.length; i++) {
      if (range[i][0].toString().trim() === id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) throw new Error('ไม่พบรายชื่อนักเรียนในตารางหลัก');
    
    const paidAmount = parseFloat(paymentData.paid) || 0;
    const paymentDate = paymentData.paymentDate || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy');
    const paymentChannel = paymentData.paymentChannel || 'กสิกร บัญชีบริษัท';
    const staff = paymentData.staff || '';
    
    const currentPaid = parseFloat(statusSheet.getRange(rowIndex, 10).getValue()) || 0;
    const full = parseFloat(statusSheet.getRange(rowIndex, 11).getValue()) || 0;
    const carried = parseFloat(statusSheet.getRange(rowIndex, 21).getValue()) || 0;
    
    const newPaid = currentPaid + paidAmount;
    const newOutstanding = full - newPaid - carried;
    
    statusSheet.getRange(rowIndex, 10).setValue(newPaid); 
    statusSheet.getRange(rowIndex, 12).setValue(newOutstanding); 
    statusSheet.getRange(rowIndex, 13).setValue(paymentDate); 
    statusSheet.getRange(rowIndex, 14).setValue(paymentChannel); 
    statusSheet.getRange(rowIndex, 15).setValue(staff); 
    
    const name = statusSheet.getRange(rowIndex, 2).getValue().toString().trim();
    const nickname = statusSheet.getRange(rowIndex, 3).getValue().toString().trim();
    const school = statusSheet.getRange(rowIndex, 4).getValue().toString().trim();
    const contact = statusSheet.getRange(rowIndex, 5).getValue().toString().trim();
    const branchLearn = statusSheet.getRange(rowIndex, 6).getValue().toString().trim();
    const branchPay = statusSheet.getRange(rowIndex, 7).getValue().toString().trim();
    const round = statusSheet.getRange(rowIndex, 16).getValue().toString().trim();
    const grade = statusSheet.getRange(rowIndex, 17).getValue().toString().trim();
    const classSection = statusSheet.getRange(rowIndex, 18).getValue().toString().trim();
    const lineName = statusSheet.getRange(rowIndex, 19).getValue().toString().trim();
    const lineId = statusSheet.getRange(rowIndex, 20).getValue().toString().trim();
    const hours = statusSheet.getRange(rowIndex, 22).getValue().toString().trim();
    const classType = statusSheet.getRange(rowIndex, 24).getValue().toString().trim();
    
    let hoursLeftStr = '';
    if (classType.indexOf('เดี่ยว') !== -1 || classType.indexOf('ย่อย') !== -1) {
      let rate = 250;
      if (round.toLowerCase().indexOf('ex') !== -1) rate = 312.5;
      else if (classType.indexOf('ย่อย 2-3') !== -1) rate = 3000 / 16;
      else if (classType.indexOf('ย่อย 4-5') !== -1) rate = 2500 / 16;
      else if (classType.indexOf('ย่อย 6-10') !== -1) rate = 2000 / 16;
      
      let minutes = 0;
      if (hours.indexOf(':') !== -1) {
        const parts = hours.split(':');
        minutes = (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
      }
      
      const calcFull = (minutes * rate) / 60;
      const netOutstanding = (newPaid + carried) - calcFull;
      const totalHrs = netOutstanding / rate;
      
      const formattedHrs = Math.floor(Math.abs(totalHrs)) + ' ชม. ' + Math.round(Math.abs(totalHrs) % 1 * 60) + ' นาที';
      hoursLeftStr = (netOutstanding < 0 ? '-' : '') + formattedHrs;
      
      statusSheet.getRange(rowIndex, 23).setValue(hoursLeftStr); 
    }
    
    const stdObj = {
      id: id,
      name: name,
      nickname: nickname,
      school: school,
      classSection: classSection,
      contact: contact,
      lineName: lineName,
      lineId: lineId,
      branchLearn: branchLearn,
      branchPay: branchPay,
      round: round,
      full: full,
      paid: newPaid,
      carriedForwardFee: carried,
      paymentDate: paymentDate,
      paymentChannel: paymentChannel,
      staff: staff,
      classHours: hours,
      classHoursLeft: hoursLeftStr,
      classType: classType
    };
    
    syncToGradeSheet(stdObj);
    logActivity(logUser, 'บันทึกชำระเงินค้างจ่าย', `นักเรียน: ${name} ยอดชำระเพิ่ม: ${paidAmount} ยอดจ่ายรวม: ${newPaid}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
