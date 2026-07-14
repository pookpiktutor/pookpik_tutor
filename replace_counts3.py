import sys
import codecs

def process_file():
    with codecs.open('Code.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    target = '''    sheets.forEach(sheet => {
      const name = sheet.getName();
      
      // 1. Standard Grade sheets (like ป.1/1, ป.1/2, ป.1, etc.)
      const isGradeSheet = name.match(/^(ป\.|ม\.|อนุบาล)/);
      if (isGradeSheet) {'''

    replacement = '''    // FAST OPTIMIZATION: Only process grade sheets that actually contain the course names
    const sheetsToProcess = new Set();
    if (courseNames.length > 0) {
      for (let i = 0; i < courseNames.length; i += 10) {
        const batch = courseNames.slice(i, i + 10);
        const regexStr = batch.map(c => c.replace(/[.*+?^${}()|[\]\\\\\\]/g, '\\\\\\\\$&')).join('|');
        try {
          const finder = db.createTextFinder(regexStr).useRegularExpression(true).matchEntireCell(false).findAll();
          finder.forEach(r => {
            const sName = r.getSheet().getName();
            if (sName.match(/^(ป\.|ม\.|อนุบาล)/)) {
              sheetsToProcess.add(sName);
            }
          });
        } catch (e) {
          // Fallback to all grade sheets on error
          sheets.forEach(s => {
            if (s.getName().match(/^(ป\.|ม\.|อนุบาล)/)) sheetsToProcess.add(s.getName());
          });
          break;
        }
      }
    }
    
    sheets.forEach(sheet => {
      const name = sheet.getName();
      
      // 1. Standard Grade sheets (like ป.1/1, ป.1/2, ป.1, etc.)
      const isGradeSheet = name.match(/^(ป\.|ม\.|อนุบาล)/);
      if (isGradeSheet && (courseNames.length === 0 || sheetsToProcess.has(name))) {'''
    
    if target in content:
        content = content.replace(target, replacement)
        with codecs.open('Code.js', 'w', encoding='utf-8') as f:
            f.write(content)
        print('Successfully replaced.')
    else:
        print('Target string not found!')

process_file()
