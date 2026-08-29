import re

with open('Code.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace from `let headers = [];` to the end of the for-loop
start_pattern = r'      let headers = \[\];\n      if \(isMainClass(.*?)existingNames\.add\(cleanName\);\n           addedCount\+\+;\n           addedNames\.push\(name\);\n         \} else if \(isMainClass\) \{\n            // Existing student in Main Class: update courses ONLY\n            syncStudentToStatusDB\(std\); // Calling syncStudentToStatusDB will UPDATE their row, including column 41\n         \}\n      \}'

replacement = """      // Dynamically fetch headers to prevent column shift issues
      const headerRowIndex = isMainClass ? 5 : 11;
      const headersRowFull = sheet.getRange(headerRowIndex, 1, 1, lastCol).getValues()[0];
      const headersRowTrimmed = headersRowFull.map(h => (h || '').toString().trim());
      
      let headers = [];
      if (isMainClass && typeof COURSE_START_COL !== 'undefined' && lastCol >= COURSE_START_COL) {
          headers = headersRowFull.slice(COURSE_START_COL - 1);
      }
      
      const getColIndex = (possibleNames) => {
          for (let n of possibleNames) {
              const idx = headersRowTrimmed.indexOf(n);
              if (idx !== -1) return idx - 1; // data array starts from Col B (index 1 of headersRowFull)
          }
          return -1;
      };
      
      // Cache the indices
      const colFull = getColIndex(['ยอดรวม', 'เรียน']);
      const colOutstanding = getColIndex(['คงเหลือ']);
      const colPaid = getColIndex(['ยอดจ่าย', 'จ่าย']);
      const colDate = getColIndex(['วันที่ชำระเงิน', 'วันที่รับเงิน']);
      const colChannel = getColIndex(['ช่องทางชำระเงิน', 'ช่องทางการรับเงิน']);
      const colStaff = getColIndex(['ผู้รับเงิน']);
      const colCourse = getColIndex(['คอร์ส']);
      const colNote = getColIndex(['หมายเหตุ']);
      const colBranchLearn = getColIndex(['สาขาเรียน', 'สาขาเรียน(สาขา)']);
      const colBranchPay = getColIndex(['สาขาที่เก็บเงิน', 'สาขาเงิน(สาขา)']);
      
      for (let j = 0; j < data.length; j++) {
        const name = (data[j][0] || '').toString().trim();
        if (!name) continue;
        
        const cleanName = name.replace(/\\s+/g, '');
        
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
        
        const safeVal = (idx) => (idx !== -1 && data[j] && data[j][idx] !== undefined) ? data[j][idx] : '';
        
        // Build student object based on sheet type
        let std = {
          name: name,
          nickname: data[j][1] || '',
          school: data[j][2] || '',
          contact: (data[j][4] || '').toString(),
          lineName: (data[j][5] || '').toString(),
          lineId: (data[j][6] || '').toString(),
          paymentDate: safeVal(colDate) || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy'),
          paymentChannel: safeVal(colChannel),
          staff: safeVal(colStaff),
          full: parseFloat(safeVal(colFull)) || 0,
          outstanding: parseFloat(safeVal(colOutstanding)) || 0,
          paid: parseFloat(safeVal(colPaid)) || 0,
          selectedCourses: selectedCourses.join(', ') // Add courses!
        };
        
        if (isMainClass) {
           const grade = isMainClass[1];
           const branchSuffix = isMainClass[2];
           std.grade = grade;
           std.classType = 'กลุ่มหลัก';
           std.branchLearn = safeVal(colBranchLearn) || ('สาขา' + branchSuffix);
           std.branchPay = safeVal(colBranchPay) || ('สาขา' + branchSuffix);
           std.round = 'ManualSync';
        } else {
           // Private/Subgroup
           std.grade = sheetName.replace('เดี่ยว ', '').replace('ย่อย ', '').replace('กลุ่ม ', '').trim();
           std.classType = sheetName.split(' ')[0] === 'เดี่ยว' ? 'เดี่ยว' : sheetName;
           std.branchLearn = safeVal(colBranchLearn) || 'สาขา1';
           std.branchPay = safeVal(colBranchPay) || 'สาขา1';
           std.round = safeVal(colCourse); // คอร์ส
           std.extraNote = safeVal(colNote); // หมายเหตุ
        }
        
        if (!existingNames.has(cleanName)) {
           // Missing student found! Need to add to StatusDB
           syncStudentToStatusDB(std);
           
           existingNames.add(cleanName);
           addedCount++;
           addedNames.push(name);
        } else if (isMainClass) {
           // Existing student in Main Class: update courses ONLY
           syncStudentToStatusDB(std); // Calling syncStudentToStatusDB will UPDATE their row, including column 41
        }
      }"""

new_content = re.sub(start_pattern, replacement, content, flags=re.DOTALL)

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Patched Code.js dynamically")
