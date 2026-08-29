const fs = require('fs');

let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js', 'utf8');

// The replacement code for getTeacherCoursesAndStudents
const targetFuncStart = `function getTeacherCoursesAndStudents(logUser) {`;
const targetFuncEnd = `    return result;\n  } catch (err) {\n    return [];\n  }\n}`;

const startIndex = code.indexOf(targetFuncStart);
const endIndex = code.indexOf(targetFuncEnd) + targetFuncEnd.length;

if (startIndex === -1 || code.indexOf(targetFuncEnd) === -1) {
  console.log('Error: Could not find getTeacherCoursesAndStudents bounds.');
  process.exit(1);
}

const newFunc = `function getTeacherCoursesAndStudents(logUser) {
  try {
    const db = getDb();
    
    // 1. Get current teacher's name/nickname
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
    
    const isTeacher = isTeacherUser(logUser);
    
    // 2. Scan Data Learn for teacher's courses
    const classLogs = getClassLogs('');
    const teacherCoursesMap = {};
    
    if (Array.isArray(classLogs)) {
      classLogs.forEach(c => {
        const isAssigned = !isTeacher || 
          (c.teacherRegular && c.teacherRegular.toLowerCase().includes(teacherName.toLowerCase())) ||
          (c.teacherSub && c.teacherSub.toLowerCase().includes(teacherName.toLowerCase()));
          
        if (isAssigned && c.subject) {
          const courseKey = c.subject.trim();
          const dayName = c.dayOfWeek || '';
          const timeStart = c.timeStart || '';
          const timeEnd = c.timeEnd || '';
          let fullCourseName = courseKey;
          if (dayName && timeStart) {
            fullCourseName = \`\${courseKey} (\${dayName} \${timeStart}-\${timeEnd})\`.trim();
          }
          
          teacherCoursesMap[fullCourseName] = {
            courseName: courseKey,
            displayCourseName: fullCourseName,
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
    
    // 3. For each course, search enrolled students from relevant sheets
    const studentsList = getStudentsListRaw(); // Get students from StatusDB
    
    courseKeys.forEach(key => {
      const courseInfo = teacherCoursesMap[key];
      const courseName = courseInfo.courseName;
      const cDay = courseInfo.day;
      const cTime = courseInfo.timeStart;
      
      let detectedGrade = '';
      const grades = ['อนุบาล', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
      for (const g of grades) {
        if (courseName.includes(g)) { detectedGrade = g; break; }
      }
      
      let detectedBranch = '';
      if (courseInfo.roomBranch.includes('สาขา1') || courseInfo.roomBranch.includes('PMY')) detectedBranch = 'สาขา 1 แยกPMY';
      else if (courseInfo.roomBranch.includes('สาขา2') || courseInfo.roomBranch.includes('ระยองวิทยา')) detectedBranch = 'สาขา 2 ระยองวิทยา';
      else if (courseInfo.roomBranch.includes('สาขา3') || courseInfo.roomBranch.includes('อัสสัมชัญ')) detectedBranch = 'สาขา 3 อัสสัมชัญ';
      
      const enrolledStudents = [];
      
      studentsList.forEach(student => {
        let isEnrolled = false;
        // Check slots 1 to 5
        for (let j = 1; j <= 5; j++) {
          const sDay = student[\`Day \${j}\`] || '';
          const sTime = student[\`Time \${j}\`] || '';
          const sCourse = student[\`Course \${j}\`] || '';
          
          if (sCourse && sCourse.toLowerCase().includes(courseName.toLowerCase())) {
             // If the class has a day/time, match it. If not, match anyway
             if (cDay && cTime) {
                if (sDay.includes(cDay) && (sTime.includes(cTime) || cTime.includes(sTime))) {
                   isEnrolled = true;
                   break;
                }
             } else {
                isEnrolled = true;
                break;
             }
          }
        }
        
        if (isEnrolled) {
          enrolledStudents.push({
            studentId: student['รหัสนักเรียน'] || '',
            nickname: student['ชื่อเล่น'] || '',
            firstname: student['ชื่อจริง'] || '',
            lastname: student['นามสกุล'] || '',
            grade: student['ระดับชั้น'] || detectedGrade,
            branch: student['สาขาที่เรียน'] || detectedBranch
          });
        }
      });
      
      courseInfo.students = enrolledStudents;
    });
    
    // Format output
    const result = [];
    courseKeys.forEach(key => {
      const item = teacherCoursesMap[key];
      // Only include courses that have students enrolled, OR return all? The user requested filtering, 
      // let's return all so they see their assigned classes, but with accurate student lists.
      result.push({
        courseName: item.displayCourseName,
        students: item.students
      });
    });
    
    return result;
  } catch (err) {
    return [];
  }
}`;

const newCode = code.substring(0, startIndex) + newFunc + code.substring(endIndex);
fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js', newCode);
console.log('Fixed Code.js getTeacherCoursesAndStudents!');
