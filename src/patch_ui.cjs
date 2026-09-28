const fs = require('fs');
const filePath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/src/Code.js';
let content = fs.readFileSync(filePath, 'utf8');

// Function 1: getAvailableCourses
const getAvailableCoursesNew = `function getAvailableCourses(grade, classType, branchLearn) {
  try {
    const db = getDb();
    const learnSheet = db.getSheetByName('Data Learn');
    if (!learnSheet) return { success: false, error: 'Data Learn not found' };

    const data = learnSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find column indexes
    let subjectIdx = 0, typeIdx = 0, branchIdx = 0, priceIdx = 0;
    for (let c = 0; c < headers.length; c++) {
      const h = headers[c].toString().toLowerCase();
      if (h.includes('วิชา') || h.includes('subject')) subjectIdx = c;
      if (h.includes('ประเภท') || h.includes('type')) typeIdx = c;
      if (h.includes('สาขา') || h.includes('branch')) branchIdx = c;
      if (h.includes('ราคา') || h.includes('price')) priceIdx = c;
    }

    const selectedCourses = [];
    
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const courseName = row[subjectIdx];
      const courseType = row[typeIdx] || '';
      const courseBranch = row[branchIdx] || '';
      const coursePrice = row[priceIdx] || 0;
      
      if (!courseName) continue;
      
      // Filter by branch and classtype if needed (or allow cross-grade)
      if (branchLearn && courseBranch && !courseBranch.includes(branchLearn.replace('สาขา', '').trim())) continue;
      if (classType === 'กลุ่มหลัก' && courseType.includes('เดี่ยว')) continue;
      
      selectedCourses.push({
        courseName: courseName.toString().trim(),
        sessions: 9, // Default sessions
        price: coursePrice
      });
    }
    
    // Remove duplicates
    const uniqueCourses = [];
    const seen = new Set();
    for (let c of selectedCourses) {
      if (!seen.has(c.courseName)) {
        seen.add(c.courseName);
        uniqueCourses.push(c);
      }
    }

    return { success: true, selectedCourses: uniqueCourses };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}`;

// Replace getAvailableCourses
const availStartRegex = /function getAvailableCourses\(grade, classType, branchLearn\)\s*\{/;
const availMatch = content.match(availStartRegex);
if (availMatch) {
  let startIndex = availMatch.index;
  let braceCount = 0;
  let endIndex = -1;
  let started = false;
  
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') { braceCount++; started = true; }
    else if (content[i] === '}') { braceCount--; }
    
    if (started && braceCount === 0) {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex !== -1) {
    content = content.substring(0, startIndex) + getAvailableCoursesNew + content.substring(endIndex + 1);
    console.log('Replaced getAvailableCourses');
  }
}

// Function 2: Teacher courses logic
// Let's replace the whole "3. Search enrolled students from Grade Sheets" part in getTeacherCoursesAndStudents
// Find the function
const teacherFuncRegex = /function getTeacherCoursesAndStudents\(logUser\)\s*\{/;
const teacherMatch = content.match(teacherFuncRegex);
if (teacherMatch) {
  let tStartIndex = teacherMatch.index;
  let braceCount = 0;
  let tEndIndex = -1;
  let started = false;
  
  for (let i = tStartIndex; i < content.length; i++) {
    if (content[i] === '{') { braceCount++; started = true; }
    else if (content[i] === '}') { braceCount--; }
    
    if (started && braceCount === 0) {
      tEndIndex = i;
      break;
    }
  }
  
  if (tEndIndex !== -1) {
    const oldTeacherFunc = content.substring(tStartIndex, tEndIndex + 1);
    
    // Replace the mainSheets loop with DB_Enrollments query
    const dbEnrollQuery = `
    // 3. Search enrolled students from Master DB
    const enrollSheet = db.getSheetByName('DB_Enrollments');
    if (enrollSheet) {
      const enrollData = enrollSheet.getDataRange().getValues();
      for (let r = 1; r < enrollData.length; r++) {
        const eRow = enrollData[r];
        const sId = (eRow[1] || '').toString().trim();
        const sNameFull = (eRow[2] || '').toString().trim();
        const sGrade = (eRow[3] || '').toString().trim();
        const sBranch = (eRow[4] || '').toString().trim();
        const sCourse = (eRow[5] || '').toString().trim();
        
        if (!sId || !sCourse) continue;
        
        // Find matching course in teacherCoursesMap
        for (let key of courseKeys) {
          const cInfo = teacherCoursesMap[key];
          if (cInfo.courseName.trim().toLowerCase() === sCourse.toLowerCase() || 
              sCourse.toLowerCase().includes(cInfo.courseName.trim().toLowerCase())) {
              
            const existing = cInfo.students.find(s => s.studentId === sId);
            if (!existing) {
              cInfo.students.push({
                studentId: sId,
                nickname: '',
                name: sNameFull,
                firstname: sNameFull,
                lastname: '',
                grade: sGrade,
                branch: sBranch
              });
            }
          }
        }
      }
    }
    
    return courseKeys.map(k => teacherCoursesMap[k]);
  } catch (err) {
    return [{ courseName: "ERROR", displayCourseName: "ERROR: " + err.toString(), students: [] }];
  }
}`;

    // The old code returns at the end. We need to replace from `const mainSheets = [` to the end of the try block.
    const searchString = 'const mainSheets = [';
    const splitIndex = oldTeacherFunc.indexOf(searchString);
    if (splitIndex !== -1) {
      let newTeacherFunc = oldTeacherFunc.substring(0, splitIndex) + dbEnrollQuery;
      content = content.substring(0, tStartIndex) + newTeacherFunc + content.substring(tEndIndex + 1);
      console.log('Replaced getTeacherCoursesAndStudents inner logic');
    }
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched UI backend functions.');
