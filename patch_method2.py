import re
with open('src/Code.js', 'r', encoding='utf-8') as f:
    text = f.read()

def replace_func(text, func_name, new_code):
    pattern = r'function\s+' + func_name + r'\s*\('
    match = re.search(pattern, text)
    if not match:
        print(f"Cannot find {func_name}")
        return text
    start = match.start()
    
    # find balancing brace
    idx = text.find('{', start)
    if idx == -1: return text
    
    brace_count = 1
    idx += 1
    while brace_count > 0 and idx < len(text):
        if text[idx] == '{': brace_count += 1
        elif text[idx] == '}': brace_count -= 1
        idx += 1
        
    end = idx
    print(f"Replacing {func_name} from {start} to {end}")
    
    return text[:start] + new_code + text[end:]

text = replace_func(text, "getGradeSheetData", """function getGradeSheetData(grade, branch, logUser, searchTerm) {
  if (logUser) checkTeacherBlock(logUser);
  try {
    const db = getDb();
    const courseSheet = db.getSheetByName('DB_Courses');
    if (!courseSheet) return { success: true, courses: [], students: [] };
    
    const courseData = courseSheet.getDataRange().getValues();
    if (courseData.length <= 1) return { success: true, courses: [], students: [] };
    
    const allCourses = [];
    let gradesToFetch = [grade];
    if (grade === 'all') {
      gradesToFetch = ['อนุบาล', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
    }
    const term = (searchTerm || '').toLowerCase().trim();
    
    for (let i = 1; i < courseData.length; i++) {
       const row = courseData[i];
       const rowGrade = row[1];
       const rowBranch = row[2];
       if (gradesToFetch.includes(rowGrade) && (!branch || branch === 'all' || rowBranch === branch)) {
           const cName = row[5] ? row[5].toString() : '';
           if (term && !cName.toLowerCase().includes(term)) continue;
           
           allCourses.push({
               colIndex: i, // use row index as colIndex
               courseId: row[0],
               grade: rowGrade,
               branch: rowBranch,
               name: cName,
               price: row[6],
               dayTime: row[7],
               sessions: row[8],
               count: row[9] || 0,
               round: row[3] || '',
               year: row[4] || ''
           });
       }
    }
    
    const allStudents = [];
    const enrollSheet = db.getSheetByName('DB_Enrollments');
    if (enrollSheet) {
      const enrollData = enrollSheet.getDataRange().getValues();
      const studentMap = {}; 
      
      for (let i = 1; i < enrollData.length; i++) {
        const row = enrollData[i];
        const studentId = row[1];
        const sName = row[2];
        const sGrade = row[3];
        const sBranch = row[4];
        const courseName = row[5];
        const sessions = row[6];
        const paid = row[7];
        const full = row[8];
        
        if (gradesToFetch.includes(sGrade) && (!branch || branch === 'all' || sBranch === branch)) {
          if (!studentMap[studentId]) {
             studentMap[studentId] = {
                row: i + 1,
                id: studentId,
                name: sName,
                grade: sGrade,
                branch: sBranch,
                courseValues: {},
                paidStatus: paid >= full ? 'จ่ายแล้ว' : (paid > 0 ? 'มัดจำ' : 'ค้างชำระ')
             };
          }
          
          const cMatch = allCourses.find(c => c.name === courseName);
          if (cMatch) {
             studentMap[studentId].courseValues[cMatch.colIndex] = 'เรียน';
          }
        }
      }
      for (const key in studentMap) {
         allStudents.push(studentMap[key]);
      }
    }
    
    return { success: true, courses: allCourses, students: allStudents };
  } catch (e) {
    return { success: false, error: e.message };
  }
}""")

text = replace_func(text, "addNewCoursesBatch", """function addNewCoursesBatch(grade, branch, courseList, logUser) {
  checkTeacherBlock(logUser);
  try {
    const db = getDb();
    let sheet = db.getSheetByName('DB_Courses');
    if (!sheet) {
      sheet = db.insertSheet('DB_Courses');
      sheet.appendRow(['CourseID', 'Grade', 'Branch', 'Round', 'Year', 'CourseName', 'Price', 'DayTime', 'Sessions', 'EnrolledCount']);
    }
    
    courseList.forEach((c, idx) => {
      const ts = new Date().getTime() + Math.random().toString(36).substring(2,5);
      const courseId = `CRS-${ts}-${idx}`;
      sheet.appendRow([
         courseId, grade, branch || 'สาขา1', '', '', c.courseName, c.price, c.dayTime, parseInt(c.sessions) || 10, 0
      ]);
    });
    
    logActivity(logUser, 'เพิ่มกลุ่มวิชาหลัก', `เพิ่ม ${courseList.length} วิชา ลงในระดับชั้น ${grade}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}""")

text = replace_func(text, "syncToGradeSheet", """function syncToGradeSheet(student) {
  // Disabled by new architecture
  return;
}""")

with open('src/Code.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done!")
