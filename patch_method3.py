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

new_func = """function getAvailableCourses(grade, classType, branchLearn) {
  try {
    const db = getDb();
    let sheetName = classType === 'กลุ่มหลัก' || classType === 'กลุ่มหลักตามตารางคอร์ส' ? 'DB_Courses' : 'Data Learn';
    const learnSheet = db.getSheetByName(sheetName);
    if (!learnSheet) return { success: false, error: sheetName + ' not found' };

    const data = learnSheet.getDataRange().getValues();
    const selectedCourses = [];
    
    if (sheetName === 'DB_Courses') {
      // DB_Courses schema: ['CourseID', 'Grade', 'Branch', 'Round', 'Year', 'CourseName', 'Price', 'DayTime', 'Sessions', 'EnrolledCount']
      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        const rowGrade = (row[1] || '').toString().trim();
        const rowBranch = (row[2] || '').toString().trim();
        const courseName = row[5];
        const coursePrice = row[6] || 0;
        const sessions = row[8] || 9;
        const dayTime = row[7] || '';
        
        if (!courseName) continue;
        if (grade && grade !== 'all' && rowGrade !== grade) continue;
        
        // Match branch (e.g. "สาขา2" in branchLearn should match "สาขา2" in rowBranch)
        if (branchLearn && rowBranch && !branchLearn.replace(/\s+/g,'').includes(rowBranch.replace(/\s+/g,''))) continue;
        
        selectedCourses.push({
          courseName: courseName.toString().trim() + (dayTime ? ' (' + dayTime + ')' : ''),
          sessions: parseInt(sessions) || 9,
          price: coursePrice
        });
      }
    } else {
      const headers = data[0];
      let subjectIdx = 0, typeIdx = 0, branchIdx = 0, priceIdx = 0;
      for (let c = 0; c < headers.length; c++) {
        const h = headers[c].toString().toLowerCase();
        if (h.includes('วิชา') || h.includes('subject')) subjectIdx = c;
        if (h.includes('ประเภท') || h.includes('type')) typeIdx = c;
        if (h.includes('สาขา') || h.includes('branch')) branchIdx = c;
        if (h.includes('ราคา') || h.includes('price')) priceIdx = c;
      }
      
      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        const courseName = row[subjectIdx];
        const courseType = row[typeIdx] || '';
        const courseBranch = row[branchIdx] || '';
        const coursePrice = row[priceIdx] || 0;
        
        if (!courseName) continue;
        if (branchLearn && courseBranch && !courseBranch.includes(branchLearn.replace('สาขา', '').trim())) continue;
        if (classType === 'กลุ่มหลัก' && courseType.includes('เดี่ยว')) continue;
        
        selectedCourses.push({
          courseName: courseName.toString().trim(),
          sessions: 9,
          price: coursePrice
        });
      }
    }
    
    const uniqueCourses = [];
    const seen = new Set();
    for (let c of selectedCourses) {
      if (!seen.has(c.courseName)) {
        seen.add(c.courseName);
        uniqueCourses.push(c);
      }
    }

    return { success: true, selectedCourses: uniqueCourses, courses: uniqueCourses };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}"""

text = replace_func(text, "getAvailableCourses", new_func)

with open('src/Code.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done!")
