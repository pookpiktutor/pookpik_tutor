import io
import re

with io.open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove StatusDB map logic from getGradeSheetData
old_map_grade = """    // Build a map of student payments from StatusDB
    const statusSheet = db.getSheetByName('StatusDB');
    const paymentMap = {};
    if (statusSheet) {
      const statusLastRow = statusSheet.getLastRow();
      if (statusLastRow > 0) {
        const statusData = statusSheet.getRange(1, 1, statusLastRow, 25).getValues();
        statusData.forEach(row => {
          const sName = row[1] ? row[1].toString().trim() : '';
          const sRound = row[15] ? row[15].toString().trim() : '';
          const sPaymentChannel = row[13] ? row[13].toString().trim() : 'กสิกร บัญชีบริษัท(สแกน)';
          const sStaff = row[14] ? row[14].toString().trim() : '';
          if (sName) {
            paymentMap[sName + '|' + sRound] = {
              paymentChannel: sPaymentChannel,
              staff: sStaff
            };
          }
        });
      }
    }"""
new_map_grade = "    // StatusDB mapping removed by request"
if old_map_grade in code:
    code = code.replace(old_map_grade, new_map_grade)
else:
    print("[WARN] paymentMap logic in getGradeSheetData not found (might have changed spacing)")

old_assign_grade = """            paymentChannel: (paymentMap[name + '|' + sheetName] || {}).paymentChannel || 'กสิกร บัญชีบริษัท(สแกน)',
            staff: (paymentMap[name + '|' + sheetName] || {}).staff || '','""'
"""
new_assign_grade = """            paymentChannel: row[16] ? row[16].toString().trim() : 'กสิกร บัญชีบริษัท(สแกน)', // Column Q (17) -> index 16
            staff: row[17] ? row[17].toString().trim() : '', // Column R (18) -> index 17"""
code = code.replace("            paymentChannel: (paymentMap[name + '|' + sheetName] || {}).paymentChannel || 'กสิกร บัญชีบริษัท(สแกน)',\n            staff: (paymentMap[name + '|' + sheetName] || {}).staff || '',", new_assign_grade)


# 2. Remove StatusDB map logic from getStudentsListRaw
old_map_list = """  // Build a map of student payments from StatusDB for Payment Channel and Staff
  const statusSheet = db.getSheetByName('StatusDB');
  const paymentMap = {};
  if (statusSheet) {
    const statusLastRow = statusSheet.getLastRow();
    if (statusLastRow > 0) {
      const statusData = statusSheet.getRange(1, 1, statusLastRow, 25).getValues();
      statusData.forEach(row => {
        const sName = row[1] ? row[1].toString().trim() : '';
        const sPaymentChannel = row[13] ? row[13].toString().trim() : 'กสิกร บัญชีบริษัท(สแกน)';
        const sStaff = row[14] ? row[14].toString().trim() : '';
        if (sName) {
          paymentMap[sName] = {
            paymentChannel: sPaymentChannel,
            staff: sStaff
          };
        }
      });
    }
  }"""
new_map_list = "  // StatusDB mapping removed by request"
if old_map_list in code:
    code = code.replace(old_map_list, new_map_list)
else:
    print("[WARN] paymentMap logic in getStudentsListRaw not found")

old_assign_list = """        paymentChannel: (paymentMap[studentName] || {}).paymentChannel || 'กสิกร บัญชีบริษัท(สแกน)',
        staff: (paymentMap[studentName] || {}).staff || '','""'
"""
new_assign_list = """        paymentChannel: row[16] ? row[16].toString().trim() : 'กสิกร บัญชีบริษัท(สแกน)',
        staff: row[17] ? row[17].toString().trim() : '','""'
"""
code = code.replace("        paymentChannel: (paymentMap[studentName] || {}).paymentChannel || 'กสิกร บัญชีบริษัท(สแกน)',\n        staff: (paymentMap[studentName] || {}).staff || '',", """        paymentChannel: row[16] ? row[16].toString().trim() : 'กสิกร บัญชีบริษัท(สแกน)',\n        staff: row[17] ? row[17].toString().trim() : '',""")


# 3. Remove syncStudentToStatusDB call from saveGradeSheetData
sync_block_regex = r"syncStudentToStatusDB\(\{\s*name: s\.name,[\s\S]*?paymentChannel: s\.paymentChannel,\s*staff: s\.staff\s*\}\);"
code = re.sub(sync_block_regex, "// syncStudentToStatusDB removed by request", code)

# 4. Create batchRecalculateFinancials script
batch_script = """

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
    const headerRow1 = sheet.getRange(1, 20, 1, lastCol - 19).getValues()[0];
    const headerRow2 = sheet.getRange(2, 20, 1, lastCol - 19).getValues()[0];
    const headerRow4 = sheet.getRange(4, 20, 1, lastCol - 19).getValues()[0];
    
    const sheetCourses = [];
    for (let i = 0; i < headerRow1.length; i++) {
      if (headerRow1[i]) {
        sheetCourses.push({
          colIndex: 20 + i,
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
"""

if "function batchRecalculateFinancials" not in code:
    code += batch_script

with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("[OK] Applied all changes to Code.js")
