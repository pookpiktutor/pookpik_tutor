const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js', 'utf8');

const target1 = `        if (isAssigned && c.subject) {
          const courseKey = c.subject.trim();
          teacherCoursesMap[courseKey] = {
            courseName: courseKey,
            roomBranch: c.roomBranch || '',
            students: []
          };
        }`;

const replace1 = `        if (isAssigned && c.subject) {
          let thaiDay = '';
          try {
            const dateStr = c.date;
            const thaiDayNames = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
            let dt;
            if (dateStr && dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                dt = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
              }
            } else if (dateStr && dateStr.includes('-')) {
              dt = new Date(dateStr);
            }
            if (dt) thaiDay = thaiDayNames[dt.getDay()] || '';
          } catch(e) {}
          
          let rawSubject = c.subject.trim();
          let courseKey = rawSubject;
          if (thaiDay && c.timeStart) {
            courseKey = \`\${rawSubject} (\${thaiDay} \${c.timeStart}\${c.timeEnd ? '-' + c.timeEnd : ''})\`;
          }
          
          if (!teacherCoursesMap[courseKey]) {
            teacherCoursesMap[courseKey] = {
              courseName: courseKey,
              rawSubject: rawSubject,
              thaiDay: thaiDay,
              roomBranch: c.roomBranch || '',
              students: []
            };
          }
        }`;

const target2 = `    // If no courses found for teacher, return empty
    const courses = Object.keys(teacherCoursesMap);
    if (courses.length === 0) return [];
    
    // 3. For each course, search enrolled students from relevant sheets
    const studentsList = getStudentsListRaw(); // Get students from StatusDB
    
    courses.forEach(courseName => {
      // Analyze course name to guess grade and branch`;

const replace2 = `    // If no courses found for teacher, return empty
    const coursesKeys = Object.keys(teacherCoursesMap);
    if (coursesKeys.length === 0) return [];
    
    // 3. For each course, search enrolled students from relevant sheets
    const studentsList = getStudentsListRaw(); // Get students from StatusDB
    
    coursesKeys.forEach(courseKey => {
      const courseObj = teacherCoursesMap[courseKey];
      const courseName = courseObj.courseName;
      const rawSubject = courseObj.rawSubject || courseName;
      const thaiDay = courseObj.thaiDay || '';
      
      // Analyze course name to guess grade and branch`;

const target3 = `      // A. Check in StatusDB first (students who have this exact course round text)
      studentsList.forEach(s => {
        if (s.round && s.round.toLowerCase().includes(courseName.toLowerCase())) {
          if (!addedStudentIds.has(s.id)) {`;

const replace3 = `      // A. Check in StatusDB first (students who have this exact course round text)
      studentsList.forEach(s => {
        if (s.round && s.round.toLowerCase().includes(rawSubject.toLowerCase())) {
          if (!addedStudentIds.has(s.id)) {`;

const target4 = `              // Find column index for this course (matching by course subject name or day/time text)
              let targetColIdx = -1;
              for (let cIdx = 0; cIdx < headerRow1.length; cIdx++) {
                const h1 = headerRow1[cIdx] ? headerRow1[cIdx].toString().trim() : '';
                const h3 = headerRow3[cIdx] ? headerRow3[cIdx].toString().trim() : '';
                if (
                  (h1 && courseName.includes(h1)) || 
                  (h3 && courseName.includes(h3)) ||
                  (courseName.toLowerCase().includes(h1.toLowerCase()) && h1 !== '')
                ) {
                  targetColIdx = 15 + cIdx;
                  break;
                }
              }`;

const replace4 = `              // Find column index for this course (matching by course subject name AND day)
              let targetColIdx = -1;
              for (let cIdx = 0; cIdx < headerRow1.length; cIdx++) {
                const h1 = headerRow1[cIdx] ? headerRow1[cIdx].toString().trim() : '';
                const h3 = headerRow3[cIdx] ? headerRow3[cIdx].toString().trim() : '';
                
                const subjectMatch = (h3 && rawSubject.includes(h3)) || (h3 && h3.includes(rawSubject)) || (rawSubject === h3);
                
                let dayMatch = true;
                if (thaiDay && h1) {
                  const dayCheckStr = thaiDay.replace('บดี', '');
                  if (!h1.includes(dayCheckStr) && !dayCheckStr.includes(h1)) {
                    dayMatch = false;
                  }
                }
                
                const fallbackMatch = (h1 && rawSubject.includes(h1)) || (h3 && rawSubject.includes(h3)) || (rawSubject.toLowerCase().includes(h1.toLowerCase()) && h1 !== '');
                
                if (subjectMatch && dayMatch) {
                  targetColIdx = 15 + cIdx;
                  break;
                } else if (targetColIdx === -1 && fallbackMatch) {
                  targetColIdx = 15 + cIdx;
                }
              }`;

const target5 = `      // C. Check in Private/Subgroup sheets (เดี่ยว อนุบาล ... เดี่ยว ม.6, ย่อย 2-3, ย่อย 4-5, ย่อย 6-10)
      // Format usually like: "วิชา... (น้องA, น้องB)" or "วิชา... (น้องA)"
      const bracketMatch = courseName.match(/\\(([^)]+)\\)/);`;

const replace5 = `      // C. Check in Private/Subgroup sheets (เดี่ยว อนุบาล ... เดี่ยว ม.6, ย่อย 2-3, ย่อย 4-5, ย่อย 6-10)
      // Format usually like: "วิชา... (น้องA, น้องB)" or "วิชา... (น้องA)"
      const bracketMatch = rawSubject.match(/\\(([^)]+)\\)/);`;

const target6 = `      // D. Filter out duplicate students across multiple scans
      teacherCoursesMap[courseName].students = enrolledStudents;
    });
    
    // Convert back to Array
    return courses.map(c => teacherCoursesMap[c]);`;

const replace6 = `      // D. Filter out duplicate students across multiple scans
      teacherCoursesMap[courseKey].students = enrolledStudents;
    });
    
    // Convert back to Array
    return coursesKeys.map(k => teacherCoursesMap[k]);`;


code = code.replace(target1, replace1);
code = code.replace(target2, replace2);
code = code.replace(target3, replace3);
code = code.replace(target4, replace4);
code = code.replace(target5, replace5);
code = code.replace(target6, replace6);

fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js', code);
console.log('Modified getTeacherCoursesAndStudents!');
