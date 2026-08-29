import io

with io.open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update getGradeSheetData
# Old: const headerRow1 = sheet.getRange(1, 19, 1, lastCol - 18).getValues()[0];
# New: const headerRow1 = sheet.getRange(1, 20, 1, lastCol - 19).getValues()[0];
code = code.replace("const headerRow1 = sheet.getRange(1, 19, 1, lastCol - 18).getValues()[0];", "const headerRow1 = sheet.getRange(1, 20, 1, lastCol - 19).getValues()[0];")
code = code.replace("const headerRow2 = sheet.getRange(2, 19, 1, lastCol - 18).getValues()[0];", "const headerRow2 = sheet.getRange(2, 20, 1, lastCol - 19).getValues()[0];")
code = code.replace("const headerRow3 = sheet.getRange(3, 19, 1, lastCol - 18).getValues()[0];", "const headerRow3 = sheet.getRange(3, 20, 1, lastCol - 19).getValues()[0];")
code = code.replace("const headerRow4 = sheet.getRange(4, 19, 1, lastCol - 18).getValues()[0];", "const headerRow4 = sheet.getRange(4, 20, 1, lastCol - 19).getValues()[0];")

# Note: The colIndex stored will now be 20 + i
# Old: colIndex: 19 + i,
# New: colIndex: 20 + i,
code = code.replace("colIndex: 19 + i,", "colIndex: 20 + i,")

# Also need to read Student ID
# Old: const name = row[1] ? row[1].toString().trim() : '';
# New: 
old_read_name = """          const name = row[1] ? row[1].toString().trim() : '';
          if (!name) return;"""

new_read_name = """          const name = row[1] ? row[1].toString().trim() : '';
          if (!name) return;
          const studentId = row[18] ? row[18].toString().trim() : '';"""

if old_read_name in code:
    code = code.replace(old_read_name, new_read_name)

# And add studentId to allStudents
old_push = """            branchPay: row[9] ? row[9].toString().trim() : '',

            

            full: parseFloat(row[10]) || 0, """

new_push = """            branchPay: row[9] ? row[9].toString().trim() : '',

            

            full: parseFloat(row[10]) || 0, 
            
            studentId: studentId,"""

if old_push in code:
    code = code.replace(old_push, new_push)


# 2. Update saveGradeSheetData
# It uses: const rowVals = new Array(lastCol).fill('');
# And fills indices 0 to 14.
# Then loops courses: rowVals[colIdx0] = s.courseValues[colIndex];
# The new column is index 18 (Column S)
old_save_vals = """        rowVals[12] = outstanding;

        rowVals[13] = s.paid;

        rowVals[14] = s.isCard ? 1 : 0;"""

new_save_vals = """        rowVals[12] = outstanding;

        rowVals[13] = s.paid;

        rowVals[14] = s.isCard ? 1 : 0;
        
        rowVals[18] = s.studentId || '';"""

if old_save_vals in code:
    code = code.replace(old_save_vals, new_save_vals)


# 3. Add the migration script at the end of the file
migration_script = """

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
"""

if "function migrateAddStudentIdColumn" not in code:
    code += migration_script

with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("[OK] Updated Code.js for Column 19 (Student ID) migration")
