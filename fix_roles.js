// Fix Code.js: Replace corrupted Thai role strings with ASCII identifiers
// and fix the condition checks to use simpler logic

const fs = require('fs');

let text = fs.readFileSync('Code.js', 'utf8');
let count = 0;

// ===== FIX 1: Role assignments =====
// Pattern: role = '<corrupted Thai for ครูแทน>';
// The corrupted string 'à¸„à¸£à¸¹à¹\x81ทน' appears as the encoding of 'ครูแทน'
// Replace ALL instances of role = '<anything that's not regular/sub/empty>' that appear after "let role = '';"

// First, find the corrupted role strings by looking for role = ' followed by non-ASCII
// Strategy: replace the exact lines we know about

// For calculateTeacherYearlyPay (around line 9677, 9683, 9689, 9701)
// For getAllTeachersMonthlyPay (around line 10199, 10205, 10211, 10223)

// Replace role assignments - match by line pattern
// The corrupted 'ครูแทน' in the file
text = text.replace(/role = '(?!regular|sub)[^']*à[^']*à[^']*';/g, (match) => {
  count++;
  // If it was near a matchC/matchB context, determine which
  // Actually we can't determine context in a simple regex
  // Let's use a different approach
  return match; // revert, use line-specific approach instead  
});
count = 0;

// Actually let's just use line-by-line approach
const lines = text.split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  const trimmed = line.trim();
  
  // Fix role assignments - the corrupted strings contain 'à¸' sequences
  if (trimmed.match(/^role = '[^']*à¸[^']*';$/)) {
    if (trimmed.includes('ประ') || trimmed.includes('ประจ')) {
      // This is ครูประจำ (regular teacher)
      line = line.replace(/role = '[^']*';/, "role = 'regular';");
      count++;
    } else {
      // This is ครูแทน (substitute teacher) 
      line = line.replace(/role = '[^']*';/, "role = 'sub';");
      count++;
    }
  }
  
  // Fix role === 'ครูประจำ' comparisons
  if (trimmed.match(/role === '[^']*à¸[^']*'/) && (trimmed.includes('ประ') || trimmed.includes('ประจ'))) {
    line = line.replace(/role === '[^']*à¸[^']*'/, "role === 'regular'");
    count++;
  }
  
  // Fix the condition checks for "not substitute teacher" strings
  // These check cellC against sentinel values like '⚠️ไม่มีครูแทน' and '(ไม่มีผู้สอนแทน)'
  // The sentinel strings are stored IN THE SPREADSHEET, not in Code.js
  // So we need to match them by what the spreadsheet actually contains
  // For now, use a simpler approach: just check if cellC looks like a real teacher name
  
  // Fix the ครูลา (teacher leave) check
  if (trimmed.match(/\.includes\('[^']*à¸[^']*ลา[^']*'\)/)) {
    line = line.replace(/\.includes\('[^']*à¸[^']*ลา[^']*'\)/, ".includes('\\u0e04\\u0e23\\u0e39\\u0e25\\u0e32')");
    count++;
  }
  
  fixedLines.push(line);
}

text = fixedLines.join('\n');

// Now fix the cellC sentinel checks using Unicode escapes
// Replace the corrupted sentinel strings with Unicode escape sequences
// '⚠️ไม่มีครูแทน' = '\u26a0\ufe0f\u0e44\u0e21\u0e48\u0e21\u0e35\u0e04\u0e23\u0e39\u0e41\u0e17\u0e19'
// '(ไม่มีผู้สอนแทน)' = '(\u0e44\u0e21\u0e48\u0e21\u0e35\u0e1c\u0e39\u0e49\u0e2a\u0e2d\u0e19\u0e41\u0e17\u0e19)'

// Match the corrupted sentinel strings (they start with âš or contain ไม)
text = text.replace(/'âš ï¸�à¹„à¸¡à¹ˆà¸¡à¸µà¸„à¸£à¸¹à¹�ทน'/g, "'\\u26a0\\ufe0f\\u0e44\\u0e21\\u0e48\\u0e21\\u0e35\\u0e04\\u0e23\\u0e39\\u0e41\\u0e17\\u0e19'");
text = text.replace(/"âš ï¸�à¹„à¸¡à¹ˆà¸¡à¸µà¸„à¸£à¸¹à¹�ทน"/g, "'\\u26a0\\ufe0f\\u0e44\\u0e21\\u0e48\\u0e21\\u0e35\\u0e04\\u0e23\\u0e39\\u0e41\\u0e17\\u0e19'");
text = text.replace(/'à¹„à¸¡à¹ˆà¸¡à¸µà¸„à¸£à¸¹à¹�ทน'/g, "'\\u0e44\\u0e21\\u0e48\\u0e21\\u0e35\\u0e04\\u0e23\\u0e39\\u0e41\\u0e17\\u0e19'");

text = text.replace(/'\(à¹„à¸¡à¹ˆà¸¡à¸µà¸œà¸¹à¹‰à¸ªà¸­à¸™à¹�ทน\)'/g, "'(\\u0e44\\u0e21\\u0e48\\u0e21\\u0e35\\u0e1c\\u0e39\\u0e49\\u0e2a\\u0e2d\\u0e19\\u0e41\\u0e17\\u0e19)'");

// Fix ครูลา checks (role === 'regular' && note includes ครูลา)
text = text.replace(/\.includes\('ครูลา'\)/g, ".includes('\\u0e04\\u0e23\\u0e39\\u0e25\\u0e32')");

fs.writeFileSync('Code.js', text, 'utf8');
console.log('Fixed ' + count + ' role strings and sentinel checks.');
