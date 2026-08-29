# -*- coding: utf-8 -*-
"""
Replace getStudentsListRaw in Code.js to read from grade sheets
instead of StatusDB, pulling course names and fixing date formatting.
"""

with open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

old_func = '''function getStudentsListRaw() {

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

      branchPay: row[5] ? row[5].toString().trim() : '',

      paymentTimeNote: row[6] ? row[6].toString().trim() : '',

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

      classType: row[23] ? row[23].toString().trim() : '\\u0e40\\u0e14\\u0e35\\u0e48\\u0e22\\u0e27',

      isChecked: row[24] ? parseInt(row[24]) === 1 : false

    });

  });

  return students;

}'''

new_func = '''function getStudentsListRaw() {
  const db = getDb();
  const sheets = db.getSheets();
  const students = [];
  
  // Valid patterns for grade sheets
  const groupPattern = /^(\\u0e2d\\u0e19\\u0e38\\u0e1a\\u0e32\\u0e25|\\u0e1b\\.1|\\u0e1b\\.2|\\u0e1b\\.3|\\u0e1b\\.4|\\u0e1b\\.5|\\u0e1b\\.6|\\u0e21\\.1|\\u0e21\\.2|\\u0e21\\.3|\\u0e21\\.4|\\u0e21\\.5|\\u0e21\\.6)\\/(1|2|3)$/;
  const singlePattern = /^(\\u0e40\\u0e14\\u0e35\\u0e48\\u0e22\\u0e27|\\u0e22\\u0e48\\u0e2d\\u0e22) (\\u0e2d\\u0e19\\u0e38\\u0e1a\\u0e32\\u0e25|\\u0e1b\\.1|\\u0e1b\\.2|\\u0e1b\\.3|\\u0e1b\\.4|\\u0e1b\\.5|\\u0e1b\\.6|\\u0e21\\.1|\\u0e21\\.2|\\u0e21\\.3|\\u0e21\\.4|\\u0e21\\.5|\\u0e21\\.6|2-3|4-5|6-10)$/;
  
  // Build a map of student payments from StatusDB for Payment Channel and Staff
  const statusSheet = db.getSheetByName('StatusDB');
  const paymentMap = {};
  if (statusSheet) {
    const statusLastRow = statusSheet.getLastRow();
    if (statusLastRow > 0) {
      const statusData = statusSheet.getRange(1, 1, statusLastRow, 25).getValues();
      statusData.forEach(row => {
        const sName = row[1] ? row[1].toString().trim() : '';
        const sPaymentChannel = row[13] ? row[13].toString().trim() : '\\u0e01\\u0e2a\\u0e34\\u0e01\\u0e23 \\u0e1a\\u0e31\\u0e0d\\u0e0a\\u0e35\\u0e1a\\u0e23\\u0e34\\u0e29\\u0e31\\u0e17(\\u0e2a\\u0e41\\u0e01\\u0e19)';
        const sStaff = row[14] ? row[14].toString().trim() : '';
        if (sName) {
          paymentMap[sName] = {
            paymentChannel: sPaymentChannel,
            staff: sStaff
          };
        }
      });
    }
  }

  let studentIdCounter = 1;

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    let isGradeSheet = groupPattern.test(sheetName) || singlePattern.test(sheetName);
    if (!isGradeSheet) return;
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 6 || lastCol < 16) return;
    
    const isSingle = sheetName.includes('\\u0e40\\u0e14\\u0e35\\u0e48\\u0e22\\u0e27') || sheetName.includes('\\u0e22\\u0e48\\u0e2d\\u0e22');
    const startRow = isSingle ? 12 : 6;
    if (lastRow < startRow) return;
    
    const headerRow1 = sheet.getRange(1, 19, 1, lastCol - 18).getValues()[0];
    const headerRow2 = sheet.getRange(2, 19, 1, lastCol - 18).getValues()[0];
    
    const sheetCourses = [];
    for (let i = 0; i < headerRow1.length; i++) {
      if (headerRow1[i]) {
        sheetCourses.push({
          name: headerRow1[i].toString().trim(),
          colIndex: 19 + i,
          price: parseFloat(headerRow2[i]) || 0
        });
      }
    }
    
    const dataRange = sheet.getRange(startRow, 1, lastRow - (startRow - 1), lastCol).getValues();
    
    dataRange.forEach(row => {
      const studentName = row[1] ? row[1].toString().trim() : '';
      if (!studentName) return;
      
      let calcFull = 0;
      const enrolledCourses = [];
      sheetCourses.forEach(c => {
        const val = row[c.colIndex - 1];
        if (val !== '' && val !== null && val !== undefined) {
           calcFull += c.price;
           enrolledCourses.push(c.name);
        }
      });
      
      const rawDiscount = parseFloat(row[11]) || 0;
      const rawPaid = parseFloat(row[13]) || 0;
      const calcOutstanding = calcFull - rawDiscount - rawPaid;
      
      const id = 'DB_' + studentIdCounter++;
      
      students.push({
        id: id,
        name: studentName,
        nickname: row[2] ? row[2].toString().trim() : '',
        school: row[3] ? row[3].toString().trim() : '',
        contact: row[5] ? row[5].toString().trim() : '',
        branchLearn: row[8] ? row[8].toString().trim() : '',
        branchPay: row[9] ? row[9].toString().trim() : '',
        paid: rawPaid,
        full: calcFull,
        outstanding: calcOutstanding,
        paymentDate: row[15] ? cleanSheetDate(row[15]) : '',
        paymentChannel: (paymentMap[studentName] || {}).paymentChannel || '\\u0e01\\u0e2a\\u0e34\\u0e01\\u0e23 \\u0e1a\\u0e31\\u0e0d\\u0e0a\\u0e35\\u0e1a\\u0e23\\u0e34\\u0e29\\u0e31\\u0e17(\\u0e2a\\u0e41\\u0e01\\u0e19)',
        staff: (paymentMap[studentName] || {}).staff || '',
        round: enrolledCourses.join(', '),
        grade: row[0] ? row[0].toString().trim() : '',
        classSection: row[4] instanceof Date ? '' : (row[4] ? row[4].toString().trim().replace(/GMT\\+\\d{4}.*$/, '').trim() : ''),
        lineName: row[6] ? row[6].toString().trim() : '',
        lineId: row[7] ? row[7].toString().trim() : '',
        classType: isSingle ? sheetName : '\\u0e01\\u0e25\\u0e38\\u0e48\\u0e21\\u0e2b\\u0e25\\u0e31\\u0e01',
        discount: rawDiscount,
        sheetName: sheetName
      });
    });
  });
  
  return students;
}'''

if old_func in code:
    code = code.replace(old_func, new_func)
    print("[OK] Code.js: Replaced getStudentsListRaw (exact match)")
else:
    print("[WARN] Code.js: Exact match not found, trying to find function boundaries...")
    # Find the function start and end
    start_marker = 'function getStudentsListRaw() {'
    end_marker = '\nfunction getAllStudentsFromSubgroupSheets()'
    
    start_idx = code.find(start_marker)
    end_idx = code.find(end_marker)
    
    if start_idx != -1 and end_idx != -1:
        code = code[:start_idx] + new_func + '\n' + code[end_idx:]
        print(f"[OK] Code.js: Replaced getStudentsListRaw by boundary (chars {start_idx}-{end_idx})")
    else:
        print(f"[FAIL] Code.js: Could not find function boundaries (start={start_idx}, end={end_idx})")

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(code)
print("[OK] Code.js: Saved")
