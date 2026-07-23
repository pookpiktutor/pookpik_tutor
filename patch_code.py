import re

def patch_code(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Part 1: In getGradeSheetData, read StatusDB to populate paymentChannel and staff
    # Let's insert the DB read before the suffixes loop
    start_search = "const db = getDb();\n\n    const suffixes = ['1', '2', '3'];"
    if start_search in content:
        insert_code = """const db = getDb();
    
    // Build a map of student payments from StatusDB
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
    }

    const suffixes = ['1', '2', '3'];"""
        content = content.replace(start_search, insert_code)
        print("Patched getGradeSheetData part 1")
    else:
        print("Could not find start of getGradeSheetData")

    # Part 2: Inside getGradeSheetData, attach the paymentChannel and staff to the student object
    student_obj_start = """            isCard: parseInt(row[14]) === 1 ? 1 : 0, 

            

            courseValues: courseValues,

            sheetName: sheetName,"""
    
    if student_obj_start in content:
        replacement = """            isCard: parseInt(row[14]) === 1 ? 1 : 0, 

            paymentChannel: (paymentMap[name + '|' + sheetName] || {}).paymentChannel || 'กสิกร บัญชีบริษัท(สแกน)',
            staff: (paymentMap[name + '|' + sheetName] || {}).staff || '',
            
            courseValues: courseValues,

            sheetName: sheetName,"""
        content = content.replace(student_obj_start, replacement)
        print("Patched getGradeSheetData part 2")
    else:
        print("Could not find student object in getGradeSheetData")

    # Part 3: In saveGradeSheetData, pass paymentChannel and staff to syncStudentToStatusDB
    sync_call_start = """          lineName: s.lineName,

          lineId: s.lineId,

          classType: 'กลุ่มหลัก',

          round: s.sheetName || sheetName

        });"""
        
    # We might have an encoding issue with 'กลุ่มหลัก' if it's garbled in my terminal. 
    # Let's use a regex to replace it safely.
    sync_pattern = r"lineId:\s*s\.lineId,\s*classType:\s*['\"].*?['\"],\s*round:\s*s\.sheetName\s*\|\|\s*sheetName\s*\}\);"
    
    match = re.search(sync_pattern, content, re.DOTALL)
    if match:
        original = match.group(0)
        replacement = original.replace("});", ",\n          paymentChannel: s.paymentChannel,\n          staff: s.staff\n        });")
        content = content.replace(original, replacement)
        print("Patched saveGradeSheetData sync call")
    else:
        print("Could not find syncStudentToStatusDB in saveGradeSheetData")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
patch_code('Code.js')
