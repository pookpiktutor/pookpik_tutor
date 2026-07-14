import sys
import re

def process_file():
    with open('Code.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    target_pattern = re.compile(
        r'sheets\.forEach\(sheet => \{\s*'
        r'const name = sheet\.getName\(\);\s*'
        r'// 1\. Standard Grade sheets \(like ป\.1/1, ป\.1/2, ป\.1, etc\.\)\s*'
        r'const isGradeSheet = name\.match\(/\^\(ป\\\\\.\|ม\\\\\.\|อนุบาล\)/\);\s*'
        r'if \(isGradeSheet\) \{'
    )

    # Let's just do a simpler replace. Find the exact index.
    
    lines = content.split('\n')
    start_idx = -1
    for i, line in enumerate(lines):
        if 'sheets.forEach(sheet => {' in line and 'const name = sheet.getName();' in lines[i+1]:
            if '// 1. Standard Grade sheets' in lines[i+2] and 'const isGradeSheet = name.match(/^(ป\.|ม\.|อนุบาล)/);' in lines[i+3]:
                start_idx = i
                break
                
    if start_idx != -1:
        replacement = """    // FAST OPTIMIZATION: Only process grade sheets that actually contain the course names
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
      if (isGradeSheet && (courseNames.length === 0 || sheetsToProcess.has(name))) {"""
        
        # We need to replace lines[start_idx:start_idx+5]
        new_lines = lines[:start_idx] + replacement.split('\n') + lines[start_idx+5:]
        with open('Code.js', 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print('Successfully replaced.')
    else:
        print('Target block not found!')

process_file()
