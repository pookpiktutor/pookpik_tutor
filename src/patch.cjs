const fs = require('fs');
const filePath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/src/Code.js';
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

const newCode = `  } else {
    // --- Master Database Rewrite ---
    const db = getDb();
    const dbEnroll = db.getSheetByName('DB_Enrollments');
    const dbStudents = db.getSheetByName('DB_Students');
    
    if (!dbEnroll || !dbStudents) return;

    // 1. Sync Student Info
    const stdData = dbStudents.getRange(2, 4, Math.max(1, dbStudents.getLastRow() - 1), 1).getValues();
    let studentId = "";
    let foundStudent = false;
    
    for (let i = 0; i < stdData.length; i++) {
      if (stdData[i][0] && stdData[i][0].toString().trim() === student.name.trim()) {
        foundStudent = true;
        studentId = dbStudents.getRange(i + 2, 1).getValue();
        break;
      }
    }
    
    if (!foundStudent) {
      const newRowIdx = (dbStudents.getLastRow() || 1) + 1;
      studentId = "STD-" + Utilities.formatString("%04d", newRowIdx - 1);
      dbStudents.appendRow([
        studentId, student.grade, student.branchLearn, student.name, student.nickname, 
        student.contact, student.school, student.lineId
      ]);
    }

    // 2. Sync Course Enrollments
    try {
      const selectedList = student.selectedCourses || [];
      if (selectedList.length > 0) {
        const today = new Date();
        const selectedMap = {};
        
        selectedList.forEach(item => {
          if (item && typeof item === 'object' && item.courseName) {
            selectedMap[item.courseName.toString().trim()] = parseInt(item.sessions) || 9;
          } else if (item) {
            selectedMap[item.toString().trim()] = 9;
          }
        });

        for (const courseName in selectedMap) {
          const sessions = selectedMap[courseName];
          dbEnroll.appendRow([
            today, studentId, student.name, student.grade, student.branchLearn, 
            courseName, sessions, student.paid, student.full
          ]);
        }
      }
    } catch (err) {
      Logger.log("Error DB_Enrollments: " + err);
    }
  }
}`;

lines.splice(6428, 6598 - 6428 + 1, newCode);

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Update complete.');
