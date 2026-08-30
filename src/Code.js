const SPREADSHEET_ID = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';
const COURSE_START_COL = 20;

function computeCumulativePayment(student) {
  const r1Amt = parseFloat(student.payRound1_amount) || 0;
  const r2Amt = parseFloat(student.payRound2_amount) || 0;
  const r3Amt = parseFloat(student.payRound3_amount) || 0;
  
  student.paid = r1Amt + r2Amt + r3Amt;
  student.outstanding = (student.full || 0) - student.paid - (student.discount || 0);
  
  // Find latest payment info
  if (r3Amt > 0 && student.payRound3_date) {
    student.paymentDate = student.payRound3_date;
    student.paymentChannel = student.payRound3_channel;
    student.staff = student.payRound3_staff;
  } else if (r2Amt > 0 && student.payRound2_date) {
    student.paymentDate = student.payRound2_date;
    student.paymentChannel = student.payRound2_channel;
    student.staff = student.payRound2_staff;
  } else if (r1Amt > 0 && student.payRound1_date) {
    student.paymentDate = student.payRound1_date;
    student.paymentChannel = student.payRound1_channel;
    student.staff = student.payRound1_staff;
  }
}


function doPost(e) {

  try {

    const payload = JSON.parse(e.postData.contents);

    const funcName = payload.functionName;

    const args = payload.arguments || [];

    

    // Dynamically call the requested function using its name

    let result;

    if (typeof this[funcName] === 'function') {

      result = this[funcName].apply(null, args);

    } else {

      throw new Error("Function '" + funcName + "' is not defined in Google Apps Script.");

    }

    

    return ContentService.createTextOutput(JSON.stringify(result))

      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))

      .setMimeType(ContentService.MimeType.JSON);

  }

}

// ============================================================

// SHEET_REGISTRY — ศูนย์กลางนิยามตารางฐานข้อมูลทั้งหมด

// เมื่อต้องการเพิ่มตารางใหม่ ให้เพิ่มรายการที่นี่เท่านั้น

// ระบบจะสร้างชีตพร้อม headers ให้อัตโนมัติทุกครั้งที่ init

// ============================================================

const SHEET_REGISTRY = [

  {
    name: 'UsersDB',
    headers: ['Username', 'Password', 'Role', 'Nickname', 'FullName', 'Phone', 'ProfilePic', 'School', 'Subjects', 'Bank', 'AccountNumber', 'Compensation', 'AccountType'],
    headerRow: 1,
    defaultData: [
      ['admin', '1234', 'Administrator', '', '', '', ''],
      ['staff', '1234', 'Staff', '', '', '', '']
    ]
  },
  {

    name: 'RoomsDB',

    headers: ['Branch', 'RoomName', 'IPAD', 'Zoom'],

    headerRow: 1

  },

  {

    name: 'ActivityLog',

    headers: ['Timestamp', 'User', 'Action', 'Details'],

    headerRow: 1

  },

  {

    name: 'StatusDB',

    headers: [

      'ID', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'โรงเรียน', 'เบอร์ติดต่อ',
      'สาขาเรียน', 'สาขาที่เก็บเงิน', 'หมายเหตุเวลาจ่ายเงิน', 'หมายเหตุเพิ่มเติม',
      'ยอดจ่ายมา', 'ค่าเรียน', 'คงเหลือ', 'วันที่ชำระเงิน', 'ช่องทางชำระเงิน',
      'ผู้รับเงิน', 'รอบการเรียน', 'ระดับชั้น', 'ห้องเรียนย่อย', 'ชื่อไลน์โปรไฟล์',
      'ID LINE', 'ค่าเรียนยกมา', 'ชั่วโมงเรียน', 'ชั่วโมงคงเหลือ', 'ประเภทคลาส',
      'วันที่ชำระงวด 1', 'ยอดเงินงวด 1', 'ช่องทางงวด 1', 'ผู้รับเงินงวด 1', 'เวลางวด 1',

      'วันที่ชำระงวด 2', 'ยอดเงินงวด 2', 'ช่องทางงวด 2', 'ผู้รับเงินงวด 2', 'เวลางวด 2',

      'วันที่ชำระงวด 3', 'ยอดเงินงวด 3', 'ช่องทางงวด 3', 'ผู้รับเงินงวด 3', 'เวลางวด 3'

    ],

    headerRow: 1

  },

  {

    name: 'DATA General',

    headers: ['รายชื่อครู', 'รายชื่อโรงเรียน'],

    headerRow: 1

  },

  {

    name: 'Data Learn',

    headers: [

      'วิชา', 'ครูประจำ', 'ครูแทน', 'เวลาเริ่ม', 'เวลาจบ',

      'หมายเหตุ', 'สด', 'ออน', 'ลา', 'ขาด',

      'ชด', 'ชม.', 'วันที่', 'ห้อง/สาขา/iPad'

    ],

    headerRow: 1

  },

  {

    name: 'EvaluationsDB',

    headers: [

      'EvalID', 'Timestamp', 'StudentName', 'Nickname', 'Grade', 'Branch',

      'Date', 'Subject', 'Teacher', 'ScoresJSON',

      'Strengths', 'Improvements', 'Recommendations', 'EvaluatedBy'

    ],

    headerRow: 1

  },

  {

    name: 'ErrorLog',

    headers: ['Timestamp', 'Function', 'Message', 'Stack'],

    headerRow: 1

  },

  {

    name: 'Data ผจก.',

    headers: [

      'ชื่อผู้จัดการ', 'เวลาเข้าOT', 'เวลาออกOT', 'เวลาเข้างาน', 'เวลาออกงาน',

      'หมายเหตุ รายละเอียด OT', 'มา', 'หยุด', 'ชม.OT', 'ชม.งาน', 'วันที่',

      'Latitude', 'Longitude'

    ],

    headerRow: 1

  },

  {

    name: 'TeacherSalaryConfirmations',

    headers: ['Year', 'Month', 'TeacherID', 'TeacherName', 'TotalPay', 'ConfirmedAt'],

    headerRow: 1

  },

  {

    name: 'TeacherAdjustmentsDB',

    headers: ['ID', 'Timestamp', 'Teacher', 'Month', 'Year', 'Type', 'Amount', 'Note'],

    headerRow: 1

  },

  {

    name: 'InsuranceTrackingDB',

    headers: ['Teacher', 'Year', 'Month', 'Amount', 'RunningTotal', 'Timestamp'],

    headerRow: 1

  }

  // ✅ เพิ่มตารางใหม่ได้ที่นี่ — ระบบจะสร้างชีตและ headers ให้อัตโนมัติ

  // ตัวอย่าง:

  // {

  //   name: 'NewTableDB',

  //   headers: ['Col1', 'Col2', 'Col3'],

  //   headerRow: 1,

  //   defaultData: [['row1col1', 'row1col2', 'row1col3']]  // optional seed data

  // }

];

/**

 * ensureAllRegisteredSheets()

 * วนตรวจสอบ SHEET_REGISTRY ทุกรายการ

 * ถ้าชีตยังไม่มี → สร้างใหม่พร้อม headers และ defaultData (ถ้ามี)

 * ถ้าชีตมีอยู่แล้วแต่ยังไม่มี headers → เติม headers ให้

 */

function ensureAllRegisteredSheets() {

  const db = getDb();

  let createdCount = 0;

  

  SHEET_REGISTRY.forEach(function(def) {

    let sheet = db.getSheetByName(def.name);

    const hRow = def.headerRow || 1;

    

    if (!sheet) {

      // สร้างชีตใหม่

      sheet = db.insertSheet(def.name);

      sheet.getRange(hRow, 1, 1, def.headers.length).setValues([def.headers]);

      

      // เติมข้อมูลเริ่มต้น (ถ้ามี)

      if (def.defaultData && def.defaultData.length > 0) {

        sheet.getRange(hRow + 1, 1, def.defaultData.length, def.defaultData[0].length)

          .setValues(def.defaultData);

      }

      

      createdCount++;

      Logger.log('✅ Auto-created sheet: ' + def.name + ' with ' + def.headers.length + ' columns');

    } else {

      // ชีตมีอยู่แล้ว ตรวจสอบว่ามี headers หรือยัง

      if (sheet.getLastRow() < hRow) {

        sheet.getRange(hRow, 1, 1, def.headers.length).setValues([def.headers]);

        Logger.log('📋 Added headers to existing sheet: ' + def.name);

      }

    }

  });

  

  if (createdCount > 0) {

    Logger.log('🆕 Auto-created ' + createdCount + ' new sheet(s) from SHEET_REGISTRY');

  }

  

  return createdCount;

}

/**

 * getRegistryDef(sheetName)

 * ค้นหานิยามของชีตจาก SHEET_REGISTRY

 */

function getRegistryDef(sheetName) {

  for (let i = 0; i < SHEET_REGISTRY.length; i++) {

    if (SHEET_REGISTRY[i].name === sheetName) return SHEET_REGISTRY[i];

  }

  return null;

}

function doGet(e) {
  if (e && e.parameter && e.parameter.test == '1') {
    var res = getStudentData("ด.ช.ปัณณวิชญ์ พลบำรุง");
    var allSt = getStudentsListRaw();
    var match = allSt.find(s => s.name && s.name.includes("ปัณณวิชญ์"));
    var gradeSheets = db.getSheets().map(s => s.getName()).filter(n => n.includes('ม.1/2'));
    var sheet = db.getSheetByName('ม.1/2');
    var lastCol = sheet ? sheet.getLastColumn() : -1;
    return ContentService.createTextOutput(JSON.stringify({
      res: res,
      match: match,
      sheets: gradeSheets,
      lastCol: lastCol
    }));
  }


  if (e.parameter && e.parameter.export === 'true') {

    return ContentService.createTextOutput(exportAllDataToJson()).setMimeType(ContentService.MimeType.JSON);

  }

  if (e && e.parameter && e.parameter.clean_garbage === '1') {

    cleanDataLearnColAGarbage();

    return ContentService.createTextOutput("Garbage cleaned and cache cleared.").setMimeType(ContentService.MimeType.TEXT);

  }

if (e && e.parameter && e.parameter.debug_headers === '1') {

  const db = getDb();

  const s1 = db.getSheetByName('เดี่ยว ป.1');

  const s2 = db.getSheetByName('ป.1/1');

  return ContentService.createTextOutput(JSON.stringify({

    privateHeaders: s1 ? s1.getRange(11,1,1,s1.getLastColumn()).getValues()[0] : null,

    groupHeaders: s2 ? s2.getRange(5,1,1,s2.getLastColumn()).getValues()[0] : null

  })).setMimeType(ContentService.MimeType.JSON);

}

if (e && e.parameter && e.parameter.fix_logs === '1') {

    try {

      const res = fixHistoricalActivityLogs();

      return ContentService.createTextOutput(JSON.stringify(res))

        .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {

      return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))

        .setMimeType(ContentService.MimeType.JSON);

    }

  }

  if (e && e.parameter && e.parameter.debug_nada === '1') {

    debugSearchNada();

    return ContentService.createTextOutput(Logger.getLog())

      .setMimeType(ContentService.MimeType.TEXT);

  }

  if (e && e.parameter && e.parameter.debug_salary === '1') {

    try {

      const teacher = e.parameter.teacher || 'tutor_0001';

      const year = parseInt(e.parameter.year) || 2026;

      const res = calculateTeacherYearlyPay(teacher, year, 'System');

      return ContentService.createTextOutput(JSON.stringify(res))

        .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {

      return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))

        .setMimeType(ContentService.MimeType.JSON);

    }

  }

  if (e && e.parameter && e.parameter.debug_cols === '1') {

    try {

      const db = SpreadsheetApp.openById(SPREADSHEET_ID);

      const sheets = db.getSheets();

      const results = {};

      

      sheets.forEach(sheet => {

        const name = sheet.getName();

        const lastRow = sheet.getLastRow();

        const lastCol = sheet.getLastColumn();

        

        let headerRowIdx = 1;

        const isClassroom = name.match(/^(.+)\/([1-3])$/);

        if (isClassroom) {

          headerRowIdx = 5;

        } else if (name.includes('เดี่ยว') || name.includes('ย่อย')) {

          headerRowIdx = 11;

        }

        

        let headers = [];

        let missingHeaders = [];

        let emptyCols = [];

        

        if (lastCol > 0 && lastRow >= headerRowIdx) {

          headers = sheet.getRange(headerRowIdx, 1, 1, lastCol).getValues()[0].map(h => h.toString().trim());

          

          for (let col = 1; col <= lastCol; col++) {

            const headerVal = headers[col - 1];

            if (headerVal === '') {

              missingHeaders.push(col);

              

              let isColEmpty = true;

              const values = sheet.getRange(1, col, Math.min(lastRow, 100), 1).getValues();

              for (let r = 0; r < values.length; r++) {

                if (values[r][0] !== '' && values[r][0] !== null && values[r][0] !== undefined) {

                  isColEmpty = false;

                  break;

                }

              }

              if (isColEmpty) {

                emptyCols.push(col);

              }

            }

          }

        }

        

        results[name] = {

          rowCount: lastRow,

          colCount: lastCol,

          headerRow: headerRowIdx,

          headers: headers,

          missingHeaders: missingHeaders,

          emptyCols: emptyCols

        };

      });

      

      return ContentService.createTextOutput(JSON.stringify(results))

        .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {

      return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))

        .setMimeType(ContentService.MimeType.JSON);

    }

  }

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

  if (e && e.parameter && e.parameter.page === 'register') {

    return HtmlService.createTemplateFromFile('Register')

      .evaluate()

      .setTitle('ลงทะเบียนเรียน - บ้านครูปุ๊กปิ๊ก')

      .addMetaTag('viewport', 'width=device-width, initial-scale=1')

      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  }

  return HtmlService.createTemplateFromFile('Index')

    .evaluate()

    .setTitle('ระบบดูแลโรงเรียนกวดวิชาบ้านครูปุ๊กปิ๊ก')

    .addMetaTag('viewport', 'width=device-width, initial-scale=1')

    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

}

function debugDumpDatabase() {

  try {

    const db = getDb();

    const result = { users: [], teachers: [] };

    

    const usersSheet = db.getSheetByName('UsersDB');

    if (usersSheet) {

      const data = usersSheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {

        result.users.push({

          username: data[i][0],

          password: data[i][1],

          role: data[i][2],

          nickname: data[i][3]

        });

      }

    }



    

    const file = DriveApp.getFileById(db.getId());

    const parent = file.getParents().next();

    const oldFiles = parent.getFilesByName('debug_db_dump.json');

    while (oldFiles.hasNext()) {

      oldFiles.next().setTrashed(true);

    }

    parent.createFile('debug_db_dump.json', JSON.stringify(result, null, 2), MimeType.PLAIN_TEXT);

    return "Dump success";

  } catch (e) {

    return "Error: " + e.toString();

  }

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



    // Check Data Learn

    const learnSheet = db.getSheetByName('Data Learn');

    if (!learnSheet) {

      html += '<p style="color:red;"><b>❌ ไม่พบตาราง Data Learn</b></p>';

    } else {

      html += `<p style="color:green;"><b>✓ พบตาราง Data Learn</b> (${learnSheet.getLastRow()} แถว)</p>`;

      if (learnSheet.getLastRow() > 0) {

        const lHeaders = learnSheet.getRange(1, 1, 1, learnSheet.getLastColumn()).getValues()[0];

        html += `<p><b>คอลัมน์ใน Data Learn:</b> ${JSON.stringify(lHeaders)}</p>`;

        if (learnSheet.getLastRow() >= 2) {

          const lRow = learnSheet.getRange(2, 1, 1, learnSheet.getLastColumn()).getValues()[0];

          html += `<p><b>ตัวอย่างข้อมูลตารางเรียนแถวแรก:</b> ${JSON.stringify(lRow)}</p>`;

        }

      }

    }

    // Check ActivityLog Last 20 lines

    const logSheet = db.getSheetByName('ActivityLog');

    if (logSheet) {

      const lastR = logSheet.getLastRow();

      html += `<h3>บันทึกกิจกรรมล่าสุด (ActivityLog - ${lastR} แถว):</h3>`;

      if (lastR > 1) {

        const startR = Math.max(2, lastR - 20);

        const logData = logSheet.getRange(startR, 1, (lastR - startR) + 1, 4).getValues();

        html += '<table border="1" cellpadding="5" style="border-collapse:collapse; width: 100%;">';

        html += '<tr style="background:#eee;"><th>Timestamp</th><th>User</th><th>Action</th><th>Details</th></tr>';

        for (let i = logData.length - 1; i >= 0; i--) {

          html += `<tr><td>${logData[i][0]}</td><td>${logData[i][1]}</td><td>${logData[i][2]}</td><td>${logData[i][3]}</td></tr>`;

        }

        html += '</table>';

      }

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
      .addItem('🔄 อัปเดตชื่อผู้ใช้งานในประวัติย้อนหลัง', 'fixHistoricalActivityLogs')
      .addItem('📥 คัดลอกข้อมูลทุกแผ่นงานไปยังสเปรดชีตใหม่', 'copyAllSheetsFromOldDb')
      .addItem('📥 นำเข้าข้อมูลนักเรียนจากไฟล์ภายนอก', 'importExternalStudentData')
      .addItem('📥 ย้ายข้อมูลจากไฟล์เก่า (Migration)', 'migrateOldDataToNew')
      .addItem('🔄 ซิงค์ข้อมูลย้อนหลังทั้งหมด (แก้ปัญหาข้อมูล 0)', 'syncMissingStudentsToStatusDB')
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

    'คุณต้องการคัดลอกแผ่นงานทั้งหมดจากสเปรดชีตเก่าไปสเปรดชีตใหม่หรือไม่? (หากมทีแผ่นงานชื่อซ้ำในไฟล์ใหม่จะถูกเขียนทับ)',

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

function importExternalStudentData() {

  const sourceId = '1WUybURcf7qtEcxc-lsMKrx4DNqE6xGL19kncsXHp6t0';

  const targetId = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';

  

  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(

    'ยืนยันการนำเข้าข้อมูลนักเรียน',

    'คุณต้องการดึงข้อมูลนักเรียนจากไฟล์ภายนอกมาจัดเรียงใส่ในฐานข้อมูลนี้หรือไม่?\n(ข้อมูลเดิมในแต่ละชีตห้องเรียนจะถูกเขียนทับ)',

    ui.ButtonSet.YES_NO

  );

  

  if (response !== ui.Button.YES) {

    return;

  }

  

  try {

    const sourceDb = SpreadsheetApp.openById(sourceId);

    const targetDb = SpreadsheetApp.openById(targetId);

    const sourceSheets = sourceDb.getSheets();

    

    let importedCount = 0;

    

    sourceSheets.forEach(sourceSheet => {

      const sourceName = sourceSheet.getName();

      let targetName = null;

      

      // Determine if this is a sheet we want to copy and map it if necessary

      if (sourceName.indexOf('เดี่ยว ') === 0 || sourceName.indexOf('ย่อย ') === 0) {

        targetName = sourceName;

      } else {

        // Classroom sheet e.g. ป.11 -> ป.1/1

        const m = sourceName.match(/^([ปม]\.[1-6])([1-3])$/);

        if (m) {

          targetName = m[1] + '/' + m[2];

        }

      }

      

      if (!targetName) return; // Skip sheets that are not part of student databases

      

      const lastRow = sourceSheet.getLastRow();

      const lastCol = sourceSheet.getLastColumn();

      

      // We check where data starts:

      // Private sheets: headers at 11, data starts at 12

      // Classroom sheets: headers at 6, data starts at 7 (for source), but target classroom starts data at 6

      const isPrivate = (targetName.indexOf('เดี่ยว ') === 0 || targetName.indexOf('ย่อย ') === 0);

      const startRow = isPrivate ? 12 : 7;

      

      if (lastRow < startRow) return; // No data rows to copy

      

      let targetSheet = targetDb.getSheetByName(targetName);

      if (!targetSheet) {

        targetSheet = getOrCreateSheet(targetName);

      }

      

      // Clear target data starting from data row

      const targetStartRow = isPrivate ? 12 : 6;

      const targetLastRow = targetSheet.getLastRow();

      if (targetLastRow >= targetStartRow) {

        const numRowsToClear = targetLastRow - targetStartRow + 1;

        targetSheet.getRange(targetStartRow, 1, numRowsToClear, 21).clearContent();

      }

      

      // Fetch source data rows

      const sourceRange = sourceSheet.getRange(startRow, 1, lastRow - startRow + 1, Math.max(lastCol, 21));

      const rawValues = sourceRange.getValues();

      

      if (isPrivate) {

        // Private sheets: copy 21 columns directly

        const cleanValues = rawValues.map(row => {

          const newRow = new Array(21).fill('');

          for (let i = 0; i < 21; i++) {

            newRow[i] = row[i] !== undefined ? row[i] : '';

          }

          return newRow;

        });

        targetSheet.getRange(12, 1, cleanValues.length, 21).setValues(cleanValues);

      } else {

        // Classroom sheets: map 21 columns to 15 columns

        const mappedValues = rawValues.map(row => {

          const newRow = new Array(15).fill('');

          newRow[0] = row[0] !== undefined ? row[0] : '';   // ระดับชั้น (ชั้นเรียน)

          newRow[1] = row[1] !== undefined ? row[1] : '';   // ชื่อ-นามสกุล

          newRow[2] = row[2] !== undefined ? row[2] : '';   // ชื่อเล่น

          newRow[3] = row[3] !== undefined ? row[3] : '';   // โรงเรียน

          newRow[4] = row[4] !== undefined ? row[4] : '';   // ห้องเรียนย่อย (ห้อง)

          newRow[5] = row[5] !== undefined ? row[5] : '';   // เบอร์ติดต่อ (เบอร์)

          newRow[6] = row[6] !== undefined ? row[6] : '';   // ชื่อโปรไฟล์ไลน์ (ชื่อไลน์/กลุ่มติดต่อ)

          newRow[7] = row[7] !== undefined ? row[7] : '';   // ID LINE (ID Line)

          newRow[8] = row[8] !== undefined ? row[8] : '';   // สาขาเรียน (เรียน)

          newRow[9] = row[9] !== undefined ? row[9] : '';   // สาขาที่เก็บเงิน (เก็บเงิน)

          newRow[10] = row[12] !== undefined ? row[12] : ''; // ยอดชำระ/ยอดรวม (ยอดเต็ม)

          newRow[11] = row[11] !== undefined ? row[11] : ''; // ส่วนลด (ส่วนลด)

          newRow[12] = row[14] !== undefined ? row[14] : ''; // รอบ/คงเหลือ (คงเหลือ)

          newRow[13] = row[13] !== undefined ? row[13] : ''; // ยอดเรียนคงเหลือ/ยอดจ่าย (จ่ายมา)

          newRow[14] = row[15] !== undefined ? row[15] : ''; // รหัสบัตร/รูดบัตร (วัน/เดือน/ปี)

          return newRow;

        });

        targetSheet.getRange(6, 1, mappedValues.length, 15).setValues(mappedValues);

      }

      importedCount++;

    });

    

    ui.alert('นำเข้าข้อมูลสำเร็จ', 'ดึงข้อมูลและจัดเรียงเข้าสู่ฐานข้อมูลสำเร็จจำนวน ' + importedCount + ' แผ่นงานเรียบร้อยแล้ว!', ui.ButtonSet.OK);

  } catch (err) {

    ui.alert('ข้อผิดพลาด', 'ไม่สามารถนำเข้าข้อมูลได้: ' + err.toString(), ui.ButtonSet.OK);

  }

}

let cachedDb_ = null;

function getDb() {

  if (!cachedDb_) {

    cachedDb_ = SpreadsheetApp.openById(SPREADSHEET_ID);

  }

  return cachedDb_;

}

function migrateSheetIfNeeded(sheet, sheetName) {
  const groupPattern = /^(อนุบาล|ป\.1|ป\.2|ป\.3|ป\.4|ป\.5|ป\.6|ม\.1|ม\.2|ม\.3|ม\.4|ม\.5|ม\.6)\/(1|2|3)$/;
  const singlePattern = /^(เดี่ยว|ย่อย) (อนุบาล|ป\.1|ป\.2|ป\.3|ป\.4|ป\.5|ป\.6|ม\.1|ม\.2|ม\.3|ม\.4|ม\.5|ม\.6|2-3|4-5|6-10)$/;
  const isStatusDB = sheetName === 'StatusDB';
  
  const isGroup = groupPattern.test(sheetName);
  const isSingle = singlePattern.test(sheetName);
  
  if (!isGroup && !isSingle && !isStatusDB) return;
  
  if (isStatusDB) {
    const lastCol = sheet.getLastColumn();
    let col26Header = "";
    if (lastCol >= 26) {
      col26Header = sheet.getRange(1, 26).getValue().toString().trim();
    }
    
    if (col26Header !== "วันที่ชำระงวด 1") {
      if (lastCol >= 26) {
        sheet.insertColumnsBefore(26, 15);
      }
      sheet.getRange(1, 26, 1, 15).setValues([[
        'วันที่ชำระงวด 1', 'ยอดเงินงวด 1', 'ช่องทางงวด 1', 'ผู้รับเงินงวด 1', 'เวลางวด 1',
        'วันที่ชำระงวด 2', 'ยอดเงินงวด 2', 'ช่องทางงวด 2', 'ผู้รับเงินงวด 2', 'เวลางวด 2',
        'วันที่ชำระงวด 3', 'ยอดเงินงวด 3', 'ช่องทางงวด 3', 'ผู้รับเงินงวด 3', 'เวลางวด 3'
      ]]);
      Logger.log(`Migrated sheet StatusDB: added 15 installment columns starting at column 26`);
    }
    return;
  }
  
  const headerRow = isGroup ? 5 : 11;
  const lastCol = sheet.getLastColumn();
  
  let col20Header = "";
  if (lastCol >= 20) {
    col20Header = sheet.getRange(headerRow, 20).getValue().toString().trim();
  }
  
  if (col20Header !== "วันที่ชำระงวด 1") {
    if (lastCol >= 20) {
      sheet.insertColumnsBefore(20, 15);
    }
    
    const installmentHeaders = [
      'วันที่ชำระงวด 1', 'ยอดเงินงวด 1', 'ช่องทางงวด 1', 'ผู้รับเงินงวด 1', 'เวลางวด 1',
      'วันที่ชำระงวด 2', 'ยอดเงินงวด 2', 'ช่องทางงวด 2', 'ผู้รับเงินงวด 2', 'เวลางวด 2',
      'วันที่ชำระงวด 3', 'ยอดเงินงวด 3', 'ช่องทางงวด 3', 'ผู้รับเงินงวด 3', 'เวลางวด 3'
    ];
    
    sheet.getRange(headerRow, COURSE_START_COL, 1, 15).setValues([installmentHeaders]);
    
    if (isGroup) {
      sheet.getRange(1, COURSE_START_COL, 4, 15).clearContent();
    }
    
    Logger.log(`Migrated sheet ${sheetName}: added 15 installment columns starting at column 20`);
  }
}

function migrateAllSheetsIfNeeded() {
  const props = PropertiesService.getScriptProperties();
  // force run migration once
  if (props.getProperty('migration_completed_v3') === 'true') return;
  migrateAllSheets();
  props.setProperty('migration_completed_v3', 'true');
  return;
  
  migrateAllSheets();
  props.setProperty('migration_completed_v2', 'true');
}

function migrateAllSheets() {
  const db = getDb();
  const sheets = db.getSheets();
  sheets.forEach(sheet => {
    try {
      migrateSheetIfNeeded(sheet, sheet.getName());
    } catch (e) {
      Logger.log(`Error migrating sheet ${sheet.getName()}: ${e.message}`);
    }
  });
}

// Automatically create sheet and headers if it doesn't exist

function getOrCreateSheet(sheetName) {

  const db = getDb();

  let sheet = db.getSheetByName(sheetName);

  if (sheet) {
    migrateSheetIfNeeded(sheet, sheetName);
    return sheet;
  }

  

  // 1. Classroom sheets (e.g., "ม.1/1", "อ.3/2")

  const isClassroom = sheetName.match(/^(.+)\/([1-3])$/);

  if (isClassroom) {

    sheet = db.insertSheet(sheetName);

    sheet.clear();

    const headers = ['ระดับชั้น', 'ชื่อ-นามสกุล', 'ชื่อ', 'โรงเรียน', 'ห้องเรียนที่', 'เบอร์ติดต่อ', 'เบอร์ผู้ปกครอง/เบอร์ติดต่อ', 'ID LINE', 'สาขาที่เรียน', 'สาขาที่จ่ายเงิน'];

    const row5 = new Array(18).fill('');

    headers.forEach((h, idx) => { row5[idx] = h; });

    row5[10] = 'ยอดชำระ';

    row5[11] = 'ส่วนลด';

    row5[12] = 'รอบ';

    row5[13] = 'ยอดเรียนคงเหลือ';

    row5[14] = 'รหัสบัตร';

    sheet.getRange(5, 1, 1, 15).setValues([row5]);

    return sheet;

  }

  

  // 2. Private Sheets (e.g., "เดี่ยว อนุบาล", "เดี่ยว ม.1")

  if (sheetName.indexOf('เดี่ยว ') === 0) {

    sheet = db.insertSheet(sheetName);

    sheet.clear();

    const headers = ['ชื่อ', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'โรงเรียน', 'คอร์ส', 'เบอร์ติดต่อ', 'เบอร์ผู้ปกครอง/เบอร์ติดต่อ', 'ID LINE', 'สาขาเรียน(สาขา)', 'สาขาเงิน(สาขา)', 'รอบเรียน', 'หมายเหตุ', 'เรียนจริง(รอบ)', 'เรียน', 'จ่าย', 'คงเหลือ', 'วันที่รับเงิน', 'ช่องทางการรับเงิน', 'ผู้รับเงิน', 'ใบเสร็จ', 'ตรวจสอบ'];

    sheet.getRange(11, 1, 1, 21).setValues([headers]);

    return sheet;

  }

  

  // 3. Subgroup Sheets (e.g., "กลุ่ม 2-3", "กลุ่ม 4-5")

  if (sheetName.indexOf('กลุ่ม ') === 0) {

    sheet = db.insertSheet(sheetName);

    sheet.clear();

    const headers = ['ชื่อ', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'โรงเรียน', 'คอร์ส', 'เบอร์ติดต่อ', 'เบอร์ผู้ปกครอง/เบอร์ติดต่อ', 'ID LINE', 'สาขาเรียน(สาขา)', 'สาขาเงิน(สาขา)', 'รอบเรียน', 'หมายเหตุ', 'เรียนจริง(รอบ)', 'เรียน', 'จ่าย', 'คงเหลือ', 'วันที่รับเงิน', 'ช่องทางการรับเงิน', 'ผู้รับเงิน', 'ใบเสร็จ', 'ตรวจสอบ'];

    sheet.getRange(11, 1, 1, 21).setValues([headers]);

    return sheet;

  }

  

  // 4. ตรวจสอลบจาก SHEET_REGISTRY (fallback สำหรับชีตที่ลงทะเบียนไว้)

  const regDef = getRegistryDef(sheetName);

  if (regDef) {

    sheet = db.insertSheet(sheetName);

    const hRow = regDef.headerRow || 1;

    sheet.getRange(hRow, 1, 1, regDef.headers.length).setValues([regDef.headers]);

    if (regDef.defaultData && regDef.defaultData.length > 0) {

      sheet.getRange(hRow + 1, 1, regDef.defaultData.length, regDef.defaultData[0].length)

        .setValues(regDef.defaultData);

    }

    Logger.log('✅ Auto-created registered sheet: ' + sheetName);

    return sheet;

  }

  

  return sheet;

}

// Helper: Format phone number to xxx-xxx-xxxx

function formatPhoneNumber(phone) {

  if (!phone) return '';

  var str = phone.toString().trim();

  var digits = str.replace(/\D/g, '');

  if (digits.length === 10) {

    return digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);

  }

  if (digits.length === 9) {

    return digits.slice(0, 2) + '-' + digits.slice(2, 5) + '-' + digits.slice(5);

  }

  return str;

}

// Helper: Convert sheet to array of values

function getSheetRows(sheetName) {

  if (sheetValuesCache_[sheetName]) return sheetValuesCache_[sheetName];

  const sheet = getDb().getSheetByName(sheetName);

  if (!sheet) {

    sheetValuesCache_[sheetName] = [];

    return [];

  }

  const lastRow = sheet.getLastRow();

  const lastCol = sheet.getLastColumn();

  if (lastRow === 0 || lastCol === 0) {

    sheetValuesCache_[sheetName] = [];

    return [];

  }

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  sheetValuesCache_[sheetName] = values;

  return values;

}

function cleanSheetDate(val) {

  if (val instanceof Date) {

    if (val.getFullYear() <= 1900) return '';

    return Utilities.formatDate(val, 'Asia/Bangkok', 'dd/MM/yyyy');

  }

  var str = val ? val.toString().trim() : '';

  if (str.indexOf('1899') !== -1 || str.indexOf('1900') !== -1 || str.indexOf('เวลาอินโดจีน') !== -1) {

    return '';

  }

  return str;

}

function cleanSheetTime(val) {

  if (!val) return '';

  if (val instanceof Date) {

    if (val.getFullYear() <= 1900) return '';

    return Utilities.formatDate(val, 'Asia/Bangkok', 'HH:mm');

  }

  var str = val.toString().trim();

  // Strip any "Sat Dec 30 1899..." or GMT strings

  if (str.indexOf('GMT') !== -1 || str.indexOf('1899') !== -1 || str.indexOf('1900') !== -1) {

    try {

      var d = new Date(str);

      if (!isNaN(d.getTime())) {

        if (d.getFullYear() <= 1900) {

          // If it's a default date but has actual time, keep the time

          var hh = ('0' + d.getHours()).slice(-2);

          var mm = ('0' + d.getMinutes()).slice(-2);

          if (hh === '00' && mm === '00') return ''; // ignore completely blank

          return hh + ':' + mm;

        }

        var hh = ('0' + d.getHours()).slice(-2);

        var mm = ('0' + d.getMinutes()).slice(-2);

        return hh + ':' + mm;

      }

    } catch(e) {}

  }

  var m = str.match(/(\d{1,2}):(\d{1,2})/);

  if (m) return ('0' + m[1]).slice(-2) + ':' + ('0' + m[2]).slice(-2);

  return str;

}

function cleanSheetTimestamp(val) {

  if (val instanceof Date) {

    if (val.getFullYear() <= 1900) return '';

    return Utilities.formatDate(val, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');

  }

  const str = val ? val.toString().trim() : '';

  if (str.indexOf('1899') !== -1 || str.indexOf('1900') !== -1 || str.indexOf('เวลาอินโดจีน') !== -1) {

    return '';

  }

  const parsed = Date.parse(str);

  if (!isNaN(parsed) && str.length > 15) {

    const dateObj = new Date(parsed);

    if (dateObj.getFullYear() <= 1900) return '';

    return Utilities.formatDate(dateObj, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');

  }

  return str;

}

var _dataLearnMigrated = false;

function ensureDataLearnMigrated(db) {

  if (_dataLearnMigrated) return;

  var cacheService = CacheService.getScriptCache();

  try {

    if (cacheService.get('data_learn_migrated') === 'true') {

      _dataLearnMigrated = true;

      return;

    }

  } catch (e) {}

  try {

    const learnSheet = db.getSheetByName('Data Learn');

    if (!learnSheet) return;

    const lastCol = learnSheet.getLastColumn();

    if (lastCol >= 11) {

      const headers = learnSheet.getRange(1, 1, 1, lastCol).getValues()[0];

      const headersStr = headers.map(h => h ? h.toString().trim() : '');

      const idxOrange = headersStr.indexOf('แสด');

      if (idxOrange !== -1) {

        learnSheet.deleteColumn(idxOrange + 1);

        Logger.log('Deleted column "แสด" at index ' + (idxOrange + 1));

      }

    }

    _dataLearnMigrated = true;
    try {
      cacheService.put('data_learn_migrated', 'true', 21600); // Cache for 6 hours
    } catch (e) {}

  } catch (e) {

    Logger.log('Error migrating Data Learn (remover): ' + e.message);

  }

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

  

  // ========================================

  // ขั้นตอนที่ 1: สร้างชีตจาก SHEET_REGISTRY อัตโนมัติ

  // (ชีตใหม่ที่เพิ่มใน registry จะถูกสร้างที่นี่)

  // ========================================

  const newCount = ensureAllRegisteredSheets();

  if (newCount > 0) {

    Logger.log('initAllDatabases: auto-created ' + newCount + ' new sheets from registry');

  }

  

  // ========================================

  // ขั้นตอนที่ 2: เติมข้อมูลเริ่มต้นพิเศษ (ที่ไม่ได้อยู่ใน registry)

  // ========================================

  

  // 2a. RoomsDB — เติมห้องเรียนเริ่มต้น

  initRoomsDatabase();

  



  

  // 2c. Data Learn — migration check

  try {

    const learnSheet = db.getSheetByName('Data Learn');

    if (learnSheet && learnSheet.getLastRow() > 1) {

      // ensureDataLearnMigrated(db);

    }

  } catch (e) {

    Logger.log('Data Learn migration error: ' + e.message);

  }

  

  // ========================================

  // ขั้นตอนที่ 3: สร้างชีตระดับชั้น/เดี่ยว/ย่อย

  // ========================================

  initAllGradeSheets();

  

  // ========================================

  // ขั้นตอนที่ 4: Run database migrations

  // ========================================

  try {

    migrateGradeClassroomSheets();

    migrateManagerLogSheet();

    // ensureTeacherIDs();

  } catch (e) {

    Logger.log('Migration error: ' + e.message);

  }

}

// ----------------------------------------------------

// Security & Authentication

// ----------------------------------------------------




function checkTeacherBlock(logUser) {

  if (logUser && isTeacherUser(logUser)) {

    throw new Error('คุณไม่มีสิทธิ์ทำรายการนี้เนื่องจากล็อกอินด้วยบักชีสิทธิ์ครูผู้สอน');

  }

}

function isTeacherUser(username, nickname) {
  const cleanUsername = (username || '').toString().trim().toLowerCase();
  if (cleanUsername === 'admin' || cleanUsername === 'staff') return false;
  if (!cleanUsername) return false;

  try {
    const db = getDb();
    const usersSheet = db.getSheetByName('UsersDB');
    if (usersSheet) {
      const rows = usersSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === cleanUsername) {
          return rows[i][2] && rows[i][2].toString().trim() === 'Teacher';
        }
      }
    }
  } catch (e) {
    Logger.log('Error in isTeacherUser: ' + e.message);
  }
  return false;
}

function verifyLogin(username, password) {
  const db = getDb();
  const cleanUsername = username ? username.toString().trim() : '';
  const cleanUsernameLower = cleanUsername.toLowerCase();
  
  const cleanPassword = password ? password.toString().trim() : '';
  if (!cleanUsername || !cleanPassword) {
    return { success: false, error: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน' };
  }
  
  const sheet = db.getSheetByName('UsersDB');
  if (!sheet) {
    return { success: false, error: 'ไม่พบตารางฐานข้อมูลผู้ใช้งาน UsersDB' };
  }
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    let dbUsername = rows[i][0] !== undefined && rows[i][0] !== null ? rows[i][0].toString().trim() : '';
    let dbPassword = rows[i][1] !== undefined && rows[i][1] !== null ? rows[i][1].toString().trim() : '';
    let role = rows[i][2] !== undefined && rows[i][2] !== null && rows[i][2].toString().trim() !== '' ? rows[i][2].toString().trim() : 'Student';
    let nickname = rows[i][3] !== undefined && rows[i][3] !== null ? rows[i][3].toString().trim() : '';
    let profilePic = rows[i][4] !== undefined && rows[i][4] !== null ? rows[i][4].toString().trim() : '';

    if (dbUsername.toLowerCase() === cleanUsernameLower && dbPassword === cleanPassword) {
      if (isTeacherUser(dbUsername, nickname)) {
        role = 'Teacher';
      }
      logActivity(dbUsername, 'เข้าสู่ระบบ', 'ผู้ใช้งานเข้าสู่ระบบสำเร็จ' + (role === 'Teacher' ? ' (จำกัดสิทธิ์ครูผู้สอน)' : ''));
      return { 
        success: true, 
        user: { 
          username: dbUsername, 
          role: role,
          nickname: nickname,
          profilePic: profilePic
        } 
      };
    }
  }

  return { success: false, error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
}

function changePassword(username, newPassword, logUser) {

  if (logUser && isTeacherUser(logUser) && logUser !== username) {

    throw new Error('คุณไม่มีสิทธิ์เปลี่ยนรหัสผ่านผู้ใช้อื่น');

  }

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

function getUserProfile(username) {
  const db = getDb();
  const cleanUsername = username ? username.toString().trim() : '';
  const cleanUsernameLower = cleanUsername.toLowerCase();
  
  const sheet = db.getSheetByName('UsersDB');
  if (!sheet) {
    return { success: false, error: 'ไม่พบตาราง UsersDB' };
  }
  
  ensureUsersDBHeaders(sheet);
  const rows = sheet.getDataRange().getValues();
  let userRow = null;
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]) {
      const dbUsername = rows[i][0].toString().trim().toLowerCase();
      if (dbUsername === cleanUsernameLower) {
        userRow = rows[i];
        break;
      }
    }
  }
  
  if (!userRow) {
    return { success: false, error: 'ไม่พบข้อมูลผู้ใช้งาน' };
  }
  
  let role = userRow[2] ? userRow[2].toString().trim() : 'Staff';
  let nickname = userRow[3] ? userRow[3].toString().trim() : '';
  
  if (isTeacherUser(userRow[0].toString().trim(), nickname)) {
    role = 'Teacher';
  }
  
  return {
    success: true,
    profile: {
      username: userRow[0].toString().trim(),
      role: role,
      nickname: nickname,
      fullName: userRow[4] ? userRow[4].toString().trim() : '',
      phone: userRow[5] ? userRow[5].toString().trim() : '',
      profilePic: userRow[6] ? userRow[6].toString().trim() : '',
      school: userRow[7] ? userRow[7].toString().trim() : '',
      subjects: userRow[8] ? userRow[8].toString().trim() : '',
      bank: userRow[9] ? userRow[9].toString().trim() : '',
      accountNumber: userRow[10] ? userRow[10].toString().trim() : '',
      compensation: userRow[11] ? userRow[11].toString().trim() : '',
      accountType: userRow[12] ? userRow[12].toString().trim() : 'บัญชีทั่วไป'
    }
  };
}

function saveUserProfile(username, data, logUser) {

  if (logUser && isTeacherUser(logUser) && logUser !== username) {

    throw new Error('คุณไม่มีสิทธิ์แก้ไขประวัติผู้ใช้อื่น');

  }

  const db = getDb();

  const sheet = db.getSheetByName('UsersDB');

  if (!sheet) {

    return { success: false, error: 'ไม่พบตาราง UsersDB' };

  }

  

  ensureUsersDBHeaders(sheet);

  const rows = sheet.getDataRange().getValues();

  const cleanUsername = username ? username.toString().trim().toLowerCase() : '';

  

  for (let i = 1; i < rows.length; i++) {

    if (rows[i][0]) {

      const dbUsername = rows[i][0].toString().trim().toLowerCase();

      if (dbUsername === cleanUsername) {
        const oldNickname = rows[i][3] ? rows[i][3].toString().trim() : '';
        const newNickname = data.nickname ? data.nickname.trim() : oldNickname;
        
        sheet.getRange(i + 1, 4).setValue(newNickname);
        sheet.getRange(i + 1, 5).setValue(data.fullName || '');
        sheet.getRange(i + 1, 6).setValue(data.phone || '');
        if (data.profilePic !== undefined) {
          sheet.getRange(i + 1, 7).setValue(data.profilePic || '');
        }

        if (data.bank !== undefined) sheet.getRange(i + 1, 10).setValue(data.bank);
        if (data.accountNumber !== undefined) sheet.getRange(i + 1, 11).setValue(data.accountNumber);
        if (data.accountType !== undefined) sheet.getRange(i + 1, 13).setValue(data.accountType);
        if (data.school !== undefined) sheet.getRange(i + 1, 8).setValue(data.school);
        if (data.subjects !== undefined) sheet.getRange(i + 1, 9).setValue(data.subjects);

        logActivity(logUser, 'แก้ไขโปรไฟล์', `ผู้ใช้: ${username} แก้ไขข้อมูลโปรไฟล์ของตนเอง`);
        return { success: true };
      }
    }
  }

  return { success: false, error: 'ไม่พบผู้ใช้ที่ต้องการบันทึก' };

}

function addEmployee(data, logUser) {

  try {

    if (!data || !data.username || !data.password) {

      return { success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };

    }

    const db = getDb();

    const sheet = db.getSheetByName('UsersDB');

    if (!sheet) {

      return { success: false, error: 'ไม่พบตาราง UsersDB' };

    }

    ensureUsersDBHeaders(sheet);

    const rows = sheet.getDataRange().getValues();

    const cleanUsername = data.username.toString().trim().toLowerCase();

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === cleanUsername) {

        return { success: false, error: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' };

      }

    }

    sheet.appendRow([

      data.username.toString().trim(),

      data.password.toString().trim(),

      data.role || 'Staff',

      data.nickname || '',

      data.fullName || '',

      data.phone || '',

      ''

    ]);

    clearCacheObject('usersdb_raw');

    logActivity(logUser, 'เพิ่มพนักงาน', `เพิ่มผู้ใช้ใหม่: ${data.username} บทบาท: ${data.role || 'Staff'}`);

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ' };

  }

}

function getEmployeeList(logUser) {

  try {

    const db = getDb();

    const sheet = db.getSheetByName('UsersDB');

    if (!sheet) return [];

    ensureUsersDBHeaders(sheet);

    const rows = sheet.getDataRange().getValues();

    const users = [];

    for (let i = 1; i < rows.length; i++) {

      if (!rows[i][0]) continue;

      users.push({

        username: rows[i][0].toString().trim(),

        role: rows[i][2] ? rows[i][2].toString().trim() : 'Staff',

        nickname: rows[i][3] ? rows[i][3].toString().trim() : '',

        fullName: rows[i][4] ? rows[i][4].toString().trim() : '',

        phone: rows[i][5] ? rows[i][5].toString().trim() : ''

      });

    }

    return users;

  } catch (e) {

    return [];

  }

}

function changeUserPasswordOwn(username, currentPassword, newPassword) {

  const db = getDb();

  const sheet = db.getSheetByName('UsersDB');

  if (!sheet) {

    return { success: false, error: 'ไม่พบตาราง UsersDB' };

  }

  

  const rows = sheet.getDataRange().getValues();

  const cleanUsername = username ? username.toString().trim().toLowerCase() : '';

  

  for (let i = 1; i < rows.length; i++) {

    if (rows[i][0]) {

      const dbUsername = rows[i][0].toString().trim().toLowerCase();

      const dbPassword = rows[i][1].toString().trim();

      

      if (dbUsername === cleanUsername) {

        if (dbPassword !== currentPassword.toString().trim()) {

          return { success: false, error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' };

        }

        sheet.getRange(i + 1, 2).setValue(newPassword.toString().trim());

        logActivity(username, 'เปลี่ยนรหัสผ่านเอง', `ผู้ใช้: ${username} เปลี่ยนรหัสผ่านของตนเองสำเร็จ`);

        return { success: true };

      }

    }

  }

  return { success: false, error: 'ไม่พบข้อมูลผู้ใช้งาน' };

}

function changeEmployeePasswordByAdmin(username, newPassword, logUser) {

  try {

    const db = getDb();

    const sheet = db.getSheetByName('UsersDB');

    if (!sheet) {

      return { success: false, error: 'ไม่พบตาราง UsersDB' };

    }

    const rows = sheet.getDataRange().getValues();

    const cleanUsername = username ? username.toString().trim().toLowerCase() : '';

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0]) {

        const dbUsername = rows[i][0].toString().trim().toLowerCase();

        if (dbUsername === cleanUsername) {

          sheet.getRange(i + 1, 2).setValue(newPassword.toString().trim());

          clearCacheObject('usersdb_raw');

          logActivity(logUser, 'แก้ไขรหัสผ่านพนักงาน', `เปลี่ยนรหัสผ่านพนักงานให้ผู้ใช้: ${username}`);

          return { success: true };

        }

      }

    }

    return { success: false, error: 'ไม่พบพนักงานในระบบ' };

  } catch (e) {

    return { success: false, error: e.message || 'เกิดข้อผิดพลาดในการแก้ไขรหัสผ่าน' };

  }

}

function getUsersDB() {

  try {

    const cached = getCacheObject('usersdb_raw');

    if (cached) return cached;

    

    const db = getDb();

    const sheet = db.getSheetByName('UsersDB');

    if (!sheet || sheet.getLastRow() < 2) return [];

    

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

    setCacheObject('usersdb_raw', data, 300); // cache 5 minutes

    return data;

  } catch (e) {

    Logger.log('getUsersDB error: ' + e.message);

    return [];

  }

}

function ensureUsersDBHeaders(sheet) {

  const lastCol = sheet.getLastColumn();

  let headers = [];

  if (lastCol > 0) {

    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => h.toString().trim());

  }

  const required = ['Username', 'Password', 'Role', 'Nickname', 'FullName', 'Phone', 'ProfilePic', 'School', 'Subjects', 'Bank', 'AccountNumber', 'Compensation', 'AccountType'];

  

  let updated = false;

  for (let i = 0; i < required.length; i++) {

    if (headers[i] !== required[i]) {

      sheet.getRange(1, i + 1).setValue(required[i]);

      updated = true;

    }

  }

  return updated;

}

function resolveUserNickname(db, user) {

  const cleanUser = user ? user.toString().trim() : '';

  if (!cleanUser || cleanUser.toLowerCase() === 'system') return '';

  const cleanUserLower = cleanUser.toLowerCase();

  // 2. Check UsersDB (matching Username)

  const usersSheet = db.getSheetByName('UsersDB');

  if (usersSheet) {

    const usersRows = usersSheet.getDataRange().getValues();

    for (let i = 1; i < usersRows.length; i++) {

      if (usersRows[i][0]) {

        const dbUsername = usersRows[i][0].toString().trim().toLowerCase();

        if (dbUsername === cleanUserLower) {

          const nickname = usersRows[i][3] ? usersRows[i][3].toString().trim() : '';

          const fullName = usersRows[i][4] ? usersRows[i][4].toString().trim() : '';

          return nickname || fullName || usersRows[i][0].toString().trim();

        }

      }

    }

  }

  return cleanUser;

}

function fixHistoricalActivityLogs() {

  try {

    const db = getDb();

    const sheet = db.getSheetByName('ActivityLog');

    if (!sheet) return { success: false, error: 'ActivityLog sheet not found' };

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) return { success: true, message: 'No rows to fix' };

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());

    let nameColIdx = headers.indexOf('Name') + 1;

    if (nameColIdx === 0) {

      sheet.insertColumnBefore(3);

      sheet.getRange(1, 3).setValue('Name');

      nameColIdx = 3;

    }

    const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());

    const values = range.getValues();

    // Cache lookup mapping to optimize speed
    const usersMap = {};

    const usersSheet = db.getSheetByName('UsersDB');

    if (usersSheet) {

      const usersRows = usersSheet.getDataRange().getValues();

      for (let i = 1; i < usersRows.length; i++) {

        if (usersRows[i][0]) {

          const dbUsername = usersRows[i][0].toString().trim().toLowerCase();

          const nickname = usersRows[i][3] ? usersRows[i][3].toString().trim() : '';

          const fullName = usersRows[i][4] ? usersRows[i][4].toString().trim() : '';

          usersMap[dbUsername] = nickname || fullName || usersRows[i][0].toString().trim();

        }

      }

    }

    let updatedCount = 0;

    for (let i = 0; i < values.length; i++) {

      const user = values[i][1] ? values[i][1].toString().trim() : '';

      if (user && user.toLowerCase() !== 'system') {

        const userLower = user.toLowerCase();

        let nickname = '';

        if (teachersMap[userLower]) {

          nickname = teachersMap[userLower];

        } else if (usersMap[userLower]) {

          nickname = usersMap[userLower];

        } else {

          nickname = user;

        }

        values[i][nameColIdx - 1] = nickname;

        updatedCount++;

      } else {

        values[i][nameColIdx - 1] = '';

      }

    }

    const nameRange = sheet.getRange(2, nameColIdx, values.length, 1);

    const nameValues = values.map(row => [row[nameColIdx - 1]]);

    nameRange.setValues(nameValues);

    return { success: true, updatedCount: updatedCount, message: `Successfully updated ${updatedCount} rows` };

  } catch (e) {

    return { success: false, error: e.toString() };

  }

}

function logActivity(user, action, details) {

  try {

    const db = getDb();

    let sheet = db.getSheetByName('ActivityLog');

    if (!sheet) {

      sheet = db.insertSheet('ActivityLog');

      sheet.appendRow(['Timestamp', 'User', 'Name', 'Action', 'Details']);

    } else {

      const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(h => h.toString().trim());

      if (headers.length > 0 && headers.indexOf('Name') === -1) {

        sheet.insertColumnBefore(3);

        sheet.getRange(1, 3).setValue('Name');

      }

    }

    

    const name = resolveUserNickname(db, user);

    const timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');

    sheet.appendRow([timestamp, user || 'System', name || '', action, details || '']);

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function getActivityLogs(logUser) {

  if (logUser) checkTeacherBlock(logUser);

  try {

    const rows = getSheetRows('ActivityLog');

    const logs = [];

    for (let i = rows.length - 1; i >= 1; i--) {

      if (rows[i][0]) {

        let name = '';

        let action = '';

        let details = '';

        

        if (rows[i].length >= 5) {

          name = rows[i][2] ? rows[i][2].toString() : '';

          action = rows[i][3] ? rows[i][3].toString() : '';

          details = rows[i][4] ? rows[i][4].toString() : '';

        } else {

          action = rows[i][2] ? rows[i][2].toString() : '';

          details = rows[i][3] ? rows[i][3].toString() : '';

        }

        

        logs.push({

          timestamp: cleanSheetTimestamp(rows[i][0]),

          user: rows[i][1] ? rows[i][1].toString() : '',

          name: name,

          action: action,

          details: details

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

  const cacheKey = 'rooms_list';

  const cached = getCacheObject(cacheKey);

  if (cached) return cached;

  

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

  

  setCacheObject(cacheKey, rooms, 600); // 10 minutes cache

  return rooms;

}

function updateRoomSettings(branch, roomName, ipad, zoom, logUser) {

  checkTeacherBlock(logUser);

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

    

    clearCacheObject('rooms_list');

    return { success: true };

  } catch (err) {

    return { success: false, error: err.message };

  }

}

function deleteRoom(branch, roomName, logUser) {

  checkTeacherBlock(logUser);

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

      clearCacheObject('rooms_list');

      return { success: true };

    }

    return { success: false, error: 'ไม่พบห้องเรียนที่ต้องการลบ' };

  } catch (err) {

    return { success: false, error: err.message };

  }

}

function testDumpSheet(sheetName) {

  if (sheetName === 'ALL') {

    return getDb().getSheets().map(s => s.getName());

  }

  const sheet = getDb().getSheetByName(sheetName);

  if (!sheet) return "Not found";

  return sheet.getDataRange().getValues().slice(0, 10);

}

// ----------------------------------------------------

// Daily Grid

// ----------------------------------------------------

function getDailyGridData(dateStr, logUser) {

  // ครูสามารถดูตารางเรียนรายห้องเรียนรายวันได้

  try {

    const rooms = getRoomsList();

    const classes = getClassLogs(dateStr);

    

    // Determine dayOfWeek from dateStr (DD/MM/YYYY or YYYY-MM-DD)

    let thaiDay = '';

    try {

      const thaiDayNames = ['วันอาทิตย์','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์'];

      let dt;

      if (dateStr && dateStr.includes('/')) {

        const parts = dateStr.split('/');

        if (parts.length === 3) {

          const day = parseInt(parts[0], 10);

          const month = parseInt(parts[1], 10) - 1;

          const year = parseInt(parts[2], 10);

          dt = new Date(year, month, day);

        }

      } else if (dateStr && dateStr.includes('-')) {

        dt = new Date(dateStr);

      }

      if (dt) thaiDay = thaiDayNames[dt.getDay()] || '';

    } catch(e) {}

    

    // Build classInfoList with subject + dayOfWeek for enrollment counting

    const courseNames = [...new Set(classes.map(c => c.subject).filter(Boolean))];

    const classInfoList = classes.map(c => ({ subject: c.subject, dayOfWeek: thaiDay, timeStart: c.timeStart }));

    

    // CACHE getCourseEnrollmentCounts to significantly speed up loadDailyGrid

    let safeDateStr = 'all';

    if (dateStr) { safeDateStr = dateStr.replace(/[^0-9a-zA-Z]/g, ''); }

    const enrollCacheKey = 'enrollments_date_' + safeDateStr;

    let enrollments = getCacheObject(enrollCacheKey);

    if (!enrollments) {

      enrollments = getCourseEnrollmentCounts(courseNames, classInfoList);

      setCacheObject(enrollCacheKey, enrollments, 300); // cache for 5 minutes

    }

    



    // Determine dynamic indices to pass as debug info
    const dbRaw = getSheetRows('Data Learn');
    const headers = dbRaw ? dbRaw[0] || [] : [];
    let dIdxDate = 12, dIdxRoom = 13, dIdxHrs = 11;
    headers.forEach((h, i) => {
      const hStr = (h || '').toString().trim();
      if (hStr.includes('วันที่')) dIdxDate = i;
      else if (hStr.includes('ห้อง') || hStr.includes('สาขา')) dIdxRoom = i;
      else if (hStr === 'ชม.') dIdxHrs = i;
    });

    return {

      rooms: rooms,

      classes: classes,

      enrollments: enrollments,

      thaiDay: thaiDay,

      debug: { dateIdx: dIdxDate, roomIdx: dIdxRoom, hrsIdx: dIdxHrs, totalHeaders: headers.length, firstClassRaw: classes.length > 0 ? classes[0] : null }

    };

  } catch (err) {

    return { error: err.message };

  }

}

function getCachedSheetEnrollments(sheetName) {

  const cacheKey = 'enroll_map_' + sheetName.replace(/\s+/g, '_');

  const cached = getCacheObject(cacheKey);

  if (cached) return cached;

  

  const db = getDb();

  const sheet = db.getSheetByName(sheetName);

  if (!sheet) return {};

  

  const lastCol = sheet.getLastColumn();

  const lastRow = sheet.getLastRow();

  if (lastCol < 1 || lastRow < 4) return {};

  

  const dataRange = sheet.getDataRange().getValues();

  const headerRow1 = dataRange[0] || [];

  const headerRow3 = dataRange[2] || [];

  

  const map = {};

  for (let colIdx = 0; colIdx < headerRow1.length; colIdx++) {

    const colHeader = headerRow1[colIdx] ? headerRow1[colIdx].toString().trim() : '';

    if (!colHeader) continue;

    

    const dayTimeCell = headerRow3[colIdx] ? headerRow3[colIdx].toString().trim().toLowerCase() : '';

    

    // Parse time/day from headerRow3

    let startHour = null;

    const cleanCell = dayTimeCell.replace(/\s+/g, '');

    const timeMatch = cleanCell.match(/(\d{1,2})[\.:]\d{2}/);

    if (timeMatch) {

      startHour = parseInt(timeMatch[1], 10);

    }

    

    const shortDayMap = { 'อาทิตย์': 'อา.', 'จันทร์': 'จ.', 'อังคาร': 'อ.', 'พุธ': 'พ.', 'พฤหัสบดี': 'พฤ.', 'ศุกร์': 'ศ.', 'เสาร์': 'ส.' };

    let cleanDay = '';

    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

    for (let day of days) {

      if (dayTimeCell.indexOf(day) !== -1) {

        cleanDay = day;

        break;

      }

    }

    

    const key = colHeader.toLowerCase() + '|' + cleanDay + '|' + (startHour !== null ? startHour : '');

    if (!map[key]) map[key] = [];

    

    for (let rIdx = 5; rIdx < dataRange.length; rIdx++) {

      const val = dataRange[rIdx][colIdx];

      const studentName = dataRange[rIdx][1] ? dataRange[rIdx][1].toString().trim() : '';

      if (val !== '' && val !== null && val !== undefined && studentName) {

        if (map[key].indexOf(studentName) === -1) {

          map[key].push(studentName);

        }

      }

    }

  }

  

  setCacheObject(cacheKey, map, 1800); // cache for 30 minutes

  return map;

}

// getCourseEnrollmentCounts: นับจำนวน นร. จากตารางห้องเรียนตามชื่อคอร์ส+วัน

function getCourseEnrollmentCounts(courseNames, classInfoList) {

  try {

    const db = getDb();

    const sheets = db.getSheets();

    const counts = {};

    courseNames.forEach(c => { counts[c] = []; });

    

    const gradeSheetNames = [];

    sheets.forEach(sheet => {

      const name = sheet.getName();

      if (name.match(/^(ป\.|ม\.|อนุบาล)/) || name.match(/^(ย่อย 2-3|ย่อย 4-5|ย่อย 6-10)/)) {

        gradeSheetNames.push(name);

      }

    });

    

    const classSpecs = {};

    if (classInfoList && classInfoList.length > 0) {

      classInfoList.forEach(info => {

        if (!info.subject) return;

        if (!classSpecs[info.subject]) classSpecs[info.subject] = [];

        

        let parsedStartHour = null;

        if (info.timeStart) {

          if (info.timeStart instanceof Date) {

            parsedStartHour = info.timeStart.getHours();

          } else {

            const d = new Date(info.timeStart);

            if (!isNaN(d.getTime())) {

              parsedStartHour = d.getHours();

            } else {

              const timeMatch = info.timeStart.toString().match(/(\d{1,2})[:\.]\d{2}/);

              if (timeMatch) parsedStartHour = parseInt(timeMatch[1], 10);

            }

          }

        }

        classSpecs[info.subject].push({

          dayOfWeek: info.dayOfWeek || "",

          startHour: parsedStartHour

        });

      });

    }

    

    gradeSheetNames.forEach(sheetName => {

      const enrollMap = getCachedSheetEnrollments(sheetName);

      

      courseNames.forEach(cName => {

        const specs = classSpecs[cName] || [];

        if (specs.length === 0) return;

        

        specs.forEach(s => {

          const dl = s.dayOfWeek.toLowerCase().replace('วัน', '');

          const shortDayMap = { 'อาทิตย์': 'อา.', 'จันทร์': 'จ.', 'อังคาร': 'อ.', 'พุธ': 'พ.', 'พฤหัสบดี': 'พฤ.', 'ศุกร์': 'ศ.', 'เสาร์': 'ส.' };

          const shortDay = shortDayMap[dl] || dl;

          

          for (let key in enrollMap) {

            const parts = key.split('|');

            const keyCourse = parts[0];

            const keyDay = parts[1];

            const keyHour = parts[2];

            

            if (keyCourse.indexOf(cName.toLowerCase()) !== -1) {

              const dayOk = dl === '' || keyDay.indexOf(dl) !== -1 || keyDay.indexOf(shortDay) !== -1 || dl.indexOf(keyDay) !== -1;

              const hourOk = s.startHour === null || keyHour === '' || parseInt(keyHour, 10) === s.startHour;

              

              if (dayOk && hourOk) {

                enrollMap[key].forEach(studentName => {

                  if (counts[cName].indexOf(studentName) === -1) {

                    counts[cName].push(studentName);

                  }

                });

              }

            }

          }

        });

      });

    });

    

    return counts;

  } catch (e) {

    Logger.log('Error in getCourseEnrollmentCounts: ' + e.message);

    return {};

  }

}

function clearDailyGridClassroomTimetable(logUser) {

  if (logUser) checkTeacherBlock(logUser);

  try {

    const db = getDb();

    const sheet = db.getSheetByName('Data Learn');

    if (!sheet) throw new Error('Data Learn sheet not found');

    const lastRow = sheet.getLastRow();

    if (lastRow > 1) {

      sheet.deleteRows(2, lastRow - 1);

    }

    // Clear cache

    clearCacheObject('class_logs_date_v3_all');

    logActivity(logUser || 'System', 'ลบตารางเรียนทั้งหมด', 'ล้างข้อมูลตารางเรียนรายห้องเรียนรายวันเพื่อเริ่มงาน');

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function submitEvaluation(data, logUser) {

  try {

    const db = getDb();

    let sheet = db.getSheetByName('EvaluationsDB');

    if (!sheet) {

      sheet = db.insertSheet('EvaluationsDB');

      sheet.appendRow([

        'EvalID', 'Timestamp', 'StudentName', 'Nickname', 'Grade', 'Branch',

        'Date', 'Subject', 'Teacher', 'ScoresJSON',

        'Strengths', 'Improvements', 'Recommendations', 'EvaluatedBy'

      ]);

    } else {

      // Migrate: if first header is not 'EvalID', insert the column

      const firstHeader = sheet.getRange(1, 1).getValue();

      if (firstHeader !== 'EvalID') {

        sheet.insertColumnBefore(1);

        sheet.getRange(1, 1).setValue('EvalID');

        // Backfill existing rows with IDs

        const lastRow = sheet.getLastRow();

        for (let r = 2; r <= lastRow; r++) {

          sheet.getRange(r, 1).setValue('EVAL-' + String(r - 1).padStart(4, '0'));

        }

      }

    }

    

    // Generate next EvalID

    const lastRow = sheet.getLastRow();

    let nextId = 1;

    if (lastRow >= 2) {

      // Read last EvalID and increment

      const lastId = sheet.getRange(lastRow, 1).getValue().toString();

      const numMatch = lastId.match(/EVAL-(\d+)/);

      if (numMatch) {

        nextId = parseInt(numMatch[1]) + 1;

      } else {

        nextId = lastRow; // fallback

      }

    }

    const evalId = 'EVAL-' + String(nextId).padStart(4, '0');

    

    const timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');

    

    // Support either old flat fields or the new structure

    const scoresJSON = data.scores ? JSON.stringify(data.scores) : JSON.stringify({

      attention: data.scoreAttention || '5',

      understanding: data.scoreUnderstanding || '5',

      homework: data.scoreHomework || '5'

    });

    

    let teacherId = logUser || 'System';

    const cleanLogUser = teacherId.toLowerCase();

    try {

      const usersSheet = db.getSheetByName('UsersDB');
      if (usersSheet) {
        const tRows = usersSheet.getDataRange().getValues();
        for (let j = 1; j < tRows.length; j++) {
          const tId = tRows[j][0] ? tRows[j][0].toString().trim() : '';
          const tNick = tRows[j][3] ? tRows[j][3].toString().trim().toLowerCase() : '';
          const tFullName = tRows[j][4] ? tRows[j][4].toString().trim().toLowerCase() : '';
          
          if (tId.toLowerCase() === cleanLogUser || tNick === cleanLogUser || tFullName === cleanLogUser) {
            if (tId) {
              teacherId = tId; // Store actual Teacher ID (e.g. tutor_0002)
              break;
            }
          }
        }
      }

    } catch (e) {

      Logger.log("Error resolving teacher ID on save: " + e.message);

    }

    

    sheet.appendRow([

      evalId,

      timestamp,

      data.studentName || '',

      data.nickname || '',

      data.grade || '',

      data.branch || '',

      data.date || '',

      data.subject || '',

      data.teacher || '',

      scoresJSON,

      data.strengths || '',

      data.improvements || '',

      data.recommendations || data.feedback || '', // fallback

      teacherId

    ]);

    

    clearCacheObject('evaluations_list');

    clearCacheObject('evaluations_list_all');

    logActivity(logUser || 'System', 'ส่งใบประเมินนักเรียน', `[${evalId}] ประเมินนักเรียน: ${data.studentName} (${data.nickname}) วิชา: ${data.subject}`);

    return { success: true, evalId: evalId };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function updateEvaluation(evalData, logUser) {

  try {

    const db = getDb();

    let sheet = db.getSheetByName('EvaluationsDB');

    if (!sheet) {

      return { success: false, error: 'ไม่พบฐานข้อมูล EvaluationsDB' };

    }

    

    const rows = sheet.getDataRange().getValues();

    let rowIndex = -1;

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0] === evalData.evalId) {

        rowIndex = i + 1; // 1-indexed for SpreadsheetApp

        break;

      }

    }

    

    if (rowIndex === -1) {

      return { success: false, error: 'ไม่พบ ID การประเมินในระบบ' };

    }

    

    // Update specific columns (1-indexed)

    // 7 = Date

    // 9 = Teacher

    // 11 = Strengths

    // 12 = Improvements

    // 13 = Recommendations

    sheet.getRange(rowIndex, 7).setValue(evalData.date || sheet.getRange(rowIndex, 7).getValue());

    sheet.getRange(rowIndex, 9).setValue(evalData.teacher);

    sheet.getRange(rowIndex, 11).setValue(evalData.strengths);

    sheet.getRange(rowIndex, 12).setValue(evalData.improvements);

    sheet.getRange(rowIndex, 13).setValue(evalData.comments || evalData.recommendations || '');

    

    // Update scores if provided

    if (evalData.scores) {

      const scoresJSON = JSON.stringify(evalData.scores);

      sheet.getRange(rowIndex, 10).setValue(scoresJSON);

    } else if (evalData.score) {

      const scoresJSON = JSON.stringify({ overall: evalData.score });

      sheet.getRange(rowIndex, 10).setValue(scoresJSON);

    }

    

    clearCacheObject('evaluations_list');

    clearCacheObject('evaluations_list_all');

    // Clear teacher-specific caches too

    try {

      const cache = CacheService.getScriptCache();

      cache.removeAll(['evaluations_list_all']);

    } catch(ce) {}

    

    logActivity(logUser, 'แก้ไขใบประเมิน', `อัปเดตการประเมินนักเรียน: ${rows[rowIndex-1][2]}`);

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function getAdminEvalStats() {

  const evals = getEvaluationsList(null);

  const counts = {};

  try {

    const db = getDb();

    const statusSheet = db.getSheetByName('StatusDB');

    if (statusSheet) {

      const data = statusSheet.getDataRange().getValues();

      const subjects = [...new Set(evals.map(e => e.subject))];

      subjects.forEach(s => counts[s] = 0);

      

      const days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];

      for (let i = 1; i < data.length; i++) {

        const student = data[i][1];

        const course = data[i][15];

        const timeNote = data[i][7];

        if (!student || !course) continue;

        

        subjects.forEach(subj => {

          if (subj.indexOf(course.toString().trim()) !== -1) {

            let subjDay = '';

            days.forEach(d => { if (subj.indexOf(d) !== -1) subjDay = d; });

            let timeDay = '';

            days.forEach(d => { if ((timeNote||'').indexOf(d) !== -1) timeDay = d; });

            

            if (!subjDay || !timeDay || subjDay === timeDay) {

              counts[subj]++;

            }

          }

        });

      }

    }

  } catch (e) {

    Logger.log('Error calculating admin eval stats: ' + e.message);

  }

  return { evals: evals, counts: counts };

}

function getEvaluationsList(logUser) {

  const cacheKey = logUser ? 'evaluations_list_' + logUser : 'evaluations_list_all';

  const cached = getCacheObject(cacheKey);

  if (cached) return cached;

  try {

    const db = getDb();

    const sheet = db.getSheetByName('EvaluationsDB');

    if (!sheet || sheet.getLastRow() < 2) return [];

    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.min(sheet.getLastColumn(), 14)).getValues();

    const list = [];

    const isTeacher = logUser ? isTeacherUser(logUser) : false;

    

    // Only resolve teacher aliases if needed

    let teacherNicknames = null;

    if (isTeacher) {

      const teacherLogId = logUser.toString().trim().toLowerCase();

      teacherNicknames = [teacherLogId];

      try {
        const usersSheet = db.getSheetByName('UsersDB');
        if (usersSheet && usersSheet.getLastRow() > 1) {
          const tRows = usersSheet.getRange(2, 1, usersSheet.getLastRow() - 1, 5).getValues();
          for (let j = 0; j < tRows.length; j++) {
            const tId = (tRows[j][0] || '').toString().trim().toLowerCase();
            const tNick = (tRows[j][3] || '').toString().trim().toLowerCase();
            const tFullName = (tRows[j][4] || '').toString().trim().toLowerCase();
            
            if (tId === teacherLogId || tNick === teacherLogId || tFullName === teacherLogId) {
              if (tId && teacherNicknames.indexOf(tId) === -1) teacherNicknames.push(tId);
              if (tNick && teacherNicknames.indexOf(tNick) === -1) teacherNicknames.push(tNick);
              if (tFullName && teacherNicknames.indexOf(tFullName) === -1) teacherNicknames.push(tFullName);
            }
          }
        }
      } catch (err) {

        Logger.log("Error pre-resolving teacher aliases: " + err.message);

      }

    }

    

    for (let i = 0; i < rows.length; i++) {

      if (!rows[i][0]) continue;

      

    // Teacher filtering: match by evaluatedBy OR by teacher who teaches this subject on this date

    if (teacherNicknames) {

      // Build a set of "subject|date" combinations taught by this teacher from Data Learn

      let teacherSubjectDates = null;

      try {

        const dlSheet = db.getSheetByName('Data Learn');

        if (dlSheet && dlSheet.getLastRow() > 1) {

          teacherSubjectDates = new Set();

          const dlData = dlSheet.getRange(2, 1, dlSheet.getLastRow() - 1, 15).getValues();

          dlData.forEach(dlRow => {

            const dlSubj = (dlRow[0] || '').toString().trim();

            const dlTeacher = (dlRow[1] || '').toString().trim().toLowerCase();

            const dlTeacherSub = (dlRow[2] || '').toString().trim().toLowerCase();

            const dlDate = cleanSheetDate(dlRow[12]);

            const isTeacherMatch = teacherNicknames.some(alias =>

              dlTeacher === alias || dlTeacher.indexOf(alias) !== -1 || alias.indexOf(dlTeacher) !== -1 ||

              dlTeacherSub === alias || dlTeacherSub.indexOf(alias) !== -1 || alias.indexOf(dlTeacherSub) !== -1

            );

            if (isTeacherMatch && dlSubj && dlDate) {

              teacherSubjectDates.add(dlSubj.toLowerCase() + '|' + dlDate);

            }

          });

        }

      } catch(e) {}

      

      const cleanEvalBy = (rows[i][13] || '').toString().trim().toLowerCase();

      const evalSubj = (rows[i][7] || '').toString().trim().toLowerCase();

      const evalDate = cleanSheetDate(rows[i][6]);

      

      let matches = false;

      // Check EvaluatedBy field

      for (let a = 0; a < teacherNicknames.length; a++) {

        const alias = teacherNicknames[a];

        if (cleanEvalBy === alias || cleanEvalBy.indexOf(alias) !== -1 || alias.indexOf(cleanEvalBy) !== -1) {

          matches = true;

          break;

        }

      }

      // Also check if teacher teaches this subject on this date

      if (!matches && teacherSubjectDates && evalSubj && evalDate) {

        const key = evalSubj + '|' + evalDate;

        if (teacherSubjectDates.has(key)) matches = true;

      }

      if (!matches) continue;

    }

      

      let parsedScores = {};

      try {

        parsedScores = JSON.parse(rows[i][9]);

      } catch (err) {

        parsedScores = {

          attention: rows[i][9] || '5',

          understanding: '5',

          homework: '5'

        };

      }

      

      list.push({

        evalId: (rows[i][0] || '').toString(),

        timestamp: rows[i][1],

        studentName: rows[i][2],

        nickname: rows[i][3],

        grade: rows[i][4],

        branch: rows[i][5],

        date: rows[i][6],

        subject: rows[i][7],

        teacher: rows[i][8],

        scores: parsedScores,

        strengths: rows[i][10] || '',

        improvements: rows[i][11] || '',

        recommendations: rows[i][12] || '',

        evaluatedBy: (rows[i][13] || '').toString().trim()

      });

    }

    setCacheObject(cacheKey, list, 300);

    return list;

  } catch (e) {

    return [];

  }

}

/**

 * getMonthlyGridData: ดึงข้อมูลตารางเรียนรายเดือน แยกตามวันในสัปดาห์

 * @param {number} year - ปี ค.ศ. (เช่น 2026)

 * @param {number} month - เดือน 1-12

 * @param {number} dayOfWeek - วันในสัปดาห์ 0=อาทิตย์, 1=จันทร์ ... 6=เสาร์

 * @param {string} logUser - ผู้ใช้งาน

 */

function getMonthlyGridData(year, month, dayOfWeek, logUser) {

  // ครูสามารถดูตารางเรียนรายห้องเรียนรายเดือนได้

  try {

    const rooms = getRoomsList();

    

    // Find all dates in the given month that match dayOfWeek

    const datesInMonth = [];

    const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based, Date(y,m,0) gives last day of prev month

    

    for (let d = 1; d <= daysInMonth; d++) {

      const dt = new Date(year, month - 1, d); // month-1 because Date constructor is 0-based

      if (dt.getDay() === dayOfWeek) {

        datesInMonth.push({

          day: d,

          dateStr: ('0' + d).slice(-2) + '/' + ('0' + month).slice(-2) + '/' + year,

          weekNum: Math.ceil(datesInMonth.length + 1) // sequential week count for this day-of-week

        });

      }

    }

    

    // Re-assign correct week numbers (1st occurrence = week 1, 2nd = week 2, etc.)

    datesInMonth.forEach((item, idx) => {

      item.weekNum = idx + 1;

    });

    

    // Load ALL class logs for the entire month (no date filter)

    // ensureDataLearnMigrated(getDb());

    const rawData = getSheetRows('Data Learn');

    const teachersList = getTeachersDB(null);

    

    const resolveNick = function(nameOrId) {

      if (!nameOrId) return '';

      const cleanVal = nameOrId.toString().trim().toLowerCase();

      const match = teachersList.find(t => {

        const tId = (t.teacherId || '').toLowerCase().trim();

        const tNick = t.nickname.toLowerCase().trim();

        return (tId !== '' && tId === cleanVal) || tNick === cleanVal;

      });

      return match ? match.nickname : nameOrId;

    };

    

    // Build a set of target date strings for quick lookup

    const targetDateSet = {};

    datesInMonth.forEach(item => {

      targetDateSet[item.dateStr] = item.weekNum;

    });

    

    // Parse all class logs and filter by matching dates

    const weeklyClasses = {}; // weekNum -> [classLog, ...]

    datesInMonth.forEach(item => {

      weeklyClasses[item.weekNum] = [];

    });

    

    rawData.forEach((row, idx) => {

      if (idx === 0) return;

      if (!row[0] || row[0] === '0') return;

      

      const dateRaw = cleanSheetDate(row[12]);

      const weekNum = targetDateSet[dateRaw];

      if (!weekNum) return; // not a matching date

      const roomBranchVal = row[13] ? row[13].toString().trim() : '';

      

      weeklyClasses[weekNum].push({

        subject: resolveDynamicCourseName(row[0] ? row[0].toString().trim() : '', dateRaw, roomBranchVal),

        teacherRegular: resolveNick(row[1]),

        teacherSub: resolveNick(row[2]),

        timeStart: row[3] ? row[3].toString().trim() : '',

        timeEnd: row[4] ? row[4].toString().trim() : '',

        note: row[5] ? row[5].toString().trim() : '',

        isPresentLive: parseInt(row[6]) || 0,

        isPresentOnline: parseInt(row[7]) || 0,

        isLeave: parseInt(row[8]) || 0,

        isAbsent: parseInt(row[9]) || 0,

        isMakeup: parseInt(row[10]) || 0,

        // isOrange removed

        hours: row[11] ? row[11].toString().trim() : '',

        date: dateRaw,

        roomBranch: roomBranchVal,

        teacherConfirmed: row[14] ? (parseInt(row[14]) || 0) : 0,

        rowIndex: idx + 1

      });

    });

    

    // Collect all unique course names to find enrollment counts

    const thaiDayNamesArr = ['วันอาทิตย์','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์'];

    const thaiDayName = thaiDayNamesArr[dayOfWeek] || '';

    const courseNamesSet = new Set();

    const classInfoList = [];

    datesInMonth.forEach(item => {

      (weeklyClasses[item.weekNum] || []).forEach(c => {

        if (c.subject) {

          courseNamesSet.add(c.subject);

          classInfoList.push({ subject: c.subject, dayOfWeek: thaiDayName });

        }

      });

    });

    const enrollments = getCourseEnrollmentCounts([...courseNamesSet], classInfoList);

    return {

      success: true,

      rooms: rooms,

      enrollments: enrollments,

      weeks: datesInMonth.map(item => ({

        weekNum: item.weekNum,

        dateStr: item.dateStr,

        day: item.day,

        classes: weeklyClasses[item.weekNum] || []

      }))

    };

  } catch (err) {

    return { error: err.message };

  }

}

function debugExportData() {

  try {

    const db = getDb();

    const roomsSheet = db.getSheetByName('RoomsDB');

    const rooms = [];

    if (roomsSheet) {

      const data = roomsSheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {

        rooms.push({

          branch: data[i][0] ? data[i][0].toString().trim() : '',

          roomName: data[i][1] ? data[i][1].toString().trim() : '',

          ipad: data[i][2] ? data[i][2].toString().trim() : '',

          zoom: data[i][3] ? data[i][3].toString().trim() : ''

        });

      }

    }

    

    const learnSheet = db.getSheetByName('Data Learn');

    const classes = [];

    const teachersList = getTeachersDB(null);

    const resolveNick = function(nameOrId) {

      if (!nameOrId) return '';

      const cleanVal = nameOrId.toString().trim().toLowerCase();

      const match = Array.isArray(teachersList) ? teachersList.find(t => {

        const tId = (t.teacherId || '').toLowerCase().trim();

        const tNick = t.nickname.toLowerCase().trim();

        return (tId !== '' && tId === cleanVal) || tNick === cleanVal;

      }) : null;

      return match ? match.nickname : nameOrId;

    };

    

    if (learnSheet) {

      const data = learnSheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {

        if (!data[i][0] || data[i][0] === '0') continue;

        const dateRaw = cleanSheetDate(data[i][12]);

        const roomBranchVal = data[i][13] ? data[i][13].toString().trim() : '';

        classes.push({

          rowIndex: i + 1,

          subject: resolveDynamicCourseName(data[i][0] ? data[i][0].toString().trim() : '', dateRaw, roomBranchVal),

          teacherRegular: resolveNick(data[i][1]),

          teacherSub: resolveNick(data[i][2]),

          timeStart: data[i][3] ? data[i][3].toString().trim() : '',

          timeEnd: data[i][4] ? data[i][4].toString().trim() : '',

          note: data[i][5] ? data[i][5].toString().trim() : '',

          isPresentLive: parseInt(data[i][6]) || 0,

          isPresentOnline: parseInt(data[i][7]) || 0,

          isLeave: parseInt(data[i][8]) || 0,

          isAbsent: parseInt(data[i][9]) || 0,

          isMakeup: parseInt(data[i][10]) || 0,

        // isOrange removed

          hours: data[i][11] ? data[i][11].toString().trim() : '',

          date: dateRaw,

          roomBranch: roomBranchVal

        });

      }

    }

    

    const payload = JSON.stringify({

      timestamp: new Date().toISOString(),

      rooms: rooms,

      classes: classes

    }, null, 2);

    

    // Find the folder named 'data_PookPik_Tutor' in Google Drive

    let folder = null;

    try {

      const folders = DriveApp.getFoldersByName('data_PookPik_Tutor');

      if (folders.hasNext()) {

        folder = folders.next();

      }

    } catch (e_drive) {

      // Fallback

    }

    

    // Fallback to active spreadsheet folder if not found

    if (!folder) {

      try {

        const ss = SpreadsheetApp.getActiveSpreadsheet();

        const ssFile = DriveApp.getFileById(ss.getId());

        const parents = ssFile.getParents();

        if (parents.hasNext()) {

          folder = parents.next();

        }

      } catch (e_parent) {

        // Fallback

      }

    }

    

    if (folder) {

      const files = folder.getFilesByName('debug_live_data.json');

      if (files.hasNext()) {

        const file = files.next();

        file.setContent(payload);

      } else {

        folder.createFile('debug_live_data.json', payload, 'application/json');

      }

    }

  } catch (e) {

    try {

      const db = getDb();

      let errSheet = db.getSheetByName('ErrorLog');

      if (!errSheet) {

        errSheet = db.insertSheet('ErrorLog');

        errSheet.appendRow(['Timestamp', 'Function', 'Message', 'Stack']);

      }

      errSheet.appendRow([new Date(), 'debugExportData', e.message, e.stack]);

    } catch(err) {}

  }

}

// ----------------------------------------------------

// General Dropdowns

// ----------------------------------------------------

function getGeneralSettings() {

  try {

    migrateAllGradeSheetsHeaders();

  } catch(e) {}

  try {

    cleanDataLearnColAGarbage();

  } catch(e) {}

  

  const cacheKey = 'general_settings';

  const cached = getCacheObject(cacheKey);

  if (cached) return cached;

  

  try {

    const rawData = getSheetRows('DATA General');

    const teachers = [];

    const schools = [];

    

    const defaultSchools = [

      "ระยองวิทยาคม", "อัสสัมชักระยอง", "เซนต์โยเซฟระยอง", "วัดป่าประดู่", "มัธยมตากสินระยอง", "ระยองวิทยาคมปากน้ำ", "บ้านค่าย", "แกลง \"วิทยสถาวร\"", "กำเนิดวิทย์", "ระยองวิทยาคม นิคมอุตสาหกรรม",

      "เบกจมราชูทิศ จันทบุรี", "ศรียานุสรณ์", "สาธิตมหาวิทยาลัยราชภักรำไพพรรณี", "ลาซาลจันทบุรี", "ประทีปศึกษา", "คิชฌกูกวิทยา", "ท่าใหม่ \"พูลสวัสดิ์ราษฎร์นุกูล\"",

      "สตรีประเสริกศิลป์", "ตราดสรรเสริกวิทยาคม", "พิทยานุสรณ์ตราด", "คลองใหก่วิทยาคม", "ตราษตระการคุณ",

      "ชลราษฎรอำรุง", "ชลกันยานุกูล", "สาธิตพิบูลบำเพ็ญ มหาวิทยาลัยบูรพา", "ดาราสมุทร ศรีราชา", "อัสสัมชักศรีราชา", "เซนต์ปอลคอนแวนต์", "พนัสพิทยาคาร", "บางละมุง", "ศรีราชา", "จุฬาภรณราชวิทยาลัย ชลบุรี", "สาธิตอุดมศึกษา", "มารีวิทย์",

      "เตรียมอุดมศึกษา", "สวนกุหลาบวิทยาลัย", "เทพศิรินทร์", "สามเสนวิทยาลัย", "สตรีวิทยา", "บดินทรเดชา (สิงห์ สิงหเสนี)", "หอวัง", "สาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ปทุมวัน", "สาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ประสานมิตร", "อัสสัมชัก", "กรุงเทพคริสเตียนวิทยาลัย", "เซนต์คาเบรียล", "มาแตร์เดอีวิทยาลัย", "วัฒนาวิทยาลัย", "ศึกษานารี", "วัดสุทธิวราราม", "สายน้ำผึ้ง", "เตรียมอุดมศึกษาพัฒนาการ", "เตรียมอุดมศึกษาน้อมเกล้า", "สตรีวิทยา ๒", "สาธิตมหาวิทยาลัยราชภักสวนสุนันทา", "สาธิตจุฬาลงกรณ์มหาวิทยาลัย",

      "สวนกุหลาบวิทยาลัย นนทบุรี", "สตรีนนทบุรี", "หอวังนนทบุรี", "เบกจมราชานุสรณ์", "ราชวินิตนนทบุรี", "เตรียมอุดมศึกษาพัฒนาการ นนทบุรี",

      "สตรีสมุทรปราการ", "สมุทรปราการ", "ราชวินิตบางแก้ว", "มัธยมวัดด่านสำโรง", "บางพลีราษฎร์บำรุง",

      "อัมพวันวิทยาลัย", "ถาวรานุกูล", "ศรัทธาสมุทร",

      "สมุทรสาครบูรณะ", "สมุทรสาครวิทยาลัย", "กระทุ่มแบน \"วิเศษสมุทคุณ\"",

      "คณะราษฎร์บำรุงปทุมธานี", "ปทุมวิไล", "สวนกุหลาบวิทยาลัย รังสิต", "สาธิตมหาวิทยาลัยราชภักพระนครศรีอยุธยา"

    ];

    

    rawData.forEach((row, idx) => {

      if (idx === 0) return;

      if (row[1]) schools.push(row[1].toString().trim());

    });

    

    try {

      const usersData = getSheetRows('UsersDB');
      usersData.forEach((row, idx) => {
        if (idx === 0) return;
        if (row[2] === 'Teacher' && row[3]) teachers.push(row[3].toString().trim());
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

      "SCB คุณยาย",

      "กรุงศรี คุณตา",

      "กรุงศรี บักชีบริษัท",

      "กสิกร บักชีบริษัท(กด)",

      "กสิกร บักชีบริษัท(สแกน)",

      "TTB บักชีบริษัท(กด)",

      "TTB บักชีบริษัท(สแกน)",

      "เงินสด",

      "พี่ปิ๊ก โอน",

      "พี่ต้น โอน"

    ];

    

    const db = getDb();

    const statusSheet = db.getSheetByName('StatusDB');

    const dbSummary = {

      name: db.getName(),

      id: db.getId(),

      statusRows: statusSheet ? statusSheet.getLastRow() : -1,

      sheets: db.getSheets().map(s => s.getName())

    };

    

    const result = {

      teachers: [...new Set(teachers)].sort(),

      schools: [...new Set(allSchools)].sort(),

      paymentChannels: requestedChannels,

      dbSummary: dbSummary

    };

    

    setCacheObject(cacheKey, result, 600); // 10 minutes cache

    return result;

  } catch (err) {

    return { error: err.message };

  }

}

// ----------------------------------------------------

// Dashboard Aggregator

// ----------------------------------------------------

function getDashboardData(logUser, selectedYear) {
  if (logUser) checkTeacherBlock(logUser);
  try {
    const statusData = getSheetRows('StatusDB');
    let totalIncome = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    
    const branchFin = {
      'สาขา1': { full: 0, paid: 0, debt: 0 },
      'สาขา2': { full: 0, paid: 0, debt: 0 },
      'สาขา3': { full: 0, paid: 0, debt: 0 },
      'อื่นๆ': { full: 0, paid: 0, debt: 0 }
    };
    const roundFin = {};
    
    const currentYear = selectedYear ? parseInt(selectedYear, 10) : new Date().getFullYear();
    const monthlySummary = [];
    for (let i = 0; i < 12; i++) {
      monthlySummary.push({'สาขา1': 0, 'สาขา2': 0, 'สาขา3': 0, 'อื่นๆ': 0, 'total': 0});
    }

    const courseCounts = {};
    const mainGroupStats = {};
    const privateGroupStats = {};

    statusData.forEach((row, idx) => {
      if (idx === 0 && row[0] && row[0].toString().toLowerCase().includes('id')) return;
      const studentName = row[1] ? row[1].toString().trim() : '';
      if (!row[0] && !studentName) return;
      
      const paid = parseFloat(row[9]) || 0;
      const full = parseFloat(row[10]) || 0;
      const debt = full - paid;
      const branchRaw = row[5] ? row[5].toString().trim() : '';
      const branchPay = row[6] ? row[6].toString().trim() : '';
      const round = row[15] ? row[15].toString().trim() : 'ทั่วไป';
      const grade = row[16] ? row[16].toString().trim() : 'ไม่ระบุ';
      const classType = row[23] ? row[23].toString().trim() : '';
      const selectedCourses = row[39] ? row[39].toString().trim() : '';
      
      totalPaid += paid;
      totalIncome += full;
      totalOutstanding += debt;
      
      let branchKey = 'อื่นๆ';
      if (branchRaw.toLowerCase().includes('ออนไลน์')) {
        if (branchPay.includes('สาขา1')) branchKey = 'สาขา1';
        else if (branchPay.includes('สาขา2')) branchKey = 'สาขา2';
        else if (branchPay.includes('สาขา3')) branchKey = 'สาขา3';
        else {
          if (branchRaw.includes('สาขา1')) branchKey = 'สาขา1';
          else if (branchRaw.includes('สาขา2')) branchKey = 'สาขา2';
          else if (branchRaw.includes('สาขา3')) branchKey = 'สาขา3';
          else branchKey = 'สาขา1';
        }
      } else {
        if (branchRaw.includes('สาขา1')) branchKey = 'สาขา1';
        else if (branchRaw.includes('สาขา2')) branchKey = 'สาขา2';
        else if (branchRaw.includes('สาขา3')) branchKey = 'สาขา3';
        else branchKey = 'สาขา1';
      }
      
      branchFin[branchKey].full += full;
      branchFin[branchKey].paid += paid;
      branchFin[branchKey].debt += debt;
      
      if (round) {
        if (!roundFin[round]) roundFin[round] = { full: 0, paid: 0, debt: 0 };
        roundFin[round].full += full;
        roundFin[round].paid += paid;
        roundFin[round].debt += debt;
      }

      const extractMonthYear = (dateStr) => {
        if (!dateStr) return null;
        const parts = cleanSheetDate(dateStr).split('/');
        if (parts.length === 3) return { m: parseInt(parts[1], 10), y: parseInt(parts[2], 10) };
        return null;
      };

      const mainPayment = extractMonthYear(row[12]);
      if (mainPayment && mainPayment.y === currentYear && mainPayment.m >= 1 && mainPayment.m <= 12) {
        monthlySummary[mainPayment.m - 1][branchKey] += paid;
        monthlySummary[mainPayment.m - 1]['total'] += paid;
      }

      const isPrivate = classType.includes('เดี่ยว') || classType.includes('ย่อย');
      if (isPrivate) {
        const paymentDates = [
          extractMonthYear(row[12]),
          extractMonthYear(row[24]),
          extractMonthYear(row[29]),
          extractMonthYear(row[34])
        ];
        const recordedMonths = new Set();
        paymentDates.forEach(pd => {
          if (pd && pd.m >= 1 && pd.m <= 12) recordedMonths.add(pd.m);
        });
        recordedMonths.forEach(m => {
          if (!privateGroupStats[m]) privateGroupStats[m] = 0;
          privateGroupStats[m]++;
        });
      }

      if (paid > 0 && selectedCourses) {
        const courses = selectedCourses.split(',').map(c => c.trim()).filter(c => c);
        courses.forEach(c => {
          if (!courseCounts[c]) courseCounts[c] = 0;
          courseCounts[c]++;
        });
      }

      const isMain = classType.includes('กลุ่มหลัก') || classType === 'Main Class';
      if (isMain && round) {
        if (!mainGroupStats[round]) mainGroupStats[round] = {};
        if (!mainGroupStats[round][branchKey]) mainGroupStats[round][branchKey] = {};
        if (!mainGroupStats[round][branchKey][grade]) mainGroupStats[round][branchKey][grade] = 0;
        mainGroupStats[round][branchKey][grade]++;
      }
    });

    const coursesOver5 = [];
    for (const [course, count] of Object.entries(courseCounts)) {
      if (count > 5) {
        coursesOver5.push({ course, count });
      }
    }
    coursesOver5.sort((a, b) => b.count - a.count);

    return {
      totalIncome: totalIncome,
      totalPaid: totalPaid,
      totalOutstanding: totalOutstanding,
      branchFin: branchFin,
      roundFin: roundFin,
      monthlySummary: monthlySummary,
      currentYear: currentYear,
      coursesOver5: coursesOver5,
      mainGroupStats: mainGroupStats,
      privateGroupStats: privateGroupStats
    };
  } catch (err) {
    return { error: err.message };
  }
}


// ----------------------------------------------------

// PDF Dynamic Round Summary calculations (สรุป 2569)

// ----------------------------------------------------

// ----------------------------------------------------

// PDF Dynamic Round Summary calculations (สรุป 2569) - OPTIMIZED WITH GRID CACHE

// ----------------------------------------------------

const sheetValuesCache_ = {};

function getSheetGridValues(db, sheetName) {

  if (sheetValuesCache_[sheetName]) return sheetValuesCache_[sheetName];

  try {

    const sheet = db.getSheetByName(sheetName);

    if (!sheet) {

      sheetValuesCache_[sheetName] = null;

      return null;

    }

    // Read first 15 rows, 10 columns in one API call

    const values = sheet.getRange(1, 1, 15, 10).getValues();

    sheetValuesCache_[sheetName] = values;

    return values;

  } catch (e) {

    sheetValuesCache_[sheetName] = null;

    return null;

  }

}

function getCellValueFromGrid(values, cellNotation) {

  if (!values) return 0;

  try {

    const match = cellNotation.match(/^([A-Z]+)([0-9]+)$/);

    if (!match) return 0;

    const colLetter = match[1];

    const rowNum = parseInt(match[2]);

    

    // Convert col letter to 0-based index

    let colIdx = 0;

    for (let i = 0; i < colLetter.length; i++) {

      colIdx = colIdx * 26 + (colLetter.charCodeAt(i) - 64);

    }

    colIdx = colIdx - 1;

    const rowIdx = rowNum - 1;

    

    if (rowIdx < values.length && colIdx < values[rowIdx].length) {

      const val = values[rowIdx][colIdx];

      const num = parseFloat(val);

      return isNaN(num) ? 0 : num;

    }

    return 0;

  } catch (e) {

    return 0;

  }

}

function getRoundSummary(round, branch) {
  try {
    const db = getDb();
    const stats = {};
    const categories = [];
    
    // Clear in-memory cache for this run
    for (let k in sheetValuesCache_) delete sheetValuesCache_[k];
    
    const grades = [
      { name: 'อนุบาล', privateSheet: 'เดี่ยว อนุบาล', groupPrefix: 'อนุบาล' },
      { name: 'ป.1', privateSheet: 'เดี่ยว ป.1', groupPrefix: 'ป.1' },
      { name: 'ป.2', privateSheet: 'เดี่ยว ป.2', groupPrefix: 'ป.2' },
      { name: 'ป.3', privateSheet: 'เดี่ยว ป.3', groupPrefix: 'ป.3' },
      { name: 'ป.4', privateSheet: 'เดี่ยว ป.4', groupPrefix: 'ป.4' },
      { name: 'ป.5', privateSheet: 'เดี่ยว ป.5', groupPrefix: 'ป.5' },
      { name: 'ป.6', privateSheet: 'เดี่ยว ป.6', groupPrefix: 'ป.6' },
      { name: 'ม.1', privateSheet: 'เดี่ยว ม.1', groupPrefix: 'ม.1' },
      { name: 'ม.2', privateSheet: 'เดี่ยว ม.2', groupPrefix: 'ม.2' },
      { name: 'ม.3', privateSheet: 'เดี่ยว ม.3', groupPrefix: 'ม.3' },
      { name: 'ม.4', privateSheet: 'เดี่ยว ม.4', groupPrefix: 'ม.4' },
      { name: 'ม.5', privateSheet: 'เดี่ยว ม.5', groupPrefix: 'ม.5' },
      { name: 'ม.6', privateSheet: 'เดี่ยว ม.6', groupPrefix: 'ม.6' },
      { name: 'ย่อย 2-3', privateSheet: 'ย่อย 2-3', isSubgroup: true },
      { name: 'ย่อย 4-5', privateSheet: 'ย่อย 4-5', isSubgroup: true },
      { name: 'ย่อย 6-10', privateSheet: 'ย่อย 6-10', isSubgroup: true }
    ];
    
    const branches = [
      { name: 'สาขา1', suffix: '/1' },
      { name: 'สาขา2', suffix: '/2' },
      { name: 'สาขา3', suffix: '/3' }
    ];

    grades.forEach(gradeObj => {
      branches.forEach(branchObj => {
        const key = gradeObj.name + '|' + branchObj.name;
        stats[key] = {
          grade: gradeObj.name,
          branch: branchObj.name,
          singlePaidAmount: 0,
          singleDebtAmount: 0,
          singleAndSubgroupCount: 0,
          regularGroupCount: 0,
          groupFullAmount: 0,
          groupPaidAmount: 0,
          groupDebtAmount: 0,
          overFiveCount: 0,
          notes: []
        };
        categories.push({ grade: gradeObj.name, branch: branchObj.name });
      });
    });

    const filterRound = round ? round.trim().toLowerCase() : '';

    // Function to process a sheet
    function processSheetForSummary(sheetName, isSingle) {
      const sheet = db.getSheetByName(sheetName);
      if (!sheet) return;
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow < 6 || lastCol < 20) return;
      
      const startRow = isSingle ? 12 : 6;
      if (lastRow < startRow) return;
      
      // Determine grade and default branch
      let targetGrade = '';
      let defaultBranch = '';
      if (isSingle) {
        if (sheetName.includes('ย่อย 2-3')) targetGrade = 'ย่อย 2-3';
        else if (sheetName.includes('ย่อย 4-5')) targetGrade = 'ย่อย 4-5';
        else if (sheetName.includes('ย่อย 6-10')) targetGrade = 'ย่อย 6-10';
        else targetGrade = sheetName.replace('เดี่ยว ', '').trim();
      } else {
        const parts = sheetName.split('/');
        targetGrade = parts[0];
        defaultBranch = 'สาขา' + parts[1];
      }
      
      // Read courses
      const numCourseCols = lastCol - (COURSE_START_COL - 1);
      const headerRow1 = numCourseCols > 0 ? sheet.getRange(1, COURSE_START_COL, 1, numCourseCols).getValues()[0] : [];
      const headerRow2 = numCourseCols > 0 ? sheet.getRange(2, COURSE_START_COL, 1, numCourseCols).getValues()[0] : [];
      const sheetCourses = [];
      for (let i = 0; i < headerRow1.length; i++) {
        if (headerRow1[i]) {
          sheetCourses.push({
            name: headerRow1[i].toString(),
            colIndex: COURSE_START_COL + i,
            price: parseFloat(headerRow2[i]) || 0
          });
        }
      }
      
      const dataRange = sheet.getRange(startRow, 1, lastRow - (startRow - 1), lastCol).getValues();
      
      dataRange.forEach(row => {
        const name = row[1] ? row[1].toString().trim() : '';
        if (!name) return;
        
        let rowBranch = defaultBranch;
        if (isSingle) {
          rowBranch = row[8] ? row[8].toString().trim() : ''; // col I branchLearn
        }
        if (!rowBranch) rowBranch = 'สาขา1';
        if (branch && rowBranch !== branch) return; // Filter by branch if provided
        
        const key = targetGrade + '|' + rowBranch;
        if (!stats[key]) return;
        
        // Filter courses for this student
        let enrolledCourses = 0;
        let matchedGross = 0;
        let hasMatch = false;
        
        sheetCourses.forEach(c => {
          const val = row[c.colIndex - 1];
          if (val !== '' && val !== null && val !== undefined) {
             enrolledCourses++;
             if (!filterRound || c.name.toLowerCase().includes(filterRound)) {
               hasMatch = true;
               matchedGross += c.price;
             }
          }
        });
        
        // If they have no matched courses, skip them entirely
        if (!hasMatch && filterRound) return;
        
        const paid = parseFloat(row[13]) || 0;
        const debt = matchedGross - paid;
        
        if (isSingle) {
           stats[key].singleAndSubgroupCount++;
           stats[key].singlePaidAmount += paid;
           stats[key].singleDebtAmount += debt;
        } else {
           stats[key].regularGroupCount++;
           stats[key].groupFullAmount += matchedGross;
           stats[key].groupPaidAmount += paid;
           stats[key].groupDebtAmount += debt;
           if (enrolledCourses > 5) {
             stats[key].overFiveCount++;
           }
        }
      });
    }

    // Process all groups
    grades.forEach(gradeObj => {
      branches.forEach(branchObj => {
        processSheetForSummary(gradeObj.groupPrefix + branchObj.suffix, false);
      });
    });
    
    // Process all singles
    grades.forEach(gradeObj => {
      if (gradeObj.privateSheet) {
        processSheetForSummary(gradeObj.privateSheet, true);
      }
    });

    return { success: true, summary: stats, categories: categories };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**

 * One-time migration: append day/time from Row 3 into Row 1 header

 * for existing grade-sheet columns that don't already include it.

 * Uses a ScriptProperty flag so it only runs once per spreadsheet.

 */

function migrateExistingGradeSheetHeaders() {

  try {

    const props = PropertiesService.getScriptProperties();

    const flag = props.getProperty('HEADER_MIGRATION_DONE');

    if (flag === 'true') return; // already migrated

    const db = getDb();

    const sheets = db.getSheets();

    sheets.forEach(sheet => {

      const name = sheet.getName();

      const match = name.match(/^(.+)\/([1-3])$/);

      if (!match) return;

      const lastCol = sheet.getLastColumn();

      if (lastCol < COURSE_START_COL) return;

      const numCols = lastCol - 15;

      const row1 = sheet.getRange(1, 16, 1, numCols).getValues()[0];

      const row3 = sheet.getRange(3, 16, 1, numCols).getValues()[0];

      let changed = false;

      for (let c = 0; c < numCols; c++) {

        const headerVal = row1[c] ? row1[c].toString().trim() : '';

        const dayTimeVal = row3[c] ? row3[c].toString().trim() : '';

        if (!headerVal || !dayTimeVal) continue;

        // Skip if the header already contains the day/time text

        if (headerVal.indexOf(dayTimeVal) !== -1) continue;

        row1[c] = headerVal + ' ' + dayTimeVal;

        changed = true;

      }

      if (changed) {

        sheet.getRange(1, 16, 1, numCols).setValues([row1]);

      }

    });

    props.setProperty('HEADER_MIGRATION_DONE', 'true');

  } catch (e) {

    // Migration failure is non-fatal; log and continue

    Logger.log('migrateExistingGradeSheetHeaders error: ' + e.message);

  }

}

function getAllCoursesFromGradeSheets() {

  try {

    // Run one-time header migration (day/time → Row 1)

    migrateExistingGradeSheetHeaders();

    const db = getDb();

    const sheets = db.getSheets();

    const courses = [];

    

    // 1. Fetch courses from standard grade sheets (e.g. "ประถม/2")

    sheets.forEach(sheet => {

      const name = sheet.getName();

      const match = name.match(/^(.+)\/([1-3])$/);

      if (match) {

        const lastCol = sheet.getLastColumn();

        if (lastCol >= 15) {
          const fullHeader = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
          let colOutstanding = -1, colPaid = -1;
          for (let c = 0; c < fullHeader.length; c++) {
              const val = fullHeader[c].toString().trim();
              if (['คงเหลือ', 'ยอดค้าง'].includes(val)) colOutstanding = c + 1;
              if (['ยอดจ่าย', 'จ่าย', 'ชำระแล้ว', 'ยอดชำระมา'].includes(val)) colPaid = c + 1;
          }
          let startCourseCol = COURSE_START_COL;
          for (let c = 15; c <= lastCol; c++) {
              const val = fullHeader[c - 1] ? fullHeader[c - 1].toString().trim() : '';
              if (val && !['ยอดจ่าย', 'คงเหลือ', 'ราคาเต็ม', 'จ่าย', 'ชำระแล้ว'].includes(val) && val.length > 2) {
                  if (c > colOutstanding && c > colPaid) {
                      startCourseCol = c;
                      break;
                  }
              }
          }
          if (startCourseCol <= lastCol) {
            const vals = sheet.getRange(1, startCourseCol, 1, lastCol - (startCourseCol - 1)).getValues()[0];
            vals.forEach(val => {
              if (val) {
                const cName = val.toString().trim();
                if (cName && !['ยอดจ่าย', 'คงเหลือ', 'ราคาเต็ม', 'จ่าย', 'ชำระแล้ว'].includes(cName)) {
                  courses.push(cName);
                }
              }
            });
          }
        }

      }

    });

    

    // 2. Fetch courses from private and subgroup sheets (เดี่ยว อนุบาล, เดี่ยว ป.x, ย่อย x-x)

    const privateSheets = [

      "เดี่ยว อนุบาล", "เดี่ยว ป.1", "เดี่ยว ป.2", "เดี่ยว ป.3", "เดี่ยว ป.4", "เดี่ยว ป.5", "เดี่ยว ป.6",

      "เดี่ยว ม.1", "เดี่ยว ม.2", "เดี่ยว ม.3", "เดี่ยว ม.4", "เดี่ยว ม.5", "เดี่ยว ม.6",

      "ย่อย 2-3", "ย่อย 4-5", "ย่อย 6-10"

    ];

    

    privateSheets.forEach(sName => {

      const sheet = db.getSheetByName(sName);

      if (sheet) {

        const lastRow = sheet.getLastRow();

        if (lastRow >= 12) {

          // Column 11 (K) is the Course Name column, Column 2 (B) is Student Name

          const vals = sheet.getRange(12, 11, lastRow - 11, 1).getValues();

          const names = sheet.getRange(12, 2, lastRow - 11, 1).getValues();

          vals.forEach((val, idx) => {

            const studentName = names[idx][0] ? names[idx][0].toString().trim() : '';

            const cName = val[0] ? val[0].toString().trim() : '';

            if (studentName && cName) {

              courses.push(cName);

            }

          });

        }

      }

    });

    

    return filterLatestCourseRounds([...new Set(courses)]).sort();

  } catch (err) {

    return { error: err.message };

  }

}

function filterLatestCourseRounds(courses) {

  const parsedMap = {};

  courses.forEach(name => {

    const cleanName = name.trim();

    const match = cleanName.match(/(.+?)\s+(\d+)$/);

    let base = cleanName;

    let round = 1;

    if (match) {

      const parsedBase = match[1].trim();

      const parsedRound = parseInt(match[2], 10);

      if (!parsedBase.endsWith('ป.') && !parsedBase.endsWith('ม.')) {

        base = parsedBase;

        round = parsedRound;

      }

    }

    if (!parsedMap[base] || parsedMap[base].round < round) {

      parsedMap[base] = { fullName: cleanName, round: round };

    }

  });

  const filtered = [];

  for (const base in parsedMap) {

    filtered.push(parsedMap[base].fullName);

  }

  return filtered;

}

// ----------------------------------------------------

// Central Student Registration (StatusDB)

// ----------------------------------------------------

function getStudentsList(logUser) {

  if (logUser) checkTeacherBlock(logUser);
  migrateAllSheetsIfNeeded();

  const cacheKey = 'students_list';

  let list = getCacheObject(cacheKey);

  

  if (!list) {

    try {

      list = getStudentsListRaw();

      setCacheObject(cacheKey, list, 600); // 10 minutes cache

    } catch (err) {

      return { error: err.message };

    }

  }

  

  // Filter for teachers

  if (logUser && isTeacherUser(logUser)) {

    try {

      const db = getDb();

      let teacherName = logUser;

      const usersSheet = db.getSheetByName('UsersDB');

      if (usersSheet) {

        const users = usersSheet.getDataRange().getValues();

        for (let i = 1; i < users.length; i++) {

          if (users[i][0] && users[i][0].toString().trim().toLowerCase() === logUser.toLowerCase()) {

            teacherName = users[i][3] ? users[i][3].toString().trim() : users[i][4] ? users[i][4].toString().trim() : logUser;

            break;

          }

        }

      }

      

      const classLogs = getClassLogs('');

      const teacherCoursesMap = {};

      if (Array.isArray(classLogs)) {

        classLogs.forEach(c => {

          const isAssigned = c.teacherRegular && c.teacherRegular.toLowerCase().includes(teacherName.toLowerCase());

          if (isAssigned && c.subject) {

            teacherCoursesMap[c.subject.trim().toLowerCase()] = {

              day: c.dayOfWeek || '',

              time: c.timeStart || ''

            };

          }

        });

      }

      

      if (Object.keys(teacherCoursesMap).length === 0) return [];

      

      list = list.filter(student => {

        for (let j = 1; j <= 5; j++) {

          const sCourse = (student[`Course ${j}`] || '').toLowerCase().trim();

          const sDay = student[`Day ${j}`] || '';

          const sTime = student[`Time ${j}`] || '';

          

          for (const [cName, cInfo] of Object.entries(teacherCoursesMap)) {

            if (sCourse && sCourse.includes(cName)) {

              if (cInfo.day && cInfo.time) {

                if (sDay.includes(cInfo.day) && (sTime.includes(cInfo.time) || cInfo.time.includes(sTime))) {

                  return true;

                }

              } else {

                return true;

              }

            }

          }

        }

        return false;

      });

    } catch(e) {

      // fallback to full list on error

    }

  }

  

  return list;

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
    const debt = parseFloat(row[11]) || (full - paid);
    
    const coursesStr = row[39] ? row[39].toString().trim() : '';
    const selectedCoursesList = [];
    if (coursesStr) {
      const parts = coursesStr.split(',');
      parts.forEach(p => {
        const cName = p.trim();
        if (cName) {
           selectedCoursesList.push({
             courseName: cName,
             sessions: 10
           });
        }
      });
    }
    
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
      selectedCourses: selectedCoursesList,
      
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

function getAllStudentsFromSubgroupSheets() {

  const sheets = ['ย่อย 2-3', 'ย่อย 4-5', 'ย่อย 6-10'];

  const all = [];

  sheets.forEach(name => {

    const rows = getSheetRows(name);

    rows.forEach((row, idx) => {

      if (idx === 0) return;

      const id = row[0] ? row[0].toString().trim() : '';

      const nameVal = row[1] ? row[1].toString().trim() : '';

      if (id && nameVal) {

        all.push({ id: id, name: nameVal });

      }

    });

  });

  return all;

}

// ----------------------------------------------------

// Get Courses and Students for Evaluation Filtered by Teacher

// ----------------------------------------------------

function getTeacherCoursesAndStudents(logUser) {

  try {
    const cacheKey = 'teacher_courses_' + (logUser || 'guest');
    const cached = getCacheObject(cacheKey);
    if (cached) return cached;

    const db = getDb();

    

    // 1. Get current teacher's nickname from TeachersDB using logUser (TeacherID / Username / Name)

    const teachersList = getTeachersDB(null);

    let matchedTeacherNick = (logUser || '').toString().trim();

    

    if (matchedTeacherNick) {

      const cleanLogUser = matchedTeacherNick.toLowerCase();

      const match = teachersList.find(t => {

        const tId = (t.teacherId || '').toLowerCase().trim();

        const tNick = (t.nickname || '').toLowerCase().trim();

        const tFull = (t.fullName || '').toLowerCase().trim();

        return tId === cleanLogUser || tNick === cleanLogUser || tFull === cleanLogUser || tNick.includes(cleanLogUser) || tFull.includes(cleanLogUser) || cleanLogUser.includes(tNick);

      });

      if (match) {

        matchedTeacherNick = match.nickname;

      }

    }

    

    // 2. Scan Data Learn for teacher's courses

    const classLogs = getClassLogs('');

    const teacherCoursesMap = {};

    

    if (Array.isArray(classLogs)) {

      classLogs.forEach(c => {

        const cRegLower = c.teacherRegular ? c.teacherRegular.toLowerCase().trim() : '';
        const matchNickLower = matchedTeacherNick ? matchedTeacherNick.toLowerCase().trim() : '';
        let isAssigned = false;
        if (cRegLower && matchNickLower) {
          isAssigned = cRegLower.includes(matchNickLower) || matchNickLower.includes(cRegLower);
        }

          

        if (isAssigned && c.subject) {

          const courseKey = c.subject.trim();

          const dayName = c.dayOfWeek || '';

          const timeStart = c.timeStart || '';

          const timeEnd = c.timeEnd || '';

          

          let fullCourseName = courseKey;

          let dayTimeStr = '';

          

          var hasDay = /(จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์|อาทิตย์)/.test(courseKey);

          var hasTime = /\d+[:.]\d+/.test(courseKey);

          

          if (hasDay && hasTime) {

            fullCourseName = courseKey;

            if (dayName && timeStart) {

              dayTimeStr = dayName + ' ' + timeStart + '-' + timeEnd;

            }

          } else if (dayName && timeStart) {

            dayTimeStr = dayName + ' ' + timeStart + '-' + timeEnd;

            fullCourseName = courseKey + ' ' + dayTimeStr;

          }

          

          teacherCoursesMap[fullCourseName] = {

            courseName: courseKey,

            displayCourseName: fullCourseName,

            dayTimeStr: dayTimeStr,

            day: dayName,

            timeStart: timeStart,

            timeEnd: timeEnd,

            roomBranch: c.roomBranch || '',

            students: []

          };

        }

      });

    }

    

    const courseKeys = Object.keys(teacherCoursesMap);

    if (courseKeys.length === 0) return [];

    

    // 3. For each course, search enrolled students from Grade Sheets

    const gradeSheets = [

      'อนุบาล/1','ป.1/1','ป.2/1','ป.3/1','ป.4/1','ป.5/1','ป.6/1','ม.1/1','ม.2/1','ม.3/1','ม.4/1','ม.5/1','ม.6/1',

      'อนุบาล/2','ป.1/2','ป.2/2','ป.3/2','ป.4/2','ป.5/2','ป.6/2','ม.1/2','ม.2/2','ม.3/2','ม.4/2','ม.5/2','ม.6/2',

      'อนุบาล/3','ป.1/3','ป.2/3','ป.3/3','ป.4/3','ป.5/3','ป.6/3','ม.1/3','ม.2/3','ม.3/3','ม.4/3','ม.5/3','ม.6/3',

      'เดี่ยว อนุบาล','เดี่ยว ป.1','เดี่ยว ป.2','เดี่ยว ป.3','เดี่ยว ป.4','เดี่ยว ป.5','เดี่ยว ป.6','เดี่ยว ม.1','เดี่ยว ม.2','เดี่ยว ม.3','เดี่ยว ม.4','เดี่ยว ม.5','เดี่ยว ม.6',

      'ย่อย 2-3','ย่อย 4-5','ย่อย 6-10'

    ];

    for (let sheetName of gradeSheets) {

      const sheet = db.getSheetByName(sheetName);

      if (!sheet) continue;

      

      const data = sheet.getDataRange().getValues();

      if (data.length < 4) continue;

      

      const courseRow = data[0]; // Row 1 (Index 0)

      const dayTimeRow = data[2]; // Row 3 (Index 2)

      

      let branch = '';

      if (sheetName.includes('/1')) branch = 'สาขา 1';

      else if (sheetName.includes('/2')) branch = 'สาขา 2';

      else if (sheetName.includes('/3')) branch = 'สาขา 3';

      

      for (let key of courseKeys) {

        const cInfo = teacherCoursesMap[key];

        const targetCourseName = cInfo.courseName.toLowerCase().trim();

        const targetDayTime = cInfo.dayTimeStr ? cInfo.dayTimeStr.toLowerCase().trim() : '';

        

        for (let c = 4; c < courseRow.length; c++) {

          const cellCourse = (courseRow[c] || '').toString().toLowerCase().trim();

          const cellDayTime = (dayTimeRow[c] || '').toString().toLowerCase().trim();

          

          let isMatch = matchCourseName(targetCourseName, cellCourse);

          if (isMatch && targetDayTime) {

            if (cellDayTime && !cellDayTime.includes(targetDayTime) && !targetDayTime.includes(cellDayTime) && !cellCourse.includes(targetDayTime)) {

               isMatch = false;

            }

          }

          

          if (isMatch) {

               

               // Start from row 6 (index 5) as requested

               for (let r = 5; r < data.length; r++) {

                  const val = data[r][c];

                  if (val !== '' && val !== null && !isNaN(val) && parseFloat(val) > 0) {

                     // Use explicit columns as requested: Name/Surname in B (1), Nickname in C (2). Use Name (1) as ID to prevent duplicate conflicts.

                     let idCol = 1, fnameCol = 1, nickCol = 2;

                     

                     const sId = (data[r][idCol] || '').toString().trim();

                     const sFname = (data[r][fnameCol] || '').toString().trim();

                     const sLname = '';

                     let sNick = (data[r][nickCol] || '').toString().trim();

                     if (sNick.includes('GMT+') || sNick.match(/Sun|Mon|Tue|Wed|Thu|Fri|Sat.*202\d/)) {

                        sNick = '';

                     }

                     

                     const existing = cInfo.students.find(s => s.studentId === sId && sId !== '');

                     if (!existing) {

                       cInfo.students.push({

                         studentId: sId,

                         nickname: sNick,

                         name: (sFname + ' ' + sLname).trim(),

                         firstname: sFname,

                         lastname: sLname,

                         grade: sheetName.split('/')[0],

                         branch: branch

                       });

                     }

                  }

               }

             }

          }

        }

      }

    

    const result = [];

    courseKeys.forEach(key => {

      const item = teacherCoursesMap[key];

      result.push({

        courseName: item.displayCourseName,

        students: item.students

      });

    });

    

    return result;

  } catch (err) {

    return [];

  }

}

function getStudentDetailedCourses(studentName, nickname, grade, branchLearn, classType, logUser) {

  if (logUser) checkTeacherBlock(logUser);

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

    if (lastRow < 6) return [];
    if (lastCol < COURSE_START_COL) return [];

    

    const headerRow1 = sheet.getRange(1, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

    const headerRow2 = sheet.getRange(2, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

    const headerRow3 = sheet.getRange(3, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

    

    const studentData = sheet.getRange(6, 1, lastRow - 5, lastCol).getValues();

    for (let idx = 0; idx < studentData.length; idx++) {

      const row = studentData[idx];

      const name = row[1] ? row[1].toString().trim() : '';

      if (name === studentName) {

        const detailedCourses = [];

        for (let i = 0; i < headerRow1.length; i++) {

          const val = row[15 + i];

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

function getGradeCourses(grade, branch, logUser) {

  if (logUser) checkTeacherBlock(logUser);

  try {

    const db = getDb();

    let suffix = '1';

    if (branch.includes('สาขา2')) suffix = '2';

    else if (branch.includes('สาขา3')) suffix = '3';

    

    const sheetName = `${grade}/${suffix}`;

    const sheet = db.getSheetByName(sheetName);

    if (!sheet) return [];

    

    const lastCol = sheet.getLastColumn();

    if (lastCol < COURSE_START_COL) return [];

    

    const headerRow1 = sheet.getRange(1, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

    const headerRow2 = sheet.getRange(2, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

    const headerRow3 = sheet.getRange(3, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

    const headerRow4 = sheet.getRange(4, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

    

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
  computeCumulativePayment(student);

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

  

  const sheet = getOrCreateSheet(sheetName);

  if (!sheet) return;

  

  const lastRow = sheet.getLastRow();

  let range = [];

  const startRow = sheetName.includes('เดี่ยว') || sheetName.includes('ย่อย') ? 12 : 6;

  

  if (lastRow >= startRow) {

    range = sheet.getRange(startRow, 2, lastRow - (startRow - 1), 10).getValues(); 

  }

  

  let targetRowIndex = -1;

  const courseName = student.round || '';

  const matchName = (student.originalName || student.name).trim();

  const matchRound = student.originalRound || student.round || '';

  

  for (let i = 0; i < range.length; i++) {

    if (range[i][0].toString().trim() === matchName && (sheetName.includes('เดี่ยว') ? range[i][9].toString().trim() === matchRound : true)) {

      targetRowIndex = i + startRow;

      break;

    }

  }

  

  const rowDataClassType = normalizedClassType === 'เดี่ยว' ? `เดี่ยว ${student.grade}` : normalizedClassType;

  const isPrivateSheet = sheetName.includes('เดี่ยว') || sheetName.includes('ย่อย');
  const rowData = isPrivateSheet ? [
    rowDataClassType, // 0
    student.name, // 1
    student.nickname, // 2
    student.school, // 3
    student.round || '', // 4: คอร์ส (คอร์สเรียน / วิชา)
    student.contact || '', // 5
    student.lineName || '', // 6
    student.lineId || '', // 7
    student.branchLearn, // 8
    student.branchPay, // 9
    student.round || '', // 10: รอบเรียน
    student.paymentTimeNote || '', // 11
    student.carriedForwardFee || 0, // 12
    student.full || 0, // 13
    student.paid || 0, // 14
    student.full - student.paid, // 15
    student.paymentDate || '', // 16
    student.paymentChannel || '', // 17
    student.staff || '', // 18
    // งวด 1
    student.payRound1_date || '',
    parseFloat(student.payRound1_amount) || 0,
    student.payRound1_channel || '',
    student.payRound1_staff || '',
    student.payRound1_time || '',
    // งวด 2
    student.payRound2_date || '',
    parseFloat(student.payRound2_amount) || 0,
    student.payRound2_channel || '',
    student.payRound2_staff || '',
    student.payRound2_time || '',
    // งวด 3
    student.payRound3_date || '',
    parseFloat(student.payRound3_amount) || 0,
    student.payRound3_channel || '',
    student.payRound3_staff || '',
    student.payRound3_time || '',
    // class hours
    student.classHours || '', // 34
    student.classHoursLeft || '' // 35
  ] : [
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
    student.paymentChannel || '',
    student.staff || '',
    student.classHours || '',
    student.classHoursLeft || ''
  ];

  

  if (sheetName.includes('เดี่ยว') || sheetName.includes('ย่อย')) {

    if (targetRowIndex === -1) {

      sheet.appendRow(rowData);

    } else {

      sheet.getRange(targetRowIndex, 1, 1, 36).setValues([rowData]);

    }

  } else {

    let targetRow = targetRowIndex;

    if (targetRowIndex === -1) {

      targetRow = sheet.getLastRow() + 1;

      sheet.getRange(targetRow, 1, 1, 10).setValues([[

        student.grade, student.name, student.nickname, student.school, student.classSection,

        student.contact, student.lineName, student.lineId, student.branchLearn, student.branchPay

      ]]);

      sheet.getRange(targetRow, 11).setValue(student.full || 0); 
      sheet.getRange(targetRow, 12).setValue(student.discount || 0); 
      sheet.getRange(targetRow, 13).setValue(student.outstanding !== undefined ? student.outstanding : ((student.full || 0) - (student.paid || 0)));
      sheet.getRange(targetRow, 14).setValue(student.paid || 0); 
      sheet.getRange(targetRow, 15).setValue(student.isCard ? 1 : 0);
      sheet.getRange(targetRow, 16).setValue(student.paymentDate || '');
      sheet.getRange(targetRow, 17).setValue(student.paymentChannel || '');
      sheet.getRange(targetRow, 18).setValue(student.staff || '');
      sheet.getRange(targetRow, 20, 1, 15).setValues([[
        student.payRound1_date || '',
        parseFloat(student.payRound1_amount) || 0,
        student.payRound1_channel || '',
        student.payRound1_staff || '',
        student.payRound1_time || '',
        student.payRound2_date || '',
        parseFloat(student.payRound2_amount) || 0,
        student.payRound2_channel || '',
        student.payRound2_staff || '',
        student.payRound2_time || '',
        student.payRound3_date || '',
        parseFloat(student.payRound3_amount) || 0,
        student.payRound3_channel || '',
        student.payRound3_staff || '',
        student.payRound3_time || ''
      ]]);
    } else {
      sheet.getRange(targetRow, 1, 1, 10).setValues([[
        student.grade, student.name, student.nickname, student.school, student.classSection,
        student.contact, student.lineName, student.lineId, student.branchLearn, student.branchPay
      ]]);
      sheet.getRange(targetRow, 11).setValue(student.full || 0);
      sheet.getRange(targetRow, 12).setValue(student.discount || 0);
      sheet.getRange(targetRow, 13).setValue(student.outstanding !== undefined ? student.outstanding : ((student.full || 0) - (student.paid || 0)));
      sheet.getRange(targetRow, 14).setValue(student.paid || 0);
      sheet.getRange(targetRow, 15).setValue(student.isCard ? 1 : 0);
      sheet.getRange(targetRow, 16).setValue(student.paymentDate || '');
      sheet.getRange(targetRow, 17).setValue(student.paymentChannel || '');
      sheet.getRange(targetRow, 18).setValue(student.staff || '');
      sheet.getRange(targetRow, 20, 1, 15).setValues([[
        student.payRound1_date || '',
        parseFloat(student.payRound1_amount) || 0,
        student.payRound1_channel || '',
        student.payRound1_staff || '',
        student.payRound1_time || '',
        student.payRound2_date || '',
        parseFloat(student.payRound2_amount) || 0,
        student.payRound2_channel || '',
        student.payRound2_staff || '',
        student.payRound2_time || '',
        student.payRound3_date || '',
        parseFloat(student.payRound3_amount) || 0,
        student.payRound3_channel || '',
        student.payRound3_staff || '',
        student.payRound3_time || ''
      ]]);
    }

    

    // Sync checked courses into columns 16+ in the grade sheet

    try {

      const selectedList = student.selectedCourses || [];

      if (selectedList.length > 0) {

        const lastCol = sheet.getLastColumn();

        if (lastCol >= 19) {

          const header1 = sheet.getRange(1, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

          const header2 = sheet.getRange(2, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

          const header4 = sheet.getRange(4, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

          

          const coursesInSheet = [];

          for (let j = 0; j < header1.length; j++) {

            if (header1[j]) {

              coursesInSheet.push({

                colIndex: (COURSE_START_COL - 1) + j,

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

            const isPartial = (userSessions !== null && userSessions !== undefined && userSessions !== c.sessions);

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

let cachedStatusValues_ = null;

function syncStudentToStatusDB(std, batch = false) {
  if (!batch) {
    computeCumulativePayment(std);
  }

  const sheet = getDb().getSheetByName('StatusDB');

  

  if (!cachedStatusValues_) {

    const lastRow = sheet.getLastRow();

    if (lastRow > 0) {

      cachedStatusValues_ = sheet.getRange(1, 1, lastRow, 41).getValues();

    } else {

      cachedStatusValues_ = [];

    }

  }

  

  let rowIndex = -1;

  let id = "";

  // 1. Search by ID first
  if (std.id) {
    for (let i = 0; i < cachedStatusValues_.length; i++) {
      const dbId = cachedStatusValues_[i][0] ? cachedStatusValues_[i][0].toString().trim() : "";
      if (dbId === std.id.toString().trim()) {
        rowIndex = i + 1;
        id = dbId;
        break;
      }
    }
  }

  // 2. Fallback to name and round
  if (rowIndex === -1) {
    for (let i = 0; i < cachedStatusValues_.length; i++) {

      const dbName = cachedStatusValues_[i][1] ? cachedStatusValues_[i][1].toString().trim() : "";

      const dbRound = cachedStatusValues_[i][15] ? cachedStatusValues_[i][15].toString().trim() : "";

      if (dbName === std.name && dbRound === std.round) {

        rowIndex = i + 1;

        id = cachedStatusValues_[i][0] ? cachedStatusValues_[i][0].toString().trim() : "";

        break;

      }

    }
  }

  

  const timestamp = new Date().getTime();

  if (rowIndex === -1) {

    id = std.id || `${std.name.replace(/\s+/g, '')}_${timestamp}_${std.round}`;
    std.id = id;

  } else {
    std.id = id;
  }

  

    let normalizedClassType = std.classType || '';
    if (normalizedClassType.includes('เดี่ยว') && !normalizedClassType.includes('เด็กเดี่ยว')) {
        normalizedClassType = 'เด็กเดี่ยว';
    } else if (normalizedClassType.includes('ย่อย')) {
        if (normalizedClassType.includes('2-3')) normalizedClassType = 'ย่อย 2-3';
        else if (normalizedClassType.includes('4-5')) normalizedClassType = 'ย่อย 4-5';
        else if (normalizedClassType.includes('6-10')) normalizedClassType = 'ย่อย 6-10';
        else normalizedClassType = 'ย่อย'; // Fallback
    } else if (normalizedClassType.includes('กลุ่มหลัก') || normalizedClassType === 'Main Class') {
        normalizedClassType = 'กลุ่มหลัก';
    }

    let existing = null;
    if (rowIndex !== -1 && cachedStatusValues_) {
        existing = cachedStatusValues_[rowIndex - 1];
    }
    
    const safeNum = (val) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);

    const rowValues = [
    id,
    std.name,
    std.nickname,
    std.school,
    formatPhoneNumber(std.contact),
    std.branchLearn,
    std.branchPay,
    std.paymentTimeNote || '',
    std.extraNote || '',
    std.paid,
    std.full,
    std.outstanding,
    std.paymentDate || '',
    std.paymentChannel || '',
    std.staff || '',
    std.round,
    std.grade,
    std.classSection || '',
    std.lineName || '',
    std.lineId || '',
    std.carriedForwardFee || 0,
    std.classHours || '',
    std.classHoursLeft || '',
    normalizedClassType,

    std.payRound1_date || (existing ? existing[24] : ''),
    safeNum(std.payRound1_amount || (existing ? existing[25] : 0)),
    std.payRound1_channel || (existing ? existing[26] : ''),
    std.payRound1_staff || (existing ? existing[27] : ''),
    std.payRound1_time || (existing ? existing[28] : ''),

    std.payRound2_date || (existing ? existing[29] : ''),
    safeNum(std.payRound2_amount || (existing ? existing[30] : 0)),
    std.payRound2_channel || (existing ? existing[31] : ''),
    std.payRound2_staff || (existing ? existing[32] : ''),
    std.payRound2_time || (existing ? existing[33] : ''),

    std.payRound3_date || (existing ? existing[34] : ''),
    safeNum(std.payRound3_amount || (existing ? existing[35] : 0)),
    std.payRound3_channel || (existing ? existing[36] : ''),
    std.payRound3_staff || (existing ? existing[37] : ''),
    std.payRound3_time || (existing ? existing[38] : ''),
    Array.isArray(std.selectedCourses) ? std.selectedCourses.join(', ') : (std.selectedCourses || (existing ? existing[39] : ''))
  ];

  

  if (batch) {
    return {
      type: rowIndex === -1 ? 'append' : 'update',
      rowIndex: rowIndex,
      values: rowValues,
      std: std,
      id: id
    };
  }

  if (rowIndex === -1) {

    sheet.appendRow(rowValues);

    cachedStatusValues_.push(rowValues);
    
    // Add initial payment to PaymentsDB for new registrations
    if (parseFloat(std.paid) > 0) {
      try {
        addPayment({
          StudentID: id,
          Amount: std.paid,
          Date: std.paymentDate || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd'),
          Channel: std.paymentChannel || 'ชำระแรกเข้า',
          Receiver: std.staff || 'System',
          Round: 'แรกเข้า',
          Note: std.paymentTimeNote || std.extraNote || 'จากการลงทะเบียนครั้งแรก'
        });
      } catch (e) {
        Logger.log('Error adding initial payment to PaymentsDB: ' + e);
      }
    }

  } else {
    std.id = id;
    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    cachedStatusValues_[rowIndex - 1] = rowValues;
  }

  // Invalidate students cache

  invalidateStudentCache();

}

function calculateIndividualCourseFee(classType, grade, roundText, subSize) {

  let price = 2000;

  if (classType && classType.includes('เดี่ยว')) {

    const cleanRound = (roundText || '').toLowerCase().trim();

    const isEx = cleanRound.endsWith('ex') || cleanRound.includes('ex');

    if (['ม.4', 'ม.5', 'ม.6'].includes(grade) || isEx) {

      price = 2500;

    } else {

      price = 2000;

    }

  } else if (classType && (classType.includes('ย่อย') || classType.includes('กลุ่มย่อย'))) {

    const size = subSize || '';

    if (size.includes('2-3')) {

      price = 3000;

    } else if (size.includes('4-5')) {

      price = 2500;

    } else if (size.includes('6-10')) {

      price = 2000;

    }

  }

  return price;

}

function addStudentRegistration(student, logUser) {
  computeCumulativePayment(student);

  checkTeacherBlock(logUser);

  try {

    const sheet = getDb().getSheetByName('StatusDB');

    if (!sheet) throw new Error('StatusDB sheet not found');

    

    // Handle subgroup registrations (split into multiple individual records)

    if (student.isSubgroupNewLogic && student.subgroupStudents && student.subgroupStudents.length > 0) {

      let lastResult = null;

      for (let i = 0; i < student.subgroupStudents.length; i++) {

          const sgMember = student.subgroupStudents[i];

          

          const memberStudent = Object.assign({}, student, {

              name: sgMember.name,

              nickname: sgMember.nickname,

              school: sgMember.school,

              contact: sgMember.contact,

              grade: sgMember.grade,

              classSection: sgMember.classSection,

              lineName: sgMember.lineName,

              lineId: sgMember.lineId,

              

              full: sgMember.full,

              paid: sgMember.paid,

              

              payRound1_amount: sgMember.payRound1_amount,

              payRound1_date: sgMember.payRound1_date,

              payRound1_channel: sgMember.payRound1_channel,

              payRound1_staff: sgMember.payRound1_staff,

              payRound1_time: sgMember.payRound1_time,

              

              payRound2_amount: sgMember.payRound2_amount,

              payRound2_date: sgMember.payRound2_date,

              payRound2_channel: sgMember.payRound2_channel,

              payRound2_staff: sgMember.payRound2_staff,

              payRound2_time: sgMember.payRound2_time,

              

              payRound3_amount: sgMember.payRound3_amount,

              payRound3_date: sgMember.payRound3_date,

              payRound3_channel: sgMember.payRound3_channel,

              payRound3_staff: sgMember.payRound3_staff,

              payRound3_time: sgMember.payRound3_time,

              

              isSubgroupNewLogic: false,

              subgroupStudents: null,

              subgroupStudentList: null

          });

          

          lastResult = addStudentRegistration(memberStudent, logUser);

      }

      

      logActivity(logUser, 'ลงทะเบียนกลุ่มย่อย', `นักเรียน: ${student.subgroupStudents.map(m => m.name).join(', ')} คอร์ส: ${student.subgroupCourses.join(', ')}`);

      invalidateStudentCache();

      return { success: true, id: lastResult ? lastResult.id : 'SUBGROUP' };

    }

    // Check if subgroupCourses is present and has items (multiple courses)

    if (student.subgroupCourses && student.subgroupCourses.length > 0) {

      let lastId = '';

      const totalPaid = parseFloat(student.paid) || 0;

      const totalFull = parseFloat(student.full) || 0;

      

      // Build note text

      const noteText = `ชำระรวม ${totalPaid.toLocaleString()} บาท`;

      let extraNote = student.extraNote || '';

      if (!extraNote.includes('ชำระรวม')) {

        extraNote = noteText + (extraNote ? ' | ' + extraNote : '');

      }

      

      student.subgroupCourses.forEach((round, index) => {

        const timestamp = new Date().getTime() + index;

        const id = `${student.name.replace(/\s+/g, '')}_${timestamp}_${round}`;

        

        let singleFee = student.full;

        if (student.subgroupCourses.length > 1) {

          singleFee = calculateIndividualCourseFee(student.classType, student.grade, round, student.subgroupCoursesSize);

        }

        

        // Average/proportional allocation of paid amount

        const proportionalPaid = totalFull > 0 ? (singleFee / totalFull) * totalPaid : 0;

        const full = singleFee;

        const outstanding = full - proportionalPaid;

        

        const studentCopy = Object.assign({}, student, {
          id: id,
          round: round,
          full: full,
          paid: proportionalPaid,
          outstanding: outstanding,
          extraNote: extraNote
        });

        
        syncStudentToStatusDB(studentCopy);

        

        try {

          syncToGradeSheet(studentCopy);

        } catch (e) {}

        

        lastId = id;

      });

      

      logActivity(logUser, 'ลงทะเบียนเด็กใหม่ (หลายคอร์ส)', `นักเรียน: ${student.name} คอร์สทั้งหมด: ${student.subgroupCourses.join(', ')}`);

      invalidateStudentCache();

      return { success: true, id: lastId };

    } else {

      const timestamp = new Date().getTime();

      const round = student.round || 'Summer69';

      const id = `${student.name.replace(/\s+/g, '')}_${timestamp}_${round}`;

      student.id = id;

      syncStudentToStatusDB(student);

      syncToGradeSheet(student);

      logActivity(logUser, 'ลงทะเบียนเด็กใหม่', `นักเรียน: ${student.name} คอร์ส: ${round} ยอดเต็ม: ${student.full}`);

      invalidateStudentCache();

      return { success: true, id: id };

    }

  } catch (err) {

    return { success: false, error: err.message };

  }

}

function updateStudentRegistration(student, logUser) {
  computeCumulativePayment(student);

  checkTeacherBlock(logUser);

  try {

    const sheet = getDb().getSheetByName('StatusDB');

    if (!sheet) throw new Error('StatusDB sheet not found');

    

    const lastRow = sheet.getLastRow();

    const keys = sheet.getRange(1, 1, lastRow, 1).getValues();

    

    let rowIndex = -1;

    

    syncStudentToStatusDB(student);

    syncToGradeSheet(student);

    logActivity(logUser, 'แก้ไขรายละเอียดเด็กนักเรียน', `นักเรียน: ${student.name} (ID: ${student.id})`);

    invalidateStudentCache();

    return { success: true };

  } catch (err) {

    return { success: false, error: err.message };

  }

}

function deleteStudentRegistration(id, logUser) {

  checkTeacherBlock(logUser);

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

    

    const rowVals = sheet.getRange(rowIndex, 1, 1, 24).getValues()[0];

    const stdName = rowVals[1] ? rowVals[1].toString().trim() : '';

    const classType = rowVals[23] ? rowVals[23].toString().trim() : 'เดี่ยว';

    const grade = rowVals[16] ? rowVals[16].toString().trim() : 'อนุบาล';

    const branchLearn = rowVals[5] ? rowVals[5].toString().trim() : '';

    const round = rowVals[15] ? rowVals[15].toString().trim() : '';

    

    // Delete from Grade Sheet

    try {

      const db = getDb();

      let targetSheetName = '';

      if (classType.includes('เดี่ยว')) {

        targetSheetName = `เดี่ยว ${grade}`;

      } else if (classType.includes('ย่อย')) {

        if (classType.includes('2-3')) targetSheetName = 'ย่อย 2-3';

        else if (classType.includes('4-5')) targetSheetName = 'ย่อย 4-5';

        else if (classType.includes('6-10')) targetSheetName = 'ย่อย 6-10';

      } else {

        let suffix = '1';

        if (branchLearn.includes('สาขา2')) suffix = '2';

        else if (branchLearn.includes('สาขา3')) suffix = '3';

        targetSheetName = `${grade}/${suffix}`;

      }

      

      const gradeSheet = db.getSheetByName(targetSheetName);

      if (gradeSheet) {

        const gLastRow = gradeSheet.getLastRow();

        const startRow = targetSheetName.includes('เดี่ยว') || targetSheetName.includes('ย่อย') ? 12 : 6;

        if (gLastRow >= startRow) {

          const gRange = gradeSheet.getRange(startRow, 2, gLastRow - (startRow - 1), 10).getValues();

          for (let k = 0; k < gRange.length; k++) {

            // Match student name, and also round/course for private sheets

            const matchesName = gRange[k][0].toString().trim() === stdName;

            const matchesRound = targetSheetName.includes('เดี่ยว') ? gRange[k][9].toString().trim() === round : true;

            if (matchesName && matchesRound) {

              gradeSheet.deleteRow(k + startRow);

              break; // Remove only the first match

            }

          }

        }

      }

    } catch (sheetErr) {

      Logger.log(`Could not delete from grade sheet: ${sheetErr.message}`);

    }

    

    sheet.deleteRow(rowIndex);

    logActivity(logUser, 'ลบข้อมูลลงทะเบียนเรียน', `นักเรียน: ${stdName} (ID: ${id})`);

    invalidateStudentCache();

    return { success: true };

  } catch (err) {

    return { success: false, error: err.message };

  }

}

// ----------------------------------------------------

// Grade-Level Registration Sheet Grid Editor (เช่น ม.1/2)

// ----------------------------------------------------

function getGradeSheetData(grade, branch, logUser, searchTerm) {

  if (logUser) checkTeacherBlock(logUser);
  migrateAllSheetsIfNeeded();

  try {
    const db = getDb();
    
    // StatusDB mapping removed by request

    const suffixes = ['1', '2', '3'];
    const allCourses = [];
    const allStudents = [];
    
    let gradesToFetch = [grade];
    if (grade === 'all') {
      gradesToFetch = ['อนุบาล', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
    }
    
    const term = (searchTerm || '').toLowerCase().trim();

    gradesToFetch.forEach(g => {
      suffixes.forEach(suffix => {
        const sheetName = `${g}/${suffix}`;
        const sheet = db.getSheetByName(sheetName);
        if (!sheet) return;

      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow < 5) return;

      const branchName = `สาขา${suffix}`;
      const sheetCourses = [];

      if (lastCol >= 15) {
        const fullHeader = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        let colOutstanding = -1, colPaid = -1;
        for (let c = 0; c < fullHeader.length; c++) {
            const val = fullHeader[c].toString().trim();
            if (['คงเหลือ', 'ยอดค้าง'].includes(val)) colOutstanding = c + 1;
            if (['ยอดจ่าย', 'จ่าย', 'ชำระแล้ว', 'ยอดชำระมา'].includes(val)) colPaid = c + 1;
        }
        let startCourseCol = COURSE_START_COL;
        for (let c = 15; c <= lastCol; c++) {
            const val = fullHeader[c - 1] ? fullHeader[c - 1].toString().trim() : '';
            if (val && !['ยอดจ่าย', 'คงเหลือ', 'ราคาเต็ม', 'จ่าย', 'ชำระแล้ว'].includes(val) && val.length > 2) {
                if (c > colOutstanding && c > colPaid) {
                    startCourseCol = c;
                    break;
                }
            }
        }
        
        if (startCourseCol <= lastCol) {
          const numCols = lastCol - (startCourseCol - 1);
          const headerRow1 = sheet.getRange(1, startCourseCol, 1, numCols).getValues()[0];
          const headerRow2 = sheet.getRange(2, startCourseCol, 1, numCols).getValues()[0];
          const headerRow3 = sheet.getRange(3, startCourseCol, 1, numCols).getValues()[0];
          const headerRow4 = sheet.getRange(4, startCourseCol, 1, numCols).getValues()[0];
  
          for (let i = 0; i < headerRow1.length; i++) {
            if (headerRow1[i]) {
              const cName = headerRow1[i].toString().trim();
              if (cName && !['ยอดจ่าย', 'คงเหลือ', 'ราคาเต็ม', 'จ่าย', 'ชำระแล้ว'].includes(cName)) {
                sheetCourses.push({
                  colIndex: startCourseCol + i,
                  courseName: cName,
                  price: parseFloat(headerRow2[i]) || 0,
                  dayTime: headerRow3[i] ? headerRow3[i].toString().trim() : '',
                  totalSessions: parseInt(headerRow4[i]) || 10,
                  sheetName: sheetName,
                  branch: branchName
                });
              }
            }
          }
        }
      }

      allCourses.push(...sheetCourses);

      if (lastRow >= 6) {
        const studentData = sheet.getRange(6, 1, lastRow - 5, lastCol).getValues();
        studentData.forEach((row, idx) => {
          const name = row[1] ? row[1].toString().trim() : '';
          if (!name) return;
          const studentId = row[18] ? row[18].toString().trim() : '';
          
          if (term) {
            const colA = (row[0] || '').toString().toLowerCase();
            const colB = name.toLowerCase();
            const colG = (row[6] || '').toString().toLowerCase();
            if (!colA.includes(term) && !colB.includes(term) && !colG.includes(term)) {
              return;
            }
          }

          

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

            

            full: parseFloat(row[10]) || 0, 
            
            studentId: studentId,

            discount: parseFloat(row[11]) || 0, 

            outstanding: parseFloat(row[12]) || 0, 

            paid: parseFloat(row[13]) || 0, 

            isCard: parseInt(row[14]) === 1 ? 1 : 0, 

            paymentChannel: row[16] ? row[16].toString().trim() : 'กสิกร บัญชีบริษัท(สแกน)', // Column Q (17) -> index 16
            staff: row[17] ? row[17].toString().trim() : '', // Column R (18) -> index 17
            
            courseValues: courseValues,

            sheetName: sheetName,

            branch: branchName

          });

        });

      }

    });
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

  checkTeacherBlock(logUser);

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

        var fullCourseName = c.courseName.trim();

        var dayTimeStr = (c.dayTime || '').trim();

        if (dayTimeStr && !fullCourseName.includes(dayTimeStr)) {

          fullCourseName = fullCourseName + ' ' + dayTimeStr;

        }

        sheet.getRange(1, c.colIndex).setValue(fullCourseName);

        sheet.getRange(2, c.colIndex).setValue(c.price);

        sheet.getRange(3, c.colIndex).setValue(c.dayTime || '');

        sheet.getRange(4, c.colIndex).setValue(c.totalSessions);

      });

      

      const lastCol = sheet.getLastColumn();

      

      sheetStudentsUpdate.forEach(s => {

        const row = s.rowIndex;

        

        // Recalculate subtotal using only courses belonging to this sheet
        // Use same promotion discount logic as frontend: 3rd course 30% off, 4th+ 50% off

        let fullCourses = [];
        let partialGross = 0;
        let partialNet = 0;

        sheetCoursesUpdate.forEach(c => {
          const val = s.courseValues[c.colIndex];
          if (val !== '' && !isNaN(val)) {
            const num = parseFloat(val);
            const price = parseFloat(c.price) || 0;
            const totalSessions = parseInt(c.totalSessions) || 10;
            
            if (num === 30) {
              partialGross += price;
              partialNet += price * 0.7;
            } else if (num === 20) {
              partialGross += price;
              partialNet += price * 0.9;
            } else if (num === 50) {
              partialGross += price;
              partialNet += price * 0.5;
            } else if (num >= 1 && num <= 2) {
              partialGross += num * 350;
              partialNet += num * 350;
            } else if (num >= 3) {
              if (num === totalSessions) {
                fullCourses.push(price);
              } else {
                const itemPrice = num * (price / totalSessions);
                partialGross += itemPrice;
                partialNet += itemPrice;
              }
            }
          }
        });
        
        // Sort full-price courses descending for promotion discount
        fullCourses.sort(function(a, b) { return b - a; });
        let fullGross = 0;
        let fullNet = 0;
        fullCourses.forEach(function(price, idx) {
          fullGross += price;
          if (idx === 0 || idx === 1) {
            fullNet += price;           // 1st & 2nd: full price
          } else if (idx === 2) {
            fullNet += price * 0.7;     // 3rd: 30% off
          } else {
            fullNet += price * 0.5;     // 4th+: 50% off
          }
        });
        
        let grossTotal = partialGross + fullGross;
        let netTotal = partialNet + fullNet;
        
        if (s.isCard) {
          grossTotal *= 1.03;
          netTotal *= 1.03;
        }
        
        const autoDiscount = Math.round((grossTotal - netTotal) * 100) / 100;
        
        const full = Math.round(grossTotal * 100) / 100;
        const outstanding = Math.round(Math.max(0, full - autoDiscount - s.paid) * 100) / 100;
        
        // Set discount to auto-calculated promotion discount
        s.discount = autoDiscount;

        

        // Batch student data update in a single setValues() call!

        const rowVals = new Array(lastCol).fill('');

        rowVals[0] = s.grade || grade;

        rowVals[1] = s.name;

        rowVals[2] = s.nickname;

        rowVals[3] = s.school;

        rowVals[4] = s.classSection;

        rowVals[5] = s.contact;

        rowVals[6] = s.lineName;

        rowVals[7] = s.lineId;

        rowVals[8] = s.branchLearn;

        rowVals[9] = s.branchPay;

        rowVals[10] = full;

        rowVals[11] = s.discount;

        rowVals[12] = outstanding;

        rowVals[13] = s.paid;

        rowVals[14] = s.isCard ? 1 : 0;
        
        rowVals[18] = s.studentId || '';

        

        for (const colIndex in s.courseValues) {

          const colIdx0 = parseInt(colIndex) - 1;

          if (colIdx0 < lastCol) {

            rowVals[colIdx0] = s.courseValues[colIndex];

          }

        }

        

        sheet.getRange(row, 1, 1, lastCol).setValues([rowVals]);

        

        // syncStudentToStatusDB removed by request

      });

    });

    

    logActivity(logUser, 'แก้ไขห้องเรียนแยกสาขา (รวม)', `แก้ไขชีตระดับชั้น ${grade} รวมทุกสาขา จำนวนที่ส่งอัปเดต ${studentsUpdate.length} คน`);

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function addNewCourseColumn(grade, branch, courseName, price, dayTime, sessions, logUser) {

  checkTeacherBlock(logUser);

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

    

    sheet.getRange(1, targetCol).setValue(courseName + (dayTime ? ' ' + dayTime.trim() : ''));

    sheet.getRange(2, targetCol).setValue(price);

    sheet.getRange(3, targetCol).setValue(dayTime || ''); 

    sheet.getRange(4, targetCol).setValue(parseInt(sessions) || 10); 

    

    logActivity(logUser, 'เพิ่มคอร์สเรียนแยกห้อง', `ชีต ${sheetName} เพิ่มคอร์ส ${courseName} ราคา ${price} จำนวนครั้ง ${sessions} วัน/เวลา ${dayTime || ''}`);

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function addNewCoursesBatch(grade, branch, courseList, logUser) {

  checkTeacherBlock(logUser);

  try {

    const db = getDb();

    let suffix = '1';

    if (branch.includes('สาขา2')) suffix = '2';

    else if (branch.includes('สาขา3')) suffix = '3';

    

    const sheetName = `${grade}/${suffix}`;

    const sheet = db.getSheetByName(sheetName);

    if (!sheet) throw new Error(`ไม่พบชีตห้องเรียน ${sheetName}`);

    

    const lastCol = sheet.getLastColumn();

    

    // Write each course in adjacent columns

    courseList.forEach((c, idx) => {

      const targetCol = lastCol + 1 + idx;

      sheet.getRange(1, targetCol).setValue(c.courseName + (c.dayTime ? ' ' + c.dayTime.trim() : ''));

      sheet.getRange(2, targetCol).setValue(c.price);

      sheet.getRange(3, targetCol).setValue(c.dayTime || '');

      sheet.getRange(4, targetCol).setValue(parseInt(c.sessions) || 10);

      

      logActivity(logUser, 'เพิ่มคอร์สเรียนแยกห้อง', `ชีต ${sheetName} เพิ่มคอร์ส ${c.courseName} ราคา ${c.price} จำนวนครั้ง ${c.sessions} วัน/เวลา ${c.dayTime || ''}`);

    });

    

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function deleteCourseColumn(grade, branch, sheetName, colIndex, courseName, logUser) {

  checkTeacherBlock(logUser);

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

    // ensureDataLearnMigrated(db);

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

      const sheetStudents = recalculatePrivateSheetHours(sName);

      students.push(...sheetStudents);

    });

    return { success: true, sheetName: sheetName, students: students };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function getBaseCourseName(courseName) {

  if (!courseName) return '';

  const clean = courseName.toString().trim();

  const match = clean.match(/(.+?)\s+(\d+)$/);

  if (match) {

    const base = match[1].trim();

    if (!base.endsWith('ป.') && !base.endsWith('ม.')) {

      return base;

    }

  }

  return clean;

}

function matchCourseNameIgnoringRound(dlSubject, baseCourseName) {

  if (!dlSubject || !baseCourseName) return false;

  const cleanDl = getBaseCourseName(dlSubject).toLowerCase().replace(/\s+/g, '').trim();

  const cleanBase = baseCourseName.toLowerCase().replace(/\s+/g, '').trim();

  return cleanDl === cleanBase || cleanDl.indexOf(cleanBase) !== -1 || cleanBase.indexOf(cleanDl) !== -1;

}

function recalculatePrivateSheetHours(sName) {

  const db = getDb();

  const sheet = getOrCreateSheet(sName);

  if (!sheet) return [];

  

  const learnSheet = db.getSheetByName('Data Learn');

  const learnData = learnSheet ? learnSheet.getDataRange().getValues() : [];

  

  let studentsList = [];

  let needsReRun = true;

  let iterations = 0;

  

  while (needsReRun && iterations < 3) {

    needsReRun = false;

    iterations++;

    var hasChanges = false;

    

    const lastRow = sheet.getLastRow();

    const lastCol = sheet.getLastColumn();

    if (lastRow < 12) return [];

    

    const rawRange = sheet.getRange(12, 1, lastRow - 11, lastCol);
    const rawData = rawRange.getValues();
    
    const headers = sheet.getRange(11, 1, 1, lastCol).getValues()[0];
    let payDateColIdx = 16;
    let staffColIdx = 18;
    headers.forEach((h, i) => {
      const hd = h.toString().trim();
      if (hd === 'วันที่ชำระเงิน') payDateColIdx = i;
      if (hd === 'ผู้รับเงิน') staffColIdx = i;
    });

    

    const groups = {};

    rawData.forEach((row, idx) => {

      const name = row[1] ? row[1].toString().trim() : '';

      if (!name) return;

      const nickname = row[2] ? row[2].toString().trim() : '';

      const courseName = row[10] ? row[10].toString().trim() : '';

      const baseCourseName = getBaseCourseName(courseName);

      

      const groupKey = name + '|||' + baseCourseName;

      if (!groups[groupKey]) groups[groupKey] = [];

      groups[groupKey].push({

        idx: idx,

        row: row,

        name: name,

        nickname: nickname,

        courseName: courseName,

        baseCourseName: baseCourseName

      });

    });

    

    studentsList = [];

    

    for (const groupKey in groups) {

      const groupRows = groups[groupKey];

      const firstRow = groupRows[0];

      const nickname = firstRow.nickname;

      const name = firstRow.name;

      const baseCourseName = firstRow.baseCourseName;

      

      let grandTotalMinutes = 0;

      for (let j = 1; j < learnData.length; j++) {

        const dlRow = learnData[j];

        const dlSubject = dlRow[0] ? dlRow[0].toString().trim() : '';

        

        const isPresent = (parseInt(dlRow[6], 10) || 0) >= 1 || 

                          (parseInt(dlRow[7], 10) || 0) >= 1 || 

                          (parseInt(dlRow[10], 10) || 0) >= 1;

        if (isPresent) {

          const hoursStr = dlRow[11] ? dlRow[11].toString().trim() : '';

          const mins = parseHoursStrToMinutes(hoursStr);

          const nameMatch = (nickname && dlSubject.indexOf(nickname) !== -1) || (name && dlSubject.indexOf(name) !== -1);

          if (nameMatch && matchCourseNameIgnoringRound(dlSubject, baseCourseName)) {

            grandTotalMinutes += mins;

          }

        }

      }

      

      for (let rIdx = 0; rIdx < groupRows.length; rIdx++) {

        const gr = groupRows[rIdx];

        const row = gr.row;

        const rowIndex = gr.idx + 12;

        

        const rate = getPrivateStudentRate(sName, gr.courseName) || 250;

        const isPrivate = sName.indexOf('เดี่ยว') !== -1;

        const defaultHours = isPrivate ? 8 : 16;

        const courseMins = defaultHours * 60;

        

        const paid = parseFloat(row[14]) || 0;

        const carriedForward = parseFloat(row[12]) || 0;

        const limitMins = paid + carriedForward > 0 ? Math.round(((paid + carriedForward) / rate) * 60) : courseMins;

        

        let assignedMinutes = 0;

        let isLastRound = (rIdx === groupRows.length - 1);

        if (isLastRound) {

          assignedMinutes = grandTotalMinutes;

        } else {

          assignedMinutes = Math.min(grandTotalMinutes, limitMins);

          grandTotalMinutes -= assignedMinutes;

        }

        

        const remainingMins = limitMins - assignedMinutes;

        const hoursAccumulatedStr = formatMinutesToHoursLeft(assignedMinutes);

        const hoursLeftStr = formatMinutesToHoursLeft(remainingMins);

        

        // Calculate real-time financial balance based on actual hours studied

        const realTimeFull = (assignedMinutes * rate) / 60;

        const realTimeOutstanding = (paid + carriedForward) - realTimeFull;

        

        const currentHours = row[19] ? row[19].toString().trim() : '';

        const currentHoursLeft = row[20] ? row[20].toString().trim() : '';

        const currentOutstanding = parseFloat(row[15]) || 0;

        const currentFull = parseFloat(row[13]) || 0;

        

        if (hoursAccumulatedStr !== currentHours || hoursLeftStr !== currentHoursLeft || Math.abs(realTimeOutstanding - currentOutstanding) > 0.01 || Math.abs(realTimeFull - currentFull) > 0.01) {

          row[19] = hoursAccumulatedStr;

          row[20] = hoursLeftStr;

          row[13] = realTimeFull;

          row[15] = realTimeOutstanding;

          hasChanges = true;

        }

        

        let note = row[11] ? row[11].toString().trim() : '';

        if (isLastRound && assignedMinutes >= limitMins && note.indexOf('เรียนครบแล้ว') === -1) {

          const nextCourseName = getNextCourseName(gr.courseName);

          const isNextRoundPresent = rawData.some(r => {

            const rName = r[1] ? r[1].toString().trim() : '';

            const rNick = r[2] ? r[2].toString().trim() : '';

            const rCourse = r[10] ? r[10].toString().trim() : '';

            return (rName === name || rNick === nickname) && matchCourseName(rCourse, nextCourseName);

          });

          

          if (!isNextRoundPresent) {

            const nextCoursePrice = (courseMins * rate) / 60;

            const nextHoursStr = isPrivate ? '08:00' : '16:00';

            

            const previousFull = parseFloat(row[13]) || 0;

            const previousPaid = parseFloat(row[14]) || 0;

            const previousCarried = parseFloat(row[12]) || 0;

            const previousOutstanding = previousFull - previousPaid - previousCarried;

            

            const newCarriedForward = -previousOutstanding;

            const newOutstanding = nextCoursePrice - newCarriedForward;

            

            const nextRow = [

              row[0] ? row[0].toString().trim() : '',

              name,

              nickname,

              row[3] ? row[3].toString().trim() : '',

              row[4] ? row[4].toString().trim() : '',

              row[5] ? row[5].toString().trim() : '',

              row[6] ? row[6].toString().trim() : '',

              row[7] ? row[7].toString().trim() : '',

              row[8] ? row[8].toString().trim() : '',

              row[9] ? row[9].toString().trim() : '',

              nextCourseName,

              '',

              newCarriedForward,

              nextCoursePrice,

              0,

              newOutstanding,

              '',

              '',

              '',

              '0 ชม. 0 นาที',

              formatMinutesToHoursLeft(courseMins)

            ];

            

            sheet.appendRow(nextRow);

            note = 'เรียนครบแล้ว (ต่อคอร์สใหม่: ' + nextCourseName + ')';

            row[11] = note;

            hasChanges = true;

            

            syncStudentToStatusDB({

              name: name,

              nickname: nickname,

              school: row[3] ? row[3].toString().trim() : '',

              contact: row[5] ? row[5].toString().trim() : '',

              branchLearn: row[8] ? row[8].toString().trim() : '',

              branchPay: row[9] ? row[9].toString().trim() : '',

              full: nextCoursePrice,

              paid: 0,

              outstanding: newOutstanding,

              carriedForwardFee: newCarriedForward,

              grade: getGradeFromSheetName(sName),

              classSection: row[4] ? row[4].toString().trim() : '',

              lineName: row[6] ? row[6].toString().trim() : '',

              lineId: row[7] ? row[7].toString().trim() : '',

              classHours: nextHoursStr,

              classHoursLeft: formatMinutesToHoursLeft(courseMins),

              classType: row[0] ? row[0].toString().trim() : '',

              round: nextCourseName

            });

            needsReRun = true;

          } else {

            note = 'เรียนครบแล้ว (ต่อคอร์สใหม่: ' + nextCourseName + ')';

            row[11] = note;

            hasChanges = true;

          }

        }

        

        studentsList.push({

          id: row[0] ? row[0].toString().trim() : '',

          rowIndex: rowIndex,

          sheetName: sName,

          grade: getGradeFromSheetName(sName),

          classType: row[0] ? row[0].toString().trim() : '',

          name: name,

          nickname: nickname,

          school: row[3] ? row[3].toString().trim() : '',

          classSection: row[4] ? row[4].toString().trim() : '',

          contact: row[5] ? row[5].toString().trim() : '',

          lineName: row[6] ? row[6].toString().trim() : '',

          lineId: row[7] ? row[7].toString().trim() : '',

          branchLearn: row[8] ? row[8].toString().trim() : '',

          branchPay: row[9] ? row[9].toString().trim() : '',

          courseName: gr.courseName,

          note: note,

          carriedForward: carriedForward,

          full: parseFloat(row[13]) || 0,

          paid: paid,

          outstanding: (parseFloat(row[13]) || 0) - paid - carriedForward,

          paymentDate: row[payDateColIdx] ? row[payDateColIdx].toString().trim() : '',

          paymentChannel: row[17] ? row[17].toString().trim() : '',

          staff: row[staffColIdx] ? row[staffColIdx].toString().trim() : '',

          hours: hoursAccumulatedStr,

          hoursLeft: hoursLeftStr

        });

      }

    }

    

    if (hasChanges) {

      rawRange.setValues(rawData);

    }

  }

  return studentsList;

}

function getPrivateStudentRate(sheetName, courseName) {

  let rate = 250;

  if (sheetName.indexOf('เดี่ยว') !== -1) {

    const isEx = courseName.toLowerCase().includes('ex');

    const gradesHigh = ['ม.4', 'ม.5', 'ม.6'];

    let isHighGrade = false;

    gradesHigh.forEach(g => {

      if (sheetName.indexOf(g) !== -1) isHighGrade = true;

    });

    if (isHighGrade || isEx) {

      rate = 312.5;

    } else {

      rate = 250;

    }

  } else { // กลุ่มย่อย

    if (sheetName.indexOf('2-3') !== -1) rate = 187.5;

    else if (sheetName.indexOf('4-5') !== -1) rate = 156.25;

    else if (sheetName.indexOf('6-10') !== -1) rate = 125;

  }

  return rate;

}

function savePrivateStudentPayment(sheetName, name, courseName, paymentData, logUser) {

  checkTeacherBlock(logUser);

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

    

    const rate = getPrivateStudentRate(sheetName, courseName);

    

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

    

    logActivity(logUser, 'อัปเดตยอดเงินเด็กเดี่ยว/ย่อย', `นักเรียน: ${name} ค่าเรียนต่อรอบ: ${full} ชำระ: ${paid} ในชีต ${sheetName}`);

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

// ----------------------------------------------------

// Update Private Student Info (profile/basic data edit)

// ----------------------------------------------------

function updatePrivateStudentInfo(sheetName, originalName, originalCourseName, rowIndex, studentInfo, logUser) {

  checkTeacherBlock(logUser);

  try {

    const db = getDb();

    const sheet = db.getSheetByName(sheetName);

    if (!sheet) throw new Error(`ไม่พบชีตข้อมูล ${sheetName}`);

    // Validate rowIndex is within data range

    const lastRow = sheet.getLastRow();

    if (rowIndex < 12 || rowIndex > lastRow) throw new Error(`rowIndex ${rowIndex} ไม่ถูกต้อง`);

    // Update personal info columns (columns 1-10, 1-indexed)

    // Col A (1) = classType, B (2) = name, C (3) = nickname, D (4) = school,

    // E (5) = classSection, F (6) = contact, G (7) = lineName, H (8) = lineId,

    // I (9) = branchLearn, J (10) = branchPay

    sheet.getRange(rowIndex, 2).setValue(studentInfo.name || originalName);

    sheet.getRange(rowIndex, 3).setValue(studentInfo.nickname || '');

    sheet.getRange(rowIndex, 4).setValue(studentInfo.school || '');

    sheet.getRange(rowIndex, 5).setValue(studentInfo.classSection || '');

    sheet.getRange(rowIndex, 6).setValue(studentInfo.contact || '');

    sheet.getRange(rowIndex, 7).setValue(studentInfo.lineName || '');

    sheet.getRange(rowIndex, 8).setValue(studentInfo.lineId || '');

    sheet.getRange(rowIndex, 9).setValue(studentInfo.branchLearn || '');

    sheet.getRange(rowIndex, 10).setValue(studentInfo.branchPay || '');

    // Sync updated info to StatusDB

    const existingRow = sheet.getRange(rowIndex, 1, 1, 21).getValues()[0];

    const full = parseFloat(existingRow[13]) || 0;

    const paid = parseFloat(existingRow[14]) || 0;

    const carriedForward = parseFloat(existingRow[12]) || 0;

    const outstanding = full - paid - carriedForward;

    syncStudentToStatusDB({

      name: studentInfo.name || originalName,

      nickname: studentInfo.nickname || '',

      school: studentInfo.school || '',

      contact: studentInfo.contact || '',

      branchLearn: studentInfo.branchLearn || '',

      branchPay: studentInfo.branchPay || '',

      full: full,

      paid: paid,

      outstanding: -outstanding,

      carriedForwardFee: carriedForward,

      grade: getGradeFromSheetName(sheetName),

      classSection: studentInfo.classSection || '',

      lineName: studentInfo.lineName || '',

      lineId: studentInfo.lineId || '',

      classHours: existingRow[19] ? existingRow[19].toString().trim() : '',

      classHoursLeft: existingRow[20] ? existingRow[20].toString().trim() : '',

      classType: existingRow[0] ? existingRow[0].toString().trim() : '',

      round: originalCourseName

    });

    logActivity(logUser, 'แก้ไขข้อมูลเด็กเดี่ยว/ย่อย', `อัปเดตข้อมูล ${originalName} → ${studentInfo.name} ในชีต ${sheetName}`);

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

// ----------------------------------------------------

// Teacher Hours Log & Monthly Pay Calculations

// ----------------------------------------------------

function getTeachersDB(logUser) {
  try {
    const isTeacher = logUser ? isTeacherUser(logUser) : false;
    const cacheKey = 'teachers_db_raw_usersdb';
    let rawData = getCacheObject(cacheKey);

    if (!rawData) {
      rawData = getSheetRows('UsersDB');
      if (rawData && rawData.length > 0) {
        setCacheObject(cacheKey, rawData, 1800); // Cache for 30 minutes
      }
    }

    const teachers = [];
    rawData.forEach((row, idx) => {
      if (idx === 0) return;
      if (!row[0]) return;
      
      const role = row[2] ? row[2].toString().trim() : '';
      if (role !== 'Teacher') return;
      
      const teacherNick = row[3] ? row[3].toString().trim() : '';
      const teacherId = row[0].toString().trim();
      
      // หากผู้ใช้งานเป็นบทบาทครู ให้เห็นข้อมูลเฉพาะของตนเองเท่านั้น
      if (isTeacher) {
        const cleanUser = logUser.toString().trim().toLowerCase();
        const cleanNick = teacherNick.toLowerCase();
        const cleanId = teacherId.toLowerCase();
        // ค้นหาทั้งจากชื่อบัญชีและ Nickname
        if (cleanUser !== cleanNick && cleanUser !== cleanId && !cleanUser.includes(cleanNick) && !cleanNick.includes(cleanUser)) {
          return;
        }
      }
      
      teachers.push({
        nickname: teacherNick,
        fullName: row[4] ? row[4].toString().trim() : '',
        school: row[7] ? row[7].toString().trim() : '',
        phone: row[5] ? row[5].toString().trim() : '',
        subjects: row[8] ? row[8].toString().trim() : '',
        bank: row[9] ? row[9].toString().trim() : '',
        accountNumber: row[10] ? row[10].toString().trim() : '',
        compensation: row[11] ? row[11].toString().trim() : '150',
        teacherId: teacherId,
        accountType: row[12] ? row[12].toString().trim() : 'บัญชีทั่วไป'
      });
    });

    return teachers;

  } catch (e) {

    return { error: e.message };

  }

}

function saveTeacherProfile(teacher, logUser) {
  checkTeacherBlock(logUser);
  try {
    const db = getDb();
    const sheet = db.getSheetByName('UsersDB');
    if (!sheet) return { success: false, error: 'UsersDB not found' };
    const lastRow = sheet.getLastRow();
    
    let rowIndex = -1;
    let oldUsername = '';
    if (lastRow > 0) {
      const data = sheet.getDataRange().getValues();
      // Match by teacherId (username) or nickname
      for (let i = 1; i < data.length; i++) {
        const rowRole = data[i][2] ? data[i][2].toString().trim() : '';
        if (rowRole === 'Teacher') {
          const rowId = data[i][0] ? data[i][0].toString().trim() : '';
          const rowNick = data[i][3] ? data[i][3].toString().trim() : '';
          
          if ((teacher.teacherId && rowId === teacher.teacherId) || (teacher.nickname && rowNick === teacher.nickname)) {
            rowIndex = i + 1;
            oldUsername = rowId;
            break;
          }
        }
      }
    }
    
    const teacherId = teacher.teacherId || oldUsername || `tutor_${Math.floor(Math.random() * 10000)}`;

    if (rowIndex === -1) {
      sheet.appendRow([
        teacherId, // 0 Username
        '1234', // 1 Default password
        'Teacher', // 2 Role
        teacher.nickname, // 3 Nickname
        teacher.fullName || '', // 4 FullName
        teacher.phone || '', // 5 Phone
        '', // 6 ProfilePic
        teacher.school || '', // 7 School
        teacher.subjects || '', // 8 Subjects
        teacher.bank || '', // 9 Bank
        teacher.accountNumber || '', // 10 AccountNumber
        teacher.compensation || '150', // 11 Compensation
        teacher.accountType || 'บัญชีทั่วไป' // 12 AccountType
      ]);
      const genSheet = db.getSheetByName('DATA General');
      if (genSheet) {
        genSheet.appendRow([teacher.nickname]);
      }
    } else {
      // Update existing row
      if (teacher.nickname) sheet.getRange(rowIndex, 4).setValue(teacher.nickname);
      if (teacher.fullName) sheet.getRange(rowIndex, 5).setValue(teacher.fullName);
      if (teacher.phone) sheet.getRange(rowIndex, 6).setValue(teacher.phone);
      if (teacher.school) sheet.getRange(rowIndex, 8).setValue(teacher.school);
      if (teacher.subjects) sheet.getRange(rowIndex, 9).setValue(teacher.subjects);
      if (teacher.bank) sheet.getRange(rowIndex, 10).setValue(teacher.bank);
      if (teacher.accountNumber) sheet.getRange(rowIndex, 11).setValue(teacher.accountNumber);
      if (teacher.compensation) sheet.getRange(rowIndex, 12).setValue(teacher.compensation);
      if (teacher.teacherId) sheet.getRange(rowIndex, 1).setValue(teacher.teacherId);
      if (teacher.accountType) sheet.getRange(rowIndex, 13).setValue(teacher.accountType);
    }
    
    // Clear cache
    clearCacheObject('teachers_db_raw_usersdb');
    
    logActivity(logUser, 'บันทึกประวัติครู', `ครู: ${teacher.nickname}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function isEmptySub(val) {
  if (!val || val === "" || val === "-" || val.toString().trim() === "" || val.toString().trim() === "-") return true;
  var v = val.toString().trim();
  if (v.indexOf("\u0e44\u0e21\u0e48\u0e21\u0e35") >= 0) return true;
  if (v.indexOf("\u26a0") >= 0) return true;
  if (v.indexOf("\u0e04\u0e23\u0e39\u0e41\u0e17\u0e19") >= 0) return true;
  return false;
}

function calculateTeacherYearlyPay(teacher, year, logUser) {

  const cacheKey = 'yearly_pay_v3_' + teacher.toString().trim().toLowerCase() + '_' + year;

  const cached = getCacheObject(cacheKey);

  // if (cached) return cached;

  

  try {

    logActivity(logUser || teacher || 'System', 'คำนวณเงินเดือนรายปีเริ่ม', 'คุณครู: ' + teacher + ', ปี: ' + year);

    const classLogs = getClassLogs('');

    if (!Array.isArray(classLogs)) throw new Error(classLogs.error || 'ไม่สามารถดึงข้อมูล Class Logs ได้');

    

    const teachersList = getTeachersDB(null);

    if (!Array.isArray(teachersList) || teachersList.length === 0) {

      throw new Error('ไม่พบข้อมูลรายชื่อครูในฐานข้อมูล TeachersDB');

    }

    const teacherProfile = teachersList.find(t => {

      const tId = (t.teacherId || '').toLowerCase().trim();

      const tNick = t.nickname.toLowerCase().trim().replace(/^ครู/, '').trim();

      const targetNick = teacher.toLowerCase().trim().replace(/^ครู/, '').trim();

      return (tId !== '' && tId === teacher.toLowerCase().trim()) || 

             tNick === targetNick || tNick.includes(targetNick) || targetNick.includes(tNick);

    });

    if (!teacherProfile) {

      throw new Error('ไม่พบประวัติคุณครูชื่อ/รหัส: "' + teacher + '" ในฐานข้อมูล TeachersDB');

    }

    const resolvedNickname = teacherProfile.nickname;

    const cleanResolvedNick = resolvedNickname.toLowerCase().trim();

    

    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

    const getRangeForMonth = function(m) {

      let startStr, endStr;

      const yStr = year.toString();

      const prevYStr = (year - 1).toString();

      switch (m) {

        case 1: startStr = `${prevYStr}-12-29`; endStr = `${yStr}-01-28`; break;

        case 2: startStr = `${yStr}-01-29`; endStr = `${yStr}-02-28`; break;

        case 3: startStr = isLeap ? `${yStr}-02-29` : `${yStr}-03-01`; endStr = `${yStr}-03-28`; break;

        case 4: startStr = `${yStr}-03-29`; endStr = `${yStr}-04-28`; break;

        case 5: startStr = `${yStr}-04-29`; endStr = `${yStr}-05-28`; break;

        case 6: startStr = `${yStr}-05-29`; endStr = `${yStr}-06-28`; break;

        case 7: startStr = `${yStr}-06-29`; endStr = `${yStr}-07-28`; break;

        case 8: startStr = `${yStr}-07-29`; endStr = `${yStr}-08-28`; break;

        case 9: startStr = `${yStr}-08-29`; endStr = `${yStr}-09-28`; break;

        case 10: startStr = `${yStr}-09-29`; endStr = `${yStr}-10-28`; break;

        case 11: startStr = `${yStr}-10-29`; endStr = `${yStr}-11-28`; break;

        case 12: startStr = `${yStr}-11-29`; endStr = `${yStr}-12-28`; break;

      }

      return { start: parseDateString(startStr), end: parseDateString(endStr), startStr: startStr, endStr: endStr };

    };

    const monthlyResults = {};

    for (let m = 1; m <= 12; m++) {

      const range = getRangeForMonth(m);

      const matchedClasses = [];

      let totalHours = 0;

      let totalPay = 0;

      let totalClasses = 0;

      

      classLogs.forEach(c => {

        const cDate = parseDateString(c.date);

        if (cDate < range.start || cDate > range.end) return;

        

        // Check column B (teacherRegular) and C (teacherSub)

        const cellB = c.teacherRegular ? c.teacherRegular.toString().trim().toLowerCase() : '';

        const cellC = c.teacherSub ? c.teacherSub.toString().trim().toLowerCase() : '';

        const cleanB = cellB.replace(/^ครู/, '').trim();

        const cleanC = cellC.replace(/^ครู/, '').trim();

        const cleanNick = cleanResolvedNick.replace(/^ครู/, '').trim();

        

        const matchB = cleanB !== '' && (cleanB === cleanNick || cleanB.includes(cleanNick) || cleanNick.includes(cleanB));

        const matchC = cleanC !== '' && (cleanC === cleanNick || cleanC.includes(cleanNick) || cleanNick.includes(cleanC) || 

                       (cellC.includes(cleanNick) && !isEmptySub(cellC)));

        

        // If both B and C have values, use C (substitute teacher priority rule)

        // If only one has value, use that one

        let role = '';

        if (cellB !== '' && cellC !== '' && !isEmptySub(cellC)) {

          if (!matchC) return; // Both filled but C doesn't match - skip

          role = 'sub';

        } else if (cellB !== '') {

          if (!matchB) return;

          role = 'regular';

        } else if (cellC !== '' && !isEmptySub(cellC)) {

          if (!matchC) return;

          role = 'sub';

        } else {

          return; // No teacher in either column

        }

        

        // Skip lessons with leave note only for regular teacher

        if (role === 'regular' && (c.note || '').includes('\u0e04\u0e23\u0e39\u0e25\u0e32')) return;

        

        // Parse hours

        const hoursStr = c.hours || '';

        let hoursVal = 0;

        if (hoursStr.includes(':')) {

          const parts = hoursStr.split(':');

          hoursVal = parseFloat(parts[0]) + (parseFloat(parts[1] || '0') / 60);

        } else {

          hoursVal = parseFloat(hoursStr) || 0;

        }

        if (isNaN(hoursVal) || hoursVal <= 0) return;

        

        // Count only สด + ออนไลน์ + ชดเชย for totalHours calculation

        let numKids = (parseInt(c.isPresentLive) || 0) + (parseInt(c.isPresentOnline) || 0) + (parseInt(c.isMakeup) || 0);

        

        const subject = c.subject || '';

        const hasEx = subject.toLowerCase().includes('ex');

        const hasRyw = cleanResolvedNick.includes('รยว.') || resolvedNickname.includes('รยว.');

        

        let rate = 0;

        // if (numKids === 0) { rate = 0; } removed

        if (hasEx || hasRyw) {

          if (numKids === 0 || numKids === 1) rate = hasEx ? 200 : 150;

          else if (numKids <= 5) rate = 200;

          else if (numKids <= 10) rate = 250;

          else if (numKids <= 15) rate = 300;

          else if (numKids <= 20) rate = 350;

          else if (numKids <= 25) rate = 400;

          else if (numKids <= 30) rate = 450;

          else if (numKids <= 35) rate = 500;

          else if (numKids <= 40) rate = 550;

          else if (numKids <= 45) rate = 600;

          else if (numKids <= 50) rate = 650;

          else if (numKids <= 55) rate = 700;

          else if (numKids <= 60) rate = 750;

          else if (numKids <= 65) rate = 800;

          else if (numKids <= 70) rate = 850;

          else if (numKids <= 75) rate = 900;

          else rate = 950;

        } else {

          if (numKids === 0 || numKids === 1) rate = 150;

          else if (numKids <= 5) rate = 150;

          else if (numKids <= 10) rate = 200;

          else if (numKids <= 15) rate = 250;

          else if (numKids <= 20) rate = 300;

          else if (numKids <= 25) rate = 350;

          else if (numKids <= 30) rate = 400;

          else if (numKids <= 35) rate = 450;

          else if (numKids <= 40) rate = 500;

          else if (numKids <= 45) rate = 550;

          else if (numKids <= 50) rate = 600;

          else if (numKids <= 55) rate = 650;

          else if (numKids <= 60) rate = 700;

          else if (numKids <= 65) rate = 750;

          else if (numKids <= 70) rate = 800;

          else if (numKids <= 75) rate = 850;

          else rate = 900;

        }

        

        const pay = hoursVal * rate;

        // if (numKids > 0) {

          totalHours += hoursVal;

          totalClasses += 1;

        // }

        totalPay += pay;

        matchedClasses.push({

          date: c.date,

          subject: c.subject,

          room: (c.roomBranch || '').replace(/\s*zoom\s*\d*/gi, '').trim(),

          role: role,

          numKids: numKids,
          isPresentLive: c.isPresentLive || 0,
          isPresentOnline: c.isPresentOnline || 0,
          isMakeup: c.isMakeup || 0,

          hours: hoursStr,

          rate: rate,

          pay: Math.round(pay * 100) / 100,

          rowIndex: c.rowIndex,

          teacherConfirmed: c.teacherConfirmed || 0

        });

      });

      

      // ดึงรายการเพิ่ม/หักเงินของเดือนนี้
      var monthAdjustments = [];
      var adjustmentBonus = 0;
      var adjustmentDeduction = 0;
      try {
        var adjResult = getTeacherAdjustments(teacher, year, null);
        if (adjResult && adjResult.success && adjResult.adjustments) {
          monthAdjustments = adjResult.adjustments.filter(a => a.month === m);
          monthAdjustments.forEach(a => {
            if (a.type === 'เพิ่มเงิน') {
              adjustmentBonus += a.amount;
            } else {
              adjustmentDeduction += a.amount;
            }
          });
        }
      } catch (e) { /* ignore */ }

      // คำนวณหักประกัน 10% (เฉพาะครูที่เริ่มงานปี 2569 เป็นต้นไป)
      var insuranceDeduction = 0;
      var insuranceRunningTotal = 0;
      var INSURANCE_CAP = 2000;
      var INSURANCE_RATE = 0.10;
      
      // ตรวจสอบว่าครูคนนี้เริ่มงานหลัง ม.ค. 2569 หรือไม่
      // สมมติว่าถ้าไม่มีคลาสเรียนก่อนปี 2569 (2026) ถือเป็นครูใหม่
      var isNewTeacher = true;
      var cutoffDate = parseDateString('2026-01-01');
      for (var ci = 0; ci < classLogs.length; ci++) {
        var cLog = classLogs[ci];
        var cDate = parseDateString(cLog.date);
        if (cDate < cutoffDate) {
          var cellBChk = cLog.teacherRegular ? cLog.teacherRegular.toString().trim().toLowerCase() : '';
          var cellCChk = cLog.teacherSub ? cLog.teacherSub.toString().trim().toLowerCase() : '';
          var cleanNickChk = cleanResolvedNick.replace(/^ครู/, '').trim();
          var cleanBChk = cellBChk.replace(/^ครู/, '').trim();
          var cleanCChk = cellCChk.replace(/^ครู/, '').trim();
          if ((cleanBChk !== '' && (cleanBChk === cleanNickChk || cleanBChk.includes(cleanNickChk) || cleanNickChk.includes(cleanBChk))) ||
              (cleanCChk !== '' && (cleanCChk === cleanNickChk || cleanCChk.includes(cleanNickChk) || cleanNickChk.includes(cleanCChk)))) {
            isNewTeacher = false;
            break;
          }
        }
      }

      var currentTotalPay = Math.round(totalPay * 100) / 100;
      
      try {
        var insuranceData = getInsuranceTracking(teacher);
        insuranceRunningTotal = insuranceData.totalDeducted || 0;
      } catch (e) { /* ignore */ }

      if (isNewTeacher && currentTotalPay > 0) {
        try {
          if (insuranceRunningTotal < INSURANCE_CAP) {
            var rawDeduction = Math.round(currentTotalPay * INSURANCE_RATE);
            var remainingCap = INSURANCE_CAP - insuranceRunningTotal;
            insuranceDeduction = Math.min(rawDeduction, remainingCap);
          }
        } catch (e) { /* ignore */ }
      }

      monthlyResults[m] = {
        classes: matchedClasses,
        totalHours: Math.round(totalHours * 100) / 100,
        totalClasses: totalClasses,
        totalPay: currentTotalPay,
        adjustments: monthAdjustments,
        adjustmentBonus: adjustmentBonus,
        adjustmentDeduction: adjustmentDeduction,
        insuranceDeduction: insuranceDeduction,
        insuranceRunningTotal: insuranceRunningTotal,
        isNewTeacher: isNewTeacher,
        netPay: Math.round((currentTotalPay + adjustmentBonus - adjustmentDeduction - insuranceDeduction) * 100) / 100
      };

    }

    

    logActivity(logUser || teacher || 'System', 'YearlyPay Complete', 'Teacher: ' + teacher);

    const resultVal = { success: true, months: monthlyResults };

    setCacheObject(cacheKey, resultVal, 600);

    return resultVal;

  } catch (e) {

    logActivity(logUser || teacher || 'System', 'YearlyPay Error', e.message);

    return { success: false, error: e.message };

  }

}

/**
 * บันทึกรายการเพิ่ม/หักเงินของครู
 * @param {Object} data - {teacher, month, year, type, amount, note}
 * @param {string} logUser - ผู้ใช้งานที่กรอกข้อมูล
 */
function saveTeacherAdjustment(data, logUser) {
  try {
    const db = getDb();
    let sheet = db.getSheetByName('TeacherAdjustmentsDB');
    if (!sheet) {
      sheet = db.insertSheet('TeacherAdjustmentsDB');
      sheet.getRange(1, 1, 1, 8).setValues([['ID', 'Timestamp', 'Teacher', 'Month', 'Year', 'Type', 'Amount', 'Note']]);
    }
    
    const id = 'ADJ_' + new Date().getTime();
    const timestamp = new Date().toLocaleString('th-TH');
    const amount = Math.abs(parseFloat(data.amount) || 0);
    
    if (amount <= 0) throw new Error('จำนวนเงินต้องมากกว่า 0');
    
    sheet.appendRow([
      id,
      timestamp,
      data.teacher || logUser,
      parseInt(data.month) || 1,
      parseInt(data.year) || new Date().getFullYear(),
      data.type || 'หักเงิน',
      amount,
      data.note || ''
    ]);
    
    // ล้างแคชเงินเดือนรายปี
    const cacheKey = 'yearly_pay_v3_' + (data.teacher || logUser).toString().trim().toLowerCase() + '_' + (data.year || new Date().getFullYear());
    deleteCacheObject(cacheKey);
    
    logActivity(logUser || 'System', 'บันทึกรายการเพิ่ม/หักเงิน', JSON.stringify(data));
    
    return { success: true, id: id };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * ดึงรายการเพิ่ม/หักเงินของครูตามปี
 * @param {string} teacher - ชื่อ/รหัสครู
 * @param {number} year - ปี พ.ศ.
 * @param {string} logUser - ผู้ใช้งาน
 */
function getTeacherAdjustments(teacher, year, logUser) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName('TeacherAdjustmentsDB');
    if (!sheet || sheet.getLastRow() <= 1) return { success: true, adjustments: [] };
    
    const data = sheet.getDataRange().getValues();
    const adjustments = [];
    
    const cleanTeacher = (teacher || '').toString().trim().toLowerCase().replace(/^ครู/, '').trim();
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowTeacher = (row[2] || '').toString().trim().toLowerCase().replace(/^ครู/, '').trim();
      var rowYear = parseInt(row[4]) || 0;
      
      if (rowYear === parseInt(year) && (rowTeacher === cleanTeacher || rowTeacher.includes(cleanTeacher) || cleanTeacher.includes(rowTeacher))) {
        adjustments.push({
          id: row[0],
          timestamp: row[1],
          teacher: row[2],
          month: parseInt(row[3]) || 0,
          year: rowYear,
          type: row[5],
          amount: parseFloat(row[6]) || 0,
          note: row[7] || ''
        });
      }
    }
    
    return { success: true, adjustments: adjustments };
  } catch (e) {
    return { success: false, error: e.message, adjustments: [] };
  }
}

/**
 * ดึงยอดประกันสะสมของครู
 * @param {string} teacher - ชื่อครู
 * @returns {Object} { totalDeducted, records }
 */
function getInsuranceTracking(teacher) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName('InsuranceTrackingDB');
    if (!sheet || sheet.getLastRow() <= 1) return { totalDeducted: 0, records: [] };
    
    const data = sheet.getDataRange().getValues();
    const cleanTeacher = (teacher || '').toString().trim().toLowerCase().replace(/^ครู/, '').trim();
    var totalDeducted = 0;
    var records = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowTeacher = (row[0] || '').toString().trim().toLowerCase().replace(/^ครู/, '').trim();
      
      if (rowTeacher === cleanTeacher || rowTeacher.includes(cleanTeacher) || cleanTeacher.includes(rowTeacher)) {
        var amt = parseFloat(row[3]) || 0;
        totalDeducted += amt;
        records.push({
          teacher: row[0],
          year: row[1],
          month: row[2],
          amount: amt,
          runningTotal: parseFloat(row[4]) || 0,
          timestamp: row[5]
        });
      }
    }
    
    return { totalDeducted: totalDeducted, records: records };
  } catch (e) {
    return { totalDeducted: 0, records: [], error: e.message };
  }
}

/**

 * Calculate monthly pay for ALL teachers at once for a single month.

 * Used by the "สรุปรายได้ครูทั้งหมด" dashboard to show real-time salary data.

 */

function getAllTeachersMonthlyPay(year, month) {

  const cacheKey = 'all_teachers_monthly_' + year + '_' + month;

  const cached = getCacheObject(cacheKey);

  // if (cached) return cached;

  

  try {

    const classLogs = getClassLogs('');

    if (!Array.isArray(classLogs)) throw new Error(classLogs.error || 'ไม่สามารถดึงข้อมูล Class Logs ได้');

    

    const teachersList = getTeachersDB(null);

    if (!Array.isArray(teachersList) || teachersList.length === 0) {

      throw new Error('ไม่พบข้อมูลรายชื่อครูในฐานข้อมูล TeachersDB');

    }

    

    // Build date range for the month

    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

    const yStr = year.toString();

    const prevYStr = (year - 1).toString();

    let startStr, endStr;

    switch (month) {

      case 1: startStr = prevYStr + '-12-29'; endStr = yStr + '-01-28'; break;

      case 2: startStr = yStr + '-01-29'; endStr = yStr + '-02-28'; break;

      case 3: startStr = isLeap ? yStr + '-02-29' : yStr + '-03-01'; endStr = yStr + '-03-28'; break;

      case 4: startStr = yStr + '-03-29'; endStr = yStr + '-04-28'; break;

      case 5: startStr = yStr + '-04-29'; endStr = yStr + '-05-28'; break;

      case 6: startStr = yStr + '-05-29'; endStr = yStr + '-06-28'; break;

      case 7: startStr = yStr + '-06-29'; endStr = yStr + '-07-28'; break;

      case 8: startStr = yStr + '-07-29'; endStr = yStr + '-08-28'; break;

      case 9: startStr = yStr + '-08-29'; endStr = yStr + '-09-28'; break;

      case 10: startStr = yStr + '-09-29'; endStr = yStr + '-10-28'; break;

      case 11: startStr = yStr + '-10-29'; endStr = yStr + '-11-28'; break;

      case 12: startStr = yStr + '-11-29'; endStr = yStr + '-12-28'; break;

    }

    const rangeStart = parseDateString(startStr);

    const rangeEnd = parseDateString(endStr);

    

    // Filter class logs to only this month's date range

    const monthLogs = classLogs.filter(c => {

      const cDate = parseDateString(c.date);

      return cDate >= rangeStart && cDate <= rangeEnd;

    });

    

    // Get confirmation data

    const confirmSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TeacherSalaryConfirmations');

    const confirmMap = {};

    if (confirmSheet) {

      const confirmData = confirmSheet.getDataRange().getValues();

      for (let i = 1; i < confirmData.length; i++) {

        if (confirmData[i][0] == year && confirmData[i][1] == month) {

          confirmMap[confirmData[i][3]] = {

            totalPay: confirmData[i][4],

            confirmedAt: confirmData[i][5]

          };

        }

      }

    }

    

    // Helper: calculate pay rate

    function getRate(numKids, hasEx, hasRyw) {

      if (numKids === 0) return 0;

      if (hasEx || hasRyw) {

        if (numKids === 1) return hasEx ? 200 : 150;

        if (numKids <= 5) return 200;

        if (numKids <= 10) return 250;

        if (numKids <= 15) return 300;

        if (numKids <= 20) return 350;

        if (numKids <= 25) return 400;

        if (numKids <= 30) return 450;

        if (numKids <= 35) return 500;

        if (numKids <= 40) return 550;

        if (numKids <= 45) return 600;

        if (numKids <= 50) return 650;

        if (numKids <= 55) return 700;

        if (numKids <= 60) return 750;

        if (numKids <= 65) return 800;

        if (numKids <= 70) return 850;

        if (numKids <= 75) return 900;

        return 950;

      } else {

        if (numKids === 1) return 150;

        if (numKids <= 5) return 150;

        if (numKids <= 10) return 200;

        if (numKids <= 15) return 250;

        if (numKids <= 20) return 300;

        if (numKids <= 25) return 350;

        if (numKids <= 30) return 400;

        if (numKids <= 35) return 450;

        if (numKids <= 40) return 500;

        if (numKids <= 45) return 550;

        if (numKids <= 50) return 600;

        if (numKids <= 55) return 650;

        if (numKids <= 60) return 700;

        if (numKids <= 65) return 750;

        if (numKids <= 70) return 800;

        if (numKids <= 75) return 850;

        return 900;

      }

    }

    

    // For each teacher, calculate their monthly pay

    const settings = getGeneralSettings();

    const teacherNames = settings.teachers || [];

    const results = [];

    

    teacherNames.forEach(teacherName => {

      // Find teacher profile

      const teacherProfile = teachersList.find(t => {

        const tNick = t.nickname.toLowerCase().trim();

        const targetNick = teacherName.toLowerCase().trim();

        return tNick === targetNick;

      });

      

      if (!teacherProfile) {

        // Teacher name from settings but no profile - still include with 0

        const conf = confirmMap[teacherName];

        results.push({

          teacherName: teacherName,

          totalPay: 0,

          totalHours: 0,

          totalClasses: 0,

          isConfirmed: !!conf,

          confirmedAt: conf ? conf.confirmedAt : null,

          guaranteeDeduction: 0

        });

        return;

      }

      

      const resolvedNickname = teacherProfile.nickname;

      const cleanResolvedNick = resolvedNickname.toLowerCase().trim();

      const cleanNick = cleanResolvedNick.replace(/^ครู/, '').trim();

      

      let totalHours = 0;

      let totalPay = 0;

      let totalClasses = 0;

      

      monthLogs.forEach(c => {

        const cellB = c.teacherRegular ? c.teacherRegular.toString().trim().toLowerCase() : '';

        const cellC = c.teacherSub ? c.teacherSub.toString().trim().toLowerCase() : '';

        const cleanB = cellB.replace(/^ครู/, '').trim();

        const cleanC = cellC.replace(/^ครู/, '').trim();

        

        const matchB = cleanB !== '' && (cleanB === cleanNick || cleanB.includes(cleanNick) || cleanNick.includes(cleanB));

        const matchC = cleanC !== '' && (cleanC === cleanNick || cleanC.includes(cleanNick) || cleanNick.includes(cleanC) || 

                       (cellC.includes(cleanNick) && !isEmptySub(cellC)));

        

        let role = '';

        if (cellB !== '' && cellC !== '' && !isEmptySub(cellC)) {

          if (!matchC) return;

          role = 'sub';

        } else if (cellB !== '') {

          if (!matchB) return;

          role = 'regular';

        } else if (cellC !== '' && !isEmptySub(cellC)) {

          if (!matchC) return;

          role = 'sub';

        } else {

          return;

        }

        

        // Skip leave notes only for regular teacher

        if (role === 'regular' && (c.note || '').includes('\u0e04\u0e23\u0e39\u0e25\u0e32')) return;

        

        // Parse hours

        const hoursStr = c.hours || '';

        let hoursVal = 0;

        if (hoursStr.includes(':')) {

          const parts = hoursStr.split(':');

          hoursVal = parseFloat(parts[0]) + (parseFloat(parts[1] || '0') / 60);

        } else {

          hoursVal = parseFloat(hoursStr) || 0;

        }

        if (isNaN(hoursVal) || hoursVal <= 0) return;

        

        // Count only สด + ออนไลน์ + ชดเชย

        let numKids = (parseInt(c.isPresentLive) || 0) + (parseInt(c.isPresentOnline) || 0) + (parseInt(c.isMakeup) || 0);

        

        const subject = c.subject || '';

        const hasEx = subject.toLowerCase().includes('ex');

        const hasRyw = cleanResolvedNick.includes('รยว.') || resolvedNickname.includes('รยว.');

        

        const rate = getRate(numKids, hasEx, hasRyw);

        const pay = hoursVal * rate;

        

        // if (numKids > 0) {

          totalHours += hoursVal;

          totalClasses += 1;

        // }

        totalPay += pay;

      });

      

      const conf = confirmMap[teacherName];

      results.push({

        teacherName: teacherName,

        totalPay: Math.round(totalPay * 100) / 100,

        totalHours: Math.round(totalHours * 100) / 100,

        totalClasses: totalClasses,
        isConfirmed: !!conf,
        confirmedAt: conf ? conf.confirmedAt : null,
        guaranteeDeduction: teacherProfile.compensation || 0,
        accountType: teacherProfile.accountType || 'บัญชีทั่วไป'
      });
    });

    

    const resultVal = { success: true, data: results };

    setCacheObject(cacheKey, resultVal, 300); // Cache 5 minutes

    return resultVal;

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function toggleClassAbsentInSheet(rowIndex, type, isChecked) {

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(15000);

    const sheet = getDb().getSheetByName('Data Learn');

    if (!sheet) throw new Error('Data Learn sheet not found');

    

    const range = sheet.getRange(rowIndex, 1, 1, 15);

    const rowVals = range.getValues()[0];

    

    let note = rowVals[5] ? rowVals[5].toString().trim() : '';

    let isLeave = parseInt(rowVals[8]) || 0;

    

    if (type === 'nong') {

      if (isChecked) {

        if (!note.includes('น้องลา')) {

          note = (note ? note + ' ' : '') + 'น้องลา';

        }

        isLeave = 1;

        // Toggling nong leave to true clears live/online/makeup kids count in sheet

        sheet.getRange(rowIndex, 7).setValue(0); // สด

        sheet.getRange(rowIndex, 8).setValue(0); // ออน

        sheet.getRange(rowIndex, 11).setValue(0); // ชด

      } else {

        note = note.replace(/น้องลา/g, '').trim();

        isLeave = 0;

      }

    } else if (type === 'kru') {

      if (isChecked) {

        if (!note.includes('ครูลา')) {

          note = (note ? note + ' ' : '') + 'ครูลา';

        }

      } else {

        note = note.replace(/ครูลา/g, '').trim();

      }

    }

    

    sheet.getRange(rowIndex, 6).setValue(note); // note column F (6)

    sheet.getRange(rowIndex, 9).setValue(isLeave); // isLeave column I (9)

    

    // Invalidate caches

    const logDate = cleanSheetDate(rowVals[12]);

    clearClassLogsCache(logDate);

    invalidateTeacherSalaryCache([rowVals[1], rowVals[2]]);

    

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  } finally {

    lock.releaseLock();

  }

}

function toggleTeacherConfirmInSheet(rowIndex, isChecked) {

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(15000);

    const sheet = getDb().getSheetByName('Data Learn');

    if (!sheet) throw new Error('Data Learn sheet not found');

    

    sheet.getRange(rowIndex, 15).setValue(isChecked ? 1 : 0);

    

    const rowVals = sheet.getRange(rowIndex, 1, 1, 15).getValues()[0];

    const logDate = cleanSheetDate(rowVals[12]);

    clearClassLogsCache(logDate);

    invalidateTeacherSalaryCache([rowVals[1], rowVals[2]]);

    

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  } finally {

    lock.releaseLock();

  }

}

// ----------------------------------------------------

// Master Class Logs (Data Learn)

// ----------------------------------------------------

function parseDateString(str) {

  if (!str) return null;

  if (str instanceof Date) return str;

  const parts = str.toString().trim().split('/');

  if (parts.length === 3) {

    const d = parseInt(parts[0], 10);

    const m = parseInt(parts[1], 10);

    let y = parseInt(parts[2], 10);

    if (y > 2400) y -= 543; // Convert BE to CE

    return new Date(y, m - 1, d);

  }

  const partsDash = str.toString().trim().split('-');

  if (partsDash.length === 3) {

    let y = parseInt(partsDash[0], 10);

    let m = parseInt(partsDash[1], 10);

    const d = parseInt(partsDash[2], 10);

    if (y > 2400) y -= 543;

    return new Date(y, m - 1, d);

  }

  return null;

}

function areDatesSame(d1, d2) {

  const date1 = parseDateString(d1);

  const date2 = parseDateString(d2);

  if (!date1 || !date2) return false;

  return date1.getFullYear() === date2.getFullYear() &&

         date1.getMonth() === date2.getMonth() &&

         date1.getDate() === date2.getDate();

}

function formatTimeValue(val) {

  if (!val) return '';

  if (val instanceof Date) {

    try {

      return Utilities.formatDate(val, 'Asia/Bangkok', 'HH:mm');

    } catch (e) {

      return val.toString().trim();

    }

  }

  return val.toString().trim();

}

function parseHoursValue(val) {

  if (val instanceof Date) {

    return (val.getHours() + (val.getMinutes() / 60)).toString();

  }

  return val ? val.toString().trim() : '';

}

// =============================================

// Dynamic Course Name Resolution (หลัก → header)

// =============================================

var _gradeHeaderCache = null;

function clearGradeHeaderCache() {

  try {

    CacheService.getScriptCache().remove('grade_header_cache');

    _gradeHeaderCache = null;

  } catch (e) {

    Logger.log('Error clearing cache: ' + e.message);

  }

}

function buildGradeHeaderCache_() {

  if (_gradeHeaderCache) return _gradeHeaderCache;

  

  var cacheService = CacheService.getScriptCache();

  try {

    var cached = cacheService.get('grade_header_cache');

    if (cached) {

      var parsed = JSON.parse(cached);

      _gradeHeaderCache = parsed;

      return parsed;

    }

  } catch (e) {

    Logger.log('Cache read error: ' + e.message);

  }

  var db = getDb();

  var cache = {};

  var sheetNames = [

    'อนุบาล/1','ป.1/1','ป.2/1','ป.3/1','ป.4/1','ป.5/1','ป.6/1','ม.1/1','ม.2/1','ม.3/1','ม.4/1','ม.5/1','ม.6/1',

    'อนุบาล/2','ป.1/2','ป.2/2','ป.3/2','ป.4/2','ป.5/2','ป.6/2','ม.1/2','ม.2/2','ม.3/2','ม.4/2','ม.5/2','ม.6/2',

    'อนุบาล/3','ป.1/3','ป.2/3','ป.3/3','ป.4/3','ป.5/3','ป.6/3','ม.1/3','ม.2/3','ม.3/3','ม.4/3','ม.5/3','ม.6/3'

  ];

  for (var s = 0; s < sheetNames.length; s++) {

    var sn = sheetNames[s];

    var sheet = db.getSheetByName(sn);

    if (!sheet) continue;

    var lastCol = sheet.getLastColumn();

    if (lastCol < 5) continue;

    var row1 = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    var headers = [];

    for (var c = 4; c < row1.length; c++) {

      var h = row1[c] ? row1[c].toString().trim() : '';

      if (h) headers.push(h);

    }

    cache[sn] = headers;

  }

  _gradeHeaderCache = cache;

  

  try {

    cacheService.put('grade_header_cache', JSON.stringify(cache), 3600); // Cache for 1 hour

  } catch (e) {

    Logger.log('Cache write error: ' + e.message);

  }

  

  return cache;

}

var _resolvedNamesLocalCache = {};

function resolveDynamicCourseName(originalSubject, dateStr, roomBranch) {

  if (!originalSubject || !dateStr) return originalSubject;

  var subj = originalSubject.toString().trim();

  

  // Only process courses starting with or containing "หลัก"

  if (subj.indexOf('หลัก') < 0) return subj;

  

  var cacheKey = subj + '_' + dateStr + '_' + (roomBranch || '');

  if (_resolvedNamesLocalCache[cacheKey]) {

    return _resolvedNamesLocalCache[cacheKey];

  }

  

  // Check date >= 18/5/2026

  var dateParts = dateStr.toString().split('/');

  if (dateParts.length !== 3) {

    _resolvedNamesLocalCache[cacheKey] = subj;

    return subj;

  }

  var day = parseInt(dateParts[0], 10);

  var month = parseInt(dateParts[1], 10);

  var year = parseInt(dateParts[2], 10);

  var dateObj = new Date(year, month - 1, day);

  var cutoffDate = new Date(2026, 4, 18); // 18/5/2026

  if (dateObj < cutoffDate) {

    _resolvedNamesLocalCache[cacheKey] = subj;

    return subj;

  }

  

  // Extract day of week name

  var dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  var dayOfWeek = dayNames[dateObj.getDay()];

  

  // Extract branch number from roomBranch

  var branch = '1';

  if (roomBranch) {

    var branchMatch = roomBranch.toString().match(/สาขา\s*(\d)/);

    if (branchMatch) branch = branchMatch[1];

  }

  

  // Extract grade from subject (e.g., "หลัก ภาษาไทย ป.3" → "ป.3")

  var gradeMatch = subj.match(/(อนุบาล|ป\.\d|ม\.\d)/);

  

  // Extract keyword: everything after "หลัก " minus the grade part

  var subjectKeyword = '';

  if (gradeMatch) {

    // Has grade: keyword = between "หลัก" and grade

    // "หลัก ภาษาไทย ป.3" → "ภาษาไทย"

    subjectKeyword = subj.substring(subj.indexOf('หลัก') + 4, gradeMatch.index).trim();

  } else {

    // No grade (e.g., "หลัก อังกฤษ แข่ง3"): keyword = everything after "หลัก "

    subjectKeyword = subj.substring(subj.indexOf('หลัก') + 4).trim();

  }

  if (!subjectKeyword) return subj;

  

  // Build/get header cache

  var headerCache = buildGradeHeaderCache_();

  

  // Determine which sheets to search

  var sheetsToSearch = [];

  if (gradeMatch) {

    // Has grade: search specific sheet only

    sheetsToSearch.push(gradeMatch[1] + '/' + branch);

  } else {

    // No grade (แข่ง etc.): search ALL grade sheets for this branch

    var allGrades = ['อนุบาล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];

    for (var g = 0; g < allGrades.length; g++) {

      sheetsToSearch.push(allGrades[g] + '/' + branch);

    }

  }

  

  // Helper: search headers in a list of sheets

  var searchResult = searchHeadersInSheets_(headerCache, sheetsToSearch, subjectKeyword, dayOfWeek);

  if (searchResult) {

    _resolvedNamesLocalCache[cacheKey] = searchResult;

    return searchResult;

  }

  

  // Fallback: try shorter keyword (e.g., "ภาษาไทย" → "ไทย")

  var shortKeyword = subjectKeyword.replace(/^ภาษา/, '').trim();

  if (shortKeyword !== subjectKeyword && shortKeyword.length > 0) {

    var fallback = searchHeadersInSheets_(headerCache, sheetsToSearch, shortKeyword, dayOfWeek);

    if (fallback) {

      _resolvedNamesLocalCache[cacheKey] = fallback;

      return fallback;

    }

  }

  

  _resolvedNamesLocalCache[cacheKey] = subj;

  return subj;

}

function searchHeadersInSheets_(headerCache, sheetNames, keyword, dayOfWeek) {

  var keyLower = keyword.toLowerCase();

  for (var s = 0; s < sheetNames.length; s++) {

    var headers = headerCache[sheetNames[s]];

    if (!headers) continue;

    for (var i = 0; i < headers.length; i++) {

      var header = headers[i];

      if (header.toLowerCase().indexOf(keyLower) >= 0 && header.indexOf(dayOfWeek) >= 0) {

        return header;

      }

    }

  }

  return null;

}

function getClassLogs(filterDate, logUser) {

  // ครูสามารถดูข้อมูลตารางเรียนได้

  

  try {

    // ensureDataLearnMigrated(getDb());

    const rawData = getSheetRows('Data Learn');

    const teachersList = getTeachersDB(null);

    

    const resolveNick = function(nameOrId) {

      if (!nameOrId) return '';

      const cleanVal = nameOrId.toString().trim().toLowerCase();

      const match = teachersList.find(t => {

        const tId = (t.teacherId || '').toLowerCase().trim();

        const tNick = t.nickname.toLowerCase().trim();

        return (tId !== '' && tId === cleanVal) || tNick === cleanVal;

      });

      return match ? match.nickname : nameOrId;

    };

    

    let targetDt = null;
    if (filterDate) {
      targetDt = parseDateString(filterDate);
    }

    const headers = rawData[0] || [];
    let idxDate = 12, idxRoom = 13, idxHrs = 11, idxMakeup = 10, idxLive = 6, idxOnline = 7, idxLeave = 8, idxAbsent = 9, idxNote = 5, idxT1 = 1, idxT2 = 2, idxSubj = 0, idxStart = 3, idxEnd = 4, idxConf = 14;
    
    headers.forEach((h, i) => {
      const hStr = (h || '').toString().trim();
      if (hStr.includes('วันที่')) idxDate = i;
      else if (hStr.includes('ห้อง') || hStr.includes('สาขา')) idxRoom = i;
      else if (hStr === 'ชม.') idxHrs = i;
      else if (hStr === 'ชด') idxMakeup = i;
      else if (hStr === 'สด') idxLive = i;
      else if (hStr === 'ออน') idxOnline = i;
      else if (hStr === 'ลา') idxLeave = i;
      else if (hStr === 'ขาด') idxAbsent = i;
      else if (hStr === 'หมายเหตุ') idxNote = i;
      else if (hStr.includes('ประจำ')) idxT1 = i;
      else if (hStr.includes('แทน')) idxT2 = i;
      else if (hStr === 'วิชา') idxSubj = i;
      else if (hStr === 'เวลาเริ่ม') idxStart = i;
      else if (hStr === 'เวลาจบ') idxEnd = i;
      else if (hStr.includes('ยืนยัน')) idxConf = i;
    });

    const logs = [];

    rawData.forEach((row, idx) => {
      if (idx === 0) return;
      if (!row[0] || row[0] === '0') return;

      const dateRaw = cleanSheetDate(row[idxDate]);
      if (targetDt) {
        const rawDt = parseDateString(dateRaw);
        if (!rawDt || rawDt.getFullYear() !== targetDt.getFullYear() || rawDt.getMonth() !== targetDt.getMonth() || rawDt.getDate() !== targetDt.getDate()) {
          return;
        }
      }

      const roomBranchVal = row[idxRoom] ? row[idxRoom].toString().trim() : '';

      logs.push({
        subject: resolveDynamicCourseName(row[idxSubj] ? row[idxSubj].toString().trim() : '', dateRaw, roomBranchVal),
        teacherRegular: resolveNick(row[idxT1]),
        teacherSub: resolveNick(row[idxT2]),
        timeStart: formatTimeValue(row[idxStart]),
        timeEnd: formatTimeValue(row[idxEnd]),
        note: row[idxNote] ? row[idxNote].toString().trim() : '',
        isPresentLive: parseInt(row[idxLive]) || 0,
        isPresentOnline: parseInt(row[idxOnline]) || 0,
        isLeave: parseInt(row[idxLeave]) || 0,
        isAbsent: parseInt(row[idxAbsent]) || 0,
        isMakeup: parseInt(row[idxMakeup]) || 0,
        hours: parseHoursValue(row[idxHrs]),
        date: dateRaw,
        roomBranch: roomBranchVal,
        teacherConfirmed: row[idxConf] ? (parseInt(row[idxConf]) || 0) : 0,
        numKids: (parseInt(row[idxLive]) || 0) + (parseInt(row[idxOnline]) || 0) + (parseInt(row[idxMakeup]) || 0),
        rowIndex: idx + 1
      });
    });

    

     // Cache for 2 minutes

    return logs;

  } catch (err) {

    return { error: err.message };

  }

}

function debugGetClassLogs() {
  const logs = getClassLogs('');
  return logs ? logs.slice(0, 5) : null;
}

function getClassLogByRow(rowIndex) {

  try {

    // ensureDataLearnMigrated(getDb());

    const sheet = getDb().getSheetByName('Data Learn');

    if (!sheet) throw new Error('Data Learn sheet not found');

    const lastRow = sheet.getLastRow();

    if (rowIndex < 2 || rowIndex > lastRow) {

      throw new Error('ไม่พบข้อมูลคลาสเรียนในแถวที่ ' + rowIndex);

    }

    const row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

    const teachersList = getTeachersDB(null);

    const resolveNick = function(nameOrId) {

      if (!nameOrId) return '';

      const cleanVal = nameOrId.toString().trim().toLowerCase();

      const match = teachersList.find(t => {

        const tId = (t.teacherId || '').toLowerCase().trim();

        const tNick = t.nickname.toLowerCase().trim();

        return (tId !== '' && tId === cleanVal) || tNick === cleanVal;

      });

      return match ? match.nickname : nameOrId;

    };

    

    return {

      success: true,

      data: {

        subject: row[0] ? row[0].toString().trim() : '',

        teacherRegular: resolveNick(row[1]),

        teacherSub: resolveNick(row[2]),

        timeStart: formatTimeValue(row[3]),

        timeEnd: formatTimeValue(row[4]),

        note: row[5] ? row[5].toString().trim() : '',

        isPresentLive: parseInt(row[6]) || 0,

        isPresentOnline: parseInt(row[7]) || 0,

        isLeave: parseInt(row[8]) || 0,

        isAbsent: parseInt(row[9]) || 0,

        isMakeup: parseInt(row[10]) || 0,

        // log.isOrange removed

        hours: parseHoursValue(row[11]),

        date: cleanSheetDate(row[12]),

        roomBranch: row[13] ? row[13].toString().trim() : '',

        teacherConfirmed: row[14] ? (parseInt(row[14]) || 0) : 0,

        numKids: (parseInt(row[6]) || 0) + (parseInt(row[7]) || 0) + (parseInt(row[10]) || 0),

        rowIndex: rowIndex

      }

    };

  } catch (err) {

    return { success: false, error: err.message };

  }

}

function getClassLogsForTeacher(teacherName, nickname) {

  try {

    // ensureDataLearnMigrated(getDb());

    const rawData = getSheetRows('Data Learn');

    const teachersList = getTeachersDB(null);

    const resolveNick = function(nameOrId) {

      if (!nameOrId) return '';

      const cleanVal = nameOrId.toString().trim().toLowerCase();

      const match = Array.isArray(teachersList) ? teachersList.find(t => {

        const tId = (t.teacherId || '').toLowerCase().trim();

        const tNick = t.nickname.toLowerCase().trim();

        return (tId !== '' && tId === cleanVal) || tNick === cleanVal;

      }) : null;

      return match ? match.nickname : nameOrId;

    };

    

    const logs = [];

    

    const cleanName = teacherName ? teacherName.toString().trim().toLowerCase() : '';

    const cleanNick = nickname ? nickname.toString().trim().toLowerCase() : '';

    

    const searchNickClean = cleanNick.replace(/^ครู/, '').trim();

    const searchNameClean = cleanName.replace(/^ครู/, '').trim();

    

    rawData.forEach((row, idx) => {

      if (idx === 0) return;

      if (!row[0] || row[0] === '0') return;

      

      const teacherRegular = row[1] ? row[1].toString().trim().toLowerCase() : '';

      const teacherSub = row[2] ? row[2].toString().trim().toLowerCase() : '';

      

      const cleanReg = teacherRegular.replace(/^ครู/, '').trim();

      const cleanSub = teacherSub.replace(/^ครู/, '').trim();

      

      // คอลัมน์ B (ครูหลัก) หรือคอลัมน์ C (ครูสอนแทน) ตรงกับชื่อหรือชื่อเล่นของผู้ใช้ (ลบคำว่า ครู เพื่อเทียบแบบยืดหยุ่น)

      const isMatch = (searchNickClean !== '' && (cleanReg === searchNickClean || cleanSub === searchNickClean)) ||

                      (searchNameClean !== '' && (cleanReg === searchNameClean || cleanSub === searchNameClean)) ||

                      (cleanName !== '' && (teacherRegular === cleanName || teacherSub === cleanName)) ||

                      (cleanNick !== '' && (teacherRegular === cleanNick || teacherSub === cleanNick));

      if (!isMatch) return;

      

      const dateRaw = cleanSheetDate(row[12]);

      const roomBranchVal = row[13] ? row[13].toString().trim() : '';

      

      logs.push({

        subject: resolveDynamicCourseName(row[0] ? row[0].toString().trim() : '', dateRaw, roomBranchVal),

        teacherRegular: resolveNick(row[1]),

        teacherSub: resolveNick(row[2]),

        timeStart: formatTimeValue(row[3]),

        timeEnd: formatTimeValue(row[4]),

        note: row[5] ? row[5].toString().trim() : '',

        isPresentLive: parseInt(row[6]) || 0,

        isPresentOnline: parseInt(row[7]) || 0,

        isLeave: parseInt(row[8]) || 0,

        isAbsent: parseInt(row[9]) || 0,

        isMakeup: parseInt(row[10]) || 0,

        // log.isOrange removed

        hours: parseHoursValue(row[11]),

        date: dateRaw,

                roomBranch: roomBranchVal,

        teacherConfirmed: row[14] ? (parseInt(row[14]) || 0) : 0,

        numKids: (parseInt(row[6]) || 0) + (parseInt(row[7]) || 0) + (parseInt(row[10]) || 0),

        rowIndex: idx + 1

      });

    });

    

    return logs;

  } catch (err) {

    return { error: err.message };

  }

}

function cleanSubjectNameString(subjectStr) {

  if (!subjectStr) return '';

  var clean = subjectStr.toString();

  

  // Strip out long date strings like "Sat Dec 30 1899 18:00:00 GMT+0642 (Indochina Time)"

  var dateRegex = /\b(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{4}\s+\d{2}:\d{2}:\d{2}[^-\n]*/gi;

  clean = clean.replace(dateRegex, '');

  

  // Clean dangling dashes/spaces

  clean = clean.replace(/\s*-\s*(?=-|$)/g, '');

  clean = clean.replace(/^-|-$|^\s+|\s+$/g, '');

  return clean.replace(/\s{2,}/g, ' ').trim();

}

function cleanDataLearnColAGarbage() {

  try {

    const db = getDb();

    const sheet = db.getSheetByName('Data Learn');

    if (!sheet) return;

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) return;

    const range = sheet.getRange(2, 1, lastRow - 1, 1);

    const values = range.getValues();

    let updated = false;

    for (let i = 0; i < values.length; i++) {

      const val = values[i][0] ? values[i][0].toString() : '';

      if (val.includes('1899') || val.includes('1900') || val.includes('GMT')) {

        const cleaned = cleanSubjectNameString(val);

        if (cleaned !== val) {

          values[i][0] = cleaned;

          updated = true;

        }

      }

    }

    if (updated) {

      range.setValues(values);

      // Invalidate all caches

      clearClassLogsCache('');

    }

  } catch(e) {

    Logger.log('Error cleaning Data Learn Col A: ' + e.message);

  }

}

function formatSubjectWithDayTime(subject, dateStr, timeStart, timeEnd) {

  if (!subject) return '';

  var subjectName = cleanSubjectNameString(subject);

  

  // Check if subject already contains day and time info to avoid double appending

  var hasDay = /(จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์|อาทิตย์)/.test(subjectName);

  var hasTime = /\d+[:.]\d+/.test(subjectName);

  if (hasDay && hasTime) {

    return subjectName;

  }

  

  var dayName = '';

  if (dateStr) {

    var parts = dateStr.toString().split('/');

    if (parts.length === 3) {

      var day = parseInt(parts[0], 10);

      var month = parseInt(parts[1], 10) - 1;

      var year = parseInt(parts[2], 10);

      var date = new Date(year, month, day);

      var days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

      dayName = days[date.getDay()];

    }

  }

  

  var cleanTime = function(t) {

    if (!t) return '';

    if (t instanceof Date) {

      return Utilities.formatDate(t, 'Asia/Bangkok', 'HH:mm');

    }

    var str = t.toString().trim();

    if (str.includes('GMT') || str.includes('1899') || str.includes('1900') || str.length > 15) {

      try {

        var d = new Date(str);

        if (!isNaN(d.getTime())) {

          return Utilities.formatDate(d, 'Asia/Bangkok', 'HH:mm');

        }

      } catch(e) {}

      var match = str.match(/(\d{1,2})[:.](\d{2})/);

      if (match) {

        return match[1].padStart(2, '0') + ':' + match[2];

      }

    }

    // Handle standard string formats like "17:00-19:00" or just "17.00"

    var cleanStr = str.replace('.', ':');

    var colonMatch = cleanStr.match(/(\d{1,2}):(\d{2})/);

    if (colonMatch) {

      return colonMatch[1].padStart(2, '0') + ':' + colonMatch[2];

    }

    return cleanStr;

  };

  

  var startClean = cleanTime(timeStart);

  var endClean = cleanTime(timeEnd);

  

  var dayTimeStr = (dayName + ' ' + (startClean && endClean ? (startClean + '-' + endClean) : '')).trim();

  if (dayTimeStr && !subjectName.includes(dayTimeStr)) {

    subjectName = subjectName + ' ' + dayTimeStr;

  }

  return cleanSubjectNameString(subjectName);

}

function addClassLog(log, logUser) {

  checkTeacherBlock(logUser);

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(15000);

    // ensureDataLearnMigrated(getDb());

    const sheet = getDb().getSheetByName('Data Learn');

    if (!sheet) throw new Error('Data Learn sheet not found');

    

    // Resolve teacher names to tutor_xxxx IDs

    const teachersList = getTeachersDB(null);

    const resolveId = function(name) {

      if (!name) return '';

      const cleanTarget = name.toString().trim().toLowerCase().replace(/^ครู/, '').trim();

      const match = teachersList.find(t => {

        const tNick = t.nickname.toLowerCase().trim().replace(/^ครู/, '').trim();

        const tId = (t.teacherId || '').toLowerCase().trim();

        return tNick === cleanTarget || tId === cleanTarget;

      });

      return match ? (match.teacherId || name) : name;

    };

    

    const resolvedTeacherRegular = resolveId(log.teacherRegular);

    const resolvedTeacherSub = resolveId(log.teacherSub);

    log.subject = formatSubjectWithDayTime(log.subject, log.date, log.timeStart, log.timeEnd);

    log.subject = resolveDynamicCourseName(log.subject, log.date, log.roomBranch);

    

    const iPresentLive = log.isPresentLive ? parseInt(log.isPresentLive) || 0 : 0;

    const iPresentOnline = log.isPresentOnline ? parseInt(log.isPresentOnline) || 0 : 0;

    const iMakeup = log.isMakeup ? parseInt(log.isMakeup) || 0 : 0;

    const numKids = iPresentLive + iPresentOnline + iMakeup;

    

    const rowData = [

      log.subject,

      resolvedTeacherRegular,

      resolvedTeacherSub || '',

      log.timeStart,

      log.timeEnd,

      log.note || '',

      iPresentLive,

      iPresentOnline,

      log.isLeave ? parseInt(log.isLeave) || 0 : 0,

      log.isAbsent ? parseInt(log.isAbsent) || 0 : 0,

      iMakeup,

      log.hours || '',

      log.date || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy'),

      log.roomBranch || '',

      0,        // teacherConfirmed (column P)

      numKids   // numKids (column Q) = iPresentLive + iPresentOnline + iMakeup

    ];

    

    sheet.appendRow(rowData);

    

    try {

      processClassHoursDeduction(log, false);

    } catch (e_deduct) {

      // Don't fail the class logging if deduction fails

    }

    

    logActivity(logUser, 'บันทึกคาบสอน', `วิชา: ${log.subject} ครู: ${log.teacherRegular} ห้อง: ${log.roomBranch}`);

    

    // Invalidate caches

    clearClassLogsCache(log.date);

    invalidateTeacherSalaryCache([log.teacherRegular, log.teacherSub]);

    

    return { success: true };

  } catch (err) {

    return { success: false, error: err.message };

  } finally {

    lock.releaseLock();

  }

}

function updateClassLog(rowIndex, log, logUser) {

  checkTeacherBlock(logUser);

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(15000);

    // ensureDataLearnMigrated(getDb());

    const sheet = getDb().getSheetByName('Data Learn');

    if (!sheet) throw new Error('Data Learn sheet not found');

    

    // Read old log values first to revert them

    // Read old log values first to revert them

    const rowVals = sheet.getRange(rowIndex, 1, 1, 16).getValues()[0];

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

        // log.isOrange removed

      hours: rowVals[11] ? rowVals[11].toString().trim() : '',

      date: cleanSheetDate(rowVals[12]),

      roomBranch: rowVals[13] ? rowVals[13].toString().trim() : ''

    };

    

    // Resolve teacher names to tutor_xxxx IDs

    const teachersList = getTeachersDB(null);

    const resolveId = function(name) {

      if (!name) return '';

      const cleanTarget = name.toString().trim().toLowerCase().replace(/^ครู/, '').trim();

      const match = teachersList.find(t => {

        const tNick = t.nickname.toLowerCase().trim().replace(/^ครู/, '').trim();

        const tId = (t.teacherId || '').toLowerCase().trim();

        return tNick === cleanTarget || tId === cleanTarget;

      });

      return match ? (match.teacherId || name) : name;

    };

    

    const resolvedTeacherRegular = resolveId(log.teacherRegular);

    const resolvedTeacherSub = resolveId(log.teacherSub);

    log.subject = formatSubjectWithDayTime(log.subject, log.date, log.timeStart, log.timeEnd);

    log.subject = resolveDynamicCourseName(log.subject, log.date, log.roomBranch);

    

    const iPresentLive = log.isPresentLive ? parseInt(log.isPresentLive) || 0 : 0;

    const iPresentOnline = log.isPresentOnline ? parseInt(log.isPresentOnline) || 0 : 0;

    const iMakeup = log.isMakeup ? parseInt(log.isMakeup) || 0 : 0;

    const numKids = iPresentLive + iPresentOnline + iMakeup;

    const currentConfirmed = rowVals[14] ? (parseInt(rowVals[14]) || 0) : 0;

    const rowValues = [

      [

        log.subject,

        resolvedTeacherRegular,

        resolvedTeacherSub || '',

        log.timeStart,

        log.timeEnd,

        log.note || '',

        iPresentLive,

        iPresentOnline,

        log.isLeave ? parseInt(log.isLeave) || 0 : 0,

        log.isAbsent ? parseInt(log.isAbsent) || 0 : 0,

        iMakeup,

        // log.isOrange removed

        log.hours || '',

        log.date,

        log.roomBranch || '',

        currentConfirmed,

        numKids

      ]

    ];

    

    sheet.getRange(rowIndex, 1, 1, 16).setValues(rowValues);

    

    try {

      recalculateSubjectHours(oldLog.subject);

      if (log.subject !== oldLog.subject) {

        recalculateSubjectHours(log.subject);

      }

    } catch (e_deduct) {

      // Ignore or log

    }

    

    logActivity(logUser, 'แก้ไขบันทึกคาบสอน', `วิชา: ${log.subject} (แถวที่: ${rowIndex})`);

    

    // Invalidate caches

    clearClassLogsCache(log.date);

    clearClassLogsCache(oldLog.date);

    invalidateTeacherSalaryCache([log.teacherRegular, log.teacherSub, oldLog.teacherRegular, oldLog.teacherSub]);

    

    return { success: true };

  } catch (err) {

    return { success: false, error: err.message };

  } finally {

    lock.releaseLock();

  }

}

function updateClassAbsenceAndAttendance(rowIndex, type, checked, logUser) {

  checkTeacherBlock(logUser);

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(15000);

    const db = getDb();

    const sheet = db.getSheetByName('Data Learn');

    if (!sheet) throw new Error('Data Learn sheet not found');

    

    const range = sheet.getRange(rowIndex, 1, 1, 15);

    const rowVals = range.getValues()[0];

    

    let isPresentLive = parseInt(rowVals[6]) || 0;

    let isPresentOnline = parseInt(rowVals[7]) || 0;

    let isLeave = parseInt(rowVals[8]) || 0;

    

    if (type === 'studentLeave') {

      if (checked) {

        isPresentLive = 0;

        isPresentOnline = 0;

        isLeave = 1;

      } else {

        isLeave = 0;

        if (isPresentLive === 0 && isPresentOnline === 0) {

          isPresentLive = 1;

        }

      }

    }

    

    sheet.getRange(rowIndex, 7).setValue(isPresentLive);

    sheet.getRange(rowIndex, 8).setValue(isPresentOnline);

    sheet.getRange(rowIndex, 9).setValue(isLeave);

    

    const subject = rowVals[0] ? rowVals[0].toString().trim() : '';

    try {

      recalculateSubjectHours(subject);

    } catch(e) {}

    

    logActivity(logUser, 'เช็คชื่อลา/เข้าเรียน', `วิชา: ${subject} (${type}: ${checked})`);

    

    // Invalidate caches

    const logDate = cleanSheetDate(rowVals[12]);

    clearClassLogsCache(logDate);

    invalidateTeacherSalaryCache([rowVals[1], rowVals[2]]);

    

    return {

      success: true,

      isPresentLive: isPresentLive,

      isPresentOnline: isPresentOnline,

      isLeave: isLeave

    };

  } catch (err) {

    return { success: false, error: err.message };

  } finally {

    lock.releaseLock();

  }

}

function deleteClassLog(rowIndex, logUser) {

  checkTeacherBlock(logUser);

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(15000);

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

        // log.isOrange removed

      hours: rowVals[11] ? rowVals[11].toString().trim() : '',

      date: cleanSheetDate(rowVals[12]),

      roomBranch: rowVals[13] ? rowVals[13].toString().trim() : ''

    };

    

    sheet.deleteRow(rowIndex);

    

    try {

      recalculateSubjectHours(oldLog.subject);

    } catch (e_deduct) {

      // Ignore or log

    }

    

    logActivity(logUser, 'ลบบันทึกคาบสอน', `วิชา: ${subject} (แถวที่: ${rowIndex})`);

    

    // Invalidate caches

    clearClassLogsCache(oldLog.date);

    invalidateTeacherSalaryCache([oldLog.teacherRegular, oldLog.teacherSub]);

    

    return { success: true };

  } catch (err) {

    return { success: false, error: err.message };

  } finally {

    lock.releaseLock();

  }

}

// ----------------------------------------------------

// Manager Log (Data ผจก.)

// ----------------------------------------------------

function getManagerOTLogs(logUser) {

  if (logUser) checkTeacherBlock(logUser);

  try {

    const rawData = getSheetRows('Data ผจก.');

    const logs = [];

    

    rawData.forEach((row, idx) => {

      if (idx === 0) return;

      if (!row[0] || row[0] === '0') return;

      

      const otInStr = cleanSheetTime(row[1]);

      const otOutStr = cleanSheetTime(row[2]);

      const workInStr = cleanSheetTime(row[3]);

      const workOutStr = cleanSheetTime(row[4]);

      

      // Calculate work hours from time difference if available

      var workHoursVal = row[9] ? row[9].toString().trim() : '';

      var otHoursVal = row[8] ? row[8].toString().trim() : '';

      

      // Auto-compute hours if both in/out exist but hours is empty

      if (workInStr && workOutStr && !workHoursVal) {

        workHoursVal = calcTimeDiffHours_(workInStr, workOutStr);

      }

      if (otInStr && otOutStr && !otHoursVal) {

        otHoursVal = calcTimeDiffHours_(otInStr, otOutStr);

      }

      

      // Clean hours that are Date objects

      if (row[9] instanceof Date) {

        workHoursVal = cleanSheetTime(row[9]);

      }

      if (row[8] instanceof Date) {

        otHoursVal = cleanSheetTime(row[8]);

      }

      

      logs.push({

        managerName: row[0].toString().trim(),

        otIn: otInStr,

        otOut: otOutStr,

        workIn: workInStr,

        workOut: workOutStr,

        otDetail: row[5] ? row[5].toString().trim() : '',

        isPresent: parseInt(row[6]) || 0,

        isAbsent: parseInt(row[7]) || 0,

        otHours: otHoursVal,

        workHours: workHoursVal,

        date: cleanSheetDate(row[10]),

        lat: row[11] ? row[11].toString().trim() : '',

        lng: row[12] ? row[12].toString().trim() : '',

        photoInUrl: row[13] ? row[13].toString().trim() : '',

        photoOutUrl: row[14] ? row[14].toString().trim() : ''

      });

    });

    

    return logs;

  } catch (err) {

    return { error: err.message };

  }

}

function calcTimeDiffHours_(startHHMM, endHHMM) {

  try {

    var sp = startHHMM.split(':');

    var ep = endHHMM.split(':');

    var startMins = parseInt(sp[0]) * 60 + parseInt(sp[1]);

    var endMins = parseInt(ep[0]) * 60 + parseInt(ep[1]);

    var diff = endMins - startMins;

    if (diff < 0) diff += 24 * 60;

    var h = Math.floor(diff / 60);

    var m = diff % 60;

    return h + ':' + ('0' + m).slice(-2);

  } catch(e) {

    return '';

  }

}

function addManagerLog(log, logUser) {

  checkTeacherBlock(logUser);

  try {

    let sheet = getDb().getSheetByName('Data ผจก.');

    if (!sheet) {

      sheet = getOrCreateSheet('Data ผจก.');

      if (!sheet) throw new Error('ไม่สามารถสร้างชีต Data ผจก. ได้');

    }

    

    // Save photo to Drive if provided

    var photoInUrl = '';

    var photoOutUrl = '';

    

    if (log.photoIn) {

      photoInUrl = saveManagerPhoto_(log.photoIn, log.managerName, log.date, 'checkin');

    }

    if (log.photoOut) {

      photoOutUrl = saveManagerPhoto_(log.photoOut, log.managerName, log.date, 'checkout');

    }

    

    var logType = log.type || 'checkin';

    

    if (logType === 'checkout') {

      // Find existing row for same manager + date and update it

      var data = sheet.getDataRange().getValues();

      var foundRow = -1;

      for (var r = 1; r < data.length; r++) {

        var rowName = (data[r][0] || '').toString().trim();

        var rowDate = cleanSheetDate(data[r][10]);

        if (rowName === log.managerName && rowDate === log.date) {

          foundRow = r + 1; // 1-indexed

          break;

        }

      }

      

      if (foundRow > 0) {

        // Update existing row with checkout data

        sheet.getRange(foundRow, 3).setValue(log.otOut || '');   // C: otOut

        sheet.getRange(foundRow, 5).setValue(log.workOut || ''); // E: workOut

        sheet.getRange(foundRow, 2).setValue(log.otIn || sheet.getRange(foundRow, 2).getValue()); // B: otIn (keep if exists)

        sheet.getRange(foundRow, 6).setValue(log.otDetail || sheet.getRange(foundRow, 6).getValue()); // F: otDetail

        

        // Recalculate work hours

        var existingWorkIn = cleanSheetTime(sheet.getRange(foundRow, 4).getValue());

        if (existingWorkIn && log.workOut) {

          var wh = calcTimeDiffHours_(existingWorkIn, log.workOut);

          if (wh) sheet.getRange(foundRow, 10).setValue(wh); // J: workHours

        }

        

        // Calculate OT hours

        if (log.otHours) {

          sheet.getRange(foundRow, 9).setValue(log.otHours); // I: otHours

        }

        

        // Update photo out URL

        if (photoOutUrl) {

          sheet.getRange(foundRow, 15).setValue(photoOutUrl); // O: photoOut

        }

        

        logActivity(logUser, 'บันทึกออกงานผู้จัดการ', 'ผู้จัดการ: ' + log.managerName + ' ออกงาน: ' + (log.workOut || '-'));

        return { success: true };

      } else {

        // No existing row found, create new row with checkout data

        var rowData = [

          log.managerName,

          log.otIn || '',

          log.otOut || '',

          '',

          log.workOut || '',

          log.otDetail || '',

          0,

          0,

          log.otHours || '',

          '',

          log.date || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy'),

          log.lat || '',

          log.lng || '',

          '',

          photoOutUrl

        ];

        sheet.appendRow(rowData);

        logActivity(logUser, 'บันทึกออกงานผู้จัดการ (แถวใหม่)', 'ผู้จัดการ: ' + log.managerName);

        return { success: true };

      }

    } else {

      // CHECKIN: Always create new row

      var rowData = [

        log.managerName,

        log.otIn || '',

        log.otOut || '',

        log.workIn || '',

        log.workOut || '',

        log.otDetail || '',

        log.isPresent ? 1 : 0,

        log.isAbsent ? 1 : 0,

        log.otHours || '',

        log.workHours || '',

        log.date || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy'),

        log.lat || '',

        log.lng || '',

        photoInUrl,

        ''

      ];

      

      sheet.appendRow(rowData);

      logActivity(logUser, 'บันทึกเข้างานผู้จัดการ', 'ผู้จัดการ: ' + log.managerName + ' สถานะ: ' + (log.isPresent ? 'มาทำงาน' : 'หยุดงาน'));

      return { success: true };

    }

  } catch (err) {

    return { success: false, error: err.message };

  }

}

function saveManagerPhoto_(base64Data, managerName, dateStr, photoType) {

  try {

    if (!base64Data) return '';

    

    // Get or create folder for manager photos

    var parentFolder = DriveApp.getFileById(getDb().getId()).getParents().next();

    var folderName = 'รูปลงเวลา_ผจก.';

    var folders = parentFolder.getFoldersByName(folderName);

    var folder;

    if (folders.hasNext()) {

      folder = folders.next();

    } else {

      folder = parentFolder.createFolder(folderName);

    }

    

    // Parse base64

    var parts = base64Data.split(',');

    var mimeType = 'image/jpeg';

    if (parts[0] && parts[0].indexOf('image/png') !== -1) mimeType = 'image/png';

    var rawData = parts.length > 1 ? parts[1] : parts[0];

    

    var blob = Utilities.newBlob(Utilities.base64Decode(rawData), mimeType,

      managerName + '_' + (dateStr || '').replace(/\//g, '-') + '_' + photoType + '_' + Date.now() + (mimeType === 'image/png' ? '.png' : '.jpg'));

    

    var file = folder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    

    return 'https://drive.google.com/uc?id=' + file.getId();

  } catch (e) {

    Logger.log('saveManagerPhoto_ error: ' + e.message);

    return '';

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

  const numCols = Math.min(15, lastCol - 15);

  let result = {

    sheetName: targetSheet.getName(),

    headers: []

  };

  

  if (numCols > 0) {

    result.headers = targetSheet.getRange(1, COURSE_START_COL, 5, numCols).getValues();

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

        const row5 = new Array(18).fill('');

        headers.forEach((h, idx) => {

          row5[idx] = h;

        });

        row5[10] = 'ยอดรวม'; // Col 11

        row5[11] = 'ส่วนลด'; // Col 12

        row5[12] = 'คงเหลือ'; // Col 13

        row5[13] = 'ยอดจ่าย'; // Col 14

        row5[14] = 'รูดบัตร'; // Col 15

        row5[15] = 'วันที่ชำระเงิน'; // Col 16

        row5[16] = 'ช่องทางชำระเงิน'; // Col 17

        row5[17] = 'ผู้รับเงิน'; // Col 18

        

        sheet.getRange(5, 1, 1, 18).setValues([row5]);

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

function parseHoursStrToMinutes(val) {

  if (!val) return 0;

  

  if (val instanceof Date) {

    return val.getHours() * 60 + val.getMinutes();

  }

  

  const s = val.toString().trim();

  if (s.includes('GMT') || s.includes('1899')) {

    const match = s.match(/(\d{2}):(\d{2}):(\d{2})/);

    if (match) {

      const hrs = parseInt(match[1], 10) || 0;

      const mins = parseInt(match[2], 10) || 0;

      return hrs * 60 + mins;

    }

  }

  

  if (s.includes(':')) {

    const parts = s.split(':');

    const hrs = parseInt(parts[0], 10) || 0;

    const mins = parseInt(parts[1], 10) || 0;

    return hrs * 60 + mins;

  }

  if (s.includes('ชม.') || s.includes('นาที')) {

    return parseHoursLeftToMinutes(s);

  }

  const num = parseFloat(s);

  if (!isNaN(num)) {

    return Math.round(num * 60);

  }

  return 0;

}

function matchCourseName(dlSubject, studCourse) {

  if (!dlSubject || !studCourse) return false;

  const cleanDl = dlSubject.toLowerCase().replace(/\s+/g, '').trim();

  const cleanStud = studCourse.toLowerCase().replace(/\s+/g, '').trim();

  

  if (cleanDl === cleanStud) return true;

  

  const dlNumMatch = cleanDl.match(/\d+$/);

  const studNumMatch = cleanStud.match(/\d+$/);

  const dlNum = dlNumMatch ? dlNumMatch[0] : '';

  const studNum = studNumMatch ? studNumMatch[0] : '';

  

  if (dlNum !== studNum) {

    return false;

  }

  

  return cleanDl.indexOf(cleanStud) !== -1 || cleanStud.indexOf(cleanDl) !== -1;

}

// Duplicate matchCourseNameIgnoringRound removed to avoid redeclaration error

function recalculateSubjectHours(subject) {

  const db = getDb();

  const res = findTargetSheetNameAndStudent(subject);

  if (!res.sheetName) return;

  

  recalculatePrivateSheetHours(res.sheetName);

}

function getGradeFromSheetName(sheetName) {

  const grades = ['อนุบาล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];

  for (let g of grades) {

    if (sheetName.includes(g)) return g;

  }

  return 'อนุบาล';

}

function debugSearchNada() {

  const db = getDb();

  

  // รันระบบประมวลผลก่อนดึงข้อมูลมาดีบั๊ก

  getPrivateSheetData('เดี่ยว อนุบาล');

  

  const learnSheet = db.getSheetByName('Data Learn');

  const data = learnSheet.getDataRange().getValues();

  const results = [];

  for (let i = 1; i < data.length; i++) {

    const subject = data[i][0] ? data[i][0].toString() : '';

    if (subject.includes('ณดา') || subject.includes('ลินลดา')) {

      results.push(`Row ${i + 1}: ${subject} (Live: ${data[i][6]}, Online: ${data[i][7]}, Makeup: ${data[i][10]}, Hours: ${data[i][12]}, Date: ${data[i][13]})`);

    }

  }

  

  const kgSheet = db.getSheetByName('เดี่ยว อนุบาล');

  const kgData = kgSheet ? kgSheet.getRange(12, 1, kgSheet.getLastRow() - 11, 21).getValues() : [];

  const kgResults = [];

  kgData.forEach((row, idx) => {

    kgResults.push(`Row ${idx + 12}: Name: ${row[1]}, Nickname: ${row[2]}, Course: ${row[10]}, Note: ${row[11]}, CF: ${row[12]}, Full: ${row[13]}, Paid: ${row[14]}, Bal: ${row[15]}, Acc: ${row[19]}, Left: ${row[20]}`);

  });

  

  Logger.log('Search Results:\n' + results.join('\n') + '\n\nKindergarten Rows:\n' + kgResults.join('\n'));

  return results;

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

  const isPresent = (parseInt(log.isPresentLive) || 0) >= 1 || 

                    (parseInt(log.isPresentOnline) || 0) >= 1 || 

                    (parseInt(log.isMakeup) || 0) >= 1;

  if (!isPresent) return;

  recalculateSubjectHours(log.subject);

}

function addMultipleClassLogs(logs, logUser) {

  checkTeacherBlock(logUser);

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(15000);

    const sheet = getDb().getSheetByName('Data Learn');

    if (!sheet) throw new Error('Data Learn sheet not found');

    

    logs.forEach(function(log) { log.subject = formatSubjectWithDayTime(log.subject, log.date, log.timeStart, log.timeEnd); });

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

      log.hours || '',

      log.date || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy'),

log.roomBranch || '',
0,
(parseInt(log.isPresentLive, 10)||0) + (parseInt(log.isPresentOnline, 10)||0) + (parseInt(log.isMakeup, 10)||0)

    ]);

    

    const lastRow = sheet.getLastRow();

    sheet.getRange(lastRow + 1, 1, rowsData.length, 16).setValues(rowsData);

    

    logs.forEach(log => {

      try {

        processClassHoursDeduction(log, false);

      } catch (e_deduct) {}

    });

    

    logActivity(logUser, 'บันทึกคาบสอนหลายรายการ', 'จำนวน: ' + logs.length + ' วิชา: ' + logs[0].subject);

    

    // Invalidate caches

    const teachers = [];

    logs.forEach(log => {

      clearClassLogsCache(log.date);

      teachers.push(log.teacherRegular);

      if (log.teacherSub) teachers.push(log.teacherSub);

    });

    invalidateTeacherSalaryCache(teachers);

    

    return { success: true };

  } catch (err) {

    return { success: false, error: err.message };

  } finally {

    lock.releaseLock();

  }

}

function saveBatchClassLogs(adds, updates, deletes, logUser) {

  checkTeacherBlock(logUser);

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(15000);

    const sheet = getDb().getSheetByName('Data Learn');

    if (!sheet) throw new Error('Data Learn sheet not found');

    const teachersToInvalidate = new Set();

    const datesToInvalidate = new Set();

    let actionLog = [];

    

    // Process Updates

    if (updates && updates.length > 0) {

      updates.forEach(u => {

        const rowIndex = u.rowIndex;

        const log = u.log;

        const rowVals = sheet.getRange(rowIndex, 1, 1, 16).getValues()[0];

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

        // log.isOrange removed

          hours: rowVals[11] ? rowVals[11].toString().trim() : '',

          date: rowVals[12] ? rowVals[12].toString().trim() : '',

          roomBranch: rowVals[13] ? rowVals[13].toString().trim() : ''

        };

        try { processClassHoursDeduction(oldLog, true); } catch(e){}

        

        log.subject = formatSubjectWithDayTime(log.subject, log.date, log.timeStart, log.timeEnd);

        const newVals = [[

          log.subject, log.teacherRegular, log.teacherSub || '',

          log.timeStart, log.timeEnd, log.note || '',

          log.isPresentLive ? parseInt(log.isPresentLive, 10) || 0 : 0,

          log.isPresentOnline ? parseInt(log.isPresentOnline, 10) || 0 : 0,

          log.isLeave ? parseInt(log.isLeave, 10) || 0 : 0,

          log.isAbsent ? parseInt(log.isAbsent, 10) || 0 : 0,

          log.isMakeup ? parseInt(log.isMakeup, 10) || 0 : 0,

        // isOrange removed from write array

          log.hours || '', log.date || '', log.roomBranch || ''

        ]];

        sheet.getRange(rowIndex, 1, 1, 14).setValues(newVals);

        sheet.getRange(rowIndex, 15).setValue(''); // clear confirm
        
        // Update numKids column
        sheet.getRange(rowIndex, 16).setValue((parseInt(log.isPresentLive, 10)||0) + (parseInt(log.isPresentOnline, 10)||0) + (parseInt(log.isMakeup, 10)||0));

        try { processClassHoursDeduction(log, false); } catch(e){}

        

        datesToInvalidate.add(oldLog.date);

        datesToInvalidate.add(log.date);

        teachersToInvalidate.add(oldLog.teacherRegular);

        if (oldLog.teacherSub) teachersToInvalidate.add(oldLog.teacherSub);

        teachersToInvalidate.add(log.teacherRegular);

        if (log.teacherSub) teachersToInvalidate.add(log.teacherSub);

        actionLog.push('แก้ไข: ' + log.subject);

      });

    }

    

    // Process Adds

    if (adds && adds.length > 0) {

      adds.forEach(function(log) { log.subject = formatSubjectWithDayTime(log.subject, log.date, log.timeStart, log.timeEnd); });

      const rowsData = adds.map(log => [

        log.subject, log.teacherRegular, log.teacherSub || '',

        log.timeStart, log.timeEnd, log.note || '',

        log.isPresentLive ? parseInt(log.isPresentLive, 10) || 0 : 0,

        log.isPresentOnline ? parseInt(log.isPresentOnline, 10) || 0 : 0,

        log.isLeave ? parseInt(log.isLeave, 10) || 0 : 0,

        log.isAbsent ? parseInt(log.isAbsent, 10) || 0 : 0,

        log.isMakeup ? parseInt(log.isMakeup, 10) || 0 : 0,

        // isOrange removed from write array

        log.hours || '', log.date || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy'),

        log.roomBranch || ''

      ]);

      const lastRow = sheet.getLastRow();

      sheet.getRange(lastRow + 1, 1, rowsData.length, 14).setValues(rowsData);

      

      adds.forEach(log => {

        try { processClassHoursDeduction(log, false); } catch (e) {}

        datesToInvalidate.add(log.date);

        teachersToInvalidate.add(log.teacherRegular);

        if (log.teacherSub) teachersToInvalidate.add(log.teacherSub);

      });

      actionLog.push('เพิ่มใหม่: ' + adds.length + ' รายการ');

    }

    

    if (actionLog.length > 0) {

      logActivity(logUser, 'Batch Update คลาสเรียน', actionLog.join(', '));

      datesToInvalidate.forEach(d => clearClassLogsCache(d));

      invalidateTeacherSalaryCache(Array.from(teachersToInvalidate));

    }

    

    return { success: true };

  } catch (err) {

    return { success: false, error: err.message };

  } finally {

    lock.releaseLock();

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

function getTeacherRoomSchedule(teacherName, nickname, startVal, endVal) {

  try {

    const start = startVal ? new Date(startVal + 'T00:00:00') : null;

    const end = endVal ? new Date(endVal + 'T23:59:59') : null;

    

    // 1. Get correct teacher nickname from TeachersDB

    const teachersList = getTeachersDB(null);

    let matchedTeacherNick = (nickname || teacherName || '').toString().trim();

    

    if (teacherName) {

      const cleanName = teacherName.toString().toLowerCase().trim();

      const match = teachersList.find(t => {

        const tId = (t.teacherId || '').toLowerCase().trim();

        const tNick = t.nickname.toLowerCase().trim();

        return (tId !== '' && tId === cleanName) || tNick === cleanName;

      });

      if (match) {

        matchedTeacherNick = match.nickname;

      }

    }

    

    const cleanNickTarget = matchedTeacherNick.toLowerCase();

    

    // 2. Fetch ClassLogs and filter

    const classLogs = getClassLogs('all');

    const classes = [];

    

    classLogs.forEach(c => {

      // Check teacher match (regular or sub)

      const tReg = (c.teacherRegular || '').toLowerCase();

      const tSub = (c.teacherSub || '').toLowerCase();

      

      let match = false;

      if (cleanNickTarget && (tReg.includes(cleanNickTarget) || tSub.includes(cleanNickTarget))) {

        match = true;

      }

      

      if (!match) return;

      

      // Check date range

      if (start && end && c.date) {

        const parts = c.date.split('/');

        if (parts.length === 3) {

          let y = parseInt(parts[2]);

          if (y > 2400) y -= 543;

          const cDate = new Date(y, parseInt(parts[1]) - 1, parseInt(parts[0]));

          if (cDate < start || cDate > end) return;

        } else {

          return;

        }

      }

      

      classes.push({

        id: c.rowIndex,

        date: c.date || "",

        timeStart: c.timeStart || "",

        timeEnd: c.timeEnd || "",

        subject: c.subject || "",

        teacherRegular: c.teacherRegular || "",

        teacherSub: c.teacherSub || "",

        roomBranchInfo: c.roomBranch || "",

        memo: c.note || "",

        presentCount: c.isPresentLive || 0,

        onlineCount: c.isPresentOnline || 0,

        leaveCount: c.isLeave || 0,

        absentCount: c.isAbsent || 0,

        makeUpCount: c.isMakeup || 0,

        extraCount: 0,

        hours: c.hours || 0,

        roomBranch: c.roomBranch || "",

        rowIndex: c.rowIndex

      });

    });

    

    return classes;

  } catch (e) {

    return { error: e.message };

  }

}

function getStudentHistoryData(name, nickname, logUser) {

  if (logUser) checkTeacherBlock(logUser);

  try {

    const db = getDb();

    // ensureDataLearnMigrated(db);

    const statusSheet = db.getSheetByName('StatusDB');

    const allStudents = [];

    if (statusSheet) {

      const data = statusSheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {

        const row = data[i];

        const stdName = row[1] ? row[1].toString().trim() : '';

        const stdNick = row[2] ? row[2].toString().trim() : '';

        

        // ค้นหาด้วยชื่อ-นามสกุลเต็มเป็นหลัก (exact match)

        if (stdName === name) {

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

    

    // ดึงรายการชื่อคอร์สทั้งหมดของนักเรียนคนนี้ (ซึ่งกรองด้วยชื่อ-นามสกุลตรงกันแล้ว)

    const enrolledCourseNames = allStudents.map(s => s.courseName.toLowerCase().trim()).filter(c => c.length > 0);

    

    if (classSheet) {

      const cData = classSheet.getDataRange().getValues();

      for (let i = 1; i < cData.length; i++) {

        const row = cData[i];

        const subject = row[0] ? row[0].toString().trim() : '';

        const subjectClean = subject.toLowerCase().trim();

        

        // เช็คว่าวิชาใน Data Learn ตรงกับคอร์สที่ลงทะเบียนจริง

        let isCourseMatch = enrolledCourseNames.some(cName => {

          return subjectClean === cName || subjectClean.indexOf(cName) !== -1 || cName.indexOf(subjectClean) !== -1;

        });

        

        // Fallback exact name matching

        if (!isCourseMatch && name) {

          isCourseMatch = subjectClean.indexOf(name.toLowerCase().trim()) !== -1;

        }

        

        if (isCourseMatch) {

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

        // log.isOrange removed

            hours: row[11] ? row[11].toString().trim() : '',

            date: cleanSheetDate(row[12]),

            roomBranch: row[13] ? row[13].toString().trim() : '',

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

  checkTeacherBlock(logUser);

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

    const paymentChannel = paymentData.paymentChannel || 'กสิกร บักชีบริษัท(สแกน)';

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

    // บันทึกเงินชำระเพิ่มเติมลงรอบชำระ 1-4 ที่ว่างอยู่โดยอัตโนมัติ

    const paymentTime = paymentData.paymentTime || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'HH.mm น.');

    for (let r = 1; r <= 4; r++) {

      const colIdx = 26 + (r - 1) * 5;

      const curAmt = parseFloat(statusSheet.getRange(rowIndex, colIdx).getValue()) || 0;

      if (curAmt === 0) {

        statusSheet.getRange(rowIndex, colIdx).setValue(paidAmount);

        statusSheet.getRange(rowIndex, colIdx + 1).setValue(paymentDate);

        statusSheet.getRange(rowIndex, colIdx + 2).setValue(paymentChannel);

        statusSheet.getRange(rowIndex, colIdx + 3).setValue(staff);

        statusSheet.getRange(rowIndex, colIdx + 4).setValue(paymentTime);

        break;

      }

    }

    

    // Optimized: Read the whole row at once to avoid multiple slow getValue() calls

    const rowVals = statusSheet.getRange(rowIndex, 1, 1, 24).getValues()[0];

    const name = rowVals[1] ? rowVals[1].toString().trim() : '';

    const nickname = rowVals[2] ? rowVals[2].toString().trim() : '';

    const school = rowVals[3] ? rowVals[3].toString().trim() : '';

    const contact = rowVals[4] ? rowVals[4].toString().trim() : '';

    const branchLearn = rowVals[5] ? rowVals[5].toString().trim() : '';

    const branchPay = rowVals[6] ? rowVals[6].toString().trim() : '';

    const round = rowVals[15] ? rowVals[15].toString().trim() : '';

    const grade = rowVals[16] ? rowVals[16].toString().trim() : '';

    const classSection = rowVals[17] ? rowVals[17].toString().trim() : '';

    const lineName = rowVals[18] ? rowVals[18].toString().trim() : '';

    const lineId = rowVals[19] ? rowVals[19].toString().trim() : '';

    const hours = rowVals[21] ? rowVals[21].toString().trim() : '';

    const classType = rowVals[23] ? rowVals[23].toString().trim() : '';

    

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

// บันทึกสถานะการเงินและการชำระเงินรายรับพร้อมระบบเชื่อมข้อมูลในชีต

function updateRevenues(updates, logUser) {

  checkTeacherBlock(logUser);

  try {

    const db = getDb();

    const sheet = db.getSheetByName('StatusDB');

    if (!sheet) throw new Error('StatusDB sheet not found');

    

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) return { success: true };

    

    // Read all data once to perform in-memory search

    const allData = sheet.getRange(1, 1, lastRow, 25).getValues();

    

    updates.forEach(up => {

      let rowIndex = -1;

      for (let i = 0; i < allData.length; i++) {

        if (allData[i][0].toString().trim() === up.id) {

          rowIndex = i + 1;

          break;

        }

      }

      

      if (rowIndex !== -1) {

        // อัปเดตข้อมูลในช่องทางชำระเงิน (คอลัมน์ N/14) และ ตรวจสอบแล้ว (คอลัมน์ Y/25)

        sheet.getRange(rowIndex, 14).setValue(up.paymentChannel);

        sheet.getRange(rowIndex, 25).setValue(up.isChecked ? 1 : 0);

        

        // ส่งข้อมูลที่อัปเดตไปบันทึกยังชีตแยกตามระดับชั้น

        const rowVals = allData[rowIndex - 1];

        const studentObj = {

          id: up.id,

          name: rowVals[1] ? rowVals[1].toString().trim() : '',

          nickname: rowVals[2] ? rowVals[2].toString().trim() : '',

          school: rowVals[3] ? rowVals[3].toString().trim() : '',

          classSection: rowVals[17] ? rowVals[17].toString().trim() : '',

          contact: rowVals[4] ? rowVals[4].toString().trim() : '',

          lineName: rowVals[18] ? rowVals[18].toString().trim() : '',

          lineId: rowVals[19] ? rowVals[19].toString().trim() : '',

          branchLearn: rowVals[5] ? rowVals[5].toString().trim() : '',

          branchPay: rowVals[6] ? rowVals[6].toString().trim() : '',

          round: rowVals[15] ? rowVals[15].toString().trim() : '',

          paymentTimeNote: rowVals[7] ? rowVals[7].toString().trim() : '',

          carriedForwardFee: parseFloat(rowVals[20]) || 0,

          full: parseFloat(rowVals[10]) || 0,

          paid: parseFloat(rowVals[9]) || 0,

          paymentDate: cleanSheetDate(rowVals[12]),

          paymentChannel: up.paymentChannel, // ใช้ค่าที่เลือกใหม่

          staff: rowVals[14] ? rowVals[14].toString().trim() : '',

          classHours: rowVals[21] ? rowVals[21].toString().trim() : '',

          classHoursLeft: rowVals[22] ? rowVals[22].toString().trim() : '',

          classType: rowVals[23] ? rowVals[23].toString().trim() : 'เดี่ยว'

        };

        syncToGradeSheet(studentObj);

      }

    });

    

    logActivity(logUser, 'บันทึกสถานะการชำระเงินรายรับ', `อัปเดตจำนวน ${updates.length} รายการ`);

    invalidateStudentCache();

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function pingActiveUser(username, displayStr) {

  if (!username) return [];

  const lock = LockService.getScriptLock();

  let hasLock = false;

  try {

    lock.waitLock(3000);

    hasLock = true;

    const cache = CacheService.getScriptCache();

    let listStr = cache.get('active_users_list') || '{}';

    let users = JSON.parse(listStr);

    

    const now = new Date().getTime();
    
    users[username] = { ts: now, display: displayStr || username };

    

    const activeUsernames = [];

    const cleaned = {};

    for (const u in users) {

      const userData = users[u];
      const isLegacy = typeof userData === 'number';
      const ts = isLegacy ? userData : userData.ts;
      
      if (now - ts < 45000) {

        cleaned[u] = users[u];

        activeUsernames.push(isLegacy ? u : userData.display);

      }

    }

    

    cache.put('active_users_list', JSON.stringify(cleaned), 300);

    return activeUsernames;

  } catch (e) {

    try {

      const cache = CacheService.getScriptCache();

      let listStr = cache.get('active_users_list') || '{}';

      let users = JSON.parse(listStr);

      let activeUsernames = [];
      for (const u in users) {
        const userData = users[u];
        const isLegacy = typeof userData === 'number';
        activeUsernames.push(isLegacy ? u : userData.display);
      }
      return activeUsernames;

    } catch (err) {

      return [];

    }

  } finally {

    if (hasLock) {

      lock.releaseLock();

    }

  }

}

function getMultipleStudentsCourses(students, logUser) {

  if (logUser) checkTeacherBlock(logUser);

  if (!Array.isArray(students) || students.length === 0) return {};

  const db = getDb();

  const results = {};

  

  // Group students by sheet name (for กลุ่มหลัก)

  const mainGroupSheets = {};

  

  students.forEach(s => {

    const classType = s.classType || '';

    if (classType.includes('เดี่ยว') || classType.includes('ย่อย')) {

      return;

    }

    

    let suffix = '1';

    const branchLearn = s.branchLearn || '';

    if (branchLearn.includes('สาขา2') || branchLearn.includes('2')) suffix = '2';

    else if (branchLearn.includes('สาขา3') || branchLearn.includes('3')) suffix = '3';

    

    const sheetName = `${s.grade}/${suffix}`;

    if (!mainGroupSheets[sheetName]) {

      mainGroupSheets[sheetName] = [];

    }

    mainGroupSheets[sheetName].push(s);

  });

  

  // Now process each sheet

  for (const sheetName in mainGroupSheets) {

    try {

      const sheet = db.getSheetByName(sheetName);

      if (!sheet) continue;

      

      const lastRow = sheet.getLastRow();

      const lastCol = sheet.getLastColumn();

      if (lastRow < 6 || lastCol < 19) continue;

      

      // Get course names from headerRow1 (row 1, col 16 to lastCol)

      const headerRow1 = sheet.getRange(1, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];

      

      // Get student rows (col 1 to lastCol, row 6 onwards)

      const studentData = sheet.getRange(6, 1, lastRow - 5, lastCol).getValues();

      const sheetStudents = mainGroupSheets[sheetName];

      

      sheetStudents.forEach(s => {

        // Find this student in the sheet

        const foundRow = studentData.find(row => {

          const name = row[1] ? row[1].toString().trim() : '';

          return name === s.name;

        });

        

        if (foundRow) {

          const courses = [];

          for (let i = 0; i < headerRow1.length; i++) {

            const val = foundRow[18 + i];

            if (val !== '' && val !== null && val !== undefined) {

              courses.push(headerRow1[i].toString().trim());

            }

          }

          results[s.id] = courses;

        } else {

          results[s.id] = [];

        }

      });

    } catch (err) {

      // In case of error, continue processing other sheets

    }

  }

  

  return results;

}

// ----------------------------------------------------

// Version 53.9 - Database Column Compressor Migration

// ----------------------------------------------------

function migrateGradeClassroomSheets() {

  const db = getDb();

  const sheets = db.getSheets();

  

  sheets.forEach(sheet => {

    const name = sheet.getName();

    const match = name.match(/^(.+)\/([1-3])$/);

    if (!match) return; // Not a classroom sheet

    

    const lastRow = sheet.getLastRow();

    const lastCol = sheet.getLastColumn();

    if (lastRow < 5) return;

    

    // Check if already migrated

    const col11Val = sheet.getRange(5, 11).getValue().toString().trim();

    if (col11Val === 'ยอดรวม') {

      return; // Already migrated!

    }

    

    Logger.log('Migrating sheet to compact column format: ' + name);

    

    // Read all courses starting at column 71

    const courses = [];

    if (lastCol >= 71) {

      const headerRow1 = sheet.getRange(1, 71, 1, lastCol - 70).getValues()[0];

      const headerRow2 = sheet.getRange(2, 71, 1, lastCol - 70).getValues()[0];

      const headerRow3 = sheet.getRange(3, 71, 1, lastCol - 70).getValues()[0];

      const headerRow4 = sheet.getRange(4, 71, 1, lastCol - 70).getValues()[0];

      

      for (let i = 0; i < headerRow1.length; i++) {

        if (headerRow1[i]) {

          courses.push({

            colIndex: 71 + i,

            courseName: headerRow1[i].toString().trim(),

            price: parseFloat(headerRow2[i]) || 0,

            dayTime: headerRow3[i] ? headerRow3[i].toString().trim() : '',

            totalSessions: parseInt(headerRow4[i]) || 10

          });

        }

      }

    }

    

    // Read all student data rows (row 6 onwards)

    const studentRows = [];

    if (lastRow >= 6) {

      const allRows = sheet.getRange(6, 1, lastRow - 5, lastCol).getValues();

      allRows.forEach(row => {

        const studentInfo = row.slice(0, 10);

        const full = parseFloat(row[50]) || 0;

        const discount = parseFloat(row[61]) || 0;

        const outstanding = parseFloat(row[62]) || 0;

        const paid = parseFloat(row[63]) || 0;

        const isCard = parseInt(row[69]) === 1 ? 1 : 0;

        

        const courseValues = [];

        courses.forEach(c => {

          courseValues.push(row[c.colIndex - 1]);

        });

        

        studentRows.push({

          info: studentInfo,

          full: full,

          discount: discount,

          outstanding: outstanding,

          paid: paid,

          isCard: isCard,

          courseValues: courseValues

        });

      });

    }

    

    // Clear and rebuild sheet with new layout

    sheet.clear();

    

    // 1. Write course headers (rows 1-4) starting at col 16

    if (courses.length > 0) {

      const hRow1 = [];

      const hRow2 = [];

      const hRow3 = [];

      const hRow4 = [];

      courses.forEach(c => {

        hRow1.push(c.courseName);

        hRow2.push(c.price);

        hRow3.push(c.dayTime);

        hRow4.push(c.totalSessions);

      });

      sheet.getRange(1, COURSE_START_COL, 1, courses.length).setValues([hRow1]);

      sheet.getRange(2, COURSE_START_COL, 1, courses.length).setValues([hRow2]);

      sheet.getRange(3, COURSE_START_COL, 1, courses.length).setValues([hRow3]);

      sheet.getRange(4, COURSE_START_COL, 1, courses.length).setValues([hRow4]);

    }

    

    // 2. Write Row 5 headers

    const row5Headers = [

      'ระดับชั้น', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'โรงเรียน', 'ห้องเรียนย่อย',

      'เบอร์ติดต่อ', 'ชื่อโปรไฟล์ไลน์', 'ID LINE', 'สาขาเรียน', 'สาขาที่เก็บเงิน',

      'ยอดรวม', 'ส่วนลด', 'คงเหลือ', 'ยอดจ่าย', 'รูดบัตร', 'วันที่ชำระเงิน', 'ช่องทางชำระเงิน', 'ผู้รับเงิน'

    ];

    courses.forEach(c => {

      row5Headers.push(c.courseName);

    });

    

    sheet.getRange(5, 1, 1, row5Headers.length).setValues([row5Headers]);

    

    // 3. Write student rows

    if (studentRows.length > 0) {

      const valuesToWrite = [];

      studentRows.forEach(sr => {

        const row = [];

        row.push(...sr.info);

        row.push(sr.full);

        row.push(sr.discount);

        row.push(sr.outstanding);

        row.push(sr.paid);

        row.push(sr.isCard);

        row.push(...sr.courseValues);

        valuesToWrite.push(row);

      });

      sheet.getRange(6, 1, valuesToWrite.length, valuesToWrite[0].length).setValues(valuesToWrite);

    }

  });

}

function migrateManagerLogSheet() {

  const db = getDb();

  const sheet = db.getSheetByName('Data ผจก.');

  if (!sheet) return;

  

  const lastRow = sheet.getLastRow();

  const lastCol = sheet.getLastColumn();

  if (lastRow < 1) return;

  

  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  const col8Val = headerRow[7] ? headerRow[7].toString().trim() : '';

  if (col8Val === 'หยุด') {

    return; // Already migrated!

  }

  

  Logger.log('Migrating Data ผจก. sheet to compact format');

  

  const allRows = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  const migratedRows = [];

  

  allRows.forEach((row, idx) => {

    if (idx === 0) {

      migratedRows.push([

        'ชื่อผู้จัดการ', 'เวลาเข้าOT', 'เวลาออกOT', 'เวลาเข้างาน', 'เวลาออกงาน',

        'หมายเหตุ รายละเอียด OT', 'มา', 'หยุด', 'ชม.OT', 'ชม.งาน', 'วันที่'

      ]);

    } else {

      migratedRows.push([

        row[0],

        row[1],

        row[2],

        row[3],

        row[4],

        row[5],

        row[6],

        row[8],

        row[10],

        row[11],

        row[12]

      ]);

    }

  });

  

  sheet.clear();

  sheet.getRange(1, 1, migratedRows.length, 11).setValues(migratedRows);

}

function getLowBalancePrivateStudents() {

  const cacheKey = 'low_balance_private_students';

  const cached = getCacheObject(cacheKey);

  if (cached) return cached;

  

  try {

    const db = getDb();

    const privateSheets = [

      "เดี่ยว อนุบาล", "เดี่ยว ป.1", "เดี่ยว ป.2", "เดี่ยว ป.3", "เดี่ยว ป.4", "เดี่ยว ป.5", "เดี่ยว ป.6",

      "เดี่ยว ม.1", "เดี่ยว ม.2", "เดี่ยว ม.3", "เดี่ยว ม.4", "เดี่ยว ม.5", "เดี่ยว ม.6",

      "ย่อย 2-3", "ย่อย 4-5", "ย่อย 6-10"

    ];

    

    const lowBalanceStudents = [];

    

    privateSheets.forEach(sName => {

      const sheet = db.getSheetByName(sName);

      if (!sheet) return;

      

      const lastRow = sheet.getLastRow();

      if (lastRow < 12) return;

      

      const rawData = sheet.getRange(12, 1, lastRow - 11, 21).getValues();

      rawData.forEach(row => {

        const name = row[1] ? row[1].toString().trim() : '';

        const nickname = row[2] ? row[2].toString().trim() : '';

        const courseName = row[10] ? row[10].toString().trim() : '';

        const note = row[11] ? row[11].toString().trim() : '';

        const hoursLeftStr = row[20] ? row[20].toString().trim() : '';

        

        if (!name || note.indexOf('เรียนครบแล้ว') !== -1) return;

        

        // Calculate rate based on rules

        const rate = getPrivateStudentRate(sName, courseName);

        

        const paidVal = parseFloat(row[14]) || 0;

        

        if ((paidVal > 0 && paidVal < 700) || paidVal < 0) {

          lowBalanceStudents.push({

            name: name,

            nickname: nickname,

            courseName: courseName,

            hoursLeftStr: hoursLeftStr,

            remainingMoney: paidVal, // Map paidVal to remainingMoney to display it in the banner

            sheetName: sName

          });

        }

      });

    });

    

    const result = { success: true, students: lowBalanceStudents };

    setCacheObject(cacheKey, result, 600); // Cache for 10 minutes

    return result;

  } catch (err) {

    return { success: false, error: err.message };

  }

}

// ----------------------------------------------------

// Teacher Leave Check (all records, most recent first)

// ----------------------------------------------------

function getTeacherLeaveToday(logUser) {

  try {

    const sheet = getDb().getSheetByName('Data Learn');

    if (!sheet) return { success: false, leaves: [] };

    

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) return { success: true, leaves: [] };

    

    const teachersMap = {};

    try {

      const teachersList = getTeachersDB(null);

      if (Array.isArray(teachersList)) {

        teachersList.forEach(t => {

          if (t.teacherId) teachersMap[t.teacherId.toLowerCase().trim()] = t.nickname;

          if (t.nickname) teachersMap[t.nickname.toLowerCase().trim()] = t.nickname;

        });

      }

    } catch(err) {}

    const data = sheet.getRange(2, 1, lastRow - 1, 15).getValues();

    const leaves = [];

    const seen = new Set();

    

    // Calculate current week boundaries (Monday to Sunday)

    const todayDate = new Date();

    const currentDay = todayDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(todayDate);

    monday.setDate(todayDate.getDate() + diffToMonday);

    monday.setHours(0,0,0,0);

    

    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);

    sunday.setHours(23,59,59,999);

    

    const todayFormatted = Utilities.formatDate(todayDate, 'Asia/Bangkok', 'dd/MM/yyyy');

    for (let i = 0; i < data.length; i++) {

      const note = (data[i][5] || '').toString();

      if (note.indexOf('ครูลา') === -1) continue;

      

      const dateValStr = cleanSheetDate(data[i][12]);

      if (!dateValStr) continue;

      

      const parts = dateValStr.split('/');

      if (parts.length === 3) {

         const d = parseInt(parts[0], 10);

         const m = parseInt(parts[1], 10) - 1;

         const y = parseInt(parts[2], 10);

         const rowDate = new Date(y, m, d);

         

         if (rowDate < monday || rowDate > sunday) {

             continue;

         }

      } else {

         continue;

      }

      

      let teacherName = (data[i][1] || '').toString().trim();

      const subject = cleanSubjectNameString((data[i][0] || '').toString().trim());

      const key = teacherName + '|' + subject + '|' + dateValStr;

      

      if (seen.has(key)) continue;

      seen.add(key);

      

      let timeStart = data[i][3] || '';

      let timeEnd = data[i][4] || '';

      

      try {

        if (timeStart instanceof Date) timeStart = Utilities.formatDate(timeStart, 'Asia/Bangkok', 'HH:mm');

        if (timeEnd instanceof Date) timeEnd = Utilities.formatDate(timeEnd, 'Asia/Bangkok', 'HH:mm');

      } catch(e) {}

      let teacherSub = (data[i][2] || '').toString().trim();

      

      // If there is a substitute teacher, DO NOT show it in the leave list

      if (!isEmptySub(teacherSub)) {

        continue;

      }

      

      const room = data[i][13] || '';

      if (teacherName && teachersMap[teacherName.toLowerCase()]) {

        teacherName = teachersMap[teacherName.toLowerCase()];

      }

      leaves.push({

        rowIndex: i + 2,

        teacher: teacherName,

        subject: subject,

        timeStart: timeStart,

        timeEnd: timeEnd,

        teacherSub: '', // Force empty so UI knows there's no sub

        room: room,

        date: dateValStr,

        isToday: (dateValStr === todayFormatted)

      });

    }

    leaves.sort((a,b) => {

        const pa = a.date.split('/');

        const pb = b.date.split('/');

        if (pa.length !== 3 || pb.length !== 3) return 0;

        const da = new Date(pa[2], pa[1]-1, pa[0]);

        const db = new Date(pb[2], pb[1]-1, pb[0]);

        return da - db;

    });

    return { success: true, leaves: leaves, today: todayFormatted };

  } catch (e) {

    return { success: false, error: e.message, leaves: [] };

  }

}

//=========================================

function getSummary2569Data() {

  const db = getDb();

  const grades = ['อนุบาล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];

  const summary = [];

  

  grades.forEach(grade => {

    const gradeData = { grade: grade, branches: [{}, {}, {}] };

    

    // Group metrics

    for (let b = 1; b <= 3; b++) {

      const sheetName = grade + '/' + b;

      const sheet = db.getSheetByName(sheetName);

      if (sheet) {

        const range = sheet.getRange("B1:C4").getValues();

        gradeData.branches[b-1].groupStudents = parseInt(range[3][0]) || 0; // B4

        gradeData.branches[b-1].groupExpected = parseFloat(range[0][0]) || 0; // B1

        gradeData.branches[b-1].groupPaid = parseFloat(range[2][0]) || 0; // B3

        gradeData.branches[b-1].groupDebt = parseFloat(range[1][0]) || 0; // B2

        gradeData.branches[b-1].groupOver5 = parseInt(range[1][1]) || 0; // C2

      } else {

        gradeData.branches[b-1].groupStudents = 0;

        gradeData.branches[b-1].groupExpected = 0;

        gradeData.branches[b-1].groupPaid = 0;

        gradeData.branches[b-1].groupDebt = 0;

        gradeData.branches[b-1].groupOver5 = 0;

      }

    }

    

    // Private metrics (พ grade)

    const privateSheetName = 'พ ' + grade;

    const pSheet = db.getSheetByName(privateSheetName);

    if (pSheet) {

      const pRange = pSheet.getRange("A2:G4").getValues();

      gradeData.branches[0].privateStudents = parseInt(pRange[0][0]) || 0; // A2
      gradeData.branches[1].privateStudents = parseInt(pRange[0][1]) || 0; // B2
      gradeData.branches[2].privateStudents = parseInt(pRange[0][2]) || 0; // C2
      
    gradeData.branches[0].privatePaid = parseFloat(pRange[1][4]) || 0; // E3

      gradeData.branches[1].privatePaid = parseFloat(pRange[1][5]) || 0; // F3

      gradeData.branches[2].privatePaid = parseFloat(pRange[1][6]) || 0; // G3

      

      gradeData.branches[0].privateDebt = parseFloat(pRange[2][4]) || 0; // E4

      gradeData.branches[1].privateDebt = parseFloat(pRange[2][5]) || 0; // F4

      gradeData.branches[2].privateDebt = parseFloat(pRange[2][6]) || 0; // G4

    } else {

      for(let b=0; b<3; b++) {

         gradeData.branches[b].privateStudents = 0;

         gradeData.branches[b].privatePaid = 0;

         gradeData.branches[b].privateDebt = 0;

      }

    }

    

    summary.push(gradeData);

  });

  

  return summary;

}

function runDebugHeaders() {

  const db = SpreadsheetApp.openById('1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI');

  const s1 = db.getSheetByName('เดี่ยว ป.1');

  const s2 = db.getSheetByName('ป.1/1');

  const res = {

    privateHeaders: s1 ? s1.getRange(11,1,1,s1.getLastColumn()).getValues()[0] : null,

    groupHeaders: s2 ? s2.getRange(5,1,1,s2.getLastColumn()).getValues()[0] : null

  };

  Logger.log(JSON.stringify(res));

}

function getCacheObject(key) {

  try {

    const cache = CacheService.getScriptCache();

    const cached = cache.get(key);

    if (cached) {

      return JSON.parse(cached);

    }

  } catch (e) {

    Logger.log('Cache read error: ' + e.message);

  }

  return null;

}

function clearCacheObject(key) {

  try {

    const cache = CacheService.getScriptCache();

    cache.remove(key);

  } catch (e) {}

}

function deleteCacheObject(key) {

  return clearCacheObject(key);

}

function invalidateStudentCache() {

  clearCacheObject('students_list');

  clearCacheObject('low_balance_private_students');

  

  // Invalidate sheet-specific enrollment mappings

  try {

    const db = getDb();

    const sheets = db.getSheets();

    sheets.forEach(sheet => {

      const name = sheet.getName();

      if (name.match(/^(ป\.|ม\.|อนุบาล)/) || name.match(/^(ย่อย)/)) {

        clearCacheObject('enroll_map_' + name.replace(/\s+/g, '_'));

      }

    });

  } catch (e) {}

}

function ensureTeacherIDs() {
  // Not needed with UsersDB
}

function setCacheObject(key, obj, expirationInSeconds) {

  try {

    const cache = CacheService.getScriptCache();

    cache.put(key, JSON.stringify(obj), expirationInSeconds || 21600);

  } catch (e) {

  }

}

function clearClassLogsCache(dateStr) {

  if (dateStr) {

    clearCacheObject('class_logs_date_v3_' + dateStr);

  }

  clearCacheObject('class_logs_date_v3_all');

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

        clearCacheObject('yearly_pay_v2_' + t + '_' + y);

      }

    });

  });

}

function dumpData() {
  var db = SpreadsheetApp.openById('1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI');
  var uSheet = db.getSheetByName('UsersDB');
  var uData = uSheet ? uSheet.getRange(1, 1, 5, 5).getValues() : 'No UsersDB';
  var lSheet = db.getSheetByName('Data Learn');
  var lData = lSheet ? lSheet.getRange(1, 1, 5, 10).getValues() : 'No Data Learn';
  return JSON.stringify({ users: uData, dataLearn: lData });
}

function debugDataLearnHeaders() {
  const sheet = getDb().getSheetByName('Data Learn');
  if (!sheet) return { error: 'Sheet not found' };
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const sampleRows = lastRow > 1 ? sheet.getRange(2, 1, Math.min(3, lastRow - 1), lastCol).getValues() : [];
  return {
    totalCols: lastCol,
    totalRows: lastRow,
    headers: headers.map((h, i) => ({ index: i, col: i + 1, name: h ? h.toString() : '' })),
    sampleRows: sampleRows.map((row, ri) => {
      const obj = {};
      row.forEach((val, ci) => {
        obj['col' + ci + '_' + (headers[ci] || '?')] = val instanceof Date ? val.toISOString() : val;
      });
      return obj;
    }),
    classlogs_sample: (function() {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2,'0');
      const mm = String(today.getMonth()+1).padStart(2,'0');
      const yyyy = today.getFullYear();
      const todayStr = dd + '/' + mm + '/' + yyyy;
      return 'Today filter: ' + todayStr;
    })()
  };
}

function exportAllDataToJson() {

  const db = getDb();

  

  const getSheetData = (sheetName) => {

    const sheet = db.getSheetByName(sheetName);

    if (!sheet) return [];

    const rows = sheet.getDataRange().getValues();

    const headers = rows[0];

    const data = [];

    for (let i = 1; i < rows.length; i++) {

      const obj = {};

      let hasData = false;

      for (let j = 0; j < headers.length; j++) {

        if (headers[j]) {

          obj[headers[j]] = rows[i][j];

          if (rows[i][j] !== '') hasData = true;

        }

      }

      if (hasData) data.push(obj);

    }

    return data;

  };

  const jsonData = {

    rooms: getSheetData('RoomDB'),

    students: getSheetData('AllStudents'),

    classLogs: getSheetData('ClassLogs'),

    users: getSheetData('UsersDB')

  };

  

  return JSON.stringify(jsonData);

}

function migrateExistingDataLearnSubjects() {

  try {

    const db = getDb();

    const sheet = db.getSheetByName('Data Learn');

    if (!sheet) return { success: false, error: 'Sheet Data Learn not found' };

    

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) return { success: true, message: 'No rows to migrate' };

    

    const range = sheet.getRange(2, 1, lastRow - 1, 15); // Columns A to O

    const values = range.getValues();

    

    const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

    let count = 0;

    

    for (let i = 0; i < values.length; i++) {

      const row = values[i];

      let subject = row[0] ? row[0].toString().trim() : '';

      const start = row[3] ? row[3].toString().trim() : '';

      const end = row[4] ? row[4].toString().trim() : '';

      const dateVal = row[13];

      

      if (!subject || !start || !end || !dateVal) continue;

      

      // Parse the date (could be a Date object or string dd/mm/yyyy)

      let dateObj = null;

      if (dateVal instanceof Date) {

        dateObj = dateVal;

      } else {

        const dateStr = dateVal.toString().trim();

        const parts = dateStr.split('/');

        if (parts.length === 3) {

          let y = parseInt(parts[2]);

          if (y > 2400) y -= 543;

          dateObj = new Date(y, parseInt(parts[1]) - 1, parseInt(parts[0]));

        }

      }

      

      if (!dateObj || isNaN(dateObj.getTime())) continue;

      

      const dayName = thaiDays[dateObj.getDay()];

      const suffix = `${dayName} ${start}-${end}`;

      

      // If the subject doesn't already contain this day name + time

      if (subject.indexOf(suffix) === -1) {

        let alreadyHas = false;

        thaiDays.forEach(d => {

          if (subject.indexOf(d) !== -1 && (subject.indexOf(':') !== -1 || subject.indexOf('-') !== -1)) {

            alreadyHas = true;

          }

        });

        

        if (!alreadyHas) {

          const newSubject = `${subject} ${suffix}`;

          sheet.getRange(i + 2, 1).setValue(newSubject);

          count++;

        }

      }

    }

    

    return { success: true, count: count };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function migrateAllGradeSheetsHeaders() {

  const db = getDb();

  const sheets = [

    'อนุบาล/1','ป.1/1','ป.2/1','ป.3/1','ป.4/1','ป.5/1','ป.6/1','ม.1/1','ม.2/1','ม.3/1','ม.4/1','ม.5/1','ม.6/1',

    'อนุบาล/2','ป.1/2','ป.2/2','ป.3/2','ป.4/2','ป.5/2','ป.6/2','ม.1/2','ม.2/2','ม.3/2','ม.4/2','ม.5/2','ม.6/2',

    'อนุบาล/3','ป.1/3','ป.2/3','ป.3/3','ป.4/3','ป.5/3','ป.6/3','ม.1/3','ม.2/3','ม.3/3','ม.4/3','ม.5/3','ม.6/3',

    'เดี่ยว อนุบาล','เดี่ยว ป.1','เดี่ยว ป.2','เดี่ยว ป.3','เดี่ยว ป.4','เดี่ยว ป.5','เดี่ยว ป.6','เดี่ยว ม.1','เดี่ยว ม.2','เดี่ยว ม.3','เดี่ยว ม.4','เดี่ยว ม.5','เดี่ยว ม.6',

    'ย่อย 2-3','ย่อย 4-5','ย่อย 6-10'

  ];

  

  sheets.forEach(sheetName => {

    const sheet = db.getSheetByName(sheetName);

    if (!sheet) return;

    

    const lastCol = sheet.getLastColumn();

    if (lastCol < 5) return; // courses start from column E (5)

    

    const headers1 = sheet.getRange(1, 5, 1, lastCol - 4).getValues()[0];

    const headers3 = sheet.getRange(3, 5, 1, lastCol - 4).getValues()[0];

    

    let updated = false;

    for (let c = 0; c < headers1.length; c++) {

      const course = (headers1[c] || '').toString().trim();

      const daytime = (headers3[c] || '').toString().trim();

      

      if (course && daytime && !course.includes(daytime)) {

        headers1[c] = course + ' ' + daytime;

        updated = true;

      }

    }

    

    if (updated) {

      sheet.getRange(1, 5, 1, headers1.length).setValues([headers1]);

    }

  });

}

function getStudentData(id) {

  try {
    const cleanSearchStr = id.toString().replace(/\s+/g, '').trim();

    // 1. Primary: search StatusDB (Fast)
    const sheet = getDb().getSheetByName('StatusDB');
    if (!sheet) throw new Error('StatusDB sheet not found');
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: false, error: 'No data in StatusDB' };
    
    const data = sheet.getDataRange().getValues();
    let row = null;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() === id.toString().trim()) {
        row = data[i];
        break;
      }
    }
    
    if (!row) {
      for (let i = 1; i < data.length; i++) {
        const studentName = data[i][1] ? data[i][1].toString().replace(/\s+/g, '').trim() : '';
        if (studentName && studentName === cleanSearchStr) {
          row = data[i];
          break;
        }
      }
    }

    if (!row) {
      // 2. Fallback: search in all grade sheets (Slow)
      const allStudents = getStudentsListRaw();
      const s = allStudents.find(st => {
        const studentName = st.name ? st.name.trim() : '';
        return (st.id && st.id.toString().trim() === id.toString().trim()) || 
               (studentName.length > 0 && id.toString().toLowerCase().includes(studentName.toLowerCase()));
      });
      
      if (s) {
        const result = {
          id: s.id,
          StudentName: s.name,
          Nickname: s.nickname,
          School: s.school,
          Contact: s.contact,
          LineName: s.lineName,
          LineID: s.lineId,
          ClassType: s.classType,
          Grade: s.grade,
          BranchLearn: s.branchLearn,
          BranchPay: s.branchPay,
          PaymentChannel: s.paymentChannel,
          Course: s.round,
          PaidAmount: s.paid,
          FullAmount: s.full,
          Outstanding: s.outstanding,
          TimeNote: '',
          ExtraNote: '',
          Hours: '',
          HoursLeft: ''
        };
        return { success: true, data: result };
      }

      return { success: false, error: 'ไม่พบข้อมูลนักเรียนชื่อนี้ในฐานข้อมูล' };
    }

    const result = {

      id: row[0] ? row[0].toString().trim() : '',

      StudentName: row[1] ? row[1].toString().trim() : '',

      Nickname: row[2] ? row[2].toString().trim() : '',

      School: row[3] ? row[3].toString().trim() : '',

      Contact: row[4] ? row[4].toString().trim() : '',

      BranchLearn: row[5] ? row[5].toString().trim() : '',

      BranchPay: row[6] ? row[6].toString().trim() : '',

      TimeNote: row[7] ? row[7].toString().trim() : '',

      ExtraNote: row[8] ? row[8].toString().trim() : '',

      PaidAmount: parseFloat(row[9]) || 0,

      FullAmount: parseFloat(row[10]) || 0,

      Outstanding: parseFloat(row[11]) || 0,

      PaymentDate: row[12] ? row[12].toString().trim() : '',

      PaymentChannel: row[13] ? row[13].toString().trim() : '',

      Staff: row[14] ? row[14].toString().trim() : '',

      Course: row[15] ? row[15].toString().trim() : '',

      Grade: row[16] ? row[16].toString().trim() : '',

      ClassSection: row[17] ? row[17].toString().trim() : '',

      LineName: row[18] ? row[18].toString().trim() : '',

      LineID: row[19] ? row[19].toString().trim() : '',

      CarriedForward: parseFloat(row[20]) || 0,

      Hours: row[21] ? row[21].toString().trim() : '',

      HoursLeft: row[22] ? row[22].toString().trim() : '',

      ClassType: row[23] ? row[23].toString().trim() : 'เดี่ยว'

    };

    

    // Installments mappings

    result.PayRound1Date = row[25] ? row[25].toString().trim() : (row[12] ? row[12].toString().trim() : '');

    result.PayRound1Amount = row[26] !== undefined && row[26] !== "" ? parseFloat(row[26]) : (parseFloat(row[9]) || 0);

    result.PayRound1Channel = row[27] ? row[27].toString().trim() : (row[13] ? row[13].toString().trim() : '');

    result.PayRound1Staff = row[28] ? row[28].toString().trim() : (row[14] ? row[14].toString().trim() : '');

    result.PayRound1Time = row[29] ? row[29].toString().trim() : (row[7] ? row[7].toString().trim() : '');


    result.PayRound2Date = row[30] ? row[30].toString().trim() : '';

    result.PayRound2Amount = row[31] !== undefined && row[31] !== "" ? parseFloat(row[31]) : 0;

    result.PayRound2Channel = row[32] ? row[32].toString().trim() : '';

    result.PayRound2Staff = row[33] ? row[33].toString().trim() : '';

    result.PayRound2Time = row[34] ? row[34].toString().trim() : '';


    result.PayRound3Date = row[35] ? row[35].toString().trim() : '';

    result.PayRound3Amount = row[36] !== undefined && row[36] !== "" ? parseFloat(row[36]) : 0;

    result.PayRound3Channel = row[37] ? row[37].toString().trim() : '';

    result.PayRound3Staff = row[38] ? row[38].toString().trim() : '';

    result.PayRound3Time = row[39] ? row[39].toString().trim() : '';

    

    return { success: true, data: result };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

// =========================================================================

// TEACHER SALARY CONFIRMATION

// =========================================================================

function confirmTeacherSalary(year, month, teacherId, teacherName, totalPay) {

  try {

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TeacherSalaryConfirmations');

    if (!sheet) return { success: false, error: 'Sheet not found' };

    

    // Check if already confirmed

    const data = sheet.getDataRange().getValues();

    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {

      if (data[i][0] == year && data[i][1] == month && data[i][2] == teacherId) {

        rowIndex = i + 1;

        break;

      }

    }

    

    const now = new Date();

    if (rowIndex > 0) {

      // Update existing

      sheet.getRange(rowIndex, 4).setValue(teacherName);

      sheet.getRange(rowIndex, 5).setValue(totalPay);

      sheet.getRange(rowIndex, 6).setValue(now);

    } else {

      // Append new

      sheet.appendRow([year, month, teacherId, teacherName, totalPay, now]);

    }

    

    return { success: true, timestamp: now.toISOString() };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function getTeacherSalaryConfirmations(year, month) {

  try {

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TeacherSalaryConfirmations');

    if (!sheet) return { success: false, error: 'Sheet not found' };

    

    const data = sheet.getDataRange().getValues();
    const result = [];
    for (let i = 1; i < data.length; i++) {
      if ((!year || data[i][0] == year) && (!month || data[i][1] == month)) {
        result.push({
          year: data[i][0],
          month: data[i][1],
          teacherId: data[i][2],
          teacherName: data[i][3],
          totalPay: data[i][4],
          confirmedAt: data[i][5]
        });

      }

    }

    return { success: true, data: result };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function getLatestSingleOrSubgroupDetails(courseName) {

  try {

    if (!courseName) return { success: false, error: 'No course name provided' };

    const db = getDb();

    const sheetsToSearch = [

      "เดี่ยว อนุบาล", "เดี่ยว ป.1", "เดี่ยว ป.2", "เดี่ยว ป.3", "เดี่ยว ป.4", "เดี่ยว ป.5", "เดี่ยว ป.6",

      "เดี่ยว ม.1", "เดี่ยว ม.2", "เดี่ยว ม.3", "เดี่ยว ม.4", "เดี่ยว ม.5", "เดี่ยว ม.6",

      "ย่อย 2-3", "ย่อย 4-5", "ย่อย 6-10"

    ];

    

    const cleanCourseName = courseName.toString().toLowerCase().replace(/\s+/g, '');

    let matchedRow = null;

    

    for (let sheetName of sheetsToSearch) {

      const sheet = db.getSheetByName(sheetName);

      if (!sheet) continue;

      

      const lastRow = sheet.getLastRow();

      if (lastRow < 12) continue;

      

      const rawData = sheet.getRange(12, 1, lastRow - 11, Math.min(25, sheet.getLastColumn())).getValues();

      for (let i = 0; i < rawData.length; i++) {

        const row = rawData[i];

        const colA = row[0] ? row[0].toString().trim() : '';

        const colB = row[1] ? row[1].toString().trim() : '';

        const colC = row[2] ? row[2].toString().trim() : '';

        const colI = row[8] ? row[8].toString().trim() : '';

        const colK = row[10] ? row[10].toString().trim() : '';

        

        if (!colB && !colK) continue;

        

        const cleanB = colB.toLowerCase().replace(/\s+/g, '');

        const cleanC = colC.toLowerCase().replace(/\s+/g, '');

        const cleanK = colK.toLowerCase().replace(/\s+/g, '');

        

        const hasStudentMatch = (cleanB && cleanCourseName.includes(cleanB)) || (cleanC && cleanCourseName.includes(cleanC));

        const hasCourseMatch = (cleanK && cleanCourseName.includes(cleanK));

        

        if (hasStudentMatch && hasCourseMatch) {

          matchedRow = {

            grade: colA,

            studentName: colB + (colC ? '(' + colC + ')' : ''),

            branch: colI,

            subject: colK

          };

        }

      }

    }

    

    if (matchedRow) {

      return { success: true, data: matchedRow };

    }

    return { success: false, error: 'Student/Course not found in single/subgroup sheets' };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

// ----------------------------------------------------

// Added Migration Script to move courses to col 19

// ----------------------------------------------------

function migrateMainClassTo19Columns() {

  const db = getDb();

  const sheets = db.getSheets();

  

  sheets.forEach(sheet => {

    const name = sheet.getName();

    const match = name.match(/^(.+)\/([1-3])$/);

    if (!match) return; // Not a classroom sheet

    

    const lastRow = sheet.getLastRow();

    const lastCol = sheet.getLastColumn();

    if (lastRow < 5) return;

    

    // Check if already migrated

    const col16Val = sheet.getRange(5, 16).getValue().toString().trim();

    if (col16Val === 'วันที่ชำระเงิน') {

      return; // Already migrated!

    }

    

    Logger.log('Migrating sheet to 19 columns format: ' + name);

    

    // Insert 3 columns at index 16

    sheet.insertColumns(16, 3);

    

    // Add the headers for the 3 new columns

    sheet.getRange(5, 16).setValue('วันที่ชำระเงิน');

    sheet.getRange(5, 17).setValue('ช่องทางชำระเงิน');

    sheet.getRange(5, 18).setValue('ผู้รับเงิน');

  });

}

function migrateDataLearnFromOldDB() {

  const oldDbId = '1VURVA77pcBJSCJNm4WazWBPpgeovArL5iSAHNAkWdec';

  const newDbId = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';

  

  const oldDb = SpreadsheetApp.openById(oldDbId);

  const newDb = SpreadsheetApp.openById(newDbId);

  const oldSheet = oldDb.getSheetByName('Data Learn');

  if (!oldSheet) {
    Logger.log('ไม่พบชีต Data Learn ในฐานข้อมูลเก่า');
    return { success: false, error: 'ไม่พบชีต Data Learn ในฐานข้อมูลเก่า' };
  }

  let newSheet = newDb.getSheetByName('Data Learn');

  if (!newSheet) {
    newSheet = newDb.insertSheet('Data Learn');
  }

  const data = oldSheet.getDataRange().getValues();

  newSheet.clear();

  if (data.length > 0) {
    newSheet.getRange(1, 1, data.length, data[0].length).setValues(data);

    ensureDataLearnMigrated(newDb);

    Logger.log('โอนย้ายข้อมูล Data Learn สำเร็จ จำนวน ' + data.length + ' แถว');

    return { success: true, message: 'โอนย้ายข้อมูล Data Learn สำเร็จ จำนวน ' + (data.length - 1) + ' แถว' };

  } else {

    Logger.log('ชีต Data Learn เก่าไม่มีข้อมูล');

    return { success: false, error: 'ชีต Data Learn เก่าไม่มีข้อมูล' };

  }

}

function debugCheckUsers() {

  try {

    const db = getDb();

    const sheet = db.getSheetByName('UsersDB');

    if (!sheet) {

      return { success: false, error: 'UsersDB sheet not found' };

    }

    const values = sheet.getDataRange().getValues();

    return { success: true, count: values.length - 1, users: values.slice(1).map(r => ({ username: r[0], password: r[1], role: r[2] })) };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function testResolveDynamicCourseName() {

  try {

    var db = getDb();

    var sheet = db.getSheetByName('Data Learn');

    if (!sheet) return 'Data Learn sheet not found';

    

    var totalRows = sheet.getLastRow();

    var results = [];

    results.push('Total rows in Data Learn: ' + totalRows);

    results.push('');

    

    // Read LAST 200 rows (where recent data is)

    var startRow = Math.max(2, totalRows - 200);

    var numRows = totalRows - startRow + 1;

    var data = sheet.getRange(startRow, 1, numRows, 16).getValues();

    

    // Find rows with "หลัก" AND date >= 18/5/2026

    var count = 0;

    for (var i = 0; i < data.length && count < 5; i++) {

      var colA = data[i][0] ? data[i][0].toString().trim() : '';

      if (colA.indexOf('หลัก') < 0) continue;

      

      var dateStr = cleanSheetDate(data[i][12]);

      // Check if date >= 18/5/2026

      var parts = dateStr.split('/');

      if (parts.length !== 3) continue;

      var d = parseInt(parts[0]), m = parseInt(parts[1]), y = parseInt(parts[2]);

      if (new Date(y, m-1, d) < new Date(2026, 4, 18)) continue;

      

      count++;

      var roomBranch = data[i][13] ? data[i][13].toString().trim() : '';

      var actualRow = startRow + i;

      

      results.push('=== Row ' + actualRow + ' ===');

      results.push('Col A: ' + colA);

      results.push('Date: ' + dateStr);

      results.push('RoomBranch: ' + roomBranch);

      

      // Show what grade+branch we'd look for

      var gradeMatch = colA.match(/(อนุบาล|ป\.\d|ม\.\d)/);

      var branchMatch = roomBranch.match(/สาขา\s*(\d)/);

      var grade = gradeMatch ? gradeMatch[1] : 'NO_GRADE';

      var branch = branchMatch ? branchMatch[1] : '1';

      var targetSheet = grade + '/' + branch;

      results.push('Target sheet: ' + targetSheet);

      

      // Extract keyword

      if (gradeMatch) {

        var baseSubject = colA.substring(0, gradeMatch.index).trim();

        var keyword = baseSubject.replace(/^หลัก\s*/, '').trim();

        results.push('Keyword: "' + keyword + '"');

      }

      

      // Day of week

      var dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

      var dayOfWeek = dayNames[new Date(y, m-1, d).getDay()];

      results.push('Day: ' + dayOfWeek);

      

      // Try resolving

      var resolved = resolveDynamicCourseName(colA, dateStr, roomBranch);

      results.push('RESOLVED: ' + resolved);

      results.push('CHANGED: ' + (resolved !== colA ? 'YES ✅' : 'NO ❌'));

      results.push('');

    }

    

    if (count === 0) {

      results.push('⚠️ No "หลัก" rows found with date >= 18/5/2026 in last 200 rows');

      results.push('Showing last 3 rows dates:');

      for (var j = Math.max(0, data.length - 3); j < data.length; j++) {

        results.push('  Row ' + (startRow + j) + ': A="' + (data[j][0] || '') + '" Date=' + cleanSheetDate(data[j][12]));

      }

    }

    

    // Show grade sheet headers - FULL scan

    results.push('');

    results.push('=== GRADE SHEET HEADERS (ป.6/2) ===');

    var gs = db.getSheetByName('ป.6/2');

    if (!gs) {

      results.push('ป.6/2: NOT FOUND');

    } else {

      var gLastCol = gs.getLastColumn();

      results.push('Total columns: ' + gLastCol);

      var gRow1 = gs.getRange(1, 1, 1, gLastCol).getValues()[0];

      for (var gc = 4; gc < gRow1.length; gc++) {

        if (gRow1[gc]) {

          var hdr = gRow1[gc].toString().trim();

          results.push('  Col ' + gc + ' (' + columnLetter_(gc) + '): ' + hdr.substring(0, 80));

        }

      }

    }

    

    // Also check ม.3/2

    results.push('');

    results.push('=== GRADE SHEET HEADERS (ม.3/2) ===');

    var gs2 = db.getSheetByName('ม.3/2');

    if (!gs2) {

      results.push('ม.3/2: NOT FOUND');

    } else {

      var gLastCol2 = gs2.getLastColumn();

      results.push('Total columns: ' + gLastCol2);

      var gRow12 = gs2.getRange(1, 1, 1, gLastCol2).getValues()[0];

      for (var gc2 = 4; gc2 < gRow12.length; gc2++) {

        if (gRow12[gc2]) {

          var hdr2 = gRow12[gc2].toString().trim();

          results.push('  Col ' + gc2 + ' (' + columnLetter_(gc2) + '): ' + hdr2.substring(0, 80));

        }

      }

    }

    

    Logger.log(results.join('\n'));

    return results.join('\n');

  } catch (e) {

    return 'Error: ' + e.message + '\n' + e.stack;

  }

}

function backfillDataLearnCourseNames() {

  try {

    clearGradeHeaderCache();

    var db = getDb();

    var sheet = db.getSheetByName('Data Learn');

    if (!sheet) return 'Data Learn sheet not found';

    

    var lastRow = sheet.getLastRow();

    if (lastRow < 2) return 'No data to backfill';

    

    var range = sheet.getRange(2, 1, lastRow - 1, 15);

    var values = range.getValues();

    var updatedCount = 0;

    

    for (var i = 0; i < values.length; i++) {

      var subject = values[i][0] ? values[i][0].toString().trim() : '';

      var dateVal = values[i][12];

      var dateStr = cleanSheetDate(dateVal);

      var roomBranch = values[i][13] ? values[i][13].toString().trim() : '';

      

      if (subject.indexOf('หลัก') >= 0 && dateStr) {

        var resolved = resolveDynamicCourseName(subject, dateStr, roomBranch);

        if (resolved !== subject) {

          values[i][0] = resolved;

          updatedCount++;

        }

      }

    }

    

    if (updatedCount > 0) {

      // Write back only column A to minimize sheet updates and avoid conflicts with other columns

      var colARange = sheet.getRange(2, 1, lastRow - 1, 1);

      var colAValues = values.map(function(row) { return [row[0]]; });

      colARange.setValues(colAValues);

      

      // Clear all caches

      clearClassLogsCache('');

    }

    

    return 'Completed backfill. Updated ' + updatedCount + ' rows.';

  } catch (e) {

    return 'Error in backfill: ' + e.message;

  }

}

function columnLetter_(colIndex) {

  var letter = '';

  var temp = colIndex;

  while (temp >= 0) {

    letter = String.fromCharCode(65 + (temp % 26)) + letter;

    temp = Math.floor(temp / 26) - 1;

  }

  return letter;

}

function submitPublicRegistration(studentData, fileData) {

  try {

    Logger.log('=== submitPublicRegistration START ===');

    Logger.log('studentData: ' + JSON.stringify(studentData));

    Logger.log('fileData present: ' + (fileData ? 'yes' : 'no'));

    

    let slipUrl = '-';

    

    // 1. Get or Create Slip Folder in Google Drive (ONLY IF THERE IS SLIP)

    if (fileData && fileData.base64) {

      Logger.log('Step 1: Uploading slip file...');

      let folder;
      const folderName = 'data_PookPik_Tutor_Slips';
      
      const props = PropertiesService.getScriptProperties();
      const folderId = props.getProperty('SLIP_FOLDER_ID');
      
      if (folderId) {
        try {
          folder = DriveApp.getFolderById(folderId);
        } catch(e) {
          folder = null;
        }
      }
      
      if (!folder) {
        const folders = DriveApp.getFoldersByName(folderName);
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder(folderName);
        }
        props.setProperty('SLIP_FOLDER_ID', folder.getId());
      }

      

      // 2. Upload Slip File

      const content = Utilities.base64Decode(fileData.base64);

      const blob = Utilities.newBlob(content, fileData.mimeType, 'slip_' + Date.now() + '_' + fileData.fileName);

      const file = folder.createFile(blob);

      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      slipUrl = file.getUrl();

      Logger.log('Step 1: Slip uploaded: ' + slipUrl);

    } else {

      Logger.log('Step 1: No slip file to upload');

    }

    

    let paidAmount = studentData.amount ? parseFloat(studentData.amount) : 0;

    if (isNaN(paidAmount)) paidAmount = 0;

    Logger.log('Step 2: paidAmount = ' + paidAmount);
    
    let fullAmount = studentData.fullAmount !== undefined ? parseFloat(studentData.fullAmount) : paidAmount;
    if (isNaN(fullAmount)) fullAmount = paidAmount;
    
    let outstandingAmount = fullAmount - paidAmount;
    if (outstandingAmount < 0) outstandingAmount = 0;

    

    // 3. Save directly to StatusDB

    const std = {

      name: studentData.name,

      nickname: studentData.nickname,

      school: studentData.school || '-',

      contact: studentData.contact,

      branchLearn: studentData.branchLearn,

      branchPay: studentData.branchLearn,

      paymentTimeNote: slipUrl !== '-' ? 'สลิปแนบ: ' + slipUrl : 'ยังไม่ได้แนบสลิป',

      extraNote: 'วิชาที่สมัคร: ' + studentData.course,

      paid: paidAmount,

      full: fullAmount,

      outstanding: outstandingAmount,

      paymentDate: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy'),

      paymentChannel: slipUrl !== '-' ? 'โอนเงิน (สลิปแนบออนไลน์)' : 'รอชำระเงิน',

      staff: 'Online Registration',

      round: studentData.course,

      grade: studentData.grade,

      classSection: studentData.classSection || '-',

      lineName: studentData.nickname,

      lineId: studentData.lineId || '',

      carriedForwardFee: 0,

      classHours: '',

      classHoursLeft: '',

      classType: studentData.classType || 'กลุ่มหลัก',

      isChecked: false

    };

    

    Logger.log('Step 3: Calling syncStudentToStatusDB...');

    syncStudentToStatusDB(std);

    Logger.log('Step 3: syncStudentToStatusDB completed');

    
    Logger.log('Step 4: Calling syncToGradeSheet...');
    try {
      syncToGradeSheet(std);
      Logger.log('Step 4: syncToGradeSheet completed');
    } catch(e) {
      Logger.log('Error in syncToGradeSheet: ' + e.toString());
    }

    invalidateStudentCache();

    

    logActivity('System', '¹นักเรียนลงทะเบียนออนไลน์ (StatusDB)', 'ªชื่อนักเรียน: ' + studentData.name + ', ยอดโอน: ฿' + paidAmount);

    Logger.log('=== submitPublicRegistration SUCCESS ===');

    return { success: true };

  } catch (err) {

    Logger.log('=== submitPublicRegistration ERROR ===');

    Logger.log('Error: ' + err.toString());

    Logger.log('Stack: ' + err.stack);

    return { success: false, error: err.toString() };
  }
}

function getAvailableCourses(grade, classType, branchLearn) {
  try {
    const db = getDb();
    let sheetName = "";
    let isMainClass = (classType === "กลุ่มหลัก" || classType === "กลุ่มหลักตามตารางคอร์ส");
    
    if (isMainClass) {
       let branchNum = "1";
       if (branchLearn && branchLearn.includes("สาขา")) {
           branchNum = branchLearn.replace("สาขา", "").trim();
       }
       sheetName = grade + "/" + branchNum;
    } else {
       sheetName = classType + " " + grade;
    }

    let sheet = db.getSheetByName(sheetName);
    
    // fallbacks
    if (!sheet && !isMainClass) {
        sheet = db.getSheetByName(grade + " " + classType);
        if (!sheet) sheet = db.getSheetByName(grade + "/" + classType);
        if (!sheet) sheet = db.getSheetByName(classType + "/" + grade);
    }
    
    if (!sheet) {
      return { success: true, courses: [] };
    }
    
    const courses = [];

    if (isMainClass) {
       const lastCol = sheet.getLastColumn();
       if (lastCol >= COURSE_START_COL) {
          const headerRow1 = sheet.getRange(1, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];
          const headerRow2 = sheet.getRange(2, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];
          for (let i = 0; i < headerRow1.length; i++) {
             const courseName = headerRow1[i] ? headerRow1[i].toString().trim() : '';
             if (courseName && courseName !== '') {
                const price = parseFloat(headerRow2[i]) || 0;
                courses.push({ courseName: courseName, full: price, outstanding: price }); 
             }
          }
       }
    } else {
       const lastRow = sheet.getLastRow();
       if (lastRow >= 5) {
          const dataRange = sheet.getRange(5, 3, lastRow - 4, 1);
          const values = dataRange.getValues();
          for (let i = 0; i < values.length; i++) {
             const courseName = values[i][0];
             if (courseName === "" || courseName == null) break;
             courses.push({ courseName: courseName, full: 0, outstanding: 0 }); 
          }
       }
    }
    
    return { success: true, courses: courses };
  } catch (err) {
    Logger.log('Error in getAvailableCourses: ' + err.toString());
    return { success: false, error: err.toString() };
  }
}

function getStudentHorizontalData(name, grade, classType, branchLearn) {
  try {
    const db = getDb();
    let sheetName = "";
    let isMainClass = (classType === "กลุ่มหลัก" || classType === "กลุ่มหลักตามตารางคอร์ส");
    
    if (isMainClass) {
       let branchNum = "1";
       if (branchLearn && branchLearn.includes("สาขา")) {
           branchNum = branchLearn.replace("สาขา", "").trim();
       }
       sheetName = grade + "/" + branchNum;
    } else {
       sheetName = classType + " " + grade;
    }

    let sheet = db.getSheetByName(sheetName);
    if (!sheet && !isMainClass) {
        sheet = db.getSheetByName(grade + " " + classType);
        if (!sheet) sheet = db.getSheetByName(grade + "/" + classType);
        if (!sheet) sheet = db.getSheetByName(classType + "/" + grade);
    }
    
    if (!sheet) return { success: false, error: 'ไม่พบชีต: ' + sheetName };
    if (!isMainClass) return { success: true, selectedCourses: [] }; // Only main groups have horizontal courses

    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    
    if (lastCol < COURSE_START_COL || lastRow < 6) {
       return { success: true, selectedCourses: [] };
    }
    
    const headers = sheet.getRange(1, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];
    const dataRange = sheet.getRange(6, 2, lastRow - 5, lastCol - 1).getValues(); // Start from Col B (index 0)
    
    let selectedCourses = [];
    let cleanTargetName = (name || '').replace(/\s+/g, '').trim();
    
    for (let i = 0; i < dataRange.length; i++) {
       const rowName = (dataRange[i][0] || '').toString().replace(/\s+/g, '').trim(); // Col B is index 0
       if (rowName === cleanTargetName) {
          // Found student, check horizontal courses
          // Course columns in dataRange start at index (COURSE_START_COL - 2)
          const courseColIndexStart = COURSE_START_COL - 2;
          
          for (let j = 0; j < headers.length; j++) {
             const cName = headers[j] ? headers[j].toString().trim() : '';
             if (!cName) continue;
             
             const cellValue = dataRange[i][courseColIndexStart + j];
             if (cellValue) {
                const strVal = cellValue.toString().toLowerCase().trim();
                if (strVal === '✅' || strVal === '✔' || strVal === 'x' || strVal === '✓') {
                   selectedCourses.push({ courseName: cName, sessions: 10 }); // Default sessions
                } else if (!isNaN(parseFloat(strVal))) {
                   // If it's a number, it might be the number of sessions
                   selectedCourses.push({ courseName: cName, sessions: parseFloat(strVal) });
                }
             }
          }
          break;
       }
    }
    
    return { success: true, selectedCourses: selectedCourses };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function syncMissingStudentsToStatusDB() {
  try {
    const db = getDb();
    const statusSheet = db.getSheetByName('StatusDB');
    if (!statusSheet) return { success: false, error: 'StatusDB not found' };
    
    // We will rebuild cachedStatusValues_ manually if it's missing
    if (!cachedStatusValues_) {
       const statusLastRow = statusSheet.getLastRow();
       if (statusLastRow > 0) {
           cachedStatusValues_ = statusSheet.getRange(1, 1, statusLastRow, 41).getValues();
       } else {
           cachedStatusValues_ = [];
       }
    }
    
    let existingNames = new Set();
    cachedStatusValues_.forEach((row, idx) => {
        if (idx > 0 && row[1]) {
            existingNames.add(row[1].toString().replace(/\s+/g, '').trim());
        }
    });
    
    const allSheets = db.getSheets();
    let addedCount = 0;
    let addedNames = [];
    let pendingUpdates = [];
    let pendingAppends = [];
    let paymentsToAdd = [];
    
    for (let i = 0; i < allSheets.length; i++) {
      const sheet = allSheets[i];
      const sheetName = sheet.getName();
      
      const isPrivate = sheetName.indexOf('เดี่ยว') === 0 || sheetName.indexOf('ย่อย') === 0 || sheetName.indexOf('กลุ่ม') === 0 || sheetName.includes('VIP');
      let isMainClass = false;
      let grade = '';
      let branchSuffix = '1';
      
      const matchSlash = sheetName.match(/^(.+)\/(\d+)$/);
      if (matchSlash) {
          isMainClass = true;
          grade = matchSlash[1].trim();
          branchSuffix = matchSlash[2];
      } else if (!isPrivate && (sheetName.includes('ป.') || sheetName.includes('ม.') || sheetName.includes('อนุบาล'))) {
          isMainClass = true;
          grade = sheetName.trim();
      }
      
      if (!isMainClass && !isPrivate) continue; // Skip non-student sheets
      
      const startRow = isPrivate ? 12 : 6;
      const lastRow = sheet.getLastRow();
      let lastCol = sheet.getLastColumn();
      if (lastCol < 25) lastCol = 25; // Ensure we read all data columns (at least up to Col Y)
      
      if (lastRow < startRow) continue;
      
      // Read data from Col B (2) to lastCol
      const data = sheet.getRange(startRow, 2, lastRow - (startRow - 1), lastCol - 1).getValues();
      // Dynamically find the header row (scan rows 1 to 15)
      let headerRowIndex = isMainClass ? 5 : 11;
      let headersRowFull = [];
      let foundHeader = false;
      const headerRowsCount = 15;
      const scanRange = sheet.getRange(1, 1, headerRowsCount, lastCol).getValues();
      const normalizeText = (text) => (text || '').toString().replace(/[\\s\\u200B-\\u200D\\uFEFF]+/g, '').trim();
      
      for (let r = 0; r < scanRange.length; r++) {
         const rowVals = scanRange[r].map(normalizeText);
         if (rowVals.includes('ชื่อ-นามสกุล') || rowVals.includes('ชื่อ-สกุล') || rowVals.includes('ชื่อนักเรียน') || rowVals.includes('ชื่อ') || rowVals.includes('โรงเรียน') || rowVals.includes('ชื่อโปรไฟล์ไลน์')) {
             headerRowIndex = 1 + r; // row index is 1-based
             headersRowFull = sheet.getRange(headerRowIndex, 1, 1, lastCol).getValues()[0];
             foundHeader = true;
         }
      }
      if (!foundHeader) headersRowFull = sheet.getRange(headerRowIndex, 1, 1, lastCol).getValues()[0];
      
      let headers = [];
      if (isMainClass && typeof COURSE_START_COL !== 'undefined' && lastCol >= COURSE_START_COL) {
          headers = headersRowFull.slice(COURSE_START_COL - 1);
      }
      
      const getColIndex = (possibleNames) => {
          const headerVals = headersRowFull.map(normalizeText);
          // 1. Exact match in the identified header row
          for (let n of possibleNames) {
              const normalizedName = normalizeText(n);
              const idx = headerVals.indexOf(normalizedName);
              if (idx !== -1) return idx - 1;
          }
          // 2. Exact match in scanRange
          for (let n of possibleNames) {
              const normalizedName = normalizeText(n);
              for (let r = 0; r < scanRange.length; r++) {
                  const rowVals = scanRange[r].map(normalizeText);
                  const idx = rowVals.indexOf(normalizedName);
                  if (idx !== -1) return idx - 1;
              }
          }
          // 3. Includes match in header row (safe fallback)
          for (let n of possibleNames) {
              const normalizedName = normalizeText(n);
              if (['จ่าย', 'ชำระ', 'โอน', 'วันที่', 'เรียน'].includes(normalizedName)) continue;
              const idx = headerVals.findIndex(h => h.includes(normalizedName));
              if (idx !== -1) return idx - 1;
          }
          return -1;
      };
      
      // Cache the indices
      const colFull = getColIndex(['ยอดรวม', 'เรียน', 'ค่าเรียนทั้งหมด(บาท)', 'ค่าเรียน(บาท)', 'ค่าเรียน', 'ยอดเรียน', 'ค่าเรียนทั้งหมด', 'ยอดสุทธิ', 'ราคาสุทธิ']);
      const colOutstanding = getColIndex(['คงเหลือ', 'ค้างชำระทั้งหมด(บาท)', 'ค้างชำระ(บาท)', 'ค้างชำระ', 'ยอดคงเหลือ', 'คงเหลือทั้งหมด(บาท)', 'คงเหลือทั้งหมด', 'ยอดค้างชำระ']);
      const colPaid = getColIndex(['ยอดจ่ายมา', 'ยอดจ่าย', 'จ่ายมา', 'จ่าย', 'ยอดชำระมา', 'ชำระมา', 'ยอดชำระ', 'ชำระแล้ว', 'ชำระ', 'ชำระเงิน', 'ยอดชำระเงิน', 'ยอดจ่ายเงิน', 'ยอดเงินจ่าย(บาท)', 'ยอดเงินจ่าย', 'จ่ายเงิน', 'รับชำระ', 'รับเงิน', 'ยอดรับเงิน', 'ยอดรับชำระ', 'ยอดเงินที่จ่าย', 'จำนวนเงินที่จ่าย', 'เงินที่ชำระ']);
      const colDate = getColIndex(['วันที่ชำระเงิน', 'วันที่รับเงิน', 'วันที่โอน', 'วันที่ชำระ', 'วันที่', 'วันที่โอนเงิน', 'วันที่จ่าย', 'วันที่ได้รับ']);
      const colChannel = getColIndex(['ช่องทางชำระเงิน', 'ช่องทางการรับเงิน', 'ช่องทาง', 'ช่องทางการชำระเงิน', 'ช่องทางจ่าย', 'วิธีชำระ']);
      const colStaff = getColIndex(['ผู้รับเงิน', 'พนักงาน', 'ชื่อผู้รับเงิน', 'ผู้รับ']);
      const colCourse = getColIndex(['คอร์ส', 'คอร์สเรียน', 'รอบเรียน']);
      const colNote = getColIndex(['หมายเหตุ', 'หมายเหตุเพิ่มเติม']);
      const colBranchLearn = getColIndex(['สาขาเรียน', 'สาขาเรียน(สาขา)', 'สาขาที่เรียน']);
      const colBranchPay = getColIndex(['สาขาที่เก็บเงิน', 'สาขาเงิน(สาขา)', 'สาขาที่จ่ายเงิน', 'สาขาเงิน']);
      const colName = getColIndex(['ชื่อ-นามสกุล', 'ชื่อ-สกุล', 'ชื่อ', 'ชื่อนักเรียน']);
      const colNickname = getColIndex(['ชื่อเล่น']);
      const colSchool = getColIndex(['โรงเรียน']);
      const colContact = getColIndex(['เบอร์ติดต่อ', 'เบอร์โทร', 'เบอร์ผู้ปกครอง/เบอร์ติดต่อ', 'เบอร์ผู้ปกครอง']);
      const colLineName = getColIndex(['ชื่อโปรไฟล์ไลน์', 'ชื่อไลน์', 'profileline']);
      const colLineId = getColIndex(['idline', 'ไอดีไลน์', 'lineid']);
      
      for (let j = 0; j < data.length; j++) {
        const safeVal = (idx) => (idx !== -1 && data[j] && data[j][idx] !== undefined) ? data[j][idx] : '';
        
        const cName = data[j][0] ? data[j][0].toString().trim() : ''; // Col B (ชื่อ-สกุล)
        // Only skip if both the extracted name and hardcoded Col B are empty
        
        let name = safeVal(colName).toString().trim();
        // Fallback to hardcoded Col B if header not found
        if (!name && colName === -1) name = cName;
        
        if (!name || name === 'ชื่อ-นามสกุล' || name.includes('ชื่อ-สกุล') || name === 'ชื่อ') continue;
        
        const cleanName = name.replace(/\s+/g, '');
        
        // Extract selected courses for main class
        let selectedCourses = [];
        if (isMainClass && headers.length > 0) {
            const courseColIndexStart = COURSE_START_COL - 2;
            for (let c = 0; c < headers.length; c++) {
               const cName = headers[c] ? headers[c].toString().trim() : '';
               if (!cName) continue;
               
               const cellValue = data[j][courseColIndexStart + c];
               if (cellValue === true || cellValue === 'TRUE' || cellValue === 1 || cellValue === '1') {
                   selectedCourses.push(cName);
               }
            }
        }
        
        const parseCurrency = (val) => {
            const num = parseFloat((val || '').toString().replace(/,/g, ''));
            return isNaN(num) ? 0 : num;
        };
        
        // Build student object based on sheet type
        let std = {
          name: name,
          nickname: colNickname !== -1 ? safeVal(colNickname) : (data[j][1] || ''),
          school: colSchool !== -1 ? safeVal(colSchool) : (data[j][2] || ''),
          contact: (colContact !== -1 ? safeVal(colContact) : (data[j][4] || '')).toString(),
          lineName: (colLineName !== -1 ? safeVal(colLineName) : (data[j][5] || '')).toString(),
          lineId: (colLineId !== -1 ? safeVal(colLineId) : (data[j][6] || '')).toString(),
          paymentDate: safeVal(colDate),
          paymentChannel: safeVal(colChannel),
          staff: safeVal(colStaff),
          full: parseCurrency(safeVal(colFull)),
          outstanding: parseCurrency(safeVal(colOutstanding)),
          paid: parseCurrency(safeVal(colPaid)),
          selectedCourses: selectedCourses.join(', ') // Add courses!
        };
        
        if (isMainClass) {
           std.grade = grade;
           std.classType = 'กลุ่มหลัก';
           std.branchLearn = safeVal(colBranchLearn) || ('สาขา' + branchSuffix);
           std.branchPay = safeVal(colBranchPay) || ('สาขา' + branchSuffix);
           std.round = 'ManualSync';
        } else {
           // Private/Subgroup
           std.grade = sheetName.replace('เดี่ยว ', '').replace('ย่อย ', '').replace('กลุ่ม ', '').trim();
           std.classType = sheetName.split(' ')[0] === 'เดี่ยว' ? 'เด็กเดี่ยว' : sheetName;
           std.branchLearn = safeVal(colBranchLearn) || 'สาขา1';
           std.branchPay = safeVal(colBranchPay) || 'สาขา1';
           std.round = safeVal(colCourse); // คอร์ส
           std.extraNote = safeVal(colNote); // หมายเหตุ
        }
        
         let res = syncStudentToStatusDB(std, true);
         if (res && res.type === 'append') {
             pendingAppends.push(res.values);
             if (parseFloat(res.std.paid) > 0) {
                 paymentsToAdd.push({
                   StudentID: res.id,
                   Amount: res.std.paid,
                   Date: res.std.paymentDate || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd'),
                   Channel: res.std.paymentChannel || 'ชำระแรกเข้า',
                   Receiver: res.std.staff || 'System',
                   Round: 'แรกเข้า',
                   Note: res.std.paymentTimeNote || 'จากการลงทะเบียนครั้งแรก'
                 });
             }
         } else if (res && res.type === 'update') {
             pendingUpdates.push(res);
         }
         
         if (!existingNames.has(cleanName)) {
            existingNames.add(cleanName);
            addedCount++;
            addedNames.push(name);
         }
         

       }
     }
     
     const statusSheetObj = db.getSheetByName('StatusDB');
     if (statusSheetObj) {
         const slr = Math.max(1, statusSheetObj.getLastRow());
         let slc = statusSheetObj.getLastColumn();
         if (slc < 1) slc = 40;
         const fullData = statusSheetObj.getRange(1, 1, slr, slc).getValues();
         pendingUpdates.forEach(u => {
             if (u.rowIndex - 1 < fullData.length) {
                 fullData[u.rowIndex - 1] = u.values;
             }
         });
         pendingAppends.forEach(row => {
             fullData.push(row);
         });
         if (fullData.length > 0) {
             const maxCols = Math.max(...fullData.map(r => r.length));
             fullData.forEach(r => {
                 while (r.length < maxCols) r.push('');
                 r.length = maxCols;
             });
             statusSheetObj.getRange(1, 1, fullData.length, maxCols).setValues(fullData);
         }
     }
     
     paymentsToAdd.forEach(p => {
         try {
             addPayment(p);
         } catch (e) {
             Logger.log('Error adding batch payment: ' + e);
         }
     });
     
     CacheService.getScriptCache().remove('students_list');
     return { success: true, addedCount: addedCount, names: addedNames };
  } catch (err) {
    Logger.log('Error in syncMissingStudentsToStatusDB: ' + err.toString());
    return { success: false, error: err.toString() };
  }
}

function debugHeaders() {
  const db = getDb();
  const sheet = db.getSheetByName('ม.1/1');
  const headers = sheet.getRange(5, 1, 1, 20).getValues()[0];
  return ContentService.createTextOutput(JSON.stringify(headers)).setMimeType(ContentService.MimeType.JSON);
}

function migrateGradeSheetsFinancials() {
  const db = getDb();
  const statusSheet = db.getSheetByName('StatusDB');
  if (!statusSheet) return "No StatusDB found";
  
  const statusLastRow = statusSheet.getLastRow();
  if (statusLastRow < 2) return "StatusDB empty";
  
  const statusData = statusSheet.getRange(2, 1, statusLastRow - 1, 25).getValues();
  const studentsMap = {};
  
  statusData.forEach(row => {
    const name = row[1] ? row[1].toString().trim() : '';
    const dbBranch = row[5] ? row[5].toString().trim() : '';
    const dbGrade = row[16] ? row[16].toString().trim() : '';
    const classType = row[23] ? row[23].toString().trim() : '';
    
    if (name && classType.includes('กลุ่มหลัก') && dbBranch && dbGrade) {
      let branchSuffix = '';
      if (dbBranch === 'สาขา1') branchSuffix = '1';
      else if (dbBranch === 'สาขา2') branchSuffix = '2';
      else if (dbBranch === 'สาขา3') branchSuffix = '3';
      
      if (branchSuffix) {
        const sheetName = `${dbGrade}/${branchSuffix}`;
        const paid = parseFloat((row[9] || 0).toString().replace(/,/g, '')) || 0;
        
        if (!studentsMap[sheetName]) studentsMap[sheetName] = [];
        studentsMap[sheetName].push({
          name: name,
          paid: paid
        });
      }
    }
  });
  
  let totalUpdated = 0;
  const suffixes = ['1', '2', '3'];
  const grades = ['อนุบาล', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
  
  grades.forEach(g => {
    suffixes.forEach(suffix => {
      const sheetName = `${g}/${suffix}`;
      const sheet = db.getSheetByName(sheetName);
      if (!sheet) return;
      
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow < 6 || lastCol < 19) return;
      
      const headerRow2 = sheet.getRange(2, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];
      const headerRow4 = sheet.getRange(4, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];
      const courses = [];
      for (let i = 0; i < headerRow2.length; i++) {
        courses.push({
          colIndex: COURSE_START_COL + i,
          price: parseFloat(headerRow2[i]) || 0,
          totalSessions: parseInt(headerRow4[i]) || 10
        });
      }
      
      const namesRange = sheet.getRange(6, 2, lastRow - 5, 1).getValues();
      const isCardRange = sheet.getRange(6, 15, lastRow - 5, 1).getValues(); // O column is index 15
      const dataRange = sheet.getRange(6, 11, lastRow - 5, 4);
      const dataValues = dataRange.getValues();
      const courseRange = sheet.getRange(6, 19, lastRow - 5, lastCol - 18);
      const courseValues = courseRange.getValues();
      
      const mapForSheet = studentsMap[sheetName] || [];
      let changed = false;
      
      for (let r = 0; r < namesRange.length; r++) {
        const rowName = namesRange[r][0] ? namesRange[r][0].toString().trim() : '';
        if (!rowName) continue;
        
        let grossTotal = 0;
        let autoDiscount = 0;
        courses.forEach((c, cIdx) => {
          const val = courseValues[r][cIdx];
          if (val !== '' && !isNaN(val)) {
            const num = parseFloat(val);
            const price = c.price;
            const totalSessions = c.totalSessions;
            
            let itemGross = 0;
            let itemNet = 0;
            
            if (num === 30) {
              itemGross = price;
              itemNet = price * 0.7;
            } else if (num === 20) {
              itemGross = price;
              itemNet = price * 0.9;
            } else if (num === 50) {
              itemGross = price;
              itemNet = price * 0.5;
            } else if (num >= 1 && num <= 2) {
              itemGross = num * 350;
              itemNet = num * 350;
            } else if (num >= 3) {
              itemGross = num * (price / totalSessions);
              itemNet = num * (price / totalSessions);
            }
            
            grossTotal += itemGross;
            autoDiscount += (itemGross - itemNet);
          }
        });
        
        const isCard = parseInt(isCardRange[r][0]) === 1;
        if (isCard) grossTotal *= 1.03;
        
        const manualDiscount = parseFloat(dataValues[r][1]) || 0;
        // If the current discount already includes the auto discount, we don't want to double it.
        // But since previously it was 0, we'll just set it to autoDiscount + manualDiscount.
        // Wait, if it already had autoDiscount, manualDiscount would be autoDiscount + manual.
        // Let's just assume dataValues[r][1] is manual if we are strictly migrating.
        // Actually, to be safe: 
        const totalDiscount = Math.max(autoDiscount, manualDiscount); // Avoid doubling if it was already there
        
        const full = grossTotal;
        
        let currentPaid = parseFloat(dataValues[r][3]) || 0;
        
        const studentMatch = mapForSheet.find(s => s.name === rowName);
        if (studentMatch) {
          currentPaid = studentMatch.paid;
        }
        
        dataValues[r][0] = full;
        dataValues[r][1] = totalDiscount;
        dataValues[r][3] = currentPaid;
        dataValues[r][2] = Math.max(0, full - totalDiscount - currentPaid);
        
        changed = true;
        totalUpdated++;
      }
      
      if (changed) {
        dataRange.setValues(dataValues);
      }
    });
  });
  
  return `Updated ${totalUpdated} records in Grade Sheets.`;
}


// [REMOVED] Duplicate migrateGradeSheetsFinancials function removed



// ==========================================
// MIGRATION SCRIPT TO ADD STUDENT ID COLUMN
// ==========================================
function migrateAddStudentIdColumn() {
  const db = getDb();
  
  // 1. Build a map of Name -> ID from StatusDB
  const statusSheet = db.getSheetByName('StatusDB');
  const studentIds = {};
  if (statusSheet) {
    const data = statusSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const id = data[i][0] ? data[i][0].toString().trim() : '';
      const name = data[i][1] ? data[i][1].toString().trim() : '';
      if (id && name) {
        studentIds[name] = id;
      }
    }
  }
  
  // 2. Target sheets
  const grades = ['อนุบาล', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
  const suffixes = ['1', '2', '3'];
  const singleSheets = ['เดี่ยว อนุบาล', 'เดี่ยว ป.1', 'เดี่ยว ป.2', 'เดี่ยว ป.3', 'เดี่ยว ป.4', 'เดี่ยว ป.5', 'เดี่ยว ป.6', 'เดี่ยว ม.1', 'เดี่ยว ม.2', 'เดี่ยว ม.3', 'เดี่ยว ม.4', 'เดี่ยว ม.5', 'เดี่ยว ม.6'];
  const subgroupSheets = ['ย่อย 2-3', 'ย่อย 4-5', 'ย่อย 6-10'];
  
  const allTargets = [];
  grades.forEach(g => {
    suffixes.forEach(s => {
      allTargets.push(g + '/' + s);
    });
  });
  singleSheets.forEach(s => allTargets.push(s));
  subgroupSheets.forEach(s => allTargets.push(s));
  
  let count = 0;
  allTargets.forEach(sheetName => {
    const sheet = db.getSheetByName(sheetName);
    if (!sheet) return;
    
    // Check if column S is already "Student ID" to avoid double insertion
    const checkHeader = sheet.getRange(5, 19).getValue(); // Row 5 is header
    if (checkHeader === 'Student ID' || checkHeader === 'ID') {
      Logger.log("Skipping " + sheetName + " (already has Student ID column)");
      return;
    }
    
    // Insert column after Column 18 (R = ผู้รับเงิน) -> New Column is 19 (S)
    sheet.insertColumnAfter(18);
    sheet.getRange(5, 19).setValue('Student ID');
    sheet.getRange(5, 19).setFontWeight('bold');
    sheet.getRange(5, 19).setBackground('#e2f0d9');
    
    // Populate IDs for existing students
    const lastRow = sheet.getLastRow();
    if (lastRow >= 6) {
      const names = sheet.getRange(6, 2, lastRow - 5, 1).getValues(); // Column B
      const ids = [];
      for (let i = 0; i < names.length; i++) {
        const name = names[i][0] ? names[i][0].toString().trim() : '';
        if (name && studentIds[name]) {
          ids.push([studentIds[name]]);
        } else {
          ids.push(['']);
        }
      }
      sheet.getRange(6, 19, ids.length, 1).setValues(ids);
    }
    
    Logger.log("Migrated " + sheetName);
    count++;
  });
  
  return "Successfully migrated " + count + " sheets!";
}


// ==========================================
// BATCH RECALCULATE FINANCIALS
// ==========================================
function batchRecalculateFinancials() {
  const db = getDb();
  
  const grades = ['อนุบาล', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
  const suffixes = ['1', '2', '3'];
  const singleSheets = ['เดี่ยว อนุบาล', 'เดี่ยว ป.1', 'เดี่ยว ป.2', 'เดี่ยว ป.3', 'เดี่ยว ป.4', 'เดี่ยว ป.5', 'เดี่ยว ป.6', 'เดี่ยว ม.1', 'เดี่ยว ม.2', 'เดี่ยว ม.3', 'เดี่ยว ม.4', 'เดี่ยว ม.5', 'เดี่ยว ม.6'];
  const subgroupSheets = ['ย่อย 2-3', 'ย่อย 4-5', 'ย่อย 6-10'];
  
  const allTargets = [];
  grades.forEach(g => {
    suffixes.forEach(s => {
      allTargets.push(g + '/' + s);
    });
  });
  singleSheets.forEach(s => allTargets.push(s));
  subgroupSheets.forEach(s => allTargets.push(s));
  
  let count = 0;
  
  allTargets.forEach(sheetName => {
    const sheet = db.getSheetByName(sheetName);
    if (!sheet) return;
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 6 || lastCol < 20) return;
    
    // Check if it's single/subgroup to determine start row
    const isSingle = sheetName.includes('เดี่ยว') || sheetName.includes('ย่อย');
    const startRow = isSingle ? 12 : 6;
    if (lastRow < startRow) return;
    
    // Read courses from header
    const numCourseCols = lastCol - (COURSE_START_COL - 1);
    const headerRow1 = numCourseCols > 0 ? sheet.getRange(1, COURSE_START_COL, 1, numCourseCols).getValues()[0] : [];
    const headerRow2 = numCourseCols > 0 ? sheet.getRange(2, COURSE_START_COL, 1, numCourseCols).getValues()[0] : [];
    const headerRow4 = sheet.getRange(4, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];
    
    const sheetCourses = [];
    for (let i = 0; i < headerRow1.length; i++) {
      if (headerRow1[i]) {
        sheetCourses.push({
          colIndex: COURSE_START_COL + i,
          price: parseFloat(headerRow2[i]) || 0,
          totalSessions: parseInt(headerRow4[i]) || 10
        });
      }
    }
    
    // Read all student data
    const dataRange = sheet.getRange(startRow, 1, lastRow - (startRow - 1), lastCol).getValues();
    const updates = [];
    
    dataRange.forEach((row, idx) => {
      const name = row[1] ? row[1].toString().trim() : '';
      if (!name) return; // Skip empty rows
      
      const isCard = parseInt(row[14]) === 1;
      const paid = parseFloat(row[13]) || 0; // Col N (14) -> index 13
      
      let fullCourses = [];
      let partialGross = 0;
      let partialNet = 0;
      
      // Course cols start at index 19 (Col T)
      sheetCourses.forEach(c => {
        const val = row[c.colIndex - 1];
        if (val !== '' && val !== null && val !== undefined && !isNaN(val)) {
          const num = parseFloat(val);
          const price = parseFloat(c.price) || 0;
          const totalSessions = parseInt(c.totalSessions) || 10;
          
          if (num === 30) {
            partialGross += price;
            partialNet += price * 0.7;
          } else if (num === 20) {
            partialGross += price;
            partialNet += price * 0.9;
          } else if (num === 50) {
            partialGross += price;
            partialNet += price * 0.5;
          } else if (num >= 1 && num <= 2) {
            partialGross += num * 350;
            partialNet += num * 350;
          } else if (num >= 3) {
            if (num === totalSessions) {
              fullCourses.push(price);
            } else {
              const itemPrice = num * (price / totalSessions);
              partialGross += itemPrice;
              partialNet += itemPrice;
            }
          }
        }
      });
      
      fullCourses.sort(function(a, b) { return b - a; });
      let fullGross = 0;
      let fullNet = 0;
      fullCourses.forEach(function(price, i) {
        fullGross += price;
        if (i === 0 || i === 1) {
          fullNet += price;
        } else if (i === 2) {
          fullNet += price * 0.7;
        } else {
          fullNet += price * 0.5;
        }
      });
      
      let grossTotal = partialGross + fullGross;
      let netTotal = partialNet + fullNet;
      
      if (isCard) {
        grossTotal *= 1.03;
        netTotal *= 1.03;
      }
      
      const autoDiscount = Math.round((grossTotal - netTotal) * 100) / 100;
      const full = Math.round(grossTotal * 100) / 100;
      const outstanding = Math.round(Math.max(0, full - autoDiscount - paid) * 100) / 100;
      
      // Check if values need updating
      const oldFull = parseFloat(row[10]) || 0;
      const oldDiscount = parseFloat(row[11]) || 0;
      const oldOutstanding = parseFloat(row[12]) || 0;
      
      if (oldFull !== full || oldDiscount !== autoDiscount || oldOutstanding !== outstanding) {
         updates.push({
           rowToUpdate: startRow + idx,
           full: full,
           discount: autoDiscount,
           outstanding: outstanding
         });
      }
    });
    
    // Batch write updates for this sheet
    if (updates.length > 0) {
      updates.forEach(u => {
        sheet.getRange(u.rowToUpdate, 11).setValue(u.full);          // K
        sheet.getRange(u.rowToUpdate, 12).setValue(u.discount);      // L
        sheet.getRange(u.rowToUpdate, 13).setValue(u.outstanding);   // M
      });
      Logger.log(`Updated ${updates.length} rows in ${sheetName}`);
      count++;
    }
  });
  
  return "Successfully updated financial data in " + count + " sheets!";
}

function getAvailableRounds() {
  try {
    const db = getDb();
    const sheets = db.getSheets();
    const rounds = new Set();
    
    // Pattern to match courses containing MIDTERM, FINAL, SUMMER, ปิดเทอม
    // e.g. MIDTERM 1/2569, FINAL 2/2569, SUMMER 2569, ปิดเทอม ตุลาคม 2569
    const regex = /((?:MIDTERM|FINAL|SUMMER|ปิดเทอม).*?(?:\d{1,2}\/\d{2,4}|\d{4}))/i;
    
    sheets.forEach(sheet => {
      const sheetName = sheet.getName();
      if (!sheetName.match(/^(อนุบาล|ป\.|ม\.|เดี่ยว|ย่อย)/)) return;
      
      const lastCol = sheet.getLastColumn();
      if (typeof COURSE_START_COL !== 'undefined' && lastCol >= COURSE_START_COL) {
        const header = sheet.getRange(1, COURSE_START_COL, 1, lastCol - (COURSE_START_COL - 1)).getValues()[0];
        header.forEach(h => {
          if (h) {
            const str = h.toString();
            const match = str.match(regex);
            if (match && match[1]) {
              rounds.add(match[1].trim());
            }
          }
        });
      }
    });
    
    const arr = Array.from(rounds);
    // Sort to have the most recent or logical ones first (can just use default sort for now)
    arr.sort();
    return { success: true, rounds: arr };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function testMyCode() {
  var res = getStudentData("ด.ช.ปัณณวิชญ์ พลบำรุง");
  var allSt = getStudentsListRaw();
  var match = allSt.find(s => s.name && s.name.indexOf("ปัณณวิชญ์") > -1);
  var logSheet = getDb().getSheetByName('Log');
  if (!logSheet) logSheet = getDb().insertSheet('Log');
  logSheet.appendRow([new Date(), JSON.stringify(res), JSON.stringify(match)]);
}


// ==========================================
// PaymentsDB Logic
// ==========================================

function getPaymentsForStudent(studentId) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName('PaymentsDB');
    if (!sheet) return [];
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return []; // Only headers
    
    const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    const payments = [];
    
    data.forEach(row => {
      if (row[1] && row[1].toString().trim() === studentId) {
        payments.push({
          paymentId: row[0],
          studentId: row[1],
          timestamp: row[2] ? cleanSheetDate(row[2]) : '',
          amount: parseFloat(row[3]) || 0,
          date: row[4] ? cleanSheetDate(row[4]) : '',
          channel: row[5] ? row[5].toString().trim() : '',
          receiver: row[6] ? row[6].toString().trim() : '',
          roundLabel: row[7] ? row[7].toString().trim() : '',
          note: row[8] ? row[8].toString().trim() : ''
        });
      }
    });
    
    return payments;
  } catch (e) {
    return [];
  }
}

function addPaymentForStudent(paymentData, logUser) {
  if (logUser) checkTeacherBlock(logUser);
  try {
    const db = getDb();
    let sheet = db.getSheetByName('PaymentsDB');
    if (!sheet) {
      sheet = db.insertSheet('PaymentsDB');
      sheet.appendRow(['PaymentID', 'StudentID', 'Timestamp', 'Amount', 'Date', 'Channel', 'Receiver', 'RoundLabel', 'Note']);
    }
    
    const paymentId = 'PAY_' + new Date().getTime();
    const timestamp = new Date();
    
    sheet.appendRow([
      paymentId,
      paymentData.studentId,
      timestamp,
      parseFloat(paymentData.amount) || 0,
      paymentData.date || timestamp,
      paymentData.channel || '',
      paymentData.receiver || '',
      paymentData.roundLabel || '',
      paymentData.note || ''
    ]);
    
    // Log activity
    logActivity(logUser, 'เพิ่มประวัติชำระเงิน', `เพิ่มยอด ${paymentData.amount} บ. ให้รหัส ${paymentData.studentId}`);
    
    return { success: true, paymentId: paymentId };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function deletePayment(paymentId, logUser) {
  if (logUser) checkTeacherBlock(logUser);
  try {
    const db = getDb();
    const sheet = db.getSheetByName('PaymentsDB');
    if (!sheet) return { success: false, error: 'ไม่พบชีต PaymentsDB' };
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: false, error: 'ไม่พบข้อมูล' };
    
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    let rowIndex = -1;
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] && ids[i][0].toString() === paymentId) {
        rowIndex = i + 2;
        break;
      }
    }
    
    if (rowIndex > -1) {
      sheet.deleteRow(rowIndex);
      logActivity(logUser, 'ลบประวัติชำระเงิน', `ลบรายการชำระเงิน ID: ${paymentId}`);
      return { success: true };
    } else {
      return { success: false, error: 'ไม่พบรหัสชำระเงินนี้' };
    }
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getDebugSyncData() { const db = getDb(); const sheet = db.getSheetByName('DebugSync'); if (!sheet) return 'No sheet'; return JSON.stringify(sheet.getDataRange().getValues()); }

function debugDumpStatusDB() { const sheet = getDb().getSheetByName('StatusDB'); return JSON.stringify(sheet.getRange(1, 1, 5, 20).getValues()); }

function migrateOldDataToNew() {
  const props = PropertiesService.getDocumentProperties();
  const oldId = '1ljRQexe6VoPtUBaaPvpMPs_CjaflvtKpPoYidH5PwLc';
  const newId = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';
  
  const oldDb = SpreadsheetApp.openById(oldId);
  const newDb = SpreadsheetApp.openById(newId);
  
  const oldSheets = oldDb.getSheets();
  let migratedCount = parseInt(props.getProperty('MIGRATE_COUNT') || '0', 10);
  let currentIndex = parseInt(props.getProperty('MIGRATE_INDEX') || '0', 10);
  let logMessagesStr = props.getProperty('MIGRATE_LOGS') || '[]';
  let logMessages = [];
  try {
    logMessages = JSON.parse(logMessagesStr);
  } catch(e) {}
  
  if (currentIndex === 0) {
    logMessages = [];
    migratedCount = 0;
  }
  
  const startTime = Date.now();
  let finished = true;
  
  for (let i = currentIndex; i < oldSheets.length; i++) {
    const oldSheet = oldSheets[i];
    const sheetName = oldSheet.getName();
    
    // We only want to migrate actual grade sheets
    if (!sheetName.match(/^(.+)\/([1-3])$/) && !sheetName.match(/^(อนุบาล|ป\.1|ป\.2|ป\.3|ป\.4|ป\.5|ป\.6|ม\.1|ม\.2|ม\.3|ม\.4|ม\.5|ม\.6)$/)) {
      continue;
    }
    
    let newSheet = newDb.getSheetByName(sheetName);
    if (!newSheet) {
      if (!logMessages.includes(`⚠️ ข้ามชีต ${sheetName} (ไม่มีชีตนี้ในระบบใหม่)`)) {
        logMessages.push(`⚠️ ข้ามชีต ${sheetName} (ไม่มีชีตนี้ในระบบใหม่)`);
      }
      continue;
    }
    
    const lastRow = oldSheet.getLastRow();
    const lastCol = oldSheet.getLastColumn();
    
    if (lastRow < 6 || lastCol < 20) {
      continue; 
    }
    
    if (lastCol >= 35) {
       const numCourseCols = lastCol - 34;
       const oldHeaders = oldSheet.getRange(1, 35, 5, numCourseCols).getValues();
       const currentNewLastCol = newSheet.getLastColumn();
       
       if (currentNewLastCol < lastCol) {
           newSheet.insertColumnsAfter(Math.max(currentNewLastCol, 1), lastCol - currentNewLastCol);
       }
       newSheet.getRange(1, 35, 5, numCourseCols).setValues(oldHeaders);
    }
    const oldData = oldSheet.getRange(6, 1, lastRow - 5, lastCol).getValues();
    
    const newLastRow = newSheet.getLastRow();
    let newExistingNames = new Set();
    if (newLastRow >= 6) {
       const names = newSheet.getRange(6, 2, newLastRow - 5, 1).getValues();
       names.forEach(r => {
         if(r[0]) newExistingNames.add(r[0].toString().trim());
       });
    }
    
    let rowsToAppend = [];
    
    oldData.forEach(row => {
       const studentName = row[1] ? row[1].toString().trim() : '';
       if (!studentName) return;
       
       if (newExistingNames.has(studentName)) {
         return;
       }
       rowsToAppend.push(row);
    });
    
    if (rowsToAppend.length > 0) {
       const startRow = newSheet.getLastRow() + 1;
       let targetColCount = newSheet.getLastColumn();
       if (targetColCount === 0) targetColCount = rowsToAppend[0].length;
       
       const formattedRows = rowsToAppend.map(r => {
          let newRow = [];
          for (let c=0; c<Math.max(r.length, targetColCount); c++) {
            newRow.push(c < r.length ? r[c] : '');
          }
          return newRow.slice(0, Math.max(targetColCount, r.length));
       });
       
       if (formattedRows[0].length > targetColCount) {
           newSheet.insertColumnsAfter(targetColCount, formattedRows[0].length - targetColCount);
       }
       
       newSheet.getRange(startRow, 1, formattedRows.length, formattedRows[0].length).setValues(formattedRows);
       migratedCount += formattedRows.length;
       logMessages.push(`✅ ย้ายข้อมูล ${formattedRows.length} รายการ เข้าชีต ${sheetName}`);
    }
    
    // Check time limit (max 3 mins = 180,000 ms)
    if (Date.now() - startTime > 180000) {
       props.setProperty('MIGRATE_INDEX', (i + 1).toString());
       props.setProperty('MIGRATE_COUNT', migratedCount.toString());
       props.setProperty('MIGRATE_LOGS', JSON.stringify(logMessages));
       
       SpreadsheetApp.getUi().alert('หยุดพักชั่วคราว', `ประมวลผลไป 3 นาที (ดึงมาได้ ${migratedCount} รายการ และถึงชีต ${sheetName})\nเพื่อป้องกันระบบตัดการทำงานเกินเวลา กรุณากดปุ่ม OK\n\n**จากนั้นให้กดเมนู "ย้ายข้อมูลจากไฟล์เก่า" ซ้ำอีกครั้ง** เพื่อทำต่อให้เสร็จครับ`, SpreadsheetApp.getUi().ButtonSet.OK);
       finished = false;
       break;
    }
  }
  
  if (finished) {
    const finalMsg = `🎉 ทำการย้ายข้อมูลเสร็จสมบูรณ์ทั้งหมด ${migratedCount} รายการ!\n\nรายละเอียด:\n` + logMessages.join('\n');
    SpreadsheetApp.getUi().alert('สรุปการย้ายข้อมูล', finalMsg, SpreadsheetApp.getUi().ButtonSet.OK);
    props.deleteProperty('MIGRATE_INDEX');
    props.deleteProperty('MIGRATE_COUNT');
    props.deleteProperty('MIGRATE_LOGS');
  }
}

// --- MESSAGING SYSTEM ---
function ensureMessagesDB(sheet) {
  const lastCol = sheet.getLastColumn();
  let headers = [];
  if (lastCol > 0) {
    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => h.toString().trim());
  }
  const requiredHeaders = ['MessageID', 'Sender', 'Receiver', 'Message', 'Timestamp', 'IsRead'];
  let added = false;
  
  if (headers.length === 0) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]).setFontWeight('bold');
    return true;
  }
  
  requiredHeaders.forEach(req => {
    if (!headers.includes(req)) {
      sheet.insertColumnAfter(sheet.getLastColumn() || 1);
      sheet.getRange(1, (sheet.getLastColumn() || 1) + 1).setValue(req).setFontWeight('bold');
      added = true;
    }
  });
  return added;
}

function getChatHistory(teacherUsername) {
  const db = getDb();
  let sheet = db.getSheetByName('MessagesDB');
  if (!sheet) {
    sheet = db.insertSheet('MessagesDB');
    ensureMessagesDB(sheet);
  } else {
    ensureMessagesDB(sheet);
  }
  
  // Build username -> nickname map
  const nicknameMap = {};
  const usersSheet = db.getSheetByName('UsersDB');
  if (usersSheet) {
    const uData = usersSheet.getDataRange().getValues();
    for (let i = 1; i < uData.length; i++) {
      const uname = (uData[i][0] || '').toString().trim().toLowerCase();
      const nick = (uData[i][3] || '').toString().trim();
      if (uname && nick) nicknameMap[uname] = nick;
    }
  }
  const teachersSheet = db.getSheetByName('TeachersDB');
  if (teachersSheet) {
    const tData = teachersSheet.getDataRange().getValues();
    for (let i = 1; i < tData.length; i++) {
      const tuser = (tData[i][0] || '').toString().trim().toLowerCase();
      const tNick = (tData[i][2] || '').toString().trim();
      if (tuser && tNick) nicknameMap[tuser] = tNick;
    }
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, messages: [] };
  
  const headers = data[0];
  const col = {
    id: headers.indexOf('MessageID'),
    sender: headers.indexOf('Sender'),
    receiver: headers.indexOf('Receiver'),
    message: headers.indexOf('Message'),
    timestamp: headers.indexOf('Timestamp'),
    isRead: headers.indexOf('IsRead')
  };
  
  const msgs = [];
  const teacherLower = teacherUsername.toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const s = (row[col.sender] || '').toString().toLowerCase();
    const r = (row[col.receiver] || '').toString().toLowerCase();
    
    if (s === teacherLower || r === teacherLower) {
      const senderRaw = (row[col.sender] || '').toString().trim();
      msgs.push({
        id: row[col.id],
        sender: senderRaw,
        senderNickname: nicknameMap[senderRaw.toLowerCase()] || senderRaw,
        receiver: row[col.receiver],
        message: row[col.message],
        timestamp: row[col.timestamp],
        isRead: row[col.isRead]
      });
    }
  }
  
  return { success: true, messages: msgs };
}

function sendMessage(sender, receiver, message) {
  const db = getDb();
  let sheet = db.getSheetByName('MessagesDB');
  if (!sheet) {
    sheet = db.insertSheet('MessagesDB');
    ensureMessagesDB(sheet);
  } else {
    ensureMessagesDB(sheet);
  }
  
  const msgId = 'MSG_' + new Date().getTime();
  const timestamp = new Date().toISOString();
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = [];
  
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (h === 'MessageID') newRow.push(msgId);
    else if (h === 'Sender') newRow.push(sender);
    else if (h === 'Receiver') newRow.push(receiver);
    else if (h === 'Message') newRow.push(message);
    else if (h === 'Timestamp') newRow.push(timestamp);
    else if (h === 'IsRead') newRow.push(false);
    else newRow.push('');
  }
  
  sheet.appendRow(newRow);
  return { success: true, messageId: msgId, timestamp: timestamp };
}

function markMessagesAsRead(teacherUsername, reader) {
  const db = getDb();
  const sheet = db.getSheetByName('MessagesDB');
  if (!sheet) return { success: false };
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true };
  
  const headers = data[0];
  const col = {
    sender: headers.indexOf('Sender'),
    receiver: headers.indexOf('Receiver'),
    isRead: headers.indexOf('IsRead')
  };
  
  const teacherLower = teacherUsername.toLowerCase();
  const readerUsername = typeof reader === 'object' ? reader.username : reader;
  const readerLower = readerUsername.toLowerCase();
  const readerRole = typeof reader === 'object' ? (reader.role || '').toString().trim().toLowerCase() : '';
  const isStaff = readerRole === 'staff' || readerRole === 'admin' || readerRole === 'administrator' || readerRole === 'พนักงาน' || readerRole === 'ผู้บริหาร';
  let updated = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const s = (row[col.sender] || '').toString().toLowerCase();
    const r = (row[col.receiver] || '').toString().toLowerCase();
    
    // If the message involves this teacher and the receiver is the reader (or Admin if reader is staff)
    if ((s === teacherLower || r === teacherLower) && (r === readerLower || (isStaff && r === 'admin')) && row[col.isRead] !== true) {
      sheet.getRange(i + 1, col.isRead + 1).setValue(true);
      updated++;
    }
  }
  
  return { success: true, updated: updated };
}

function getUnreadMessagesCount(reader) {
  const db = getDb();
  const sheet = db.getSheetByName('MessagesDB');
  if (!sheet) return { success: true, count: 0 };
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, count: 0 };
  
  const headers = data[0];
  const colReceiver = headers.indexOf('Receiver');
  const colIsRead = headers.indexOf('IsRead');
  
  let count = 0;
  const readerUsername = typeof reader === 'object' ? reader.username : reader;
  const readerLower = readerUsername.toLowerCase();
  const readerRole = typeof reader === 'object' ? (reader.role || '').toString().trim().toLowerCase() : '';
  const isStaff = readerRole === 'staff' || readerRole === 'admin' || readerRole === 'administrator' || readerRole === 'พนักงาน' || readerRole === 'ผู้บริหาร';
  
  for (let i = 1; i < data.length; i++) {
    const r = (data[i][colReceiver] || '').toString().toLowerCase();
    if ((r === readerLower || (isStaff && r === 'admin')) && data[i][colIsRead] !== true) {
      count++;
    }
  }
  return { success: true, count: count };
}

function getChatContactsWithUnread(reader) {
  const db = getDb();
  const usersSheet = db.getSheetByName('UsersDB');
  if (!usersSheet) return { success: false, error: 'ไม่พบ UsersDB' };
  
  const usersData = usersSheet.getDataRange().getValues();
  if (usersData.length <= 1) return { success: true, contacts: [] };
  
  const uHeaders = usersData[0];
  const uColUser = uHeaders.indexOf('Username');
  const uColRole = uHeaders.indexOf('Role');
  const uColNick = uHeaders.indexOf('Nickname');
  
  const contactsMap = {}; 
  
  for (let i = 1; i < usersData.length; i++) {
    const role = (usersData[i][uColRole] || '').toString().trim();
    const r = role.toLowerCase();
    if (r !== 'staff' && r !== 'admin' && r !== 'administrator' && r !== 'พนักงาน' && r !== 'ผู้บริหาร') {
      const uname = (usersData[i][uColUser] || '').toString();
      const nick = (usersData[i][uColNick] || '').toString() || uname;
      if (uname) {
        contactsMap[uname.toLowerCase()] = { username: uname, nickname: nick, unreadCount: 0, lastMessageTime: 0 };
      }
    }
  }
  
  const messagesSheet = db.getSheetByName('MessagesDB');
  if (messagesSheet) {
    const msgData = messagesSheet.getDataRange().getValues();
    if (msgData.length > 1) {
      const mHeaders = msgData[0];
      const mColSender = mHeaders.indexOf('Sender');
      const mColReceiver = mHeaders.indexOf('Receiver');
      const mColIsRead = mHeaders.indexOf('IsRead');
      
      const mColTimestamp = mHeaders.indexOf('Timestamp');

      const readerUsername = typeof reader === 'object' ? reader.username : reader;
      const readerLower = readerUsername.toLowerCase();
      const readerRole = typeof reader === 'object' ? (reader.role || '').toString().trim().toLowerCase() : '';
      const isStaff = readerRole === 'staff' || readerRole === 'admin' || readerRole === 'administrator' || readerRole === 'พนักงาน' || readerRole === 'ผู้บริหาร';
      
      for (let i = 1; i < msgData.length; i++) {
        const s = (msgData[i][mColSender] || '').toString().toLowerCase();
        const r = (msgData[i][mColReceiver] || '').toString().toLowerCase();
        const isRead = msgData[i][mColIsRead] === true;
        const tsVal = msgData[i][mColTimestamp];
        const ts = tsVal ? new Date(tsVal).getTime() : 0;
        
        if (contactsMap[s] && (r === readerLower || (isStaff && r === 'admin'))) {
          if (!isRead) {
            contactsMap[s].unreadCount++;
          }
          if (ts > contactsMap[s].lastMessageTime) {
            contactsMap[s].lastMessageTime = ts;
          }
        }
        
        if (contactsMap[r] && (s === readerLower || (isStaff && s === 'admin'))) {
           if (ts > contactsMap[r].lastMessageTime) {
             contactsMap[r].lastMessageTime = ts;
           }
        }
      }
    }
  }
  
  const contactsArray = Object.values(contactsMap);
  contactsArray.sort((a, b) => {
    if (b.unreadCount !== a.unreadCount) {
      return b.unreadCount - a.unreadCount;
    }
    return b.lastMessageTime - a.lastMessageTime;
  });
  
  return { success: true, contacts: contactsArray };
}
