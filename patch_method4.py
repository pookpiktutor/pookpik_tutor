import re
with open('src/Code.js', 'r', encoding='utf-8') as f:
    text = f.read()

def replace_func(text, func_name, new_code):
    pattern = r'function\s+' + func_name + r'\s*\('
    match = re.search(pattern, text)
    if not match: return text
    start = match.start()
    idx = text.find('{', start)
    if idx == -1: return text
    brace_count = 1
    idx += 1
    while brace_count > 0 and idx < len(text):
        if text[idx] == '{': brace_count += 1
        elif text[idx] == '}': brace_count -= 1
        idx += 1
    end = idx
    return text[:start] + new_code + text[end:]

new_func = """function getStudentHorizontalData(name, grade, classType, branchLearn) {
  try {
    const db = getDb();
    let isMainClass = (classType === "กลุ่มหลัก" || classType === "กลุ่มหลักตามตารางคอร์ส");
    
    if (isMainClass) {
        // Read from DB_Enrollments
        const enrollSheet = db.getSheetByName('DB_Enrollments');
        if (!enrollSheet) return { success: false, error: 'ไม่พบชีต DB_Enrollments' };
        
        const data = enrollSheet.getDataRange().getValues();
        const studentCourses = [];
        
        for (let r = 1; r < data.length; r++) {
            const row = data[r];
            const sNameFull = (row[2] || '').toString().trim();
            const courseName = (row[5] || '').toString().trim();
            if (sNameFull === name.trim()) {
                studentCourses.push({
                    courseName: courseName,
                    status: 'เรียน'
                });
            }
        }
        return { success: true, studentCourses: studentCourses };
    }
    
    let sheetName = classType + " " + grade;
    let sheet = db.getSheetByName(sheetName);
    if (!sheet && !isMainClass) {
        sheet = db.getSheetByName(grade + " " + classType);
        if (!sheet) sheet = db.getSheetByName(grade + "/" + classType);
        if (!sheet) sheet = db.getSheetByName(classType + "/" + grade);
    }
    
    if (!sheet) return { success: false, error: 'ไม่พบชีต: ' + sheetName };
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 5) return { success: true, studentCourses: [] };
    
    const headers = data[0];
    const studentCourses = [];
    
    let nameCol = 3;
    for (let r = 4; r < data.length; r++) {
       if (data[r][nameCol] && data[r][nameCol].toString().trim() === name.trim()) {
           for (let c = COURSE_START_COL; c <= data[r].length; c++) {
               const cName = headers[c-1];
               const cVal = data[r][c-1];
               if (cName && cVal && cVal.toString().trim() !== '') {
                   studentCourses.push({
                       courseName: cName.toString().trim(),
                       status: cVal.toString().trim()
                   });
               }
           }
           break;
       }
    }
    
    return { success: true, studentCourses: studentCourses };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}"""

text = replace_func(text, "getStudentHorizontalData", new_func)

with open('src/Code.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done!")
