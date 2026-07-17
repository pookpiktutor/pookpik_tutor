const SPREADSHEET_ID = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';

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

// SHEET_REGISTRY — ศà¸¹นยà¹Œà¸�ลà¸²งนิยà¸²มตà¸²รà¸²งà¸�à¸²นขà¹‰อมà¸¹ลทัà¹‰งหมด

// à¹€มืà¹ˆอตà¹‰องà¸�à¸²รà¹€à¸žิà¹ˆมตà¸²รà¸²งà¹ƒหมà¹ˆ à¹ƒหà¹‰à¹€à¸žิà¹ˆมรà¸²ยà¸�à¸²รทà¸µà¹ˆนà¸µà¹ˆà¹€ทà¹ˆà¸²นัà¹‰น

// ระà¸šà¸šà¸ˆะà¸ªรà¹‰à¸²งà¸Šà¸µตà¸žรà¹‰อม headers à¹ƒหà¹‰อัตà¹‚นมัติทุà¸�ครัà¹‰งทà¸µà¹ˆ init

// ============================================================

const SHEET_REGISTRY = [

  {

    name: 'UsersDB',

    headers: ['Username', 'Password', 'Role', 'Nickname', 'FullName', 'Phone', 'ProfilePic'],

    headerRow: 1,

    defaultData: [

      ['admin', '1234', 'Administrator', '', '', '', ''],

      ['staff', '1234', 'Staff', '', '', '', '']

    ]

  },

  {

    name: 'TeachersDB',

    headers: ['Nickname', 'FullName', 'School', 'Phone', 'Subjects', 'Bank', 'AccountNumber', 'Compensation', 'TeacherID'],

    headerRow: 1

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

      'ID', 'à¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุล', 'à¸Šืà¹ˆอà¹€ลà¹ˆน', 'à¹‚รงà¹€รà¸µยน', 'à¹€à¸šอรà¹Œติดตà¹ˆอ',

      'à¸ªà¸²ขà¸²à¹€รà¸µยน', 'à¸ªà¸²ขà¸²ทà¸µà¹ˆà¹€à¸�à¹‡à¸šà¹€งิน', 'หมà¸²ยà¹€หตุà¹€วลà¸²à¸ˆà¹ˆà¸²ยà¹€งิน', 'หมà¸²ยà¹€หตุà¹€à¸žิà¹ˆมà¹€ติม',

      'ยอดà¸ˆà¹ˆà¸²ยมà¸²', 'คà¹ˆà¸²à¹€รà¸µยน', 'คงà¹€หลือ', 'วันทà¸µà¹ˆà¸Šà¸³ระà¹€งิน', 'à¸Šà¹ˆองทà¸²งà¸Šà¸³ระà¹€งิน',

      'à¸œà¸¹à¹‰รัà¸šà¹€งิน', 'รอà¸šà¸�à¸²รà¹€รà¸µยน', 'ระดัà¸šà¸Šัà¹‰น', 'หà¹‰องà¹€รà¸µยนยà¹ˆอย', 'à¸Šืà¹ˆอà¹„ลนà¹Œà¹‚ปรà¹„à¸Ÿลà¹Œ',

      'ID LINE', 'คà¹ˆà¸²à¹€รà¸µยนยà¸�มà¸²', 'à¸Šัà¹ˆวà¹‚มงà¹€รà¸µยน', 'à¸Šัà¹ˆวà¹‚มงคงà¹€หลือ', 'ประà¹€à¸ ทคลà¸²à¸ª',

      'ตรวà¸ˆà¸ªอà¸š'

    ],

    headerRow: 1

  },

  {

    name: 'DATA General',

    headers: ['รà¸²ยà¸Šืà¹ˆอครà¸¹', 'รà¸²ยà¸Šืà¹ˆอà¹‚รงà¹€รà¸µยน'],

    headerRow: 1

  },

  {

    name: 'Data Learn',

    headers: [

      'วิà¸Šà¸²', 'ครูประจำ', 'ครà¸¹à¹�ทน', 'à¹€วลà¸²à¹€ริà¹ˆม', 'à¹€วลà¸²à¸ˆà¸š',

      'หมà¸²ยà¹€หตุ', 'à¸ªด', 'ออน', 'ลà¸²', 'ขà¸²ด',

      'à¸Šด', 'à¸Šม.', 'วันทà¸µà¹ˆ', 'หà¹‰อง/à¸ªà¸²ขà¸²/iPad'

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

    name: 'Data à¸œà¸ˆà¸�.',

    headers: [

      'à¸Šืà¹ˆอà¸œà¸¹à¹‰à¸ˆัดà¸�à¸²ร', 'à¹€วลà¸²à¹€ขà¹‰à¸²OT', 'à¹€วลà¸²ออà¸�OT', 'à¹€วลà¸²à¹€ขà¹‰à¸²งà¸²น', 'à¹€วลà¸²ออà¸�งà¸²น',

      'หมà¸²ยà¹€หตุ รà¸²ยละà¹€อà¸µยด OT', 'มà¸²', 'หยุด', 'à¸Šม.OT', 'à¸Šม.งà¸²น', 'วันทà¸µà¹ˆ',

      'Latitude', 'Longitude'

    ],

    headerRow: 1

  },

  {

    name: 'TeacherSalaryConfirmations',

    headers: ['Year', 'Month', 'TeacherID', 'TeacherName', 'TotalPay', 'ConfirmedAt'],

    headerRow: 1

  }

  // âœ… à¹€à¸žิà¹ˆมตà¸²รà¸²งà¹ƒหมà¹ˆà¹„ดà¹‰ทà¸µà¹ˆนà¸µà¹ˆ — ระà¸šà¸šà¸ˆะà¸ªรà¹‰à¸²งà¸Šà¸µตà¹�ละ headers à¹ƒหà¹‰อัตà¹‚นมัติ

  // ตัวอยà¹ˆà¸²ง:

  // {

  //   name: 'NewTableDB',

  //   headers: ['Col1', 'Col2', 'Col3'],

  //   headerRow: 1,

  //   defaultData: [['row1col1', 'row1col2', 'row1col3']]  // optional seed data

  // }

];

/**

 * ensureAllRegisteredSheets()

 * วนตรวà¸ˆà¸ªอà¸š SHEET_REGISTRY ทุà¸�รà¸²ยà¸�à¸²ร

 * ถà¹‰à¸²à¸Šà¸µตยังà¹„มà¹ˆมà¸µ → à¸ªรà¹‰à¸²งà¹ƒหมà¹ˆà¸žรà¹‰อม headers à¹�ละ defaultData (ถà¹‰à¸²มà¸µ)

 * ถà¹‰à¸²à¸Šà¸µตมà¸µอยà¸¹à¹ˆà¹�ลà¹‰วà¹�ตà¹ˆยังà¹„มà¹ˆมà¸µ headers → à¹€ติม headers à¹ƒหà¹‰

 */

function ensureAllRegisteredSheets() {

  const db = getDb();

  let createdCount = 0;

  

  SHEET_REGISTRY.forEach(function(def) {

    let sheet = db.getSheetByName(def.name);

    const hRow = def.headerRow || 1;

    

    if (!sheet) {

      // à¸ªรà¹‰à¸²งà¸Šà¸µตà¹ƒหมà¹ˆ

      sheet = db.insertSheet(def.name);

      sheet.getRange(hRow, 1, 1, def.headers.length).setValues([def.headers]);

      

      // à¹€ติมขà¹‰อมà¸¹ลà¹€ริà¹ˆมตà¹‰น (ถà¹‰à¸²มà¸µ)

      if (def.defaultData && def.defaultData.length > 0) {

        sheet.getRange(hRow + 1, 1, def.defaultData.length, def.defaultData[0].length)

          .setValues(def.defaultData);

      }

      

      createdCount++;

      Logger.log('âœ… Auto-created sheet: ' + def.name + ' with ' + def.headers.length + ' columns');

    } else {

      // à¸Šà¸µตมà¸µอยà¸¹à¹ˆà¹�ลà¹‰ว ตรวà¸ˆà¸ªอà¸šวà¹ˆà¸²มà¸µ headers หรือยัง

      if (sheet.getLastRow() < hRow) {

        sheet.getRange(hRow, 1, 1, def.headers.length).setValues([def.headers]);

        Logger.log('ðŸ“� Added headers to existing sheet: ' + def.name);

      }

    }

  });

  

  if (createdCount > 0) {

    Logger.log('ðŸ†• Auto-created ' + createdCount + ' new sheet(s) from SHEET_REGISTRY');

  }

  

  return createdCount;

}

/**

 * getRegistryDef(sheetName)

 * คà¹‰นหà¸²นิยà¸²มของà¸Šà¸µตà¸ˆà¸²à¸� SHEET_REGISTRY

 */

function getRegistryDef(sheetName) {

  for (let i = 0; i < SHEET_REGISTRY.length; i++) {

    if (SHEET_REGISTRY[i].name === sheetName) return SHEET_REGISTRY[i];

  }

  return null;

}

