const fs = require('fs');
const content = fs.readFileSync('Code.js', 'utf-8');
const target = \    sheets.forEach(sheet => {
      const name = sheet.getName();
      
      // 1. Standard Grade sheets (like ป.1/1, ป.1/2, ป.1, etc.)
      const isGradeSheet = name.match(/^(ป\\\\.|ม\\\\.|อนุบาล)/);
      if (isGradeSheet) {\;

const replacement = \    // FAST OPTIMIZATION: Only process grade sheets that actually contain the course names
    const sheetsToProcess = new Set();
    if (courseNames.length > 0) {
      for (let i = 0; i < courseNames.length; i += 10) {
        const batch = courseNames.slice(i, i + 10);
        const regexStr = batch.map(c => c.replace(/[.*+?^\\$\\{\\}()|[\\]\\\\\\\\]/g, '\\\\\\\\$&')).join('|');
        try {
          const finder = db.createTextFinder(regexStr).useRegularExpression(true).matchEntireCell(false).findAll();
          finder.forEach(r => {
            const sName = r.getSheet().getName();
            if (sName.match(/^(ป\\\\.|ม\\\\.|อนุบาล)/)) {
              sheetsToProcess.add(sName);
            }
          });
        } catch (e) {
          // Fallback to all grade sheets on error
          sheets.forEach(s => {
            if (s.getName().match(/^(ป\\\\.|ม\\\\.|อนุบาล)/)) sheetsToProcess.add(s.getName());
          });
          break;
        }
      }
    }
    
    sheets.forEach(sheet => {
      const name = sheet.getName();
      
      // 1. Standard Grade sheets (like ป.1/1, ป.1/2, ป.1, etc.)
      const isGradeSheet = name.match(/^(ป\\\\.|ม\\\\.|อนุบาล)/);
      if (isGradeSheet && (courseNames.length === 0 || sheetsToProcess.has(name))) {\;

if (content.includes(target)) {
    fs.writeFileSync('Code.js', content.replace(target, replacement));
    console.log('Successfully replaced.');
} else {
    console.log('Target not found!');
}
