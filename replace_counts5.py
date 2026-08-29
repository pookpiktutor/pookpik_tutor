import sys
import re

def process_file():
    with open('Code.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the start of the function
    start_str = "function getCourseEnrollmentCounts(courseNames, classInfoList) {"
    start_idx = content.find(start_str)
    
    if start_idx == -1:
        print("Could not find function start.")
        return
        
    # Find the end of the function (assuming it ends right before the next function or end of file)
    # The next thing in Code.js after this function is likely another function or EOF
    
    end_str = "\n}\n"
    search_idx = start_idx
    open_braces = 0
    in_function = False
    
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            open_braces += 1
            in_function = True
        elif content[i] == '}':
            open_braces -= 1
            if in_function and open_braces == 0:
                end_idx = i + 1
                break
    
    if open_braces != 0:
        print("Could not parse function boundaries correctly.")
        return

    replacement = """function getCourseEnrollmentCounts(courseNames, classInfoList) {
  try {
    const db = getDb();
    const sheets = db.getSheets();
    const counts = {}; // Map of courseName -> Array of unique studentNames
    
    // Initialize array of student names for each course to allow unique deduplication
    courseNames.forEach(c => { counts[c] = []; });
    
    // Build lookup: courseName -> Array of { dayOfWeek, startHour }
    const classSpecs = {}; 
    if (classInfoList && classInfoList.length > 0) {
      classInfoList.forEach(info => {
        if (!info.subject) return;
        if (!classSpecs[info.subject]) classSpecs[info.subject] = [];
        
        // Find startHour if timeStart is provided
        let parsedStartHour = null;
        if (info.timeStart) {
          if (info.timeStart instanceof Date) {
            parsedStartHour = info.timeStart.getHours();
          } else {
            const d = new Date(info.timeStart);
            if (!isNaN(d.getTime())) {
              parsedStartHour = d.getHours();
            } else {
              // Try string parsing if it's like "10:00"
              const timeMatch = info.timeStart.toString().match(/(\\d{1,2})[:\\.]\\d{2}/);
              if (timeMatch) parsedStartHour = parseInt(timeMatch[1], 10);
            }
          }
        }
        
        classSpecs[info.subject].push({
          dayOfWeek: info.dayOfWeek || "",
          timeStart: info.timeStart,
          startHour: parsedStartHour
        });
      });
    }
    
    // FAST OPTIMIZATION: Only process grade sheets that actually contain the course names
    const sheetsToProcess = new Set();
    if (courseNames.length > 0) {
      for (let i = 0; i < courseNames.length; i += 10) {
        const batch = courseNames.slice(i, i + 10);
        const regexStr = batch.map(c => c.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('|');
        try {
          const finder = db.createTextFinder(regexStr).useRegularExpression(true).matchEntireCell(false).findAll();
          finder.forEach(r => {
            const sName = r.getSheet().getName();
            if (sName.match(/^(ป\\.|ม\\.|อนุบาล)/)) {
              sheetsToProcess.add(sName);
            }
          });
        } catch (e) {
          // Fallback to all grade sheets on error
          sheets.forEach(s => {
            if (s.getName().match(/^(ป\\.|ม\\.|อนุบาล)/)) sheetsToProcess.add(s.getName());
          });
          break;
        }
      }
    }
    
    sheets.forEach(sheet => {
      const name = sheet.getName();
      
      // 1. Standard Grade sheets (like ป.1/1, ป.1/2, ป.1, etc.)
      const isGradeSheet = name.match(/^(ป\\.|ม\\.|อนุบาล)/);
      if (isGradeSheet && (courseNames.length === 0 || sheetsToProcess.has(name))) {
        const lastCol = sheet.getLastColumn();
        const lastRow = sheet.getLastRow();
        if (lastCol >= 1 && lastRow >= 4) {
          const dataRange = sheet.getDataRange().getValues();
          const headerRow1 = dataRange[0] || [];
          const headerRow3 = dataRange[2] || [];
          
          for (let colIdx = 0; colIdx < headerRow1.length; colIdx++) {
            const colHeader = headerRow1[colIdx] ? headerRow1[colIdx].toString().trim() : '';
            const dayTimeCell = headerRow3[colIdx] ? headerRow3[colIdx].toString().trim().toLowerCase() : '';
            
            courseNames.forEach(cName => {
              if (colHeader.toLowerCase().indexOf(cName.toLowerCase()) !== -1) {
                // Check if this column matches the day & time requirement
                let specMatch = true;
                const specs = classSpecs[cName];
                if (specs && specs.length > 0) {
                  specMatch = specs.some(s => {
                    const dl = s.dayOfWeek.toLowerCase().replace('วัน', ''); 
                    const dayOk = dayTimeCell.indexOf(dl) !== -1;
                    if (!dayOk) return false;
                    
                    if (s.startHour !== null && s.startHour !== undefined) {
                      const cleanCell = dayTimeCell.replace(/\\s+/g, '');
                      const timeMatch = cleanCell.match(/(\\d{1,2})[\\.:]\\d{2}/);
                      if (timeMatch) {
                        const cellStartHour = parseInt(timeMatch[1], 10);
                        return cellStartHour === s.startHour;
                      }
                    }
                    return true;
                  });
                }
                
                if (!specMatch) return; // skip to next courseName
                
                // Count students
                for (let rIdx = 5; rIdx < dataRange.length; rIdx++) {
                  const val = dataRange[rIdx][colIdx];
                  const studentName = dataRange[rIdx][1] ? dataRange[rIdx][1].toString().trim() : '';
                  if (val !== '' && val !== null && val !== undefined && studentName) {
                    if (counts[cName].indexOf(studentName) === -1) {
                      counts[cName].push(studentName);
                    }
                  }
                }
              }
            });
          }
        }
      }
    });
    
    return counts;
  } catch (e) {
    return {};
  }
}"""
    
    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open('Code.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced function.")

process_file()
