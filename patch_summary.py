import io
import re

with io.open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update getRoundSummary
# Old getRoundSummary starts at line 5260, ends at 5408 roughly. Let's find it.

old_summary_regex = r"function getRoundSummary\(round, branch\) \{[\s\S]*?return \{\s*success: true,\s*summary: stats,\s*categories: categories\s*\};\s*\} catch \(e\) \{"
new_summary_logic = """function getRoundSummary(round, branch) {
  try {
    const db = getDb();
    const stats = {};
    const categories = [];
    
    // Clear in-memory cache for this run
    for (let k in sheetValuesCache_) delete sheetValuesCache_[k];
    
    const grades = [
      { name: 'อนุบาล', privateSheet: 'เดี่ยว อนุบาล', groupPrefix: 'อนุบาล' },
      { name: 'ป.1', privateSheet: 'เดี่ยว ป.1', groupPrefix: 'ป.1' },
      { name: 'ป.2', privateSheet: 'เดี่ยว ป.2', groupPrefix: 'ป.2' },
      { name: 'ป.3', privateSheet: 'เดี่ยว ป.3', groupPrefix: 'ป.3' },
      { name: 'ป.4', privateSheet: 'เดี่ยว ป.4', groupPrefix: 'ป.4' },
      { name: 'ป.5', privateSheet: 'เดี่ยว ป.5', groupPrefix: 'ป.5' },
      { name: 'ป.6', privateSheet: 'เดี่ยว ป.6', groupPrefix: 'ป.6' },
      { name: 'ม.1', privateSheet: 'เดี่ยว ม.1', groupPrefix: 'ม.1' },
      { name: 'ม.2', privateSheet: 'เดี่ยว ม.2', groupPrefix: 'ม.2' },
      { name: 'ม.3', privateSheet: 'เดี่ยว ม.3', groupPrefix: 'ม.3' },
      { name: 'ม.4', privateSheet: 'เดี่ยว ม.4', groupPrefix: 'ม.4' },
      { name: 'ม.5', privateSheet: 'เดี่ยว ม.5', groupPrefix: 'ม.5' },
      { name: 'ม.6', privateSheet: 'เดี่ยว ม.6', groupPrefix: 'ม.6' },
      { name: 'ย่อย 2-3', privateSheet: 'ย่อย 2-3', isSubgroup: true },
      { name: 'ย่อย 4-5', privateSheet: 'ย่อย 4-5', isSubgroup: true },
      { name: 'ย่อย 6-10', privateSheet: 'ย่อย 6-10', isSubgroup: true }
    ];
    
    const branches = [
      { name: 'สาขา1', suffix: '/1' },
      { name: 'สาขา2', suffix: '/2' },
      { name: 'สาขา3', suffix: '/3' }
    ];

    grades.forEach(gradeObj => {
      branches.forEach(branchObj => {
        const key = gradeObj.name + '|' + branchObj.name;
        stats[key] = {
          grade: gradeObj.name,
          branch: branchObj.name,
          singlePaidAmount: 0,
          singleDebtAmount: 0,
          singleAndSubgroupCount: 0,
          regularGroupCount: 0,
          groupFullAmount: 0,
          groupPaidAmount: 0,
          groupDebtAmount: 0,
          overFiveCount: 0,
          notes: []
        };
        categories.push({ grade: gradeObj.name, branch: branchObj.name });
      });
    });

    const filterRound = round ? round.trim().toLowerCase() : '';

    // Function to process a sheet
    function processSheetForSummary(sheetName, isSingle) {
      const sheet = db.getSheetByName(sheetName);
      if (!sheet) return;
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow < 6 || lastCol < 20) return;
      
      const startRow = isSingle ? 12 : 6;
      if (lastRow < startRow) return;
      
      // Determine grade and default branch
      let targetGrade = '';
      let defaultBranch = '';
      if (isSingle) {
        if (sheetName.includes('ย่อย 2-3')) targetGrade = 'ย่อย 2-3';
        else if (sheetName.includes('ย่อย 4-5')) targetGrade = 'ย่อย 4-5';
        else if (sheetName.includes('ย่อย 6-10')) targetGrade = 'ย่อย 6-10';
        else targetGrade = sheetName.replace('เดี่ยว ', '').trim();
      } else {
        const parts = sheetName.split('/');
        targetGrade = parts[0];
        defaultBranch = 'สาขา' + parts[1];
      }
      
      // Read courses
      const headerRow1 = sheet.getRange(1, 20, 1, lastCol - 19).getValues()[0];
      const headerRow2 = sheet.getRange(2, 20, 1, lastCol - 19).getValues()[0];
      const sheetCourses = [];
      for (let i = 0; i < headerRow1.length; i++) {
        if (headerRow1[i]) {
          sheetCourses.push({
            name: headerRow1[i].toString(),
            colIndex: 20 + i,
            price: parseFloat(headerRow2[i]) || 0
          });
        }
      }
      
      const dataRange = sheet.getRange(startRow, 1, lastRow - (startRow - 1), lastCol).getValues();
      
      dataRange.forEach(row => {
        const name = row[1] ? row[1].toString().trim() : '';
        if (!name) return;
        
        let rowBranch = defaultBranch;
        if (isSingle) {
          rowBranch = row[8] ? row[8].toString().trim() : ''; // col I branchLearn
        }
        if (!rowBranch) rowBranch = 'สาขา1';
        if (branch && rowBranch !== branch) return; // Filter by branch if provided
        
        const key = targetGrade + '|' + rowBranch;
        if (!stats[key]) return;
        
        // Filter courses for this student
        let enrolledCourses = 0;
        let matchedGross = 0;
        let hasMatch = false;
        
        sheetCourses.forEach(c => {
          const val = row[c.colIndex - 1];
          if (val !== '' && val !== null && val !== undefined) {
             enrolledCourses++;
             if (!filterRound || c.name.toLowerCase().includes(filterRound)) {
               hasMatch = true;
               matchedGross += c.price;
             }
          }
        });
        
        // If they have no matched courses, skip them entirely
        if (!hasMatch && filterRound) return;
        
        const paid = parseFloat(row[13]) || 0;
        const debt = matchedGross - paid;
        
        if (isSingle) {
           stats[key].singleAndSubgroupCount++;
           stats[key].singlePaidAmount += paid;
           stats[key].singleDebtAmount += debt;
        } else {
           stats[key].regularGroupCount++;
           stats[key].groupFullAmount += matchedGross;
           stats[key].groupPaidAmount += paid;
           stats[key].groupDebtAmount += debt;
           if (enrolledCourses > 5) {
             stats[key].overFiveCount++;
           }
        }
      });
    }

    // Process all groups
    grades.forEach(gradeObj => {
      branches.forEach(branchObj => {
        processSheetForSummary(gradeObj.groupPrefix + branchObj.suffix, false);
      });
    });
    
    // Process all singles
    grades.forEach(gradeObj => {
      if (gradeObj.privateSheet) {
        processSheetForSummary(gradeObj.privateSheet, true);
      }
    });

    return { success: true, summary: stats, categories: categories };
  } catch (e) {"""