function doGet(e) {

  if (e.parameter && e.parameter.export === 'true') {

    return ContentService.createTextOutput(exportAllDataToJson()).setMimeType(ContentService.MimeType.JSON);

  }

  if (e && e.parameter && e.parameter.clean_garbage === '1') {

    cleanDataLearnColAGarbage();

    return ContentService.createTextOutput("Garbage cleaned and cache cleared.").setMimeType(ContentService.MimeType.TEXT);

  }

if (e && e.parameter && e.parameter.debug_headers === '1') {

  const db = getDb();

  const s1 = db.getSheetByName('à¹€ดà¸µà¹ˆยว ป.1');

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

        } else if (name.includes('à¹€ดà¸µà¹ˆยว') || name.includes('ยà¹ˆอย')) {

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

      return HtmlService.createHtmlOutput('<h1>âœ“ à¸ˆัดà¹€ตรà¸µยมà¸�à¸²นขà¹‰อมà¸¹ลà¸ªà¸³à¹€รà¹‡à¸ˆà¹€รà¸µยà¸šรà¹‰อยà¹�ลà¹‰ว! (Database Initialized Successfully)</h1>');

    } catch (err) {

      return HtmlService.createHtmlOutput('<h1>â�Œ à¹€à¸�ิดขà¹‰อà¸œิดà¸žลà¸²ด: ' + err.toString() + '</h1>');

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

      

      return HtmlService.createHtmlOutput('<h1>âœ“ debug_sheets.json written: ' + sheets.join(', ') + '<br/>Headers: ' + JSON.stringify(headersData) + '</h1>');

    } catch (err) {

      return HtmlService.createHtmlOutput('<h1>â�Œ Error: ' + err.toString() + '</h1>');

    }

  }

  if (e && e.parameter && e.parameter.debug === '1') {

    return HtmlService.createHtmlOutput(getDebugDiagnosticHtml());

  }

  if (e && e.parameter && e.parameter.page === 'register') {

    return HtmlService.createTemplateFromFile('Register')

      .evaluate()

      .setTitle('ลงทะà¹€à¸šà¸µยนà¹€รà¸µยน - à¸šà¹‰à¸²นครà¸¹ปุà¹Šà¸�ปิà¹Šà¸�')

      .addMetaTag('viewport', 'width=device-width, initial-scale=1')

      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  }

  return HtmlService.createTemplateFromFile('Index')

    .evaluate()

    .setTitle('ระà¸šà¸šดà¸¹à¹�ลà¹‚รงà¹€รà¸µยนà¸�วดวิà¸Šà¸²à¸šà¹‰à¸²นครà¸¹ปุà¹Šà¸�ปิà¹Šà¸�')

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

    

    const teachersSheet = db.getSheetByName('TeachersDB');

    if (teachersSheet) {

      const data = teachersSheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {

        result.teachers.push({

          nickname: data[i][0],

          fullName: data[i][1],

          role: data[i][2] // if any

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

  let html = '<h1>ระà¸šà¸šตรวà¸ˆà¸ªอà¸šควà¸²มถà¸¹à¸�ตà¹‰องของà¸�à¸²นขà¹‰อมà¸¹ล (Diagnostic Page)</h1>';

  try {

    const db = getDb();

    html += `<p><b>Spreadsheet Title:</b> ${db.getName()}</p>`;

    html += `<p><b>Spreadsheet ID:</b> ${db.getId()}</p>`;

    

    const sheets = db.getSheets().map(s => s.getName());

    html += `<p><b>ตà¸²รà¸²งทัà¹‰งหมดà¹ƒนà¸ªà¹€ปรดà¸Šà¸µต:</b> ${sheets.join(', ')}</p>`;

    

    // Check UsersDB

    const usersSheet = db.getSheetByName('UsersDB');

    if (!usersSheet) {

      html += '<p style="color:red;"><b>â�Œ à¹„มà¹ˆà¸žà¸šตà¸²รà¸²ง UsersDB</b></p>';

    } else {

      const data = usersSheet.getDataRange().getValues();

      html += '<h3>รà¸²ยà¸Šืà¹ˆอà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰ทà¸µà¹ˆอยà¸¹à¹ˆà¹ƒนระà¸šà¸š (UsersDB):</h3>';

      html += '<table border="1" cellpadding="5" style="border-collapse:collapse; width: 100%; max-width: 600px;">';

      html += '<tr><th>à¹�ถวทà¸µà¹ˆ</th><th>Username</th><th>Password Length</th><th>Role</th></tr>';

      for (let i = 0; i < data.length; i++) {

        const username = data[i][0];

        const password = data[i][1];

        const role = data[i][2];

        if (i === 0) {

          html += `<tr style="background:#eee;"><td>หัวตà¸²รà¸²ง</td><td>${username}</td><td>${password}</td><td>${role}</td></tr>`;

        } else {

          const passLen = password ? password.toString().length : 0;

          html += `<tr><td>${i + 1}</td><td>"${username}"</td><td>${passLen} ตัวอัà¸�ษร</td><td>"${role}"</td></tr>`;

        }

      }

      html += '</table>';

    }

    

    // Check RoomsDB

    const roomsSheet = db.getSheetByName('RoomsDB');

    if (!roomsSheet) {

      html += '<p style="color:red;"><b>â�Œ à¹„มà¹ˆà¸žà¸šตà¸²รà¸²ง RoomsDB</b></p>';

    } else {

      html += `<p style="color:green;"><b>âœ“ à¸žà¸šตà¸²รà¸²ง RoomsDB</b> (${roomsSheet.getLastRow()} à¹�ถว)</p>`;

    }

    

    // Check TeachersDB

    const teachersSheet = db.getSheetByName('TeachersDB');

    if (!teachersSheet) {

      html += '<p style="color:red;"><b>â�Œ à¹„มà¹ˆà¸žà¸šตà¸²รà¸²ง TeachersDB</b></p>';

    } else {

      html += `<p style="color:green;"><b>âœ“ à¸žà¸šตà¸²รà¸²ง TeachersDB</b> (${teachersSheet.getLastRow()} à¹�ถว)</p>`;

      if (teachersSheet.getLastRow() > 0) {

        const tHeaders = teachersSheet.getRange(1, 1, 1, teachersSheet.getLastColumn()).getValues()[0];

        html += `<p><b>คอลัมนà¹Œà¹ƒน TeachersDB:</b> ${JSON.stringify(tHeaders)}</p>`;

        if (teachersSheet.getLastRow() >= 2) {

          const tRow = teachersSheet.getRange(2, 1, 1, teachersSheet.getLastColumn()).getValues()[0];

          html += `<p><b>ตัวอยà¹ˆà¸²งขà¹‰อมà¸¹ลครà¸¹à¹�ถวà¹�รà¸�:</b> ${JSON.stringify(tRow)}</p>`;

        }

      }

    }

    // Check Data Learn

    const learnSheet = db.getSheetByName('Data Learn');

    if (!learnSheet) {

      html += '<p style="color:red;"><b>â�Œ à¹„มà¹ˆà¸žà¸šตà¸²รà¸²ง Data Learn</b></p>';

    } else {

      html += `<p style="color:green;"><b>âœ“ à¸žà¸šตà¸²รà¸²ง Data Learn</b> (${learnSheet.getLastRow()} à¹�ถว)</p>`;

      if (learnSheet.getLastRow() > 0) {

        const lHeaders = learnSheet.getRange(1, 1, 1, learnSheet.getLastColumn()).getValues()[0];

        html += `<p><b>คอลัมนà¹Œà¹ƒน Data Learn:</b> ${JSON.stringify(lHeaders)}</p>`;

        if (learnSheet.getLastRow() >= 2) {

          const lRow = learnSheet.getRange(2, 1, 1, learnSheet.getLastColumn()).getValues()[0];

          html += `<p><b>ตัวอยà¹ˆà¸²งขà¹‰อมà¸¹ลตà¸²รà¸²งà¹€รà¸µยนà¹�ถวà¹�รà¸�:</b> ${JSON.stringify(lRow)}</p>`;

        }

      }

    }

    // Check ActivityLog Last 20 lines

    const logSheet = db.getSheetByName('ActivityLog');

    if (logSheet) {

      const lastR = logSheet.getLastRow();

      html += `<h3>à¸šันทึà¸�à¸�ิà¸ˆà¸�รรมลà¹ˆà¸²à¸ªุด (ActivityLog - ${lastR} à¹�ถว):</h3>`;

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

    html += '<h3>à¸�à¸²รà¸ˆัดà¸�à¸²ร:</h3>';

    html += '<button onclick="google.script.run.withSuccessHandler(function(){alert(\'à¸ˆัดà¹€ตรà¸µยมà¸�à¸²นขà¹‰อมà¸¹ลà¸ªà¸³à¹€รà¹‡à¸ˆ!\');location.reload();}).initAllDatabases()">ðŸ”„ à¸ªัà¹ˆงรัน initAllDatabases() à¹€à¸žืà¹ˆอà¸ªรà¹‰à¸²งà¹�ละรà¸µà¹€ซà¹‡ตตà¸²รà¸²งà¹€ริà¹ˆมตà¹‰น</button>';

    

  } catch (e) {

    html += `<p style="color:red;"><b>à¹€à¸�ิดขà¹‰อà¸œิดà¸žลà¸²ดà¹ƒนà¸�à¸²รà¹€à¸Šืà¹ˆอมตà¹ˆอà¸�à¸²นขà¹‰อมà¸¹ล:</b> ${e.toString()}</p>`;

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

  ui.createMenu('ðŸ�« ระà¸šà¸šครà¸¹ปุà¹Šà¸�ปิà¹Šà¸�')

      .addItem('ðŸ”„ à¸ªรà¹‰à¸²ง/รà¸µà¹€ซà¹‡ตà¸�à¸²นขà¹‰อมà¸¹ลตà¸²รà¸²งà¹€รà¸µยน', 'initAllDatabases')

      .addItem('ðŸ”„ อัปà¹€ดตà¸Šืà¹ˆอà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰งà¸²นà¹ƒนประวัติยà¹‰อนหลัง', 'fixHistoricalActivityLogs')

      .addItem('ðŸ“¥ คัดลอà¸�ขà¹‰อมà¸¹ลทุà¸�à¹�à¸œà¹ˆนงà¸²นà¹„ปยังà¸ªà¹€ปรดà¸Šà¸µตà¹ƒหมà¹ˆ', 'copyAllSheetsFromOldDb')

      .addItem('ðŸ“¥ นà¸³à¹€ขà¹‰à¸²ขà¹‰อมà¸¹ลนัà¸�à¹€รà¸µยนà¸ˆà¸²à¸�à¹„à¸Ÿลà¹Œà¸ à¸²ยนอà¸�', 'importExternalStudentData')

      .addItem('ðŸŒ� à¹€ปิดระà¸šà¸šà¹€วà¹‡à¸šà¹„ซตà¹Œดà¸¹à¹�ลà¹‚รงà¹€รà¸µยน', 'openWebAppUrl')

      .addToUi();

}

function openWebAppUrl() {

  const url = ScriptApp.getService().getUrl();

  if (!url) {

    SpreadsheetApp.getUi().alert('à¸�รุณà¸²ทà¸³à¸�à¸²ร Deploy Web App à¸�à¹ˆอนà¹€รà¸µยà¸�à¹ƒà¸Šà¹‰งà¸²นà¹€มนà¸¹นà¸µà¹‰');

    return;

  }

  const html = HtmlService.createHtmlOutput(`

    <script>

      window.open("${url}", "_blank");

      google.script.host.close();

    </script>

  `).setWidth(300).setHeight(100);

  SpreadsheetApp.getUi().showModalDialog(html, 'à¸�à¸³ลังà¹€ปิดหนà¹‰à¸²à¹€วà¹‡à¸šà¹„ซตà¹Œ...');

}

function copyAllSheetsFromOldDb() {

  const oldId = '1_GFW3sorojPARW70CvlSXmzDXN6XdeFfzInqqz4r2_4';

  const newId = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';

  

  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(

    'ยืนยันà¸�à¸²รคัดลอà¸�ขà¹‰อมà¸¹ล',

    'คุณตà¹‰องà¸�à¸²รคัดลอà¸�à¹�à¸œà¹ˆนงà¸²นทัà¹‰งหมดà¸ˆà¸²à¸�à¸ªà¹€ปรดà¸Šà¸µตà¹€à¸�à¹ˆà¸²à¹„ปà¸ªà¹€ปรดà¸Šà¸µตà¹ƒหมà¹ˆหรือà¹„มà¹ˆ? (หà¸²à¸�มà¸µà¹�à¸œà¹ˆนงà¸²นà¸Šืà¹ˆอซà¹‰à¸³à¹ƒนà¹„à¸Ÿลà¹Œà¹ƒหมà¹ˆà¸ˆะถà¸¹à¸�à¹€ขà¸µยนทัà¸š)',

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

    

    ui.alert('à¹€à¸ªรà¹‡à¸ˆà¸ªิà¹‰น', 'คัดลอà¸�à¹�à¸œà¹ˆนงà¸²นà¸ªà¸³à¹€รà¹‡à¸ˆà¸ˆà¸³นวน ' + copiedCount + ' à¹�à¸œà¹ˆนงà¸²นà¹„ปยังà¸ªà¹€ปรดà¸Šà¸µตà¹ƒหมà¹ˆà¹€รà¸µยà¸šรà¹‰อยà¹�ลà¹‰ว!', ui.ButtonSet.OK);

  } catch (err) {

    ui.alert('ขà¹‰อà¸œิดà¸žลà¸²ด', 'à¹„มà¹ˆà¸ªà¸²มà¸²รถคัดลอà¸�ขà¹‰อมà¸¹ลà¹„ดà¹‰: ' + err.toString(), ui.ButtonSet.OK);

  }

}

function importExternalStudentData() {

  const sourceId = '1WUybURcf7qtEcxc-lsMKrx4DNqE6xGL19kncsXHp6t0';

  const targetId = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';

  

  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(

    'ยืนยันà¸�à¸²รนà¸³à¹€ขà¹‰à¸²ขà¹‰อมà¸¹ลนัà¸�à¹€รà¸µยน',

    'คุณตà¹‰องà¸�à¸²รดึงขà¹‰อมà¸¹ลนัà¸�à¹€รà¸µยนà¸ˆà¸²à¸�à¹„à¸Ÿลà¹Œà¸ à¸²ยนอà¸�มà¸²à¸ˆัดà¹€รà¸µยงà¹ƒà¸ªà¹ˆà¹ƒนà¸�à¸²นขà¹‰อมà¸¹ลนà¸µà¹‰หรือà¹„มà¹ˆ?\n(ขà¹‰อมà¸¹ลà¹€ดิมà¹ƒนà¹�ตà¹ˆละà¸Šà¸µตหà¹‰องà¹€รà¸µยนà¸ˆะถà¸¹à¸�à¹€ขà¸µยนทัà¸š)',

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

      if (sourceName.indexOf('à¹€ดà¸µà¹ˆยว ') === 0 || sourceName.indexOf('ยà¹ˆอย ') === 0) {

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

      const isPrivate = (targetName.indexOf('à¹€ดà¸µà¹ˆยว ') === 0 || targetName.indexOf('ยà¹ˆอย ') === 0);

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

          newRow[0] = row[0] !== undefined ? row[0] : '';   // ระดัà¸šà¸Šัà¹‰น (à¸Šัà¹‰นà¹€รà¸µยน)

          newRow[1] = row[1] !== undefined ? row[1] : '';   // à¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุล

          newRow[2] = row[2] !== undefined ? row[2] : '';   // à¸Šืà¹ˆอà¹€ลà¹ˆน

          newRow[3] = row[3] !== undefined ? row[3] : '';   // à¹‚รงà¹€รà¸µยน

          newRow[4] = row[4] !== undefined ? row[4] : '';   // หà¹‰องà¹€รà¸µยนยà¹ˆอย (หà¹‰อง)

          newRow[5] = row[5] !== undefined ? row[5] : '';   // à¹€à¸šอรà¹Œติดตà¹ˆอ (à¹€à¸šอรà¹Œ)

          newRow[6] = row[6] !== undefined ? row[6] : '';   // à¸Šืà¹ˆอà¹‚ปรà¹„à¸Ÿลà¹Œà¹„ลนà¹Œ (à¸Šืà¹ˆอà¹„ลนà¹Œ/à¸�ลุà¹ˆมติดตà¹ˆอ)

          newRow[7] = row[7] !== undefined ? row[7] : '';   // ID LINE (ID Line)

          newRow[8] = row[8] !== undefined ? row[8] : '';   // à¸ªà¸²ขà¸²à¹€รà¸µยน (à¹€รà¸µยน)

          newRow[9] = row[9] !== undefined ? row[9] : '';   // à¸ªà¸²ขà¸²ทà¸µà¹ˆà¹€à¸�à¹‡à¸šà¹€งิน (à¹€à¸�à¹‡à¸šà¹€งิน)

          newRow[10] = row[12] !== undefined ? row[12] : ''; // ยอดà¸Šà¸³ระ/ยอดรวม (ยอดà¹€ตà¹‡ม)

          newRow[11] = row[11] !== undefined ? row[11] : ''; // à¸ªà¹ˆวนลด (à¸ªà¹ˆวนลด)

          newRow[12] = row[14] !== undefined ? row[14] : ''; // รอà¸š/คงà¹€หลือ (คงà¹€หลือ)

          newRow[13] = row[13] !== undefined ? row[13] : ''; // ยอดà¹€รà¸µยนคงà¹€หลือ/ยอดà¸ˆà¹ˆà¸²ย (à¸ˆà¹ˆà¸²ยมà¸²)

          newRow[14] = row[15] !== undefined ? row[15] : ''; // รหัà¸ªà¸šัตร/รà¸¹ดà¸šัตร (วัน/à¹€ดือน/ปà¸µ)

          return newRow;

        });

        targetSheet.getRange(6, 1, mappedValues.length, 15).setValues(mappedValues);

      }

      importedCount++;

    });

    

    ui.alert('นà¸³à¹€ขà¹‰à¸²ขà¹‰อมà¸¹ลà¸ªà¸³à¹€รà¹‡à¸ˆ', 'ดึงขà¹‰อมà¸¹ลà¹�ละà¸ˆัดà¹€รà¸µยงà¹€ขà¹‰à¸²à¸ªà¸¹à¹ˆà¸�à¸²นขà¹‰อมà¸¹ลà¸ªà¸³à¹€รà¹‡à¸ˆà¸ˆà¸³นวน ' + importedCount + ' à¹�à¸œà¹ˆนงà¸²นà¹€รà¸µยà¸šรà¹‰อยà¹�ลà¹‰ว!', ui.ButtonSet.OK);

  } catch (err) {

    ui.alert('ขà¹‰อà¸œิดà¸žลà¸²ด', 'à¹„มà¹ˆà¸ªà¸²มà¸²รถนà¸³à¹€ขà¹‰à¸²ขà¹‰อมà¸¹ลà¹„ดà¹‰: ' + err.toString(), ui.ButtonSet.OK);

  }

}

let cachedDb_ = null;

function getDb() {

  if (!cachedDb_) {

    cachedDb_ = SpreadsheetApp.openById(SPREADSHEET_ID);

  }

  return cachedDb_;

}

// Automatically create sheet and headers if it doesn't exist

function getOrCreateSheet(sheetName) {

  const db = getDb();

  let sheet = db.getSheetByName(sheetName);

  if (sheet) return sheet;

  

  // 1. Classroom sheets (e.g., "ม.1/1", "อ.3/2")

  const isClassroom = sheetName.match(/^(.+)\/([1-3])$/);

  if (isClassroom) {

    sheet = db.insertSheet(sheetName);

    sheet.clear();

    const headers = ['ระดัà¸šà¸Šัà¹‰น', 'à¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุล', 'à¸Šืà¹ˆอ', 'à¹‚รงà¹€รà¸µยน', 'หà¹‰องà¹€รà¸µยนทà¸µà¹ˆ', 'à¹€à¸šอรà¹Œติดตà¹ˆอ', 'à¹€à¸šอรà¹Œà¸œà¸¹à¹‰ปà¸�ครอง/à¹€à¸šอรà¹Œติดตà¹ˆอ', 'ID LINE', 'à¸ªà¸²ขà¸²ทà¸µà¹ˆà¹€รà¸µยน', 'à¸ªà¸²ขà¸²ทà¸µà¹ˆà¸ˆà¹ˆà¸²ยà¹€งิน'];

    const row5 = new Array(18).fill('');

    headers.forEach((h, idx) => { row5[idx] = h; });

    row5[10] = 'ยอดà¸Šà¸³ระ';

    row5[11] = 'à¸ªà¹ˆวนลด';

    row5[12] = 'รอà¸š';

    row5[13] = 'ยอดà¹€รà¸µยนคงà¹€หลือ';

    row5[14] = 'รหัà¸ªà¸šัตร';

    sheet.getRange(5, 1, 1, 15).setValues([row5]);

    return sheet;

  }

  

  // 2. Private Sheets (e.g., "à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล", "à¹€ดà¸µà¹ˆยว ม.1")

  if (sheetName.indexOf('à¹€ดà¸µà¹ˆยว ') === 0) {

    sheet = db.insertSheet(sheetName);

    sheet.clear();

    const headers = ['à¸Šืà¹ˆอ', 'à¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุล', 'à¸Šืà¹ˆอà¹€ลà¹ˆน', 'à¹‚รงà¹€รà¸µยน', 'คอรà¹Œà¸ª', 'à¹€à¸šอรà¹Œติดตà¹ˆอ', 'à¹€à¸šอรà¹Œà¸œà¸¹à¹‰ปà¸�ครอง/à¹€à¸šอรà¹Œติดตà¹ˆอ', 'ID LINE', 'à¸ªà¸²ขà¸²à¹€รà¸µยน(à¸ªà¸²ขà¸²)', 'à¸ªà¸²ขà¸²à¹€งิน(à¸ªà¸²ขà¸²)', 'รอà¸šà¹€รà¸µยน', 'หมà¸²ยà¹€หตุ', 'à¹€รà¸µยนà¸ˆริง(รอà¸š)', 'à¹€รà¸µยน', 'à¸ˆà¹ˆà¸²ย', 'คงà¹€หลือ', 'วันทà¸µà¹ˆรัà¸šà¹€งิน', 'à¸Šà¹ˆองทà¸²งà¸�à¸²รรัà¸šà¹€งิน', 'à¸œà¸¹à¹‰รัà¸šà¹€งิน', 'à¹ƒà¸šà¹€à¸ªรà¹‡à¸ˆ', 'ตรวà¸ˆà¸ªอà¸š'];

    sheet.getRange(11, 1, 1, 21).setValues([headers]);

    return sheet;

  }

  

  // 3. Subgroup Sheets (e.g., "à¸�ลุà¹ˆม 2-3", "à¸�ลุà¹ˆม 4-5")

  if (sheetName.indexOf('à¸�ลุà¹ˆม ') === 0) {

    sheet = db.insertSheet(sheetName);

    sheet.clear();

    const headers = ['à¸Šืà¹ˆอ', 'à¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุล', 'à¸Šืà¹ˆอà¹€ลà¹ˆน', 'à¹‚รงà¹€รà¸µยน', 'คอรà¹Œà¸ª', 'à¹€à¸šอรà¹Œติดตà¹ˆอ', 'à¹€à¸šอรà¹Œà¸œà¸¹à¹‰ปà¸�ครอง/à¹€à¸šอรà¹Œติดตà¹ˆอ', 'ID LINE', 'à¸ªà¸²ขà¸²à¹€รà¸µยน(à¸ªà¸²ขà¸²)', 'à¸ªà¸²ขà¸²à¹€งิน(à¸ªà¸²ขà¸²)', 'รอà¸šà¹€รà¸µยน', 'หมà¸²ยà¹€หตุ', 'à¹€รà¸µยนà¸ˆริง(รอà¸š)', 'à¹€รà¸µยน', 'à¸ˆà¹ˆà¸²ย', 'คงà¹€หลือ', 'วันทà¸µà¹ˆรัà¸šà¹€งิน', 'à¸Šà¹ˆองทà¸²งà¸�à¸²รรัà¸šà¹€งิน', 'à¸œà¸¹à¹‰รัà¸šà¹€งิน', 'à¹ƒà¸šà¹€à¸ªรà¹‡à¸ˆ', 'ตรวà¸ˆà¸ªอà¸š'];

    sheet.getRange(11, 1, 1, 21).setValues([headers]);

    return sheet;

  }

  

  // 4. ตรวà¸ˆà¸ªอà¸šà¸ˆà¸²à¸� SHEET_REGISTRY (fallback à¸ªà¸³หรัà¸šà¸Šà¸µตทà¸µà¹ˆลงทะà¹€à¸šà¸µยนà¹„วà¹‰)

  const regDef = getRegistryDef(sheetName);

  if (regDef) {

    sheet = db.insertSheet(sheetName);

    const hRow = regDef.headerRow || 1;

    sheet.getRange(hRow, 1, 1, regDef.headers.length).setValues([regDef.headers]);

    if (regDef.defaultData && regDef.defaultData.length > 0) {

      sheet.getRange(hRow + 1, 1, regDef.defaultData.length, regDef.defaultData[0].length)

        .setValues(regDef.defaultData);

    }

    Logger.log('âœ… Auto-created registered sheet: ' + sheetName);

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

  if (str.indexOf('1899') !== -1 || str.indexOf('1900') !== -1 || str.indexOf('à¹€วลà¸²อินà¹‚ดà¸ˆà¸µน') !== -1) {

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

  if (str.indexOf('1899') !== -1 || str.indexOf('1900') !== -1 || str.indexOf('à¹€วลà¸²อินà¹‚ดà¸ˆà¸µน') !== -1) {

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

      const idxOrange = headersStr.indexOf('à¹�à¸ªด');

      if (idxOrange !== -1) {

        learnSheet.deleteColumn(idxOrange + 1);

        Logger.log('Deleted column "à¹�à¸ªด" at index ' + (idxOrange + 1));

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

    defaultRooms.push(['à¸ªà¸²ขà¸²1', 'ออนà¹„ลนà¹Œ à¸ªà¸²ขà¸²1', 'IPAD 001', 'Zoom 001']);

    for (let i = 1; i <= 10; i++) {

      if (i === 5) {

        for (let j = 1; j <= 6; j++) {

          defaultRooms.push(['à¸ªà¸²ขà¸²1', `หà¹‰อง 05/${j}`, `IPAD 005`, `Zoom 005`]);

        }

      } else {

        const pad = i < 10 ? '0' + i : i;

        defaultRooms.push(['à¸ªà¸²ขà¸²1', `หà¹‰อง ${pad}`, `IPAD 0${pad}`, `Zoom 0${pad}`]);

      }

    }

    

    // Branch 2

    defaultRooms.push(['à¸ªà¸²ขà¸²2', 'ออนà¹„ลนà¹Œ à¸ªà¸²ขà¸²2', 'IPAD 020', 'Zoom 020']);

    defaultRooms.push(['à¸ªà¸²ขà¸²2', 'หà¹‰อง à¹€อนà¸�ประà¸ªงคà¹Œ', 'IPAD 021', 'Zoom 021']);

    const b2Rooms = [1,2,3,4,5,6,7,8,9,21,22,23,24,25,26,31,32,33,34,35,36,41,42,43,44,45,52,53];

    b2Rooms.forEach(r => {

      const pad = r < 10 ? '0' + r : r;

      defaultRooms.push(['à¸ªà¸²ขà¸²2', `หà¹‰อง ${pad}`, `IPAD 0${pad}`, `Zoom 0${pad}`]);

    });

    

    // Branch 3

    defaultRooms.push(['à¸ªà¸²ขà¸²3', 'ออนà¹„ลนà¹Œ à¸ªà¸²ขà¸²3', 'IPAD 030', 'Zoom 030']);

    const b3Rooms = ['01', '02', '03', '04', '21', '30', '31', '32/1', '32/2', '32/3', '32/4', '33', '34', '40', '41', '42', '43', '44', '50'];

    b3Rooms.forEach(r => {

      defaultRooms.push(['à¸ªà¸²ขà¸²3', `หà¹‰อง ${r}`, `IPAD 0${r.replace('/', '')}`, `Zoom 0${r.replace('/', '')}`]);

    });

    

    sheet.getRange(2, 1, defaultRooms.length, 4).setValues(defaultRooms);

  }

}

function initAllDatabases() {

  const db = getDb();

  

  // ========================================

  // ขัà¹‰นตอนทà¸µà¹ˆ 1: à¸ªรà¹‰à¸²งà¸Šà¸µตà¸ˆà¸²à¸� SHEET_REGISTRY อัตà¹‚นมัติ

  // (à¸Šà¸µตà¹ƒหมà¹ˆทà¸µà¹ˆà¹€à¸žิà¹ˆมà¹ƒน registry à¸ˆะถà¸¹à¸�à¸ªรà¹‰à¸²งทà¸µà¹ˆนà¸µà¹ˆ)

  // ========================================

  const newCount = ensureAllRegisteredSheets();

  if (newCount > 0) {

    Logger.log('initAllDatabases: auto-created ' + newCount + ' new sheets from registry');

  }

  

  // ========================================

  // ขัà¹‰นตอนทà¸µà¹ˆ 2: à¹€ติมขà¹‰อมà¸¹ลà¹€ริà¹ˆมตà¹‰นà¸žิà¹€ศษ (ทà¸µà¹ˆà¹„มà¹ˆà¹„ดà¹‰อยà¸¹à¹ˆà¹ƒน registry)

  // ========================================

  

  // 2a. RoomsDB — à¹€ติมหà¹‰องà¹€รà¸µยนà¹€ริà¹ˆมตà¹‰น

  initRoomsDatabase();

  

  // 2b. TeachersDB — seed ครà¸¹à¸ˆà¸²à¸� DATA General (ถà¹‰à¸²ยังวà¹ˆà¸²ง)

  try {

    const teachersSheet = db.getSheetByName('TeachersDB');

    if (teachersSheet && teachersSheet.getLastRow() < 2) {

      const rawData = getSheetRows('DATA General');

      const teachers = [];

      rawData.forEach((row, idx) => {

        if (idx === 0) return;

        if (row[0]) teachers.push(row[0].toString().trim());

      });

      const uniqueTeachers = [...new Set(teachers)].sort();

      uniqueTeachers.forEach(t => {

        teachersSheet.appendRow([t, '', '', '', '', '', '', '', '']);

      });

    }

  } catch (e) {

    // ignore seed error

  }

  

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

  // ขัà¹‰นตอนทà¸µà¹ˆ 3: à¸ªรà¹‰à¸²งà¸Šà¸µตระดัà¸šà¸Šัà¹‰น/à¹€ดà¸µà¹ˆยว/ยà¹ˆอย

  // ========================================

  initAllGradeSheets();

  

  // ========================================

  // ขัà¹‰นตอนทà¸µà¹ˆ 4: Run database migrations

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

function isTeacherUser(username, nickname) {

  const cleanUsername = (username || '').toString().trim().toLowerCase();

  const cleanNickname = (nickname || '').toString().trim().toLowerCase();

  if (cleanUsername.includes('ครà¸¹') || cleanNickname.includes('ครà¸¹') || cleanUsername.startsWith('tutor_')) {

    return true;

  }

  return isUserTeacher(username, nickname);

}

function checkTeacherBlock(logUser) {

  if (logUser && isTeacherUser(logUser)) {

    throw new Error('คุณà¹„มà¹ˆมà¸µà¸ªิทธิà¹Œทà¸³รà¸²ยà¸�à¸²รนà¸µà¹‰à¹€นืà¹ˆองà¸ˆà¸²à¸�ลà¹‡อà¸�อินดà¹‰วยà¸šัà¸�à¸Šà¸µà¸ªิทธิà¹Œครà¸¹à¸œà¸¹à¹‰à¸ªอน');

  }

}

function isUserTeacher(username, nickname) {

  try {

    const cacheKey = 'teachers_list';

    let rows = getCacheObject(cacheKey);

    

    if (!rows) {

      const db = getDb();

      const sheet = db.getSheetByName('TeachersDB');

      if (!sheet) return false;

      rows = sheet.getDataRange().getValues();

      setCacheObject(cacheKey, rows, 1800);

    }

    

    const cleanUsername = (username || '').toString().trim().toLowerCase();

    const cleanNickname = (nickname || '').toString().trim().toLowerCase();

    

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0]) {

        const val = rows[i][0].toString().trim().toLowerCase();

        const tid = rows[i][8] ? rows[i][8].toString().trim().toLowerCase() : '';

        if (val && (val === cleanUsername || val === cleanNickname || (tid !== '' && tid === cleanUsername))) {

          return true;

        }

      }

    }

  } catch (e) {

    Logger.log('Error in isUserTeacher: ' + e.message);

  }

  return false;

}

function verifyLogin(username, password) {

  // initAllDatabases(); // Removed redundant call for speed

  const db = getDb();

  const cleanUsername = username ? username.toString().trim() : '';

  const cleanUsernameLower = cleanUsername.toLowerCase();

  

  const cleanPassword = password ? password.toString().trim() : '';

  if (!cleanUsername || !cleanPassword) {

    return { success: false, error: 'à¸�รุณà¸²à¸�รอà¸�à¸Šืà¹ˆอà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰งà¸²นà¹�ละรหัà¸ªà¸œà¹ˆà¸²น' };

  }

  

  const cacheKey = 'users_list';

  let rows = getCacheObject(cacheKey);

  if (!rows) {

    const sheet = db.getSheetByName('UsersDB');

    if (!sheet) {

      return { success: false, error: 'à¹„มà¹ˆà¸žà¸šตà¸²รà¸²งà¸�à¸²นขà¹‰อมà¸¹ลà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰งà¸²น UsersDB' };

    }

    ensureUsersDBHeaders(sheet);

    rows = sheet.getDataRange().getValues();

    setCacheObject(cacheKey, rows, 1800); // 30 minutes cache

  }

  

  for (let i = 1; i < rows.length; i++) {

    if (rows[i][0] && rows[i][1]) {

      const dbUsername = rows[i][0].toString().trim().toLowerCase();

      const dbPassword = rows[i][1].toString().trim();

      

      if (dbUsername === cleanUsernameLower && dbPassword === cleanPassword) {

        let role = rows[i][2] ? rows[i][2].toString().trim() : 'Staff';

        const nickname = rows[i][3] ? rows[i][3].toString().trim() : '';

        const profilePic = rows[i][6] ? rows[i][6].toString().trim() : '';

        

        // ถà¹‰à¸²à¸Šืà¹ˆอ user (username หรือ nickname) ตรงà¸�ัà¸šà¸�à¸²นขà¹‰อมà¸¹ล TeachersDB คอลัมนà¹Œ A หรือมà¸µคà¸³วà¹ˆà¸² "ครà¸¹" à¹ƒหà¹‰à¸ˆà¸³à¸�ัดà¸ªิทธิà¹Œà¹€ปà¹‡นครà¸¹à¸œà¸¹à¹‰à¸ªอนทันทà¸µ

        if (isTeacherUser(dbUsername, nickname)) {

          role = 'Teacher';

        }

        

        logActivity(rows[i][0].toString().trim(), 'เข้าสู่ระบบ', 'เจ้าหน้าที่เข้าใช้ระบบสำเร็จ' + (role === 'Teacher' ? ' (จำกัดสิทธิ์ครูผู้สอน)' : ''));

        return { 

          success: true, 

          user: { 

            username: rows[i][0].toString().trim(), 

            role: role,

            nickname: nickname,

            profilePic: profilePic

          } 

        };

      }

    }

  }

  return { success: false, error: 'à¸Šืà¹ˆอà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰งà¸²นหรือรหัà¸ªà¸œà¹ˆà¸²นà¹„มà¹ˆถà¸¹à¸�ตà¹‰อง' };

}

function changePassword(username, newPassword, logUser) {

  if (logUser && isTeacherUser(logUser) && logUser !== username) {

    throw new Error('คุณà¹„มà¹ˆมà¸µà¸ªิทธิà¹Œà¹€ปลà¸µà¹ˆยนรหัà¸ªà¸œà¹ˆà¸²นà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰อืà¹ˆน');

  }

  const db = getDb();

  const sheet = db.getSheetByName('UsersDB');

  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {

    if (rows[i][0].toString().trim() === username) {

      sheet.getRange(i + 1, 2).setValue(newPassword);

      logActivity(logUser, 'à¹€ปลà¸µà¹ˆยนรหัà¸ªà¸œà¹ˆà¸²น', `à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰: ${username} à¹€ปลà¸µà¹ˆยนรหัà¸ªà¸œà¹ˆà¸²นà¹ƒหมà¹ˆ`);

      return { success: true };

    }

  }

  return { success: false, error: 'à¹„มà¹ˆà¸žà¸šà¸Šืà¹ˆอà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰งà¸²นนà¸µà¹‰' };

}

function getUserProfile(username) {

  const db = getDb();

  const cleanUsername = username ? username.toString().trim() : '';

  const cleanUsernameLower = cleanUsername.toLowerCase();

  

  // 1. Find user in UsersDB first to determine role and get nickname

  const sheet = db.getSheetByName('UsersDB');

  if (!sheet) {

    return { success: false, error: 'à¹„มà¹ˆà¸žà¸šตà¸²รà¸²ง UsersDB' };

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

  

  // If not found in UsersDB, check if it's a teacher nickname in TeachersDB (legacy or direct)

  let role = 'Staff';

  let nickname = '';

  let fullName = '';

  let phone = '';

  let profilePic = '';

  let bank = '';

  let accountNumber = '';

  

  if (userRow) {

    role = userRow[2] ? userRow[2].toString().trim() : 'Staff';

    nickname = userRow[3] ? userRow[3].toString().trim() : '';

    fullName = userRow[4] ? userRow[4].toString().trim() : '';

    phone = userRow[5] ? userRow[5].toString().trim() : '';

    profilePic = userRow[6] ? userRow[6].toString().trim() : '';

    

    if (isTeacherUser(userRow[0].toString().trim(), nickname)) {

      role = 'Teacher';

    }

  } else {

    // Check if cleanUsername corresponds to a teacher nickname in TeachersDB

    const teachersSheet = db.getSheetByName('TeachersDB');

    if (teachersSheet) {

      const tRows = teachersSheet.getDataRange().getValues();

      for (let i = 1; i < tRows.length; i++) {

        if (tRows[i][0]) {

          const tNick = tRows[i][0].toString().trim();

          if (tNick.toLowerCase() === cleanUsernameLower) {

            role = 'Teacher';

            nickname = tNick;

            fullName = tRows[i][1] ? tRows[i][1].toString().trim() : '';

            phone = tRows[i][3] ? tRows[i][3].toString().trim() : '';

            bank = tRows[i][5] ? tRows[i][5].toString().trim() : '';

            accountNumber = tRows[i][6] ? tRows[i][6].toString().trim() : '';

            const tId = tRows[i][8] ? tRows[i][8].toString().trim() : tNick;

            return {

              success: true,

              profile: {

                username: tId,

                role: 'Teacher',

                nickname: nickname,

                fullName: fullName,

                phone: phone,

                profilePic: '',

                bank: bank,

                accountNumber: accountNumber

              }

            };

          }

        }

      }

    }

    return { success: false, error: 'à¹„มà¹ˆà¸žà¸šขà¹‰อมà¸¹ลà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰งà¸²น' };

  }

  

  // 2. If role is Teacher, enrich profile details from TeachersDB using Username (TeacherID) or Nickname

  if (role === 'Teacher') {

    const teachersSheet = db.getSheetByName('TeachersDB');

    if (teachersSheet) {

      const tRows = teachersSheet.getDataRange().getValues();

      for (let i = 1; i < tRows.length; i++) {

        if (tRows[i][0]) {

          const tNick = tRows[i][0].toString().trim();

          const tId = tRows[i][8] ? tRows[i][8].toString().trim() : '';

          

          const matchById = tId && tId.toLowerCase() === cleanUsernameLower;

          const matchByNick = nickname && tNick.toLowerCase() === nickname.toLowerCase();

          

          if (matchById || matchByNick) {

            nickname = tNick;

            fullName = tRows[i][1] ? tRows[i][1].toString().trim() : fullName;

            phone = tRows[i][3] ? tRows[i][3].toString().trim() : phone;

            bank = tRows[i][5] ? tRows[i][5].toString().trim() : '';

            accountNumber = tRows[i][6] ? tRows[i][6].toString().trim() : '';

            userRow[0] = tId || tNick; // Override the username with real Teacher ID

            break;

          }

        }

      }

    }

  }

  

  return {

    success: true,

    profile: {

      username: userRow[0].toString().trim(),

      role: role,

      nickname: nickname,

      fullName: fullName,

      phone: phone,

      profilePic: profilePic,

      bank: bank,

      accountNumber: accountNumber

    }

  };

}

function saveUserProfile(username, data, logUser) {

  if (logUser && isTeacherUser(logUser) && logUser !== username) {

    throw new Error('คุณà¹„มà¹ˆมà¸µà¸ªิทธิà¹Œà¹�à¸�à¹‰à¹„ขประวัติà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰อืà¹ˆน');

  }

  const db = getDb();

  const sheet = db.getSheetByName('UsersDB');

  if (!sheet) {

    return { success: false, error: 'à¹„มà¹ˆà¸žà¸šตà¸²รà¸²ง UsersDB' };

  }

  

  ensureUsersDBHeaders(sheet);

  const rows = sheet.getDataRange().getValues();

  const cleanUsername = username ? username.toString().trim().toLowerCase() : '';

  

  for (let i = 1; i < rows.length; i++) {

    if (rows[i][0]) {

      const dbUsername = rows[i][0].toString().trim().toLowerCase();

      if (dbUsername === cleanUsername) {

        sheet.getRange(i + 1, 4).setValue(data.nickname || '');

        sheet.getRange(i + 1, 5).setValue(data.fullName || '');

        sheet.getRange(i + 1, 6).setValue(data.phone || '');

        if (data.profilePic !== undefined) {

          sheet.getRange(i + 1, 7).setValue(data.profilePic || '');

        }

        logActivity(logUser, 'à¹�à¸�à¹‰à¹„ขà¹‚ปรà¹„à¸Ÿลà¹Œ', `à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰: ${username} à¹�à¸�à¹‰à¹„ขขà¹‰อมà¸¹ลà¹‚ปรà¹„à¸Ÿลà¹Œของตนà¹€อง`);

        return { success: true };

      }

    }

  }

  return { success: false, error: 'à¹„มà¹ˆà¸žà¸šà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰ทà¸µà¹ˆตà¹‰องà¸�à¸²รà¸šันทึà¸�' };

}

function addEmployee(data, logUser) {

  try {

    if (!data || !data.username || !data.password) {

      return { success: false, error: 'à¸�รุณà¸²à¸�รอà¸�à¸Šืà¹ˆอà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¹�ละรหัà¸ªà¸œà¹ˆà¸²น' };

    }

    const db = getDb();

    const sheet = db.getSheetByName('UsersDB');

    if (!sheet) {

      return { success: false, error: 'à¹„มà¹ˆà¸žà¸šตà¸²รà¸²ง UsersDB' };

    }

    ensureUsersDBHeaders(sheet);

    const rows = sheet.getDataRange().getValues();

    const cleanUsername = data.username.toString().trim().toLowerCase();

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === cleanUsername) {

        return { success: false, error: 'à¸Šืà¹ˆอà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰นà¸µà¹‰มà¸µอยà¸¹à¹ˆà¹ƒนระà¸šà¸šà¹�ลà¹‰ว' };

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

    logActivity(logUser, 'à¹€à¸žิà¹ˆมà¸žนัà¸�งà¸²น', `à¹€à¸žิà¹ˆมà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¹ƒหมà¹ˆ: ${data.username} à¸šทà¸šà¸²ท: ${data.role || 'Staff'}`);

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message || 'à¹€à¸�ิดขà¹‰อà¸œิดà¸žลà¸²ดทà¸µà¹ˆà¹„มà¹ˆทรà¸²à¸šà¸ªà¸²à¹€หตุ' };

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

    return { success: false, error: 'à¹„มà¹ˆà¸žà¸šตà¸²รà¸²ง UsersDB' };

  }

  

  const rows = sheet.getDataRange().getValues();

  const cleanUsername = username ? username.toString().trim().toLowerCase() : '';

  

  for (let i = 1; i < rows.length; i++) {

    if (rows[i][0]) {

      const dbUsername = rows[i][0].toString().trim().toLowerCase();

      const dbPassword = rows[i][1].toString().trim();

      

      if (dbUsername === cleanUsername) {

        if (dbPassword !== currentPassword.toString().trim()) {

          return { success: false, error: 'รหัà¸ªà¸œà¹ˆà¸²นปัà¸ˆà¸ˆุà¸šันà¹„มà¹ˆถà¸¹à¸�ตà¹‰อง' };

        }

        sheet.getRange(i + 1, 2).setValue(newPassword.toString().trim());

        logActivity(username, 'à¹€ปลà¸µà¹ˆยนรหัà¸ªà¸œà¹ˆà¸²นà¹€อง', `à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰: ${username} à¹€ปลà¸µà¹ˆยนรหัà¸ªà¸œà¹ˆà¸²นของตนà¹€องà¸ªà¸³à¹€รà¹‡à¸ˆ`);

        return { success: true };

      }

    }

  }

  return { success: false, error: 'à¹„มà¹ˆà¸žà¸šขà¹‰อมà¸¹ลà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰งà¸²น' };

}

function changeEmployeePasswordByAdmin(username, newPassword, logUser) {

  try {

    const db = getDb();

    const sheet = db.getSheetByName('UsersDB');

    if (!sheet) {

      return { success: false, error: 'à¹„มà¹ˆà¸žà¸šตà¸²รà¸²ง UsersDB' };

    }

    const rows = sheet.getDataRange().getValues();

    const cleanUsername = username ? username.toString().trim().toLowerCase() : '';

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0]) {

        const dbUsername = rows[i][0].toString().trim().toLowerCase();

        if (dbUsername === cleanUsername) {

          sheet.getRange(i + 1, 2).setValue(newPassword.toString().trim());

          clearCacheObject('usersdb_raw');

          logActivity(logUser, 'à¹�à¸�à¹‰à¹„ขรหัà¸ªà¸œà¹ˆà¸²นà¸žนัà¸�งà¸²น', `à¹€ปลà¸µà¹ˆยนรหัà¸ªà¸œà¹ˆà¸²นà¸žนัà¸�งà¸²นà¹ƒหà¹‰à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰: ${username}`);

          return { success: true };

        }

      }

    }

    return { success: false, error: 'à¹„มà¹ˆà¸žà¸šà¸žนัà¸�งà¸²นà¹ƒนระà¸šà¸š' };

  } catch (e) {

    return { success: false, error: e.message || 'à¹€à¸�ิดขà¹‰อà¸œิดà¸žลà¸²ดà¹ƒนà¸�à¸²รà¹�à¸�à¹‰à¹„ขรหัà¸ªà¸œà¹ˆà¸²น' };

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

  const required = ['Username', 'Password', 'Role', 'Nickname', 'FullName', 'Phone', 'ProfilePic'];

  

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

  // 1. Check TeachersDB (matching TeacherID first, then Nickname)

  const teachersSheet = db.getSheetByName('TeachersDB');

  if (teachersSheet) {

    const teachersRows = teachersSheet.getDataRange().getValues();

    // Try matching TeacherID (index 8)

    for (let i = 1; i < teachersRows.length; i++) {

      const tId = teachersRows[i][8] ? teachersRows[i][8].toString().trim() : '';

      if (tId && tId.toLowerCase() === cleanUserLower) {

        const tNick = teachersRows[i][0] ? teachersRows[i][0].toString().trim() : '';

        if (tNick) return tNick;

      }

    }

    // Try matching Nickname (index 0)

    for (let i = 1; i < teachersRows.length; i++) {

      const tNick = teachersRows[i][0] ? teachersRows[i][0].toString().trim() : '';

      if (tNick && tNick.toLowerCase() === cleanUserLower) {

        return tNick;

      }

    }

  }

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

    const teachersMap = {};

    const teachersSheet = db.getSheetByName('TeachersDB');

    if (teachersSheet) {

      const teachersRows = teachersSheet.getDataRange().getValues();

      for (let i = 1; i < teachersRows.length; i++) {

        const tNick = teachersRows[i][0] ? teachersRows[i][0].toString().trim() : '';

        const tId = teachersRows[i][8] ? teachersRows[i][8].toString().trim() : '';

        if (tId) {

          teachersMap[tId.toLowerCase()] = tNick;

        }

        if (tNick) {

          teachersMap[tNick.toLowerCase()] = tNick;

        }

      }

    }

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

    logActivity(logUser, 'ตัà¹‰งคà¹ˆà¸²หà¹‰องà¹€รà¸µยน', `หà¹‰อง: ${roomName} (iPad: ${ipad}, Zoom: ${zoom})`);

    

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

      logActivity(logUser, 'ลà¸šหà¹‰องà¹€รà¸µยน', `à¸ªà¸²ขà¸²: ${branch} หà¹‰อง: ${roomName}`);

      clearCacheObject('rooms_list');

      return { success: true };

    }

    return { success: false, error: 'à¹„มà¹ˆà¸žà¸šหà¹‰องà¹€รà¸µยนทà¸µà¹ˆตà¹‰องà¸�à¸²รลà¸š' };

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

  // ครà¸¹à¸ªà¸²มà¸²รถดà¸¹ตà¸²รà¸²งà¹€รà¸µยนรà¸²ยหà¹‰องà¹€รà¸µยนรà¸²ยวันà¹„ดà¹‰

  try {

    const rooms = getRoomsList();

    const classes = getClassLogs(dateStr);

    

    // Determine dayOfWeek from dateStr (DD/MM/YYYY or YYYY-MM-DD)

    let thaiDay = '';

    try {

      const thaiDayNames = ['วันอà¸²ทิตยà¹Œ','วันà¸ˆันทรà¹Œ','วันอังคà¸²ร','วันà¸žุธ','วันà¸žฤหัà¸ªà¸šดà¸µ','วันศุà¸�รà¹Œ','วันà¹€à¸ªà¸²รà¹Œ'];

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

    

    // DEBUG: Get first grade sheet headers

    let debugHeaders = {};

    const gradeSheet = getDb().getSheetByName('ป.5/1');

    if (gradeSheet) {

      debugHeaders = {

        name: gradeSheet.getName(),

        h1: gradeSheet.getRange(1, 1, 1, 30).getValues()[0].slice(14, 25), // columns 15+

        h3: gradeSheet.getRange(3, 1, 1, 30).getValues()[0].slice(14, 25)

      };

    }

    

    return {

      rooms: rooms,

      classes: classes,

      enrollments: enrollments,

      thaiDay: thaiDay,

      debug: debugHeaders

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

    

    const shortDayMap = { 'อà¸²ทิตยà¹Œ': 'อà¸².', 'à¸ˆันทรà¹Œ': 'à¸ˆ.', 'อังคà¸²ร': 'อ.', 'à¸žุธ': 'à¸ž.', 'à¸žฤหัà¸ªà¸šดà¸µ': 'à¸žฤ.', 'ศุà¸�รà¹Œ': 'ศ.', 'à¹€à¸ªà¸²รà¹Œ': 'à¸ª.' };

    let cleanDay = '';

    const days = ['อà¸²ทิตยà¹Œ', 'à¸ˆันทรà¹Œ', 'อังคà¸²ร', 'à¸žุธ', 'à¸žฤหัà¸ªà¸šดà¸µ', 'ศุà¸�รà¹Œ', 'à¹€à¸ªà¸²รà¹Œ', 'อà¸².', 'à¸ˆ.', 'อ.', 'à¸ž.', 'à¸žฤ.', 'ศ.', 'à¸ª.'];

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

// getCourseEnrollmentCounts: นัà¸šà¸ˆà¸³นวน นร. à¸ˆà¸²à¸�ตà¸²รà¸²งหà¹‰องà¹€รà¸µยนตà¸²มà¸Šืà¹ˆอคอรà¹Œà¸ª+วัน

function getCourseEnrollmentCounts(courseNames, classInfoList) {

  try {

    const db = getDb();

    const sheets = db.getSheets();

    const counts = {};

    courseNames.forEach(c => { counts[c] = []; });

    

    const gradeSheetNames = [];

    sheets.forEach(sheet => {

      const name = sheet.getName();

      if (name.match(/^(ป\.|ม\.|อนุà¸šà¸²ล)/) || name.match(/^(ยà¹ˆอย 2-3|ยà¹ˆอย 4-5|ยà¹ˆอย 6-10)/)) {

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

          const shortDayMap = { 'อà¸²ทิตยà¹Œ': 'อà¸².', 'à¸ˆันทรà¹Œ': 'à¸ˆ.', 'อังคà¸²ร': 'อ.', 'à¸žุธ': 'à¸ž.', 'à¸žฤหัà¸ªà¸šดà¸µ': 'à¸žฤ.', 'ศุà¸�รà¹Œ': 'ศ.', 'à¹€à¸ªà¸²รà¹Œ': 'à¸ª.' };

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

    logActivity(logUser || 'System', 'ลà¸šตà¸²รà¸²งà¹€รà¸µยนทัà¹‰งหมด', 'ลà¹‰à¸²งขà¹‰อมà¸¹ลตà¸²รà¸²งà¹€รà¸µยนรà¸²ยหà¹‰องà¹€รà¸µยนรà¸²ยวันà¹€à¸žืà¹ˆอà¹€ริà¹ˆมงà¸²น');

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

      const teachersSheet = db.getSheetByName('TeachersDB');

      if (teachersSheet) {

        const tRows = teachersSheet.getDataRange().getValues();

        for (let j = 1; j < tRows.length; j++) {

          const tNick = tRows[j][0] ? tRows[j][0].toString().trim().toLowerCase() : '';

          const tFullName = tRows[j][1] ? tRows[j][1].toString().trim().toLowerCase() : '';

          const tId = tRows[j][8] ? tRows[j][8].toString().trim() : '';

          

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

    logActivity(logUser || 'System', 'à¸ªà¹ˆงà¹ƒà¸šประà¹€มินนัà¸�à¹€รà¸µยน', `[${evalId}] ประà¹€มินนัà¸�à¹€รà¸µยน: ${data.studentName} (${data.nickname}) วิà¸Šà¸²: ${data.subject}`);

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

      return { success: false, error: 'à¹„มà¹ˆà¸žà¸šà¸�à¸²นขà¹‰อมà¸¹ล EvaluationsDB' };

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

      return { success: false, error: 'à¹„มà¹ˆà¸žà¸š ID à¸�à¸²รประà¹€มินà¹ƒนระà¸šà¸š' };

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

    

    logActivity(logUser, 'à¹�à¸�à¹‰à¹„ขà¹ƒà¸šประà¹€มิน', `อัปà¹€ดตà¸�à¸²รประà¹€มินนัà¸�à¹€รà¸µยน: ${rows[rowIndex-1][2]}`);

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

      

      const days = ['อà¸²ทิตยà¹Œ','à¸ˆันทรà¹Œ','อังคà¸²ร','à¸žุธ','à¸žฤหัà¸ªà¸šดà¸µ','ศุà¸�รà¹Œ','à¹€à¸ªà¸²รà¹Œ'];

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

        const teachersSheet = db.getSheetByName('TeachersDB');

        if (teachersSheet && teachersSheet.getLastRow() > 1) {

          const tRows = teachersSheet.getRange(2, 1, teachersSheet.getLastRow() - 1, 9).getValues();

          for (let j = 0; j < tRows.length; j++) {

            const tNick = (tRows[j][0] || '').toString().trim().toLowerCase();

            const tFullName = (tRows[j][1] || '').toString().trim().toLowerCase();

            const tId = (tRows[j][8] || '').toString().trim().toLowerCase();

            

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

 * getMonthlyGridData: ดึงขà¹‰อมà¸¹ลตà¸²รà¸²งà¹€รà¸µยนรà¸²ยà¹€ดือน à¹�ยà¸�ตà¸²มวันà¹ƒนà¸ªัปดà¸²หà¹Œ

 * @param {number} year - ปà¸µ ค.ศ. (à¹€à¸Šà¹ˆน 2026)

 * @param {number} month - à¹€ดือน 1-12

 * @param {number} dayOfWeek - วันà¹ƒนà¸ªัปดà¸²หà¹Œ 0=อà¸²ทิตยà¹Œ, 1=à¸ˆันทรà¹Œ ... 6=à¹€à¸ªà¸²รà¹Œ

 * @param {string} logUser - à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰งà¸²น

 */

function getMonthlyGridData(year, month, dayOfWeek, logUser) {

  // ครà¸¹à¸ªà¸²มà¸²รถดà¸¹ตà¸²รà¸²งà¹€รà¸µยนรà¸²ยหà¹‰องà¹€รà¸µยนรà¸²ยà¹€ดือนà¹„ดà¹‰

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

    const thaiDayNamesArr = ['วันอà¸²ทิตยà¹Œ','วันà¸ˆันทรà¹Œ','วันอังคà¸²ร','วันà¸žุธ','วันà¸žฤหัà¸ªà¸šดà¸µ','วันศุà¸�รà¹Œ','วันà¹€à¸ªà¸²รà¹Œ'];

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

      "ระยองวิทยà¸²คม", "อัà¸ªà¸ªัมà¸Šัà¸�ระยอง", "à¹€ซนตà¹Œà¹‚ยà¹€ซà¸Ÿระยอง", "วัดปà¹ˆà¸²ประดà¸¹à¹ˆ", "มัธยมตà¸²à¸�à¸ªินระยอง", "ระยองวิทยà¸²คมปà¸²à¸�นà¹‰à¸³", "à¸šà¹‰à¸²นคà¹ˆà¸²ย", "à¹�à¸�ลง \"วิทยà¸ªถà¸²วร\"", "à¸�à¸³à¹€นิดวิทยà¹Œ", "ระยองวิทยà¸²คม นิคมอุตà¸ªà¸²หà¸�รรม",

      "à¹€à¸šà¸�à¸ˆมรà¸²à¸Šà¸¹ทิศ à¸ˆันทà¸šุรà¸µ", "ศรà¸µยà¸²นุà¸ªรณà¹Œ", "à¸ªà¸²ธิตมหà¸²วิทยà¸²ลัยรà¸²à¸Šà¸ ัà¸�รà¸³à¹„à¸žà¸žรรณà¸µ", "ลà¸²ซà¸²ลà¸ˆันทà¸šุรà¸µ", "ประทà¸µปศึà¸�ษà¸²", "คิà¸Šà¸Œà¸�à¸¹à¸�วิทยà¸²", "ทà¹ˆà¸²à¹ƒหมà¹ˆ \"à¸žà¸¹ลà¸ªวัà¸ªดิà¹Œรà¸²ษà¸Žรà¹Œนุà¸�à¸¹ล\"",

      "à¸ªตรà¸µประà¹€à¸ªริà¸�ศิลปà¹Œ", "ตรà¸²ดà¸ªรรà¹€à¸ªริà¸�วิทยà¸²คม", "à¸žิทยà¸²นุà¸ªรณà¹Œตรà¸²ด", "คลองà¹ƒหà¸�à¹ˆวิทยà¸²คม", "ตรà¸²ษตระà¸�à¸²รคุณ",

      "à¸Šลรà¸²ษà¸Žรอà¸³รุง", "à¸Šลà¸�ันยà¸²นุà¸�à¸¹ล", "à¸ªà¸²ธิตà¸žิà¸šà¸¹ลà¸šà¸³à¹€à¸žà¹‡à¸� มหà¸²วิทยà¸²ลัยà¸šà¸¹รà¸žà¸²", "ดà¸²รà¸²à¸ªมุทร ศรà¸µรà¸²à¸Šà¸²", "อัà¸ªà¸ªัมà¸Šัà¸�ศรà¸µรà¸²à¸Šà¸²", "à¹€ซนตà¹Œปอลคอนà¹�วนตà¹Œ", "à¸žนัà¸ªà¸žิทยà¸²คà¸²ร", "à¸šà¸²งละมุง", "ศรà¸µรà¸²à¸Šà¸²", "à¸ˆุฬà¸²à¸ รณรà¸²à¸Šวิทยà¸²ลัย à¸Šลà¸šุรà¸µ", "à¸ªà¸²ธิตอุดมศึà¸�ษà¸²", "มà¸²รà¸µวิทยà¹Œ",

      "à¹€ตรà¸µยมอุดมศึà¸�ษà¸²", "à¸ªวนà¸�ุหลà¸²à¸šวิทยà¸²ลัย", "à¹€ทà¸žศิรินทรà¹Œ", "à¸ªà¸²มà¹€à¸ªนวิทยà¸²ลัย", "à¸ªตรà¸µวิทยà¸²", "à¸šดินทรà¹€ดà¸Šà¸² (à¸ªิงหà¹Œ à¸ªิงหà¹€à¸ªนà¸µ)", "หอวัง", "à¸ªà¸²ธิตมหà¸²วิทยà¸²ลัยศรà¸µนครินทรวิà¹‚รฒ ปทุมวัน", "à¸ªà¸²ธิตมหà¸²วิทยà¸²ลัยศรà¸µนครินทรวิà¹‚รฒ ประà¸ªà¸²นมิตร", "อัà¸ªà¸ªัมà¸Šัà¸�", "à¸�รุงà¹€ทà¸žคริà¸ªà¹€ตà¸µยนวิทยà¸²ลัย", "à¹€ซนตà¹Œคà¸²à¹€à¸šรà¸µยล", "มà¸²à¹�ตรà¹Œà¹€ดอà¸µวิทยà¸²ลัย", "วัฒนà¸²วิทยà¸²ลัย", "ศึà¸�ษà¸²นà¸²รà¸µ", "วัดà¸ªุทธิวรà¸²รà¸²ม", "à¸ªà¸²ยนà¹‰à¸³à¸œึà¹‰ง", "à¹€ตรà¸µยมอุดมศึà¸�ษà¸²à¸žัฒนà¸²à¸�à¸²ร", "à¹€ตรà¸µยมอุดมศึà¸�ษà¸²นà¹‰อมà¹€à¸�ลà¹‰à¸²", "à¸ªตรà¸µวิทยà¸² à¹’", "à¸ªà¸²ธิตมหà¸²วิทยà¸²ลัยรà¸²à¸Šà¸ ัà¸�à¸ªวนà¸ªุนันทà¸²", "à¸ªà¸²ธิตà¸ˆุฬà¸²ลงà¸�รณà¹Œมหà¸²วิทยà¸²ลัย",

      "à¸ªวนà¸�ุหลà¸²à¸šวิทยà¸²ลัย นนทà¸šุรà¸µ", "à¸ªตรà¸µนนทà¸šุรà¸µ", "หอวังนนทà¸šุรà¸µ", "à¹€à¸šà¸�à¸ˆมรà¸²à¸Šà¸²นุà¸ªรณà¹Œ", "รà¸²à¸Šวินิตนนทà¸šุรà¸µ", "à¹€ตรà¸µยมอุดมศึà¸�ษà¸²à¸žัฒนà¸²à¸�à¸²ร นนทà¸šุรà¸µ",

      "à¸ªตรà¸µà¸ªมุทรปรà¸²à¸�à¸²ร", "à¸ªมุทรปรà¸²à¸�à¸²ร", "รà¸²à¸Šวินิตà¸šà¸²งà¹�à¸�à¹‰ว", "มัธยมวัดดà¹ˆà¸²นà¸ªà¸³à¹‚รง", "à¸šà¸²งà¸žลà¸µรà¸²ษà¸Žรà¹Œà¸šà¸³รุง",

      "อัมà¸žวันวิทยà¸²ลัย", "ถà¸²วรà¸²นุà¸�à¸¹ล", "ศรัทธà¸²à¸ªมุทร",

      "à¸ªมุทรà¸ªà¸²ครà¸šà¸¹รณะ", "à¸ªมุทรà¸ªà¸²ครวิทยà¸²ลัย", "à¸�ระทุà¹ˆมà¹�à¸šน \"วิà¹€ศษà¸ªมุทคุณ\"",

      "คณะรà¸²ษà¸Žรà¹Œà¸šà¸³รุงปทุมธà¸²นà¸µ", "ปทุมวิà¹„ล", "à¸ªวนà¸�ุหลà¸²à¸šวิทยà¸²ลัย รังà¸ªิต", "à¸ªà¸²ธิตมหà¸²วิทยà¸²ลัยรà¸²à¸Šà¸ ัà¸�à¸žระนครศรà¸µอยุธยà¸²"

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

      "à¸�รุงà¹„ทย à¸žà¸µà¹ˆปิà¹Šà¸�",

      "à¸�รุงà¹€ทà¸ž à¸žà¸µà¹ˆปิà¹Šà¸�",

      "SCB à¸žà¸µà¹ˆปิà¹Šà¸�",

      "à¸�รุงศรà¸µ à¸žà¸µà¹ˆปิà¹Šà¸�",

      "TTB",

      "à¸�à¸ªิà¸�ร à¸žà¸µà¹ˆปิà¹Šà¸�",

      "SCB คุณยà¸²ย",

      "à¸�รุงศรà¸µ คุณตà¸²",

      "à¸�รุงศรà¸µ à¸šัà¸�à¸Šà¸µà¸šริษัท",

      "à¸�à¸ªิà¸�ร à¸šัà¸�à¸Šà¸µà¸šริษัท(à¸�ด)",

      "à¸�à¸ªิà¸�ร à¸šัà¸�à¸Šà¸µà¸šริษัท(à¸ªà¹�à¸�น)",

      "TTB à¸šัà¸�à¸Šà¸µà¸šริษัท(à¸�ด)",

      "TTB à¸šัà¸�à¸Šà¸µà¸šริษัท(à¸ªà¹�à¸�น)",

      "à¹€งินà¸ªด",

      "à¸žà¸µà¹ˆปิà¹Šà¸� à¹‚อน",

      "à¸žà¸µà¹ˆตà¹‰น à¹‚อน"

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

function getDashboardData(logUser) {

  if (logUser) checkTeacherBlock(logUser);

  try {

    const statusData = getSheetRows('StatusDB');

    

    let totalIncome = 0;

    let totalPaid = 0;

    let totalOutstanding = 0;

    

    const branchFin = {

      'à¸ªà¸²ขà¸²1': { full: 0, paid: 0, debt: 0 },

      'à¸ªà¸²ขà¸²2': { full: 0, paid: 0, debt: 0 },

      'à¸ªà¸²ขà¸²3': { full: 0, paid: 0, debt: 0 },

      'อืà¹ˆนà¹†': { full: 0, paid: 0, debt: 0 }

    };

    const roundFin = {};

    

    const currentYear = new Date().getFullYear();

    const monthlySummary = [];

    for (let i = 0; i < 12; i++) {

      monthlySummary.push({

        'à¸ªà¸²ขà¸²1': 0,

        'à¸ªà¸²ขà¸²2': 0,

        'à¸ªà¸²ขà¸²3': 0,

        'อืà¹ˆนà¹†': 0,

        'total': 0

      });

    }

    statusData.forEach((row, idx) => {

      if (idx === 0 && row[0] && row[0].toString().toLowerCase().includes('id')) return;

      const studentName = row[1] ? row[1].toString().trim() : '';

      if (!row[0] && !studentName) return;

      

      const paid = parseFloat(row[9]) || 0;

      const full = parseFloat(row[10]) || 0;

      const debt = full - paid;

      const branchRaw = row[5] ? row[5].toString().trim() : '';

      const branchPay = row[6] ? row[6].toString().trim() : '';

      const round = row[15] ? row[15].toString().trim() : 'ทัà¹ˆวà¹„ป';

      

      totalPaid += paid;

      totalIncome += full;

      totalOutstanding += debt;

      

      let branchKey = 'อืà¹ˆนà¹†';

      if (branchRaw.toLowerCase().includes('ออนà¹„ลนà¹Œ')) {

        if (branchPay.includes('à¸ªà¸²ขà¸²1')) branchKey = 'à¸ªà¸²ขà¸²1';

        else if (branchPay.includes('à¸ªà¸²ขà¸²2')) branchKey = 'à¸ªà¸²ขà¸²2';

        else if (branchPay.includes('à¸ªà¸²ขà¸²3')) branchKey = 'à¸ªà¸²ขà¸²3';

        else {

          if (branchRaw.includes('à¸ªà¸²ขà¸²1')) branchKey = 'à¸ªà¸²ขà¸²1';

          else if (branchRaw.includes('à¸ªà¸²ขà¸²2')) branchKey = 'à¸ªà¸²ขà¸²2';

          else if (branchRaw.includes('à¸ªà¸²ขà¸²3')) branchKey = 'à¸ªà¸²ขà¸²3';

          else branchKey = 'à¸ªà¸²ขà¸²1';

        }

      } else {

        if (branchRaw.includes('à¸ªà¸²ขà¸²1')) branchKey = 'à¸ªà¸²ขà¸²1';

        else if (branchRaw.includes('à¸ªà¸²ขà¸²2')) branchKey = 'à¸ªà¸²ขà¸²2';

        else if (branchRaw.includes('à¸ªà¸²ขà¸²3')) branchKey = 'à¸ªà¸²ขà¸²3';

        else branchKey = 'à¸ªà¸²ขà¸²1';

      }

      

      branchFin[branchKey].full += full;

      branchFin[branchKey].paid += paid;

      branchFin[branchKey].debt += debt;

      

      // Accumulate monthly paid revenue for current year

      const paymentDateStr = cleanSheetDate(row[12]);

      if (paymentDateStr) {

        const dateParts = paymentDateStr.split('/');

        if (dateParts.length === 3) {

          const m = parseInt(dateParts[1], 10);

          const y = parseInt(dateParts[2], 10);

          if (y === currentYear && m >= 1 && m <= 12) {

            monthlySummary[m - 1][branchKey] += paid;

            monthlySummary[m - 1]['total'] += paid;

          }

        }

      }

      

      if (round) {

        if (!roundFin[round]) {

          roundFin[round] = { full: 0, paid: 0, debt: 0 };

        }

        roundFin[round].full += full;

        roundFin[round].paid += paid;

        roundFin[round].debt += debt;

      }

    });

    return {

      totalIncome: totalIncome,

      totalPaid: totalPaid,

      totalOutstanding: totalOutstanding,

      branchFin: branchFin,

      roundFin: roundFin,

      monthlySummary: monthlySummary,

      currentYear: currentYear

    };

  } catch (err) {

    return { error: err.message };

  }

}

// ----------------------------------------------------

// PDF Dynamic Round Summary calculations (à¸ªรุป 2569)

// ----------------------------------------------------

// ----------------------------------------------------

// PDF Dynamic Round Summary calculations (à¸ªรุป 2569) - OPTIMIZED WITH GRID CACHE

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

      { name: 'อนุà¸šà¸²ล', privateSheet: 'à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล', groupPrefix: 'อนุà¸šà¸²ล' },

      { name: 'ป.1', privateSheet: 'à¹€ดà¸µà¹ˆยว ป.1', groupPrefix: 'ป.1' },

      { name: 'ป.2', privateSheet: 'à¹€ดà¸µà¹ˆยว ป.2', groupPrefix: 'ป.2' },

      { name: 'ป.3', privateSheet: 'à¹€ดà¸µà¹ˆยว ป.3', groupPrefix: 'ป.3' },

      { name: 'ป.4', privateSheet: 'à¹€ดà¸µà¹ˆยว ป.4', groupPrefix: 'ป.4' },

      { name: 'ป.5', privateSheet: 'à¹€ดà¸µà¹ˆยว ป.5', groupPrefix: 'ป.5' },

      { name: 'ป.6', privateSheet: 'à¹€ดà¸µà¹ˆยว ป.6', groupPrefix: 'ป.6' },

      { name: 'ม.1', privateSheet: 'à¹€ดà¸µà¹ˆยว ม.1', groupPrefix: 'ม.1' },

      { name: 'ม.2', privateSheet: 'à¹€ดà¸µà¹ˆยว ม.2', groupPrefix: 'ม.2' },

      { name: 'ม.3', privateSheet: 'à¹€ดà¸µà¹ˆยว ม.3', groupPrefix: 'ม.3' },

      { name: 'ม.4', privateSheet: 'à¹€ดà¸µà¹ˆยว ม.4', groupPrefix: 'ม.4' },

      { name: 'ม.5', privateSheet: 'à¹€ดà¸µà¹ˆยว ม.5', groupPrefix: 'ม.5' },

      { name: 'ม.6', privateSheet: 'à¹€ดà¸µà¹ˆยว ม.6', groupPrefix: 'ม.6' },

      { name: 'ยà¹ˆอย 2-3', privateSheet: 'ยà¹ˆอย 2-3', isSubgroup: true },

      { name: 'ยà¹ˆอย 4-5', privateSheet: 'ยà¹ˆอย 4-5', isSubgroup: true },

      { name: 'ยà¹ˆอย 6-10', privateSheet: 'ยà¹ˆอย 6-10', isSubgroup: true }

    ];

    

    const branches = [

      { name: 'à¸ªà¸²ขà¸²1', suffix: '/1', privatePaid: 'E3', privateDebt: 'E4', privateCount: 'A2', groupCell: 'B4', groupFull: 'B1', groupPaid: 'B3', groupDebt: 'B2', groupOverFive: 'C2' },

      { name: 'à¸ªà¸²ขà¸²2', suffix: '/2', privatePaid: 'F3', privateDebt: 'F4', privateCount: 'B2', groupCell: 'B4', groupFull: 'B1', groupPaid: 'B3', groupDebt: 'B2', groupOverFive: 'C2' },

      { name: 'à¸ªà¸²ขà¸²3', suffix: '/3', privatePaid: 'G3', privateDebt: 'G4', privateCount: 'C2', groupCell: 'B4', groupFull: 'B1', groupPaid: 'B3', groupDebt: 'B2', groupOverFive: 'C2' }

    ];

    

    grades.forEach(gradeObj => {

      branches.forEach(branchObj => {

        const key = gradeObj.name + '|' + branchObj.name;

        

        let singlePaidAmount = 0;

        let singleDebtAmount = 0;

        let singleAndSubgroupCount = 0;

        

        let regularGroupCount = 0;

        let groupFullAmount = 0;

        let groupPaidAmount = 0;

        let groupDebtAmount = 0;

        let overFiveCount = 0;

        

        // 1. Read from Private / Subgroup sheet — count from actual data rows

        const privSheet = db.getSheetByName(gradeObj.privateSheet);

        if (privSheet) {

          const privLastRow = privSheet.getLastRow();

          // Try summary cells for financial amounts (E3/F3/G3 etc.)

          const privGrid = getSheetGridValues(db, gradeObj.privateSheet);

          if (privGrid) {

            singlePaidAmount = getCellValueFromGrid(privGrid, branchObj.privatePaid);

            singleDebtAmount = getCellValueFromGrid(privGrid, branchObj.privateDebt);

          }

          

          // Count directly from data rows (row 12+)

          // col B (idx 1) = à¸Šืà¹ˆอ, col I (idx 8) = à¸ªà¸²ขà¸²ทà¸µà¹ˆà¹€รà¸µยน, col O (idx 14) = à¸Šà¸³ระà¹�ลà¹‰ว

          if (privLastRow >= 12) {

            const numRows = privLastRow - 11;

            const privData = privSheet.getRange(12, 1, numRows, 15).getValues();

            let countPriv = new Set();

            privData.forEach(row => {

              const name = row[1] ? row[1].toString().trim() : '';

              const branchLearn = row[8] ? row[8].toString().trim() : '';

              const paidStr = row[14] ? row[14].toString().trim().replace(/,/g, '') : '0';

              const paid = parseFloat(paidStr) || 0;

              if (!name) return;

              if (branchLearn === branchObj.name && paid > 0) {

                countPriv.add(name);

              }

            });

            singleAndSubgroupCount = countPriv.size;

          }

          

          if (gradeObj.isSubgroup && (gradeObj.name === 'ยà¹ˆอย 4-5' || gradeObj.name === 'ยà¹ˆอย 6-10')) {

            if (privGrid) {

              const a2Val = getCellValueFromGrid(privGrid, 'A2');

              const b2Val = getCellValueFromGrid(privGrid, 'B2');

              const c2Val = getCellValueFromGrid(privGrid, 'C2');

              overFiveCount = a2Val + b2Val + c2Val;

            }

          }

        }

        

        // 2. Read from Group sheet (ป.x/1, ป.x/2, ป.x/3) — count from actual data rows

        if (!gradeObj.isSubgroup) {

          const groupSheetName = gradeObj.groupPrefix + branchObj.suffix;

          const grpSheet = db.getSheetByName(groupSheetName);

          if (grpSheet) {

            // Financial amounts from summary cells

            const grpGrid = getSheetGridValues(db, groupSheetName);

            if (grpGrid) {

              groupFullAmount = getCellValueFromGrid(grpGrid, branchObj.groupFull);

              groupPaidAmount = getCellValueFromGrid(grpGrid, branchObj.groupPaid);

              groupDebtAmount = getCellValueFromGrid(grpGrid, branchObj.groupDebt);

              overFiveCount = getCellValueFromGrid(grpGrid, branchObj.groupOverFive);

            }

            

            const grpLastRow = grpSheet.getLastRow();

            if (grpLastRow >= 6) {

              const startDataRow = 6;

              const numRows = grpLastRow - startDataRow + 1;

              const nameData = grpSheet.getRange(startDataRow, 1, numRows, 15).getValues(); 

              let countGrp = new Set();

              nameData.forEach(row => {

                const name = row[1] ? row[1].toString().trim() : '';

                const paidStr = row[13] ? row[13].toString().trim().replace(/,/g, '') : '0';

                const paid = parseFloat(paidStr) || 0;

                if (name && paid > 0) {

                  countGrp.add(name);

                }

              });

              regularGroupCount = countGrp.size;

            }

          }

        }

        

        stats[key] = {

          grade: gradeObj.name,

          branch: branchObj.name,

          singlePaidAmount: singlePaidAmount,

          singleDebtAmount: singleDebtAmount,

          singleAndSubgroupCount: singleAndSubgroupCount,

          regularGroupCount: regularGroupCount,

          groupFullAmount: groupFullAmount,

          groupPaidAmount: groupPaidAmount,

          groupDebtAmount: groupDebtAmount,

          overFiveCount: overFiveCount,

          notes: []

        };

        

        categories.push({ grade: gradeObj.name, branch: branchObj.name });

      });

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

      if (lastCol < 16) return;

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

        if (lastCol >= 19) {

          const vals = sheet.getRange(1, 19, 1, lastCol - 18).getValues()[0];

          vals.forEach(val => {

            if (val) {

              const cName = val.toString().trim();

              if (cName) courses.push(cName);

            }

          });

        }

      }

    });

    

    // 2. Fetch courses from private and subgroup sheets (à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล, à¹€ดà¸µà¹ˆยว ป.x, ยà¹ˆอย x-x)

    const privateSheets = [

      "à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล", "à¹€ดà¸µà¹ˆยว ป.1", "à¹€ดà¸µà¹ˆยว ป.2", "à¹€ดà¸µà¹ˆยว ป.3", "à¹€ดà¸µà¹ˆยว ป.4", "à¹€ดà¸µà¹ˆยว ป.5", "à¹€ดà¸µà¹ˆยว ป.6",

      "à¹€ดà¸µà¹ˆยว ม.1", "à¹€ดà¸µà¹ˆยว ม.2", "à¹€ดà¸µà¹ˆยว ม.3", "à¹€ดà¸µà¹ˆยว ม.4", "à¹€ดà¸µà¹ˆยว ม.5", "à¹€ดà¸µà¹ˆยว ม.6",

      "ยà¹ˆอย 2-3", "ยà¹ˆอย 4-5", "ยà¹ˆอย 6-10"

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

      classType: row[23] ? row[23].toString().trim() : 'à¹€ดà¸µà¹ˆยว',

      isChecked: row[24] ? parseInt(row[24]) === 1 : false

    });

  });

  return students;

}

function getAllStudentsFromSubgroupSheets() {

  const sheets = ['ยà¹ˆอย 2-3', 'ยà¹ˆอย 4-5', 'ยà¹ˆอย 6-10'];

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

        const isAssigned = c.teacherRegular && c.teacherRegular.toLowerCase().includes(matchedTeacherNick.toLowerCase());

          

        if (isAssigned && c.subject) {

          const courseKey = c.subject.trim();

          const dayName = c.dayOfWeek || '';

          const timeStart = c.timeStart || '';

          const timeEnd = c.timeEnd || '';

          

          let fullCourseName = courseKey;

          let dayTimeStr = '';

          

          var hasDay = /(à¸ˆันทรà¹Œ|อังคà¸²ร|à¸žุธ|à¸žฤหัà¸ªà¸šดà¸µ|ศุà¸�รà¹Œ|à¹€à¸ªà¸²รà¹Œ|อà¸²ทิตยà¹Œ)/.test(courseKey);

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

      'อนุà¸šà¸²ล/1','ป.1/1','ป.2/1','ป.3/1','ป.4/1','ป.5/1','ป.6/1','ม.1/1','ม.2/1','ม.3/1','ม.4/1','ม.5/1','ม.6/1',

      'อนุà¸šà¸²ล/2','ป.1/2','ป.2/2','ป.3/2','ป.4/2','ป.5/2','ป.6/2','ม.1/2','ม.2/2','ม.3/2','ม.4/2','ม.5/2','ม.6/2',

      'อนุà¸šà¸²ล/3','ป.1/3','ป.2/3','ป.3/3','ป.4/3','ป.5/3','ป.6/3','ม.1/3','ม.2/3','ม.3/3','ม.4/3','ม.5/3','ม.6/3',

      'à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล','à¹€ดà¸µà¹ˆยว ป.1','à¹€ดà¸µà¹ˆยว ป.2','à¹€ดà¸µà¹ˆยว ป.3','à¹€ดà¸µà¹ˆยว ป.4','à¹€ดà¸µà¹ˆยว ป.5','à¹€ดà¸µà¹ˆยว ป.6','à¹€ดà¸µà¹ˆยว ม.1','à¹€ดà¸µà¹ˆยว ม.2','à¹€ดà¸µà¹ˆยว ม.3','à¹€ดà¸µà¹ˆยว ม.4','à¹€ดà¸µà¹ˆยว ม.5','à¹€ดà¸µà¹ˆยว ม.6',

      'ยà¹ˆอย 2-3','ยà¹ˆอย 4-5','ยà¹ˆอย 6-10'

    ];

    for (let sheetName of gradeSheets) {

      const sheet = db.getSheetByName(sheetName);

      if (!sheet) continue;

      

      const data = sheet.getDataRange().getValues();

      if (data.length < 4) continue;

      

      const courseRow = data[0]; // Row 1 (Index 0)

      const dayTimeRow = data[2]; // Row 3 (Index 2)

      

      let branch = '';

      if (sheetName.includes('/1')) branch = 'à¸ªà¸²ขà¸² 1';

      else if (sheetName.includes('/2')) branch = 'à¸ªà¸²ขà¸² 2';

      else if (sheetName.includes('/3')) branch = 'à¸ªà¸²ขà¸² 3';

      

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

                  if (val !== '' && val !== null && !isNaN(val) && parseFloat(val) >= 0) {

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

    if (classType && (classType.includes('à¹€ดà¸µà¹ˆยว') || classType.includes('ยà¹ˆอย'))) {

      let normalizedClassType = 'à¹€ดà¸µà¹ˆยว';

      let sheetName = '';

      if (classType.includes('à¹€ดà¸µà¹ˆยว')) {

        normalizedClassType = 'à¹€ดà¸µà¹ˆยว';

        sheetName = `à¹€ดà¸µà¹ˆยว ${grade}`;

      } else {

        if (classType.includes('2-3')) normalizedClassType = 'ยà¹ˆอย 2-3';

        else if (classType.includes('4-5')) normalizedClassType = 'ยà¹ˆอย 4-5';

        else if (classType.includes('6-10')) normalizedClassType = 'ยà¹ˆอย 6-10';

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

    

    // Otherwise, they are a group student ("à¸�ลุà¹ˆมหลัà¸�")

    let suffix = '1';

    if (branchLearn && (branchLearn.includes('à¸ªà¸²ขà¸²2') || branchLearn.includes('2'))) suffix = '2';

    else if (branchLearn && (branchLearn.includes('à¸ªà¸²ขà¸²3') || branchLearn.includes('3'))) suffix = '3';

    

    const sheetName = `${grade}/${suffix}`;

    const sheet = db.getSheetByName(sheetName);

    if (!sheet) return [];

    

    const lastRow = sheet.getLastRow();

    const lastCol = sheet.getLastColumn();

    if (lastRow < 6 || lastCol < 16) return [];

    

    const headerRow1 = sheet.getRange(1, 19, 1, lastCol - 18).getValues()[0];

    const headerRow2 = sheet.getRange(2, 19, 1, lastCol - 18).getValues()[0];

    const headerRow3 = sheet.getRange(3, 19, 1, lastCol - 18).getValues()[0];

    

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

              classType: 'à¸�ลุà¹ˆมหลัà¸�'

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

    if (branch.includes('à¸ªà¸²ขà¸²2')) suffix = '2';

    else if (branch.includes('à¸ªà¸²ขà¸²3')) suffix = '3';

    

    const sheetName = `${grade}/${suffix}`;

    const sheet = db.getSheetByName(sheetName);

    if (!sheet) return [];

    

    const lastCol = sheet.getLastColumn();

    if (lastCol < 16) return [];

    

    const headerRow1 = sheet.getRange(1, 19, 1, lastCol - 18).getValues()[0];

    const headerRow2 = sheet.getRange(2, 19, 1, lastCol - 18).getValues()[0];

    const headerRow3 = sheet.getRange(3, 19, 1, lastCol - 18).getValues()[0];

    const headerRow4 = sheet.getRange(4, 19, 1, lastCol - 18).getValues()[0];

    

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

  

  const uiClassType = student.classType || 'à¹€ดà¸µà¹ˆยว';

  const grade = student.grade || 'อนุà¸šà¸²ล';

  

  let normalizedClassType = 'à¹€ดà¸µà¹ˆยว';

  if (uiClassType.includes('à¹€ดà¸µà¹ˆยว')) {

    normalizedClassType = 'à¹€ดà¸µà¹ˆยว';

    sheetName = `à¹€ดà¸µà¹ˆยว ${grade}`;

  } else if (uiClassType.includes('ยà¹ˆอย')) {

    if (uiClassType.includes('2-3')) normalizedClassType = 'ยà¹ˆอย 2-3';

    else if (uiClassType.includes('4-5')) normalizedClassType = 'ยà¹ˆอย 4-5';

    else if (uiClassType.includes('6-10')) normalizedClassType = 'ยà¹ˆอย 6-10';

    sheetName = normalizedClassType;

  } else {

    normalizedClassType = 'à¸�ลุà¹ˆมหลัà¸�';

    let suffix = '1';

    if (student.branchLearn.includes('à¸ªà¸²ขà¸²2')) suffix = '2';

    else if (student.branchLearn.includes('à¸ªà¸²ขà¸²3')) suffix = '3';

    sheetName = `${grade}/${suffix}`;

  }

  

  const sheet = getOrCreateSheet(sheetName);

  if (!sheet) return;

  

  const lastRow = sheet.getLastRow();

  let range = [];

  const startRow = sheetName.includes('à¹€ดà¸µà¹ˆยว') || sheetName.includes('ยà¹ˆอย') ? 12 : 6;

  

  if (lastRow >= startRow) {

    range = sheet.getRange(startRow, 2, lastRow - (startRow - 1), 10).getValues(); 

  }

  

  let targetRowIndex = -1;

  const courseName = student.round || '';

  const matchName = (student.originalName || student.name).trim();

  const matchRound = student.originalRound || student.round || '';

  

  for (let i = 0; i < range.length; i++) {

    if (range[i][0].toString().trim() === matchName && (sheetName.includes('à¹€ดà¸µà¹ˆยว') ? range[i][9].toString().trim() === matchRound : true)) {

      targetRowIndex = i + startRow;

      break;

    }

  }

  

  const rowDataClassType = normalizedClassType === 'à¹€ดà¸µà¹ˆยว' ? `à¹€ดà¸µà¹ˆยว ${student.grade}` : normalizedClassType;

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

  

  if (sheetName.includes('à¹€ดà¸µà¹ˆยว') || sheetName.includes('ยà¹ˆอย')) {

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

      sheet.getRange(targetRow, 11).setValue(student.full); 

      sheet.getRange(targetRow, 12).setValue(0); 

      sheet.getRange(targetRow, 14).setValue(student.paid); 

      sheet.getRange(targetRow, 15).setValue(student.isCard ? 1 : 0);

      sheet.getRange(targetRow, 16).setValue(student.paymentDate || '');

      sheet.getRange(targetRow, 17).setValue(student.paymentChannel || '');

      sheet.getRange(targetRow, 18).setValue(student.staff || '');

    } else {

      sheet.getRange(targetRow, 1, 1, 10).setValues([[

        student.grade, student.name, student.nickname, student.school, student.classSection,

        student.contact, student.lineName, student.lineId, student.branchLearn, student.branchPay

      ]]);

            sheet.getRange(targetRow, 11).setValue(student.full);

      sheet.getRange(targetRow, 14).setValue(student.paid);

      sheet.getRange(targetRow, 15).setValue(student.isCard ? 1 : 0);

      sheet.getRange(targetRow, 16).setValue(student.paymentDate || '');

      sheet.getRange(targetRow, 17).setValue(student.paymentChannel || '');

      sheet.getRange(targetRow, 18).setValue(student.staff || '');

    }

    

    // Sync checked courses into columns 16+ in the grade sheet

    try {

      const selectedList = student.selectedCourses || [];

      if (selectedList.length > 0) {

        const lastCol = sheet.getLastColumn();

        if (lastCol >= 19) {

          const header1 = sheet.getRange(1, 19, 1, lastCol - 18).getValues()[0];

          const header2 = sheet.getRange(2, 19, 1, lastCol - 18).getValues()[0];

          const header4 = sheet.getRange(4, 19, 1, lastCol - 18).getValues()[0];

          

          const coursesInSheet = [];

          for (let j = 0; j < header1.length; j++) {

            if (header1[j]) {

              coursesInSheet.push({

                colIndex: 19 + j,

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

function syncStudentToStatusDB(std) {

  const sheet = getDb().getSheetByName('StatusDB');

  

  if (!cachedStatusValues_) {

    const lastRow = sheet.getLastRow();

    if (lastRow > 0) {

      cachedStatusValues_ = sheet.getRange(1, 1, lastRow, 25).getValues();

    } else {

      cachedStatusValues_ = [];

    }

  }

  

  let rowIndex = -1;

  let id = "";

  for (let i = 0; i < cachedStatusValues_.length; i++) {

    const dbName = cachedStatusValues_[i][1] ? cachedStatusValues_[i][1].toString().trim() : "";

    const dbRound = cachedStatusValues_[i][15] ? cachedStatusValues_[i][15].toString().trim() : "";

    if (dbName === std.name && dbRound === std.round) {

      rowIndex = i + 1;

      id = cachedStatusValues_[i][0] ? cachedStatusValues_[i][0].toString().trim() : "";

      break;

    }

  }

  

  const timestamp = new Date().getTime();

  if (rowIndex === -1) {

    id = `${std.name.replace(/\s+/g, '')}_${timestamp}_${std.round}`;

  }

  

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

    std.paymentDate || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy'),

    std.paymentChannel || 'à¸�à¸ªิà¸�ร à¸šัà¸�à¸Šà¸µà¸šริษัท(à¸ªà¹�à¸�น)',

    std.staff || '',

    std.round,

    std.grade,

    std.classSection || '',

    std.lineName || '',

    std.lineId || '',

    std.carriedForwardFee || 0,

    std.classHours || '',

    std.classHoursLeft || '',

    std.classType,

    std.isChecked ? 1 : 0

  ];

  

  if (rowIndex === -1) {

    sheet.appendRow(rowValues);

    cachedStatusValues_.push(rowValues);

  } else {

    sheet.getRange(rowIndex, 1, 1, 25).setValues([rowValues]);

    cachedStatusValues_[rowIndex - 1] = rowValues;

  }

  

  // Invalidate students cache

  invalidateStudentCache();

}

function calculateIndividualCourseFee(classType, grade, roundText, subSize) {

  let price = 2000;

  if (classType && classType.includes('à¹€ดà¸µà¹ˆยว')) {

    const cleanRound = (roundText || '').toLowerCase().trim();

    const isEx = cleanRound.endsWith('ex') || cleanRound.includes('ex');

    if (['ม.4', 'ม.5', 'ม.6'].includes(grade) || isEx) {

      price = 2500;

    } else {

      price = 2000;

    }

  } else if (classType && (classType.includes('ยà¹ˆอย') || classType.includes('à¸�ลุà¹ˆมยà¹ˆอย'))) {

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

      

      logActivity(logUser, 'ลงทะà¹€à¸šà¸µยนà¸�ลุà¹ˆมยà¹ˆอย', `นัà¸�à¹€รà¸µยน: ${student.subgroupStudents.map(m => m.name).join(', ')} คอรà¹Œà¸ª: ${student.subgroupCourses.join(', ')}`);

      invalidateStudentCache();

      return { success: true, id: lastResult ? lastResult.id : 'SUBGROUP' };

    }

    // Check if subgroupCourses is present and has items (multiple courses)

    if (student.subgroupCourses && student.subgroupCourses.length > 0) {

      let lastId = '';

      const totalPaid = parseFloat(student.paid) || 0;

      const totalFull = parseFloat(student.full) || 0;

      

      // Build note text

      const noteText = `à¸Šà¸³ระรวม ${totalPaid.toLocaleString()} à¸šà¸²ท`;

      let extraNote = student.extraNote || '';

      if (!extraNote.includes('à¸Šà¸³ระรวม')) {

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

        

        const rowData = [

          id,

          student.name,

          student.nickname,

          student.school,

          formatPhoneNumber(student.contact),

          student.branchLearn,

          student.branchPay,

          student.paymentTimeNote || '',

          extraNote,

          proportionalPaid,

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

          student.classType || 'à¹€ดà¸µà¹ˆยว'

        ];

        

        sheet.appendRow(rowData);

        

        const studentCopy = Object.assign({}, student, { id: id, round: round, full: full, paid: proportionalPaid, extraNote: extraNote });

        try {

          syncToGradeSheet(studentCopy);

        } catch (e) {}

        

        lastId = id;

      });

      

      logActivity(logUser, 'ลงทะà¹€à¸šà¸µยนà¹€ดà¹‡à¸�à¹ƒหมà¹ˆ (หลà¸²ยคอรà¹Œà¸ª)', `นัà¸�à¹€รà¸µยน: ${student.name} คอรà¹Œà¸ªทัà¹‰งหมด: ${student.subgroupCourses.join(', ')}`);

      invalidateStudentCache();

      return { success: true, id: lastId };

    } else {

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

        formatPhoneNumber(student.contact),

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

        student.classType || 'à¹€ดà¸µà¹ˆยว'

      ];

      

      sheet.appendRow(rowData);

      syncToGradeSheet(student);

      logActivity(logUser, 'ลงทะà¹€à¸šà¸µยนà¹€ดà¹‡à¸�à¹ƒหมà¹ˆ', `นัà¸�à¹€รà¸µยน: ${student.name} คอรà¹Œà¸ª: ${round} ยอดà¹€ตà¹‡ม: ${full}`);

      invalidateStudentCache();

      return { success: true, id: id };

    }

  } catch (err) {

    return { success: false, error: err.message };

  }

}

function updateStudentRegistration(student, logUser) {

  checkTeacherBlock(logUser);

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

    

    // 3. Fallback: Search by Name and Round (Optimized with single batch read)

    if (rowIndex === -1) {

      const allRows = sheet.getRange(1, 1, lastRow, 16).getValues();

      for (let i = 0; i < allRows.length; i++) {

        const nameVal = allRows[i][1] ? allRows[i][1].toString().trim() : '';

        const roundVal = allRows[i][15] ? allRows[i][15].toString().trim() : '';

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

        formatPhoneNumber(student.contact),

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

        student.classType || 'à¹€ดà¸µà¹ˆยว'

      ]

    ];

    

    sheet.getRange(rowIndex, 1, 1, 24).setValues(rowValues);

    syncToGradeSheet(student);

    logActivity(logUser, 'à¹�à¸�à¹‰à¹„ขรà¸²ยละà¹€อà¸µยดà¹€ดà¹‡à¸�นัà¸�à¹€รà¸µยน', `นัà¸�à¹€รà¸µยน: ${student.name} (ID: ${student.id})`);

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

    const classType = rowVals[23] ? rowVals[23].toString().trim() : 'à¹€ดà¸µà¹ˆยว';

    const grade = rowVals[16] ? rowVals[16].toString().trim() : 'อนุà¸šà¸²ล';

    const branchLearn = rowVals[5] ? rowVals[5].toString().trim() : '';

    const round = rowVals[15] ? rowVals[15].toString().trim() : '';

    

    // Delete from Grade Sheet

    try {

      const db = getDb();

      let targetSheetName = '';

      if (classType.includes('à¹€ดà¸µà¹ˆยว')) {

        targetSheetName = `à¹€ดà¸µà¹ˆยว ${grade}`;

      } else if (classType.includes('ยà¹ˆอย')) {

        if (classType.includes('2-3')) targetSheetName = 'ยà¹ˆอย 2-3';

        else if (classType.includes('4-5')) targetSheetName = 'ยà¹ˆอย 4-5';

        else if (classType.includes('6-10')) targetSheetName = 'ยà¹ˆอย 6-10';

      } else {

        let suffix = '1';

        if (branchLearn.includes('à¸ªà¸²ขà¸²2')) suffix = '2';

        else if (branchLearn.includes('à¸ªà¸²ขà¸²3')) suffix = '3';

        targetSheetName = `${grade}/${suffix}`;

      }

      

      const gradeSheet = db.getSheetByName(targetSheetName);

      if (gradeSheet) {

        const gLastRow = gradeSheet.getLastRow();

        const startRow = targetSheetName.includes('à¹€ดà¸µà¹ˆยว') || targetSheetName.includes('ยà¹ˆอย') ? 12 : 6;

        if (gLastRow >= startRow) {

          const gRange = gradeSheet.getRange(startRow, 2, gLastRow - (startRow - 1), 10).getValues();

          for (let k = 0; k < gRange.length; k++) {

            // Match student name, and also round/course for private sheets

            const matchesName = gRange[k][0].toString().trim() === stdName;

            const matchesRound = targetSheetName.includes('à¹€ดà¸µà¹ˆยว') ? gRange[k][9].toString().trim() === round : true;

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

    logActivity(logUser, 'ลà¸šขà¹‰อมà¸¹ลลงทะà¹€à¸šà¸µยนà¹€รà¸µยน', `นัà¸�à¹€รà¸µยน: ${stdName} (ID: ${id})`);

    invalidateStudentCache();

    return { success: true };

  } catch (err) {

    return { success: false, error: err.message };

  }

}

// ----------------------------------------------------

// Grade-Level Registration Sheet Grid Editor (à¹€à¸Šà¹ˆน ม.1/2)

// ----------------------------------------------------

function getGradeSheetData(grade, branch, logUser) {

  if (logUser) checkTeacherBlock(logUser);

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

      

      const branchName = `à¸ªà¸²ขà¸²${suffix}`;

      

      const sheetCourses = [];

      if (lastCol >= 19) {

        const headerRow1 = sheet.getRange(1, 19, 1, lastCol - 18).getValues()[0];

        const headerRow2 = sheet.getRange(2, 19, 1, lastCol - 18).getValues()[0];

        const headerRow3 = sheet.getRange(3, 19, 1, lastCol - 18).getValues()[0];

        const headerRow4 = sheet.getRange(4, 19, 1, lastCol - 18).getValues()[0];

        

        for (let i = 0; i < headerRow1.length; i++) {

          if (headerRow1[i]) {

            sheetCourses.push({

              colIndex: 19 + i,

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

            

            full: parseFloat(row[10]) || 0, 

            discount: parseFloat(row[11]) || 0, 

            outstanding: parseFloat(row[12]) || 0, 

            paid: parseFloat(row[13]) || 0, 

            isCard: parseInt(row[14]) === 1 ? 1 : 0, 

            

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

        

        for (const colIndex in s.courseValues) {

          const colIdx0 = parseInt(colIndex) - 1;

          if (colIdx0 < lastCol) {

            rowVals[colIdx0] = s.courseValues[colIndex];

          }

        }

        

        sheet.getRange(row, 1, 1, lastCol).setValues([rowVals]);

        

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

          classType: 'à¸�ลุà¹ˆมหลัà¸�',

          round: s.sheetName || sheetName

        });

      });

    });

    

    logActivity(logUser, 'à¹�à¸�à¹‰à¹„ขหà¹‰องà¹€รà¸µยนà¹�ยà¸�à¸ªà¸²ขà¸² (รวม)', `à¹�à¸�à¹‰à¹„ขà¸Šà¸µตระดัà¸šà¸Šัà¹‰น ${grade} รวมทุà¸�à¸ªà¸²ขà¸² à¸ˆà¸³นวนทà¸µà¹ˆà¸ªà¹ˆงอัปà¹€ดต ${studentsUpdate.length} คน`);

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

    if (branch.includes('à¸ªà¸²ขà¸²2')) suffix = '2';

    else if (branch.includes('à¸ªà¸²ขà¸²3')) suffix = '3';

    

    const sheetName = `${grade}/${suffix}`;

    const sheet = db.getSheetByName(sheetName);

    if (!sheet) throw new Error(`à¹„มà¹ˆà¸žà¸šà¸Šà¸µตหà¹‰องà¹€รà¸µยน ${sheetName}`);

    

    const lastCol = sheet.getLastColumn();

    const targetCol = lastCol + 1;

    

    sheet.getRange(1, targetCol).setValue(courseName + (dayTime ? ' ' + dayTime.trim() : ''));

    sheet.getRange(2, targetCol).setValue(price);

    sheet.getRange(3, targetCol).setValue(dayTime || ''); 

    sheet.getRange(4, targetCol).setValue(parseInt(sessions) || 10); 

    

    logActivity(logUser, 'à¹€à¸žิà¹ˆมคอรà¹Œà¸ªà¹€รà¸µยนà¹�ยà¸�หà¹‰อง', `à¸Šà¸µต ${sheetName} à¹€à¸žิà¹ˆมคอรà¹Œà¸ª ${courseName} รà¸²คà¸² ${price} à¸ˆà¸³นวนครัà¹‰ง ${sessions} วัน/à¹€วลà¸² ${dayTime || ''}`);

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

    if (branch.includes('à¸ªà¸²ขà¸²2')) suffix = '2';

    else if (branch.includes('à¸ªà¸²ขà¸²3')) suffix = '3';

    

    const sheetName = `${grade}/${suffix}`;

    const sheet = db.getSheetByName(sheetName);

    if (!sheet) throw new Error(`à¹„มà¹ˆà¸žà¸šà¸Šà¸µตหà¹‰องà¹€รà¸µยน ${sheetName}`);

    

    const lastCol = sheet.getLastColumn();

    

    // Write each course in adjacent columns

    courseList.forEach((c, idx) => {

      const targetCol = lastCol + 1 + idx;

      sheet.getRange(1, targetCol).setValue(c.courseName + (c.dayTime ? ' ' + c.dayTime.trim() : ''));

      sheet.getRange(2, targetCol).setValue(c.price);

      sheet.getRange(3, targetCol).setValue(c.dayTime || '');

      sheet.getRange(4, targetCol).setValue(parseInt(c.sessions) || 10);

      

      logActivity(logUser, 'à¹€à¸žิà¹ˆมคอรà¹Œà¸ªà¹€รà¸µยนà¹�ยà¸�หà¹‰อง', `à¸Šà¸µต ${sheetName} à¹€à¸žิà¹ˆมคอรà¹Œà¸ª ${c.courseName} รà¸²คà¸² ${c.price} à¸ˆà¸³นวนครัà¹‰ง ${c.sessions} วัน/à¹€วลà¸² ${c.dayTime || ''}`);

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

    if (!sheet) throw new Error(`à¹„มà¹ˆà¸žà¸šà¸Šà¸µตหà¹‰องà¹€รà¸µยน ${sheetName}`);

    

    // Delete column

    sheet.deleteColumn(colIndex);

    

    logActivity(logUser, 'ลà¸šคอลัมนà¹Œวิà¸Šà¸²à¹€รà¸µยน', `à¸Šà¸µต ${sheetName} ลà¸šวิà¸Šà¸² ${courseName} (คอลัมนà¹Œทà¸µà¹ˆ ${colIndex})`);

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

// ----------------------------------------------------

// Private & Small Group Student Editor (à¹€ดà¸µà¹ˆยว / ยà¹ˆอย)

// ----------------------------------------------------

function getPrivateSheetData(sheetName) {

  try {

    const db = getDb();

    // ensureDataLearnMigrated(db);

    let sheetsToProcess = [];

    if (sheetName === 'ALL') {

      sheetsToProcess = [

        "à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล", "à¹€ดà¸µà¹ˆยว ป.1", "à¹€ดà¸µà¹ˆยว ป.2", "à¹€ดà¸µà¹ˆยว ป.3", "à¹€ดà¸µà¹ˆยว ป.4", "à¹€ดà¸µà¹ˆยว ป.5", "à¹€ดà¸µà¹ˆยว ป.6",

        "à¹€ดà¸µà¹ˆยว ม.1", "à¹€ดà¸µà¹ˆยว ม.2", "à¹€ดà¸µà¹ˆยว ม.3", "à¹€ดà¸µà¹ˆยว ม.4", "à¹€ดà¸µà¹ˆยว ม.5", "à¹€ดà¸µà¹ˆยว ม.6",

        "ยà¹ˆอย 2-3", "ยà¹ˆอย 4-5", "ยà¹ˆอย 6-10"

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

        const isPrivate = sName.indexOf('à¹€ดà¸µà¹ˆยว') !== -1;

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

        if (isLastRound && assignedMinutes >= limitMins && note.indexOf('à¹€รà¸µยนครà¸šà¹�ลà¹‰ว') === -1) {

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

              '0 à¸Šม. 0 นà¸²ทà¸µ',

              formatMinutesToHoursLeft(courseMins)

            ];

            

            sheet.appendRow(nextRow);

            note = 'à¹€รà¸µยนครà¸šà¹�ลà¹‰ว (ตà¹ˆอคอรà¹Œà¸ªà¹ƒหมà¹ˆ: ' + nextCourseName + ')';

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

            note = 'à¹€รà¸µยนครà¸šà¹�ลà¹‰ว (ตà¹ˆอคอรà¹Œà¸ªà¹ƒหมà¹ˆ: ' + nextCourseName + ')';

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

          paymentDate: row[16] ? row[16].toString().trim() : '',

          paymentChannel: row[17] ? row[17].toString().trim() : '',

          staff: row[18] ? row[18].toString().trim() : '',

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

  if (sheetName.indexOf('à¹€ดà¸µà¹ˆยว') !== -1) {

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

  } else { // à¸�ลุà¹ˆมยà¹ˆอย

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

    if (!sheet) throw new Error(`à¹„มà¹ˆà¸žà¸šà¸Šà¸µตขà¹‰อมà¸¹ล ${sheetName}`);

    

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

      throw new Error(`à¹„มà¹ˆà¸žà¸šขà¹‰อมà¸¹ลนัà¸�à¹€รà¸µยน ${name} à¹ƒนวิà¸Šà¸² ${courseName} à¹ƒนà¸Šà¸µต ${sheetName}`);

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

      grade: sheetName.includes('à¹€ดà¸µà¹ˆยว') ? sheetName.replace('à¹€ดà¸µà¹ˆยว', '').trim() : 'อนุà¸šà¸²ล',

      classSection: stdDetails[4],

      lineName: stdDetails[6],

      lineId: stdDetails[7],

      classHours: hours,

      classHoursLeft: paymentData.hoursLeft || '',

      classType: sheetName.includes('à¹€ดà¸µà¹ˆยว') ? 'à¹€ดà¸µà¹ˆยว' : sheetName,

      round: courseName

    });

    

    logActivity(logUser, 'อัปà¹€ดตยอดà¹€งินà¹€ดà¹‡à¸�à¹€ดà¸µà¹ˆยว/ยà¹ˆอย', `นัà¸�à¹€รà¸µยน: ${name} คà¹ˆà¸²à¹€รà¸µยนตà¹ˆอรอà¸š: ${full} à¸Šà¸³ระ: ${paid} à¹ƒนà¸Šà¸µต ${sheetName}`);

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

    if (!sheet) throw new Error(`à¹„มà¹ˆà¸žà¸šà¸Šà¸µตขà¹‰อมà¸¹ล ${sheetName}`);

    // Validate rowIndex is within data range

    const lastRow = sheet.getLastRow();

    if (rowIndex < 12 || rowIndex > lastRow) throw new Error(`rowIndex ${rowIndex} à¹„มà¹ˆถà¸¹à¸�ตà¹‰อง`);

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

    logActivity(logUser, 'à¹�à¸�à¹‰à¹„ขขà¹‰อมà¸¹ลà¹€ดà¹‡à¸�à¹€ดà¸µà¹ˆยว/ยà¹ˆอย', `อัปà¹€ดตขà¹‰อมà¸¹ล ${originalName} → ${studentInfo.name} à¹ƒนà¸Šà¸µต ${sheetName}`);

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

    const cacheKey = 'teachers_db_raw';

    let rawData = getCacheObject(cacheKey);

    if (!rawData) {

      rawData = getSheetRows('TeachersDB');

      if (rawData && rawData.length > 0) {

        setCacheObject(cacheKey, rawData, 1800); // Cache for 30 minutes

      }

    }

    const teachers = [];

    

    rawData.forEach((row, idx) => {

      if (idx === 0) return;

      if (!row[0]) return;

      

      const teacherNick = row[0].toString().trim();

      

      // หà¸²à¸�à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰งà¸²นà¹€ปà¹‡นà¸šทà¸šà¸²ทครà¸¹ à¹ƒหà¹‰à¹€หà¹‡นขà¹‰อมà¸¹ลà¹€ฉà¸žà¸²ะของตนà¹€องà¹€ทà¹ˆà¸²นัà¹‰น (ปà¹‰องà¸�ันà¸�à¸²รรัà¹ˆวà¹„หลขà¹‰อมà¸¹ลธนà¸²คà¸²ร/คà¹ˆà¸²ตอà¸šà¹�ทนของครà¸¹ทà¹ˆà¸²นอืà¹ˆน)

      if (isTeacher) {

        const cleanUser = logUser.toString().trim().toLowerCase();

        const cleanNick = teacherNick.toLowerCase();

        // คà¹‰นหà¸²ทัà¹‰งà¸ˆà¸²à¸�à¸Šืà¹ˆอà¸šัà¸�à¸Šà¸µà¹�ละ Nickname

        if (cleanUser !== cleanNick && !cleanUser.includes(cleanNick) && !cleanNick.includes(cleanUser)) {

          return;

        }

      }

      

      teachers.push({

        nickname: teacherNick,

        fullName: row[1] ? row[1].toString().trim() : '',

        school: row[2] ? row[2].toString().trim() : '',

        phone: row[3] ? row[3].toString().trim() : '',

        subjects: row[4] ? row[4].toString().trim() : '',

        bank: row[5] ? row[5].toString().trim() : '',

        accountNumber: row[6] ? row[6].toString().trim() : '',

        compensation: row[7] ? row[7].toString().trim() : '150',

        teacherId: row[8] ? row[8].toString().trim() : ''

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

    const sheet = db.getSheetByName('TeachersDB');

    const lastRow = sheet.getLastRow();

    

    let rowIndex = -1;

    if (lastRow > 0) {

      const nicknames = sheet.getRange(1, 1, lastRow, 1).getValues();

      for (let i = 0; i < nicknames.length; i++) {

        if (nicknames[i][0].toString().trim() === teacher.nickname) {

          rowIndex = i + 1;

          break;

        }

      }

    }

    

    const rowValues = [

      teacher.nickname,

      teacher.fullName || '',

      teacher.school || '',

      teacher.phone || '',

      teacher.subjects || '',

      teacher.bank || '',

      teacher.accountNumber || '',

      teacher.compensation || '150',

      teacher.teacherId || ''

    ];

    

    if (rowIndex === -1) {

      sheet.appendRow(rowValues);

      const genSheet = db.getSheetByName('DATA General');

      if (genSheet) {

        genSheet.appendRow([teacher.nickname]);

      }

    } else {

      sheet.getRange(rowIndex, 1, 1, 9).setValues([rowValues]);

    }

    

    // Clear cache

    clearCacheObject('teachers_db_raw');

    

    logActivity(logUser, 'à¸šันทึà¸�ประวัติครà¸¹', `ครà¸¹: ${teacher.nickname}`);

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

    logActivity(logUser || teacher || 'System', 'คà¸³นวณà¹€งินà¹€ดือนรà¸²ยปà¸µà¹€ริà¹ˆม', 'คุณครà¸¹: ' + teacher + ', ปà¸µ: ' + year);

    const classLogs = getClassLogs('');

    if (!Array.isArray(classLogs)) throw new Error(classLogs.error || 'à¹„มà¹ˆà¸ªà¸²มà¸²รถดึงขà¹‰อมà¸¹ล Class Logs à¹„ดà¹‰');

    

    const teachersList = getTeachersDB(null);

    if (!Array.isArray(teachersList) || teachersList.length === 0) {

      throw new Error('à¹„มà¹ˆà¸žà¸šขà¹‰อมà¸¹ลรà¸²ยà¸Šืà¹ˆอครà¸¹à¹ƒนà¸�à¸²นขà¹‰อมà¸¹ล TeachersDB');

    }

    const teacherProfile = teachersList.find(t => {

      const tId = (t.teacherId || '').toLowerCase().trim();

      const tNick = t.nickname.toLowerCase().trim().replace(/^ครà¸¹/, '').trim();

      const targetNick = teacher.toLowerCase().trim().replace(/^ครà¸¹/, '').trim();

      return (tId !== '' && tId === teacher.toLowerCase().trim()) || 

             tNick === targetNick || tNick.includes(targetNick) || targetNick.includes(tNick);

    });

    if (!teacherProfile) {

      throw new Error('à¹„มà¹ˆà¸žà¸šประวัติคุณครà¸¹à¸Šืà¹ˆอ/รหัà¸ª: "' + teacher + '" à¹ƒนà¸�à¸²นขà¹‰อมà¸¹ล TeachersDB');

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

        const cleanB = cellB.replace(/^ครà¸¹/, '').trim();

        const cleanC = cellC.replace(/^ครà¸¹/, '').trim();

        const cleanNick = cleanResolvedNick.replace(/^ครà¸¹/, '').trim();

        

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

        

        // Count only à¸ªด + ออนà¹„ลนà¹Œ + à¸Šดà¹€à¸Šย for totalHours calculation

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

      

      monthlyResults[m] = {

        classes: matchedClasses,

        totalHours: Math.round(totalHours * 100) / 100,

        totalClasses: totalClasses,

        totalPay: Math.round(totalPay * 100) / 100

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

 * Calculate monthly pay for ALL teachers at once for a single month.

 * Used by the "à¸ªรุปรà¸²ยà¹„ดà¹‰ครà¸¹ทัà¹‰งหมด" dashboard to show real-time salary data.

 */

function getAllTeachersMonthlyPay(year, month) {

  const cacheKey = 'all_teachers_monthly_' + year + '_' + month;

  const cached = getCacheObject(cacheKey);

  // if (cached) return cached;

  

  try {

    const classLogs = getClassLogs('');

    if (!Array.isArray(classLogs)) throw new Error(classLogs.error || 'à¹„มà¹ˆà¸ªà¸²มà¸²รถดึงขà¹‰อมà¸¹ล Class Logs à¹„ดà¹‰');

    

    const teachersList = getTeachersDB(null);

    if (!Array.isArray(teachersList) || teachersList.length === 0) {

      throw new Error('à¹„มà¹ˆà¸žà¸šขà¹‰อมà¸¹ลรà¸²ยà¸Šืà¹ˆอครà¸¹à¹ƒนà¸�à¸²นขà¹‰อมà¸¹ล TeachersDB');

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

      const cleanNick = cleanResolvedNick.replace(/^ครà¸¹/, '').trim();

      

      let totalHours = 0;

      let totalPay = 0;

      let totalClasses = 0;

      

      monthLogs.forEach(c => {

        const cellB = c.teacherRegular ? c.teacherRegular.toString().trim().toLowerCase() : '';

        const cellC = c.teacherSub ? c.teacherSub.toString().trim().toLowerCase() : '';

        const cleanB = cellB.replace(/^ครà¸¹/, '').trim();

        const cleanC = cellC.replace(/^ครà¸¹/, '').trim();

        

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

        

        // Count only à¸ªด + ออนà¹„ลนà¹Œ + à¸Šดà¹€à¸Šย

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

        guaranteeDeduction: teacherProfile.compensation || 0

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

        if (!note.includes('นà¹‰องลà¸²')) {

          note = (note ? note + ' ' : '') + 'นà¹‰องลà¸²';

        }

        isLeave = 1;

        // Toggling nong leave to true clears live/online/makeup kids count in sheet

        sheet.getRange(rowIndex, 7).setValue(0); // à¸ªด

        sheet.getRange(rowIndex, 8).setValue(0); // ออน

        sheet.getRange(rowIndex, 11).setValue(0); // à¸Šด

      } else {

        note = note.replace(/นà¹‰องลà¸²/g, '').trim();

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

// Dynamic Course Name Resolution (หลัà¸� → header)

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

    'อนุà¸šà¸²ล/1','ป.1/1','ป.2/1','ป.3/1','ป.4/1','ป.5/1','ป.6/1','ม.1/1','ม.2/1','ม.3/1','ม.4/1','ม.5/1','ม.6/1',

    'อนุà¸šà¸²ล/2','ป.1/2','ป.2/2','ป.3/2','ป.4/2','ป.5/2','ป.6/2','ม.1/2','ม.2/2','ม.3/2','ม.4/2','ม.5/2','ม.6/2',

    'อนุà¸šà¸²ล/3','ป.1/3','ป.2/3','ป.3/3','ป.4/3','ป.5/3','ป.6/3','ม.1/3','ม.2/3','ม.3/3','ม.4/3','ม.5/3','ม.6/3'

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

  

  // Only process courses starting with or containing "หลัà¸�"

  if (subj.indexOf('หลัà¸�') < 0) return subj;

  

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

  var dayNames = ['อà¸²ทิตยà¹Œ', 'à¸ˆันทรà¹Œ', 'อังคà¸²ร', 'à¸žุธ', 'à¸žฤหัà¸ªà¸šดà¸µ', 'ศุà¸�รà¹Œ', 'à¹€à¸ªà¸²รà¹Œ'];

  var dayOfWeek = dayNames[dateObj.getDay()];

  

  // Extract branch number from roomBranch

  var branch = '1';

  if (roomBranch) {

    var branchMatch = roomBranch.toString().match(/à¸ªà¸²ขà¸²\s*(\d)/);

    if (branchMatch) branch = branchMatch[1];

  }

  

  // Extract grade from subject (e.g., "หลัà¸� à¸ à¸²ษà¸²à¹„ทย ป.3" → "ป.3")

  var gradeMatch = subj.match(/(อนุà¸šà¸²ล|ป\.\d|ม\.\d)/);

  

  // Extract keyword: everything after "หลัà¸� " minus the grade part

  var subjectKeyword = '';

  if (gradeMatch) {

    // Has grade: keyword = between "หลัà¸�" and grade

    // "หลัà¸� à¸ à¸²ษà¸²à¹„ทย ป.3" → "à¸ à¸²ษà¸²à¹„ทย"

    subjectKeyword = subj.substring(subj.indexOf('หลัà¸�') + 4, gradeMatch.index).trim();

  } else {

    // No grade (e.g., "หลัà¸� อังà¸�ฤษ à¹�ขà¹ˆง3"): keyword = everything after "หลัà¸� "

    subjectKeyword = subj.substring(subj.indexOf('หลัà¸�') + 4).trim();

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

    // No grade (à¹�ขà¹ˆง etc.): search ALL grade sheets for this branch

    var allGrades = ['อนุà¸šà¸²ล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];

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

  

  // Fallback: try shorter keyword (e.g., "à¸ à¸²ษà¸²à¹„ทย" → "à¹„ทย")

  var shortKeyword = subjectKeyword.replace(/^à¸ à¸²ษà¸²/, '').trim();

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

  // ครà¸¹à¸ªà¸²มà¸²รถดà¸¹ขà¹‰อมà¸¹ลตà¸²รà¸²งà¹€รà¸µยนà¹„ดà¹‰

  

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

    

    const logs = [];

    

    rawData.forEach((row, idx) => {

      if (idx === 0) return;

      if (!row[0] || row[0] === '0') return;

      

      const dateRaw = cleanSheetDate(row[12]);

      if (filterDate && !areDatesSame(dateRaw, filterDate)) return;

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

        // isOrange removed

        hours: parseHoursValue(row[11]),

        date: dateRaw,

                roomBranch: roomBranchVal,

        teacherConfirmed: row[14] ? (parseInt(row[14]) || 0) : 0,

        numKids: row[15] ? (parseInt(row[15]) || 0) : 0,

        rowIndex: idx + 1

      });

    });

    

     // Cache for 2 minutes

    return logs;

  } catch (err) {

    return { error: err.message };

  }

}

function getClassLogByRow(rowIndex) {

  try {

    // ensureDataLearnMigrated(getDb());

    const sheet = getDb().getSheetByName('Data Learn');

    if (!sheet) throw new Error('Data Learn sheet not found');

    const lastRow = sheet.getLastRow();

    if (rowIndex < 2 || rowIndex > lastRow) {

      throw new Error('à¹„มà¹ˆà¸žà¸šขà¹‰อมà¸¹ลคลà¸²à¸ªà¹€รà¸µยนà¹ƒนà¹�ถวทà¸µà¹ˆ ' + rowIndex);

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

        numKids: row[15] ? (parseInt(row[15]) || 0) : 0,

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

    

    const searchNickClean = cleanNick.replace(/^ครà¸¹/, '').trim();

    const searchNameClean = cleanName.replace(/^ครà¸¹/, '').trim();

    

    rawData.forEach((row, idx) => {

      if (idx === 0) return;

      if (!row[0] || row[0] === '0') return;

      

      const teacherRegular = row[1] ? row[1].toString().trim().toLowerCase() : '';

      const teacherSub = row[2] ? row[2].toString().trim().toLowerCase() : '';

      

      const cleanReg = teacherRegular.replace(/^ครà¸¹/, '').trim();

      const cleanSub = teacherSub.replace(/^ครà¸¹/, '').trim();

      

      // คอลัมนà¹Œ B (ครà¸¹หลัà¸�) หรือคอลัมนà¹Œ C (ครà¸¹à¸ªอนà¹�ทน) ตรงà¸�ัà¸šà¸Šืà¹ˆอหรือà¸Šืà¹ˆอà¹€ลà¹ˆนของà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰ (ลà¸šคà¸³วà¹ˆà¸² ครà¸¹ à¹€à¸žืà¹ˆอà¹€ทà¸µยà¸šà¹�à¸šà¸šยืดหยุà¹ˆน)

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

        numKids: row[15] ? (parseInt(row[15]) || 0) : 0,

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

  var hasDay = /(à¸ˆันทรà¹Œ|อังคà¸²ร|à¸žุธ|à¸žฤหัà¸ªà¸šดà¸µ|ศุà¸�รà¹Œ|à¹€à¸ªà¸²รà¹Œ|อà¸²ทิตยà¹Œ)/.test(subjectName);

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

      var days = ['อà¸²ทิตยà¹Œ', 'à¸ˆันทรà¹Œ', 'อังคà¸²ร', 'à¸žุธ', 'à¸žฤหัà¸ªà¸šดà¸µ', 'ศุà¸�รà¹Œ', 'à¹€à¸ªà¸²รà¹Œ'];

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

      const cleanTarget = name.toString().trim().toLowerCase().replace(/^ครà¸¹/, '').trim();

      const match = teachersList.find(t => {

        const tNick = t.nickname.toLowerCase().trim().replace(/^ครà¸¹/, '').trim();

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

    

    logActivity(logUser, 'à¸šันทึà¸�คà¸²à¸šà¸ªอน', `วิà¸Šà¸²: ${log.subject} ครà¸¹: ${log.teacherRegular} หà¹‰อง: ${log.roomBranch}`);

    

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

      const cleanTarget = name.toString().trim().toLowerCase().replace(/^ครà¸¹/, '').trim();

      const match = teachersList.find(t => {

        const tNick = t.nickname.toLowerCase().trim().replace(/^ครà¸¹/, '').trim();

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

    

    logActivity(logUser, 'à¹�à¸�à¹‰à¹„ขà¸šันทึà¸�คà¸²à¸šà¸ªอน', `วิà¸Šà¸²: ${log.subject} (à¹�ถวทà¸µà¹ˆ: ${rowIndex})`);

    

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

    

    logActivity(logUser, 'à¹€à¸Šà¹‡คà¸Šืà¹ˆอลà¸²/à¹€ขà¹‰à¸²à¹€รà¸µยน', `วิà¸Šà¸²: ${subject} (${type}: ${checked})`);

    

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

    

    logActivity(logUser, 'ลà¸šà¸šันทึà¸�คà¸²à¸šà¸ªอน', `วิà¸Šà¸²: ${subject} (à¹�ถวทà¸µà¹ˆ: ${rowIndex})`);

    

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

// Manager Log (Data à¸œà¸ˆà¸�.)

// ----------------------------------------------------

function getManagerOTLogs(logUser) {

  if (logUser) checkTeacherBlock(logUser);

  try {

    const rawData = getSheetRows('Data à¸œà¸ˆà¸�.');

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

    let sheet = getDb().getSheetByName('Data à¸œà¸ˆà¸�.');

    if (!sheet) {

      sheet = getOrCreateSheet('Data à¸œà¸ˆà¸�.');

      if (!sheet) throw new Error('à¹„มà¹ˆà¸ªà¸²มà¸²รถà¸ªรà¹‰à¸²งà¸Šà¸µต Data à¸œà¸ˆà¸�. à¹„ดà¹‰');

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

        

        logActivity(logUser, 'à¸šันทึà¸�ออà¸�งà¸²นà¸œà¸¹à¹‰à¸ˆัดà¸�à¸²ร', 'à¸œà¸¹à¹‰à¸ˆัดà¸�à¸²ร: ' + log.managerName + ' ออà¸�งà¸²น: ' + (log.workOut || '-'));

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

        logActivity(logUser, 'à¸šันทึà¸�ออà¸�งà¸²นà¸œà¸¹à¹‰à¸ˆัดà¸�à¸²ร (à¹�ถวà¹ƒหมà¹ˆ)', 'à¸œà¸¹à¹‰à¸ˆัดà¸�à¸²ร: ' + log.managerName);

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

      logActivity(logUser, 'à¸šันทึà¸�à¹€ขà¹‰à¸²งà¸²นà¸œà¸¹à¹‰à¸ˆัดà¸�à¸²ร', 'à¸œà¸¹à¹‰à¸ˆัดà¸�à¸²ร: ' + log.managerName + ' à¸ªถà¸²นะ: ' + (log.isPresent ? 'มà¸²ทà¸³งà¸²น' : 'หยุดงà¸²น'));

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

    var folderName = 'รà¸¹ปลงà¹€วลà¸²_à¸œà¸ˆà¸�';

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

    if (name.includes('/') && !name.includes('à¹€ดà¸µà¹ˆยว') && !name.includes('ยà¹ˆอย')) {

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

    result.headers = targetSheet.getRange(1, 19, 5, numCols).getValues();

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

  const grades = ['อนุà¸šà¸²ล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];

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

          'ระดัà¸šà¸Šัà¹‰น',

          'à¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุล',

          'à¸Šืà¹ˆอà¹€ลà¹ˆน',

          'à¹‚รงà¹€รà¸µยน',

          'หà¹‰องà¹€รà¸µยนยà¹ˆอย',

          'à¹€à¸šอรà¹Œติดตà¹ˆอ',

          'à¸Šืà¹ˆอà¹‚ปรà¹„à¸Ÿลà¹Œà¹„ลนà¹Œ',

          'ID LINE',

          'à¸ªà¸²ขà¸²à¹€รà¸µยน',

          'à¸ªà¸²ขà¸²ทà¸µà¹ˆà¹€à¸�à¹‡à¸šà¹€งิน'

        ];

        const row5 = new Array(18).fill('');

        headers.forEach((h, idx) => {

          row5[idx] = h;

        });

        row5[10] = 'ยอดรวม'; // Col 11

        row5[11] = 'à¸ªà¹ˆวนลด'; // Col 12

        row5[12] = 'คงà¹€หลือ'; // Col 13

        row5[13] = 'ยอดà¸ˆà¹ˆà¸²ย'; // Col 14

        row5[14] = 'รà¸¹ดà¸šัตร'; // Col 15

        row5[15] = 'วันทà¸µà¹ˆà¸Šà¸³ระà¹€งิน'; // Col 16

        row5[16] = 'à¸Šà¹ˆองทà¸²งà¸Šà¸³ระà¹€งิน'; // Col 17

        row5[17] = 'à¸œà¸¹à¹‰รัà¸šà¹€งิน'; // Col 18

        

        sheet.getRange(5, 1, 1, 18).setValues([row5]);

      }

    });

  });

  

  // 2. Initialize private sheets (e.g. à¹€ดà¸µà¹ˆยว ป.1)

  grades.forEach(grade => {

    const name = `à¹€ดà¸µà¹ˆยว ${grade}`;

    let sheet = db.getSheetByName(name);

    if (!sheet) {

      sheet = db.insertSheet(name);

    }

    if (sheet.getLastRow() < 11) {

      sheet.clear();

      const headers = [

        'ประà¹€à¸ ทคอรà¹Œà¸ª',

        'à¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุล',

        'à¸Šืà¹ˆอà¹€ลà¹ˆน',

        'à¹‚รงà¹€รà¸µยน',

        'หà¹‰อง',

        'à¹€à¸šอรà¹Œติดตà¹ˆอ',

        'à¸Šืà¹ˆอà¹„ลนà¹Œ/à¸�ลุà¹ˆมติดตà¹ˆอ',

        'ID LINE',

        'à¹€รà¸µยน(à¸ªà¸²ขà¸²)',

        'à¹€à¸�à¹‡à¸šà¹€งิน(à¸ªà¸²ขà¸²)',

        'คอรà¹Œà¸ªà¹€รà¸µยน',

        'หมà¸²ยà¹€หตุ',

        'คà¹ˆà¸²à¹€รà¸µยนยà¸�มà¸²',

        'คà¹ˆà¸²à¹€รà¸µยน',

        'à¸ˆà¹ˆà¸²ยมà¸²',

        'คงà¹€หลือ',

        'วันทà¸µà¹ˆà¸Šà¸³ระà¹€งิน',

        'à¸Šà¹ˆองทà¸²งà¸Šà¸³ระà¹€งิน',

        'à¸œà¸¹à¹‰รัà¸šà¹€งิน',

        'à¸Šัà¹ˆวà¹‚มงà¹€รà¸µยน',

        'à¸Šัà¹ˆวà¹‚มงคงà¹€หลือ'

      ];

      sheet.getRange(11, 1, 1, 21).setValues([headers]);

    }

  });

  

  // 3. Initialize subgroup sheets (e.g. ยà¹ˆอย 2-3)

  const subgroups = ['ยà¹ˆอย 2-3', 'ยà¹ˆอย 4-5', 'ยà¹ˆอย 6-10'];

  subgroups.forEach(name => {

    let sheet = db.getSheetByName(name);

    if (!sheet) {

      sheet = db.insertSheet(name);

    }

    if (sheet.getLastRow() < 11) {

      sheet.clear();

      const headers = [

        'ประà¹€à¸ ทคอรà¹Œà¸ª',

        'à¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุล',

        'à¸Šืà¹ˆอà¹€ลà¹ˆน',

        'à¹‚รงà¹€รà¸µยน',

        'หà¹‰อง',

        'à¹€à¸šอรà¹Œติดตà¹ˆอ',

        'à¸Šืà¹ˆอà¹„ลนà¹Œ/à¸�ลุà¹ˆมติดตà¹ˆอ',

        'ID LINE',

        'à¹€รà¸µยน(à¸ªà¸²ขà¸²)',

        'à¹€à¸�à¹‡à¸šà¹€งิน(à¸ªà¸²ขà¸²)',

        'คอรà¹Œà¸ªà¹€รà¸µยน',

        'หมà¸²ยà¹€หตุ',

        'คà¹ˆà¸²à¹€รà¸µยนยà¸�มà¸²',

        'คà¹ˆà¸²à¹€รà¸µยน',

        'à¸ˆà¹ˆà¸²ยมà¸²',

        'คงà¹€หลือ',

        'วันทà¸µà¹ˆà¸Šà¸³ระà¹€งิน',

        'à¸Šà¹ˆองทà¸²งà¸Šà¸³ระà¹€งิน',

        'à¸œà¸¹à¹‰รัà¸šà¹€งิน',

        'à¸Šัà¹ˆวà¹‚มงà¹€รà¸µยน',

        'à¸Šัà¹ˆวà¹‚มงคงà¹€หลือ'

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

  const matches = str.match(/(\d+)\s*à¸Šม\.\s*(\d+)\s*นà¸²ทà¸µ/);

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

  return (isNeg ? '-' : '') + hrs + ' à¸Šม. ' + mins + ' นà¸²ทà¸µ';

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

  if (s.includes('à¸Šม.') || s.includes('นà¸²ทà¸µ')) {

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

  const grades = ['อนุà¸šà¸²ล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];

  for (let g of grades) {

    if (sheetName.includes(g)) return g;

  }

  return 'อนุà¸šà¸²ล';

}

function debugSearchNada() {

  const db = getDb();

  

  // รันระà¸šà¸šประมวลà¸œลà¸�à¹ˆอนดึงขà¹‰อมà¸¹ลมà¸²ดà¸µà¸šัà¹Šà¸�

  getPrivateSheetData('à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล');

  

  const learnSheet = db.getSheetByName('Data Learn');

  const data = learnSheet.getDataRange().getValues();

  const results = [];

  for (let i = 1; i < data.length; i++) {

    const subject = data[i][0] ? data[i][0].toString() : '';

    if (subject.includes('ณดà¸²') || subject.includes('ลินลดà¸²')) {

      results.push(`Row ${i + 1}: ${subject} (Live: ${data[i][6]}, Online: ${data[i][7]}, Makeup: ${data[i][10]}, Hours: ${data[i][12]}, Date: ${data[i][13]})`);

    }

  }

  

  const kgSheet = db.getSheetByName('à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล');

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

  const grades = ['อนุà¸šà¸²ล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];

  let matchedGrade = '';

  

  grades.forEach(g => {

    if (subject.indexOf(g) !== -1) matchedGrade = g;

  });

  

  let sheetName = '';

  if (subject.indexOf('à¹€ดà¸µà¹ˆยว') !== -1) {

    if (matchedGrade) sheetName = 'à¹€ดà¸µà¹ˆยว ' + matchedGrade;

  } else if (subject.indexOf('ยà¹ˆอย') !== -1) {

    if (subject.indexOf('2-3') !== -1) sheetName = 'ยà¹ˆอย 2-3';

    else if (subject.indexOf('4-5') !== -1) sheetName = 'ยà¹ˆอย 4-5';

    else if (subject.indexOf('6-10') !== -1) sheetName = 'ยà¹ˆอย 6-10';

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

    

    logActivity(logUser, 'à¸šันทึà¸�คà¸²à¸šà¸ªอนหลà¸²ยรà¸²ยà¸�à¸²ร', 'à¸ˆà¸³นวน: ' + logs.length + ' วิà¸Šà¸²: ' + logs[0].subject);

    

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

        try { processClassHoursDeduction(log, false); } catch(e){}

        

        datesToInvalidate.add(oldLog.date);

        datesToInvalidate.add(log.date);

        teachersToInvalidate.add(oldLog.teacherRegular);

        if (oldLog.teacherSub) teachersToInvalidate.add(oldLog.teacherSub);

        teachersToInvalidate.add(log.teacherRegular);

        if (log.teacherSub) teachersToInvalidate.add(log.teacherSub);

        actionLog.push('à¹�à¸�à¹‰à¹„ข: ' + log.subject);

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

      actionLog.push('à¹€à¸žิà¹ˆมà¹ƒหมà¹ˆ: ' + adds.length + ' รà¸²ยà¸�à¸²ร');

    }

    

    if (actionLog.length > 0) {

      logActivity(logUser, 'Batch Update คลà¸²à¸ªà¹€รà¸µยน', actionLog.join(', '));

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

        

        // คà¹‰นหà¸²ดà¹‰วยà¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุลà¹€ตà¹‡มà¹€ปà¹‡นหลัà¸� (exact match)

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

    

    // ดึงรà¸²ยà¸�à¸²รà¸Šืà¹ˆอคอรà¹Œà¸ªทัà¹‰งหมดของนัà¸�à¹€รà¸µยนคนนà¸µà¹‰ (ซึà¹ˆงà¸�รองดà¹‰วยà¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุลตรงà¸�ันà¹�ลà¹‰ว)

    const enrolledCourseNames = allStudents.map(s => s.courseName.toLowerCase().trim()).filter(c => c.length > 0);

    

    if (classSheet) {

      const cData = classSheet.getDataRange().getValues();

      for (let i = 1; i < cData.length; i++) {

        const row = cData[i];

        const subject = row[0] ? row[0].toString().trim() : '';

        const subjectClean = subject.toLowerCase().trim();

        

        // à¹€à¸Šà¹‡ควà¹ˆà¸²วิà¸Šà¸²à¹ƒน Data Learn ตรงà¸�ัà¸šคอรà¹Œà¸ªทà¸µà¹ˆลงทะà¹€à¸šà¸µยนà¸ˆริง

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

    

    if (rowIndex === -1) throw new Error('à¹„มà¹ˆà¸žà¸šรà¸²ยà¸Šืà¹ˆอนัà¸�à¹€รà¸µยนà¹ƒนตà¸²รà¸²งหลัà¸�');

    

    const paidAmount = parseFloat(paymentData.paid) || 0;

    const paymentDate = paymentData.paymentDate || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy');

    const paymentChannel = paymentData.paymentChannel || 'à¸�à¸ªิà¸�ร à¸šัà¸�à¸Šà¸µà¸šริษัท(à¸ªà¹�à¸�น)';

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

    // à¸šันทึà¸�à¹€งินà¸Šà¸³ระà¹€à¸žิà¹ˆมà¹€ติมลงรอà¸šà¸Šà¸³ระ 1-4 ทà¸µà¹ˆวà¹ˆà¸²งอยà¸¹à¹ˆà¹‚ดยอัตà¹‚นมัติ

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

    if (classType.indexOf('à¹€ดà¸µà¹ˆยว') !== -1 || classType.indexOf('ยà¹ˆอย') !== -1) {

      let rate = 250;

      if (round.toLowerCase().indexOf('ex') !== -1) rate = 312.5;

      else if (classType.indexOf('ยà¹ˆอย 2-3') !== -1) rate = 3000 / 16;

      else if (classType.indexOf('ยà¹ˆอย 4-5') !== -1) rate = 2500 / 16;

      else if (classType.indexOf('ยà¹ˆอย 6-10') !== -1) rate = 2000 / 16;

      

      let minutes = 0;

      if (hours.indexOf(':') !== -1) {

        const parts = hours.split(':');

        minutes = (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);

      }

      

      const calcFull = (minutes * rate) / 60;

      const netOutstanding = (newPaid + carried) - calcFull;

      const totalHrs = netOutstanding / rate;

      

      const formattedHrs = Math.floor(Math.abs(totalHrs)) + ' à¸Šม. ' + Math.round(Math.abs(totalHrs) % 1 * 60) + ' นà¸²ทà¸µ';

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

    logActivity(logUser, 'à¸šันทึà¸�à¸Šà¸³ระà¹€งินคà¹‰à¸²งà¸ˆà¹ˆà¸²ย', `นัà¸�à¹€รà¸µยน: ${name} ยอดà¸Šà¸³ระà¹€à¸žิà¹ˆม: ${paidAmount} ยอดà¸ˆà¹ˆà¸²ยรวม: ${newPaid}`);

    return { success: true };

  } catch (err) {

    return { success: false, error: err.message };

  }

}

// à¸šันทึà¸�à¸ªถà¸²นะà¸�à¸²รà¹€งินà¹�ละà¸�à¸²รà¸Šà¸³ระà¹€งินรà¸²ยรัà¸šà¸žรà¹‰อมระà¸šà¸šà¹€à¸Šืà¹ˆอมขà¹‰อมà¸¹ลà¹ƒนà¸Šà¸µต

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

        // อัปà¹€ดตขà¹‰อมà¸¹ลà¹ƒนà¸Šà¹ˆองทà¸²งà¸Šà¸³ระà¹€งิน (คอลัมนà¹Œ N/14) à¹�ละ ตรวà¸ˆà¸ªอà¸šà¹�ลà¹‰ว (คอลัมนà¹Œ Y/25)

        sheet.getRange(rowIndex, 14).setValue(up.paymentChannel);

        sheet.getRange(rowIndex, 25).setValue(up.isChecked ? 1 : 0);

        

        // à¸ªà¹ˆงขà¹‰อมà¸¹ลทà¸µà¹ˆอัปà¹€ดตà¹„ปà¸šันทึà¸�ยังà¸Šà¸µตà¹�ยà¸�ตà¸²มระดัà¸šà¸Šัà¹‰น

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

          paymentChannel: up.paymentChannel, // à¹ƒà¸Šà¹‰คà¹ˆà¸²ทà¸µà¹ˆà¹€ลือà¸�à¹ƒหมà¹ˆ

          staff: rowVals[14] ? rowVals[14].toString().trim() : '',

          classHours: rowVals[21] ? rowVals[21].toString().trim() : '',

          classHoursLeft: rowVals[22] ? rowVals[22].toString().trim() : '',

          classType: rowVals[23] ? rowVals[23].toString().trim() : 'à¹€ดà¸µà¹ˆยว'

        };

        syncToGradeSheet(studentObj);

      }

    });

    

    logActivity(logUser, 'à¸šันทึà¸�à¸ªถà¸²นะà¸�à¸²รà¸Šà¸³ระà¹€งินรà¸²ยรัà¸š', `อัปà¹€ดตà¸ˆà¸³นวน ${updates.length} รà¸²ยà¸�à¸²ร`);

    invalidateStudentCache();

    return { success: true };

  } catch (e) {

    return { success: false, error: e.message };

  }

}

function pingActiveUser(username) {

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

    users[username] = now;

    

    const activeUsernames = [];

    const cleaned = {};

    for (const u in users) {

      if (now - users[u] < 45000) {

        cleaned[u] = users[u];

        activeUsernames.push(u);

      }

    }

    

    cache.put('active_users_list', JSON.stringify(cleaned), 300);

    return activeUsernames;

  } catch (e) {

    try {

      const cache = CacheService.getScriptCache();

      let listStr = cache.get('active_users_list') || '{}';

      let users = JSON.parse(listStr);

      return Object.keys(users);

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

  

  // Group students by sheet name (for à¸�ลุà¹ˆมหลัà¸�)

  const mainGroupSheets = {};

  

  students.forEach(s => {

    const classType = s.classType || '';

    if (classType.includes('à¹€ดà¸µà¹ˆยว') || classType.includes('ยà¹ˆอย')) {

      return;

    }

    

    let suffix = '1';

    const branchLearn = s.branchLearn || '';

    if (branchLearn.includes('à¸ªà¸²ขà¸²2') || branchLearn.includes('2')) suffix = '2';

    else if (branchLearn.includes('à¸ªà¸²ขà¸²3') || branchLearn.includes('3')) suffix = '3';

    

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

      const headerRow1 = sheet.getRange(1, 19, 1, lastCol - 18).getValues()[0];

      

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

      sheet.getRange(1, 19, 1, courses.length).setValues([hRow1]);

      sheet.getRange(2, 19, 1, courses.length).setValues([hRow2]);

      sheet.getRange(3, 19, 1, courses.length).setValues([hRow3]);

      sheet.getRange(4, 19, 1, courses.length).setValues([hRow4]);

    }

    

    // 2. Write Row 5 headers

    const row5Headers = [

      'ระดัà¸šà¸Šัà¹‰น', 'à¸Šืà¹ˆอ-นà¸²มà¸ªà¸�ุล', 'à¸Šืà¹ˆอà¹€ลà¹ˆน', 'à¹‚รงà¹€รà¸µยน', 'หà¹‰องà¹€รà¸µยนยà¹ˆอย',

      'à¹€à¸šอรà¹Œติดตà¹ˆอ', 'à¸Šืà¹ˆอà¹‚ปรà¹„à¸Ÿลà¹Œà¹„ลนà¹Œ', 'ID LINE', 'à¸ªà¸²ขà¸²à¹€รà¸µยน', 'à¸ªà¸²ขà¸²ทà¸µà¹ˆà¹€à¸�à¹‡à¸šà¹€งิน',

      'ยอดรวม', 'à¸ªà¹ˆวนลด', 'คงà¹€หลือ', 'ยอดà¸ˆà¹ˆà¸²ย', 'รà¸¹ดà¸šัตร', 'วันทà¸µà¹ˆà¸Šà¸³ระà¹€งิน', 'à¸Šà¹ˆองทà¸²งà¸Šà¸³ระà¹€งิน', 'à¸œà¸¹à¹‰รัà¸šà¹€งิน'

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

  const sheet = db.getSheetByName('Data à¸œà¸ˆà¸�.');

  if (!sheet) return;

  

  const lastRow = sheet.getLastRow();

  const lastCol = sheet.getLastColumn();

  if (lastRow < 1) return;

  

  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  const col8Val = headerRow[7] ? headerRow[7].toString().trim() : '';

  if (col8Val === 'หยุด') {

    return; // Already migrated!

  }

  

  Logger.log('Migrating Data à¸œà¸ˆà¸�. sheet to compact format');

  

  const allRows = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  const migratedRows = [];

  

  allRows.forEach((row, idx) => {

    if (idx === 0) {

      migratedRows.push([

        'à¸Šืà¹ˆอà¸œà¸¹à¹‰à¸ˆัดà¸�à¸²ร', 'à¹€วลà¸²à¹€ขà¹‰à¸²OT', 'à¹€วลà¸²ออà¸�OT', 'à¹€วลà¸²à¹€ขà¹‰à¸²งà¸²น', 'à¹€วลà¸²ออà¸�งà¸²น',

        'หมà¸²ยà¹€หตุ รà¸²ยละà¹€อà¸µยด OT', 'มà¸²', 'หยุด', 'à¸Šม.OT', 'à¸Šม.งà¸²น', 'วันทà¸µà¹ˆ'

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

      "à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล", "à¹€ดà¸µà¹ˆยว ป.1", "à¹€ดà¸µà¹ˆยว ป.2", "à¹€ดà¸µà¹ˆยว ป.3", "à¹€ดà¸µà¹ˆยว ป.4", "à¹€ดà¸µà¹ˆยว ป.5", "à¹€ดà¸µà¹ˆยว ป.6",

      "à¹€ดà¸µà¹ˆยว ม.1", "à¹€ดà¸µà¹ˆยว ม.2", "à¹€ดà¸µà¹ˆยว ม.3", "à¹€ดà¸µà¹ˆยว ม.4", "à¹€ดà¸µà¹ˆยว ม.5", "à¹€ดà¸µà¹ˆยว ม.6",

      "ยà¹ˆอย 2-3", "ยà¹ˆอย 4-5", "ยà¹ˆอย 6-10"

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

        

        if (!name || note.indexOf('à¹€รà¸µยนครà¸šà¹�ลà¹‰ว') !== -1) return;

        

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

  const grades = ['อนุà¸šà¸²ล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];

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

    

    // Private metrics (à¸ž grade)

    const privateSheetName = 'à¸ž ' + grade;

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

  const s1 = db.getSheetByName('à¹€ดà¸µà¹ˆยว ป.1');

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

      if (name.match(/^(ป\.|ม\.|อนุà¸šà¸²ล)/) || name.match(/^(ยà¹ˆอย)/)) {

        clearCacheObject('enroll_map_' + name.replace(/\s+/g, '_'));

      }

    });

  } catch (e) {}

}

function ensureTeacherIDs() {

  try {

    const db = getDb();

    const sheet = db.getSheetByName('TeachersDB');

    if (!sheet) return;

    const lastCol = sheet.getLastColumn();

    if (lastCol < 9) {

      sheet.getRange(1, 9).setValue('TeacherID');

    } else {

      const headerVal = sheet.getRange(1, 9).getValue().toString().trim();

      if (headerVal !== 'TeacherID') {

        sheet.getRange(1, 9).setValue('TeacherID');

      }

    }

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) return;

    const teachersRange = sheet.getRange(2, 1, lastRow - 1, 9);

    const teachersValues = teachersRange.getValues();

    let maxId = 0;

    for (let i = 0; i < teachersValues.length; i++) {

      const idVal = teachersValues[i][8] ? teachersValues[i][8].toString().trim() : '';

      if (idVal.startsWith('tutor_')) {

        const numPart = parseInt(idVal.replace('tutor_', ''));

        if (!isNaN(numPart) && numPart > maxId) {

          maxId = numPart;

        }

      }

    }

    let updated = false;

    for (let i = 0; i < teachersValues.length; i++) {

      const tNick = teachersValues[i][0] ? teachersValues[i][0].toString().trim() : '';

      const currentId = teachersValues[i][8] ? teachersValues[i][8].toString().trim() : '';

      if (tNick !== '' && currentId === '') {

        maxId++;

        const newId = 'tutor_' + String(maxId).padStart(4, '0');

        teachersValues[i][8] = newId;

        updated = true;

      }

    }

    if (updated) {

      teachersRange.setValues(teachersValues);

    }

  } catch (err) {}

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

    const withoutKru = cleanTeacher.replace(/^ครà¸¹/, '').trim();

    const variations = [cleanTeacher, withoutKru, 'ครà¸¹' + withoutKru];

    variations.forEach(t => {

      for (let y = thisYear - 2; y <= thisYear + 2; y++) {

        clearCacheObject('yearly_pay_v2_' + t + '_' + y);

      }

    });

  });

}

function dumpData() {

  var db = SpreadsheetApp.openById('1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI');

  var tSheet = db.getSheetByName('TeachersDB');

  var tData = tSheet ? tSheet.getRange(1, 1, 5, 10).getValues() : 'No TeachersDB';

  var uSheet = db.getSheetByName('UsersDB');

  var uData = uSheet ? uSheet.getRange(1, 1, 5, 5).getValues() : 'No UsersDB';

  var lSheet = db.getSheetByName('Data Learn');

  var lData = lSheet ? lSheet.getRange(1, 1, 5, 10).getValues() : 'No Data Learn';

  return JSON.stringify({ teachers: tData, users: uData, dataLearn: lData });

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

    teachers: getSheetData('TeachersDB'),

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

    

    const thaiDays = ['อà¸²ทิตยà¹Œ', 'à¸ˆันทรà¹Œ', 'อังคà¸²ร', 'à¸žุธ', 'à¸žฤหัà¸ªà¸šดà¸µ', 'ศุà¸�รà¹Œ', 'à¹€à¸ªà¸²รà¹Œ'];

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

    'อนุà¸šà¸²ล/1','ป.1/1','ป.2/1','ป.3/1','ป.4/1','ป.5/1','ป.6/1','ม.1/1','ม.2/1','ม.3/1','ม.4/1','ม.5/1','ม.6/1',

    'อนุà¸šà¸²ล/2','ป.1/2','ป.2/2','ป.3/2','ป.4/2','ป.5/2','ป.6/2','ม.1/2','ม.2/2','ม.3/2','ม.4/2','ม.5/2','ม.6/2',

    'อนุà¸šà¸²ล/3','ป.1/3','ป.2/3','ป.3/3','ป.4/3','ป.5/3','ป.6/3','ม.1/3','ม.2/3','ม.3/3','ม.4/3','ม.5/3','ม.6/3',

    'à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล','à¹€ดà¸µà¹ˆยว ป.1','à¹€ดà¸µà¹ˆยว ป.2','à¹€ดà¸µà¹ˆยว ป.3','à¹€ดà¸µà¹ˆยว ป.4','à¹€ดà¸µà¹ˆยว ป.5','à¹€ดà¸µà¹ˆยว ป.6','à¹€ดà¸µà¹ˆยว ม.1','à¹€ดà¸µà¹ˆยว ม.2','à¹€ดà¸µà¹ˆยว ม.3','à¹€ดà¸µà¹ˆยว ม.4','à¹€ดà¸µà¹ˆยว ม.5','à¹€ดà¸µà¹ˆยว ม.6',

    'ยà¹ˆอย 2-3','ยà¹ˆอย 4-5','ยà¹ˆอย 6-10'

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

    

    // Fallback name search if ID is temp or changed

    if (!row) {

      for (let i = 1; i < data.length; i++) {

        const studentName = data[i][1] ? data[i][1].toString().trim() : '';

        if (id.toString().toLowerCase().includes(studentName.toLowerCase()) && studentName.length > 0) {

          row = data[i];

          break;

        }

      }

    }

    

    if (!row) {

      return { success: false, error: 'à¹„มà¹ˆà¸žà¸šขà¹‰อมà¸¹ลนัà¸�à¹€รà¸µยนà¸Šืà¹ˆอนà¸µà¹‰à¹ƒนà¸�à¸²นขà¹‰อมà¸¹ล' };

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

      ClassType: row[23] ? row[23].toString().trim() : 'à¹€ดà¸µà¹ˆยว'

    };

    

    // Installments mappings

    result.PayRound1Date = row[12] ? row[12].toString().trim() : '';

    result.PayRound1Amount = parseFloat(row[9]) || 0;

    result.PayRound1Channel = row[13] ? row[13].toString().trim() : '';

    result.PayRound1Staff = row[14] ? row[14].toString().trim() : '';

    result.PayRound1Time = row[7] ? row[7].toString().trim() : '';

    

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

      "à¹€ดà¸µà¹ˆยว อนุà¸šà¸²ล", "à¹€ดà¸µà¹ˆยว ป.1", "à¹€ดà¸µà¹ˆยว ป.2", "à¹€ดà¸µà¹ˆยว ป.3", "à¹€ดà¸µà¹ˆยว ป.4", "à¹€ดà¸µà¹ˆยว ป.5", "à¹€ดà¸µà¹ˆยว ป.6",

      "à¹€ดà¸µà¹ˆยว ม.1", "à¹€ดà¸µà¹ˆยว ม.2", "à¹€ดà¸µà¹ˆยว ม.3", "à¹€ดà¸µà¹ˆยว ม.4", "à¹€ดà¸µà¹ˆยว ม.5", "à¹€ดà¸µà¹ˆยว ม.6",

      "ยà¹ˆอย 2-3", "ยà¹ˆอย 4-5", "ยà¹ˆอย 6-10"

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

    if (col16Val === 'วันทà¸µà¹ˆà¸Šà¸³ระà¹€งิน') {

      return; // Already migrated!

    }

    

    Logger.log('Migrating sheet to 19 columns format: ' + name);

    

    // Insert 3 columns at index 16

    sheet.insertColumns(16, 3);

    

    // Add the headers for the 3 new columns

    sheet.getRange(5, 16).setValue('วันทà¸µà¹ˆà¸Šà¸³ระà¹€งิน');

    sheet.getRange(5, 17).setValue('à¸Šà¹ˆองทà¸²งà¸Šà¸³ระà¹€งิน');

    sheet.getRange(5, 18).setValue('à¸œà¸¹à¹‰รัà¸šà¹€งิน');

  });

}

function migrateDataLearnFromOldDB() {

  const oldDbId = '1VURVA77pcBJSCJNm4WazWBPpgeovArL5iSAHNAkWdec';

  const newDbId = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';

  

  const oldDb = SpreadsheetApp.openById(oldDbId);

  const newDb = SpreadsheetApp.openById(newDbId);

  

  const oldSheet = oldDb.getSheetByName('Data Learn');

  if (!oldSheet) {

    Logger.log('à¹„มà¹ˆà¸žà¸šà¸Šà¸µต Data Learn à¹ƒนà¸�à¸²นขà¹‰อมà¸¹ลà¹€à¸�à¹ˆà¸²');

    return { success: false, error: 'à¹„มà¹ˆà¸žà¸šà¸Šà¸µต Data Learn à¹ƒนà¸�à¸²นขà¹‰อมà¸¹ลà¹€à¸�à¹ˆà¸²' };

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

    Logger.log('à¹‚อนยà¹‰à¸²ยขà¹‰อมà¸¹ล Data Learn à¸ªà¸³à¹€รà¹‡à¸ˆ à¸ˆà¸³นวน ' + data.length + ' à¹�ถว');

    return { success: true, message: 'à¹‚อนยà¹‰à¸²ยขà¹‰อมà¸¹ล Data Learn à¸ªà¸³à¹€รà¹‡à¸ˆ à¸ˆà¸³นวน ' + (data.length - 1) + ' à¹�ถว' };

  } else {

    Logger.log('à¸Šà¸µต Data Learn à¹€à¸�à¹ˆà¸²à¹„มà¹ˆมà¸µขà¹‰อมà¸¹ล');

    return { success: false, error: 'à¸Šà¸µต Data Learn à¹€à¸�à¹ˆà¸²à¹„มà¹ˆมà¸µขà¹‰อมà¸¹ล' };

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

    

    // Find rows with "หลัà¸�" AND date >= 18/5/2026

    var count = 0;

    for (var i = 0; i < data.length && count < 5; i++) {

      var colA = data[i][0] ? data[i][0].toString().trim() : '';

      if (colA.indexOf('หลัà¸�') < 0) continue;

      

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

      var gradeMatch = colA.match(/(อนุà¸šà¸²ล|ป\.\d|ม\.\d)/);

      var branchMatch = roomBranch.match(/à¸ªà¸²ขà¸²\s*(\d)/);

      var grade = gradeMatch ? gradeMatch[1] : 'NO_GRADE';

      var branch = branchMatch ? branchMatch[1] : '1';

      var targetSheet = grade + '/' + branch;

      results.push('Target sheet: ' + targetSheet);

      

      // Extract keyword

      if (gradeMatch) {

        var baseSubject = colA.substring(0, gradeMatch.index).trim();

        var keyword = baseSubject.replace(/^หลัà¸�\s*/, '').trim();

        results.push('Keyword: "' + keyword + '"');

      }

      

      // Day of week

      var dayNames = ['อà¸²ทิตยà¹Œ', 'à¸ˆันทรà¹Œ', 'อังคà¸²ร', 'à¸žุธ', 'à¸žฤหัà¸ªà¸šดà¸µ', 'ศุà¸�รà¹Œ', 'à¹€à¸ªà¸²รà¹Œ'];

      var dayOfWeek = dayNames[new Date(y, m-1, d).getDay()];

      results.push('Day: ' + dayOfWeek);

      

      // Try resolving

      var resolved = resolveDynamicCourseName(colA, dateStr, roomBranch);

      results.push('RESOLVED: ' + resolved);

      results.push('CHANGED: ' + (resolved !== colA ? 'YES âœ…' : 'NO â�Œ'));

      results.push('');

    }

    

    if (count === 0) {

      results.push('⚠️� No "หลัà¸�" rows found with date >= 18/5/2026 in last 200 rows');

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

      

      if (subject.indexOf('หลัà¸�') >= 0 && dateStr) {

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

      const folders = DriveApp.getFoldersByName(folderName);

      if (folders.hasNext()) {

        folder = folders.next();

      } else {

        folder = DriveApp.createFolder(folderName);

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

    

    // 3. Save directly to StatusDB

    const std = {

      name: studentData.name,

      nickname: studentData.nickname,

      school: studentData.school || '-',

      contact: studentData.contact,

      branchLearn: studentData.branchLearn,

      branchPay: studentData.branchLearn,

      paymentTimeNote: slipUrl !== '-' ? 'ÊÅÔ»á¹º: ' + slipUrl : 'ÂÑ§äÁèä´éá¹ºÊÅÔ»',

      extraNote: 'ÇÔªÒ·ÕèÊÁÑ¤Ã: ' + studentData.course,

      paid: paidAmount,

      full: paidAmount,

      outstanding: 0,

      paymentDate: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy'),

      paymentChannel: slipUrl !== '-' ? 'âÍ¹à§Ô¹ (ÊÅÔ»á¹ºÍÍ¹äÅ¹ì)' : 'ÃÍªÓÃÐà§Ô¹',

      staff: 'Online Registration',

      round: 'M1/69',

      grade: studentData.grade,

      classSection: '-',

      lineName: studentData.nickname,

      lineId: studentData.lineId || '',

      carriedForwardFee: 0,

      classHours: '',

      classHoursLeft: '',

      classType: 'à´ÕèÂÇ',

      isChecked: false

    };

    

    Logger.log('Step 3: Calling syncStudentToStatusDB...');

    syncStudentToStatusDB(std);

    Logger.log('Step 3: syncStudentToStatusDB completed');

    

    invalidateStudentCache();

    

    logActivity('System', '¹Ñ¡àÃÕÂ¹Å§·ÐàºÕÂ¹ÍÍ¹äÅ¹ì (StatusDB)', 'ª×èÍ¹Ñ¡àÃÕÂ¹: ' + studentData.name + ', ÂÍ´âÍ¹: ß' + paidAmount);

    Logger.log('=== submitPublicRegistration SUCCESS ===');

    return { success: true };

  } catch (err) {

    Logger.log('=== submitPublicRegistration ERROR ===');

    Logger.log('Error: ' + err.toString());

    Logger.log('Stack: ' + err.stack);

    return { success: false, error: err.toString() };

  }

}

