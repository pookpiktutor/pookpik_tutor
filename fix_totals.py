import io

with io.open('Code.js', 'r', encoding='utf-8') as f:
    c = f.read()

old_func = '''function migrateGradeSheetsFinancials() {
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
        const full = parseFloat((row[10] || 0).toString().replace(/,/g, '')) || 0;
        const outstanding = full - paid;
        
        if (!studentsMap[sheetName]) studentsMap[sheetName] = [];
        studentsMap[sheetName].push({
          name: name,
          full: full,
          paid: paid,
          outstanding: outstanding
        });
      }
    }
  });
  
  let totalUpdated = 0;
  for (const sheetName in studentsMap) {
    const sheet = db.getSheetByName(sheetName);
    if (!sheet) continue;
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 6) continue;
    
    const namesRange = sheet.getRange(6, 2, lastRow - 5, 1).getValues();
    const mapForSheet = studentsMap[sheetName];
    
    const dataRange = sheet.getRange(6, 11, lastRow - 5, 4);
    const dataValues = dataRange.getValues();
    
    let changed = false;
    for (let r = 0; r < namesRange.length; r++) {
      const rowName = namesRange[r][0] ? namesRange[r][0].toString().trim() : '';
      if (!rowName) continue;
      
      const studentMatch = mapForSheet.find(s => s.name === rowName);
      if (studentMatch) {
        // ยอดรวม
        dataValues[r][0] = studentMatch.full;
        
        // dataValues[r][1] is preserved (ส่วนลด)
        // dataValues[r][3] is preserved (ยอดจ่าย)
        
        // คงเหลือ = ยอดรวม - ส่วนลด - ยอดจ่าย
        const currentDiscount = parseFloat(dataValues[r][1]) || 0;
        const currentPaid = parseFloat(dataValues[r][3]) || 0;
        dataValues[r][2] = Math.max(0, studentMatch.full - currentDiscount - currentPaid);
        
        changed = true;
        totalUpdated++;
      }
    }
    
    if (changed) {
      dataRange.setValues(dataValues);
    }
  }
  
  return `Updated ${totalUpdated} records.`;
}'''

new_func = '''function migrateGradeSheetsFinancials() {
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
      
      const headerRow2 = sheet.getRange(2, 19, 1, lastCol - 18).getValues()[0];
      const headerRow4 = sheet.getRange(4, 19, 1, lastCol - 18).getValues()[0];
      const courses = [];
      for (let i = 0; i < headerRow2.length; i++) {
        courses.push({
          colIndex: 19 + i,
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
        
        let subtotal = 0;
        courses.forEach((c, cIdx) => {
          const val = courseValues[r][cIdx];
          if (val !== '' && !isNaN(val)) {
            const num = parseFloat(val);
            const price = c.price;
            const totalSessions = c.totalSessions;
            
            if (num === 30) subtotal += price * 0.7;
            else if (num === 20) subtotal += price * 0.9;
            else if (num === 50) subtotal += price * 0.5;
            else if (num >= 1 && num <= 2) subtotal += num * 350;
            else if (num >= 3) subtotal += num * (price / totalSessions);
          }
        });
        
        const isCard = parseInt(isCardRange[r][0]) === 1;
        if (isCard) subtotal *= 1.03;
        
        const currentDiscount = parseFloat(dataValues[r][1]) || 0;
        const full = subtotal - currentDiscount;
        
        let currentPaid = parseFloat(dataValues[r][3]) || 0;
        
        const studentMatch = mapForSheet.find(s => s.name === rowName);
        if (studentMatch) {
          currentPaid = studentMatch.paid;
        }
        
        dataValues[r][0] = full;
        dataValues[r][1] = currentDiscount;
        dataValues[r][3] = currentPaid;
        dataValues[r][2] = Math.max(0, full - currentPaid);
        
        changed = true;
        totalUpdated++;
      }
      
      if (changed) {
        dataRange.setValues(dataValues);
      }
    });
  });
  
  return `Updated ${totalUpdated} records in Grade Sheets.`;
}'''

if old_func in c:
    c = c.replace(old_func, new_func)
    print("[OK] Replaced migrateGradeSheetsFinancials in Code.js")
else:
    print("[WARN] Did not find the exact function match in Code.js")

with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(c)