m = re.search(old_summary_regex, code)
if m:
    code = code[:m.start()] + new_summary_logic + code[m.end() - 11:]
    print("[OK] getRoundSummary updated")
else:
    print("[WARN] Could not find getRoundSummary using regex.")


# 2. Add getAvailableRounds
get_rounds_script = """
function getAvailableRounds() {
  try {
    const db = getDb();
    const sheets = db.getSheets();
    const rounds = new Set();
    
    // Pattern to match courses containing MIDTERM, FINAL, SUMMER, ปิดเทอม
    // e.g. MIDTERM 1/2569, FINAL 2/2569, SUMMER 2569, ปิดเทอม ตุลาคม 2569
    const regex = /((?:MIDTERM|FINAL|SUMMER|ปิดเทอม).*?(?:\d{1,2}\/\d{2,4}|\d{4}))/i;
    
    sheets.forEach(sheet => {
      const sheetName = sheet.getName();
      if (!sheetName.match(/^(อนุบาล|ป\\.|ม\\.|เดี่ยว|ย่อย)/)) return;
      
      const lastCol = sheet.getLastColumn();
      if (lastCol >= 20) {
        const header = sheet.getRange(1, 20, 1, lastCol - 19).getValues()[0];
        header.forEach(h => {
          if (h) {
            const str = h.toString();
            const match = str.match(regex);
            if (match && match[1]) {
              rounds.add(match[1].trim());
            }
          }
        });
      }
    });
    
    const arr = Array.from(rounds);
    // Sort to have the most recent or logical ones first (can just use default sort for now)
    arr.sort();
    return { success: true, rounds: arr };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
"""

if "function getAvailableRounds" not in code:
    code += get_rounds_script
    print("[OK] Added getAvailableRounds")

with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(code)
